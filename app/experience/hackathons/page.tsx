import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'TableFlow & DeliveryProof — Lessons Learned | Ayush Halpati',
  description: 'Full-stack engineering experience covering restaurant operations, evidence-first logistics, role-aware state boundaries, and verification.',
};

export default function HackathonsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[#F9F8F6]">
        <article className="border-b border-[#111111]/15">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <Link
              href="/#experience"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0047FF] hover:underline"
            >
              ← Back to Experience
            </Link>

            <header className="mt-8 border-b border-[#111111]/15 pb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
                EXPERIENCE // PAGE 03
              </span>
              <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight text-[#111111] sm:text-5xl">
                TableFlow & DeliveryProof
              </h1>
            </header>

            <div className="mt-10 space-y-12 text-[#222222]">
              {/* Overview */}
              <section>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                  Overview
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#444444]">
                  TableFlow and DeliveryProof are separate full-stack projects with different operational goals. Both provided experience with workflows involving multiple roles, application state, database interactions, and verification.
                </p>
              </section>

              {/* TableFlow */}
              <section className="space-y-4">
                <div className="flex flex-col justify-between sm:flex-row sm:items-baseline">
                  <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                    TableFlow — Restaurant Operations
                  </h2>
                  <Link
                    href="/projects/tableflow"
                    className="mt-1 text-sm font-semibold text-[#0047FF] hover:underline sm:mt-0"
                  >
                    View TableFlow Case Study →
                  </Link>
                </div>
                <p className="text-base leading-relaxed text-[#444444]">
                  TableFlow is a restaurant-operations application covering workflows such as menu availability, orders, table allocation, reservations, staff operations, and analytics.
                </p>

                <div className="border-l-2 border-[#111111]/15 pl-5">
                  <h3 className="font-display text-lg font-bold text-[#111111]">
                    Engineering Areas
                  </h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-[#444444]">
                    <li>Order claiming and coordination between staff roles.</li>
                    <li>Explicit role and application-state rules.</li>
                    <li>Database-level protection for concurrent operations.</li>
                    <li>Row-level security and access boundaries.</li>
                    <li>Keeping related state consistent rather than relying only on client-side assumptions.</li>
                  </ul>
                </div>

                <div className="border-l-2 border-[#111111]/15 pl-5">
                  <h3 className="font-display text-lg font-bold text-[#111111]">
                    What I Learned
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#444444]">
                    Concurrent operations and role-sensitive changes need enforceable rules at the database and application layers. A visible interface alone is not sufficient to guarantee that a workflow is consistent.
                  </p>
                </div>
              </section>

              {/* DeliveryProof */}
              <section className="space-y-4">
                <div className="flex flex-col justify-between sm:flex-row sm:items-baseline">
                  <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                    DeliveryProof — Evidence-First Logistics Workflow
                  </h2>
                  <Link
                    href="/projects/deliveryproof"
                    className="mt-1 text-sm font-semibold text-[#0047FF] hover:underline sm:mt-0"
                  >
                    View DeliveryProof Case Study →
                  </Link>
                </div>
                <p className="text-base leading-relaxed text-[#444444]">
                  DeliveryProof is an evidence-first logistics application that records delivery-related events chronologically and provides separate workflows for Driver, Company, and Reviewer roles.
                </p>

                <div className="border-l-2 border-[#111111]/15 pl-5">
                  <h3 className="font-display text-lg font-bold text-[#111111]">
                    Engineering Areas
                  </h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-[#444444]">
                    <li>Role-aware access and operational workflows.</li>
                    <li>Chronological delivery-event records.</li>
                    <li>Separation of identity-verification evidence from delivery evidence.</li>
                    <li>Database-backed trip claiming and state transitions.</li>
                    <li>AI-assisted summaries grounded in structured delivery events.</li>
                  </ul>
                </div>

                <div className="border-l-2 border-[#111111]/15 pl-5">
                  <h3 className="font-display text-lg font-bold text-[#111111]">
                    What I Learned
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#444444]">
                    Operational facts such as recorded events and state transitions should remain grounded in application data. AI can help summarize those records, but an AI-generated narrative should not replace the underlying evidence or permissions model.
                  </p>
                </div>
              </section>

              {/* Verification and Working Process */}
              <section>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                  Verification and Working Process
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#444444]">
                  Project records describe end-to-end workflow checks and regression work for the submitted projects. I also reported that I manually tested project workflows before submission.
                </p>
                <p className="mt-3 text-base leading-relaxed text-[#444444]">
                  I do not claim simulated-user load testing, formal latency benchmarks, or a WebSockets-versus-Supabase-Realtime comparison here because those specific activities are not established in the evidence reviewed.
                </p>
              </section>

              {/* Cross-Project Learning */}
              <section>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                  Cross-Project Learning
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#444444]">
                  Across these projects, I developed a more structured approach to requirements, role/state boundaries, source inspection, bounded changes, AI-agent coordination, and review before acceptance. My role included problem framing, scope decisions, selecting directions, reviewing changes, and manual approval; the implementation process also used AI tools and project collaborators.
                </p>
              </section>

              {/* Scope and Attribution Note */}
              <footer className="border-t border-[#111111]/15 pt-8 text-xs text-[#777777]">
                <p>
                  <strong>Scope and Attribution Note:</strong> These pages summarize project experience and learning. They are not intended to replace the detailed case studies or imply that every implementation detail was independently authored, every hypothesis was conclusively proven, or every system has been independently certified for production use.
                </p>
              </footer>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
