/**
 * Server-side RAG configuration.
 *
 * All values are controlled by the server, never by the client.
 * Environment variables can override defaults.
 *
 * SECURITY: This module must NEVER be imported by client components.
 */

function getEnvNumber(key: string, defaultValue: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return defaultValue;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return defaultValue;
  return parsed;
}

function getEnvString(key: string, defaultValue: string): string {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return defaultValue;
  return raw;
}

export const RAG_CONFIG = {
  /**
   * Similarity threshold for normal retrieval (cosine similarity, 0–1).
   * Chunks with similarity >= this value are considered matches.
   * Default: 0.5
   */
  similarityThreshold: getEnvNumber("RAG_SIMILARITY_THRESHOLD", 0.5),

  /**
   * Maximum allowed question length in characters.
   * Default: 1000
   */
  maxQuestionLength: getEnvNumber("RAG_MAX_QUESTION_LENGTH", 1000),

  /**
   * Number of chunks to retrieve from match_rag_chunks for normal retrieval.
   * Default: 10
   */
  matchCount: getEnvNumber("RAG_MATCH_COUNT", 10),

  /**
   * Number of fallback chunks to retrieve when zero chunks pass threshold.
   * Default: 3
   */
  fallbackChunkCount: getEnvNumber("RAG_FALLBACK_CHUNK_COUNT", 3),

  /**
   * Embedding model — MUST match Phase 2 ingestion.
   * Default: Xenova/gte-small
   */
  embeddingModel: getEnvString("RAG_EMBEDDING_MODEL", "Xenova/gte-small"),

  /**
   * Embedding dimensions — gte-small produces 384.
   */
  embeddingDimensions: 384,

  /**
   * Rate limit settings.
   */
  rateLimit: {
    perIpMax: getEnvNumber("RATE_LIMIT_PER_IP_MAX", 10),
    perIpWindowSeconds: getEnvNumber("RATE_LIMIT_PER_IP_WINDOW_SECONDS", 3600),
    globalMax: getEnvNumber("RATE_LIMIT_GLOBAL_MAX", 100),
    globalWindowSeconds: getEnvNumber("RATE_LIMIT_GLOBAL_WINDOW_SECONDS", 86400),
  },
} as const;
