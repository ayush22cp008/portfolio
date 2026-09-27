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
          tagline="A full-stack SaaS for the operational chaos inside a restaurant — queues, table allocation, kitchen flow, billing — not the delivery-app problem everyone else solves."
          liveUrl="https://table-flow-nu.vercel.app"
          repoUrl="https://github.com/ayush22cp008/TableFlow"
          status="VibeAthon 6.0 (NxtGenSec), Professional Category — result pending"
        />

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
          <div className="mt-4 overflow-hidden rounded-lg border border-[#232B36]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#161D28] text-[#E6E8EB]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Research finding</th>
                  <th className="px-4 py-2.5 font-medium">Feature it drove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232B36]">
                <tr>
                  <td className="px-4 py-2.5">Post-order dish unavailability</td>
                  <td className="px-4 py-2.5">Real-Time Menu & Live Availability</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">Opaque queues, long waits</td>
                  <td className="px-4 py-2.5">Digital Ordering + Queue/Table Management</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">~75% of restaurants over-prep nightly</td>
                  <td className="px-4 py-2.5">Menu Intelligence AI (demand forecasting)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">Billing delays, hidden charges</td>
                  <td className="px-4 py-2.5">Transparent Itemized Billing</td>
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

        <CaseStudySection title="Tech decisions & why">
          <p>
            <strong className="text-[#E6E8EB]">Single-restaurant model.</strong>{" "}
            No multi-tenancy — simplifies the schema and matches the scope
            instead of building a tenant-isolation layer under time pressure.
          </p>
          <p>
            <strong className="text-[#E6E8EB]">Seat-level occupancy via one atomic RPC.</strong>{" "}
            <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
              restaurant_tables.occupied_seats
            </code>{" "}
            tracks real-time occupancy per table; orders carry a{" "}
            <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
              party_size
            </code>
            . Rather than insert-then-update from the client — a race
            condition waiting to happen — a single Postgres RPC,{" "}
            <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
              place_order_and_occupy_table
            </code>
            , does both atomically.
          </p>
          <p>
            <strong className="text-[#E6E8EB]">Reservations reuse the live-table system.</strong>{" "}
            A <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">reserved_from</code> timestamp on
            each table blocks it from normal allocation during its window —
            reusing the same display/allocation logic already built for live
            tables, instead of a parallel reservation-only system.
          </p>
          <p>
            <strong className="text-[#E6E8EB]">Status derived, never duplicated.</strong>{" "}
            Table status is always computed from occupancy and reservation
            state — never stored as a separate flag. Two representations of
            the same fact drift apart eventually; one source of truth
            doesn&apos;t.
          </p>
          <p>
            <strong className="text-[#E6E8EB]">OTP over magic links.</strong>{" "}
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

        <CaseStudySection title="What broke, and how I fixed it">
          <div className="space-y-6 not-prose">
            <BugCard title="A 'fixed' mobile navbar took down three roles' dashboards in production">
              <p>
                A mobile-responsive pass duplicated the{" "}
                <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                  NotificationBell
                </code>{" "}
                component — one instance for desktop nav, one for mobile —
                hidden from each other with CSS. The mistake: CSS controls
                visibility, not mounting. React mounted both regardless, and
                both opened a Supabase realtime subscription on the same
                channel. The second subscription tried to attach its callback
                after the channel had already subscribed, threw, and crashed
                the React tree — reproducible only on phones.
              </p>
              <p>
                I ran a structured root-cause investigation before touching
                code: reproduce on both breakpoints, capture the exact
                console error, binary-isolate the changed components. That
                process is what surfaced the duplicate-mount +
                duplicate-subscription combination, not a vague
                &quot;something&apos;s wrong with mobile CSS.&quot;
              </p>
              <p>
                <strong className="text-[#E6E8EB]">Fix:</strong> exactly one
                mounted{" "}
                <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                  NotificationBell
                </code>{" "}
                per navbar, with responsive positioning instead of two
                components gated by display rules.
              </p>
            </BugCard>

            <BugCard title="A manager-only RLS policy that recursively queried its own table">
              <p>
                A policy to let managers see staff profiles queried{" "}
                <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                  profiles
                </code>{" "}
                from within its own{" "}
                <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                  USING
                </code>{" "}
                clause on{" "}
                <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                  profiles
                </code>{" "}
                — evaluating the policy re-triggered the policy, forever.
                Postgres threw{" "}
                <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                  42P17: infinite recursion detected
                </code>
                .
              </p>
              <p>
                The blast radius was bigger than it looked: middleware
                queries the user&apos;s profile on every request to route by
                role, falling back to{" "}
                <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                  customer
                </code>{" "}
                if that query fails. So every authenticated role — Owner,
                Manager, Cook, Waiter — silently fell back to customer and got
                redirected to <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">/order</code> on
                refresh, with no visible error, just repeated 500s in the
                Supabase logs.
              </p>
              <p>
                <strong className="text-[#E6E8EB]">Fix:</strong> route the
                policy through the existing{" "}
                <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                  has_role()
                </code>{" "}
                helper, marked{" "}
                <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                  SECURITY DEFINER
                </code>{" "}
                — it runs with the function owner&apos;s privileges, bypassing
                RLS on its internal lookup instead of re-triggering it.
              </p>
            </BugCard>
          </div>
        </CaseStudySection>

        <CaseStudySection title="Known limitations (documented, shipped anyway)">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              A used reservation code can leave the table cosmetically showing
              &quot;Reserved for {"{time}"}&quot; until billing, even though
              occupancy is already correct.
            </li>
            <li>
              Order cancellation from the owner dashboard was pulled from
              this release rather than ship a flow that doesn&apos;t
              correctly release seats.
            </li>
            <li>
              No in-app notification after a reservation&apos;s arrival is
              confirmed — the customer navigates to the order page manually,
              same as a walk-in.
            </li>
          </ul>
        </CaseStudySection>
      </main>
      <SiteFooter />
    </>
  );
}
