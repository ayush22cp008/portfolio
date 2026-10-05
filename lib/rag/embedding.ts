/**
 * Query embedding for Phase 3 retrieval.
 *
 * Uses the EXACT same model as Phase 2 ingestion:
 *   Xenova/gte-small
 *
 * Produces 384-dimensional embeddings.
 *
 * SECURITY: This module must NEVER be imported by client components.
 * It uses @huggingface/transformers which is a server-side library.
 */

import { pipeline, env } from "@huggingface/transformers";
import { RAG_CONFIG } from "./config";

/**
 * Cache the embedding pipeline globally to avoid reloading on every request.
 * In Next.js server environment, globalThis persists across requests in the
 * same process.
 */
const globalCache = globalThis as unknown as {
  __ragEmbeddingPipeline?: unknown;
};

/**
 * Get or create the embedding pipeline.
 * Uses a singleton pattern for efficiency.
 */
async function getEmbeddingPipeline(): Promise<{
  (text: string, opts: { pooling: string; normalize: boolean }): Promise<{
    data: Float32Array;
  }>;
}> {
  if (!globalCache.__ragEmbeddingPipeline) {
    env.cacheDir = "/tmp/transformers-cache";
    globalCache.__ragEmbeddingPipeline = await pipeline(
      "feature-extraction",
      RAG_CONFIG.embeddingModel
    );
  }
  return globalCache.__ragEmbeddingPipeline as {
    (
      text: string,
      opts: { pooling: string; normalize: boolean }
    ): Promise<{ data: Float32Array }>;
  };
}

/**
 * Generate a query embedding using Xenova/gte-small.
 *
 * @param text - The query text to embed
 * @returns A 384-dimensional embedding as a number array
 */
export async function embedQuery(text: string): Promise<number[]> {
  const extractor = await getEmbeddingPipeline();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  const embedding = Array.from(output.data) as number[];

  // Verify dimensionality
  if (embedding.length !== RAG_CONFIG.embeddingDimensions) {
    throw new Error(
      `[rag/embedding] Expected ${RAG_CONFIG.embeddingDimensions} dimensions, got ${embedding.length}. ` +
        `Model: ${RAG_CONFIG.embeddingModel}`
    );
  }

  return embedding;
}

/**
 * Format an embedding as a pgvector string for SQL queries.
 */
export function formatEmbeddingForSql(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
