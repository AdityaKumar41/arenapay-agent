import { Router, Request, Response, NextFunction } from 'express';
import { fetchScore, refreshScore, getScoreHistory } from '../services/aresService';
import { redis } from '../lib/redis';

export const reputationRouter = Router();

// Per-address score refresh rate limit (PRD §12.2)
async function scoreRefreshRateLimit(req: Request, res: Response, next: NextFunction) {
  const tonAddress = req.params.tonAddress as string;
  try {
    const key = `rate:score_request:${tonAddress}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 300); // 5-min window
    if (count > 5) {
      return res.status(429).json({ error: 'Score refresh rate limit exceeded. Try again in 5 minutes.' });
    }
  } catch {
    // Redis down — allow through
  }
  next();
}

reputationRouter.get('/:tonAddress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tonAddress = String(req.params.tonAddress);
    const score = await fetchScore(tonAddress);
    res.json(score);
  } catch (err) {
    next(err);
  }
});

reputationRouter.post('/:tonAddress/refresh', scoreRefreshRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tonAddress = String(req.params.tonAddress);

    // Fetch previous score for delta reporting in WebSocket event
    let previousScore: number | null = null;
    try {
      const cached = await redis.get(`ares:score:${tonAddress}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        previousScore = parsed.score ?? null;
      }
    } catch {
      // Ignore Redis errors
    }

    const score = await refreshScore(tonAddress);

    const io = req.app.get('io');
    if (io) {
      io.to(`score:${tonAddress}`).emit('score_update', {
        type: 'score_update',
        data: {
          address: tonAddress,
          score: score.score,
          previousScore,
          tier: score.tier,
          trigger: 'manual_refresh',
        },
      });
    }

    res.status(202).json(score);
  } catch (err) {
    next(err);
  }
});

reputationRouter.get('/:tonAddress/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tonAddress = String(req.params.tonAddress);
    const days = Math.min(parseInt(String(req.query.days)) || 30, 90);
    const history = await getScoreHistory(tonAddress, days);
    res.json(history);
  } catch (err) {
    next(err);
  }
});
