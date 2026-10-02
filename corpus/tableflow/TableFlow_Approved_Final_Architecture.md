# TableFlow — Approved Final Architecture

**Purpose:** Record-only extraction of approved/locked architecture decisions from TableFlow_Records (GitHub) and the TableFlow_Staff_Role_System Drive folder. Every item below is traceable to a source file. No facts, assumptions, or interpretations have been added beyond what the records state.

---

## 1. Original Project Scope (Node 1)

**Source (Drive, GitHub does not contain this file):** `01_Master_Prompts/Claude_Side/Chat1_Node1_MasterPrompt_Claude` (Google Doc)

- Feature goal: add role-based staff accounts to TableFlow — Waiter, Cook, Manager — alongside existing Owner and Customer roles.
- Roles decided at this stage (high-level, not final permissions):
  - Waiter — serves orders, sees table status
  - Cook — sees kitchen queue, updates food prep status
  - Manager — generates bills, collects customer payments
  - Owner — full access: analytics, profit tracking, dish-level sales data, staff management
- Access model decision: permissions granular, enforced at RLS (Row-Level Security) level, not just hidden UI elements.
- Stated at this stage: "Owner creates/manages staff accounts manually via an admin panel (no self-signup, no invite-code flow for staff)."
  - **Conflict note:** this statement was later superseded. See `TableFlow_Important_Technical_Decisions.md` for the invite-code redesign decision that replaced it.
- Permission matrix explicitly NOT decided at this stage; record states "Do not assume or infer permissions. Do not write RLS policies or schema until this matrix is explicitly decided in a future session."

## 2. Locked Permission Matrix (Node 1)

**Source:** `03_AI_BRAINS/Claude/Chat1_Node1_MasterPrompt_Claude_PermissionMatrix.md` (GitHub)

- This file is referenced elsewhere in the records as "LOCKED — Node 1: Permission Matrix (full role/resource access matrix, order status lifecycle, customer-side table board design)" (per `03_AI_BRAINS/Claude/Chat2_Node2_MasterPrompt_Claude_Handoff.md`).
- Referenced again in `03_AI_BRAINS/Claude/Chat3_Node2b_Instruction_ProceedWithImplementation.md`: "customers must stay view-only on status per the locked Permission Matrix."

## 3. Role Cardinality (foundational, applies to all later notification/assignment design)

**Source:** `06_INVESTIGATIONS/Chat16_Node9_MasterPrompt_Claude_Handoff_v3.md`

- Owner — single person
- Manager — single person
- Cook — many (multiple cooks per restaurant)
- Waiter — many (multiple waiters per restaurant)
- Customer — many
- Record states this is "why Cook/Waiter need a claiming/assignment mechanism (Node 13) while Owner/Manager notifications can always target 'the one person' directly."

## 4. Node Execution Order (revised)

**Source:** `06_INVESTIGATIONS/Chat16_Node9_MasterPrompt_Claude_Handoff_v3.md`

- Original plan: Node 12 (Push) right after Node 9.
- Revised order: **9 → 13 → 12**.
- Stated reason: "Node 12 (push) reuses Node 9's event-trigger logic — if Node 12 were built before Node 13, push logic would need rework once Node 13 changes notifications from role-broadcast to specific-person targeting. Doing Node 13 before Node 12 means push notifications get built once, against final/stable trigger logic."

## 5. Node 9 — Notifications System (Locked Scope / Architecture)

**Source:** `03_AI_BRAINS/ChatGPT/Chat18_Node9_Lock_Completion_Record.md`, `06_INVESTIGATIONS/Chat16_Node9_MasterPrompt_Claude_Handoff_v3.md`

- Channel: in-app only (bell icon + list). No email, no OS push (deferred to Node 12).
- Phase 1 events (role-based broadcast, explicitly NOT per-person assignment):
  1. Order Status changes: Preparing → all Cooks; Ready → all Waiters
  2. Order Cancelled (Bulk Emergency Stop) → staff notified by status-based targeting table + Customer always
  3. Reservation Approved/Rejected → Customer (logged-in only)
  4. New Reservation Request → Manager only (not Owner)
  5. New Order Placed → Manager
- Order Cancelled status-based staff targeting (locked):
  | Order status at cancellation | Staff notified |
  |---|---|
  | Placed | Manager |
  | Preparing | Cook (all — role-based) |
  | Ready | Waiter (all — role-based) |
  | (any status) | Customer — always |
- Explicitly out of Node 9 scope (deferred to Node 13): claiming/assignment of orders to a specific Cook/Waiter; "who accepted this order" tracking; per-person notifications.
- Design decisions (locked): bell icon lives in shared layout (`components/Navbar.tsx`); unread notifications load on login (fetch-on-mount, not just realtime-going-forward); notification click navigates to page with fresh data via existing fetch-on-mount pattern.

## 6. Node 13 — Cook/Waiter Order Claiming System (Approved Design)

**Source:** `03_AI_BRAINS/ChatGPT/Chat18_Node13_Design_v1.0_Final.md`, `03_AI_BRAINS/ChatGPT/Chat18_Node13_Implementation_Spec_v1.0.md`, `03_AI_BRAINS/Claude/REVIEWED_Chat18_Node13_Implementation_revised_plan.md`

