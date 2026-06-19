import { Hono } from "hono";
import { AppEnv } from "../types";
import { AppDataSource } from "../config/database";
import { InventoryMovement } from "../entities/InventoryMovement";
import { Product } from "../entities/Product";
import { authMiddleware } from "../middleware/auth";

export class InventoryController {
    public router: Hono<AppEnv> = new Hono<AppEnv>();
    private inventoryRepo = AppDataSource.getRepository(InventoryMovement);
    private productRepo = AppDataSource.getRepository(Product);

    constructor() {
        this.router.use("*", authMiddleware);
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/movements", async (c) => {
            try {
                const businessId = c.get("businessId");
                const movements = await this.inventoryRepo.find({ where: { businessId }, order: { createdAt: "DESC" } });
                const products = await this.productRepo.find({ where: { businessId } });

                const mapped = movements.map(mov => {
                    const prod = products.find(p => p.id === mov.productId);
                    return {
                        ...mov,
                        productName: prod ? prod.name : "Producto Eliminado",
                        productCost: prod ? Number(prod.cost) : 0,
                        productPrice: prod ? Number(prod.price) : 0
                    };
                });

                return c.json(mapped);
            } catch (error) {
                console.error("Error fetching inventory movements:", error);
                return c.json({ error: "Failed to fetch inventory movements" }, 500);
            }
        });

        this.router.get("/stats", async (c) => {
            try {
                const businessId = c.get("businessId");
                const products = await this.productRepo.find({ where: { businessId } });
                const valorInventarioTotal = products.reduce((sum, p) => sum + (p.stock * (parseFloat(p.cost as any) || 0)), 0);
                const valorVentaTotal = products.reduce((sum, p) => sum + (p.stock * (parseFloat(p.price as any) || 0)), 0);
                const beneficioPotencial = valorVentaTotal - valorInventarioTotal;
                const margen = valorVentaTotal > 0 ? (beneficioPotencial / valorVentaTotal) * 100 : 0;

                return c.json({
                    valorInventarioTotal,
                    valorVentaTotal,
                    beneficioPotencial,
                    margen
                });
            } catch (error) {
                console.error("Error calculating inventory stats:", error);
                return c.json({ error: "Failed to calculate inventory stats" }, 500);
            }
        });

        this.router.post("/movements", async (c) => {
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                const businessId = c.get("businessId");
                const body = await c.req.json();
                const { productId, type, quantity, reason } = body;

                if (!productId || !type || !quantity) {
                    return c.json({ error: "Missing required fields" }, 400);
                }

                if (quantity <= 0) {
                    return c.json({ error: "Quantity must be positive" }, 400);
                }

                const movement = new InventoryMovement();
                movement.businessId = businessId;
                movement.productId = productId;
                movement.type = type;
                movement.quantity = quantity;
                movement.reason = reason || '';

                await queryRunner.manager.save(InventoryMovement, movement);

                const product = await queryRunner.manager.findOneBy(Product, { id: productId, businessId });
                if (!product) {
                    throw new Error("Product not found");
                }

                if (type === "IN") {
                    product.stock += quantity;
                } else if (type === "OUT") {
                    if (product.stock < quantity) {
                        throw new Error("Insufficient stock for OUT movement");
                    }
                    product.stock -= quantity;
                }

                await queryRunner.manager.save(Product, product);

                await queryRunner.commitTransaction();
                return c.json(movement, 201);
            } catch (error: any) {
                await queryRunner.rollbackTransaction();
                console.error("Error creating inventory movement:", error);
                return c.json({ error: error.message || "Failed to create inventory movement" }, 500);
            } finally {
                await queryRunner.release();
            }
        });
    }
}

