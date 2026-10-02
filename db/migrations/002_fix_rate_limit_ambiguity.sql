-- ============================================================
-- Migration: Fix request_count ambiguity in rate-limit function
-- ============================================================
-- Purpose: The check_and_increment_rate_limit function's RETURNS TABLE
-- clause creates an out parameter named `request_count`, which conflicts
-- with the `rag_rate_limits.request_count` table column. This causes
-- PostgreSQL to raise "column reference 'request_count' is ambiguous"
-- when the function body references the column.
--
-- Fix: Qualify all table column references with the table name
-- (rag_rate_limits.column_name) to eliminate the ambiguity.
--
-- This migration does NOT change:
--   - Function signature
--   - RETURNS TABLE columns
--   - LANGUAGE, SECURITY, search_path
--   - Atomic INSERT / ON CONFLICT behavior
--   - FOR UPDATE row locking
--   - Rate-limit semantics
-- ============================================================

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
AS $function$
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
  -- FIX: Qualify column references with table name to avoid ambiguity
  -- with the RETURNS TABLE out parameter names.
  SELECT rag_rate_limits.request_count, rag_rate_limits.window_start
    INTO v_count, v_window_start
    FROM rag_rate_limits
    WHERE rag_rate_limits.key = limit_key
    FOR UPDATE;

  v_elapsed := EXTRACT(EPOCH FROM (v_now - v_window_start));

  -- If outside the current window, reset the counter and allow.
  IF v_elapsed >= window_seconds THEN
    UPDATE rag_rate_limits
      SET request_count = 1,
          window_start  = v_now
      WHERE rag_rate_limits.key = limit_key;

    RETURN QUERY SELECT true::boolean, 1::integer, 0::integer;
    RETURN;
  END IF;

  -- Within window: check if under limit.
  IF v_count < max_requests THEN
    -- FIX: Qualify the column reference on the right-hand side
    UPDATE rag_rate_limits
      SET request_count = rag_rate_limits.request_count + 1
      WHERE rag_rate_limits.key = limit_key;

    RETURN QUERY SELECT true::boolean, (v_count + 1)::integer, 0::integer;
  ELSE
    -- Over limit: compute retry_after in seconds.
    v_retry_after := GREATEST(0, CEIL(window_seconds - v_elapsed)::integer);
    RETURN QUERY SELECT false::boolean, v_count::integer, v_retry_after::integer;
  END IF;
END;
$function$;

-- Revoke public execute privilege (same as original)
REVOKE ALL ON FUNCTION check_and_increment_rate_limit(text, int, int) FROM public;

-- ============================================================
-- END OF MIGRATION
-- ============================================================
