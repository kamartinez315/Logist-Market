import "reflect-metadata";
import { serve as honoServe, serveStatic } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { AppDataSource } from "./config/database";
import { ProductController } from "./controllers/ProductController";
import { ClientController } from "./controllers/ClientController";
import { SaleController } from "./controllers/SaleController";
import { InventoryController } from "./controllers/InventoryController";
import { ReportController } from "./controllers/ReportController";
import { SettingController } from "./controllers/SettingController";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

// Enable CORS for frontend
app.use("/*", cors());

// Serve static files from the compiled frontend build
app.use("/*", serveStatic({ root: "./public" }));

// Fallback: serve index.html for the root and any unmatched routes (SPA support)
app.get("/", serveStatic({ path: "./public/index.html" }));

// Initialize DB and routes
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        const productController = new ProductController();
        const clientController = new ClientController();
        const saleController = new SaleController();
        const inventoryController = new InventoryController();
        const reportController = new ReportController();
        const settingController = new SettingController();

        app.route("/api/products", productController.router);
        app.route("/api/clients", clientController.router);
        app.route("/api/sales", saleController.router);
        app.route("/api/inventory", inventoryController.router);
        app.route("/api/reports", reportController.router);
        app.route("/api/settings", settingController.router);

        const port = parseInt(process.env.PORT || "3000");
        console.log(`Server is running on port ${port}`);

        honoServe({
            fetch: app.fetch,
            port
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });
