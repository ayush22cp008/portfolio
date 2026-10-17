// lib/jdfit/analytics.ts
// Helper to perform all anonymous‑consent related DB writes in a single Neon transaction.
// Guarantees atomicity: either all counters/skill aggregates are persisted or none are.

import { sql } from "../rag/db.ts";

export interface SkillAggregatePayload {
  skillKey: string;
  displayLabel: string;
  category: string;
  required: number;
  preferred: number;
  strong: number;
  partial: number;
  gap: number;
  insufficient: number;
}

/**
 * Execute per‑field counters, skill‑aggregate upserts, anon participant and total request
 * counters inside a single transaction.
 *
 * @param aggregates Array of skill aggregates derived from analysis.requirements
 * @param presence   Presence of optional fields to decide provided/omitted counters
 */
export async function applyAnonAnalytics(
  aggregates: SkillAggregatePayload[],
  presence: { company?: boolean; jobTitle?: boolean; email?: boolean }
): Promise<void> {

  const now = new Date().toISOString();

await sql.transaction((tx) => {
  const queries = [];

  // Per‑field counters (provided vs omitted)
  queries.push(
    tx`
      INSERT INTO jdfit_aggregate_counters (counter_key, count, last_updated)
      VALUES (${presence.company ? "company_provided" : "company_omitted"}, 1, ${now})
      ON CONFLICT (counter_key) DO UPDATE SET
        count = jdfit_aggregate_counters.count + EXCLUDED.count,
        last_updated = EXCLUDED.last_updated;
    `
  );
  queries.push(
    tx`
      INSERT INTO jdfit_aggregate_counters (counter_key, count, last_updated)
      VALUES (${presence.jobTitle ? "jobTitle_provided" : "jobTitle_omitted"}, 1, ${now})
      ON CONFLICT (counter_key) DO UPDATE SET
        count = jdfit_aggregate_counters.count + EXCLUDED.count,
        last_updated = EXCLUDED.last_updated;
    `
  );
  queries.push(
    tx`
      INSERT INTO jdfit_aggregate_counters (counter_key, count, last_updated)
      VALUES (${presence.email ? "email_provided" : "email_omitted"}, 1, ${now})
      ON CONFLICT (counter_key) DO UPDATE SET
        count = jdfit_aggregate_counters.count + EXCLUDED.count,
        last_updated = EXCLUDED.last_updated;
    `
  );

  // Skill aggregates upserts with legacy‑alias handling
  const aliasMap: Record<string, string> = {
    'sql experience': 'sql',
    'docker experience': 'docker',
  };
  const labelMap: Record<string, string> = {
    sql: 'SQL',
    docker: 'Docker',
  };
  const aggMap = new Map<string, SkillAggregatePayload>();
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
    queries.push(
      tx`
        INSERT INTO jdfit_skill_aggregates (
          skill_key, display_label, category,
          required_occurrences, preferred_occurrences,
          strong_matches, partial_matches, gaps, insufficient_evidence, last_updated
        ) VALUES (
          ${agg.skillKey}, ${agg.displayLabel.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}, ${agg.category},
          ${agg.required}, ${agg.preferred},
          ${agg.strong}, ${agg.partial}, ${agg.gap}, ${agg.insufficient}, ${now}
        )
        ON CONFLICT (skill_key) DO UPDATE SET
          required_occurrences = jdfit_skill_aggregates.required_occurrences + EXCLUDED.required_occurrences,
          preferred_occurrences = jdfit_skill_aggregates.preferred_occurrences + EXCLUDED.preferred_occurrences,
          strong_matches = jdfit_skill_aggregates.strong_matches + EXCLUDED.strong_matches,
          partial_matches = jdfit_skill_aggregates.partial_matches + EXCLUDED.partial_matches,
          gaps = jdfit_skill_aggregates.gaps + EXCLUDED.gaps,
          insufficient_evidence = jdfit_skill_aggregates.insufficient_evidence + EXCLUDED.insufficient_evidence,
          last_updated = EXCLUDED.last_updated;
      `
    );
  }

  // anon participant counter
  queries.push(
    tx`
      INSERT INTO jdfit_aggregate_counters (counter_key, count, last_updated)
      VALUES ('anon_participants', 1, ${now})
      ON CONFLICT (counter_key) DO UPDATE SET
        count = jdfit_aggregate_counters.count + EXCLUDED.count,
        last_updated = EXCLUDED.last_updated;
    `
  );

  // total request counter
  queries.push(
    tx`
      INSERT INTO jdfit_aggregate_counters (counter_key, count, last_updated)
      VALUES ('total_requests', 1, ${now})
      ON CONFLICT (counter_key) DO UPDATE SET
        count = jdfit_aggregate_counters.count + EXCLUDED.count,
        last_updated = EXCLUDED.last_updated;
    `
  );

  return queries;
});
}
