/**
 * Database type definitions for the Node 1 RAG schema.
 *
 * These types correspond to the Neon PostgreSQL schema
 * defined in db/migrations/001_rag_schema.sql.
 *
 * They are used by the server-side database client (lib/rag/db.ts)
 * and the ingestion script (scripts/ingest-rag.ts).
 *
 * IMPORTANT: All RAG data access must occur server-side.
 * Never import these types into client-side components unless
 * defining the explicit serializable JSON return shapes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Row types (what you get back from SELECT)
// ---------------------------------------------------------------------------

export interface RagSourceRow {
  id: string;              // uuid
  project: string;
  title: string;
  source_path: string;
  source_type: string;
  source_version: string | null;
  content_hash: string;
  created_at: string;      // timestamptz as ISO string
  updated_at: string;
}

export interface RagChunkRow {
  id: string;              // uuid
  source_id: string;       // uuid → rag_sources.id
  chunk_index: number;
  section: string | null;
  content: string;
  content_hash: string;
  // embedding is stored as vector(384) in the DB, 
  // typically returned as a string "[-0.1, ...]" by Postgres if queried directly.
  metadata: Json;
  created_at: string;
}

export interface RagRateLimitRow {
  key: string;
  request_count: number;
  window_start: string;
}

// ---------------------------------------------------------------------------
// Insert types (what you pass to INSERT)
// ---------------------------------------------------------------------------

export interface RagSourceInsert {
  id?: string;
  project: string;
  title: string;
  source_path: string;
  source_type: string;
  source_version?: string | null;
  content_hash: string;
  created_at?: string;
  updated_at?: string;
}

export interface RagChunkInsert {
  id?: string;
  source_id: string;
  chunk_index: number;
  section?: string | null;
  content: string;
  content_hash: string;
  embedding: number[] | string;  // 384-element float array or formatted pgvector string
  metadata?: Json;
  created_at?: string;
}

// ---------------------------------------------------------------------------
// RPC return types
// ---------------------------------------------------------------------------

/** Returned by match_rag_chunks RPC */
export interface MatchedChunk {
  id: string;
  source_id: string;
  chunk_index: number;
  section: string | null;
  content: string;
  metadata: Json;
  similarity: number;
}

/** Returned by check_and_increment_rate_limit RPC */
export interface RateLimitResult {
  allowed: boolean;
  request_count: number;
  retry_after: number;   // seconds until window resets; 0 if allowed
}

// ---------------------------------------------------------------------------
// Phase 3 — Retrieval types
// ---------------------------------------------------------------------------

/** Source of the retrieval result: normal threshold match or fallback */
export type RetrievalSource = "threshold" | "fallback";

/** Structured result returned by the Phase 3 retrieval pipeline */
export interface RetrievalResult {
  chunks: MatchedChunk[];
  source: RetrievalSource;
  query_embedding_dimensions: number;
  threshold_used: number;
  total_chunks_in_db: number;
  question: string;
}

/** Result of question validation */
export interface ValidationResult {
  valid: boolean;
  question: string;
  error?: string;
}

/** Result of a rate-limit check */
export interface RateLimitCheckResult {
  allowed: boolean;
  request_count: number;
  retry_after: number;
}
