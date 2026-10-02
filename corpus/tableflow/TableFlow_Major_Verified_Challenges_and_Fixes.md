# TableFlow — Major Verified Challenges and Fixes

**Purpose:** Record-only extraction of documented bugs/challenges from TableFlow_Records (GitHub) and the TableFlow_Staff_Role_System Drive folder. Items are separated into two sections: (A) challenges with manual-verification or build-pass evidence on file, and (B) challenges that were investigated and/or had fix instructions issued but for which **no result record confirming completion was found** in either GitHub or Drive. Section B items must not be described as "fixed" — per the extraction rule, the gap is stated explicitly rather than filled.

---

## Section A — Verified (evidence of fix/verification exists on file)

### A1. Reservation Double-Booking (Node 4)

**Sources:** `06_INVESTIGATIONS/Chat9_Node4_Evidence_ReservationDoubleBooking_Fixed.md`, `06_INVESTIGATIONS/Chat9_Node4_Evidence_ManualVerification_Confirmed.md`

- Fix evidence record states the bug involved an approve-time overlap + occupancy guard issue, addressed via an RPC hard cap (per Evidence_ReservationDoubleBooking_Fixed.md, "fixed and verified in Chat #8/#9").
- A regression (false-positive block from stale `approved` reservation_requests rows after a manual DB reset) was separately identified and fixed via "Option B (proper lifecycle status + backfill migration)."
- Manual verification record states: "Ayush ran the full reservation Approve workflow (proper user flow via the Reservation Requests panel — not just DB/dashboard inspection) to approve new reservations on tables (including Table 1, 2, 3) that were previously false-positive blocked."
- Result: "Approvals succeeded with no false-positive block. All 6 tables now correctly show 'Reserved for [time]' state... Reservation Requests count back to a clean 30, no stale entries interfering."
- **Status as recorded:** "Node 4 — Reservation double-booking prevention: ready to lock, pending Ayush's go-ahead for GitHub push." No later record was found confirming the GitHub push occurred.

### A2. Node 13 — Profiles RLS Infinite Recursion

**Sources:** `04_ANTIGRAVITY/Chat18_Node13_Profiles_RLS_Infinite_Recursion_Report.md`, `06_INVESTIGATIONS/Chat18_Node13_Profiles_RLS_Infinite_Recursion_Investigation.md`

- Documented as a root-cause investigation and fix report specific to the Node 13 Manager assignment-visibility RLS policy on `profiles`.
- **Note:** this fix exists at the report level within the Node 13 workstream; per the broader Node 13 verification investigation (`Chat18_Node13_Implementation_Verification_Investigation.md`, see `TableFlow_Final_Verification.md`), the overall Node 13 source changes were not confirmed present in the GitHub main branch as of the investigation date. This item's fix-report status should be read alongside that broader finding.

### A3. Node 12 — Invalid/Expired Subscription Cleanup

**Source:** `03_AI_BRAINS/ChatGPT/Chat19_Node12_Final_Closure.md` (Section 10)

- A controlled black-box verification was executed using real local `.env.local` Supabase credentials.
- Two disposable test subscriptions were created with intentionally invalid endpoints (one FCM, one Mozilla Push).
- Provider responses produced HTTP `410 Gone` and HTTP `404 Not Found`.
- Before delivery: `is_active = true`, `last_failure_at = null`, `failure_reason = null`. After delivery failure: both subscriptions became `is_active = false`, `last_failure_at` populated, `failure_reason` recorded as `HTTP 410` / `HTTP 404` respectively.
- Disposable test data and the temporary test script were deleted after verification.
- Result recorded: PASS. Record explicitly notes: "This verification was a controlled integration test of the real delivery code and Supabase database behavior; it is not claimed as large-scale production failure-rate testing."

### A4. Owner-Side Staff Management (Full Update Set)

**Source:** `06_INVESTIGATIONS/Chat9_OwnerSide_StaffManagement_FullVerification_Confirmed.md`

