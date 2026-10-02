# TableFlow — Important Technical Decisions

**Purpose:** Record-only extraction of explicit, locked technical decisions from TableFlow_Records (GitHub) and the TableFlow_Staff_Role_System Drive folder. No facts, assumptions, or interpretations have been added beyond what the records state. Where a decision conflicts with an earlier record, the conflict is recorded rather than silently resolved.

---

## 1. Access Model Decision (Node 1)

**Source (Drive):** `01_Master_Prompts/Claude_Side/Chat1_Node1_MasterPrompt_Claude`

- "Permissions will be granular, enforced at the RLS (Row-Level Security) level — not just hidden UI elements."
- Original decision: "Owner creates/manages staff accounts manually via an admin panel (no self-signup, no invite-code flow for staff — this is different from the existing owner/customer invite-code pattern)."

## 2. ⚠️ CONFLICT — Staff Onboarding Model Changed

**Sources:**
- `01_Master_Prompts/Claude_Side/Chat1_Node1_MasterPrompt_Claude` (Drive) — states no invite-code flow for staff (see #1 above).
- `03_AI_BRAINS/Claude/Chat3_Node2b_Decision_InviteCodeEmailDeliveryRedesign.md` (GitHub) — documents an invite-code email delivery redesign decision for staff onboarding.
- `06_INVESTIGATIONS/Chat13_Node9_Investigation_RoleWiseChangeInventory.md` (GitHub) — documents "Invite Generated" and "Invite Used (Signup)" as active system events with `invite_codes` table.

**Conflict:** The original Node 1 decision explicitly ruled out an invite-code flow for staff. A later decision record (`Chat3_Node2b_Decision_InviteCodeEmailDeliveryRedesign.md`) documents a redesign of an invite-code email delivery system that, per later investigation records, was in active use for staff onboarding. The records do not contain an explicit statement reconciling or overriding the original "no invite-code flow" decision — this is recorded as a conflict, not resolved.

## 3. Order Cancellation System (LOCKED)

**Source:** `03_AI_BRAINS/Claude/Chat3_Node2b_Decision_OrderCancellationSystem.md`

- Context stated in record: "Original Permission Matrix (Chat1_Node1) did not scope cancellation at all. This was surfaced during Manager Orders RLS policy review and expanded into a full cancellation design covering all roles."
- Feature 1: Single-Order Cancellation (scope addition to Node 2b) — recorded as LOCKED.

## 4. Node Execution Order Revision: 9 → 13 → 12

**Source:** `06_INVESTIGATIONS/Chat16_Node9_MasterPrompt_Claude_Handoff_v3.md`

- "Originally Node 12 was planned right after Node 9. Revised because Node 12 (push) reuses Node 9's event-trigger logic — if Node 12 were built before Node 13, push logic would need rework once Node 13 changes notifications from role-broadcast to specific-person targeting. Doing Node 13 before Node 12 means push notifications get built once, against final/stable trigger logic."

## 5. Node 9 Scope Decision: Role-Based Broadcast Only (No Claiming)

**Source:** `06_INVESTIGATIONS/Chat16_Node9_MasterPrompt_Claude_Handoff_v3.md`

- Explicitly locked: Node 9 notifications are role-based broadcast (e.g., "all Cooks", "all Waiters"), not per-person assignment.
- Explicitly out of scope for Node 9 (deferred to Node 13): "Claiming/assignment of orders to a specific Cook or Waiter", "'Who accepted this order' tracking or Manager-facing visibility of it", "Any notification targeted at a single specific Cook/Waiter rather than the whole role."

## 6. Auth Pattern Inconsistency — Decision: No Standardization

**Source:** `06_INVESTIGATIONS/Chat16_Node9_MasterPrompt_Claude_Handoff_v3.md`

- Known inconsistency noted: `useAuth()` hook used in `app/order/cart/page.tsx`, `app/order/reservation/page.tsx`, `components/Navbar.tsx`; direct `supabase.auth.getUser()` used in `app/dashboard/orders/page.tsx`.
- "Decision: no standardization. New Node 9 notification-trigger code follows whichever pattern already exists in each file. Not worth a cleanup pass — out of scope for Node 9."

## 7. Node 13 Claim Concurrency Design Decisions

**Source:** `03_AI_BRAINS/ChatGPT/Chat18_Node13_Implementation_Spec_v1.0.md`

- "The database is the enforcement authority. UI checks are convenience only."
- Do not introduce a new order status for claiming — reuse existing `preparing`/`ready` states with new claim columns.
- Required atomic sequence for claim RPCs: lock caller profile row `FOR UPDATE` → lock target order row `FOR UPDATE` → re-check eligibility → verify no other active claim → update claim column → insert notification in same transaction → commit.
- "Do not copy the security characteristics of `mark_order_paid` blindly" — new RPCs required explicit `REVOKE ALL ... FROM PUBLIC; GRANT EXECUTE ... TO authenticated`.
- Manager resolution: "Do not silently select an arbitrary Manager with `LIMIT 1` if multiple active Managers exist. The claim transaction should fail clearly when the Manager configuration is invalid rather than creating an orphan `order_claimed` event."
- "The claimant ID must always come from `auth.uid()`. No RPC may accept a Cook/Waiter profile ID as a caller identity parameter."
- Decision to remove existing direct-update bypass policies (`cook_prep_to_ready`, `waiter_ready_to_served`) so completion becomes RPC-only.
- Explicit decision boundary: "Node 13 must NOT be marked locked after source changes alone" — requires the full sequence through manual browser verification and approval.

## 8. Node 12 Scope Boundary Decisions

**Source:** `03_AI_BRAINS/ChatGPT/Chat19_Node12_Final_Closure.md`

- Customer push notifications — explicitly out of scope for v1.
- Owner push notifications — explicitly out of scope for v1.
- `push_delivery_log` table — explicitly not part of v1.
- Email notification replacement, Firebase Messaging, Workbox, Edge Function push delivery, new business notification types, broad notification UI redesign — all listed as "intentional scope decisions, not implementation defects."
- Maintenance rule recorded: "Do not redesign Node 12 from scratch in a future change... Any expansion to Customer/Owner push or a new notification channel should be treated as a new scoped change rather than silently reopening Node 12."

## 9. Standing Project Rules

**Source:** `06_INVESTIGATIONS/Chat16_Node9_MasterPrompt_Claude_Handoff_v3.md`

- "Investigation and fix always in separate prompts."
- "No GitHub push without Ayush's explicit approval — per-checkpoint, not batched."
- "All DB migrations run manually via Supabase SQL Editor (CLI unavailable)."
- "Antigravity: code execution + build/compile check only, no browser UI testing."
- "Ayush: manual browser verification, screenshot evidence (or verbal confirmation when screenshot isn't feasible)."
- "Instruction files → `02_Instructions/` only (no permission needed). Master prompts/specs → ask permission before creating every time."
- File naming convention: `Chat{N}_Node{M}_{Type}_{ShortDescription}.ext`.
- "Always check Supabase Realtime replication toggle status before assuming a table will support realtime — don't assume, verify (lesson from Node 11)."

This "no GitHub push without explicit approval" rule is directly relevant context for interpreting multiple "manually verified, pending GitHub push" statements found elsewhere in the records (see `TableFlow_Major_Verified_Challenges_and_Fixes.md` and `TableFlow_Final_Verification.md`).

## 10. Party Size Mobile Input Fix — Design Decision

**Source:** `03_AI_BRAINS/ChatGPT/Chat20.5_TableFlow_Party_Size_Mobile_Input_Fix_Instructions.md`

- Confirmed root cause: controlled-input pattern `onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value) || 1))}` snapped empty intermediate editing states back to `1`, blocking normal mobile editing.
- Preferred fix approach specified: keep a string-backed input state, allow intermediate editing states, normalize to numeric value on blur/before order placement. An alternative (allow empty string during editing, update numeric state only for valid non-empty numbers) was permitted "if it is safer for the existing component."
- Decision to preserve existing minimum (1) and maximum (`maxCapacity`) validation semantics without change.
- **Note:** this is a documented fix instruction/decision; no result record confirming implementation was found (see `TableFlow_Major_Verified_Challenges_and_Fixes.md`).

## 11. Desktop Navbar Layout Decision

**Source:** `03_AI_BRAINS/ChatGPT/Chat20.3_TableFlow_Desktop_Navbar_Spacing_Fix_Instructions.md`

- Decision: two-side layout — left side branding only (`[TF] TableFlow`), right side groups all navigation links, NotificationBell (Manager/Cook/Waiter), and Sign Out.
- Explicit constraint carried from Chat 20.1/20.2: NotificationBell must remain mounted exactly once; architecture must not be changed, only the Navbar's spacing/alignment.
- **Note:** this is a documented fix instruction/decision; no result record confirming implementation was found (see `TableFlow_Major_Verified_Challenges_and_Fixes.md`).
