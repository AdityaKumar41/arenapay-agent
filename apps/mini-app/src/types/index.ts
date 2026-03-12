export type Tier = "untrusted" | "basic" | "verified" | "trusted" | "elite";

export interface ScoreComponents {
  transaction: number;
  did: number;
  behavioral: number;
}

export interface ScoreResponse {
  address: string;
  score: number;
  tier: Tier;
  components: ScoreComponents;
  collateralRequiredBps: number;
  feeDiscountPct: number;
  maxTxLimitTon: number;
  computedAt: string;
}

export interface PaymentPreview {
  senderScore: number;
  tier: Tier;
  collateralRequired: number;
  feeBps: number;
  feeAmountNanoton: number;
  estimatedTimeSeconds: number;
  riskAssessment: {
    level: "low" | "medium" | "high" | "critical";
    flags: string[];
  };
}

export interface PaymentExecution {
  settlementId: string;
  escrowContractAddress: string;
  messagePayload: string;
  collateralRequired: string;
  status: string;
}

export interface ThreatAssessment {
  riskScore: number;
  action: "ALLOW" | "WARN" | "BLOCK";
  flags: string[];
}

export interface ScoreHistoryEntry {
  score: number;
  tier: string;
  date: string;
}

export interface PaymentHistoryItem {
  id: string;
  senderAddress: string;
  recipientAddress: string;
  amountNanoton: string;
  feeBps: number;
  status: "pending" | "settled" | "failed" | "cancelled";
  senderScore: number;
  createdAt: string;
  settledAt?: string;
}
