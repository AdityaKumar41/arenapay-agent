import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { config } from './config';
import { logger } from './lib/logger';
import { redis } from './lib/redis';
import { setupWebSocket } from './ws/handlers';

const server = http.createServer(app);

// PRD §14 — Socket.io CORS must match the HTTP CORS allowlist (not wildcard)
const WS_ALLOWED_ORIGINS = [
  'https://web.telegram.org',
  'https://webk.telegram.org',
  'https://webz.telegram.org',
  'http://localhost:5173',
  'http://localhost:3000',
];
if (config.CORS_ORIGIN) {
  WS_ALLOWED_ORIGINS.push(...config.CORS_ORIGIN.split(',').map((o) => o.trim()));
}

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || WS_ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`WS CORS: origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST'],
    credentials: false,
  },
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

setupWebSocket(io);

async function start() {
  // Redis error events handled in lib/redis.ts — no crash on failure
  try {
    await redis.connect();
  } catch {
    logger.warn('Redis not available at startup, cache disabled until reconnect');
  }

  server.listen(config.PORT, () => {
    logger.info(`arenapay API running on port ${config.PORT}`);
  });
}

start();

export { io };
