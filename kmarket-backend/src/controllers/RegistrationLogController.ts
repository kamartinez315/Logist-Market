import { Hono } from "hono";
import { AppEnv } from "../types";
import { AppDataSource } from "../config/database";
import { RegistrationLog } from "../entities/RegistrationLog";

export class RegistrationLogController {
    public router: Hono<AppEnv> = new Hono<AppEnv>();

    constructor() {
        this.router.get("/", async (c) => {
            const logs = await AppDataSource.getRepository(RegistrationLog).find({
                order: { registeredAt: "DESC" },
            });
            return c.json(logs);
        });
    }
}
