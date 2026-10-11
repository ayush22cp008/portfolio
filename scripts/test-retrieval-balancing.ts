/**
 * Deterministic Retrieval Balancing Tests
 *
 * Validates cross-project retrieval balancing and confirms preservation of
 * project-specific, methodology-authority, and out-of-scope behaviors.
 *
 * Run with: npx tsx --env-file=.env.local scripts/test-retrieval-balancing.ts
 */

import { retrieve, balanceCrossProjectCandidates } from "../lib/rag/retrieval";
import { makeQueryDecision } from "../lib/rag/decision";
import { ScopeError } from "../lib/rag/types";
import { RAG_CONFIG } from "../lib/rag/config";
import { embedQuery } from "../lib/rag/embedding";
import type { MatchedChunk } from "../lib/rag/types";

let passed = 0;
let failed = 0;

let testIpCounter = 100;
function getUniqueTestIp(): string {
  testIpCounter++;
  return `10.0.${Math.floor(testIpCounter / 256)}.${testIpCounter % 256}`;
}

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function makeMockChunk(id: string, project: string, similarity: number): MatchedChunk {
  return {
    id,
    source_id: `source-${project}`,
    chunk_index: 0,
    section: "Overview",
    content: `Content for ${project} (${id})`,
    metadata: { project },
    similarity,
  };
}

// ---------------------------------------------------------------------------
// Unit Tests: balanceCrossProjectCandidates deterministic algorithm
// ---------------------------------------------------------------------------

function testUnitBalancingAlgorithm(): void {
  console.log("\n=== Unit Tests: balanceCrossProjectCandidates ===");

  // 1. Filter out unrelated projects (e.g. Profile)
  const mockCandidates: MatchedChunk[] = [
    makeMockChunk("tf-1", "TableFlow", 0.90),
    makeMockChunk("tf-2", "TableFlow", 0.88),
    makeMockChunk("prof-1", "Profile", 0.87),
    makeMockChunk("zeni-1", "ZENI", 0.85),
    makeMockChunk("zeni-2", "ZENI", 0.84),
    makeMockChunk("prof-2", "Profile", 0.82),
  ];

  const filtered = balanceCrossProjectCandidates(mockCandidates, ["ZENI", "TableFlow"], 4);
  assert(
    filtered.every((c) => (c.metadata as any)?.project !== "Profile"),
    "Never introduces unrelated project (Profile excluded)"
  );
  assert(
    filtered.length === 4,
    "Returns exact requested limit"
  );
  assert(
    filtered[0].id === "tf-1" && filtered[1].id === "zeni-1" && filtered[2].id === "tf-2" && filtered[3].id === "zeni-2",
    "Alternates round-robin up to quota"
  );

  // 2. Three-project quota and remainder fill
  const threeProjectPool: MatchedChunk[] = [
    makeMockChunk("tf-1", "TableFlow", 0.95),
    makeMockChunk("tf-2", "TableFlow", 0.94),
    makeMockChunk("tf-3", "TableFlow", 0.93),
    makeMockChunk("tf-4", "TableFlow", 0.92),
    makeMockChunk("zeni-1", "ZENI", 0.85),
    makeMockChunk("zeni-2", "ZENI", 0.84),
    makeMockChunk("zeni-3", "ZENI", 0.83),
    makeMockChunk("dp-1", "DeliveryProof", 0.80),
    makeMockChunk("dp-2", "DeliveryProof", 0.79),
    makeMockChunk("dp-3", "DeliveryProof", 0.78),
  ];

  const threeBalanced = balanceCrossProjectCandidates(
    threeProjectPool,
    ["ZENI", "TableFlow", "DeliveryProof"],
    10
  );
  const counts: Record<string, number> = {};
  for (const c of threeBalanced) {
    const p = (c.metadata as any).project;
    counts[p] = (counts[p] || 0) + 1;
  }
  assert(counts["TableFlow"] === 4, "TableFlow gets 3 quota + 1 highest similarity fill = 4");
  assert(counts["ZENI"] === 3, "ZENI gets 3 quota");
  assert(counts["DeliveryProof"] === 3, "DeliveryProof gets 3 quota");
}

// ---------------------------------------------------------------------------
// Live Retrieval Tests (All 7 Required Queries)
// ---------------------------------------------------------------------------

