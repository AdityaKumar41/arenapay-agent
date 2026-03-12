import { TonClient } from "@ton/ton";
import { Address, beginCell, toNano } from "@ton/core";
import { config } from "../config";
import { logger } from "./logger";

let client: TonClient | null = null;

export function getTonClient(): TonClient {
  if (!client) {
    client = new TonClient({
      endpoint: config.TON_RPC_URL,
      apiKey: config.TON_API_KEY || undefined,
    });
  }
  return client;
}

export async function getWalletBalance(address: string): Promise<string> {
  try {
    const client = getTonClient();
    const balance = await client.getBalance(Address.parse(address));
    return balance.toString();
  } catch (err) {
    logger.error("Failed to get wallet balance", { address, error: err });
    return "0";
  }
}

export async function getContractScore(
  registryAddress: string,
  walletAddress: string,
): Promise<number> {
  try {
    const client = getTonClient();
    const result = await client.runMethod(
      Address.parse(registryAddress),
      "getScore",
      [
        {
          type: "slice",
          cell: beginCell()
            .storeAddress(Address.parse(walletAddress))
            .endCell(),
        },
      ],
    );
    return Number(result.stack.readBigNumber());
  } catch (err) {
    logger.error("Failed to get on-chain score", {
      registryAddress,
      walletAddress,
      error: err,
    });
    return 0;
  }
}

export function buildSettlementMessage(
  recipient: string,
  amountNanoton: bigint,
  collateralBps: number,
): string {
  const cell = beginCell()
    .storeUint(0x5a3c8ed4, 32) // InitiateSettlement opcode
    .storeUint(0, 64) // query_id
    .storeAddress(Address.parse(recipient))
    .storeCoins(amountNanoton)
    .storeUint(collateralBps, 16)
    .endCell();

  return cell.toBoc().toString("base64");
}
