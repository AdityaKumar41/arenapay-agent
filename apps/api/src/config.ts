import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "../../.env" });

const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().default("dev-secret-change-me"),
  TON_NETWORK: z.string().default("testnet"),
  TON_RPC_URL: z.string().default("https://testnet.toncenter.com/api/v2"),
  TON_API_KEY: z.string().default(""),
  ARES_ORACLE_URL: z.string().default("http://localhost:8001"),
  IDENTITYHUB_API_URL: z.string().default("https://api.identityhub.xyz/v1"),
  IDENTITYHUB_API_KEY: z.string().default(""),
  ESCROW_CONTRACT_ADDRESS: z.string().default(""),
  REGISTRY_CONTRACT_ADDRESS: z.string().default(""),
  PORT: z.coerce.number().default(3000),
});

export const config = envSchema.parse(process.env);
