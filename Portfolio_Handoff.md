# Portfolio Handoff

## 1. Project Overview

- **Repository:** `ayush22cp008/portfolio`
- **Product:** Ask Ayush, the portfolio's grounded RAG assistant.
- **Goal:** Build a portfolio that demonstrates real, verifiable AI engineering capabilities.
- **Implementation executor:** Antigravity.
- **Final decision authority:** Ayush.
- **Source of truth:** This file is the central project handoff. Update this existing file at each approved milestone; do not create duplicate handoff files.
- **Default release process:** Work on a dedicated feature branch, verify changes locally, deploy/test through Vercel Preview, open a PR to `main`, merge only after checks and manual acceptance, then verify Production.

## 2. Node Roadmap

| Node | Description | Status |
|------|-------------|--------|
| **Node 1** | Basic grounded RAG agent | Completed and published |
| **Node 2** | Backend controlled tool calling | Completed and published |
| **Node 3** | Trace Viewer and observability | Merged into `main`, deployed to Production, and manually verified |
| **Node 4** | JD-fit workflow | Completed and verified on Development; ready for manual review |
| **Node 5** | Admin, analytics, and stronger rate limiting | Planned |
| **Node 6** | Architecture pages | Planned |

## 3. Node 1 — Grounded RAG Baseline

- Retrieval over approved portfolio knowledge sources.
- Answer generation grounded in retrieved evidence.
- Retrieved-source references displayed with answers.
- Request validation, rate-limiting protections, and streaming response pipeline.
- Grounding and security constraints.

## 4. Node 2 — Backend Controlled Tool Calling

| Tool | Responsibility |
|------|----------------|
| `get_project_details` | Retrieve details for an allowlisted portfolio project. |
| `fetch_github_stats` | Fetch public GitHub statistics for an allowlisted project. |

### Reported implementation notes

- Corrected routing so generic project-listing behavior does not intercept appropriate project-detail requests.
- Added explicit-tool and natural-language guards for relevant project-detail requests.
- Corrected the Groq SDK tool-message type to `ChatCompletionToolMessageParam`.
- Preserved retrieval, validation, allowlisting, rate limits, and NDJSON streaming.

### Node 2 — Runtime Verification

| Test | Observed outcome |
|------|------------------|
| Generic project listing | HTTP 200; normal listing; no tool event. |
| Natural-language TableFlow details | HTTP 200; grounded RAG answer; no tool event. |
| GitHub statistics | HTTP 200; `fetch_github_stats` tool event reported. |
| TableFlow technology stack | HTTP 200; normal RAG answer; no tool event. |
| Explicit `get_project_details` request | HTTP 200; `get_project_details` tool event and result reported. |

## 5. Node 3 — Trace Viewer and Observability

**Status: Completed, merged, deployed, and manually verified.**

