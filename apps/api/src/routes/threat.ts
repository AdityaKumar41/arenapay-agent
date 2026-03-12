import { Router, Request, Response, NextFunction } from 'express';
import { checkTransaction } from '../services/threatService';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate';
import { ThreatCheckSchema } from '../lib/schemas';

export const threatRouter = Router();

threatRouter.post('/check', validate(ThreatCheckSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { senderAddress, destinationAddress, amount } = req.body;

    const result = await checkTransaction(senderAddress || '', destinationAddress, Number(amount) || 0);

    if (result.action !== 'ALLOW') {
      try {
        await prisma.threatEvent.create({
          data: {
            tonAddress: senderAddress || destinationAddress,
            riskScore: result.riskScore,
            flags: result.flags,
            actionTaken: result.action,
            details: { senderAddress, destinationAddress, amount } as object,
          },
        });
      } catch {
        // Ignore DB errors for threat logging
      }

      if (senderAddress) {
        const io = req.app.get('io');
        if (io) {
          io.to(`score:${senderAddress}`).emit('threat_alert', {
            type: 'threat_alert',
            data: { address: senderAddress, riskScore: result.riskScore, flags: result.flags, action: result.action },
          });
        }
      }
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});