async function testLiveRetrievalRequirements(): Promise<void> {
  console.log("\n=== Live Retrieval Tests (Required Queries) ===");

  // 1. Two-project: "Compare ZENI and TableFlow."
  console.log("\n[Test 1] Compare ZENI and TableFlow.");
  {
    const res = await retrieve({ question: "Compare ZENI and TableFlow." }, getUniqueTestIp());
    const counts: Record<string, number> = {};
    for (const [idx, c] of res.chunks.entries()) {
      const p = (c.metadata as any)?.project;
      counts[p] = (counts[p] || 0) + 1;
      console.log(`    #${idx+1}: [${p}] sim=${c.similarity.toFixed(4)} sec=${c.section}`);
    }
    console.log("  Counts:", counts);
    assert(counts["ZENI"] > 0 && counts["TableFlow"] > 0, "Both ZENI and TableFlow represented");
    assert(counts["TableFlow"] === 5 && counts["ZENI"] === 5, "Neither dominates: exactly balanced 5 / 5");
    assert(!counts["Profile"], "No unrelated projects present");
  }

  // 2. Two-project: "Compare TableFlow and DeliveryProof."
  console.log("\n[Test 2] Compare TableFlow and DeliveryProof.");
  {
    const res = await retrieve({ question: "Compare TableFlow and DeliveryProof." }, getUniqueTestIp());
    const counts: Record<string, number> = {};
    for (const c of res.chunks) {
      const p = (c.metadata as any)?.project;
      counts[p] = (counts[p] || 0) + 1;
    }
    console.log("  Counts:", counts);
    assert(counts["TableFlow"] > 0 && counts["DeliveryProof"] > 0, "Both TableFlow and DeliveryProof represented");
    assert(counts["TableFlow"] === 5 && counts["DeliveryProof"] === 5, "Both represented meaningfully: 5 / 5");
    assert(!counts["Profile"], "No unrelated projects present");
  }

  // 3. Three-project: "Compare ZENI, TableFlow, and DeliveryProof."
  console.log("\n[Test 3] Compare ZENI, TableFlow, and DeliveryProof.");
  {
    const res = await retrieve({ question: "Compare ZENI, TableFlow, and DeliveryProof." }, getUniqueTestIp());
    const counts: Record<string, number> = {};
    for (const c of res.chunks) {
      const p = (c.metadata as any)?.project;
      counts[p] = (counts[p] || 0) + 1;
    }
    console.log("  Counts:", counts);
    assert(counts["ZENI"] > 0, "ZENI represented");
    assert(counts["TableFlow"] > 0, "TableFlow represented");
    assert(counts["DeliveryProof"] > 0, "DeliveryProof represented");
    assert(
      Object.keys(counts).every((p) => ["ZENI", "TableFlow", "DeliveryProof"].includes(p)),
      "No unrelated project introduced"
    );
    assert(counts["TableFlow"] <= 5, "No project dominates all/most of top-10");
  }

  // 4. Project-specific ZENI: "How does ZENI work?"
  console.log("\n[Test 4] Project-specific ZENI: How does ZENI work?");
  {
    const res = await retrieve({ question: "How does ZENI work?" }, getUniqueTestIp());
    const counts: Record<string, number> = {};
    for (const c of res.chunks) {
      const p = (c.metadata as any)?.project;
      counts[p] = (counts[p] || 0) + 1;
    }
    console.log("  Counts:", counts);
    assert(counts["ZENI"] === 10, "Existing project-specific ZENI behavior preserved (10/10 ZENI)");
  }

  // 5. Project-specific TableFlow: "What technologies does Ayush use in TableFlow?"
  console.log("\n[Test 5] Project-specific TableFlow: What technologies does Ayush use in TableFlow?");
  {
    const res = await retrieve({ question: "What technologies does Ayush use in TableFlow?" }, getUniqueTestIp());
    const counts: Record<string, number> = {};
    for (const c of res.chunks) {
      const p = (c.metadata as any)?.project;
      counts[p] = (counts[p] || 0) + 1;
    }
    console.log("  Counts:", counts);
    assert(counts["TableFlow"] === 10, "Existing project-specific TableFlow behavior preserved (10/10 TableFlow)");
  }

  // 6. Methodology: "How does Ayush approach building with AI agents?"
  console.log("\n[Test 6] Methodology: How does Ayush approach building with AI agents?");
  {
    const decision = makeQueryDecision("How does Ayush approach building with AI agents?");
    assert(decision.retrievalPolicy === "methodology", "Routed as methodology policy");
    const res = await retrieve({ question: "How does Ayush approach building with AI agents?" }, getUniqueTestIp());
    const counts: Record<string, number> = {};
    for (const c of res.chunks) {
      const p = (c.metadata as any)?.project;
      counts[p] = (counts[p] || 0) + 1;
    }
    console.log("  Counts:", counts);
    assert((counts["Profile"] ?? 0) >= 6, "Canonical Profile chunks dominant in methodology retrieval");
    assert(
      (counts["TableFlow"] ?? 0) + (counts["DeliveryProof"] ?? 0) > 0,
      "Tier 1 project methodology chunks (TableFlow / DeliveryProof) represented"
    );
  }

  // 7. Out-of-scope: "What is the capital of France?"
  console.log("\n[Test 7] Out-of-scope: What is the capital of France?");
  {
    let threwScopeError = false;
    try {
      await retrieve({ question: "What is the capital of France?" }, getUniqueTestIp());
    } catch (err: any) {
      if (err instanceof ScopeError) {
        threwScopeError = true;
      }
    }
    assert(threwScopeError, "ScopeError thrown for out-of-scope query");
  }
}

async function main(): Promise<void> {
  testUnitBalancingAlgorithm();
  await testLiveRetrievalRequirements();

  console.log(`\n==================================================`);
  console.log(`Total: ${passed} passed, ${failed} failed`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
