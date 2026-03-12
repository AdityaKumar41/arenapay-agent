import { fetchScore } from "./aresService";
import { checkTransaction } from "./threatService";
import { prisma } from "../lib/prisma";
import { config } from "../config";
import { buildSettlementMessage } from "../lib/tonClient";
import { logger } from "../lib/logger";
import { PaymentPreview, PaymentExecution } from "../types";

const BASE_FEE_BPS = 30;

export async function previewPayment(
  senderAddress: string,
  recipientAddress: string,
  amountNanoton: number,
): Promise<PaymentPreview> {
  const score = await fetchScore(senderAddress);

  const collateralRequired = Math.floor(
    (amountNanoton * score.collateralRequiredBps) / 10000,
  );
  const feeBps = Math.floor(BASE_FEE_BPS * (1 - score.feeDiscountPct / 100));
  const feeAmount = Math.floor((amountNanoton * feeBps) / 10000);

  // Check max tx limit
  const amountTon = amountNanoton / 1e9;
  if (amountTon > score.maxTxLimitTon) {
    return {
      senderScore: score.score,
      tier: score.tier,
      collateralRequired,
      feeBps,
      feeAmountNanoton: feeAmount,
      estimatedTimeSeconds: 3,
      riskAssessment: {
        level: "critical",
        flags: [
          `EXCEEDS_TX_LIMIT: max ${score.maxTxLimitTon} TON for ${score.tier} tier`,
        ],
      },
    };
  }

  // Run threat assessment
  const threat = await checkTransaction(
    senderAddress,
    recipientAddress,
    amountNanoton,
  );

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  if (threat.action === "BLOCK") riskLevel = "critical";
  else if (threat.action === "WARN") riskLevel = "medium";

  return {
    senderScore: score.score,
    tier: score.tier,
    collateralRequired,
    feeBps,
    feeAmountNanoton: feeAmount,
    estimatedTimeSeconds: 3,
    riskAssessment: {
      level: riskLevel,
      flags: threat.flags,
    },
  };
}

export async function executePayment(
  senderAddress: string,
  recipientAddress: string,
  amountNanoton: number,
): Promise<PaymentExecution> {
  // Re-validate
  const preview = await previewPayment(
    senderAddress,
    recipientAddress,
    amountNanoton,
  );

  if (preview.riskAssessment.level === "critical") {
    throw new Error(
      `Payment blocked: ${preview.riskAssessment.flags.join(", ")}`,
    );
  }

  // Build the settlement message for TON Connect
  const messagePayload = buildSettlementMessage(
    recipientAddress,
    BigInt(amountNanoton),
    preview.collateralRequired > 0
      ? Math.floor((preview.collateralRequired * 10000) / amountNanoton)
      : 20000,
  );

  // Store in DB
  let settlementId = "pending";
  try {
    const settlement = await prisma.settlement.create({
      data: {
        senderAddress,
        recipientAddress,
        amountNanoton: BigInt(amountNanoton),
        collateralNanoton: BigInt(preview.collateralRequired),
        collateralBps: Math.floor(
          (preview.collateralRequired * 10000) / amountNanoton,
        ),
        senderScore: preview.senderScore,
        feeBps: preview.feeBps,
        feeDiscountPct: Math.floor(
          ((BASE_FEE_BPS - preview.feeBps) / BASE_FEE_BPS) * 100,
        ),
        status: "pending",
        threatAssessment: preview.riskAssessment as object,
      },
    });
    settlementId = settlement.id;
  } catch (err) {
    logger.warn("Failed to store settlement in DB", { error: err });
    settlementId = `local-${Date.now()}`;
  }

  return {
    settlementId,
    escrowContractAddress: config.ESCROW_CONTRACT_ADDRESS || "NOT_CONFIGURED",
    messagePayload,
    collateralRequired: preview.collateralRequired.toString(),
    status: "awaiting_signature",
  };
}
