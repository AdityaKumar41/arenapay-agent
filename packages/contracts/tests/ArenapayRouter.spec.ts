import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { toNano } from "@ton/core";
import { ArenapayRouter } from "../build/ArenapayRouter/tact_ArenapayRouter";
import { ArenapayEscrow } from "../build/ArenapayEscrow/tact_ArenapayEscrow";
import "@ton/test-utils";

describe("ArenapayRouter", () => {
  let blockchain: Blockchain;
  let owner: SandboxContract<TreasuryContract>;
  let sender: SandboxContract<TreasuryContract>;
  let recipient: SandboxContract<TreasuryContract>;
  let router: SandboxContract<ArenapayRouter>;
  let escrow: SandboxContract<ArenapayEscrow>;
  let registryAddr: SandboxContract<TreasuryContract>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    owner = await blockchain.treasury("owner");
    sender = await blockchain.treasury("sender");
    recipient = await blockchain.treasury("recipient");
    registryAddr = await blockchain.treasury("registry");

    // Deploy escrow first
    escrow = blockchain.openContract(
      await ArenapayEscrow.fromInit(registryAddr.address),
    );
    await escrow.send(
      owner.getSender(),
      { value: toNano("0.5") },
      { $$type: "Deploy", queryId: 0n },
    );

    // Deploy router pointing at registry + escrow
    router = blockchain.openContract(
      await ArenapayRouter.fromInit(registryAddr.address, escrow.address),
    );
    const deployResult = await router.send(
      owner.getSender(),
      { value: toNano("0.5") },
      { $$type: "Deploy", queryId: 0n },
    );

    expect(deployResult.transactions).toHaveTransaction({
      from: owner.address,
      to: router.address,
      deploy: true,
      success: true,
    });
  });

  it("should deploy with correct linked addresses", async () => {
    const escrowAddr = await router.getGetEscrowAddress();
    expect(escrowAddr.equals(escrow.address)).toBe(true);

    const regAddr = await router.getGetRegistryAddress();
    expect(regAddr.equals(registryAddr.address)).toBe(true);
  });

  it("should route payment to escrow", async () => {
    const amount = toNano("2");
    const result = await router.send(
      sender.getSender(),
      { value: toNano("3") },
      {
        $$type: "RoutePayment",
        recipient: recipient.address,
        amount,
      },
    );

    // Router should forward InitiateSettlement to escrow
    expect(result.transactions).toHaveTransaction({
      from: router.address,
      to: escrow.address,
      success: true,
    });

    // Escrow should have created a settlement
    const settlement = await escrow.getGetSettlement(1n);
    expect(settlement).not.toBeNull();
    expect(settlement!.recipient.equals(recipient.address)).toBe(true);
    expect(settlement!.amount).toBe(amount);
  });

  it("should reject route with zero amount", async () => {
    const result = await router.send(
      sender.getSender(),
      { value: toNano("1") },
      {
        $$type: "RoutePayment",
        recipient: recipient.address,
        amount: 0n,
      },
    );

    expect(result.transactions).toHaveTransaction({
      from: sender.address,
      to: router.address,
      success: false,
    });
  });

  it("should reject route with insufficient TON", async () => {
    const result = await router.send(
      sender.getSender(),
      { value: toNano("0.01") }, // below 0.1 TON minimum
      {
        $$type: "RoutePayment",
        recipient: recipient.address,
        amount: toNano("5"),
      },
    );

    expect(result.transactions).toHaveTransaction({
      from: sender.address,
      to: router.address,
      success: false,
    });
  });

  it("should allow owner to update escrow address", async () => {
    const newEscrow = await blockchain.treasury("newEscrow");
    await router.send(
      owner.getSender(),
      { value: toNano("0.05") },
      { $$type: "SetEscrow", escrow: newEscrow.address },
    );

    const addr = await router.getGetEscrowAddress();
    expect(addr.equals(newEscrow.address)).toBe(true);
  });

  it("should allow owner to update registry address", async () => {
    const newRegistry = await blockchain.treasury("newRegistry");
    await router.send(
      owner.getSender(),
      { value: toNano("0.05") },
      { $$type: "SetRegistry", registry: newRegistry.address },
    );

    const addr = await router.getGetRegistryAddress();
    expect(addr.equals(newRegistry.address)).toBe(true);
  });

  it("should reject non-owner from updating escrow", async () => {
    const result = await router.send(
      sender.getSender(),
      { value: toNano("0.05") },
      { $$type: "SetEscrow", escrow: sender.address },
    );

    expect(result.transactions).toHaveTransaction({
      from: sender.address,
      to: router.address,
      success: false,
    });
  });
});
