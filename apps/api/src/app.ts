import express from "express";
import cors from "cors";
import { reputationRouter } from "./routes/reputation";
import { paymentRouter } from "./routes/payment";
import { identityRouter } from "./routes/identity";
import { threatRouter } from "./routes/threat";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import { config } from "./config";

const app = express();

// PRD §14.1 — restrict CORS to known Telegram + dev origins
const ALLOWED_ORIGINS = [
  "https://web.telegram.org",
  "https://webk.telegram.org",
  "https://webz.telegram.org",
  "http://localhost:5173",
  "http://localhost:3000",
];
if (config.CORS_ORIGIN) {
  ALLOWED_ORIGINS.push(...config.CORS_ORIGIN.split(",").map((o) => o.trim()));
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: false,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(rateLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "arenapay-api", timestamp: new Date().toISOString() });
});

app.use("/api/v1/reputation", reputationRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/identity", identityRouter);
app.use("/api/v1/threat", threatRouter);

app.use(errorHandler);

export { app };
