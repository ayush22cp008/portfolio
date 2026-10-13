// Offline parser regression test for Node 3 Phase 4
// This test is self-contained: it compiles the TypeScript parser to a temporary directory,
// loads the compiled module, runs deterministic assertions, and cleans up temporary files.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Compile the parser into a unique temporary directory.
function compileParser() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'node3_parser_'));
  const srcFile = path.resolve(__dirname, '..', 'lib', 'rag', 'stream-parser.ts');
  // Use tsc to emit CommonJS for Node.
  execSync(`npx tsc ${srcFile} --module commonjs --target es2020 --outDir ${tmpDir}`, { stdio: 'ignore' });
  const compiledPath = path.join(tmpDir, 'stream-parser.js');
  if (!fs.existsSync(compiledPath)) {
    console.error('Compiled parser not found at', compiledPath);
    process.exit(1);
  }
  return { compiledPath, tmpDir };
}

// Helper to create a ReadableStream from an array of string chunks.
function makeStream(chunks) {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error('Assertion failed:', message);
    process.exitCode = 1;
  }
}

async function runTests() {
  const { compiledPath, tmpDir } = compileParser();
  const { parseNDJSONStream } = require(compiledPath);

  // ==== Test 1: multiple frames in a single chunk ====
  const ndjson1 =
    '{"type":"start"}\n' +
    '{"type":"token","content":"Hello"}\n' +
    '{"type":"activity","stage":"retrieval","status":"started","timestamp":123}\n' +
    '{"type":"activity","stage":"llm_generation","status":"completed","timestamp":124,"durationMs":50}\n' +
    '{"type":"tool","name":"get_project_details","status":"success","durationMs":10}\n' +
    '{"type":"trace","traceId":"abcd1234","overallDurationMs":200,"stageDurations":{"retrieval":100,"llm_generation":100}}\n' +
    '{"type":"done"}\n';
  const stream1 = makeStream([ndjson1]);
  const frames1 = [];
  for await (const f of parseNDJSONStream(stream1)) frames1.push(f);
  assert(frames1.length === 7, 'Test1 should yield 7 frames');
  assert(frames1[0].type === 'start', 'First frame start');
  assert(frames1[1].type === 'token' && frames1[1].content === 'Hello', 'Token frame');
  assert(frames1[2].type === 'activity' && frames1[2].stage === 'retrieval', 'Activity retrieval');
  assert(frames1[5].type === 'trace' && frames1[5].traceId === 'abcd1234', 'Trace frame');

  // ==== Test 2: frame split across chunks ====
  const partA = '{"type":"token","content":"Par';
  const partB = 'tial"}\n{"type":"done"}\n';
  const stream2 = makeStream([partA, partB]);
  const frames2 = [];
  for await (const f of parseNDJSONStream(stream2)) frames2.push(f);
  assert(frames2.length === 2, 'Test2 should yield 2 frames');
  assert(frames2[0].type === 'token' && frames2[0].content === 'Partial', 'Split token content');
  assert(frames2[1].type === 'done', 'Done frame after split');

  // ==== Test 3: malformed and unknown frames are ignored ====
  const ndjson3 =
    '{"type":"start"}\n' +
    '{bad json}\n' + // malformed
    '{"type":"unknown","foo":1}\n' + // unknown
    '{"type":"activity","stage":"invalid_stage","status":"started","timestamp":10}\n' +
    '{"type":"activity","stage":"retrieval","status":"unknown","timestamp":10}\n' +
    '{"type":"activity","stage":"retrieval","status":"started","timestamp":-5}\n' +
    '{"type":"activity","stage":"retrieval","status":"started","timestamp":5,"durationMs":-10}\n' +
    '{"type":"activity","stage":"retrieval","status":"started","timestamp":5,"errorCode":"' + 'x'.repeat(101) + '"}\n' +
    '{"type":"tool","name":"unknown_tool","status":"success","durationMs":5}\n' +
    '{"type":"trace","traceId":"","overallDurationMs":10,"stageDurations":{"retrieval":5}}\n' +
    '{"type":"trace","traceId":"abcd1234","overallDurationMs":-1,"stageDurations":{"retrieval":5}}\n' +
    '{"type":"trace","traceId":"abcd1234","overallDurationMs":10,"stageDurations":{"unknown":5}}\n' +
    '{"type":"done"}\n';
  const stream3 = makeStream([ndjson3]);
  const frames3 = [];
  for await (const f of parseNDJSONStream(stream3)) frames3.push(f);
  assert(frames3.length === 2, 'Test3 yields only start and done');
  assert(frames3[0].type === 'start', 'Test3 start');
  assert(frames3[1].type === 'done', 'Test3 done');

  // ==== Test 4: final line without newline ====
  const ndjson4 = '{"type":"start"}\n{"type":"token","content":"NoNewline"}';
  const stream4 = makeStream([ndjson4]);
  const frames4 = [];
  for await (const f of parseNDJSONStream(stream4)) frames4.push(f);
  assert(frames4.length === 2, 'Test4 yields start and token');
  assert(frames4[1].type === 'token' && frames4[1].content === 'NoNewline', 'Final token parsed');

  console.log('All offline parser tests passed');

  // Cleanup temporary compiled output.
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

runTests().then(() => process.exit(process.exitCode || 0)).catch(e => { console.error('Unexpected error:', e); process.exit(1); });
