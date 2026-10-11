# Ayush — Canonical Engineering, AI-Agent & Project-Building Architecture

**Status:** Final reconciled knowledge source

**Purpose:** This document is the canonical natural-language source for explaining how Ayush approaches software projects, AI-assisted development, debugging, verification, engineering memory, and AI-agent architecture across his work. It is intended for portfolio/RAG grounding, future agent handoffs, and cross-project understanding.

**Evidence rule:** This document deliberately distinguishes observed/implemented work from ideas that are discussed or planned. A future architecture must never be represented as a current capability without evidence.

---

# 1. Evidence Model

The document uses four states:

### VERIFIED
Supported by implementation evidence, project records, production/local verification, or a directly recorded fact about Ayush's actual workflow.

### OBSERVED WORKFLOW
A recurring practice that has actually been used across one or more projects or sessions, but is not necessarily a formal written policy.

### DISCUSSION / PROPOSED
An architecture or workflow idea that has been discussed but is not established as an implemented capability.

### UNVERIFIED
Not enough evidence to treat the claim as factual. The claim should remain outside factual portfolio answers until checked.

Where evidence is limited, the wording is intentionally conservative.

---

# 2. Core Engineering Mindset

Ayush's strongest recurring engineering pattern is **human-directed, AI-assisted, incremental, evidence-driven development**.

The core mindset is:

> Use AI to increase development speed and reasoning capacity while keeping the system understandable, controlled, verifiable, and honestly represented.

Recurring principles supported by the project history include:

- understand the actual problem before changing code;
- break complex work into manageable units;
- keep scope controlled and avoid unrelated side quests;
- preserve working architecture unless there is evidence that it needs to change;
- separate investigation from the fix;
- prefer evidence over guesses when a failure can be observed or traced;
- make the smallest justified change;
- verify before accepting a change;
- keep important project state recoverable across sessions and agents;
- document meaningful decisions and external changes;
- describe completed work honestly rather than inflating capabilities.

These principles describe the **mindset layer**. The exact tools and task sequence can vary by project.

---

# 3. General Project-Building Workflow

A generalized representation of Ayush's workflow is:

```text
Problem / Goal
      ↓
Understand constraints and expected behavior
      ↓
Inspect the existing system / available evidence
      ↓
Architecture or implementation plan
      ↓
Decompose into manageable work units
      ↓
Approve the intended task / scope
      ↓
Implement one controlled unit
      ↓
Build / test / inspect
      ↓
Manual or production verification where relevant
      ↓
If a failure exists:
  observe → investigate → evidence → root cause → decision
      ↓
Apply the smallest confirmed fix
      ↓
Re-verify
      ↓
Commit / push the verified checkpoint
      ↓
Document important state / decisions / handoff
```

This is a generalized pattern, not a claim that every project used every step in exactly this order.

---

# 4. Feature Workflow vs Bug Workflow

Ayush's work benefits from keeping normal feature implementation separate from failure investigation.

## Feature / implementation workflow

```text
Goal
→ Plan / specification
→ Scope + constraints
→ Agent execution
→ Build / test / inspect
→ Manual verification
→ Approval / acceptance
→ Commit / push
→ Record / handoff
```

## Bug / failure workflow

```text
OBSERVATION
→ INVESTIGATION
→ EVIDENCE
→ ROOT CAUSE
→ DECISION
→ FIX
→ BUILD / TEST
→ MANUAL OR PRODUCTION VERIFICATION
→ APPROVAL
→ COMMIT / PUSH
→ RECORD
```

A diagnosis task should not silently become a speculative fix. The investigation establishes what is actually wrong; the fix addresses the confirmed cause.

---

# 5. Problem Understanding and Planning

Before implementation, Ayush commonly establishes what the task is supposed to accomplish and what must remain unchanged.

Typical planning questions are:

- What problem are we solving?
- What is the expected behavior?
- What existing behavior must remain intact?
- Which files, components, services, or data are actually relevant?
- What evidence will prove completion?
- What is explicitly out of scope?

