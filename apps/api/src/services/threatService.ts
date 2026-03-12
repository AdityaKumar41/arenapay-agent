import { config } from "../config";
import { logger } from "../lib/logger";
import { ThreatAssessment } from "../types";

export async function checkTransaction(
  senderAddress: string,
  destinationAddress: string,
  amount: number,
): Promise<ThreatAssessment> {
  try {
    const res = await fetch(`${config.ARES_ORACLE_URL}/threat/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: senderAddress,
        destination: destinationAddress,
        amount,
      }),
    });

    if (!res.ok) throw new Error(`Oracle threat check returned ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;

    return {
      riskScore: (data.risk_score as number) || 0,
      action: (data.action as ThreatAssessment['action']) || "ALLOW",
      flags: (data.flags as string[]) || [],
    };
  } catch (err) {
    logger.error("Threat detection failed", { error: err });
    return { riskScore: 0, action: "ALLOW", flags: [] };
  }
}
