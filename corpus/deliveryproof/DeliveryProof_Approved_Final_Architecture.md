# DeliveryProof — Approved Final Architecture

> Curated from `ayush22cp008/Freight_Records` records only. This file reorganizes recorded architecture and accepted final-state material for portfolio/RAG ingestion. It does not introduce new capabilities or replace the original records.

## 1. Project identity and record authority

Project records identify the application source repository as `ayush22cp008/freight_hackathon` and the records repository as `ayush22cp008/Freight_Records`.

The current user-facing product brand is **DeliveryProof**. The records state that this was a presentation-layer branding change; internal technical identifiers such as repository names, package names, `FreightIdentity`, and `freight_identities` were preserved.

The execution/coordination boundary recorded in the project is:

```text
ChatGPT        → architecture / reasoning / boundary decisions
Antigravity    → implementation / execution only
Ayush          → final authority / manual tester / implementation authorizer
GitHub Records → source-of-truth bridge
```

## 2. Overall node architecture

The final project state records the following completed node structure:

```text
Historical Core MVP                    → COMPLETE / VERIFIED
Node 1 — Product + Authorization       → COMPLETE / LOCKED
Node 2 — Authentication + Identity     → COMPLETE / ACCEPTED
Node 3 — Company Trip Creation + Publishing → COMPLETE / ACCEPTED
Node 4 — Driver Marketplace + Atomic Claim   → COMPLETE / ACCEPTED
Node 5 — Whole Delivery Tracking       → COMPLETE / ACCEPTED
Node 6 — Security + Evidence           → COMPLETE / ACCEPTED
Node 7 — AI + Final Integration + Demo  → ACTIVE at Day 21 for demo-video preparation
```

Post-Node-5 dashboard and historical AI-summary follow-ups are recorded as closed/verified.

## 3. Node 1 — Product + Authorization Rework

### Identity model

```text
1 Auth User ↔ exactly 1 application identity
1 Auth User ↔ exactly 1 application role
Role = Company OR Driver
```

The locked Node 1 record states that an Auth User cannot simultaneously be Company and Driver or hold multiple application identities in the MVP.

### Trip participants

```text
Sending Company
Assigned Driver
Receiving Company
```

The Node 1 lock states that the same Company may be both Sending and Receiving in the original locked trip model, and that the same Company identity counts as one distinct participant for approvals, issues, evidence, visibility, and notifications. A later Chat50 governance decision changed this for **new Trip creation** by prohibiting a Company from selecting itself as Receiver; existing same-company Trips were preserved.

### Trip lifecycle

```text
DRAFT
  ↓
PUBLISHED / AVAILABLE
  ↓
CLAIMED
  ↓
IN_PROGRESS
  ↓
DELIVERED / COMPLETED
```

Cancellation is recorded for DRAFT, PUBLISHED, and CLAIMED (before IN_PROGRESS). Driver release is `CLAIMED → PUBLISHED / AVAILABLE`. The Node 1 lock states that release and cancellation are separate operations and that the backend is the source of truth for legal transitions.

### Delivery sequence

```text
PICKUP
  ↓
ARRIVED_AT_PICKUP
  ↓
PICKUP_CHECKED_IN
  ↓
GOODS_LOADED
  ↓
PICKUP_DEPARTED
  ↓
IN_TRANSIT
  ↓
ARRIVED_AT_DELIVERY
  ↓
RECEIVER_CHECKED_IN
  ↓
GOODS_UNLOADED
  ↓
DELIVERY_DEPARTED
  ↓
DRIVER_COMPLETION_CONFIRMED
  ↓
RECEIVER_DELIVERY_CONFIRMED
  ↓
DELIVERED / COMPLETED
```

Final completion requires both Driver completion and Receiving Company confirmation.

### Issues, emergency decisions, and evidence

All three distinct trip participants may raise General Delivery Issues. Emergency Change processing requires every other distinct participant to approve, or a rejection with reason; the requester cannot self-approve. If any required participant rejects, the request is rejected. Sender=Receiver counts once under the original Node 1 model.

Evidence is recorded contextually for delivery events, general delivery issues, emergency change requests, or corrective events. Original recorded evidence/events are not silently edited or deleted; corrections use preserved corrective records with reasons and references.

### Authorization and concurrency

Protected API operations are required to validate:

```text
Authenticated identity
+
Role
+
Resource relationship
+
Current state
+
Legal transition
+
Action-specific permission
```

Client-supplied identity IDs do not establish authorization. Resource IDs alone never grant access. Nested resources require parent-trip derivation and verification before authorization. Frontend restrictions are UX only; backend authorization is mandatory.

