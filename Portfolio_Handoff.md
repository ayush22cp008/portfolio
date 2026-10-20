# Portfolio Handoff

## 1. Project Overview

- **Repository:** `ayush22cp008/portfolio`
- **Product:** Ask Ayush, the portfolio's grounded RAG assistant, plus the JD-Fit workflow.
- **Goal:** Build a portfolio that demonstrates real, verifiable AI engineering capabilities.
- **Implementation executor:** Antigravity.
- **Final decision authority:** Ayush.
- **Source of truth:** This file is the central project handoff. Update this existing file at each approved milestone; do not create duplicate handoff files.
- **Default release process:** Work on a dedicated feature branch, verify changes locally, deploy/test through Vercel Preview, open a PR to `main`, merge only after checks and manual acceptance, then verify Production. **Node 4 was pushed directly to `main` in the reported release; treat this as an exception to the default process.**

## 2. Node Roadmap

| Node | Description | Status |
|------|-------------|--------|
| **Node 1** | Basic grounded RAG agent | Completed and published |
| **Node 2** | Backend controlled tool calling | Completed and published |
| **Node 3** | Trace Viewer and observability | Merged into `main`, deployed to Production, and manually verified |
| **Node 4** | JD-fit workflow | Deployed to Production; manual testing found two user-facing errors. Root causes remain unconfirmed; investigation in progress. |
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
- **Node 3 merge commit:** `77db2f8`
- **Node 4 reported commit:** `279f747d9d414c667d0b9e9dd95c28e861444ece` (short SHA `279f747d`)
- **Node 4 release:** Antigravity reported `git push origin main` succeeded with exit code 0. Vercel Deployments screenshot subsequently showed a Ready Production deployment for `279f747`.
- **Preview deployment:** At the time of the latest supplied Vercel Deployments screenshot, the visible Preview deployments were based on older commit `8f06734`; a Preview deployment of `279f747d` had not yet been verified.
- **Local worktree note:** Antigravity created a detached worktree at `C:\Users\ayush\Downloads\portfolio\preview-worktree` for commit `279f747d9d414c667d0b9e9dd95c28e861444ece`. The attempt to run `vercel link` from the main project directory successfully linked that main directory to the existing `ayushhalpati09-gmailcoms-projects/portfolio` Vercel project and updated its local `.env.local`; no Preview deployment was reported from that attempt. Do not expose or commit any local environment values.
- Before any subsequent Git/deployment action, re-check `git status --short --branch`, current branch, `git log`, and relationship with `origin/main`. Do not assume there are no uncommitted or untracked files.
- Do not use destructive commands such as `git reset --hard`, `git clean`, or force-push to “synchronize” the checkout. Preserve local changes and investigate discrepancies first.

## 7. Node 4 — JD-Fit Workflow

**Status: Implemented and pushed to `main`; Production deployment reported Ready; manual Production testing exposed two errors. Root-cause investigation is in progress. Do not mark Node 4 fully validated until the errors are diagnosed and retested safely.**

### Implementation Summary

- **Routes & UI:**
  - Candidate-facing fit analysis UI at `/fit` (`app/fit/page.tsx`).
  - Fit analysis API at `/api/jdfit/analyze` (`app/api/jdfit/analyze/route.ts`).
  - Submission ingestion and consent routing at `/api/jdfit` (`app/api/jdfit/route.ts`).
  - Admin login UI (`app/jdfit/admin/login/page.tsx`) and Dashboard (`app/jdfit/admin/page.tsx`).
  - Admin auth & API routes: `/api/jdfit/admin/login`, `/api/jdfit/admin/data`, `/api/jdfit/admin/delete`.
- **Database Layer (`lib/jdfit/db.ts`):**
  - Migration `db/migrations/003_jdfit.sql` defining `jdfit_submissions`, `jdfit_skill_aggregates`, and `jdfit_aggregate_counters`.
  - Four consent combinations were reported passing with mocked/unit or Development tests. This does not prove current deployed persistence succeeds.
  - Safe submission deletion (`deleteSubmission`) is intended to remove an individual candidate record while leaving anonymous skill aggregates and counters intact.
- **Admin Security:**
  - Token-based session management (`lib/jdfit/admin.ts`) using HMAC-SHA256 tokens in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
  - Unauthenticated access to the admin data and delete APIs is intended to fail closed with HTTP 401.

### Node 4 — reported local verification

The latest reported local checks before/around the Node 4 push were:

| Check | Reported result | Limitation |
|------|------------------|-------------|
| `node tests/jdfit/consent.test.ts` | Exit code 0; report says four consent scenarios passed | Test used mock persistence; not a live Preview DB write test |
| `npm test --silent` | Exit code 0; 4 Jest suites, 12 test cases passed | Standalone consent test is excluded from Jest and run separately |
| `npx tsc --noEmit --pretty false` | Exit code 0 | Local type-check only |
| `npm run build` | Later follow-up reported exit code 0 | This is a local build result, not proof of deployed API success |

These are reports of local results and should not be treated as proof that every Production/Preview runtime flow works.

### Node 4 — Deployed UI observations (manual Production test)

