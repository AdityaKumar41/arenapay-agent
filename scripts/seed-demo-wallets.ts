#!/usr/bin/env tsx
/**
 * Demo Seed Script
 *
 * Seeds 3 demo wallets via the Oracle and API to demonstrate
 * all 3 key tiers: Elite, Basic, and Malicious (blocked).
 *
 * Usage: npx tsx scripts/seed-demo-wallets.ts
 *
 * Requires: Oracle (port 8000) and API (port 3000) to be running.
 */

const ORACLE_URL = process.env.ORACLE_URL || "http://localhost:8000";
const API_URL = process.env.API_URL || "http://localhost:3000";

// Demo wallets — use well-known testnet addresses
const DEMO_WALLETS = {
  elite: {
    address: "EQA__________ELITE_DEMO_WALLET_TESTNET_001__________AA",
    label: "Elite Trader",
    expectedTier: "elite",
    description: "High-reputation wallet with 20% collateral, 50% fee discount",
  },
  basic: {
    address: "EQB__________BASIC_DEMO_WALLET_TESTNET_002__________BB",
    label: "New User",
    expectedTier: "basic",
    description: "Low-reputation wallet with 150% collateral, no discount",
  },
  malicious: {
    address: "EQC__________MALICIOUS_DEMO_WALLET_TESTNET_003______CC",
    label: "Flagged Wallet",
    expectedTier: "untrusted",
    description: "Known malicious wallet — transactions will be blocked",
  },
};

async function seedWallet(name: string, wallet: typeof DEMO_WALLETS.elite) {
  console.log(`\n--- Seeding ${name}: ${wallet.label} ---`);
  console.log(`  Address: ${wallet.address}`);

  // 1. Compute score via Oracle
  try {
    const scoreRes = await fetch(`${ORACLE_URL}/score/compute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: wallet.address }),
    });
    const scoreData = await scoreRes.json();
    console.log(`  Oracle Score: ${scoreData.score} (Tier: ${scoreData.tier})`);
  } catch (err) {
    console.log(
      `  Oracle: skipped (${err instanceof Error ? err.message : "not running"})`,
    );
  }

  // 2. Register with API to populate DB
  try {
    const apiRes = await fetch(
      `${API_URL}/api/v1/reputation/${wallet.address}`,
    );
    const apiData = await apiRes.json();
    console.log(`  API Score: ${apiData.score} (Tier: ${apiData.tier})`);
    console.log(
      `  Collateral: ${apiData.collateralRequiredBps} bps, Fee Discount: ${apiData.feeDiscountPct}%`,
    );
  } catch (err) {
    console.log(
      `  API: skipped (${err instanceof Error ? err.message : "not running"})`,
    );
  }

  // 3. Run threat check for malicious wallet
  if (name === "malicious") {
    try {
      const threatRes = await fetch(`${ORACLE_URL}/threat/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_address: wallet.address,
          recipient_address: DEMO_WALLETS.elite.address,
          amount_nanoton: 5_000_000_000, // 5 TON
        }),
      });
      const threatData = await threatRes.json();
      console.log(
        `  Threat Check: risk=${threatData.risk_score}, action=${threatData.action}`,
      );
      console.log(`  Flags: ${threatData.flags.join(", ") || "none"}`);
    } catch (err) {
      console.log(
        `  Threat: skipped (${err instanceof Error ? err.message : "not running"})`,
      );
    }
  }

  console.log(`  -> ${wallet.description}`);
}

async function main() {
  console.log("=== arenapay Demo Wallet Seeder ===\n");
  console.log(`Oracle: ${ORACLE_URL}`);
  console.log(`API:    ${API_URL}`);

  // Health check
  try {
    const healthRes = await fetch(`${ORACLE_URL}/health`);
    const health = await healthRes.json();
    console.log(`\nOracle health: ${health.status}`);
  } catch {
    console.log(
      "\nWarning: Oracle is not running. Scores will use API fallback.",
    );
  }

  for (const [name, wallet] of Object.entries(DEMO_WALLETS)) {
    await seedWallet(name, wallet);
  }

  console.log("\n=== Demo wallets seeded! ===");
  console.log("\nDemo flow:");
  console.log(
    "  1. Connect with Elite wallet  -> see high score (85+), low collateral",
  );
  console.log(
    "  2. Connect with Basic wallet  -> see low score (35), high collateral",
  );
  console.log(
    "  3. Send payment from Malicious wallet -> transaction gets BLOCKED",
  );
  console.log("  4. Show real-time score update via WebSocket");
  console.log("  5. Show threat detection alert on Security screen");
}

main().catch(console.error);
