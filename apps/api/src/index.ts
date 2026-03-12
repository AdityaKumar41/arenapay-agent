import http from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { config } from "./config";
import { logger } from "./lib/logger";
import { redis } from "./lib/redis";
import { setupWebSocket } from "./ws/handlers";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupWebSocket(io);

async function start() {
  try {
    await redis.connect();
    logger.info("Redis connected");
  } catch (err) {
    logger.warn("Redis connection failed, continuing without cache", {
      error: err,
    });
  }

  server.listen(config.PORT, () => {
    logger.info(`arenapay API running on port ${config.PORT}`);
  });
}

start();

export { io };