For larger changes, the plan is often written down before execution so the coding agent has a bounded target instead of an open-ended instruction.

---

# 6. Project Decomposition

Complex projects are commonly divided into explicit units such as **Nodes, Phases, and investigation/fix stages**.

## Nodes

A Node is a bounded unit of project work. TableFlow and the freight/DeliveryProof work use Node-based organization to separate major capabilities and keep the project state recoverable.

Node status conventions have included:

```text
✅ LOCKED
🔄 ACTIVE
⬜ NOT STARTED
```

A verified/locked Node is normally not reopened without a concrete reason.

## Phases

Phases can further divide a Node into implementation and verification steps.

## Scope control

Work is intentionally kept bounded. Under deadline pressure, features can be reduced, deferred, or made conditional rather than allowing the entire project plan to expand.

## Handoffs and chat continuity

Long-running projects use handoff prompts, persistent records, Node Maps, and chat/session numbering so that the next session or reasoning agent can recover state without relying entirely on a single model context.

---

# 7. AI-Assisted Development Model

Ayush has used multiple AI systems rather than treating one model as the permanent authority.

## Reasoning / planning brains

**ChatGPT, Claude, and Grok** have been used as peer reasoning assistants in the broader workflow. The reasoning-brain slot can change depending on the project, availability, or usage limits; the intent is to have one active reasoning brain at a time rather than multiple reasoning agents simultaneously altering the same project state.

Typical reasoning-side activities include:

- architecture discussion;
- requirements clarification;
- investigation design;
- debugging reasoning;
- implementation specifications;
- review of coding-agent output;
- planning follow-up work;
- handoff preparation.

## Coding executor

**Antigravity** has been a primary coding executor for repository work. Its observed responsibilities include file edits, terminal commands, builds, tests, and log inspection.

## Human decision / verification

Ayush remains the final authority for consequential acceptance decisions. His responsibilities include setting goals and constraints, reviewing evidence, performing manual UI/browser checks where applicable, and deciding when a verified checkpoint is ready to be committed or pushed.

This is a **human-in-the-loop working process**, not evidence of a fully autonomous software-engineering agent.

---

# 8. Stable Role Boundaries

The role boundaries are more stable than the specific tool names:

```text
Reasoning brain (ChatGPT / Claude / Grok)
        ↓
planning / diagnosis / architecture / specification
        ↓
Coding executor (e.g. Antigravity)
        ↓
implementation / terminal / build / test
        ↓
Ayush
        ↓
review / manual validation / acceptance
        ↓
GitHub + project records
```

The reasoning brain can change. The distinction between reasoning, execution, and human acceptance remains the more durable part of the workflow.

Reasoning assistants are not treated as automatically having permission to modify the source repository. Repository edits are carried out by the designated coding executor in the established workflow.

---

# 9. Agent Instruction Style

Ayush prefers constrained, copy-paste-friendly instructions rather than vague requests.

A strong task prompt commonly defines:

1. the exact objective;
2. the known evidence;
3. the relevant scope or files;
4. what must not be changed;
5. validation commands or tests;
6. the expected report;
7. when the agent should stop.

This is a practical pattern rather than a rigid universal seven-field specification.

The intent is to reduce:

- speculative refactors;
- accidental scope expansion;
- changes to protected architecture;
- unclear completion criteria.

Agent output is work to verify, not a substitute for evidence.

---

# 10. Evidence-First Debugging

One of the clearest recurring patterns is:

```text
Observed symptom
      ↓
Trace the relevant request / function / module / database path
      ↓
Inspect exact logs / response / test result / screenshot
      ↓
Identify the first confirmed failure
      ↓
Make the smallest justified change
      ↓
Verify locally
      ↓
Verify production when applicable
      ↓
Record the cause, fix, and verification result
```

The important rule is:

> Do not repeatedly change multiple layers when the failure can first be measured.

