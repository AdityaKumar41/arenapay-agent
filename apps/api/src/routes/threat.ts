import { Router, Request, Response } from "express";

export const threatRouter = Router();

// POST /api/v1/threat/check
threatRouter.post("/check", async (req: Request, res: Response) => {
  const { senderAddress, destinationAddress, amount } = req.body;
  res.json({
    riskScore: 0,
    action: "ALLOW",
    flags: [],
  });
});