**Status as recorded:** "APPROVED DESIGN → IMPLEMENTATION SPECIFICATION"; Spec document's own final checkpoint states "Node 13 Implementation ⬜ NOT STARTED" at time of spec approval.

> **Important caveat (see `TableFlow_Final_Verification.md` for full detail):** A later verification investigation (`06_INVESTIGATIONS/Chat18_Node13_Implementation_Verification_Investigation.md`) found that even after implementation was reported complete by Antigravity, the changes described below were **not present in the GitHub `TableFlow` main branch** at time of investigation (2026-09-20). The architecture below is the *approved design*, not confirmed shipped code.

Approved architecture per the Implementation Spec:

- Existing order lifecycle preserved: `placed → preparing → ready → served → billed`. Cook claim entry state: `preparing`. Waiter claim entry state: `ready`. No new order status introduced for claiming.
- Database: new columns `claimed_by_cook_id uuid` and `claimed_by_waiter_id uuid` on `orders`, referencing `profiles(id)`, `ON DELETE SET NULL`.
- Partial unique indexes enforce one active Cook claim per Cook and one active Waiter claim per Waiter.
- New column `profiles.staff_name text` — reason given: "`invite_codes.staff_name` is not durable because the project has an auto-delete trigger for used invite codes."
- Four new RPCs: `claim_order_as_cook(p_order_id)`, `claim_order_as_waiter(p_order_id)`, `complete_order_as_cook(p_order_id)`, `complete_order_as_waiter(p_order_id)` — all `SECURITY DEFINER`, `LANGUAGE plpgsql`, `SET search_path = public, pg_temp`, explicit authorization checks, `REVOKE ALL ... FROM PUBLIC; GRANT EXECUTE ... TO authenticated`.
- Atomic concurrency control required sequence: lock caller profile row `FOR UPDATE` → lock target order row `FOR UPDATE` → re-check eligibility → verify no other active claim → update claim column → insert Manager `order_claimed` notification in same transaction → commit.
- Manager resolution rule: exactly one active Manager expected; zero or multiple active Managers is an "operational configuration error"; claim transaction must fail clearly rather than picking an arbitrary Manager with `LIMIT 1`.
- New notification type `order_claimed` added to existing Node 9 `notifications` table constraint (no new notification table/mechanism).
- `BEFORE UPDATE` trigger on `orders` clears claim ownership per invariant rules (status → ready clears cook claim; status → placed/preparing clears waiter claim; status → served/billed/cancelled clears both).
- Existing Node 2b direct Cook/Waiter completion-update policies (`cook_prep_to_ready`, `waiter_ready_to_served`) to be removed; completion becomes RPC-only.
- Manager-only SELECT policy added to `profiles` RLS for staff identity fields (`id`, `staff_name`, `email`, `role`, `is_active`) restricted to staff roles.
- Manager Dashboard: new assignment-monitoring sections for `preparing` (Cook claimant) and `ready` (Waiter claimant) orders, alongside existing Intake/Billing queues.
- Realtime: reuses existing `cook_orders_realtime`, `waiter_orders_realtime`, `manager_orders_realtime` channels — no new channel required.
- Explicit out-of-scope items (Section 31 of Spec): customer notification bell, OS/browser push, PWA push infrastructure, email notifications for claims, Node 12 push implementation, new order status values, a separate assignment table (unless implementation discovers a concrete blocker).
- Required completion boundary (Section 30 of Spec): "Implementation → source/build verification → Supabase migration execution → DB verification → manual Vercel/browser verification → regression verification → evidence/report → approval → Node 13 LOCKED." Node 13 explicitly "must NOT be marked locked after source changes alone."

**Pre-existing state investigated before design (baseline facts):**

**Source:** `06_INVESTIGATIONS/Chat18_Node13_Investigation_result_report.md`

- Prior to Node 13, no `assigned_cook_id`, `assigned_waiter_id`, or claim table existed anywhere in the codebase (confirmed via search across all migration files).
- Cook and Waiter status transitions were unguarded direct `.update()` calls from the client with no race-condition protection.
- Two existing atomic RPCs (`place_order_and_occupy_table`, `mark_order_paid`) were identified as the established RPC pattern template to follow.

## 7. Node 12 — Push Notifications (Approved Design and Final Production Architecture)

**Source:** `03_AI_BRAINS/ChatGPT/Chat19_Node12_Design_v1.1_Final.md`, `03_AI_BRAINS/Claude/Chat19_Node12_Design_v1.1_Final_claude_accept.md`, `03_AI_BRAINS/ChatGPT/Chat19_Node12_Final_Closure.md`

Approved scope decisions (per Final Closure record, Section 2):
- Next.js Node routes used for push delivery.
- `web-push` is the server delivery library.
- Supabase Database Webhook is hosted infrastructure, configured manually.
- `push_delivery_log` explicitly NOT part of Node 12 v1.
- Customer push — out of scope.
- Owner push — out of scope.
- Node 9 business notification producers unchanged.
- Node 13 claim semantics unchanged.