The user tested `https://portfolio-nu-five-5a7rlm4q24.vercel.app/fit` after Node 4 was pushed to `main`. The UI page loaded and returned a structured JSON-like analysis result on screen, but the following errors were observed:

#### Issue A — Analyze error

- **Observed UI symptom:** Clicking **Analyze** can display a long error containing `Failed to validate JSON` and `json_validate_failed`.
- **Reported request path:** `POST /api/jdfit/analyze`.
- **Source-code path reported by inspection:** `app/api/jdfit/analyze/route.ts` calls `analyzeJobDescription` in `lib/jdfit/analyze.ts`. The Groq SDK call reportedly uses model `openai/gpt-oss-20b` and `response_format: { type: "json_object" }`. The route catches thrown provider errors and returns an application-level error response.
- **What this evidence establishes:** A user-facing analysis failure was observed; the code path and JSON response-format option have been inspected in source.
- **What remains unproven:** The precise reason Groq rejects the generation/request. No captured browser Network response or correlated Vercel runtime log was available during the reported investigation. Do not assume the prompt is wrong or claim malformed generated text without provider evidence.

#### Issue B — Save Choices error

- **Observed UI symptom:** Clicking **Save Choices** displays `Save error` in each tested selection:
  1. Only `Contribute anonymous insights` selected.
  2. Both `Save full submission` and `Contribute anonymous insights` selected.
  3. Only `Save full submission` selected.
- **Reported request path:** `POST /api/jdfit`.
- **Source-code path reported by inspection:** In `app/api/jdfit/route.ts`, `analyzeJobDescription(jobDescription)` is called before the consent-specific persistence branches. If this analysis call throws, the route returns HTTP 500 before reaching either `insertSubmission` or `applyAnonAnalytics`. If analysis succeeds, the full-save branch calls `insertSubmission` and the anonymous branch calls `applyAnonAnalytics`.
- **What this evidence establishes:** Both the shared analysis-stage path and two separate persistence paths exist in source. The same analysis function is called by the Save Choices route before persistence.
- **What remains unproven:** Which stage caused the actual deployed Save error. There was no saved Network/HAR response and no correlated Vercel runtime stack/log in the workspace at the time of investigation. Therefore a shared root cause is plausible but unconfirmed; a separate persistence failure is also possible.
- **Important UI detail:** The UI handler can fall back to the generic string `Save error` if the response is not JSON or does not contain an `error` field. The visible message alone does not prove a database failure.

### Node 4 — Environment and safe diagnostics status

- The user inspected Vercel project Environment Variables and confirmed the Preview and Production `DATABASE_URL` entries point to different databases. Do not disclose either value.
- The supplied screenshot showed `GROQ_API_KEY` configured for Production and Preview and showed separate Preview/Production entries for `DATABASE_URL`; this does not prove the values are valid or that Preview's JD-Fit schema has been applied.
- The screenshot did not show `JDFIT_DB_MOCK=1`. Absence from that visible list is not by itself a complete configuration audit.
- The supplied Vercel Deployments screenshot showed:
  - Node 4 `279f747` — Production — Ready.
  - Visible Preview deployments were on older commit `8f06734`.
- A Preview environment must be verified to contain Node 4 commit `279f747d` or a descendant before collecting diagnostic runtime evidence.
- The Preview database's applied migration state, including `003_jdfit.sql`, has **not yet been verified** by the evidence in this handoff.
- No more consent-enabled requests should be sent to Production for debugging. Do not run migrations or perform Preview writes until Preview URL/source, isolated database, and schema readiness are verified.

### Node 4 — Diagnosis workflow (current next steps)

1. Create or identify a Vercel **Preview** deployment built from commit `279f747d` or a descendant. Current visible Preview deployments were older. A detached Git worktree exists at `C:\Users\ayush\Downloads\portfolio\preview-worktree` at commit `279f747d9d414c667d0b9e9dd95c28e861444ece`, but it was not yet successfully deployed to Preview in the reported status.
2. Verify the exact Preview URL/commit and the Preview database's isolation and `003_jdfit.sql` schema, using read-only evidence. Do not assume a distinct `DATABASE_URL` guarantees migration readiness.
3. On verified Preview, first capture a safe **Analyze** request's actual status and sanitized response, plus correlated runtime logs if available.
4. Only after verifying that the no-consent `POST /api/jdfit` path does not perform consent/persistence writes, use a no-consent request if needed to observe its shared analysis path. Note that it still calls the external model API and may have rate-limit side effects.
5. For consent-enabled persistence debugging, use only the verified isolated Preview database after schema readiness is confirmed. Record the actual status, sanitized response, and relevant runtime error. Never test this on Production again.
6. Diagnose both issues from evidence first. Classify the root cause as confirmed, strongly supported, or unresolved. Then fix one issue at a time, run focused tests, and re-verify Preview before considering a Production update.
7. Keep the candidate-facing visual redesign separate and out of scope until the current functionality has been diagnosed and validated. Admin UX is also out of scope for this current bug investigation.

### Node 4 — Current status summary

