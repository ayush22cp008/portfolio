import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  CaseStudyHeader,
  CaseStudySection,
  StackRow,
  BugCard,
} from "@/components/CaseStudy";

export const metadata: Metadata = {
  title: "TableFlow — Case Study | Ayush Halpati",
  description:
    "Full-stack restaurant management SaaS with AI menu intelligence, seat-level table allocation, and reservations.",
};

export default function TableFlowPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <CaseStudyHeader
          eyebrow="Full-Stack · Solo build"
          title="TableFlow — Smart Restaurant Management System"
          tagline="A single-restaurant operations platform for queues, table allocation, kitchen workflows, and billing—not another delivery app."
          liveUrl="https://table-flow-nu.vercel.app"
          repoUrl="https://github.com/ayush22cp008/TableFlow"
          status="VibeAthon 6.0 (NxtGenSec), Professional Category — result pending"
        />
<CaseStudySection title="Project overview">
  <p>A single-restaurant, full-stack platform for managing live menus, digital orders, table allocation, reservations, kitchen workflows, billing, staff operations, and AI-driven menu intelligence.</p>
</CaseStudySection>
        <StackRow
          stack={[
            "Next.js 14 (App Router)",
            "TypeScript",
            "Tailwind CSS",
            "Supabase (Postgres, Auth, Realtime, RLS)",
            "Google Gemini",
            "Resend",
            "Vercel",
          ]}
        />

        <CaseStudySection title="Problem statement">
          <p>
            Most restaurant tech solves food delivery — customer to restaurant.
            Almost none of it solves the chaos <em>inside</em> a restaurant:
            walk-in queues, table allocation, order-to-kitchen flow, and
            billing transparency. TableFlow is built for a single
            restaurant&apos;s internal operations, from a customer walking in
            or reserving ahead, through live menu browsing and ordering, to a
            fully itemized bill.
          </p>
          <p>
            Before building, I ran qualitative research with Google&apos;s
            Gemini Deep Research tool across Reddit threads (r/mumbai,
            r/bangalore, r/delhi, r/india, r/Kerala) plus NRAI, Petpooja, an
            Emerald Mumbai food-waste study, and the UNEP Food Waste Index —
            to ground the feature set in real pain points instead of
            assumptions.
          </p>
          <div className="mt-4 overflow-hidden border border-[#111111] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#111111] bg-[#F2EFE9] text-[#111111]">
                <tr>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-xs">Research finding</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-xs">Feature it drove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/15">
                <tr>
                  <td className="px-4 py-2.5">Post-order dish unavailability</td>
                  <td className="px-4 py-2.5 font-semibold text-[#0047FF]">Real-Time Menu & Live Availability</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">Opaque queues, long waits</td>
                  <td className="px-4 py-2.5 font-semibold text-[#0047FF]">Digital Ordering + Queue/Table Management</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">~75% of restaurants over-prep nightly</td>
                  <td className="px-4 py-2.5 font-semibold text-[#0047FF]">Menu Intelligence AI (demand forecasting)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">Billing delays, hidden charges</td>
                  <td className="px-4 py-2.5 font-semibold text-[#0047FF]">Transparent Itemized Billing</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            The dish-popularity classification and lightweight 👍👎 + free-text
            feedback loop inside Menu Intelligence AI was my own addition
            beyond what the research surfaced — extending the forecasting
            data into an actionable menu-optimization signal.
          </p>
        </CaseStudySection>

        <CaseStudySection title="Core capabilities">
          <ol className="list-decimal list-inside space-y-2 text-[#111111]">
            <li>Live menu and availability management.</li>
            <li>Digital ordering, table allocation, and billing.</li>
            <li>Gemini‑powered Menu Intelligence AI.</li>
            <li>Reservation workflows.</li>
            <li>Staff roles and onboarding.</li>
            <li>Order claiming and notifications.</li>
          </ol>
        </CaseStudySection>
        <CaseStudySection title="Selected engineering decisions">
          <p>
            <strong className="text-[#111111]">Single-restaurant model.</strong>{" "}
            No multi-tenancy — simplifies the schema and matches the scope
            instead of building a tenant-isolation layer under time pressure.
          </p>
          <p>
            <strong className="text-[#111111]">Seat-level occupancy via one atomic RPC.</strong>{" "}
            <code className="border border-[#111111]/20 bg-[#F2EFE9] px-1.5 py-0.5 text-xs font-mono text-[#111111]">
              restaurant_tables.occupied_seats
            </code>{" "}
            tracks real-time occupancy per table; orders carry a{" "}
            <code className="border border-[#111111]/20 bg-[#F2EFE9] px-1.5 py-0.5 text-xs font-mono text-[#111111]">
              party_size
            </code>
            . Rather than insert-then-update from the client — a race
            condition waiting to happen — a single Postgres RPC,{" "}
            <code className="border border-[#111111]/20 bg-[#F2EFE9] px-1.5 py-0.5 text-xs font-mono text-[#111111]">
              place_order_and_occupy_table
            </code>
            , does both atomically.
          </p>
          <p>
            <strong className="text-[#111111]">Reservations reuse the live-table system.</strong>{" "}
            A <code className="border border-[#111111]/20 bg-[#F2EFE9] px-1.5 py-0.5 text-xs font-mono text-[#111111]">reserved_from</code> timestamp on
            each table blocks it from normal allocation during its window —
            reusing the same display/allocation logic already built for live
            tables, instead of a parallel reservation-only system.
          </p>
          <p>
            <strong className="text-[#111111]">Status derived, never duplicated.</strong>{" "}
            Table status is always computed from occupancy and reservation
            state — never stored as a separate flag. Two representations of
            the same fact drift apart eventually; one source of truth
            doesn&apos;t.
          </p>
          <p>
            <strong className="text-[#111111]">OTP over magic links.</strong>{" "}
            Email verification uses a numeric OTP entered in the same browser
            session that started signup — magic links break the moment
            someone opens their email on a different device.
          </p>
        </CaseStudySection>

        <CaseStudySection title="My role">
          <p>
            Solo build, professional category — research, product decisions,
            schema design, and full-stack implementation, working with Claude
            as the architecture/reasoning brain and Antigravity as an
            implementation executor against locked instruction specs.
          </p>
        </CaseStudySection>

        <CaseStudySection title="Selected debugging stories">
          <div className="space-y-6 not-prose">
            <BugCard title="Duplicate NotificationBell causing crash">
              <p><strong>Problem:</strong> Mobile navbar duplicated the NotificationBell component, crashing authenticated dashboards.</p>
              <p><strong>Root cause:</strong> CSS‑hidden desktop and mobile instances were both mounted, creating duplicate Supabase Realtime subscriptions.</p>
              <p><strong>Fix:</strong> Use a single NotificationBell instance with responsive positioning.</p>
            </BugCard>
            <BugCard title="A manager-only RLS policy that recursively queried its own table">
              <p><strong>Problem:</strong> PostgreSQL returned <code>42P17: infinite recursion detected</code>.</p>
