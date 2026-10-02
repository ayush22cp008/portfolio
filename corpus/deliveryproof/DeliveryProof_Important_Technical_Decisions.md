# DeliveryProof — Important Technical Decisions

> Curated from `ayush22cp008/Freight_Records` records only. Decisions below are restated from recorded architecture/verification material. Historical decisions that were later superseded are explicitly marked rather than silently rewritten.

## 1. One Auth User → One Application Identity

Decision: one authenticated user maps to exactly one application identity and exactly one application role in the MVP; the role is Company or Driver.

Recorded separation:

```text
PostgreSQL trigger
= atomic identity creation mechanism

UNIQUE(auth_user_id)
= database-level one-identity enforcement
```

Source: `01_BRAIN_HANDOFFS/ChatGPT/Chat10_Node1_FINAL_LOCK.md`, `00_PROJECT_CONTROL/CHECKPOINTS/Chat12_Day5_Node2_Checkpoint.md`.

## 2. Requested role is not trusted authorization

Node 2 records distinguish:

```text
requested_role
→ user-provided intent

verification_status
→ server-controlled

trusted_role
→ server-controlled
```

`PENDING` and `REJECTED` identities must not perform protected Driver/Company operations or bypass verification through client-controlled role data.

Source: `00_PROJECT_CONTROL/CHECKPOINTS/Chat12_Day5_Node2_Checkpoint.md`.

## 3. Controlled human onboarding verification

For the hackathon MVP:

```text
Driver  → Driving Licence evidence
Company → GST evidence/details
Verifier → Ayush
```

The accepted Node 2 flow uses evidence upload, Reviewer inspection, Approve/Reject, and role-aware access after verification.

Source: `00_PROJECT_CONTROL/CHECKPOINTS/Chat15_Day8_Node2_Completion_Checkpoint.md`.

## 4. Backend is authoritative for lifecycle transitions

The Node 1 lock defines the backend as the source of truth for legal next transitions. Client restrictions are UX only; protected operations must be authorized server-side.

Source: `01_BRAIN_HANDOFFS/ChatGPT/Chat10_Node1_FINAL_LOCK.md`.

## 5. Atomic claim is a database-level conditional update

The accepted Node 4 claim model is a conditional state update requiring:

```text
trip is published
AND
trip has no driver
AND
requested trip id matches
```

The authenticated Driver identity is derived server-side. The first valid transition commits; competing claims lose with a conflict/failure response.

Source: `00_PROJECT_CONTROL/CHECKPOINTS/Chat24_Node4_Completion_Checkpoint.md`.

## 6. Manual concurrency acceptance was used for Node 4

A two-driver deployed test was accepted for the hackathon closure after exactly one of two near-simultaneous claims succeeded. A separate local automated race-test environment was explicitly deferred and not represented as passed.

Source: `00_PROJECT_CONTROL/CHECKPOINTS/Chat24_Node4_Completion_Checkpoint.md`.

## 7. Trip state and detailed events are separate responsibilities

The Node 5 architecture records:

```text
trips.status
→ overall trip state

events
→ detailed delivery milestones/evidence

completion confirmation fields
→ final human acknowledgements
```

The project does not add `IN_TRANSIT` as a major `trips.status`; it is recorded as a canonical event milestone while the trip remains `in_progress`.

Source: `02_ARCHITECTURE/locked_decisions/Chat24_Node5_Architecture_Decisions.md`, `03_IMPLEMENTATION/implementation_reports/Chat25_Node5_S1_Delivery_Evidence_Schema_Migration_Design_Report.md`.

## 8. Canonical Node 5 event vocabulary

For new Node 5 lifecycle records, the accepted canonical event names are:

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

Historical lowercase `arrival`, `checkin`, and `departure` values remain valid for historical records.

Source: `02_ARCHITECTURE/locked_decisions/Chat24_Node5_Architecture_Decisions.md`.

## 9. Canonical lifecycle uniqueness is preserved

Node 5 retains the database-level uniqueness strategy equivalent to:

```text
UNIQUE (trip_id, event_type)
```

Canonical lifecycle milestones are single-occurrence within the single-delivery scope. Repeatable evidence was recorded as a separate deferred capability rather than weakening canonical lifecycle uniqueness.

Source: `02_ARCHITECTURE/locked_decisions/Chat24_Node5_Architecture_Decisions.md`, `03_IMPLEMENTATION/implementation_reports/Chat25_Node5_S1_Delivery_Evidence_Schema_Migration_Design_Report.md`.

## 10. Final completion requires dual confirmation

The accepted Node 5 model records Driver completion and Receiving Company confirmation separately and requires both before the trip reaches the completed state.

Source: `01_BRAIN_HANDOFFS/ChatGPT/Chat10_Node1_FINAL_LOCK.md`, `00_PROJECT_CONTROL/CHECKPOINTS/Chat26_Node5_Completion_Checkpoint.md`.

## 11. Completion RPC path was superseded by REST/PostgREST logic

A Node 5 completion migration initially introduced an RPC-based path, but investigation found that the RPC attempted to update a non-existent `trips.updated_at` column. The tested implementation was reconciled to REST/PostgREST confirmation logic and the obsolete `009_node5_completion_rpc.sql` migration was removed.

