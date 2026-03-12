import Redis from "ioredis";
import { config } from "../config";
import { logger } from "./logger";

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy(times) {
    // Exponential back-off, max 30s
    const delay = Math.min(times * 500, 30_000);
    return delay;
  },
});

// REQUIRED: prevent AggregateError "Unhandled error event" when Redis is
// down. ioredis emits 'error' on every failed reconnect attempt; without a
// listener Node treats it as an uncaught exception (AggregateError crash).
redis.on("error", (err: Error) => {
  logger.debug("Redis error (will retry)", { message: err.message });
});

redis.on("connect", () => {
  logger.info("Redis connected");
});
