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
  title: "DeliveryProof — Case Study | Ayush Halpati",
  description:
    "An evidence-first accountability platform for logistics, built for the AI Builders Hackathon.",
};

export default function DeliveryProofPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <CaseStudyHeader
          eyebrow="GenAI · Solo build"
          title="DeliveryProof — AI-Assisted Evidence & Accountability Platform"
          tagline="An evidence-first accountability layer for logistics: a verifiable, chronological timeline of every facility interaction, summarized by AI into a narrative that can settle a dispute."
          liveUrl="https://deliveryproofhackathon.vercel.app"
          repoUrl="https://github.com/ayush22cp008/DeliveryProof_hackathon"
          status="AI Builders Hackathon — result pending"
        />

        <StackRow
          stack={[
            "Next.js (App Router)",
            "React",
            "Tailwind CSS",
            "Supabase (Postgres)",
            "Next.js API Routes",
            "Groq",
            "Vercel",
          ]}
        />

        <CaseStudySection title="Problem statement">
          <p>
            In logistics, legitimate detention (wait-time) earnings are
            routinely lost or disputed, because evidence of arrival,
            check-in, and departure at a facility is usually manual,
            fragmented, or missing entirely. GPS/ELD data proves a truck was
            near a facility — it doesn&apos;t prove the driver actually
            checked in at the dock. Traditional ePOD systems only capture the
            final signature, not the timeline a dispute actually hinges on.
          </p>
          <p>
            Research into the space showed disputes rarely center on whether
            goods were delivered — they center on <em>when</em> each
            interaction happened. Without an evidence-backed timeline, that
            becomes a &quot;he said, she said&quot; between driver and
            facility.
          </p>
          <p>
            DeliveryProof captures the chronological timeline of a trip
            end-to-end and uses AI to turn the raw event log into a coherent
            narrative for dispute resolution — without requiring deep
            integration into legacy facility software.
          </p>
          <p className="text-sm text-[#8B93A1]">
            What it deliberately isn&apos;t: it doesn&apos;t eliminate
            facility delays, doesn&apos;t guarantee detention payment,
            doesn&apos;t replace a full TMS/ELD stack, and doesn&apos;t turn
            any role into an unrestricted super-admin.
          </p>
        </CaseStudySection>

        <CaseStudySection title="Tech decisions & why">
          <p>
            <strong className="text-[#E6E8EB]">
              Three role-aware portals, one shared system.
            </strong>{" "}
            Driver, Company (Sender/Receiver), and Reviewer each see only
            what&apos;s relevant, but all sit on the same identity-based auth
            and routing layer instead of three separate apps.
          </p>
          <p>
            <strong className="text-[#E6E8EB]">
              Sender and Receiver are trip-specific hats, not account types.
            </strong>{" "}
            A company can be a Sender on one trip and a Receiver on another —
            avoids duplicating company accounts and keeps the acceptance
            handshake enforceable as a state transition.
          </p>
          <p>
            <strong className="text-[#E6E8EB]">
              Onboarding verification is fully separate from the delivery
              chain.
            </strong>{" "}
            The Reviewer examines identity documents with zero access to
            operational trip data. A bug or scope change in one chain can
            never leak permissions into the other.
          </p>
          <p>
            <strong className="text-[#E6E8EB]">Atomic driver claim.</strong>{" "}
            The marketplace-claim transaction guarantees a trip is claimed by
            exactly one driver — no race condition where two drivers claim
            the same load.
          </p>
          <p>
            <strong className="text-[#E6E8EB]">
              AI is scoped to summarization only.
            </strong>{" "}
            The AI generates a post-completion evidence summary from
            structured events. Deterministic facts — timestamps, GPS,
            state transitions — stay deterministic and are never delegated to
            the model. An AI-generated timestamp is worthless as evidence; an
            AI-generated narrative over real timestamps is useful.
          </p>
        </CaseStudySection>

        <CaseStudySection title="My role">
          <p>
            Solo build — product research, role/permission architecture,
            schema design, and implementation, coordinating Claude as the
            architecture brain and Antigravity as the implementation
            executor, with structured investigation reports gating every fix
            before code changed.
          </p>
        </CaseStudySection>

        <CaseStudySection title="What broke, and how I fixed it">
          <div className="not-prose">
            <BugCard title="The Reviewer's Approve/Reject decision wasn't atomic">
              <p>
                The decision endpoint performed several separate, unbatched
                database calls per decision — for an Approve: update evidence
                status → update identity status → insert a decision-history
                row → insert the resulting driver/company record. None of
                this ran inside a transaction.
              </p>
              <p>
                I ran a dedicated atomicity investigation against the locked
                requirement that applicants must never be left in a
                partially committed state, and walked every failure point:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  Fail after step 1 of Approve → evidence shows{" "}
                  <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                    APPROVED
                  </code>
                  , identity still{" "}
                  <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                    PENDING
                  </code>
                  .
                </li>
                <li>
                  Fail after step 3 of Approve → the decision is fully
                  recorded, but the applicant&apos;s business record never
                  gets created — approved but literally unable to operate.
                </li>
                <li>
                  Fail after step 2 of Reject → identity is{" "}
                  <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                    REJECTED
                  </code>{" "}
                  but no history row exists — breaks the audit trail the
                  Reviewer role exists to produce.
                </li>
              </ul>
              <p>
                <strong className="text-[#E6E8EB]">Fix:</strong> move the
                whole decision sequence into a Postgres stored procedure and
                call that RPC from the route — a failure anywhere rolls the
                applicant back to{" "}
                <code className="rounded bg-[#161D28] px-1.5 py-0.5 text-xs text-[#E6E8EB]">
                  PENDING
                </code>{" "}
                instead of leaving a half-committed record.
              </p>
              <p className="text-sm">
                This is the same &quot;wrap it in one atomic RPC&quot;
                pattern I&apos;d already used for TableFlow&apos;s seat
                allocation — recognizing it here came directly from having
                hit the multi-write race condition once before.
              </p>
            </BugCard>
          </div>
        </CaseStudySection>

        <CaseStudySection title="Known security caveat (documented, not hidden)">
          <p>
            Reviewer server-side data access currently runs through an
            approved service-role gating path rather than a full row-level-
            security redesign — that RLS rewrite was explicitly out of scope
            for the hackathon window and is called out as future work rather
            than left undocumented.
          </p>
        </CaseStudySection>

        <CaseStudySection title="Verification">
          <p>
            Driver, Company, and Reviewer baselines were independently
            verified and locked; a full manual cross-portal end-to-end run
            traced one trip from creation through driver claim, delivery
            lifecycle, receiver confirmation, and AI summary generation,
            followed by a final regression pass across the unified system.
          </p>
        </CaseStudySection>
      </main>
      <SiteFooter />
    </>
  );
}