This approach has been used for UI behavior, database/RLS issues, deployment configuration, API behavior, dependency/runtime failures, streaming responses, and RAG retrieval behavior.

---

# 11. Recent Ask Ayush Debugging Example

The Ask Ayush production debugging work provides a particularly clear example of this mindset.

The observed chain was:

```text
UI showed a generic error
      ↓
Raw production NDJSON inspected
      ↓
ONNX/runtime packaging failure identified
      ↓
Tracing configuration corrected
      ↓
New failure exposed: Transformers.js tried to write under /var/task
      ↓
Cache redirected to writable /tmp/transformers-cache
      ↓
New failure exposed: Groq 401 Invalid API Key
      ↓
Vercel Groq secret replaced
      ↓
Production generation succeeded
```

The important lesson is not the individual technologies. It is the debugging method: **fix the currently proven failure, re-run the system, and use the next observed failure as the next diagnostic fact.**

---

# 12. Verification Philosophy

A successful build is not automatically treated as proof that the feature works.

Depending on the change, verification can include:

- TypeScript checks;
- builds;
- targeted tests;
- API requests;
- database inspection;
- log inspection;
- browser/manual testing;
- mobile/responsive testing;
- production endpoint testing;
- retrieval traces and similarity scores.

The exact verification set is **project-dependent**.

The depth of verification should increase with the consequences of the change, but a formal universal risk-tier policy is not asserted here.

---

# 13. Production Verification

Deployment is treated as a checkpoint, not as proof that runtime behavior is correct.

For production problems, Ayush has used direct endpoint testing, raw response inspection, and platform logs.

For streaming APIs, transport status alone is insufficient. A response can have HTTP 200 while the application-level stream contains an `error` frame.

For Ask Ayush, this distinction was used to diagnose production failures that were invisible from the browser's generic error state.

---

# 14. Git and Checkpoint Discipline

The observed preference is:

```text
implement
→ verify
→ checkpoint
→ continue
```

GitHub is used as persistent project state and as a recovery point between sessions.

A commit/push should represent an understood checkpoint rather than an unexplained bundle of experimental edits.

Pushes are user-controlled rather than autonomous agent actions in the established workflow.

---

# 15. Engineering Memory and Documentation

Persistent engineering memory matters because work spans multiple chat sessions and AI tools.

Useful artifacts include:

- master prompts;
- Node Maps;
- handoff prompts;
- investigation reports;
- error records;
- logs;
- READMEs and project documentation where applicable;
- committed implementation state;
- Git history;
- project-specific records repositories.

A recurring convention is that important external/manual changes should not remain undocumented. This includes changes made in SQL editors or cloud consoles when they materially affect the project state.

Engineering memory is intended to make the project recoverable even when the reasoning model or coding executor changes.

---

# 16. Cross-Project Methodology

The most useful common patterns across the documented projects are:

### Incremental decomposition
Large systems are divided into bounded Nodes, Phases, or investigation/fix units.

### AI as an engineering multiplier
AI systems accelerate reasoning, planning, coding support, debugging, and documentation without becoming the final authority over acceptance.

### Evidence-driven debugging
Logs, tests, screenshots, traces, and production requests are used to establish the cause before modifying the system.

### Controlled scope
Agents receive explicit limits, and unrelated working behavior is protected unless evidence requires a change.

### Persistent engineering memory
Important decisions, investigations, verification results, and handoffs are preserved for future sessions and tools.

### Honest representation
Capabilities and experience should be described conservatively. A capability demonstrated by one project should not automatically be presented as broad expertise across all work.

These patterns describe the **methodology layer** rather than any single project.

---

# 17. Methodology in Practice

Across portfolio work, the recurring pattern is to decompose complex work into explicit, bounded units; keep implementation scope controlled and protected from unrelated changes; validate behavior with evidence rather than assumption; and record important decisions for future sessions and handoffs.

