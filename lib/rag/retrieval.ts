/**
 * Phase 3 — Retrieval Pipeline
 *
 * Orchestrates the full retrieval flow:
 *   Question validation → Rate limiting → Query embedding →
 *   Vector retrieval → Threshold/fallback → Structured result
 *
 * This module is retrieval-only. It does NOT generate answers.
 * Phase 4 will consume the structured result for generation.
 *
 * SECURITY:
 *   - All database access is server-controlled
 *   - Uses existing protected RPCs (match_rag_chunks, check_and_increment_rate_limit)
 *   - No arbitrary SQL/RPC/table access is exposed
 *   - Retrieved content is treated as DATA, not instructions
 */

import { sql } from "./db";
import { RAG_CONFIG } from "./config";
import { validateQuestion } from "./validation";
import { checkRateLimits } from "./rate-limit";
import { embedQuery, formatEmbeddingForSql } from "./embedding";
import type {
  MatchedChunk,
  RetrievalResult,
  RetrievalSource,
} from "./types";

/**
 * Retrieve chunks relevant to a question.
 *
 * This is the main entry point for Phase 3 retrieval.
 * It orchestrates the full pipeline and returns a structured result.
 *
 * @param input - The raw input (expected: { question: string })
 * @param clientIp - The client's IP address for rate limiting
 * @returns RetrievalResult with chunks and metadata
 * @throws Error if validation fails, rate limited, or retrieval fails
 */
export async function retrieve(
  input: unknown,
  clientIp: string
): Promise<RetrievalResult> {
  // Step 1: Validate the question
  const validation = validateQuestion(input);
  if (!validation.valid) {
    throw new Error(
      `[rag/retrieval] Validation failed: ${validation.error}`
    );
  }

  const question = validation.question;

  // Step 2: Check rate limits
  const rateLimitResult = await checkRateLimits(clientIp);
  if (!rateLimitResult.allowed) {
    throw new Error(
      `[rag/retrieval] Rate limit exceeded. Retry after ${rateLimitResult.retry_after} seconds.`
    );
  }

  // Step 3: Generate query embedding
  const embedding = await embedQuery(question);
  const embeddingStr = formatEmbeddingForSql(embedding);

  // Step 4: Retrieve chunks using the protected match_rag_chunks RPC
  const chunks = await retrieveChunks(
    embeddingStr,
    RAG_CONFIG.similarityThreshold,
    RAG_CONFIG.matchCount
  );

  // Step 5: Determine if we need fallback
  let source: RetrievalSource;
  let finalChunks: MatchedChunk[];

  if (chunks.length > 0) {
    // Normal threshold-qualified retrieval
    source = "threshold";
    finalChunks = chunks;
  } else {
    // Zero-result fallback: retrieve best 2–3 chunks
    source = "fallback";
    const fallbackChunks = await retrieveChunks(
      embeddingStr,
      0.0,
      RAG_CONFIG.fallbackChunkCount
    );
    finalChunks = fallbackChunks;
  }

  // Step 6: Get total chunk count for context
  const totalResult = await sql`SELECT count(*) as count FROM rag_chunks;`;
  const totalChunks = Number(totalResult[0].count);

  // Step 7: Build and return structured result
  return {
    chunks: finalChunks,
    source,
    query_embedding_dimensions: embedding.length,
    threshold_used: RAG_CONFIG.similarityThreshold,
    total_chunks_in_db: totalChunks,
    question,
  };
}

/**
 * Retrieve chunks using the protected match_rag_chunks RPC.
 *
 * @param embeddingStr - The query embedding as a pgvector string
 * @param threshold - The similarity threshold
 * @param matchCount - The maximum number of chunks to return
 * @returns Array of retrieved chunks
 */
async function retrieveChunks(
  embeddingStr: string,
  threshold: number,
  matchCount: number
): Promise<MatchedChunk[]> {
  const results = await sql`
    SELECT id, source_id, chunk_index, section, content, metadata, similarity
    FROM match_rag_chunks(${embeddingStr}, ${threshold}, ${matchCount});
  `;

  return (results as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    source_id: row.source_id as string,
    chunk_index: row.chunk_index as number,
    section: row.section as string | null,
    content: row.content as string,
    metadata: row.metadata as MatchedChunk["metadata"],
    similarity: Number(row.similarity),
  }));
}
