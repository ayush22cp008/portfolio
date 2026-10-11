-- 002_source_aware_retrieval.sql
-- Upgrades match_rag_chunks to support optional project filtering and a per-source cap.

CREATE OR REPLACE FUNCTION public.match_rag_chunks(
    query_embedding vector,
    match_threshold double precision,
    match_count integer,
    projects_filter text[] DEFAULT NULL,
    max_per_source integer DEFAULT NULL,
    include_canonical boolean DEFAULT false
)
RETURNS TABLE (
    id uuid,
    source_id uuid,
    chunk_index integer,
    section text,
    content text,
    metadata jsonb,
    similarity double precision
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  WITH candidates AS (
    SELECT
      rc.id,
      rc.source_id,
      rs.project,
      rs.source_type,
      rc.chunk_index,
      rc.section,
      rc.content,
      rc.metadata,
      1 - (rc.embedding <=> query_embedding) AS similarity
    FROM rag_chunks rc
    JOIN rag_sources rs ON rc.source_id = rs.id
    WHERE 1 - (rc.embedding <=> query_embedding) >= match_threshold
      AND (
        (projects_filter IS NULL AND (include_canonical OR rs.source_type <> 'canonical-markdown'))
        OR rs.project = ANY(projects_filter)
        OR (include_canonical AND rs.source_type = 'canonical-markdown')
      )
  ),
  ranked_candidates AS (
    SELECT
      c.id,
      c.source_id,
      c.chunk_index,
      c.section,
      c.content,
      c.metadata,
      c.similarity,
      c.source_type,
      ROW_NUMBER() OVER (
        PARTITION BY c.source_id
        ORDER BY c.similarity DESC
      ) as source_rank
    FROM candidates c
  )
  SELECT
    id,
    source_id,
    chunk_index,
    section,
    content,
    metadata,
    similarity
  FROM ranked_candidates
  WHERE (
    max_per_source IS NULL
    OR source_rank <= max_per_source
    OR source_type = 'canonical-markdown'
  )
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
