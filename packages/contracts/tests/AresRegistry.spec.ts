import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { toNano, Address } from "@ton/core";
import { AresRegistry } from "../build/AresRegistry/tact_AresRegistry";
import "@ton/test-utils";

describe("AresRegistry", () => {
  let blockchain: Blockchain;
  let owner: SandboxContract<TreasuryContract>;
  let oracle: SandboxContract<TreasuryContract>;
  let registry: SandboxContract<AresRegistry>;
  let user: SandboxContract<TreasuryContract>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    owner = await blockchain.treasury("owner");
    oracle = await blockchain.treasury("oracle");
    user = await blockchain.treasury("user");

    registry = blockchain.openContract(
      await AresRegistry.fromInit(oracle.address),
    );

    // Deploy
    const deployResult = await registry.send(
      owner.getSender(),
      { value: toNano("0.5") },
      { $$type: "Deploy", queryId: 0n },
    );

    expect(deployResult.transactions).toHaveTransaction({
      from: owner.address,
      to: registry.address,
      deploy: true,
      success: true,
    });
  });

  it("should deploy with correct oracle address", async () => {
    const oracleAddr = await registry.getGetOracleAddress();
    expect(oracleAddr.equals(oracle.address)).toBe(true);
  });

  it("should allow oracle to update score", async () => {
    const result = await registry.send(
      oracle.getSender(),
      { value: toNano("0.05") },
      {
        $$type: "UpdateScore",
        wallet: user.address,
        score: 75n,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
      },
    );

    expect(result.transactions).toHaveTransaction({
      from: oracle.address,
      to: registry.address,
      success: true,
    });

    const score = await registry.getGetScore(user.address);
    expect(score).toBe(75n);
  });

  it("should reject score update from non-oracle", async () => {
    const result = await registry.send(
      user.getSender(),
      { value: toNano("0.05") },
      {
        $$type: "UpdateScore",
        wallet: user.address,
        score: 90n,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
      },
    );

    expect(result.transactions).toHaveTransaction({
      from: user.address,
      to: registry.address,
      success: false,
    });
  });

  it("should overwrite score on second update", async () => {
    const ts = BigInt(Math.floor(Date.now() / 1000));

    await registry.send(
      oracle.getSender(),
      { value: toNano("0.05") },
      {
        $$type: "UpdateScore",
        wallet: user.address,
        score: 50n,
        timestamp: ts,
      },
    );

    let score = await registry.getGetScore(user.address);
    expect(score).toBe(50n);

    await registry.send(
      oracle.getSender(),
      { value: toNano("0.05") },
      {
        $$type: "UpdateScore",
        wallet: user.address,
        score: 85n,
        timestamp: ts + 1n,
      },
    );

    score = await registry.getGetScore(user.address);
    expect(score).toBe(85n);

    // Check full reputation has accumulated transaction count
    const rep = await registry.getGetFullReputation(user.address);
    expect(rep).not.toBeNull();
    expect(rep!.totalTransactions).toBe(2n);
  });

  it("should return 0 for unknown wallet", async () => {
    const unknown = await blockchain.treasury("unknown");
    const score = await registry.getGetScore(unknown.address);
    expect(score).toBe(0n);
  });

  it("should reject stale timestamp (> 1 hour old)", async () => {
    const staleTs = BigInt(Math.floor(Date.now() / 1000)) - 7200n; // 2 hours ago

    const result = await registry.send(
      oracle.getSender(),
      { value: toNano("0.05") },
      {
        $$type: "UpdateScore",
        wallet: user.address,
        score: 60n,
        timestamp: staleTs,
      },
    );

    expect(result.transactions).toHaveTransaction({
      from: oracle.address,
      to: registry.address,
      success: false,
    });
  });

  it("should reject future timestamp (> 60s ahead)", async () => {
    const futureTs = BigInt(Math.floor(Date.now() / 1000)) + 300n; // 5 min in future

    const result = await registry.send(
      oracle.getSender(),
      { value: toNano("0.05") },
      {
        $$type: "UpdateScore",
        wallet: user.address,
        score: 60n,
        timestamp: futureTs,
      },
    );

    expect(result.transactions).toHaveTransaction({
      from: oracle.address,
      to: registry.address,
      success: false,
    });
  });

  it("should allow owner to change oracle address", async () => {
    const newOracle = await blockchain.treasury("newOracle");

    await registry.send(
      owner.getSender(),
      { value: toNano("0.05") },
      { $$type: "ChangeOracle", newOracle: newOracle.address },
    );

    const addr = await registry.getGetOracleAddress();
    expect(addr.equals(newOracle.address)).toBe(true);
  });
});
