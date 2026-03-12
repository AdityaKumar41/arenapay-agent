import { z } from "zod";

// TON addresses: EQ.../UQ... (48 chars) or 0:hex (66 chars) — be permissive
const TON_ADDRESS = z.string().min(32).max(100).trim();
// amountNanoton can arrive as a JSON number or string; coerce to number
const NANOTON = z.coerce.number().positive().max(Number.MAX_SAFE_INTEGER);

export const PaymentPreviewSchema = z.object({
  senderAddress: TON_ADDRESS,
  recipientAddress: TON_ADDRESS,
  amountNanoton: NANOTON,
});

export const PaymentExecuteSchema = z.object({
  senderAddress: TON_ADDRESS,
  recipientAddress: TON_ADDRESS,
  amountNanoton: NANOTON,
});

export const ThreatCheckSchema = z.object({
  senderAddress: TON_ADDRESS.optional(),
  destinationAddress: TON_ADDRESS,
  amount: z.coerce.number().nonnegative().default(0),
});

export const IdentityVerifySchema = z.object({
  tonAddress: TON_ADDRESS,
});
