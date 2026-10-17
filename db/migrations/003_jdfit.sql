-- db/migrations/003_jdfit.sql

-- ============================================================
-- Node 4 — JD‑Fit Workflow – PostgreSQL Migration (additive)
-- ============================================================

-- 1. Full submissions table (stores raw JD only when full‑save consent is given)
CREATE TABLE IF NOT EXISTS jdfit_submissions (
  id UUID PRIMARY KEY,
  job_description TEXT NOT NULL,
  company TEXT NULL,
  job_title TEXT NULL,
  visitor_email TEXT NULL,
  analysis JSONB NOT NULL,
  consent_at TIMESTAMPTZ NOT NULL,
  consent_policy_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Skill aggregates – one row per normalized skill
CREATE TABLE IF NOT EXISTS jdfit_skill_aggregates (
  skill_key TEXT PRIMARY KEY,
  display_label TEXT NOT NULL,
  category TEXT NOT NULL,
  required_occurrences BIGINT NOT NULL DEFAULT 0,
  preferred_occurrences BIGINT NOT NULL DEFAULT 0,
  strong_matches BIGINT NOT NULL DEFAULT 0,
  partial_matches BIGINT NOT NULL DEFAULT 0,
  gaps BIGINT NOT NULL DEFAULT 0,
  insufficient_evidence BIGINT NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Generic aggregate counters (e.g., provided/omitted fields, anon participants)
CREATE TABLE IF NOT EXISTS jdfit_aggregate_counters (
  counter_key TEXT PRIMARY KEY,
  count BIGINT NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security: all tables are server‑only – no public SELECT privileges.
REVOKE ALL ON jdfit_submissions FROM PUBLIC;
REVOKE ALL ON jdfit_skill_aggregates FROM PUBLIC;
REVOKE ALL ON jdfit_aggregate_counters FROM PUBLIC;

-- End of migration