<p><strong>Root cause:</strong> The <code>profiles</code> RLS policy queried <code>profiles</code> within its own <code>USING</code> expression, recursively triggering the policy. The failed profile lookup also broke middleware role routing.</p>
<p><strong>Fix:</strong> Use the existing <code>has_role()</code> helper marked <code>SECURITY DEFINER</code> so the internal role lookup does not recursively trigger the same RLS policy.</p>
            </BugCard>
          </div>
        </CaseStudySection>

        <CaseStudySection title="Scope & engineering trade‑offs">
          <ul className="list-disc space-y-2 pl-5">
            <li>A used reservation code may leave a stale “Reserved for …” label on the table until billing; this cosmetic limitation does not affect the underlying occupancy state.</li>
            <li>
              The owner‑dashboard order cancellation flow was omitted in this release; a proper seat‑release mechanism has been deferred.
            </li>
            <li>No customer‑facing in‑app notification after a reservation’s arrival is confirmed; staff notification features are implemented, but the customer must navigate to the order page manually, same as a walk‑in.</li>
          </ul>
        </CaseStudySection>
        <CaseStudySection title="Explore further">
          <p>For the full feature history, post‑hackathon enhancements, and detailed architecture, see the <a href="https://github.com/ayush22cp008/TableFlow/blob/main/README.md" className="text-[#0047FF] underline" target="_blank">TableFlow README</a>.</p>
        </CaseStudySection>
      </main>
      <SiteFooter />
    </>
  );
}