Source: `00_PROJECT_CONTROL/CHECKPOINTS/Chat26_Node5_Completion_Checkpoint.md`, `03_IMPLEMENTATION/implementation_reports/Chat26_Node5_Final_Completion_Source_Synchronization_Fix_Report.md`.

## 12. Source synchronization is part of completion evidence

For Node 5, the project explicitly reconciled the source repository with the manually tested deployment. The final synchronization verification recorded:

```text
Completion routes use REST/PostgREST logic
RPC references in completion routes → NONE
009_node5_completion_rpc.sql → DELETED
npx tsc --noEmit → 0 errors
```

Source: `03_IMPLEMENTATION/implementation_reports/Chat26_Node5_Final_Completion_Source_Synchronization_Fix_Report.md`.

## 13. Security verification covers privileged APIs

Node 6 verification explicitly covers authenticated identity resolution, role/resource relationship checks, state and actor prerequisites, duplicate/replay protection, atomic claim behavior, append-only evidence behavior, and the `/api/summary` AI summary endpoint.

Source: `00_PROJECT_CONTROL/CHECKPOINTS/Chat28_Node6_Completion_Checkpoint.md`.

## 14. Reviewer is an Identity & Evidence Verifier

The locked Reviewer blueprint defines the primary job as identity and evidence verification. The Reviewer is not general administration and is not authorized for AI verification, automated scoring, trip operations, claims handling, or general platform administration.

Source: `02_ARCHITECTURE/locked_blueprints/Reviewer_Locked_Blueprint.md`.

## 15. Reviewer verification action is separate from final decision

The Reviewer blueprint records:

```text
Evidence examination
        ↓
Identity / Role Verified
        ↓
Approve / Reject
```

`Identity / Role Verified` is a human action and not a new persistent lifecycle state. Final Approve/Reject commits the persistent outcome.

Source: `02_ARCHITECTURE/locked_blueprints/Reviewer_Locked_Blueprint.md`.

## 16. Reviewer final decisions are atomic

The final Day 20 verification uses a production RPC as the single final decision mutation path. A test-only function intentionally forced failures after evidence mutation and demonstrated rollback for both Approve and Reject. The test-only function was then removed and a normal production retry succeeded.

Source: `03_IMPLEMENTATION/implementation_reports/Chat48_Day20_Node7_Phase1c_Reviewer_Decision_TestOnly_RPC_Rollback_Verification_Final_Report.md`, `00_PROJECT_CONTROL/PROJECT_STATE.md`.

## 17. Same-company NEW Trip rule is a governed product invariant

The final Day 21 governance rule is:

```text
NEW Trip: Sender == Receiver → REJECT
NEW Trip: Sender != Receiver → ALLOW
```

The required invariant is `Trip.company_id != Trip.receiving_company_id` for new Trips. The rule is enforced beyond the UI; the project records a direct authenticated API test returning HTTP 400 for the prohibited A → A attempt.

Existing same-company Trips were preserved and not migrated.

Source: `02_ARCHITECTURE/Chat50_Day21_Node7_SameCompany_Sender_Receiver_Governance_Decision.md`, `04_TESTING/test_results/Chat50_Day21_Node7_SameCompany_Sender_Receiver_Governance_Manual_Verification_Test_Result.md`.

## 18. AI is specifically an Evidence Summary capability

The final documentation records that the implemented runtime AI capability is an **AI Evidence Summary** generated after trip completion from structured delivery evidence/events. Deterministic operational logic remains deterministic.

Source: `00_PROJECT_CONTROL/CURRENT_STATUS.md`, `00_PROJECT_CONTROL/PROJECT_STATE.md`, `01_BRAIN_HANDOFFS/ChatGPT/Chat51_Node7_Presentation_Strategy_Handoff_to_Claude.md`, `03_IMPLEMENTATION/implementation_reports/Chat51_Day21_DeliveryProof_README_Implementation_Report.md`.

## 19. Auto-refresh was explicitly dropped

The final Day 21 records distinguish investigation from implementation. Event-driven scoped auto-refresh was investigated but not implemented, and the global fixed-timer proposal was rejected. No source-code, schema, RLS, lifecycle, claiming, evidence, authentication, or AI changes were authorized for it.

Source: `00_PROJECT_CONTROL/CURRENT_STATUS.md`, `00_PROJECT_CONTROL/PROJECT_STATE.md`.

## 20. Branding did not rename technical identifiers

The DeliveryProof rebrand was intentionally limited to presentation/user-facing surfaces. Internal repository names, package names, `FreightIdentity`, and `freight_identities` remained unchanged.

Source: `05_DEBUGGING/investigations/Chat50_Node7_Investigation_DeliveryProof_Branding_Change_Surface.md`, `00_PROJECT_CONTROL/PROJECT_STATE.md`.

## Historical/superseded decision handling

The Records repository contains historical proposals and earlier states. Examples preserved in the records include the earlier same-company behavior (superseded for NEW Trips by Chat50) and the RPC-based Node 5 completion path (superseded by the reconciled REST/PostgREST implementation).

When ingesting this file, the current accepted decision is represented together with the explicit supersession note rather than silently deleting the historical path.
