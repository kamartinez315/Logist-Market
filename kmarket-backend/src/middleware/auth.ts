import { Context, Next } from "hono";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "kmarket-secret-key-change-in-production";

export function generateToken(payload: { userId: number; businessId: number }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number; businessId: number } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: number; businessId: number };
    } catch {
        return null;
    }
}

export async function authMiddleware(c: Context, next: Next) {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "No autorizado" }, 401);
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
        return c.json({ error: "Token inválido o expirado" }, 401);
    }

    c.set("userId", payload.userId);
    c.set("businessId", payload.businessId);

    await next();
}
