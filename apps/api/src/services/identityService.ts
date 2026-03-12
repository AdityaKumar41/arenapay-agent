import { config } from "../config";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import { IdentityVerification } from "../types";

export async function initiateVerification(
  tonAddress: string,
): Promise<IdentityVerification & { sessionId: string }> {
  try {
    const res = await fetch(`${config.ARES_ORACLE_URL}/identity/${tonAddress}`);
    if (!res.ok)
      throw new Error(`Oracle identity check returned ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;

    // Upsert user with DID data
    await prisma.user.upsert({
      where: { tonAddress },
      create: {
        tonAddress,
        didDocument: data as object,
        didVerified: (data.verified as boolean) || false,
      },
      update: {
        didDocument: data as object,
        didVerified: (data.verified as boolean) || false,
      },
    });

    return {
      did: (data.did as string) || `did:ton:${tonAddress}`,
      verified: (data.verified as boolean) || false,
      credentials: (data.credentials as IdentityVerification['credentials']) || [],
      sybilResistanceLevel: (data.sybil_resistance_level as string) || "none",
      sessionId: `session-${Date.now()}`,
      verificationUrl: (data.verified as boolean)
        ? undefined
        : `https://identityhub.ton/verify?address=${tonAddress}`,
    };
  } catch (err) {
    logger.error("Identity verification failed", { tonAddress, error: err });
    return {
      did: `did:ton:${tonAddress}`,
      verified: false,
      credentials: [],
      sybilResistanceLevel: "none",
      sessionId: `session-${Date.now()}`,
    };
  }
}

export async function handleCallback(tonAddress: string): Promise<void> {
  await prisma.user.upsert({
    where: { tonAddress },
    create: { tonAddress, didVerified: true },
    update: { didVerified: true },
  });
}
