import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { toNano } from "@ton/core";
import { ArenapayEscrow } from "../build/ArenapayEscrow/tact_ArenapayEscrow";
import "@ton/test-utils";

describe("ArenapayEscrow", () => {
  let blockchain: Blockchain;
  let owner: SandboxContract<TreasuryContract>;
  let sender: SandboxContract<TreasuryContract>;
  let recipient: SandboxContract<TreasuryContract>;
  let escrow: SandboxContract<ArenapayEscrow>;
  let registryAddr: SandboxContract<TreasuryContract>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    owner = await blockchain.treasury("owner");
    sender = await blockchain.treasury("sender");
    recipient = await blockchain.treasury("recipient");
    registryAddr = await blockchain.treasury("registry");

    escrow = blockchain.openContract(
      await ArenapayEscrow.fromInit(registryAddr.address),
    );

    const deployResult = await escrow.send(
      owner.getSender(),
      { value: toNano("0.5") },
      { $$type: "Deploy", queryId: 0n },
    );

    expect(deployResult.transactions).toHaveTransaction({
      from: owner.address,
      to: escrow.address,
      deploy: true,
      success: true,
    });
  });

  it("should deploy correctly", async () => {
    const nextId = await escrow.getGetNextSettlementId();
    expect(nextId).toBe(1n);

    const total = await escrow.getGetTotalSettlements();
    expect(total).toBe(0n);
  });

  it("should create settlement with sufficient collateral", async () => {
    const amount = toNano("5");
    const collateralBps = 5000n; // 50%
    const collateralNeeded = toNano("2.5");

    const result = await escrow.send(
      sender.getSender(),
      { value: collateralNeeded + toNano("0.1") }, // extra for gas
      {
        $$type: "InitiateSettlement",
        recipient: recipient.address,
        amount: amount,
        requiredCollateralBps: collateralBps,
      },
    );

    expect(result.transactions).toHaveTransaction({
      from: sender.address,
      to: escrow.address,
      success: true,
    });

    const settlement = await escrow.getGetSettlement(1n);
    expect(settlement).not.toBeNull();
    expect(settlement!.status).toBe(0n); // pending
    expect(settlement!.amount).toBe(amount);
    expect(settlement!.sender.equals(sender.address)).toBe(true);
    expect(settlement!.recipient.equals(recipient.address)).toBe(true);

    const nextId = await escrow.getGetNextSettlementId();
    expect(nextId).toBe(2n);
  });

  it("should reject settlement with insufficient collateral", async () => {
    const amount = toNano("10");
    const collateralBps = 5000n; // 50% = 5 TON needed
    const tooLittle = toNano("1"); // only sending 1 TON

    const result = await escrow.send(
      sender.getSender(),
      { value: tooLittle },
      {
        $$type: "InitiateSettlement",
        recipient: recipient.address,
        amount: amount,
        requiredCollateralBps: collateralBps,
      },
    );

    expect(result.transactions).toHaveTransaction({
      from: sender.address,
      to: escrow.address,
      success: false,
    });
  });

  it("should release settlement and send funds", async () => {
    // First create a settlement
    const amount = toNano("2");
    const collateralBps = 10000n; // 100%

    await escrow.send(
      sender.getSender(),
      { value: toNano("2.1") },
      {
        $$type: "InitiateSettlement",
        recipient: recipient.address,
        amount: amount,
        requiredCollateralBps: collateralBps,
      },
    );

    // Release it (only owner can)
    const releaseResult = await escrow.send(
      owner.getSender(),
      { value: toNano("0.05") },
      {
        $$type: "ReleaseSettlement",
        settlementId: 1n,
      },
    );

    expect(releaseResult.transactions).toHaveTransaction({
      from: escrow.address,
      to: recipient.address,
      success: true,
    });

    // Check status is now completed (1)
    const settlement = await escrow.getGetSettlement(1n);
    expect(settlement).not.toBeNull();
    expect(settlement!.status).toBe(1n);
  });

  it("should reject releasing an already completed settlement", async () => {
    // Create and release a settlement
    await escrow.send(
      sender.getSender(),
      { value: toNano("3") },
      {
        $$type: "InitiateSettlement",
        recipient: recipient.address,
        amount: toNano("2"),
        requiredCollateralBps: 10000n,
      },
    );

    await escrow.send(
      owner.getSender(),
      { value: toNano("0.05") },
      { $$type: "ReleaseSettlement", settlementId: 1n },
    );

    // Try to release again
    const result = await escrow.send(
      owner.getSender(),
      { value: toNano("0.05") },
      { $$type: "ReleaseSettlement", settlementId: 1n },
    );

    expect(result.transactions).toHaveTransaction({
      from: owner.address,
      to: escrow.address,
      success: false,
    });
  });

  it("should enforce 20% collateral floor when bps too low", async () => {
    // PRD §14.3 — 500 bps (5%) is below the 2000 bps (20%) floor
    // Floor kicks in: needed = 10 TON * 20% = 2 TON
    const amount = toNano("10");
    const insufficientForFloor = toNano("0.6"); // only covers 5%, not 20%

    const result = await escrow.send(
      sender.getSender(),
      { value: insufficientForFloor },
      {
        $$type: "InitiateSettlement",
        recipient: recipient.address,
        amount,
        requiredCollateralBps: 500n, // 5% — below floor
      },
    );

    expect(result.transactions).toHaveTransaction({
      from: sender.address,
      to: escrow.address,
      success: false, // floor raised to 20% → 0.6 TON insufficient
    });
  });

  it("should succeed when collateral meets the 20% floor", async () => {
    const amount = toNano("10");
    // 20% of 10 TON = 2 TON, send 2.1 TON to cover gas
    const result = await escrow.send(
      sender.getSender(),
      { value: toNano("2.2") },
      {
        $$type: "InitiateSettlement",
        recipient: recipient.address,
        amount,
        requiredCollateralBps: 500n, // 5% input, floor bumps to 20%
      },
    );

    expect(result.transactions).toHaveTransaction({
      from: sender.address,
      to: escrow.address,
      success: true,
    });
  });

  it("should return MIN_COLLATERAL_BPS as 2000", async () => {
    const min = await escrow.getGetMinCollateralBps();
    expect(min).toBe(2000n);
  });

  it("should allow owner to pause and unpause contract", async () => {
    // Initially not paused
    expect(await escrow.getIsPausedState()).toBe(false);

    // Pause
    await escrow.send(owner.getSender(), { value: toNano("0.05") }, { $$type: "Pause" });
    expect(await escrow.getIsPausedState()).toBe(true);

    // Paused contract should reject settlement
    const blockedResult = await escrow.send(
      sender.getSender(),
      { value: toNano("3") },
      {
        $$type: "InitiateSettlement",
        recipient: recipient.address,
        amount: toNano("2"),
        requiredCollateralBps: 10000n,
      },
    );
    expect(blockedResult.transactions).toHaveTransaction({
      from: sender.address,
      to: escrow.address,
      success: false,
    });

    // Unpause
    await escrow.send(owner.getSender(), { value: toNano("0.05") }, { $$type: "Unpause" });
    expect(await escrow.getIsPausedState()).toBe(false);
  });
});
