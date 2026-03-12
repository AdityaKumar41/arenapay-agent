import { toNano, Address } from "@ton/core";
import { AresRegistry } from "../build/AresRegistry/tact_AresRegistry";
import { NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
  // The oracle address — replace with your actual oracle wallet address
  const oracleAddress = Address.parse(
    process.env.ORACLE_ADDRESS ||
      "EQBynBO23ywHy_CgarY9NK9FTz0yGsLGJso0bqLqiKMj0oPA",
  );

  const registry = provider.open(await AresRegistry.fromInit(oracleAddress));

  await registry.send(
    provider.sender(),
    { value: toNano("0.5") },
    { $$type: "Deploy", queryId: 0n },
  );

  await provider.waitForDeploy(registry.address);

  console.log("AresRegistry deployed at:", registry.address.toString());
  console.log("Oracle address:", oracleAddress.toString());

  // Verify deployment
  const oracle = await registry.getGetOracleAddress();
  console.log("Verified oracle address:", oracle.toString());
}