- Five updates covered: navbar "Staff" link, navbar on staff page, Staff Details table (Name/Email/Role/Join Date/Status sourced from `profiles` + `invite_codes` join), real-time session-based status (`is_logged_in`), Delete Staff (confirmation dialog, deactivation, permanent ban via Admin API `ban_duration`), and "End Day — Log Out All Staff" (force logout).
- Live cross-device test recorded for real-time status: "Waiter 'ramu' logs in → Owner dashboard shows 'Active' immediately... logs out from their own device → Owner dashboard shows 'Inactive' immediately, no 48-hour delay, no refresh dependency issue."
- Delete Staff test recorded: deletion shows confirmation dialog then success message; deleted user immediately removed from Active Staff list; cannot log back in (session banned); email cannot be reused for a new account.
- **Status as recorded:** "Owner Side Staff Management: ready to lock, pending Ayush's go-ahead for GitHub push." No later record was found confirming the GitHub push occurred.

### A5. Node 10 — RLS Policy Fixes (Manual DB Change Logs)

**Sources (Drive, `04_Logs/`):**
- `Chat13_Node10_Log_FixA_ReservationRLS.md` — dropped "Allow public update" policy on `reservation_requests`; created `reservation_requests_manager_update` scoped to manager role only. Timestamp recorded: 2026-08-11T16:30:00+05:30.
- `Chat13_Node10_Log_FixB_OwnerReadOnly.md` — dropped `owner_all_updates` on `orders`; replaced `tables_write` with `tables_write_staff` (Waiter/Manager only); replaced `waitlist_update` with `waitlist_update_staff` (Waiter/Manager only). Timestamp recorded: 2026-08-11T17:31:00+05:30.
- `Chat14_Node10_Log_FixC_MenuReverse.md` — dropped `menu_write`, created `menu_write_owner` (Owner only). Timestamp recorded: 2026-08-11T23:45:00+05:30.
- Each log records the exact SQL executed manually via Supabase SQL Editor, consistent with the standing project rule that all DB migrations are run manually (see `TableFlow_Important_Technical_Decisions.md`).

### A6. Node 8 — Reservation Customer ID Linking

**Source (Drive, `04_Logs/`):** `Chat12_Node8_Log_ReservationCustomerId.md`

- Manual DB change log: added `customer_id UUID REFERENCES profiles(id)` (nullable) to `reservation_requests`. Timestamp recorded: 2026-08-11T03:36:00+05:30.
- Reason given: "Node 8 — Customer Dashboard Revamp. Needed to link reservations to authenticated customers so they can view their status automatically on their own dashboard."

### A7. Node 9 — NotificationBell Build Failure / Silent Notifications (Investigation Closed, No Fix Needed)

**Source:** `06_INVESTIGATIONS/Chat17_Node9_Investigation_NotificationBell.md`

- Two symptoms investigated together: a Vercel build failure (`@typescript-eslint/no-unused-vars` errors in `NotificationBell.tsx`) and empty notification state across all dashboards.
- Root cause confirmed by direct inspection of GitHub `main`: commit `d6f1ba6` had already resolved the build failure via `eslint-disable-next-line` comments. The empty notification state was confirmed to be **expected/unimplemented behavior**, not a bug — the component was a static UI shell with an explicit in-code comment "Fetch + realtime subscription — Antigravity to wire up against."
- Decision recorded: "No fix needed for either symptom. Close this investigation. Proceed to Node 9 — Step 3."
- A separate false-positive was also ruled out in the same record: a claimed `types/index.ts` mismatch (only 3 of 8 `NotificationType` values present) was found to be a "partial-grep artifact, not a real bug" after fetching the full raw file from GitHub.

---

## Section B — Investigated / Instructed, Completion NOT Confirmed in Records

**For each item below: No verified record found confirming this fix was completed, tested, and/or pushed to the source repository.**

### B1. TableRelease / Mark-Paid Table Release Bug

**Sources:** `04_ANTIGRAVITY/Chat18_TableRelease_MarkPaid_Investigation_Report.md`, `04_ANTIGRAVITY/Chat18_TableRelease_MarkPaid_Fix_Instructions.md`

