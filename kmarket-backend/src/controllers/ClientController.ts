import { Hono } from "hono";
import { AppEnv } from "../types";
import { ClientRepository } from "../repositories/ClientRepository";
import { authMiddleware } from "../middleware/auth";

export class ClientController {
    private repo = new ClientRepository();
    public router: Hono<AppEnv> = new Hono<AppEnv>();

    constructor() {
        this.router.use("*", authMiddleware);
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", async (c) => {
            try {
                const businessId = c.get("businessId");
                const clients = await this.repo.findAll(businessId);
                return c.json(clients);
            } catch (error) {
                console.error("Error fetching clients:", error);
                return c.json({ error: "Failed to fetch clients" }, 500);
            }
        });

        this.router.get("/:id", async (c) => {
            try {
                const id = parseInt(c.req.param("id"));
                const businessId = c.get("businessId");
                const client = await this.repo.findById(id, businessId);
                if (!client) return c.json({ error: "Client not found" }, 404);
                return c.json(client);
            } catch (error) {
                console.error("Error fetching client:", error);
                return c.json({ error: "Failed to fetch client" }, 500);
            }
        });

        this.router.post("/", async (c) => {
            try {
                const businessId = c.get("businessId");
                const body = await c.req.json();
                const client = await this.repo.create({ ...body, businessId });
                return c.json(client, 201);
            } catch (error) {
                console.error("Error creating client:", error);
                return c.json({ error: "Failed to create client" }, 500);
            }
        });

        this.router.put("/:id", async (c) => {
            try {
                const id = parseInt(c.req.param("id"));
                const businessId = c.get("businessId");
                const body = await c.req.json();
                const client = await this.repo.update(id, body, businessId);
                if (!client) return c.json({ error: "Client not found" }, 404);
                return c.json(client);
            } catch (error) {
                console.error("Error updating client:", error);
                return c.json({ error: "Failed to update client" }, 500);
            }
        });

        this.router.delete("/:id", async (c) => {
            try {
                const id = parseInt(c.req.param("id"));
                const businessId = c.get("businessId");
                await this.repo.delete(id, businessId);
                return c.json({ success: true });
            } catch (error) {
                console.error("Error deleting client:", error);
                return c.json({ error: "Failed to delete client" }, 500);
            }
        });
    }
}

