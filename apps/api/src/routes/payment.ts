import { Router, Request, Response } from "express";

export const paymentRouter = Router();

// POST /api/v1/payment/preview
paymentRouter.post("/preview", async (req: Request, res: Response) => {
  const { senderAddress, recipientAddress, amountNanoton } = req.body;
  res.json({
    senderScore: 0,
    tier: "untrusted",
    collateralRequired: amountNanoton * 2,
    feeBps: 30,
    feeAmountNanoton: Math.floor((amountNanoton * 30) / 10000),
    estimatedTimeSeconds: 3,
    riskAssessment: { level: "low", flags: [] },
  });
});

// POST /api/v1/payment/execute
paymentRouter.post("/execute", async (req: Request, res: Response) => {
  const { senderAddress, recipientAddress, amountNanoton } = req.body;
  res.json({
    settlementId: "stub-" + Date.now(),
    status: "pending",
    message: "Payment execution stub — will be implemented in Phase 3",
  });
});
