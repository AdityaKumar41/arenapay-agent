import express from "express";
import cors from "cors";
import { reputationRouter } from "./routes/reputation";
import { paymentRouter } from "./routes/payment";
import { identityRouter } from "./routes/identity";
import { threatRouter } from "./routes/threat";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "arenapay-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/reputation", reputationRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/identity", identityRouter);
app.use("/api/v1/threat", threatRouter);

app.use(errorHandler);

export { app };
