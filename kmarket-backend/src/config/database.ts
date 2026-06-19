import "reflect-metadata";
import { DataSource } from "typeorm";
import { Product } from "../entities/Product";
import { Client } from "../entities/Client";
import { Sale } from "../entities/Sale";
import { SaleDetail } from "../entities/SaleDetail";
import { InventoryMovement } from "../entities/InventoryMovement";
import { Setting } from "../entities/Setting";
import { Expense } from "../entities/Expense";
import { Business } from "../entities/Business";
import { User } from "../entities/User";
import dotenv from "dotenv";

dotenv.config();

const dbSync = process.env.DB_SYNC === "true";

export const AppDataSource = new DataSource(
    process.env.DATABASE_URL
        ? {
              type: "postgres",
              url: process.env.DATABASE_URL,
              synchronize: dbSync,
              logging: false,
              entities: [Product, Client, Sale, SaleDetail, InventoryMovement, Setting, Expense, Business, User],
              subscribers: [],
              migrations: [],
          }
        : {
              type: "postgres",
              host: process.env.DB_HOST || "localhost",
              port: parseInt(process.env.DB_PORT || "5432"),
              username: process.env.DB_USERNAME || "postgres",
              password: process.env.DB_PASSWORD || "123456",
              database: process.env.DB_NAME || "Kmarket",
              synchronize: dbSync,
              logging: false,
              entities: [Product, Client, Sale, SaleDetail, InventoryMovement, Setting, Expense, Business, User],
              subscribers: [],
              migrations: [],
          }
);
