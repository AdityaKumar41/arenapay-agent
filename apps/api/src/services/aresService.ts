import { redis } from "../lib/redis";
import { prisma } from "../lib/prisma";
import { config } from "../config";
import { logger } from "../lib/logger";
import { ScoreResponse } from "../types";

const SCORE_CACHE_TTL = 300; // 5 minutes

export async function fetchScore(address: string): Promise<ScoreResponse> {
  // 1. Check Redis cache
  try {
    const cached = await redis.get(`ares:score:${address}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Redis might be down, continue without cache
  }

  // 2. Fetch from Oracle
  const score = await fetchFromOracle(address);

  // 3. Cache in Redis
  try {
    await redis.set(
      `ares:score:${address}`,
      JSON.stringify(score),
      "EX",
      SCORE_CACHE_TTL,
    );
  } catch {
    // Ignore cache errors
  }

  // 4. Store in DB
  try {
    let user = await prisma.user.findUnique({ where: { tonAddress: address } });
    if (!user) {
      user = await prisma.user.create({ data: { tonAddress: address } });
    }

    await prisma.reputationScore.create({
      data: {
        userId: user.id,
        tonAddress: address,
        score: score.score,
        txComponent: score.components.transaction,
        didComponent: score.components.did,
        behavioralComponent: score.components.behavioral,
        tier: score.tier,
        computedAt: new Date(score.computedAt),
      },
    });
  } catch (err) {
    logger.warn("Failed to store score in DB", { error: err });
  }

  return score;
}

export async function refreshScore(address: string): Promise<ScoreResponse> {
  // Invalidate cache
  try {
    await redis.del(`ares:score:${address}`);
  } catch {
    // Ignore
  }

  // Compute fresh score from oracle
  const score = await computeFromOracle(address);

  // Cache new result
  try {
    await redis.set(
      `ares:score:${address}`,
      JSON.stringify(score),
      "EX",
      SCORE_CACHE_TTL,
    );
  } catch {
    // Ignore
  }

  // Store in DB
  try {
    let user = await prisma.user.findUnique({ where: { tonAddress: address } });
    if (!user) {
      user = await prisma.user.create({ data: { tonAddress: address } });
    }

    await prisma.reputationScore.create({
      data: {
        userId: user.id,
        tonAddress: address,
        score: score.score,
        txComponent: score.components.transaction,
        didComponent: score.components.did,
        behavioralComponent: score.components.behavioral,
        tier: score.tier,
        computedAt: new Date(score.computedAt),
      },
    });
  } catch (err) {
    logger.warn("Failed to store refreshed score in DB", { error: err });
  }

  return score;
}

export async function getScoreHistory(address: string, days: number = 30) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const scores = await prisma.reputationScore.findMany({
      where: {
        tonAddress: address,
        computedAt: { gte: since },
      },
      orderBy: { computedAt: "asc" },
      select: {
        score: true,
        tier: true,
        computedAt: true,
      },
    });

    return scores.map((s) => ({
      score: s.score,
      tier: s.tier,
      date: s.computedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

async function fetchFromOracle(address: string): Promise<ScoreResponse> {
  try {
    const res = await fetch(`${config.ARES_ORACLE_URL}/score/${address}`);
    if (!res.ok) throw new Error(`Oracle returned ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return mapOracleResponse(address, data);
  } catch (err) {
    logger.error("Oracle fetch failed", { address, error: err });
    return defaultScore(address);
  }
}

async function computeFromOracle(address: string): Promise<ScoreResponse> {
  try {
    const res = await fetch(`${config.ARES_ORACLE_URL}/score/compute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    if (!res.ok) throw new Error(`Oracle returned ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return mapOracleResponse(address, data);
  } catch (err) {
    logger.error("Oracle compute failed", { address, error: err });
    return defaultScore(address);
  }
}

function mapOracleResponse(
  address: string,
  data: Record<string, unknown>,
): ScoreResponse {
  return {
    address,
    score: (data.score as number) || 0,
    tier: (data.tier as ScoreResponse["tier"]) || "untrusted",
    components: {
      transaction:
        (data.components as Record<string, number>)?.transaction || 0,
      did: (data.components as Record<string, number>)?.did || 0,
      behavioral: (data.components as Record<string, number>)?.behavioral || 0,
    },
    collateralRequiredBps: (data.collateral_required_bps as number) || 20000,
    feeDiscountPct: (data.fee_discount_pct as number) || 0,
    maxTxLimitTon: (data.max_tx_limit_ton as number) || 10,
    computedAt: (data.computed_at as string) || new Date().toISOString(),
  };
}

function defaultScore(address: string): ScoreResponse {
  return {
    address,
    score: 0,
    tier: "untrusted",
    components: { transaction: 0, did: 0, behavioral: 0 },
    collateralRequiredBps: 20000,
    feeDiscountPct: 0,
    maxTxLimitTon: 10,
    computedAt: new Date().toISOString(),
  };
}
