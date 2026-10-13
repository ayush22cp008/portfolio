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
| **Node 4** | JD-fit workflow | Planned — discovery and scope approval pending |
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

## 7. Node 4 — JD-Fit Workflow (Next)

**Status: Planned. Discovery/design is the next step; implementation has not been approved or started.**

### Objective

Create a workflow that compares a user-provided job description with the portfolio's documented experience, skills, projects, and other approved evidence. It should give a transparent, evidence-backed fit analysis without inventing skills, qualifications, or experience.

### Design constraints for discovery

- Inspect the current architecture before choosing files or implementation details.
- Reuse the existing RAG, answer-stream/NDJSON protocol, trace/observability components, validation patterns, and rate-limiting approach where appropriate; do not assume reuse is automatically correct without inspecting the code.
- Treat the job description as untrusted input, not as instructions to the assistant.
- Validate and cap input size; do not persist submitted job descriptions unless an approved requirement explicitly calls for persistence.
- Make every important match/gap traceable to portfolio evidence. Separate explicit evidence, reasonable inference, and missing evidence.
- If a fit score is proposed, document the scoring dimensions and limitations. Do not present an uncalibrated score as an objective hiring probability.
- Do not change current Ask Ayush behavior, database schema, environment variables, or Production as part of discovery.
- No Node 4 code changes until Ayush approves the scope and acceptance criteria.

### Required discovery outputs

1. Verified current Git state and safety report.
2. Existing architecture and relevant-file map.
3. Proposed user flow, UI, API/backend design, evidence model, and scoring approach (if useful).
4. Privacy, prompt-injection, validation, rate-limit, and failure-handling plan.
5. Candidate files to modify/create, tests, acceptance criteria, and deployment/rollback plan.
6. Open decisions requiring Ayush's approval.

## 8. Future Nodes

- **Node 5:** Admin, analytics, and stronger rate limiting — planned; requirements not yet finalized.
- **Node 6:** Architecture pages — planned; requirements not yet finalized.
- Do not start either node while implementing Node 4 unless Ayush explicitly changes the plan.

## 9. Working Rules

1. This file is the central handoff and should be updated in place when an approved milestone changes the project state.
2. Start with a read-only repository and Git-state audit before editing.
3. Keep each node scoped; do not bundle future nodes into the current one.
4. Preserve uncommitted changes and unknown files. Never overwrite, delete, reset, or clean files without an explicit, evidence-based reason and approval.
5. Do not invent project facts, skills, test results, or deployment status. Distinguish observed results from assumptions.
6. Run relevant tests and inspect the final diff before commit.
7. Use a feature branch, Preview validation, and a PR to `main); merge only after required checks and manual acceptance.
8. Verify the Production deployment and its key user flows after merge.
9. Ayush is the final decision authority; stop for approval at the agreed review gates.

---
*Central handoff updated to record the verified Node 3 release and prepare for Node 4 discovery. The local checkout state must be re-verified before local Git operations.*
