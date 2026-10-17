// lib/jdfit/db.ts

import { sql } from "../rag/db.ts";
import type { JdAnalysis } from "./types";

// Test mode: if JDFIT_DB_MOCK env var is set, DB ops become no‑ops
const TEST_MODE = process.env.JDFIT_DB_MOCK === '1';
import { randomUUID } from "node:crypto";

/** Insert a full submission row (only when full‑save consent is given) */
export let insertSubmission = async (sub: {
  jobDescription: string;
  company?: string | null;
  jobTitle?: string | null;
  email?: string | null;
  analysis: JdAnalysis; // stored as JSONB
}): Promise<string> => {
  if (TEST_MODE) {
    // In test mode, skip DB write and return a dummy id
    return 'mock-id';
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO jdfit_submissions (
      id,
      job_description,
      company,
      job_title,
      visitor_email,
      analysis,
      consent_at,
      consent_policy_version,
      created_at
    ) VALUES (
      ${id},
      ${sub.jobDescription},
      ${sub.company ?? null},
      ${sub.jobTitle ?? null},
      ${sub.email ?? null},
      ${JSON.stringify(sub.analysis)}::jsonb,
      ${now},
      ${"v1.0"},
      ${now}
    );
  `;
  return id;
}

/** Upsert skill aggregate counters (anonymous analytics) */
export async function upsertSkillAggregates(
  aggregates: Array<{
    skillKey: string;
    displayLabel: string;
    category: string;
    required: number;
    preferred: number;
    strong: number;
    partial: number;
    gap: number;
    insufficient: number;
  }>
): Promise<void> {
  if (TEST_MODE) {
    // In test mode, skip DB upserts
    return;
  }
  const now = new Date().toISOString();
  // Skill aggregates upserts with legacy‑alias handling
  const aliasMap: Record<string, string> = {
    'sql experience': 'sql',
    'docker experience': 'docker',
  };
  const labelMap: Record<string, string> = {
    sql: 'SQL',
    docker: 'Docker',
  };
  const aggMap = new Map<string, {
    skillKey: string;
    displayLabel: string;
    category: string;
    required: number;
    preferred: number;
    strong: number;
    partial: number;
    gap: number;
    insufficient: number;
  }>();
  for (const agg of aggregates) {
    const canonicalKey = aliasMap[agg.skillKey] ?? agg.skillKey;
    const displayLabel = labelMap[canonicalKey] ?? agg.displayLabel;
    const existing = aggMap.get(canonicalKey);
    if (existing) {
      existing.required += agg.required;
      existing.preferred += agg.preferred;
      existing.strong += agg.strong;
      existing.partial += agg.partial;
      existing.gap += agg.gap;
      existing.insufficient += agg.insufficient;
    } else {
      aggMap.set(canonicalKey, {
        skillKey: canonicalKey,
        displayLabel,
        category: agg.category,
        required: agg.required,
        preferred: agg.preferred,
        strong: agg.strong,
        partial: agg.partial,
        gap: agg.gap,
        insufficient: agg.insufficient,
      });
    }
  }
  for (const agg of aggMap.values()) {
    await sql`
      INSERT INTO jdfit_skill_aggregates (
        skill_key,
        display_label,
        category,
        required_occurrences,
        preferred_occurrences,
        strong_matches,
        partial_matches,
        gaps,
        insufficient_evidence,
        last_updated
      ) VALUES (
        ${agg.skillKey},
        ${agg.displayLabel},
        ${agg.category},
        ${agg.required},
        ${agg.preferred},
        ${agg.strong},
        ${agg.partial},
        ${agg.gap},
        ${agg.insufficient},
        ${now}
      )
      ON CONFLICT (skill_key) DO UPDATE SET
        required_occurrences = jdfit_skill_aggregates.required_occurrences + EXCLUDED.required_occurrences,
        preferred_occurrences = jdfit_skill_aggregates.preferred_occurrences + EXCLUDED.preferred_occurrences,
        strong_matches = jdfit_skill_aggregates.strong_matches + EXCLUDED.strong_matches,
        partial_matches = jdfit_skill_aggregates.partial_matches + EXCLUDED.partial_matches,
        gaps = jdfit_skill_aggregates.gaps + EXCLUDED.gaps,
        insufficient_evidence = jdfit_skill_aggregates.insufficient_evidence + EXCLUDED.insufficient_evidence,
        last_updated = EXCLUDED.last_updated;
    `;
  }
}

/** Increment generic counters (provided/omitted fields) */
export async function incrementCounter(counterKey: string, delta: number = 1): Promise<void> {
  const now = new Date().toISOString();
  await sql`
    INSERT INTO jdfit_aggregate_counters (counter_key, count, last_updated)
    VALUES (${counterKey}, ${delta}, ${now})
    ON CONFLICT (counter_key) DO UPDATE SET
      count = jdfit_aggregate_counters.count + EXCLUDED.count,
      last_updated = EXCLUDED.last_updated;
  `;
}

// Admin data retrieval functions for JD‑Fit dashboard
export async function getSkillAggregates() {
  const rows = await sql`SELECT * FROM jdfit_skill_aggregates ORDER BY last_updated DESC`;
  return rows;
}

export async function getCounters() {
  const rows = await sql`SELECT * FROM jdfit_aggregate_counters ORDER BY counter_key`;
  return rows;
}

// New: fetch full submissions (only those with consentFull = true)
export async function getSubmissions() {
  const rows = await sql`
    SELECT id, job_description, company, job_title, visitor_email, analysis, consent_at, consent_policy_version, created_at
    FROM jdfit_submissions
    ORDER BY created_at DESC`;
  return rows;
}

// Delete a specific submission (admin only)
export async function deleteSubmission(id: string) {
  const result = await sql`
    DELETE FROM jdfit_submissions WHERE id = ${id} RETURNING id`;
  return result[0]?.id ?? null;
}
