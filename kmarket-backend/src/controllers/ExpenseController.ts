import { Hono } from "hono";
import { AppEnv } from "../types";
import { ExpenseRepository } from "../repositories/ExpenseRepository";
import { AppDataSource } from "../config/database";
import { Expense } from "../entities/Expense";
import { authMiddleware } from "../middleware/auth";

export class ExpenseController {
    private repo = new ExpenseRepository();
    public router: Hono<AppEnv> = new Hono<AppEnv>();

    constructor() {
        this.router.use("*", authMiddleware);
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", async (c) => {
            const businessId = c.get("businessId");
            const expenses = await this.repo.findAll(businessId);
            return c.json(expenses);
        });

        // ── Timeseries endpoint (must be before /:id) ──────────
        this.router.get("/timeseries", async (c) => {
            try {
                const businessId = c.get("businessId");
                const period = c.req.query("period") || "days";
                const expenseRepo = AppDataSource.getRepository(Expense);
                const expenses = await expenseRepo.find({ where: { businessId }, order: { date: "ASC" } });

                const expDateStr = (e: Expense): string => {
                    const d: any = e.date;
                    if (typeof d === "string") return d.split("T")[0];
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                };

                const toStr = (d: Date): string =>
                    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

                const fmtLabel = (d: Date): string =>
                    `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleDateString("es-ES", { month: "short" })}`;

                const sumRange = (start: Date, end: Date): number => {
                    const sStr = toStr(start);
                    const eStr = toStr(end);
                    return expenses
                        .filter(e => expDateStr(e) >= sStr && expDateStr(e) <= eStr)
                        .reduce((a, e) => a + Number(e.amount), 0);
                };

                const points: { date: string; value: number }[] = [];
                const now = new Date();

                if (period === "days") {
                    for (let i = 29; i >= 0; i--) {
                        const d = new Date(now);
                        d.setDate(now.getDate() - i);
                        const dEnd = new Date(d);
                        dEnd.setDate(dEnd.getDate() + (i === 0 ? 2 : 0));
                        const val = sumRange(d, dEnd);
                        points.push({ date: fmtLabel(d), value: val });
                    }
                } else if (period === "weeks") {
                    for (let i = 11; i >= 0; i--) {
                        const wEnd = new Date(now);
                        wEnd.setDate(now.getDate() - i * 7);
                        if (i === 0) wEnd.setDate(wEnd.getDate() + 2);
                        const wStart = new Date(wEnd);
                        wStart.setDate(wEnd.getDate() - (i === 0 ? 8 : 6));
                        const val = sumRange(wStart, wEnd);
                        points.push({ date: fmtLabel(wStart), value: val });
                    }
                } else if (period === "months") {
                    for (let i = 11; i >= 0; i--) {
                        const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const mStart = new Date(mDate.getFullYear(), mDate.getMonth(), 1);
                        const mEnd = new Date(mDate.getFullYear(), mDate.getMonth() + 1, 0);
                        if (i === 0) mEnd.setDate(mEnd.getDate() + 2);
                        const val = sumRange(mStart, mEnd);
                        const label = mDate.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
                        points.push({ date: label, value: val });
                    }
                }

                return c.json(points);
            } catch (error) {
                console.error("Error fetching expense timeseries:", error);
                return c.json({ error: "Failed to fetch expense timeseries" }, 500);
            }
        });

        this.router.get("/:id", async (c) => {
            const id = parseInt(c.req.param("id"));
            const businessId = c.get("businessId");
            const expense = await this.repo.findById(id, businessId);
            if (!expense) return c.json({ error: "Expense not found" }, 404);
            return c.json(expense);
        });

        this.router.post("/", async (c) => {
            const businessId = c.get("businessId");
            const body = await c.req.json();
            const expense = await this.repo.create({ ...body, businessId });
            return c.json(expense, 201);
        });

        this.router.put("/:id", async (c) => {
            const id = parseInt(c.req.param("id"));
            const businessId = c.get("businessId");
            const body = await c.req.json();
            const expense = await this.repo.update(id, body, businessId);
            if (!expense) return c.json({ error: "Expense not found" }, 404);
            return c.json(expense);
        });

        this.router.delete("/:id", async (c) => {
            const id = parseInt(c.req.param("id"));
            const businessId = c.get("businessId");
            await this.repo.delete(id, businessId);
            return c.json({ success: true });
        });
    }
}

