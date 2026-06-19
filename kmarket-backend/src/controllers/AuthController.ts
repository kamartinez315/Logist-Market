import { Hono } from "hono";
import { AppEnv } from "../types";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { UserRepository } from "../repositories/UserRepository";
import { BusinessRepository } from "../repositories/BusinessRepository";
import { UserBusinessRepository } from "../repositories/UserBusinessRepository";
import { generateToken, authMiddleware } from "../middleware/auth";
import { AppDataSource } from "../config/database";
import { RegistrationLog } from "../entities/RegistrationLog";

export class AuthController {
    private userRepo = new UserRepository();
    private businessRepo = new BusinessRepository();
    private userBusinessRepo = new UserBusinessRepository();
    public router: Hono<AppEnv> = new Hono<AppEnv>();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/register", async (c) => {
            try {
                const { name, email, password, businessName } = await c.req.json();

                if (!name || !email || !password || !businessName) {
                    return c.json({ error: "Todos los campos son requeridos" }, 400);
                }

                const existing = await this.userRepo.findByEmail(email);
                if (existing) {
                    return c.json({ error: "El correo ya está registrado" }, 409);
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                const business = await this.businessRepo.create({ name: businessName });
                const user = await this.userRepo.create({
                    name,
                    email,
                    password: hashedPassword,
                    avatar: name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2),
                });

                await this.userBusinessRepo.create({
                    userId: user.id,
                    businessId: business.id,
                    role: "owner",
                });

                await AppDataSource.getRepository(RegistrationLog).save({
                    userName: name,
                    userEmail: email,
                    businessName: businessName,
                });

                const token = generateToken({ userId: user.id, businessId: business.id });

                return c.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        avatar: user.avatar,
                        businesses: [
                            { id: business.id, name: business.name, role: "owner" },
                        ],
                    },
                }, 201);
            } catch (error) {
                console.error("Error registering user:", error);
                return c.json({ error: "Error al registrar" }, 500);
            }
        });

        this.router.post("/login", async (c) => {
            try {
                const { email, password, businessId } = await c.req.json();

                if (!email || !password) {
                    return c.json({ error: "Correo y contraseña requeridos" }, 400);
                }

                const user = await this.userRepo.findByEmail(email);
                if (!user) {
                    return c.json({ error: "Credenciales inválidas" }, 401);
                }

                const valid = await bcrypt.compare(password, user.password);
                if (!valid) {
                    return c.json({ error: "Credenciales inválidas" }, 401);
                }

                const userBusinesses = await this.userBusinessRepo.findByUser(user.id);
                if (userBusinesses.length === 0) {
                    return c.json({ error: "No tienes negocios asociados" }, 401);
                }

                let activeBusinessId: number;
                if (businessId) {
                    const hasAccess = userBusinesses.some((ub) => ub.businessId === businessId);
                    if (!hasAccess) {
                        return c.json({ error: "No tienes acceso a ese negocio" }, 403);
                    }
                    activeBusinessId = businessId;
                } else {
                    activeBusinessId = userBusinesses[0].businessId;
                }

                const business = await this.businessRepo.findById(activeBusinessId);
                const token = generateToken({ userId: user.id, businessId: activeBusinessId });

                const businesses = await Promise.all(
                    userBusinesses.map(async (ub) => {
                        const b = await this.businessRepo.findById(ub.businessId);
                        return { id: ub.businessId, name: b?.name || "", role: ub.role };
                    })
                );

                return c.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        avatar: user.avatar,
                        businesses,
                    },
                });
            } catch (error) {
                console.error("Error logging in:", error);
                return c.json({ error: "Error al iniciar sesión" }, 500);
            }
        });

        this.router.post("/avatar", authMiddleware, async (c) => {
            try {
                const userId = c.get("userId");
                const body = await c.req.parseBody();
                const file = body["avatar"] as File;

                if (!file) {
                    return c.json({ error: "No se envió ninguna imagen" }, 400);
                }

                const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
                if (!allowedTypes.includes(file.type)) {
                    return c.json({ error: "Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)" }, 400);
                }

                const maxSize = 5 * 1024 * 1024;
                if (file.size > maxSize) {
                    return c.json({ error: "La imagen no puede superar los 5MB" }, 400);
                }

                const ext = file.name.split(".").pop();
                const filename = `avatar-${userId}-${Date.now()}.${ext}`;
                const uploadDir = path.join(process.cwd(), "public", "uploads");

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const buffer = Buffer.from(await file.arrayBuffer());
                fs.writeFileSync(path.join(uploadDir, filename), buffer);

                const avatarUrl = `/uploads/${filename}`;
                await this.userRepo.update(userId, { avatar: avatarUrl });

                return c.json({ avatar: avatarUrl });
            } catch (error) {
                console.error("Error uploading avatar:", error);
                return c.json({ error: "Error al subir la imagen" }, 500);
            }
        });

        this.router.get("/me", authMiddleware, async (c) => {
            try {
                const userId = c.get("userId");
                const user = await this.userRepo.findById(userId);
                if (!user) {
                    return c.json({ error: "Usuario no encontrado" }, 404);
                }

                const userBusinesses = await this.userBusinessRepo.findByUser(user.id);
                const businesses = await Promise.all(
                    userBusinesses.map(async (ub) => {
                        const b = await this.businessRepo.findById(ub.businessId);
                        return { id: ub.businessId, name: b?.name || "", role: ub.role };
                    })
                );

                return c.json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    businesses,
                });
            } catch (error) {
                console.error("Error fetching user:", error);
                return c.json({ error: "Error al obtener usuario" }, 500);
            }
        });
    }
}
