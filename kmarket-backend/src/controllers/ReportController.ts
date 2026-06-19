import { Hono } from "hono";
import { AppEnv } from "../types";
import { AppDataSource } from "../config/database";
import { Sale } from "../entities/Sale";
import { SaleDetail } from "../entities/SaleDetail";
import { Product } from "../entities/Product";
import { Client } from "../entities/Client";
import { authMiddleware } from "../middleware/auth";

export class ReportController {
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
        this.router.get("/dashboard", async (c) => {
            try {
                const businessId = c.get("businessId");

                const sales = await this.saleRepo.find({ where: { businessId } });
                const totalSalesCount = sales.length;
                const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.totalAmount), 0);

                const products = await this.productRepo.find({ where: { businessId } });
                const saleDetails = await this.saleDetailRepo.find({ where: { businessId } });

                let totalProfit = 0;
                for (const detail of saleDetails) {
                    const product = products.find(p => p.id === detail.productId);
                    const unitCost = Number(detail.unitCost) || Number(product?.cost || 0);
                    totalProfit += Number(detail.subtotal) - (Number(detail.quantity) * unitCost);
                }

                const totalClients = await this.clientRepo.count({ where: { businessId } });

                const lowStockProducts = await this.productRepo
                    .createQueryBuilder("product")
                    .where("product.businessId = :businessId", { businessId })
                    .andWhere("product.stock <= :stock", { stock: 5 })
                    .orderBy("product.stock", "ASC")
                    .getMany();

                const recentSales = await this.saleRepo.find({
                    where: { businessId },
                    order: { saleDate: "DESC", createdAt: "DESC" },
                    take: 5
                });

                const clients = await this.clientRepo.find({ where: { businessId } });
                const recentSalesWithClient = recentSales.map(sale => {
                    const client = clients.find(cl => cl.id === sale.clientId);
                    return {
                        ...sale,
                        clientName: client ? client.name : "Consumidor Final"
                    };
                });

                const productSalesCount: Record<number, { productId: number; name: string; quantitySold: number; revenue: number }> = {};

                for (const detail of saleDetails) {
                    if (!productSalesCount[detail.productId]) {
                        const p = products.find(prod => prod.id === detail.productId);
                        productSalesCount[detail.productId] = {
                            productId: detail.productId,
                            name: p ? p.name : "Producto Eliminado",
                            quantitySold: 0,
                            revenue: 0
                        };
                    }
                    productSalesCount[detail.productId].quantitySold += detail.quantity;
                    productSalesCount[detail.productId].revenue += Number(detail.subtotal);
                }

                const topProducts = Object.values(productSalesCount)
                    .sort((a, b) => b.quantitySold - a.quantitySold)
                    .slice(0, 5);

                const dayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
                const weeklySales = dayLabels.map(day => ({ day, sales: 0 }));

                const now = new Date();
                const dayOfWeek = now.getDay();
                const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                const monday = new Date(now);
                monday.setDate(now.getDate() + diffToMonday);
                monday.setHours(0, 0, 0, 0);

                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23, 59, 59, 999);

                for (const sale of sales) {
                    const d = sale.saleDate ? new Date(sale.saleDate) : new Date(sale.createdAt);
                    if (d >= monday && d <= sunday) {
                        const jsDay = d.getDay();
                        const idx = jsDay === 0 ? 6 : jsDay - 1;
                        weeklySales[idx].sales += 1;
                    }
                }