- Pull request: [#1 — feat(node3): add trace viewer and observability](https://github.com/ayush22cp008/portfolio/pull/1)
- Merge commit: `77db2f8`
- Feature branch: `release/node-1-2-3`
- Production deployment source: `main` at merge commit `77db2f8`; Vercel showed the deployment as **Ready**.
- Manual verification on Preview and Production included:
  - Homepage and project pages rendered.
  - A normal Ask Ayush question returned a grounded answer.
  - Trace ID, retrieval and generation durations, activity events, and retrieved sources displayed.
  - An explicit `get_project_details` request returned TableFlow details, and the tool event displayed as successful.

### Node 3 implementation summary

- Request-scoped trace IDs and activity/tool/trace NDJSON frames.
- Stream-parser validation for incoming frames.
- Visitor-facing Trace Viewer for activity, tool events, timings, and retrieved sources.
- Sanitized user-facing errors; avoid exposing secrets, stack traces, or private server details.
- Self-contained offline parser regression test at `scripts/node3_parser_offline_test.cjs`.

### Verification caveat

- The reported TypeScript check and production build passed during release preparation.
- The repository-wide lint command reported existing lint problems outside the intended Node 3 release scope; this was not a clean whole-repository lint pass.
- The manual Preview and Production checks above passed for the tested normal-answer and explicit tool-call flows. This does not imply every possible runtime path has been exhaustively tested.

## 6. Git and Release State

- **Default branch:** `main`
- **Latest confirmed Node 3 merge commit:** `77db2f8`
- **Pull request #1:** Merged and closed.
- **Production:** Vercel showed a **Ready** deployment sourced from `main` at `77db2f8`; a live Ask Ayush answer and Trace Viewer were manually verified.
- **Important:** The local working-tree state has not been inspected in this handoff update. Before any local Git operation, Antigravity must re-check `git status --short --branch`, current branch, `git log`, and the relationship with `origin/main`. Do not assume there are no uncommitted or untracked files.
- Do not use destructive commands such as `git reset --hard`, `git clean`, or force-push to “synchronize” the checkout. Preserve any local changes and investigate discrepancies first.
- The prior handoff's Git state snapshot (HEAD `23f57f0`, modified `lib/rag/llm.ts`, and untracked scripts) is stale and must not be treated as current state.

## 7. Node 4 — JD-Fit Workflow

**Status: Implemented and verified on Development branch (`br-delicate-wave-b3pevv04`). Production impact audited.**

### Implementation Summary
- **Routes & UI:**
  - Candidate-facing fit analysis UI at `/fit` (`app/fit/page.tsx`).
  - Fit analysis API at `/api/jdfit/analyze` (`app/api/jdfit/analyze/route.ts`).
  - Submission ingestion and consent routing at `/api/jdfit` (`app/api/jdfit/route.ts`).
  - Admin login UI (`app/jdfit/admin/login/page.tsx`) and Dashboard (`app/jdfit/admin/page.tsx`).
  - Admin auth & API routes: `/api/jdfit/admin/login`, `/api/jdfit/admin/data`, `/api/jdfit/admin/delete`.
- **Database Layer (`lib/jdfit/db.ts`):**
  - Migration `db/migrations/003_jdfit.sql` defining `jdfit_submissions`, `jdfit_skill_aggregates`, and `jdfit_aggregate_counters`.
  - Schema migration and four consent combinations (FullOff_AnalyticsOff, FullOff_AnalyticsOn, FullOn_AnalyticsOff, FullOn_AnalyticsOn) verified passing on Development branch.
  - Safe submission deletion (`deleteSubmission`) leaving anonymous skill aggregates and aggregate counters intact.
- **Admin Security:**
  - Token-based session management (`lib/jdfit/admin.ts`) using HMAC-SHA256 tokens in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
  - Failing closed on unauthenticated access and missing admin secrets.

### Production Read-Only Impact Audit Findings & Reconciliation
A strictly read-only audit script (`scripts/prod_audit.ts`) was executed directly against the verified Neon Production branch:
- **Production Branch ID:** `br-lively-king-b3sz4a2d` (Project: `polished-firefly-21555879`).
- **Production Endpoint:** `ep-lucky-shadow-b3j5eyco-pooler.c-4.ap-southeast-1.aws.neon.tech`.
- **Exit Code:** `0` (Success).
- **Public Tables on Production:** `["rag_chunks", "rag_rate_limits", "rag_sources"]`.
- **JD-Fit Tables Found:** `[]` (`jdfit_submissions`, `jdfit_skill_aggregates`, and `jdfit_aggregate_counters` do **not** exist on Production).
- **Submissions on Production:** `0` (Table does not exist).
- **Synthetic Test Submissions:** `0`.
- **Aggregate Counters / Skills:** `0` rows (Tables do not exist).

#### Closure Verification & Quality Checks
- **Admin Security & Cookie Policy:**
  - Authenticated sessions use `jdfit_admin_token` cookie configured with `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'` (matching approved specification), and `maxAge: 8 * 60 * 60` (8 hours).
  - Unauthenticated requests to `/api/jdfit/admin/data` and `/api/jdfit/admin/delete` fail closed (`401 Unauthorized`).
- **Consent Combinations & Aggregate Preservation:**
  - 4 consent combinations (`FullOff_AnalyticsOff`, `FullOff_AnalyticsOn`, `FullOn_AnalyticsOff`, `BothOn`) verified passing on Development.
  - Deletion of an individual submission via `/api/jdfit/admin/delete` deletes the candidate record from `jdfit_submissions` without altering or corrupting anonymous skill aggregates or aggregate counters.
- **RAG & Stream Observability Regressions:**
  - Offline parser regression test (`scripts/node3_parser_offline_test.cjs`) verified passing (`All offline parser tests passed`, exit code `0`).
  - Production build (`npm run build`) succeeded across all 14 routes with Turbopack (exit code `0`).
  - Live RAG execution checks via `scripts/run_rag_regressions.ts` (testing normal questions, `get_project_details`, and `fetch_github_stats`) are currently **BLOCKED**: while the Neon Production endpoint responds cleanly in <1s for read-only audits, requests against the Development compute (`ep-round-wave-b3rxgk6k-pooler`) stall/timeout during Postgres connection/rate-limit checks under the current environment setup.
- **Code Quality & Lint Status:**
  - `npx eslint "app/api/jdfit/**/*.{ts,tsx}" "app/fit/**/*.{ts,tsx}" "app/jdfit/**/*.{ts,tsx}" "lib/jdfit/**/*.{ts,tsx}" "scripts/prod_audit.ts"` passes cleanly with exit code `0` (0 errors, 0 warnings).
  - TypeScript compilation (`npx tsc --noEmit --pretty false`) passes cleanly with exit code `0` (0 type errors).
  - `npm run lint --silent` repository-wide exit code is `1` due to pre-existing Node 1–3 lint warnings/errors in legacy files (`SiteHeader.tsx`, `llm.ts`, `tools.ts`, `retrieval.ts`, and test scripts) documented in prior handoffs. All Node 4 code is 100% clean.

## 8. Future Nodes

- **Node 5:** Admin, analytics, and stronger rate limiting — planned.
- **Node 6:** Architecture pages — planned.

## 9. Working Rules

1. This file is the central handoff and should be updated in place when an approved milestone changes the project state.
2. Start with a read-only repository and Git-state audit before editing.
3. Keep each node scoped; do not bundle future nodes into the current one.
4. Preserve uncommitted changes and unknown files. Never overwrite, delete, reset, or clean files without an explicit, evidence-based reason and approval.
5. Do not invent project facts, skills, test results, or deployment status. Distinguish observed results from assumptions.
6. Run relevant tests and inspect the final diff before commit.
7. Use a feature branch, Preview validation, and a PR to `main`; merge only after required checks and manual acceptance.
8. Verify the Production deployment and its key user flows after merge.
9. Ayush is the final decision authority; stop for approval at the agreed review gates.

---
*Central handoff updated with verified Node 4 development status and verified read-only production audit.*

