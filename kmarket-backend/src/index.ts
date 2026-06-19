import "reflect-metadata";
import { serve as honoServe } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { AppDataSource } from "./config/database";
import { AuthController } from "./controllers/AuthController";
import { ProductController } from "./controllers/ProductController";
import { ClientController } from "./controllers/ClientController";
import { SaleController } from "./controllers/SaleController";
import { InventoryController } from "./controllers/InventoryController";
import { ReportController } from "./controllers/ReportController";
import { SettingController } from "./controllers/SettingController";
import { ExpenseController } from "./controllers/ExpenseController";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

// Enable CORS for all routes
app.use("/*", cors());

app.get("/api", (c) => {
    return c.json({
        name: "KMarket API",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            products: "/api/products",
            clients: "/api/clients",
            sales: "/api/sales",
            inventory: "/api/inventory",
            reports: "/api/reports",
            settings: "/api/settings",
            expenses: "/api/expenses",
        },
    });
});

// Initialize DB and register API routes
AppDataSource.initialize()
    .then(async () => {
        console.log("Data Source has been initialized!");

        await AppDataSource.synchronize();
        console.log("Database tables synchronized!");

        const authController = new AuthController();
        const productController = new ProductController();
        const clientController = new ClientController();
        const saleController = new SaleController();
        const inventoryController = new InventoryController();
        const reportController = new ReportController();
        const settingController = new SettingController();
        const expenseController = new ExpenseController();

        app.route("/api/auth", authController.router);
        app.route("/api/products", productController.router);
        app.route("/api/clients", clientController.router);
        app.route("/api/sales", saleController.router);
        app.route("/api/inventory", inventoryController.router);
        app.route("/api/reports", reportController.router);
        app.route("/api/settings", settingController.router);
        app.route("/api/expenses", expenseController.router);

        // Serve static assets from public/ directory
        app.use("/*", serveStatic({ root: "./public" }));

        // Single Page Application (SPA) routing fallback
        app.get("*", async (c, next) => {
            if (c.req.path.startsWith("/api")) {
                return next();
            }
            try {
                const htmlPath = path.join(process.cwd(), "public", "index.html");
                if (fs.existsSync(htmlPath)) {
                    const html = await fs.promises.readFile(htmlPath, "utf-8");
                    return c.html(html);
                }
                return next();
            } catch (err) {
                console.error("Error reading index.html fallback:", err);
                return next();
            }
        });

        const port = parseInt(process.env.PORT || "3000");
        console.log(`Server is running on port ${port}`);

        honoServe({
            fetch: app.fetch,
            port
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
        process.exit(1);
    });