                return c.json({
                    totalRevenue,
                    totalProfit,
                    totalSalesCount,
                    totalClients,
                    lowStockProducts,
                    recentSales: recentSalesWithClient,
                    topProducts,
                    weeklySales
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
                return c.json({ error: "Failed to fetch dashboard statistics" }, 500);
            }
        });

        this.router.get("/timeseries", async (c) => {
            try {
                const businessId = c.get("businessId");
                const metric = c.req.query("metric") || "revenue";
                const period = c.req.query("period") || "days";

                const sales = await this.saleRepo.find({ where: { businessId }, order: { saleDate: "ASC", createdAt: "ASC" } });
                const saleDetails = await this.saleDetailRepo.find({ where: { businessId } });
                const products = await this.productRepo.find({ where: { businessId } });

                const getSaleDate = (s: Sale): Date => s.saleDate ? new Date(s.saleDate) : new Date(s.createdAt);

                const getValue = (rangeSales: typeof sales): number => {
                    if (metric === "revenue") {
                        return rangeSales.reduce((a, s) => a + Number(s.totalAmount), 0);
                    } else if (metric === "sales") {
                        return rangeSales.length;
                    } else if (metric === "profit" || metric === "benefit") {
                        let val = 0;
                        for (const sale of rangeSales) {
                            const details = saleDetails.filter(d => d.saleId === sale.id);
                            for (const detail of details) {
                                const product = products.find(p => p.id === detail.productId);
                                const unitCost = Number(detail.unitCost) || Number((product as any)?.cost || 0);
                                val += Number(detail.subtotal) - (Number(detail.quantity) * unitCost);
                            }
                        }
                        return val;
                    } else if (metric === "stock") {
                        return products.filter(p => p.stock <= 5).length;
                    }
                    return 0;
                };

                const fmtDate = (d: Date) =>
                    `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleDateString("es-ES", { month: "short" })}`;

                const points: { date: string; value: number }[] = [];
                const now = new Date();

                if (period === "days") {
                    for (let i = 29; i >= 0; i--) {
                        const d = new Date(now);
                        d.setDate(now.getDate() - i);
                        d.setHours(0, 0, 0, 0);
                        const dEnd = new Date(d);
                        dEnd.setHours(23, 59, 59, 999);
                        if (i === 0) {
                            dEnd.setDate(dEnd.getDate() + 2);
                        }
                        const rangeSales = sales.filter(s => {
                            const sd = getSaleDate(s);
                            return sd >= d && sd <= dEnd;
                        });
                        let val = metric === "stock" ? getValue(rangeSales) : getValue(rangeSales);
                        points.push({ date: fmtDate(d), value: val });
                    }
                } else if (period === "weeks") {
                    for (let i = 11; i >= 0; i--) {
                        const wEnd = new Date(now);
                        wEnd.setDate(now.getDate() - i * 7);
                        wEnd.setHours(23, 59, 59, 999);
                        if (i === 0) {
                            wEnd.setDate(wEnd.getDate() + 2);
                        }
                        const wStart = new Date(wEnd);
                        wStart.setDate(wEnd.getDate() - (i === 0 ? 8 : 6));
                        wStart.setHours(0, 0, 0, 0);
                        const rangeSales = sales.filter(s => {
                            const sd = getSaleDate(s);
                            return sd >= wStart && sd <= wEnd;
                        });
                        let val = getValue(rangeSales);
                        points.push({ date: fmtDate(wStart), value: val });
                    }
                } else if (period === "months") {
                    for (let i = 11; i >= 0; i--) {
                        const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const mStart = new Date(mDate.getFullYear(), mDate.getMonth(), 1, 0, 0, 0, 0);
                        const mEnd = new Date(mDate.getFullYear(), mDate.getMonth() + 1, 0, 23, 59, 59, 999);
                        if (i === 0) {
                            mEnd.setDate(mEnd.getDate() + 2);
                        }
                        const rangeSales = sales.filter(s => {
                            const sd = getSaleDate(s);
                            return sd >= mStart && sd <= mEnd;
                        });
                        let val = getValue(rangeSales);
                        const label = mDate.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
                        points.push({ date: label, value: val });
                    }
                }

                return c.json(points);
            } catch (error) {
                console.error("Error fetching timeseries:", error);
                return c.json({ error: "Failed to fetch timeseries" }, 500);
            }
        });

        this.router.get("/history", async (c) => {
            try {
                const businessId = c.get("businessId");
                const sales = await this.saleRepo.find({ where: { businessId }, order: { saleDate: "DESC", createdAt: "DESC" } });
                const details = await this.saleDetailRepo.find({ where: { businessId } });
                const products = await this.productRepo.find({ where: { businessId } });
                const clients = await this.clientRepo.find({ where: { businessId } });

                const history: any[] = [];

                for (const detail of details) {
                    const sale = sales.find(s => s.id === detail.saleId);
                    if (!sale) continue;

                    const product = products.find(p => p.id === detail.productId);
                    const client = clients.find(cl => cl.id === sale.clientId);

                    history.push({
                        id: detail.id,
                        saleId: sale.id,
                        date: sale.saleDate || sale.createdAt,
                        clientName: client ? client.name : "Consumidor Final",
                        productName: product ? product.name : "Producto Eliminado",
                        quantity: detail.quantity,
                        unitPrice: Number(detail.unitPrice),
                        subtotal: Number(detail.subtotal),
                        paymentMethod: sale.paymentMethod
                    });
                }

                history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                return c.json(history);
            } catch (error) {
                console.error("Error fetching purchase history:", error);
                return c.json({ error: "Failed to fetch purchase history" }, 500);
            }
        });
    }
}

