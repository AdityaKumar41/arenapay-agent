import { Request, Response, NextFunction } from "express";
import { redis } from "../lib/redis";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const key = `rate:api:${req.ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, Math.ceil(WINDOW_MS / 1000));
    }
    if (count > MAX_REQUESTS) {
      return res.status(429).json({ error: "Too many requests" });
    }
  } catch {
    // If Redis is down, allow the request
  }
  next();
}