Critical state transitions are atomic/concurrency-safe. The locked record explicitly covers claim, release, start, cancel, emergency decisions, and final confirmations/completion. For competing valid transitions, the first valid atomic transition that commits wins and the losing request returns a state-conflict rather than silently overwriting state.

## 4. Node 2 — Authentication + Identity

The accepted Node 2 checkpoint records this active architecture:

```text
Email + Password
        ↓
Supabase Auth User
        ↓
Exactly 1 Freight Identity
        ↓
Company OR Driver
        ↓
PENDING verification
        ↓
Authorized reviewer
        ↓
Approve / Reject
        ↓
VERIFIED + trusted role
        ↓
Role-aware Active Gate
        ↓
Driver Dashboard OR Company Dashboard
```

Driver onboarding is recorded as:

```text
Driver signup
→ Email + Password
→ DRIVER role selected
→ Driving Licence evidence upload
→ PENDING verification
→ Reviewer Queue
→ Open/View evidence
→ Approve or Reject with reason
→ Approved Driver reaches Driver Dashboard
```

Company onboarding is recorded as:

```text
Company signup
→ Email + Password
→ COMPANY role selected
→ GST evidence upload
→ PENDING verification
→ Reviewer Queue
→ Open/View evidence
→ Approve or Reject with reason
→ Approved Company reaches Company Dashboard
```

Onboarding evidence is stored as an actual file in the Supabase onboarding evidence Storage bucket and accessed through the application review flow rather than exposed publicly.

The accepted identity model distinguishes user-requested intent from trusted authorization. The records state that a `PENDING` or `REJECTED` identity must not perform protected Driver/Company operations or bypass verification with client-controlled role fields.

## 5. Node 3 — Company Trip Creation + Publishing

Node 3 is recorded as COMPLETE / ACCEPTED. Its documented scope is Company Trip creation/publication together with the transition into the Driver claim flow.

The Day 10 checkpoint records:

- build: PASS (`npm run build`);
- security check: PASS for server-side trip identity resolution and rejection of client-supplied IDs for sensitive event operations;
- manual verification: PASS for the Claimed → Start Arrival flow.

## 6. Node 4 — Driver Marketplace + Atomic Claim

Node 4 is recorded as COMPLETE / ACCEPTED.

The accepted claim mechanism is a server/database-side conditional update equivalent to:

```text
UPDATE trips
SET status = 'claimed', driver_id = authenticated_driver
WHERE id = requested_trip_id
  AND status = 'published'
  AND driver_id IS NULL
```

This makes the first valid claim win at the database layer. The accepted checkpoint records that:

- only published, unclaimed trips are claimable;
- Driver identity is resolved from the authenticated session;
- client input cannot select an arbitrary driver identity;
- a claimed trip is no longer available to other drivers;
- competing claims produce a conflict/failure response when no longer available.

Ayush manually verified two authenticated driver sessions attempting to claim the same published trip and observed exactly one successful claim.

The separate automated local race-test infrastructure was explicitly deferred and was not represented as passed.

## 7. Node 5 — Whole Delivery Tracking

Node 5 extends the original three-event workflow into a single-delivery lifecycle from pickup through completion.

### Canonical lifecycle milestones

```text
ARRIVED_AT_PICKUP
PICKUP_CHECKED_IN
GOODS_LOADED
PICKUP_DEPARTED
IN_TRANSIT
ARRIVED_AT_DELIVERY
RECEIVER_CHECKED_IN
GOODS_UNLOADED
DELIVERY_DEPARTED
```

The records distinguish responsibilities:

```text
trips.status
→ overall trip state

trips completion confirmations
→ final human acknowledgements

events
→ detailed physical delivery evidence
```

The accepted Node 5 architecture retains `UNIQUE (trip_id, event_type)` for canonical single-occurrence lifecycle milestones. Historical lowercase event values remain valid for historical records; new canonical lifecycle writes use the locked uppercase vocabulary.

Final completion requires both Driver and Receiving Company confirmation. The final accepted completion flow was reconciled to REST/PostgREST confirmation logic after an RPC migration path failed against a non-existent `trips.updated_at` column. The obsolete completion RPC migration was removed from the source repository.

## 8. Node 6 — Security + Evidence

Node 6 is recorded as COMPLETE / ACCEPTED.

The accepted technical verification covered:

- IDOR attack paths blocked;
- privileged API routes explicitly authorized;
- Driver assignment boundary enforced;
- Company relationship boundary enforced;
- atomic claim security;
- evidence immutability;
- rate limiting;
- recorded security tests and Ayush approval.