For example: structured Node or Phase decomposition has been used to manage incremental development across multi-feature systems. Evidence-driven failure investigation has been applied to both local debugging and production diagnostics. Verification has included manual testing, API inspection, database inspection, log review, and platform-level production testing depending on the nature of the change.

Project-specific architecture, technologies, and verified implementation details are recorded in dedicated per-project sources rather than in this methodology document.

---

# 18. Methodology Applied to the Ask Ayush Project

Ask Ayush is a current example of applying the evidence-first engineering workflow to a grounded RAG system. Production failures were diagnosed by inspecting raw runtime behavior — actual stream frame content, upstream error messages, and platform logs — before any fix was applied. Each confirmed fix was minimal, verified, and committed as a checkpoint.

A broad AI-agent methodology query was previously measured to retrieve project-specific context rather than cross-project methodology content, demonstrating the need for a dedicated methodology source.

Detailed Ask Ayush architecture and implementation facts are recorded in dedicated project sources.

---

# 19. Methodology vs Project-Specific Knowledge

The knowledge base preserves two complementary layers.

Project-specific knowledge — architecture, technology choices, verified implementation details, and project timelines — belongs in dedicated per-project sources.

Methodology knowledge — how Ayush plans, decomposes work, works with AI assistants and coding agents, investigates failures, verifies changes, manages engineering memory, and controls scope — belongs in this source.

A project-specific source should answer questions about how a particular system works. This methodology source should answer questions about how Ayush generally approaches software and AI-system development. The two layers are complementary; neither replaces the other.

---

# 20. Future / Proposed AI-Agent Architecture

Ayush has discussed a longer-term AI-engineering architecture that goes beyond simple prompt → tool → response systems.

The following remain **DISCUSSION / PROPOSED**, not current implemented capabilities unless separately verified:

- memory provenance;
- contradiction detection;
- goal memory;
- knowledge graph;
- experiment-based learning;
- per-agent performance tracking;
- dynamic agent selection;
- risk-based autonomy;
- architecture evolution proposals with controlled approval;
- execution → testing → learning feedback loops;
- broader multi-agent coordination and verification mechanisms;
- bee/ant-inspired approaches to multi-agent verification and negative knowledge.

A conceptual future model is:

```text
Human Goal
    ↓
Planner / Orchestrator
    ↓
Task decomposition
    ↓
Agent selection
    ↓
Specialized agents / tools
    ↓
Execution
    ↓
Tests + observations + logs
    ↓
Memory + provenance + performance data
    ↓
Learning / strategy improvement
    ↓
Future planning
```

This model is a future architecture concept, not a statement that the full autonomous system already exists.

---

# 21. Human Approval and Governance

Observed governance patterns include:

- important changes are reviewed before acceptance;
- coding agents operate within explicit scope;
- external/manual changes should be recorded;
- source changes and GitHub pushes remain user-controlled;
- permissions and security boundaries are treated as part of the system rather than as an afterthought.

A formal universal risk-tiered approval framework should not be claimed unless separately implemented and verified.

---

# 22. What This Document Must Not Claim

Without additional evidence, this document must not be interpreted as saying that Ayush:

- has already built a fully autonomous coding-agent platform;
- has already implemented dynamic agent selection as a general software capability;
- already uses a knowledge graph for the agent system;
- already has contradiction detection or self-improvement implemented;
- has formal CI or automated testing on every project;
- uses the same model, tool, or executor on every project;
- always uses one particular AI assistant for architecture;
- follows a formal identical lifecycle on every project;
- has turned a single-project capability into universal expertise;
- has completed every future Node or architecture idea discussed in planning.

---

# 23. Questions This Source Should Ground

### How does Ayush approach building projects?

He generally uses a human-directed, AI-assisted, incremental process: understand the problem, plan and decompose it, constrain the implementation task, verify behavior, investigate failures from evidence, apply the smallest confirmed fix, validate the result, and preserve the checkpoint and documentation.

### How does Ayush use AI agents?

