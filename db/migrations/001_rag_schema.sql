-- ============================================================
-- Node 1 — Phase 1 Database Migration
-- Portfolio RAG Agent ("Ask Ayush")
-- ============================================================
-- Run this entire file in the Neon SQL Editor manually.
-- The script is designed to be executed in full as a 
-- transaction-safe migration (excluding CREATE EXTENSION).
-- ============================================================


-- ------------------------------------------------------------
-- 0. Enable pgvector extension
-- ------------------------------------------------------------
-- Must be enabled before creating vector columns.
-- If already enabled, this is a no-op.
-- Note: Often must be executed outside a transaction block.

CREATE EXTENSION IF NOT EXISTS vector;

BEGIN;

-- ------------------------------------------------------------
-- 1. rag_sources
-- ------------------------------------------------------------
-- Stores metadata about every approved canonical source document.
-- Each ingested source file gets one row here.
-- Public client access: DENIED. 
-- Note on RLS: We enable RLS as a defense-in-depth boundary.
-- However, since the Next.js server connects using the database 
-- owner role via DATABASE_URL, it naturally bypasses RLS. 

CREATE TABLE IF NOT EXISTS rag_sources (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project       text        NOT NULL,           -- e.g. "tableflow", "profile", "zeni"
  title         text        NOT NULL,           -- human-readable title
  source_path   text        NOT NULL,           -- original file path / identifier
  source_type   text        NOT NULL,           -- e.g. "markdown", "typescript"
  source_version text,                          -- git commit SHA or version tag if available
  content_hash  text        NOT NULL,           -- SHA-256 of the raw source content
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one row per source_path so upserts are idempotent.
CREATE UNIQUE INDEX IF NOT EXISTS rag_sources_source_path_idx
  ON rag_sources (source_path);

-- RLS: enabled, no public access policies.
ALTER TABLE rag_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_read_rag_sources"
  ON rag_sources
  FOR ALL
  TO public
  USING (false);


-- ------------------------------------------------------------
-- 2. rag_chunks
-- ------------------------------------------------------------
-- Stores normalized text chunks, their embeddings, and metadata.
-- 384-dimensional vector is compatible with gte-small.
-- Public client access: DENIED.

CREATE TABLE IF NOT EXISTS rag_chunks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id     uuid        NOT NULL REFERENCES rag_sources(id) ON DELETE CASCADE,
  chunk_index   integer     NOT NULL,           -- 0-based position within source
  section       text,                           -- heading/section the chunk belongs to
  content       text        NOT NULL,           -- normalized chunk text
  content_hash  text        NOT NULL,           -- SHA-256 of the chunk content
  embedding     vector(384) NOT NULL,           -- gte-small produces 384-dim vectors
  metadata      jsonb       NOT NULL DEFAULT '{}',  -- extensible: project, source_path, etc.
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one chunk per (source_id, chunk_index).
-- Enables idempotent upserts during re-ingestion.
CREATE UNIQUE INDEX IF NOT EXISTS rag_chunks_source_chunk_idx
  ON rag_chunks (source_id, chunk_index);

-- HNSW vector index for approximate nearest-neighbour search.
-- operator class: vector_cosine_ops — matches cosine similarity retrieval.
-- m=16, ef_construction=64: sensible defaults for a small-to-medium corpus.
CREATE INDEX IF NOT EXISTS rag_chunks_embedding_hnsw_idx
  ON rag_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- RLS: enabled, no public access.
ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_read_rag_chunks"
  ON rag_chunks
  FOR ALL
  TO public
  USING (false);


-- ------------------------------------------------------------
-- 3. match_rag_chunks — similarity-search RPC
-- ------------------------------------------------------------
-- Called server-side.
-- Returns top-k chunks ordered by cosine similarity to query_embedding.
-- Applies a minimum similarity threshold; if nothing passes the threshold,
-- callers receive an empty result and must apply the 2-3 chunk fallback
-- logic in the application layer.

CREATE OR REPLACE FUNCTION match_rag_chunks(
  query_embedding vector(384),
  match_threshold float,
  match_count     int
)
RETURNS TABLE (
  id            uuid,
  source_id     uuid,
  chunk_index   integer,
  section       text,
  content       text,
  metadata      jsonb,
  similarity    float
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    rc.id,
    rc.source_id,
    rc.chunk_index,
    rc.section,
    rc.content,
    rc.metadata,
    1 - (rc.embedding <=> query_embedding) AS similarity
  FROM rag_chunks rc
  WHERE 1 - (rc.embedding <=> query_embedding) >= match_threshold
  ORDER BY rc.embedding <=> query_embedding   -- ascending distance = descending similarity
  LIMIT match_count;
$$;

REVOKE ALL ON FUNCTION match_rag_chunks(vector(384), float, int) FROM public;


-- ------------------------------------------------------------
-- 4. rag_rate_limits — atomic per-IP rate limiting
-- ------------------------------------------------------------
-- Stores hashed IP identifiers (HMAC'd server-side, never raw IPs).
-- Uses INSERT ... ON CONFLICT DO UPDATE for atomic increment,
-- avoiding any read-then-write race condition.
--
-- Separate global daily counter row uses key = '__global__'.

CREATE TABLE IF NOT EXISTS rag_rate_limits (
  key           text        PRIMARY KEY,        -- HMAC-hashed IP or '__global__'
  request_count integer     NOT NULL DEFAULT 0,
  window_start  timestamptz NOT NULL DEFAULT now()
);

-- RLS: enabled, deny all direct public access.
ALTER TABLE rag_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_rag_rate_limits"
  ON rag_rate_limits
  FOR ALL
  TO public
  USING (false);


-- ------------------------------------------------------------
-- 5. check_and_increment_rate_limit — atomic rate-limit RPC
-- ------------------------------------------------------------
-- Called server-side. Atomically checks whether the key is within
-- the allowed window and count, then increments if allowed.
--
-- Returns:
--   allowed       boolean  — true if request is permitted
--   request_count integer  — count AFTER this increment (if allowed)
--   retry_after   integer  — seconds until window resets (if blocked)
--
-- Window logic:
--   If more than window_seconds have elapsed since window_start,
--   the row is reset (new window).
--   Otherwise, the count is incremented atomically.
--
-- This single RPC replaces any read-then-write pattern.

CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  limit_key       text,
  max_requests    int,
  window_seconds  int
)
RETURNS TABLE (
  allowed       boolean,
  request_count integer,
  retry_after   integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count        integer;
  v_window_start timestamptz;
  v_now          timestamptz := now();
  v_elapsed      float;
  v_retry_after  integer;
BEGIN
  -- Attempt insert of a fresh row; no-op if key already exists.
  INSERT INTO rag_rate_limits (key, request_count, window_start)
    VALUES (limit_key, 0, v_now)
    ON CONFLICT (key) DO NOTHING;

  -- Lock the row for this key (FOR UPDATE prevents concurrent races).
  SELECT request_count, window_start
    INTO v_count, v_window_start
    FROM rag_rate_limits
    WHERE key = limit_key
    FOR UPDATE;

  v_elapsed := EXTRACT(EPOCH FROM (v_now - v_window_start));

  -- If outside the current window, reset the counter and allow.
  IF v_elapsed >= window_seconds THEN
    UPDATE rag_rate_limits
      SET request_count = 1,
          window_start  = v_now
      WHERE key = limit_key;

    RETURN QUERY SELECT true::boolean, 1::integer, 0::integer;
    RETURN;
  END IF;

  -- Within window: check if under limit.
  IF v_count < max_requests THEN
    UPDATE rag_rate_limits
      SET request_count = request_count + 1
      WHERE key = limit_key;

    RETURN QUERY SELECT true::boolean, (v_count + 1)::integer, 0::integer;
  ELSE
    -- Over limit: compute retry_after in seconds.
    v_retry_after := GREATEST(0, CEIL(window_seconds - v_elapsed)::integer);
    RETURN QUERY SELECT false::boolean, v_count::integer, v_retry_after::integer;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION check_and_increment_rate_limit(text, int, int) FROM public;


-- ------------------------------------------------------------
-- 6. updated_at trigger for rag_sources
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION update_updated_at_column() FROM public;

CREATE OR REPLACE TRIGGER rag_sources_updated_at
  BEFORE UPDATE ON rag_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ============================================================
-- END OF MIGRATION
-- ============================================================
-- After running this file in the Neon SQL Editor,
-- verify with these queries:
--
-- 1. Tables created:
--      SELECT table_name FROM information_schema.tables
--      WHERE table_schema = 'public'
--        AND table_name IN ('rag_sources','rag_chunks','rag_rate_limits');
--
-- 2. pgvector active:
--      SELECT extname FROM pg_extension WHERE extname = 'vector';
--
-- 3. HNSW index created:
--      SELECT indexname FROM pg_indexes
--      WHERE tablename = 'rag_chunks'
--        AND indexname = 'rag_chunks_embedding_hnsw_idx';
--
-- 4. RLS enabled on all three tables (rowsecurity = TRUE):
--      SELECT tablename, rowsecurity FROM pg_tables
--      WHERE schemaname = 'public'
--        AND tablename IN ('rag_sources','rag_chunks','rag_rate_limits');
--
-- 5. Both RPCs exist:
--      SELECT routine_name FROM information_schema.routines
--      WHERE routine_schema = 'public'
--        AND routine_name IN (
--          'match_rag_chunks',
--          'check_and_increment_rate_limit',
--          'update_updated_at_column'
--        );
--
-- 6. PUBLIC execute privilege revoked from RPCs:
--      SELECT routine_name, grantee, privilege_type 
--      FROM information_schema.routine_privileges 
--      WHERE routine_schema = 'public' 
--        AND grantee = 'PUBLIC'
--        AND routine_name IN (
--          'match_rag_chunks',
--          'check_and_increment_rate_limit',
--          'update_updated_at_column'
--        );
--      -- Expected: 0 rows returned
-- ============================================================
