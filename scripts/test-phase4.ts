/**
 * Phase 4 smoke test — validates module structure and wire format logic
 * without making live network calls.
 *
 * Run with: npx tsx scripts/test-phase4.ts
 *
 * Tests:
 *   1. `createAskStream` is exported from lib/rag/ask-stream.ts
 *   2. `generateAnswer` and `buildSourceMeta` are exported from lib/rag/llm.ts
 *   3. route.ts exists and exports POST, maxDuration, dynamic
 *   4. { message } → { question } body normalisation logic (pure unit test)
 *   5. `encodeFrame` wire format produces correct NDJSON lines
 */

import { readFileSync } from "fs";
import { resolve } from "path";

let passed = 0;
let failed = 0;

function ok(label: string): void {
  console.log(`  ✓ ${label}`);
  passed++;
}

function fail(label: string, reason?: string): void {
  console.error(`  ✗ ${label}${reason ? ": " + reason : ""}`);
  failed++;
}

function assertContains(source: string, substring: string, label: string): void {
  if (source.includes(substring)) ok(label);
  else fail(label, `"${substring}" not found in source`);
}

// ---------------------------------------------------------------------------
// Test 1: ask-stream.ts exports
// ---------------------------------------------------------------------------
console.log("\n[1] ask-stream.ts — exports check");

const askStreamSrc = readFileSync(
  resolve("lib/rag/ask-stream.ts"),
  "utf-8"
);
assertContains(askStreamSrc, "export function createAskStream", "exports createAskStream");
assertContains(askStreamSrc, 'type: "start"', 'emits start frame');
assertContains(askStreamSrc, 'type: "token"', 'emits token frame');
assertContains(askStreamSrc, 'type: "sources"', 'emits sources frame');
assertContains(askStreamSrc, 'type: "done"', 'emits done frame');
assertContains(askStreamSrc, 'type: "error"', 'emits error frame');

// ---------------------------------------------------------------------------
// Test 2: llm.ts exports
// ---------------------------------------------------------------------------
console.log("\n[2] llm.ts — exports check");

const llmSrc = readFileSync(resolve("lib/rag/llm.ts"), "utf-8");
assertContains(llmSrc, "export async function generateAnswer", "exports generateAnswer");
assertContains(llmSrc, "export function buildSourceMeta", "exports buildSourceMeta");
assertContains(llmSrc, "export interface SourceMeta", "exports SourceMeta interface");
assertContains(llmSrc, "traceId?", "generateAnswer accepts optional traceId");
assertContains(llmSrc, "GROQ_API_KEY", "references GROQ_API_KEY env var");
if (!llmSrc.includes("process.env.NEXT_PUBLIC_")) ok("does NOT access process.env.NEXT_PUBLIC_ (secrets are server-only)");
else fail("does NOT access process.env.NEXT_PUBLIC_ (secrets are server-only)", "process.env.NEXT_PUBLIC_ found in llm.ts");

// ---------------------------------------------------------------------------
// Test 3: route.ts — exports and key patterns
// ---------------------------------------------------------------------------
console.log("\n[3] app/api/ask/route.ts — structure check");

const routeSrc = readFileSync(resolve("app/api/ask/route.ts"), "utf-8");
assertContains(routeSrc, 'export async function POST', 'exports POST handler');
assertContains(routeSrc, 'export const maxDuration', 'exports maxDuration (route duration config)');
assertContains(routeSrc, 'export const dynamic', 'exports dynamic = "force-dynamic"');
assertContains(routeSrc, 'import "server-only"', 'imports server-only guard');
assertContains(routeSrc, 'createAskStream', 'calls createAskStream');
assertContains(routeSrc, 'x-forwarded-for', 'reads x-forwarded-for for IP extraction');
assertContains(routeSrc, 'x-trace-id', 'reads x-trace-id for future Node 3 tracing');
assertContains(routeSrc, '"message"', 'accepts {message} input');
assertContains(routeSrc, '"question"', 'normalises to {question}');
assertContains(routeSrc, 'application/x-ndjson', 'sets NDJSON Content-Type');
assertContains(routeSrc, 'no-store', 'sets Cache-Control: no-store');

// ---------------------------------------------------------------------------
// Test 4: { message } → { question } normalisation (pure logic)
// ---------------------------------------------------------------------------
console.log("\n[4] Body normalisation — { message } → { question }");

function normaliseBody(body: unknown): unknown {
  if (
    body !== null &&
    typeof body === "object" &&
    "message" in (body as object) &&
    !("question" in (body as object))
  ) {
    return { question: (body as Record<string, unknown>).message };
  }
  return body;
}

const testCases: Array<{ input: unknown; expectQuestion: boolean; label: string }> = [
  { input: { message: "Hello" }, expectQuestion: true, label: '{ message } → { question }' },
  { input: { question: "Hello" }, expectQuestion: true, label: '{ question } passthrough' },
  { input: { message: "Hi", question: "X" }, expectQuestion: true, label: '{ message+question } passthrough' },
  { input: null, expectQuestion: false, label: 'null passthrough' },
  { input: "string", expectQuestion: false, label: 'string passthrough' },
];

for (const tc of testCases) {
  const out = normaliseBody(tc.input);
  const hasQuestion =
    out !== null && typeof out === "object" && "question" in (out as object);
  if (hasQuestion === tc.expectQuestion) ok(tc.label);
  else fail(tc.label, `expected hasQuestion=${tc.expectQuestion}, got ${hasQuestion}`);
}

// ---------------------------------------------------------------------------
// Test 5: NDJSON wire format — frame encoding
// ---------------------------------------------------------------------------
console.log("\n[5] Wire format — NDJSON frame encoding");

type StreamFrame =
  | { type: "start" }
  | { type: "token"; content: string }
  | { type: "sources"; sources: unknown[] }
  | { type: "done" }
  | { type: "error"; message: string };

function encodeFrame(frame: StreamFrame): string {
  return JSON.stringify(frame) + "\n";
}

const startFrame = encodeFrame({ type: "start" });
const tokenFrame = encodeFrame({ type: "token", content: "Hello" });
const sourcesFrame = encodeFrame({ type: "sources", sources: [{ chunk_index: 0, section: "intro", similarity: 0.87 }] });
const doneFrame = encodeFrame({ type: "done" });
const errorFrame = encodeFrame({ type: "error", message: "Rate limited" });

// Each frame must end with \n
[startFrame, tokenFrame, sourcesFrame, doneFrame, errorFrame].forEach((f, i) => {
  if (f.endsWith("\n")) ok(`frame[${i}] ends with newline`);
  else fail(`frame[${i}] ends with newline`);
});

// Parse each frame as valid JSON
[startFrame, tokenFrame, sourcesFrame, doneFrame, errorFrame].forEach((f, i) => {
  try {
    JSON.parse(f.trim());
    ok(`frame[${i}] is valid JSON`);
  } catch {
    fail(`frame[${i}] is valid JSON`);
  }
});

// Type field check
const parsed = JSON.parse(startFrame.trim());
if (parsed.type === "start") ok("start frame has correct type");
else fail("start frame has correct type");

const parsedToken = JSON.parse(tokenFrame.trim());
if (parsedToken.type === "token" && parsedToken.content === "Hello")
  ok("token frame has correct type and content");
else fail("token frame has correct type and content");

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n========================================`);
console.log(`Phase 4 smoke test: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);
process.exit(failed > 0 ? 1 : 0);