He uses reasoning assistants such as ChatGPT, Claude, and Grok to help with planning, architecture, diagnosis, specification, and review, while coding executors such as Antigravity handle repository implementation and terminal/build work in the established workflow. Ayush remains involved in acceptance and verification.

### How does Ayush debug?

He prefers observation and evidence first: inspect the real symptom, trace the relevant layer, find the first confirmed failure, change only the confirmed cause, and re-verify.

### How does Ayush build AI agents?

The current Ask Ayush project demonstrates a grounded RAG architecture. The broader self-improving multi-agent architecture remains a proposed direction unless separately verified.

### What is Ayush's engineering mindset?

Evidence over guessing, incremental progress, controlled scope, explicit verification, persistent engineering memory, human acceptance, and honest representation of capabilities.

---

# 24. Canonical Fact / Uncertainty Register

| Topic | Status | Notes |
|---|---|---|
| Evidence-first debugging | OBSERVED WORKFLOW | Repeated across documented work |
| Investigation separated from fix | OBSERVED WORKFLOW | Strong recurring rule |
| Node / Phase decomposition | OBSERVED WORKFLOW | Used in TableFlow and freight work |
| ChatGPT / Claude / Grok reasoning-peer model | OBSERVED WORKFLOW | Tool may change; role boundary stays stable |
| Antigravity as primary coding executor | OBSERVED WORKFLOW | Documented for multiple projects |
| Human final authority / acceptance | OBSERVED WORKFLOW | Human-in-the-loop process |
| GitHub checkpoint discipline | OBSERVED WORKFLOW | Pushes are user-controlled |
| Persistent handoff / engineering records | OBSERVED WORKFLOW | Used to preserve cross-session state |
| Honest portfolio positioning | VERIFIED / OBSERVED WORKFLOW | Explicit portfolio decisions support this |
| Ask Ayush as a methodology example | VERIFIED | Demonstrates evidence-first RAG development |
| Corpus methodology gap identified and filled | VERIFIED | Identified through retrieval investigation |
| Memory provenance | DISCUSSION / PROPOSED | Not a current implemented capability |
| Contradiction detection | DISCUSSION / PROPOSED | Not a current implemented capability |
| Knowledge graph | DISCUSSION / PROPOSED | Not a current implemented capability |
| Experiment-based learning | DISCUSSION / PROPOSED | Not a current implemented capability |
| Dynamic agent selection | DISCUSSION / PROPOSED | Not a current implemented capability |
| Risk-based autonomy | DISCUSSION / PROPOSED | Not a current implemented capability |
| Architecture self-evolution | DISCUSSION / PROPOSED | Not a current implemented capability |
| Fully autonomous coding agent | UNVERIFIED / MUST NOT CLAIM | No evidence of a completed general system |

---

# 25. Canonical Summary

**Ayush's current engineering approach is best described as human-directed, AI-assisted, incremental software development. He uses AI systems as reasoning and execution partners, but keeps the project bounded and recoverable, separates investigation from fixes, prefers evidence over guesses, verifies changes before acceptance, validates important behavior in production, preserves engineering memory through records and version control, and describes his capabilities conservatively. Ask Ayush is a concrete implementation of this evidence-oriented approach through a grounded RAG system; the more autonomous, self-improving multi-agent architecture remains a future/proposed direction rather than a claimed current capability.**

---

# 26. Source-Reconciliation Note

This final document reconciles:

1. ChatGPT's broader knowledge of Ayush's project, portfolio, RAG, and AI-agent work.
2. Claude's independent reconstruction of Ayush's workflow and project conventions.
3. Later verified evidence from the current Ask Ayush implementation and production debugging.

Claude's verification found **zero definitely false claims** in the reconciliation draft, while identifying several places where wording should be narrowed and several newer Ask Ayush facts that were outside Claude's independent knowledge. The final version incorporates those wording changes rather than treating lack of Claude knowledge as evidence of falsity.