Final production architecture (per Final Closure, confirmed shipped — see `TableFlow_Final_Verification.md` for verification evidence):
- Technology stack: Web Push API, Notifications API, Service Worker, VAPID, Next.js Node Route Handlers, Supabase `notifications` table as existing event source, Supabase Database Webhook, PostgreSQL `push_subscriptions` and `push_delivery_dedup` tables, `web-push` server library.
- Final source files: `app/api/push/deliver/route.ts`, `app/api/push/subscribe/route.ts`, `components/PushSubscriptionButton.tsx`, `components/NotificationBell.tsx` (minimal integration), `lib/web-push.ts`, `public/sw.js`, `supabase/migrations/20260923000001_node12_push_notifications.sql`.
- `push_subscriptions` table columns: `id`, `user_id`, `endpoint`, `p256dh`, `auth`, `user_agent`, `created_at`, `updated_at`, `last_success_at`, `last_failure_at`, `failure_reason`, `is_active`. RLS limits access to authenticated owner.
- `push_delivery_dedup` table: composite primary key `(notification_id, subscription_id)`, plus `created_at`, `success_at`.
- Deduplication algorithm: first delivery claims the pair via insert; PostgreSQL `23505` unique violation treated as existing claim; successful send sets `success_at`; temporary failure removes incomplete row for retry; implementation explicitly does not claim exactly-once external delivery (at-least-once in crash window).
- Production webhook configuration: table `public.notifications`, event `INSERT`, method `POST`, target `https://table-flow-nu.vercel.app/api/push/deliver`, timeout `10000 ms`, `Authorization: Bearer <PUSH_WEBHOOK_SECRET>`.
- Production commits: `273a8a1` ("feat(push): implement Node 12 VAPID push notifications with race-safe deduplication"), `81fe1c4` ("fix(push): harden service worker and delivery deduplication").

## 8. Realtime Channel Architecture (confirmed complete list)

**Source:** `06_INVESTIGATIONS/Chat16_Node9_MasterPrompt_Claude_Handoff_v3.md`

- Confirmed complete channel list: `orders_board`, `manager_orders_realtime`, `cook_orders_realtime`, `waiter_orders_realtime`, `owner_analytics_realtime`, `staff_management_realtime`, `owner_menu_realtime`, `tables_realtime`, `my_orders_realtime`, `menu_realtime`, `reservation_status_realtime`.

## 9. Owner/Staff Role Overlap Architecture (Node 10)

**Source:** `06_INVESTIGATIONS/Chat16_Node9_MasterPrompt_Claude_Handoff_v3.md` (Node Map section)

- Recorded as "✅ LOCKED + PUSHED — Node 10: Owner/Staff Role Overlap Cleanup (Manager = sole operational authority; Owner = read-only + Menu Management + Bulk Emergency Stop, Owner-only)."
- Supporting manual DB change logs (Drive, `04_Logs/`):
  - `Chat13_Node10_Log_FixA_ReservationRLS.md`: dropped "Allow public update" policy on `reservation_requests`, replaced with `reservation_requests_manager_update` scoped to manager role only.
  - `Chat13_Node10_Log_FixB_OwnerReadOnly.md`: dropped `owner_all_updates` on `orders`; replaced `tables_write` with `tables_write_staff` (Waiter/Manager only); replaced `waitlist_update` with `waitlist_update_staff` (Waiter/Manager only). Reason given: "Owner becomes read-only for day-to-day operations to avoid race conditions and overlap with Manager/Staff. Bulk emergency RPC bypasses RLS and is unaffected."
  - `Chat14_Node10_Log_FixC_MenuReverse.md`: dropped `menu_write`, replaced with `menu_write_owner` (Owner only). Reason: "Owner keeps access to toggle menu item availability, but Manager loses write access to the menu table."

## 10. No Formal Approval Artifacts On File

**Source:** `10_APPROVALS/README.md`, `10_APPROVALS/APPROVED/`, `10_APPROVALS/REJECTED/`

- Repository states: "PROPOSED tasks require explicit Ayush approval. Approved tasks are stored under `APPROVED`. Rejected tasks are stored under `REJECTED`."
- Both `APPROVED` and `REJECTED` directories contain only `.gitkeep` placeholder files — no populated approval records exist in the repository for any node.

## 11. Uninitialized / Template Control Files

**Source:** `00_PROJECT_CONTROL/PROJECT_STATE.md`, `00_PROJECT_CONTROL/MASTER_HANDOFF.md`, `01_ARCHITECTURE/NODE_MAP.md`

- `PROJECT_STATE.md`: all fields show `[NOT_INITIALIZED]` or `[NONE]`; `Workflow State: INITIALIZATION`.
- `MASTER_HANDOFF.md`: all fields show `[PLACEHOLDER]`.
- `NODE_MAP.md`: table contains a rule ("ACTIVE_NODE_COUNT <= 1") but the table itself is empty — no rows filled in.
- No verified record found for a populated, current architecture summary in these three files.
