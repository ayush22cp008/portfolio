import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Hackathon Projects — Lessons Learned | Ayush Halpati',
  description: 'Engineering deep‑dive into TableFlow & DeliveryProof hackathon projects covering problem, investigation, root cause, solution, verification, and key learnings.',
};

export default function HackathonsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-[#111111]/15 bg-[#F9F8F6]" id="hackathons">
          <div className="mx-auto max-w-4xl px-6 py-20">
          <a href="/#experience" className="inline-block mb-4 text-sm font-medium text-[#0047FF] underline">← Back to Experience</a>
            <h1 className="font-display text-4xl font-extrabold text-[#111111] sm:text-5xl">Hackathon Projects – TableFlow & DeliveryProof</h1>
            <p className="mt-4 text-base text-[#333333]"><strong>Problem:</strong> Rapidly prototype end‑to‑end SaaS solutions under tight hackathon timelines while ensuring production‑grade quality and real‑time data handling.</p>
            <p className="mt-4 text-base text-[#333333]"><strong>Investigation:</strong> Analyzed trade‑offs between monolithic vs. micro‑service architectures, benchmarked real‑time state sync mechanisms (WebSockets vs. Supabase Realtime), and evaluated UI responsiveness under concurrent user load.</p>
            <p className="mt-4 text-base text-[#333333]"><strong>Root Cause:</strong> Initial prototype suffered from state‑drift due to unsynchronized client caches and ad‑hoc API contracts, leading to inconsistent order status displays.</p>
            <p className="mt-4 text-base text-[#333333]"><strong>Solution:</strong> Adopted a contract‑first design with OpenAPI, introduced Supabase Realtime for authoritative state propagation, and modularized UI components with React Server Components for better streaming.
            </p>
            <p className="mt-4 text-base text-[#333333]"><strong>Verification:</strong> Performed load testing with simulated users, observed low latency for state updates, and confirmed data consistency across mobile and web clients.</p>

            <p className="mt-4 text-base text-[#333333]"><strong>What I Learned:</strong> Real‑time consistency requires a single source of truth and event‑driven updates; early definition of API contracts prevents downstream integration bugs; hackathon constraints foster creative engineering solutions that can transition to production.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
