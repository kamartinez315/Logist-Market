import { Hono } from "hono";
import { AppEnv } from "../types";
import { AppDataSource } from "../config/database";
import { Sale } from "../entities/Sale";
import { SaleDetail } from "../entities/SaleDetail";
import { Product } from "../entities/Product";
import { Client } from "../entities/Client";
import { authMiddleware } from "../middleware/auth";

export class SaleController {
    public router: Hono<AppEnv> = new Hono<AppEnv>();
    private saleRepo = AppDataSource.getRepository(Sale);
    private saleDetailRepo = AppDataSource.getRepository(SaleDetail);
    private productRepo = AppDataSource.getRepository(Product);
    private clientRepo = AppDataSource.getRepository(Client);

    constructor() {
        this.router.use("*", authMiddleware);
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", async (c) => {
            try {
                const businessId = c.get("businessId");
                const sales = await this.saleRepo.find({ where: { businessId }, order: { saleDate: "DESC", createdAt: "DESC" } });
                const clients = await this.clientRepo.find({ where: { businessId } });

                const salesWithClient = sales.map(sale => {
                    const client = clients.find(cl => cl.id === sale.clientId);
                    return {
                        ...sale,
                        clientName: client ? client.name : "Consumidor Final"
                    };
                });

                return c.json(salesWithClient);
            } catch (error) {
                console.error("Error fetching sales:", error);
                return c.json({ error: "Failed to fetch sales" }, 500);
            }
        });

        this.router.get("/:id", async (c) => {
            try {
                const id = parseInt(c.req.param("id"));
                const businessId = c.get("businessId");
                const sale = await this.saleRepo.findOneBy({ id, businessId });
                if (!sale) return c.json({ error: "Sale not found" }, 404);

                const details = await this.saleDetailRepo.findBy({ saleId: id, businessId });

                return c.json({ sale, details });
            } catch (error) {
                return c.json({ error: "Failed to fetch sale details" }, 500);
            }
        });

        this.router.post("/", async (c) => {
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                const businessId = c.get("businessId");
                const body = await c.req.json();
                const { clientId, totalAmount, paymentMethod, items, saleDate } = body;

                const newSale = new Sale();
                newSale.businessId = businessId;
                newSale.clientId = clientId || null;
                newSale.totalAmount = totalAmount;
                newSale.paymentMethod = paymentMethod || 'cash';
                newSale.status = 'completed';
                if (saleDate) {
                    const [y, m, d] = saleDate.split('-').map(Number);
                    newSale.saleDate = new Date(y, m - 1, d);
                }

                const savedSale = await queryRunner.manager.save(Sale, newSale);

                for (const item of items) {
                    const product = await queryRunner.manager.findOneBy(Product, { id: item.productId, businessId });

                    const detail = new SaleDetail();
                    detail.saleId = savedSale.id;
                    detail.businessId = businessId;
                    detail.productId = item.productId;
                    detail.quantity = item.quantity;
                    detail.unitPrice = item.unitPrice;
                    detail.subtotal = item.subtotal;
                    detail.unitCost = product ? Number(product.cost || 0) : 0;

                    await queryRunner.manager.save(SaleDetail, detail);

                    if (product) {
                        if (product.stock < item.quantity) {
                            throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`);
                        }
                        product.stock -= item.quantity;
                        await queryRunner.manager.save(Product, product);
                    }
                }

                if (clientId) {
                    const client = await queryRunner.manager.findOneBy(Client, { id: clientId, businessId });
                    if (client) {
                        client.totalPurchases += 1;
                        client.totalSpent = Number(client.totalSpent) + Number(totalAmount);
                        client.lastVisit = new Date().toISOString();
                        await queryRunner.manager.save(Client, client);
                    }
                }

                await queryRunner.commitTransaction();
                return c.json(savedSale, 201);
            } catch (error) {
                await queryRunner.rollbackTransaction();
                console.error("Error creating sale:", error);
                return c.json({ error: "Failed to create sale" }, 500);
            } finally {
                await queryRunner.release();
            }
        });
    }
}

