// lib/jdfit/types.ts

export interface JdRequirement {
  /** Requirement text as extracted from the job description */
  text: string;
  /** Normalized skill or category name (lowercase, trimmed) */
  normalized: string;
  /** Priority – 'required' or 'preferred' */
  priority: 'required' | 'preferred';
}

export interface JdAnalysis {
  /** Array of extracted requirements */
  requirements: JdRequirement[];
  /** Mapping of normalized skill/category to classification */
  classifications: Record<
    string,
    'strong_match' | 'partial_match' | 'gap' | 'insufficient_evidence'
  >;
  /** Weighted coverage percentage, 0‑100 */
  coverageScore: number;
  /** Human‑readable explanation of each classification */
  explanations: Record<string, string>;
}

export interface JdSubmission {
  id: string; // UUID
  jobDescription: string;
  company?: string | null;
  jobTitle?: string | null;
  email?: string | null;
  analysis: JdAnalysis;
  consentFull: boolean;
  consentAnon: boolean;
  consentAt: string; // ISO timestamp
  consentPolicyVersion: string;
  createdAt: string;
}

export interface SkillAggregateRow {
  skill_key: string; // normalized skill name
  display_label: string; // original case for UI
  category: string;
  required_occurrences: number;
  preferred_occurrences: number;
  strong_matches: number;
  partial_matches: number;
  gaps: number;
  insufficient_evidence: number;
  last_updated: string;
}

export interface CounterRow {
  counter_key: string;
  count: number;
  last_updated: string;
}
