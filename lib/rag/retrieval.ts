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

import { sql } from "./db.ts";
import { RAG_CONFIG } from "./config.ts";
import { validateQuestion } from "./validation.ts";
import { checkRateLimits } from "./rate-limit.ts";
import { embedQuery, formatEmbeddingForSql } from "./embedding.ts";
import { makeQueryDecision, getMethodologyAuthorityTier, AUTHORITY_BONUS_BY_TIER } from "./decision.ts";
import { projects } from "../../corpus/profile/data";
import { ScopeError } from "./types";
import type {
  MatchedChunk,
  RetrievalResult,
  RetrievalSource,
} from "./types";

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

  // Step 2: Rate Limiting
  const rateLimitResult = await checkRateLimits(clientIp);
  if (!rateLimitResult.allowed) {
    throw new Error(
      `[rag/retrieval] Rate limit exceeded. Retry after ${rateLimitResult.retry_after} seconds.`
    );
  }

  // Step 3: Scope Gate & Decision Layer
  const decision = makeQueryDecision(question);
  if (decision.scope === "out_of_scope") {
    throw new ScopeError(
      "Ask Ayush currently covers five selected portfolio projects and Ayush's documented engineering / AI-agent methodology. Please ask about one of those areas."
    );
  }

  // Step 4: Generate Query Embedding
  const embedding = await embedQuery(question);
  const embeddingStr = formatEmbeddingForSql(embedding);

  // Step 5: Retrieve Candidates using Decision parameters
  const isCrossProject = decision.retrievalPolicy === "cross_project";
  const isProjectSpecific = decision.retrievalPolicy === "project_specific";
  const isMethodologyPolicy =
    decision.retrievalPolicy === "methodology" ||
    decision.retrievalPolicy === "project_methodology";

  // Canonical inclusion is explicit by retrieval policy:
  // - METHODOLOGY: allows Profile/canonical methodology evidence and supporting project evidence.
  // - PROJECT_METHODOLOGY: allows the named project's evidence and relevant canonical methodology evidence.
  // - PROJECT_SPECIFIC / CROSS_PROJECT / PROJECT_LIST: Profile canonical is excluded.
  const includeCanonical = isMethodologyPolicy;

  const projectsFilter = decision.entities.length > 0
    ? decision.entities.map(e => e.project)
    : null;

  let chunks: MatchedChunk[];
  if (isCrossProject && decision.entities.length > 1) {
    // For cross-project comparison, retrieve candidates per requested project
    // without per-source cap so single-source projects (ZENI, NCERT) have sufficient candidates to balance.
    const pools = await Promise.all(
      decision.entities.map((e) =>
        retrieveChunks(
          embeddingStr,
          RAG_CONFIG.similarityThreshold,
          RAG_CONFIG.candidatePoolSize,
          [e.project],
          null,
          false
        )
      )
    );
    chunks = pools.flat();
  } else if (isProjectSpecific) {
    // For project-specific queries, retrieve chunks from the explicitly named project only.
    // Single-source projects need full matchCount without artificial per-source cap.
    chunks = await retrieveChunks(
      embeddingStr,
      RAG_CONFIG.similarityThreshold,
      RAG_CONFIG.candidatePoolSize,
      projectsFilter,
      null,
      false
    );
  } else {
    chunks = await retrieveChunks(
      embeddingStr,
      RAG_CONFIG.similarityThreshold,
      RAG_CONFIG.candidatePoolSize,
      projectsFilter,
      RAG_CONFIG.maxChunksPerSource,
      includeCanonical
    );
  }

  // Apply methodology-authority weighting ONLY for methodology-oriented policies.