- An investigation report and a separate fix-instructions document exist for this issue.
- No verified record found for completion, testing, or push of this fix.

### B2. Mobile Client-Side Exception (Chat 20.1)

**Sources:** `06_INVESTIGATIONS/Chat20.1_Mobile_Client_Side_Exception_Root_Cause_Investigation.md`, `04_ANTIGRAVITY/Chat20.1_Mobile_Client_Side_Exception_Root_Cause_Investigation_Result.md`

- A root-cause investigation and its result record exist, establishing the root cause.
- No verified record found for a subsequent fix implementation or fix-verification result specific to this root cause.
- Note: the investigation result file for this item contains what appears to be a hardcoded Supabase URL and publishable key; per the extraction rule prohibiting inclusion of credentials/secrets, no such values are reproduced here or in any other output file.

### B3. NotificationBell Duplicate Mount Client Exception (Chat 20.2)

**Source:** `03_AI_BRAINS/ChatGPT/Chat20.2_NotificationBell_Duplicate_Mount_Client_Exception_Fix_Instructions.md`

- Only a fix-instructions document was found. No result record (`Chat20.2_..._Fix_Result.md` or equivalent) was found in either GitHub or Drive.
- No verified record found for completion of this fix.

### B4. Desktop Navbar Spacing & Alignment (Chat 20.3)

**Source:** `03_AI_BRAINS/ChatGPT/Chat20.3_TableFlow_Desktop_Navbar_Spacing_Fix_Instructions.md`

- Only a fix-instructions document was found. The instructions specify that Antigravity should create `04_ANTIGRAVITY/Chat20.3_TableFlow_Desktop_Navbar_Spacing_Fix_Result.md` upon completion — no such file was found in the repository.
- No verified record found for completion of this fix.

### B5. Party Size Mobile Input Bug (Chat 20.4 / 20.5)

**Sources:** `04_ANTIGRAVITY/chat20.4_party_size_investigation.md`, `03_AI_BRAINS/ChatGPT/Chat20.5_TableFlow_Party_Size_Mobile_Input_Fix_Instructions.md`

- An investigation record and a fix-instructions document exist. The instructions specify Antigravity should create `04_ANTIGRAVITY/Chat20.5_TableFlow_Party_Size_Mobile_Input_Fix_Result.md` upon completion — no such file was found.
- No verified record found for completion of this fix.

### B6. Cart UTF-8 Mojibake Regression (Chat 20.6)

**Source:** `03_AI_BRAINS/ChatGPT/Chat20.6_TableFlow_Cart_UTF8_Mojibake_Regression_Fix_Instructions.md`

- Only a fix-instructions document was found. No result record was found in either GitHub or Drive.
- No verified record found for completion of this fix.

### B7. Node 13 Implementation vs. GitHub Source — Confirmed Discrepancy

**Source:** `06_INVESTIGATIONS/Chat18_Node13_Implementation_Verification_Investigation.md`

- This item is itself a documented and confirmed discrepancy, not merely an unconfirmed fix: Antigravity's `04_ANTIGRAVITY/Node13_Final_Report.md` reported Node 13 implementation as complete (six files changed, build/typecheck passing, migration created but not executed).
- A subsequent investigation directly checked the GitHub `TableFlow` main branch and found, file by file: the Node 13 migration was absent (404 Not Found); Cook, Waiter, and Manager dashboard source still contained pre-Node-13 code with direct `.update()` calls instead of RPC calls; `types/index.ts` lacked the reported new fields; the staff-signup route lacked the reported `staff_name` persistence.
- Investigation conclusion (verbatim structure preserved): "Node 13 changes exist in the local Antigravity workspace/report, but they have not yet been pushed to the TableFlow source repository main branch." The records repository report is characterized as "documentation of the local implementation state, not evidence that the source repository has received those changes."
- No later record was found confirming the push subsequently occurred. See `TableFlow_Final_Verification.md` for the full detail on how this interacts with the separate Node 13 "Final Closure" record that states Node 13 as CLOSED/COMPLETED.
