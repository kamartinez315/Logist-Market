import { Hono } from "hono";
import { AppEnv } from "../types";
import { ProductRepository } from "../repositories/ProductRepository";
import { authMiddleware } from "../middleware/auth";

export class ProductController {
    private repo = new ProductRepository();
    public router: Hono<AppEnv> = new Hono<AppEnv>();

    constructor() {
        this.router.use("*", authMiddleware);
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", async (c) => {
            try {
                const businessId = c.get("businessId");
                const products = await this.repo.findAll(businessId);
                return c.json(products);
            } catch (error) {
                console.error("Error fetching products:", error);
                return c.json({ error: "Failed to fetch products" }, 500);
            }
        });

        this.router.get("/:id", async (c) => {
            try {
                const id = parseInt(c.req.param("id"));
                const businessId = c.get("businessId");
                const product = await this.repo.findById(id, businessId);
                if (!product) return c.json({ error: "Product not found" }, 404);
                return c.json(product);
            } catch (error) {
                console.error("Error fetching product:", error);
                return c.json({ error: "Failed to fetch product" }, 500);
            }
        });

        this.router.post("/", async (c) => {
            try {
                const businessId = c.get("businessId");
                const body = await c.req.json();
                const product = await this.repo.create({ ...body, businessId });
                return c.json(product, 201);
            } catch (error) {
                console.error("Error creating product:", error);
                return c.json({ error: "Failed to create product" }, 500);
            }
        });

        this.router.put("/:id", async (c) => {
            try {
                const id = parseInt(c.req.param("id"));
                const businessId = c.get("businessId");
                const body = await c.req.json();
                const product = await this.repo.update(id, body, businessId);
                if (!product) return c.json({ error: "Product not found" }, 404);
                return c.json(product);
            } catch (error) {
                console.error("Error updating product:", error);
                return c.json({ error: "Failed to update product" }, 500);
            }
        });

        this.router.delete("/:id", async (c) => {
            try {
                const id = parseInt(c.req.param("id"));
                const businessId = c.get("businessId");
                await this.repo.delete(id, businessId);
                return c.json({ success: true });
            } catch (error) {
                console.error("Error deleting product:", error);
                return c.json({ error: "Failed to delete product" }, 500);
            }
        });
    }
}