// Category-aware filtering for project list queries
if (decision.retrievalPolicy === "project_list_ai_ml") {
  const aiMlProjects = new Set(projects.filter(p => p.category === "GenAI" || p.category === "Computer Vision").map(p => p.name));
  chunks = chunks.filter(c => aiMlProjects.has((c.metadata as any)?.project));
} else if (decision.retrievalPolicy === "project_list_full_stack") {
  const fullStackProjects = new Set(projects.filter(p => p.category === "Full-Stack").map(p => p.name));
  chunks = chunks.filter(c => fullStackProjects.has((c.metadata as any)?.project));
}
  // This re-sorts the candidate pool by an adjusted score before the final slice,
  // preserving semantic similarity as the primary signal.
  let topKChunks: MatchedChunk[];
  if (isMethodologyPolicy) {
    const rankedChunks = applyMethodologyWeighting(chunks);
    topKChunks = rankedChunks.slice(0, RAG_CONFIG.matchCount);
  } else if (isCrossProject) {
    topKChunks = balanceCrossProjectCandidates(
      chunks,
      decision.entities.map((e) => e.project),
      RAG_CONFIG.matchCount
    );
  } else if (isProjectSpecific && decision.entities.length > 0) {
    const targetProject = decision.entities[0].project;
    topKChunks = chunks
      .filter((c) => (c.metadata as Record<string, unknown>)?.project === targetProject)
      .slice(0, RAG_CONFIG.matchCount);
} else {
  topKChunks = chunks.slice(0, RAG_CONFIG.matchCount);
  if (decision.retrievalPolicy === "project_list") {
    const allProjectNames = new Set(projects.map(p => p.name));
    // Keep only chunks belonging to allowed projects
    topKChunks = topKChunks.filter(c => allProjectNames.has((c.metadata as any)?.project));
    const present = new Set(topKChunks.map(c => (c.metadata as any)?.project));
    const missing = [...allProjectNames].filter(p => !present.has(p));
    if (missing.length > 0) {
      const extraChunks = await Promise.all(
        missing.map(proj =>
          retrieveChunks(
            embeddingStr,
            RAG_CONFIG.similarityThreshold,
            1,
            [proj],
            null,
            false
          )
        )
      );
      topKChunks = topKChunks.concat(extraChunks.flat()).slice(0, RAG_CONFIG.matchCount);
    }
  }
}

  // Step 6: Determine Fallback
  let source: RetrievalSource;
  let finalChunks: MatchedChunk[];

  if (topKChunks.length > 0) {
    source = "threshold";
    finalChunks = topKChunks;
  } else {
    source = "fallback";
    let fallbackChunks: MatchedChunk[];
    if (isCrossProject && decision.entities.length > 1) {
      const fallbackPools = await Promise.all(
        decision.entities.map((e) =>
          retrieveChunks(
            embeddingStr,
            0.0,
            RAG_CONFIG.fallbackChunkCount,
            [e.project],
            null,
            false
          )
        )
      );
      fallbackChunks = fallbackPools.flat();
    } else if (isProjectSpecific) {
      fallbackChunks = await retrieveChunks(
        embeddingStr,
        0.0,
        RAG_CONFIG.fallbackChunkCount,
        projectsFilter,
        null,
        false
      );
    } else {
      fallbackChunks = await retrieveChunks(
        embeddingStr,
        0.0,
        RAG_CONFIG.fallbackChunkCount,
        projectsFilter,
        RAG_CONFIG.maxChunksPerSource,
        includeCanonical
      );
    }

    if (isCrossProject) {
      const balancedFallback = balanceCrossProjectCandidates(
        fallbackChunks,
        decision.entities.map((e) => e.project),
        RAG_CONFIG.fallbackChunkCount
      );
      finalChunks = balancedFallback.length > 0 ? balancedFallback : fallbackChunks;
    } else if (isProjectSpecific && decision.entities.length > 0) {
      const targetProject = decision.entities[0].project;
      finalChunks = fallbackChunks
        .filter((c) => (c.metadata as Record<string, unknown>)?.project === targetProject)
        .slice(0, RAG_CONFIG.fallbackChunkCount);
    } else {
      finalChunks = fallbackChunks;
    }
  }

  // Step 7: Get total chunk count
  const totalResult = await sql`SELECT count(*) as count FROM rag_chunks;`;
  const totalChunks = Number(totalResult[0].count);

  return {
    chunks: finalChunks,
    source,
    query_embedding_dimensions: embedding.length,
    threshold_used: RAG_CONFIG.similarityThreshold,
    total_chunks_in_db: totalChunks,
    question,
  };
}

