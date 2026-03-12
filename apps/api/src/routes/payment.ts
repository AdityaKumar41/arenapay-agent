import { Router, Request, Response, NextFunction } from 'express';
import { previewPayment, executePayment } from '../services/paymentService';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate';
import { PaymentPreviewSchema, PaymentExecuteSchema } from '../lib/schemas';

export const paymentRouter = Router();

paymentRouter.post('/preview', validate(PaymentPreviewSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { senderAddress, recipientAddress, amountNanoton } = req.body;
    const preview = await previewPayment(senderAddress, recipientAddress, Number(amountNanoton));
    res.json(preview);
  } catch (err) {
    next(err);
  }
});

paymentRouter.post('/execute', validate(PaymentExecuteSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { senderAddress, recipientAddress, amountNanoton } = req.body;
    const result = await executePayment(senderAddress, recipientAddress, Number(amountNanoton));
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('Payment blocked')) {
      return res.status(403).json({ error: err.message });
    }
    next(err);
  }
});

paymentRouter.get('/history/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const address = String(req.params.address);
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const settlements = await prisma.settlement.findMany({
      where: {
        OR: [
          { senderAddress: address },
          { recipientAddress: address },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        senderAddress: true,
        recipientAddress: true,
        amountNanoton: true,
        feeBps: true,
        status: true,
        senderScore: true,
        createdAt: true,
        completedAt: true,
      },
    });

    const result = settlements.map((s) => ({
      id: s.id,
      senderAddress: s.senderAddress,
      recipientAddress: s.recipientAddress,
      amountNanoton: s.amountNanoton.toString(),
      feeBps: s.feeBps,
      status: s.status,
      senderScore: s.senderScore,
      createdAt: s.createdAt.toISOString(),
      settledAt: s.completedAt?.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
});

paymentRouter.get('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const settlement = await prisma.settlement.findUnique({
      where: { id },
      select: { id: true, status: true, completedAt: true, createdAt: true },
    });
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }
    res.json(settlement);
  } catch (err) {
    next(err);
  }
});
