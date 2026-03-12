import { Router, Request, Response } from "express";

export const identityRouter = Router();

// POST /api/v1/identity/verify
identityRouter.post("/verify", async (req: Request, res: Response) => {
  const { tonAddress } = req.body;
  res.json({
    did: `did:ton:${tonAddress}`,
    verified: false,
    credentials: [],
    verificationUrl: "https://identityhub.xyz/verify?redirect=arenapay",
    sessionId: "session-" + Date.now(),
  });
});

// POST /api/v1/identity/callback
identityRouter.post("/callback", async (req: Request, res: Response) => {
  res.json({ message: "Verification callback processed" });
});
