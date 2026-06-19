import { Hono } from "hono";
import { AppEnv } from "../types";
import { AppDataSource } from "../config/database";
import { Setting } from "../entities/Setting";
import { authMiddleware } from "../middleware/auth";

export class SettingController {
    public router: Hono<AppEnv> = new Hono<AppEnv>();
    private settingRepo = AppDataSource.getRepository(Setting);

    constructor() {
        this.router.use("*", authMiddleware);
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", async (c) => {
            try {
                const businessId = c.get("businessId");
                const settingsList = await this.settingRepo.find({ where: { businessId } });
                const settingsObj: Record<string, string> = {};
                settingsList.forEach(s => {
                    settingsObj[s.key] = s.value;
                });
                return c.json(settingsObj);
            } catch (error) {
                console.error("Error fetching settings:", error);
                return c.json({ error: "Failed to fetch settings" }, 500);
            }
        });

        this.router.put("/", async (c) => {
            try {
                const businessId = c.get("businessId");
                const body = await c.req.json();

                for (const key of Object.keys(body)) {
                    let setting = await this.settingRepo.findOneBy({ key, businessId });
                    if (!setting) {
                        setting = new Setting();
                        setting.key = key;
                        setting.businessId = businessId;
                    }
                    setting.value = String(body[key]);
                    await this.settingRepo.save(setting);
                }

                return c.json({ message: "Settings updated successfully" });
            } catch (error) {
                console.error("Error updating settings:", error);
                return c.json({ error: "Failed to update settings" }, 500);
            }
        });
    }
}

