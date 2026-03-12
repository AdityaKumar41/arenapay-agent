import { toNano, Address } from "@ton/core";
import { ArenapayEscrow } from "../build/ArenapayEscrow/tact_ArenapayEscrow";
import { NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
  // The AresRegistry contract address — set after deploying the registry
  const registryAddress = Address.parse(
    process.env.REGISTRY_CONTRACT_ADDRESS ||
      "EQBynBO23ywHy_CgarY9NK9FTz0yGsLGJso0bqLqiKMj0oPA",
  );

  const escrow = provider.open(await ArenapayEscrow.fromInit(registryAddress));

  await escrow.send(
    provider.sender(),
    { value: toNano("0.5") },
    { $$type: "Deploy", queryId: 0n },
  );

  await provider.waitForDeploy(escrow.address);

  console.log("ArenapayEscrow deployed at:", escrow.address.toString());
  console.log("Registry address:", registryAddress.toString());

  // Verify deployment
  const nextId = await escrow.getGetNextSettlementId();
  console.log("Next settlement ID:", nextId.toString());
}
