import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Applied AI & Full-Stack Projects — Lessons Learned | Ayush Halpati',
  description: 'Engineering experience covering recommendation logic, data analytics, language-model integrations, document retrieval, local/cloud AI workflows, and application development.',
};

export default function AppliedAIPage() {
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
                EXPERIENCE // PAGE 01
              </span>
              <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight text-[#111111] sm:text-5xl">
                Applied AI & Full-Stack Projects
              </h1>
            </header>

            <div className="mt-10 space-y-12 text-[#222222]">
              {/* Overview */}
              <section>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                  Overview
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#444444]">
                  My applied AI and full-stack work covers several different project types rather than one shared application architecture. These projects gave me experience with recommendation logic, data analytics, language-model integrations, document retrieval, local/cloud AI workflows, and application development.
                </p>
              </section>

              {/* Areas of Experience */}
              <section className="space-y-6">
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                  Areas of Experience
                </h2>

                <div className="border-l-2 border-[#111111]/15 pl-5">
                  <h3 className="font-display text-lg font-bold text-[#111111]">
                    Recommendation Systems and Data Analytics
                  </h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-[#444444]">
                    <li>
                      <strong className="text-[#111111]">Movie Recommendation System:</strong> Built a Streamlit movie-recommendation prototype using precomputed similarity data and poster lookup.
                    </li>
                    <li>
                      <strong className="text-[#111111]">WhatsApp Chat Analyzer:</strong> Worked with exported chat data to produce message statistics, activity visualizations, and text summaries.
                    </li>
                    <li>
                      <strong className="text-[#111111]">Habit Recommendation & Analytics:</strong> Explored personalized habit recommendations, analytics, goal relevance, repeated or empty suggestions, feedback persistence, and data-schema consistency.
                    </li>
                  </ul>
                </div>

                <div className="border-l-2 border-[#111111]/15 pl-5">
                  <h3 className="font-display text-lg font-bold text-[#111111]">
                    LLM Applications and AI Workflows
                  </h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-[#444444]">
                    <li>
                      <strong className="text-[#111111]">Tech Product Review Analyzer:</strong> Developed an LLM-assisted prototype for product-review interpretation, category handling, and structured insights.
                    </li>
                    <li>
                      <strong className="text-[#111111]">ZENI — Thinking Partner:</strong> Worked on a thinking-workflow application supporting local Ollama and cloud Groq modes to organize goals, tasks, prompts, and next steps.
                    </li>
                    <li>
                      <strong className="text-[#111111]">NCERT AI Tutor:</strong> Built a RAG-based tutor prototype for NCERT Mathematics and Science content, involving document ingestion, retrieval, and answer modes.
                    </li>
                  </ul>
                </div>
              </section>

              {/* What I Learned */}
              <section>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                  What I Learned
                </h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-[#444444]">
                  <li>
                    Generating a recommendation is not enough; its relevance to the user's current goal matters.
                  </li>
                  <li>
                    Recommendation workflows need attention to repeated results, empty outputs, feedback persistence, and data consistency.
                  </li>
                  <li>
                    RAG applications depend on document ingestion, retrieval, and clear handling of limitations or model failures.
                  </li>
                  <li>
                    AI-generated code and explanations need source inspection, change review, and appropriate checks rather than blind acceptance.
                  </li>
                  <li>
                    A structured development process helps separate the problem, proposed change, observed result, and remaining uncertainty.
                  </li>
                </ul>
              </section>

              {/* Working Approach */}
              <section>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                  Working Approach
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#444444]">
                  I increasingly used explicit task boundaries, staged implementation, source-first investigation, change review, AI-tool coordination, and human approval. Implementation was AI-assisted where appropriate, with responsibility for project scope, acceptance decisions, and review retained on my side.
                </p>
              </section>

              {/* Scope and Attribution Note */}
              <footer className="border-t border-[#111111]/15 pt-8 text-xs text-[#777777]">
                <p>
                  <strong>Scope and Attribution Note:</strong> This page summarizes project experience and learning. It is not intended to replace detailed case studies or imply that every implementation detail was independently authored, every hypothesis was conclusively proven, or every system has been independently certified for production use.
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