async function retrieveChunks(
  embeddingStr: string,
  threshold: number,
  matchCount: number,
  projectsFilter: string[] | null,
  maxPerSource: number | null,
  includeCanonical: boolean = false
): Promise<MatchedChunk[]> {
  // Use typed arrays for Neon driver if projectsFilter is passed
  const filterVal = projectsFilter && projectsFilter.length > 0 ? projectsFilter : null;

  const results = await sql`
    SELECT id, source_id, chunk_index, section, content, metadata, similarity
    FROM match_rag_chunks(
      ${embeddingStr},
      ${threshold},
      ${matchCount},
      ${filterVal},
      ${maxPerSource},
      ${includeCanonical}
    );
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

/**
 * Applies conservative methodology-authority weighting to a candidate pool.
 *
 * Only called for "methodology" and "project_methodology" retrieval policies.
 * Reads the project name from chunk.metadata.project (set by the ingestion pipeline).
 *
 * Formula: adjustedScore = similarity * (1 + authorityBonus)
 *   Tier 1 (TableFlow, DeliveryProof):        bonus = 0.04
 *   Tier 2 (Mechanical Part Detection):        bonus = 0.02
 *   Tier 3 (ZENI, NCERT AI Tutor):             bonus = 0.00
 *
 * A 0.05 raw cosine gap between two chunks always dominates authority tier,
 * so weak Tier 1 chunks cannot leapfrog strongly relevant Tier 3 chunks.
 * The original similarity values on the returned chunks are NOT mutated;
 * weighting only affects sort order.
 */
function applyMethodologyWeighting(chunks: MatchedChunk[]): MatchedChunk[] {
  const scored = chunks.map((chunk) => {
    const project =
      typeof (chunk.metadata as Record<string, unknown>)?.project === "string"
        ? (chunk.metadata as Record<string, unknown>).project as string
        : "";
    const tier = getMethodologyAuthorityTier(project);
    const bonus = AUTHORITY_BONUS_BY_TIER[tier];
    const adjustedScore = chunk.similarity * (1 + bonus);
    return { chunk, adjustedScore };
  });

  scored.sort((a, b) => b.adjustedScore - a.adjustedScore);

  // Return original chunks in new order; original similarity values unchanged.
  return scored.map((s) => s.chunk);
}

/**
 * Deterministically balances candidate chunks across explicitly requested project entities
 * for "cross_project" queries.
 *
 * Rules:
 * 1. Filter candidates to ONLY explicitly requested project entities. Unrelated projects
 *    (e.g., canonical Profile chunks from source-aware match) are never included.
 * 2. Assign each requested project entity a meaningful initial quota:
 *      quota = max(1, floor(limit / requestedProjects.length))
 * 3. Merge candidates round-robin up to their initial quota, ordered deterministically
 *    by highest candidate similarity.
 * 4. Fill remaining slots up to limit from the remaining unselected candidates of the
 *    requested projects, ordered by similarity descending.
 * 5. Never introduce unrelated projects merely to fill slots.
 */
export function balanceCrossProjectCandidates(
  chunks: MatchedChunk[],
  requestedProjects: string[],
  limit: number
): MatchedChunk[] {
  if (limit <= 0 || chunks.length === 0 || requestedProjects.length === 0) {
    return [];
  }

  // Deduplicate requested projects while preserving list
  const uniqueProjects = Array.from(new Set(requestedProjects));
  const requestedSet = new Set(uniqueProjects);

  // Filter to only candidates from explicitly requested projects
  const relevantChunks = chunks.filter((chunk) => {
    const project =
      typeof (chunk.metadata as Record<string, unknown>)?.project === "string"
        ? ((chunk.metadata as Record<string, unknown>).project as string)
        : "";
    return requestedSet.has(project);
  });

  if (relevantChunks.length === 0) {
    return [];
  }

  // Group candidates by project (candidates in chunks are already sorted by similarity DESC)
  const byProject = new Map<string, MatchedChunk[]>();
  for (const p of uniqueProjects) {
    byProject.set(p, []);
  }

  for (const chunk of relevantChunks) {
    const project = (chunk.metadata as Record<string, unknown>).project as string;
    byProject.get(project)!.push(chunk);
  }

  // Determine initial quota per project
  const initialQuota = Math.max(1, Math.floor(limit / uniqueProjects.length));

  // Order project queues deterministically by their top candidate's similarity descending
  const projectOrder = [...uniqueProjects].sort((a, b) => {
    const topA = byProject.get(a)?.[0]?.similarity ?? -1;
    const topB = byProject.get(b)?.[0]?.similarity ?? -1;
    if (topB !== topA) return topB - topA;
    return a.localeCompare(b);
  });

  const selectedChunks: MatchedChunk[] = [];
  const selectedIds = new Set<string>();

  // Round-robin selection up to initial quota
  for (let round = 0; round < initialQuota; round++) {
    for (const project of projectOrder) {
      if (selectedChunks.length >= limit) break;
      const list = byProject.get(project)!;
      if (round < list.length) {
        const candidate = list[round];
        if (!selectedIds.has(candidate.id)) {
          selectedChunks.push(candidate);
          selectedIds.add(candidate.id);
        }
      }
    }
  }

  // Fill remaining slots up to limit from unselected candidates of requested projects,
  // ordered by similarity descending
  if (selectedChunks.length < limit) {
    const remainingCandidates = relevantChunks
      .filter((c) => !selectedIds.has(c.id))
      .sort((a, b) => b.similarity - a.similarity);

    for (const candidate of remainingCandidates) {
      if (selectedChunks.length >= limit) break;
      selectedChunks.push(candidate);
      selectedIds.add(candidate.id);
    }
  }

  return selectedChunks;
}
