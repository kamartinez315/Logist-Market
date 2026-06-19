import { Hono } from "hono";
import { AppEnv } from "../types";
import { BusinessRepository } from "../repositories/BusinessRepository";
import { authMiddleware } from "../middleware/auth";

export class BusinessController {
    private businessRepo = new BusinessRepository();
    public router: Hono<AppEnv> = new Hono<AppEnv>();

    constructor() {
        this.router.use("*", authMiddleware);
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.put("/", async (c) => {
            try {
                const businessId = c.get("businessId");
                const { name } = await c.req.json();

                if (!name) {
                    return c.json({ error: "El nombre es requerido" }, 400);
                }

                await this.businessRepo.update(businessId, { name });

                return c.json({ message: "Nombre del negocio actualizado" });
            } catch (error) {
                console.error("Error updating business:", error);
                return c.json({ error: "Error al actualizar el negocio" }, 500);
            }
        });
    }
}
