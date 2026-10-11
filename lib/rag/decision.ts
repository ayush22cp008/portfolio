import { QueryDecision } from "./types";

// ---------------------------------------------------------------------------
// PROJECT ENTITY REGISTRY
// ---------------------------------------------------------------------------

// High-confidence exact names and unambiguous aliases only.
const PROJECT_ENTITIES = [
  { project: "ZENI", pattern: /\b(zeni)\b/i },
  { project: "TableFlow", pattern: /\b(tableflow)\b/i },
  { project: "DeliveryProof", pattern: /\b(deliveryproof|delivery proof)\b/i },
  { project: "NCERT AI Tutor", pattern: /\b(ncert ai tutor|ncert ai|ncert)\b/i },
  { project: "Mechanical Part Detection", pattern: /\b(mechanical part detection|part detection)\b/i },
];

// ---------------------------------------------------------------------------
// METHODOLOGY AUTHORITY REGISTRY
// ---------------------------------------------------------------------------
//
// Tier 1 = strongest methodology evidence (TableFlow, DeliveryProof)
// Tier 2 = strong supporting methodology evidence (Mechanical Part Detection)
// Tier 3 = lower methodology authority (ZENI, NCERT AI Tutor)
//
// Project strings MUST match PROJECT_ENTITIES exactly (one naming system).
// Applied ONLY for "methodology" and "project_methodology" retrieval policies.
// Never applied to project_specific, cross_project, project_list, or out_of_scope.

const METHODOLOGY_AUTHORITY: Record<string, 1 | 2 | 3> = {
  "TableFlow": 1,
  "DeliveryProof": 1,
  "Profile": 1,               // canonical cross-project methodology source
  "Mechanical Part Detection": 2,
  "ZENI": 3,
  "NCERT AI Tutor": 3,
};

/**
 * Returns the methodology authority tier for a given project name.
 * Projects not in the registry return tier 3 (lowest).
 * Only meaningful when retrievalPolicy is "methodology" or "project_methodology".
 */
export function getMethodologyAuthorityTier(project: string): 1 | 2 | 3 {
  return METHODOLOGY_AUTHORITY[project] ?? 3;
}

/**
 * Conservative proportional authority bonus for methodology queries.
 * A Tier 1 source receives a small bonus proportional to its own similarity,
 * so a weak Tier 1 chunk can never outrank a strong Tier 3 chunk.
 *
 *   adjustedScore = similarity * (1 + authorityBonus)
 *
 *   Tier 1: bonus = 0.04  → a 0.80 chunk becomes ~0.832
 *   Tier 2: bonus = 0.02  → a 0.80 chunk becomes ~0.816
 *   Tier 3: bonus = 0.00  → unchanged
 *
 * The bonus magnitude is intentionally small; a 0.05 raw cosine gap
 * always dominates over authority tier.
 */
export const AUTHORITY_BONUS_BY_TIER: Record<1 | 2 | 3, number> = {
  1: 0.04,
  2: 0.02,
  3: 0.00,
};

// ---------------------------------------------------------------------------
// METHODOLOGY & PORTFOLIO CUES
// ---------------------------------------------------------------------------

// Strictly bounded to methodology context. Generic "architecture" alone is NOT sufficient.
const METHODOLOGY_PATTERN = /\b(approach|workflow|methodology|process|planning|debugging|debug|verification|verify|engineering workflow|ai agents|coding agents|project-building|build process|engineering decisions|how does ayush build|how does ayush work)\b/i;

// Strictly bounded to portfolio context
const PROJECT_LIST_PATTERN = /\b(projects?|project portfolio|selected projects|projects ayush built|projects ayush has built|portfolio projects|full stack projects|portfolio)\b/i;

const COMPARE_PATTERN = /\b(compare|difference|versus|vs|different)\b/i;

// Explicit out-of-scope markers that should fast-fail (if no methodology/entity hits).
// Not exhaustively needed because we fail if no entity/cue hits anyway, but useful for edge cases.
// We will primarily rely on "no recognized intent -> OUT OF SCOPE".

// ---------------------------------------------------------------------------
// DECISION LAYER
// ---------------------------------------------------------------------------

export function makeQueryDecision(query: string): QueryDecision {
  const q = query.trim();

  // 1. Entity Extraction
  const matchedEntities: Array<{ project: string; matchedAlias: string }> = [];
  for (const entity of PROJECT_ENTITIES) {
    const match = q.match(entity.pattern);
    if (match) {
      matchedEntities.push({ project: entity.project, matchedAlias: match[1] });
    }
  }

  // 2. Cue Extraction
  const cues: QueryDecision["cues"] = [];
  if (METHODOLOGY_PATTERN.test(q)) cues.push("methodology");
  if (PROJECT_LIST_PATTERN.test(q)) cues.push("project_list");
  if (COMPARE_PATTERN.test(q)) cues.push("compare");

  const hasEntities = matchedEntities.length > 0;
  const hasCues = cues.length > 0;
  const mentionsAyush = /\b(ayush|ayush's)\b/i.test(q);

  // 3. Scope Gate
  if (!hasEntities && !hasCues) {
    // If they ask a totally unrelated question, it fails here.
    if (mentionsAyush) {
      return {
        scope: "ambiguous",
        shape: "GENERAL",
        entities: [],
        cues: [],
        retrievalPolicy: "broad",
        reason: "Mentions Ayush but lacks recognized methodology or project cues.",
      };
    }

    return {
      scope: "out_of_scope",
      shape: "GENERAL",
      entities: [],
      cues: [],
      retrievalPolicy: "broad", // won't be used
      reason: "No recognized project entities or methodology cues found.",
    };
  }

  // 4. Intent & Policy Routing
  let shape: QueryDecision["shape"] = "GENERAL";
  if (matchedEntities.length === 1) shape = "ENTITY";
  if (matchedEntities.length > 1) shape = "MULTI_ENTITY";

  let policy: QueryDecision["retrievalPolicy"] = "broad";

  if (shape === "ENTITY") {
    if (cues.includes("methodology")) {
      policy = "project_methodology";
    } else {
      policy = "project_specific";
    }
  } else if (shape === "MULTI_ENTITY") {
    policy = "cross_project";
  } else if (shape === "GENERAL") {
    if (cues.includes("methodology")) {
      policy = "methodology";
    } else if (cues.includes("project_list")) {
      policy = "project_list";
    } else {
      policy = "broad";
    }
  }

  return {
    scope: "in_scope",
    shape,
    entities: matchedEntities,
    cues,
    retrievalPolicy: policy,
    reason: `Routed as ${policy} based on ${matchedEntities.length} entities and [${cues.join(", ")}] cues.`,
  };
}
