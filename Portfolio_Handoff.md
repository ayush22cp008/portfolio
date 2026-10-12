# Portfolio Handoff

## 1. Project Overview

- **Repository:** `ayush22cp008/portfolio`
- **Product:** Ask Ayush, the portfolio's grounded RAG assistant.
- **Goal:** Build a portfolio that demonstrates real, verifiable AI engineering capabilities.
- **Implementation executor:** Antigravity.
- **Final decision authority:** Ayush.

## 2. Node Roadmap

| Node | Description | Status |
|------|-------------|--------|
| **Node 1** | Basic grounded RAG agent | Completed and closed |
| **Node 2** | Backend tool calling | Implementation and runtime tests reported as successful; local changes awaiting final review, commit, and push |
| **Node 3** | Trace viewer and observability | Planned (next node) |
| **Node 4** | JD‑fit workflow | Planned |
| **Node 5** | Admin, analytics, and stronger rate limiting | Planned |
| **Node 6** | Architecture pages | Planned |

## 3. Node 1 — Completed Baseline

- Grounded retrieval over approved portfolio sources.
- Answer generation and source references.
- Request validation and existing rate‑limiting protections.
- Existing streaming response pipeline.
- Security and grounding constraints.

## 4. Node 2 — Backend Controlled Tool Calling

| Tool | Responsibility |
|------|----------------|
| `get_project_details` | Retrieve details for an allowlisted portfolio project. |
| `fetch_github_stats` | Fetch public GitHub statistics for an allowlisted project. |

### Reported fixes

- The generic project‑listing shortcut initially intercepted specific project‑detail queries.
- Added explicit‑tool and natural-language project‑detail guards to allow relevant requests to reach tool selection.
- Corrected the Groq SDK tool‑message type to `ChatCompletionToolMessageParam`.
- Preserved the existing retrieval, validation, allowlist, rate‑limiting, and NDJSON streaming design.

## 5. Node 2 — Runtime Verification

| Test | Observed outcome |
|------|-------------------|
| **A — Generic project listing** | HTTP 200; normal listing; no tool event. |
| **B — Natural‑language TableFlow details** | HTTP 200; RAG answer; no tool event (not a tool invocation). |
| **C — GitHub statistics** | HTTP 200; `fetch_github_stats` tool event reported. |
| **D — TableFlow technology stack** | HTTP 200; normal RAG answer; no tool event. |
| **E — Explicit `get_project_details` request** | HTTP 200; `get_project_details` tool event and result reported. |

The latest agent report indicates `npm run build` passed and TypeScript type‑checking succeeded.

## 6. Current Git State (reported)

- **Branch:** `main`
- **HEAD:** `23f57f0ca62d0225149ed00d1919ccdaf458e09b`
- **Modified and uncommitted:** `lib/rag/llm.ts`
- **Untracked files:**
  - `Portfolio_Handoff.md`
  - `integration_test.ts`
  - `run_ask_test.ts`
  - `run_ask_test2.ts`
  - `scripts/regression_test.ts`
  - `scripts/verify_answers.ts`
  - `test_tool_call.ts`

*These statuses are based on the previously reported state and must be re‑checked before any Git operation.*

**Previous Git status snapshot (after file creation):**
```
## main...origin/main
 M lib/rag/llm.ts
?? Portfolio_Handoff.md
?? integration_test.ts
?? run_ask_test.ts
?? run_ask_test2.ts
?? scripts/regression_test.ts
?? scripts/verify_answers.ts
?? test_tool_call.ts
```

**Current Git status (after this edit):**
```
## main...origin/main
 M lib/rag/llm.ts
?? Portfolio_Handoff.md
?? integration_test.ts
?? run_ask_test.ts
?? run_ask_test2.ts
?? scripts/regression_test.ts
?? scripts/verify_answers.ts
?? test_tool_call.ts
```

- Trace requests and tool execution.
- Capture safe, useful execution metadata.
- Expose actual tool events to the frontend.
- Add a visitor‑facing activity indicator or trace‑viewer UI.
- Distinguish actual tool execution from ordinary RAG responses.
- Avoid exposing secrets, stack traces, private data, or unsafe internal information.

Node 3 will be addressed as a separate task after Node 2 is formally closed.

## 8. Completion Gates for Node 2

Node 2 may be formally closed only after:
1. The current source diff is reviewed.
2. Production build and relevant tests are confirmed.
3. This handoff file is saved.
4. Ayush reviews and approves the final changes.
5. The approved source changes are committed and pushed.

---
*File created as part of the central portfolio handoff record.*
