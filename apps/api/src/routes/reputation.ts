import { Router, Request, Response } from "express";

export const reputationRouter = Router();

// GET /api/v1/reputation/:tonAddress
reputationRouter.get("/:tonAddress", async (req: Request, res: Response) => {
  // Stub — will be implemented in Phase 3
  const { tonAddress } = req.params;
  res.json({
    address: tonAddress,
    score: 0,
    tier: "untrusted",
    components: { transaction: 0, did: 0, behavioral: 0 },
    collateralRequiredBps: 20000,
    feeDiscountPct: 0,
    maxTxLimitTon: 10,
    computedAt: new Date().toISOString(),
  });
});

// POST /api/v1/reputation/:tonAddress/refresh
reputationRouter.post(
  "/:tonAddress/refresh",
  async (req: Request, res: Response) => {
    const { tonAddress } = req.params;
    res
      .status(202)
      .json({ message: "Score recalculation queued", address: tonAddress });
  },
);

// GET /api/v1/reputation/:tonAddress/history
reputationRouter.get(
  "/:tonAddress/history",
  async (req: Request, res: Response) => {
    res.json([]);
  },
);