| Item | State |
|------|-------|
| Feature implementation pushed to `main` | Reported complete |
| Production deployment of commit `279f747` | Vercel screenshot showed Ready |
| Local Jest/consent/TypeScript/build checks | Reported passing at local checkpoint |
| Manual deployed UI test | **Failed:** Analyze JSON-validation error and Save Choices error observed |
| Exact Analyze root cause | **Unresolved** pending runtime evidence |
| Exact Save Choices failure stage | **Unresolved** pending runtime evidence |
| Latest Preview using Node 4 commit | Not yet verified; visible previews were older |
| Preview migration readiness | Not yet verified |
| Production changes for error fixes | None reported; do not patch Production blindly |

## 8. Option 4 — Bold Swiss Editorial Redesign

**Status: Implemented and locally verified on dedicated feature branch `feat/bold-swiss-editorial`. Awaiting Production release approval.**

### Implementation Summary
- **Design System & Foundations (`app/globals.css`, `app/layout.tsx`):**
  - High-contrast Bold Swiss Editorial aesthetic: warm ivory/off-white background (`#F9F8F6`), deep black text and structural borders (`#111111`), subtle grid lines (`#111111`/15), and pure cobalt blue accents (`#0047FF`).
  - Text selection styled with cobalt blue highlight and crisp white text.
- **Navigation & Footer (`components/SiteHeader.tsx`, `components/SiteFooter.tsx`):**
  - Minimalist uppercase editorial header with active dot indicators and smooth section anchors (`#work`, `#stack`, `#ask`, `#about`, `#contact`).
  - Solid 2px architectural boundary footer featuring direct inquiries, verified GitHub profile, and verified placeholder contact email (`mailto:YOUR_EMAIL`) safely retained.
- **Hero & Case Studies (`components/Hero.tsx`, `components/FeaturedProjects.tsx`, `components/FeaturedProjectCard.tsx`, `components/MoreProjects.tsx`):**
  - Oversized editorial typography (`sm:text-7xl lg:text-8xl`), metadata status bar (`FIG. 01`, `SYS // ONLINE`), and grayscale-to-color hover portrait.
  - Numbered case studies (`CASE // 01`, `CASE // 02`), offset box shadows (`8px 8px 0px 0px #0047FF`), and archived experiments gallery (`ARCHIVE // 03+`).
  - Case study deep-dive templates and project pages (`CaseStudy.tsx`, `tableflow/page.tsx`, `deliveryproof/page.tsx`) updated to light editorial styling with structured finding-to-feature tables and high-contrast bug cards.
- **Ask Ayush RAG Presentation (`components/AskAyush.tsx`, `lib/rag/llm.ts`):**
  - Upgraded Markdown answer presentation for GitHub-Flavored Markdown: custom typographic styles for headings (`h1`, `h2`, `h3`), lists, code blocks (monospaced syntax block styling), blockquotes with cobalt borders, formatted tables, and inline links.
  - LLM system prompt enhanced to format structured, readable Markdown with clear headings and concise bullets.
  - All RAG guarantees preserved: streaming NDJSON pipeline, request validation, rate limiting, grounding retrieval, and request-scoped Trace Viewer with timings and sources.
- **Resume and Contact Guardrails:**
  - Resume button safely kept disabled pending verified final asset selection.
  - Placeholder contact email kept intact without inventing addresses.

### Local Verification Results
- **TypeScript Check:** `npx tsc --noEmit` passed with 0 errors.
- **Automated Tests:** `npm test` (Jest) passed with 4 suites, 12 tests passed.
- **Node 3 Observability Regressions:** `node scripts/node3_parser_offline_test.cjs` passed cleanly.
- **Production Build:** `npm run build` compiled all 14 routes successfully with Turbopack (exit code 0).
- **Database & Route Integrity:** Zero database migrations applied, zero Production environment variable modifications, Node 4 JD-Fit routes (`/fit`, `/jdfit/admin`) and Node 5/6 scopes completely untouched.

## 9. Future Nodes

- **Node 5:** Admin, analytics, and stronger rate limiting — planned; separate from the existing Node 4 admin UI/API implementation.
- **Node 6:** Architecture pages — planned.

## 10. Working Rules

1. This file is the central handoff and should be updated in place when an approved milestone changes the project state.
2. Start with a read-only repository and Git-state audit before editing.
3. Keep each node scoped; do not bundle future nodes into the current one.
4. Preserve uncommitted changes and unknown files. Never overwrite, delete, reset, or clean files without an explicit, evidence-based reason and approval.
5. Do not invent project facts, skills, test results, or deployment status. Distinguish observed results from assumptions.
6. Run relevant tests and inspect the final diff before commit.
7. Use a feature branch, Preview validation, and a PR to `main`; merge only after required checks and manual acceptance, except where a documented explicit release decision authorizes another path.
8. Verify the Production deployment and its key user flows after merge.
9. Ayush is the final decision authority; stop for approval at the agreed review gates.

---

*Central handoff updated with reported Node 4 release state and evidence-based record of the two deployed JD-Fit errors, alongside Option 4 Bold Swiss Editorial redesign implementation on feat/bold-swiss-editorial.*
