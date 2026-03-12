import { Router, Request, Response, NextFunction } from 'express';
import { initiateVerification, handleCallback } from '../services/identityService';
import { refreshScore } from '../services/aresService';
import { validate } from '../middleware/validate';
import { IdentityVerifySchema } from '../lib/schemas';

export const identityRouter = Router();

identityRouter.post('/verify', validate(IdentityVerifySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tonAddress } = req.body;

    const result = await initiateVerification(tonAddress);

    if (result.verified) {
      const score = await refreshScore(tonAddress);
      const io = req.app.get('io');
      if (io) {
        io.to(`score:${tonAddress}`).emit('score_update', {
          type: 'score_update',
          data: { address: tonAddress, score: score.score, tier: score.tier, trigger: 'identity_verification' },
        });
      }
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

identityRouter.post('/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tonAddress } = req.body;
    if (!tonAddress) {
      return res.status(400).json({ error: 'tonAddress is required' });
    }

    await handleCallback(tonAddress);
    const score = await refreshScore(tonAddress);

    const io = req.app.get('io');
    if (io) {
      io.to(`score:${tonAddress}`).emit('score_update', {
        type: 'score_update',
        data: { address: tonAddress, score: score.score, tier: score.tier, trigger: 'identity_callback' },
      });
    }

    res.json({ message: 'Verification callback processed', score });
  } catch (err) {
    next(err);
  }
});
