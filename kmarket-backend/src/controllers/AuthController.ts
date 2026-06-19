import { Hono } from "hono";
import { AppEnv } from "../types";
import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/UserRepository";
import { BusinessRepository } from "../repositories/BusinessRepository";
import { generateToken, authMiddleware } from "../middleware/auth";

export class AuthController {
    private userRepo = new UserRepository();
    private businessRepo = new BusinessRepository();
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
                    role: "admin",
                    avatar: name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2),
                    businessId: business.id,
                });

                const token = generateToken({ userId: user.id, businessId: business.id });

                return c.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar,
                        businessId: user.businessId,
                        businessName: business.name,
                    },
                }, 201);
            } catch (error) {
                console.error("Error registering user:", error);
                return c.json({ error: "Error al registrar" }, 500);
            }
        });

        this.router.post("/login", async (c) => {
            try {
                const { email, password } = await c.req.json();

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

                const business = await this.businessRepo.findById(user.businessId);

                const token = generateToken({ userId: user.id, businessId: user.businessId });

                return c.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar,
                        businessId: user.businessId,
                        businessName: business?.name || "",
                    },
                });
            } catch (error) {
                console.error("Error logging in:", error);
                return c.json({ error: "Error al iniciar sesión" }, 500);
            }
        });

        this.router.get("/me", authMiddleware, async (c) => {
            try {
                const userId = c.get("userId");
                const user = await this.userRepo.findById(userId);
                if (!user) {
                    return c.json({ error: "Usuario no encontrado" }, 404);
                }

                const business = await this.businessRepo.findById(user.businessId);

                return c.json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    businessId: user.businessId,
                    businessName: business?.name || "",
                });
            } catch (error) {
                console.error("Error fetching user:", error);
                return c.json({ error: "Error al obtener usuario" }, 500);
            }
        });
    }
}

