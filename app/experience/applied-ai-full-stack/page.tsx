import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Applied AI & Full-Stack Projects — Lessons Learned | Ayush Halpati',
  description: 'Engineering deep‑dive on applied AI & full‑stack projects, covering problem, investigation, root cause, solution, verification, and key learnings.',
};

export default function AppliedAIPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-[#111111]/15 bg-[#F9F8F6]" id="applied-ai">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <h1 className="font-display text-4xl font-extrabold text-[#111111] sm:text-5xl">Applied AI & Full‑Stack Projects</h1>
            <p className="mt-4 text-base text-[#333333]">
              <strong>Problem:</strong> Building end‑to‑end AI‑enhanced applications that combine custom recommendation engines, data analytics dashboards, and real‑time user interfaces while keeping code maintainable and performant.
            </p>
            <p className="mt-4 text-base text-[#333333]">
              <strong>Investigation:</strong> Conducted a systematic design review of data pipelines, evaluated various model serving strategies (local GPU, serverless, and edge), and benchmarked UI rendering performance with React Server Components.
            </p>
            <p className="mt-4 text-base text-[#333333]">
              <strong>Root Cause:</strong> Early prototypes suffered from tight coupling between model inference and UI state, causing latency spikes and state inconsistency.
            </p>
            <p className="mt-4 text-base text-[#333333]">
              <strong>Solution:</strong> Refactored the architecture to a clear separation: a backend Next.js API route for model inference, a React context for shared state, and incremental static regeneration for caching heavy results.
            </p>
            <p className="mt-4 text-base text-[#333333]">
              <strong>Verification:</strong> Confirmed latency improvements and state stability through integration tests and manual UI walkthroughs.
            </p>
            <p className="mt-4 text-base text-[#333333]">
              <strong>What I Learned:</strong> Decoupling AI inference from UI logic is critical for scalability; leveraging Next.js ISR provides a sweet spot between freshness and performance; clear type contracts prevent subtle bugs in data handling.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