The verification scope included event routes, completion routes, trip claim/publish routes, and the AI summary API `/api/summary`.

The checkpoint states that no failed security gaps were reported and `npx tsc --noEmit` passed with exit code 0.

## 9. Node 7 — AI + Final Integration + Demo

### Portal baselines

The final Day 21 state records the three portal baselines as locked:

```text
Driver Portal   → COMPLETE / ACCEPTED / LOCKED
Company Portal  → COMPLETE / ACCEPTED / LOCKED
Reviewer Portal → COMPLETE / VERIFIED / LOCKED
```

### Reviewer architecture

The locked Reviewer blueprint defines the Reviewer as an **Identity & Evidence Verifier** rather than general administration.

Core mental model:

```text
Applicant
    +
Claimed Role
    +
EVIDENCE
    ↓
Evaluation
    ↓
Identity / Role Verification
    ↓
Approve / Reject
```

The Reviewer workflow includes Verification Queue, Applicant Verification, Decision Result, Verification History, and a read-only completed verification record. The blueprint prohibits AI verification, automated verification, evidence scoring, confidence scoring, trip operations, claims handling, and general administration.

The accepted Reviewer decision flow preserves a separation between the human `Identity / Role Verified` action and the final persistent Approve/Reject decision. Final decision failures leave the applicant pending rather than assuming success.

### Runtime AI capability

The final records describe AI specifically as an **AI Evidence Summary** capability available after a trip has completed, grounded in recorded structured delivery evidence/events. Deterministic operational logic remains deterministic.

The final Cross-Portal E2E verification recorded the AI Evidence Summary as visible and passed.

### Public evidence and timeline

The final Cross-Portal verification records the completed delivery lifecycle and evidence/timeline presentation as part of the integrated workflow. A final manual run demonstrated continuity across Company creation/publication, Driver claim, delivery milestones, Receiving Company confirmation, final completion, evidence/timeline presentation, and AI Evidence Summary.

## 10. Final governed exception — same-company NEW Trip rule

A Day 21 governance decision changed the previous Company behavior for **new Trips only**:

```text
Sending Company = Receiving Company
→ REJECT NEW Trip

Sending Company ≠ Receiving Company
→ ALLOW normal workflow
```

The required invariant is:

```text
Trip.company_id != Trip.receiving_company_id
```

The accepted implementation was manually verified through both the deployed UI and a direct authenticated API request. A same-company request returned HTTP 400, while a cross-company workflow completed successfully in the final E2E run.

Existing legacy same-company Trips were preserved and not migrated.

## 11. Intentionally dropped / protected architecture

The Day 21 auto-refresh proposal was investigated but dropped from current implementation scope. The final status distinguishes:

```text
Global fixed-timer auto-refresh       → REJECTED / NOT IMPLEMENTED
Event-driven scoped auto-refresh      → INVESTIGATED / NOT IMPLEMENTED
Production Realtime publication       → VERIFIED TO EXIST
Current implementation status          → DROPPED FROM CURRENT SCOPE
```

The records explicitly protect APIs, database/schema, RLS/security, authentication/roles, trip lifecycle semantics, claiming, evidence integrity, backend behavior, AI behavior, and Reviewer authority from unrelated changes unless separately investigated and explicitly approved.

---

## Source records used

- `01_BRAIN_HANDOFFS/ChatGPT/Chat10_Node1_FINAL_LOCK.md`
- `00_PROJECT_CONTROL/CHECKPOINTS/Chat15_Day8_Node2_Completion_Checkpoint.md`
- `00_PROJECT_CONTROL/CHECKPOINTS/Chat17_Day10_Node3_Completion_Checkpoint.md`
- `00_PROJECT_CONTROL/CHECKPOINTS/Chat24_Node4_Completion_Checkpoint.md`
- `02_ARCHITECTURE/locked_decisions/Chat24_Node5_Architecture_Decisions.md`
- `00_PROJECT_CONTROL/CHECKPOINTS/Chat26_Node5_Completion_Checkpoint.md`
- `03_IMPLEMENTATION/implementation_reports/Chat26_Node5_Final_Completion_Source_Synchronization_Fix_Report.md`
- `00_PROJECT_CONTROL/CHECKPOINTS/Chat28_Node6_Completion_Checkpoint.md`
- `02_ARCHITECTURE/locked_blueprints/Reviewer_Locked_Blueprint.md`
- `02_ARCHITECTURE/Chat50_Day21_Node7_SameCompany_Sender_Receiver_Governance_Decision.md`
- `00_PROJECT_CONTROL/PROJECT_STATE.md`
- `00_PROJECT_CONTROL/CURRENT_STATUS.md`
