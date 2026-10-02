/**
 * Portfolio RAG Ingestion Pipeline — scripts/ingest-rag.ts
 *
 * Ingests approved corpus files into Neon PostgreSQL (pgvector).
 *
 * Chunking design (token-aware, master handoff compliant):
 *   - Uses the SAME Xenova/gte-small tokenizer as the embedding model.
 *   - Target chunk size : 350 tokens
 *   - Hard maximum      : 450 tokens  (enforced with post-check safety net)
 *   - Overlap           : 60 tokens   (applied only when a section must be split)
 *   - Short sections are packed together (greedy, up to TARGET budget).
 *   - Overlap is NOT applied across unrelated sections.
 *   - Every chunk is verified ≤ MAX_TOKENS before insertion.
 *
 * Idempotency:
 *   - rag_sources uses ON CONFLICT DO UPDATE on source_path.
 *   - rag_chunks are deleted and re-inserted per source on every run.
 *   - Running twice produces identical source/chunk counts.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pipeline, AutoTokenizer } from '@huggingface/transformers';
import { sql } from '../lib/rag/db';

const MANIFEST_PATH = path.join(process.cwd(), 'corpus', 'manifest.json');

// ---------------------------------------------------------------------------
// Token budget — exact token counts, NOT character proxies
// ---------------------------------------------------------------------------
const TARGET_TOKENS = 350;                        // aim for ~350 tokens per chunk
const MAX_TOKENS    = 450;                        // hard ceiling — never exceeded
const OVERLAP_TOKENS = 60;                        // overlap when splitting one section
const STEP_TOKENS   = TARGET_TOKENS - OVERLAP_TOKENS; // 290 — advance per window

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ManifestRecord {
  id: string;
  project: string;
  local_path: string;
  original_repository: string;
  original_source_path: string;
  source_type: string;
  git_commit: string;
  content_hash: string;
  size_bytes: number;
}

interface ParsedSection {
  heading: string;   // heading text ('' for pre-heading preamble)
  level: number;     // heading depth (0 = no heading)
  content: string;   // full text of this section, including the heading line
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// ---------------------------------------------------------------------------
// Step 1 — Parse markdown into logical sections
// ---------------------------------------------------------------------------

function parseSections(text: string): ParsedSection[] {
  const lines = text.split('\n');
  const sections: ParsedSection[] = [];
  let heading = '';
  let level = 0;
  let buf: string[] = [];

  function flush() {
    const content = buf.join('\n').trim();
    if (content.length > 0) {
      sections.push({ heading, level, content });
    }
  }

  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+)$/);
    if (m) {
      flush();
      heading = m[2].trim();
      level   = m[1].length;
      buf     = [line];
    } else {
      buf.push(line);
    }
  }
  flush();
  return sections;
}

// ---------------------------------------------------------------------------
// Step 2 — Token-windowed split for oversized sections
// ---------------------------------------------------------------------------
// Produces chunks with exactly OVERLAP_TOKENS of token overlap between
// consecutive windows.  Every produced chunk is guaranteed ≤ TARGET_TOKENS.

function splitSectionByTokens(
  content: string,
  heading: string,
  tokenizer: { encode: (t: string) => number[]; decode: (ids: number[], opts?: Record<string, unknown>) => string }
): { section: string; text: string }[] {
  const ids = tokenizer.encode(content);

  // Fast path: fits in a single chunk
  if (ids.length <= TARGET_TOKENS) {
    return [{ section: heading, text: content.trim() }];
  }

  const result: { section: string; text: string }[] = [];
  let start = 0;

  while (start < ids.length) {
    const end = Math.min(start + TARGET_TOKENS, ids.length);
    const windowIds = ids.slice(start, end);
    const windowText = tokenizer.decode(windowIds, { skip_special_tokens: true }).trim();

    if (windowText.length > 0) {
      result.push({ section: heading, text: windowText });
    }

    if (end >= ids.length) break;
    start += STEP_TOKENS; // advance by (TARGET - OVERLAP) for next window
  }

  return result;
}

// ---------------------------------------------------------------------------
// Step 3 — Build chunks from sections (greedy packing + split on overflow)
// ---------------------------------------------------------------------------

function buildChunks(
  sections: ParsedSection[],
  tokenizer: { encode: (t: string) => number[]; decode: (ids: number[], opts?: Record<string, unknown>) => string }
): { section: string; text: string }[] {
  const rawChunks: { section: string; text: string }[] = [];

  // Rolling buffer: accumulates short sections up to TARGET budget
  let bufText    = '';
  let bufTokens  = 0;
  let bufHeading = 'General';

  function flushBuffer() {
    const t = bufText.trim();
    if (t.length === 0) return;
    rawChunks.push({ section: bufHeading, text: t });
    bufText    = '';
    bufTokens  = 0;
    bufHeading = 'General';
  }

  for (const section of sections) {
    const sTokens = tokenizer.encode(section.content).length;
    const label   = section.heading || 'General';

    if (sTokens > TARGET_TOKENS) {
      // Section is too large for one chunk — must split.
      // Flush whatever is buffered first (unrelated content).
      flushBuffer();
      const splits = splitSectionByTokens(section.content, label, tokenizer);
      rawChunks.push(...splits);
    } else if (bufTokens + sTokens <= TARGET_TOKENS) {
      // Section fits in the current buffer — pack it in.
      if (bufText.length > 0) bufText += '\n\n';
      bufText   += section.content;
      bufTokens += sTokens;
      // Use the first packed section's heading as the buffer label
      if (bufHeading === 'General' && section.heading) bufHeading = label;
    } else {
      // Adding this section would exceed the target — flush and start fresh.
      flushBuffer();
      bufText    = section.content;
      bufTokens  = sTokens;
      bufHeading = label;
    }
  }

  flushBuffer();

  // ---------------------------------------------------------------------------
  // Step 4 — Safety net: enforce MAX_TOKENS hard ceiling on every chunk
  // ---------------------------------------------------------------------------
  // In normal flow rawChunks should all be ≤ TARGET_TOKENS.
  // This handles edge cases (e.g. tokenizer token-count differences when
  // concatenating packed sections vs. counting them individually).

  const safeChunks: { section: string; text: string }[] = [];

  for (const chunk of rawChunks) {
    const t = tokenizer.encode(chunk.text).length;
    if (t <= MAX_TOKENS) {
      safeChunks.push(chunk);
    } else {
      // Force-split at MAX_TOKENS with OVERLAP_TOKENS overlap
      const ids   = tokenizer.encode(chunk.text);
      let start   = 0;
      while (start < ids.length) {
        const end  = Math.min(start + MAX_TOKENS, ids.length);
        const text = tokenizer.decode(ids.slice(start, end), { skip_special_tokens: true }).trim();
        if (text.length > 0) safeChunks.push({ section: chunk.section, text });
        if (end >= ids.length) break;
        start += (MAX_TOKENS - OVERLAP_TOKENS);
      }
    }
  }

  return safeChunks;
}

// ---------------------------------------------------------------------------
// Main ingestion pipeline
// ---------------------------------------------------------------------------

async function runIngestion() {
  console.log('=== Portfolio RAG Ingestion Pipeline ===\n');

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Manifest not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifest: ManifestRecord[] = JSON.parse(
    fs.readFileSync(MANIFEST_PATH, 'utf-8')
  );
  console.log(`Found ${manifest.length} records in manifest.\n`);

  // Load tokenizer and embedding model (same model for both)
  console.log('Loading Xenova/gte-small tokenizer and embedding model...');
  const tokenizer = await AutoTokenizer.from_pretrained('Xenova/gte-small');
  const extractor = await pipeline('feature-extraction', 'Xenova/gte-small');
  console.log('Model ready.\n');

  let totalChunks = 0;

  for (const record of manifest) {
    console.log(`Processing [${record.project}] ${record.original_source_path}...`);

    const fullPath = path.join(process.cwd(), record.local_path);
    if (!fs.existsSync(fullPath)) {
      console.error(`  ❌ File not found: ${fullPath}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');

    // 1. Parse sections
    const sections = parseSections(content);

    // 2. Build token-aware chunks
    const chunks = buildChunks(sections, tokenizer as unknown as {
      encode: (t: string) => number[];
      decode: (ids: number[], opts?: Record<string, unknown>) => string;
    });

    console.log(`  Generated ${chunks.length} chunks.`);

    // 3. Upsert source metadata
    const sourceResult = await sql`
      INSERT INTO rag_sources (project, title, source_path, source_type, source_version, content_hash)
      VALUES (
        ${record.project},
        ${record.original_source_path},
        ${record.local_path},
        ${record.source_type},
        ${record.git_commit},
        ${record.content_hash}
      )
      ON CONFLICT (source_path) DO UPDATE SET
        project        = EXCLUDED.project,
        title          = EXCLUDED.title,
        source_type    = EXCLUDED.source_type,
        source_version = EXCLUDED.source_version,
        content_hash   = EXCLUDED.content_hash,
        updated_at     = now()
      RETURNING id;
    `;
    const sourceId = sourceResult[0].id;

    // 4. Clear old chunks (idempotent replacement)
    await sql`DELETE FROM rag_chunks WHERE source_id = ${sourceId}`;

    // 5. Embed and insert each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk     = chunks[i];
      const chunkHash = sha256(chunk.text);

      const output    = await extractor(chunk.text, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data) as number[];  // 384-dimensional

      const embeddingStr = `[${embedding.join(',')}]`;
      const metadata = JSON.stringify({
        project:         record.project,
        original_source: record.original_source_path,
      });

      await sql`
        INSERT INTO rag_chunks
          (source_id, chunk_index, section, content, content_hash, embedding, metadata)
        VALUES (
          ${sourceId},
          ${i},
          ${chunk.section.substring(0, 255)},
          ${chunk.text},
          ${chunkHash},
          ${embeddingStr},
          ${metadata}::jsonb
        )
      `;
    }

    totalChunks += chunks.length;
    console.log(`  ✅ Inserted ${chunks.length} chunks for ${record.local_path}\n`);
  }

  console.log('=== Ingestion Complete ===');
  console.log(`Total chunks inserted: ${totalChunks}`);
}

runIngestion().catch(err => {
  console.error('\n❌ Ingestion failed:', err);
  process.exit(1);
});
