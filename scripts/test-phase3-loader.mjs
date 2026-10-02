/**
 * Test loader — loads .env.local before running Phase 3 tests.
 * Run with: node scripts/test-phase3-loader.mjs
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
try {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
  console.log("Loaded .env.local");
} catch (err) {
  console.error("Warning: Could not load .env.local:", err.message);
}

// Set unique rate-limit keys for this test run to isolate
// rate-limit state from previous runs. This does NOT weaken the rate
// limiter — it simply uses different keys for testing purposes.
const runId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
process.env.RATE_LIMIT_KEY = `__test_ip_${runId}`;
process.env.RATE_LIMIT_GLOBAL_KEY = `__global_test_${runId}`;

// Dynamically import the test script
await import("./test-phase3.ts");
