import React from 'react';
import Link from 'next/link';

export function Experience() {
  return (
    <section id="experience" className="border-b border-[#111111]/15 bg-[#F9F8F6]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#111111]/15 pb-6 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
              SECTION // 02 — EXPERIENCE
            </span>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight text-[#111111] sm:text-5xl">
              ENGINEERING EXPERIENCE
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#555555]">
            I build and iterate on applied AI and full-stack projects spanning recommendation systems, data analytics, computer vision, retrieval-augmented generation (RAG), local and cloud AI workflows, and role-aware operational applications.
          </p>
        </div>

        {/* Approach note */}
        <div className="mt-8 border-l-2 border-[#0047FF] pl-4 text-sm text-[#444444]">
          My working approach focuses on understanding the user problem, defining scope, breaking work into manageable steps, investigating source code, reviewing changes, coordinating AI tools, and checking application workflows before submission.
        </div>

        {/* Entries */}
        <div className="mt-12 space-y-8">
          {/* Entry 1 */}
          <div className="border-b border-[#111111]/15 pb-6 last:border-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
              <div>
                <span className="text-sm font-medium uppercase text-[#0047FF]">Overview</span>
                <h3 className="mt-1 text-xl font-bold text-[#111111]">Applied AI & Full-Stack Projects</h3>
              </div>
            </div>
            <p className="mt-4 text-base text-[#333333]">
              Worked on recommendation and analytics prototypes, LLM-based applications, RAG systems, local/cloud AI workflows, and full-stack applications. My experience includes working with data processing, APIs, model integration, application state, debugging, and AI-assisted development.
            </p>
            <Link
              href="/experience/applied-ai-full-stack"
              className="inline-block mt-3 text-sm font-semibold text-[#0047FF] hover:underline"
            >
              Explore Lessons →
            </Link>
          </div>

          {/* Entry 2 */}
          <div className="border-b border-[#111111]/15 pb-6 last:border-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
              <div>
                <span className="text-sm font-medium uppercase text-[#0047FF]">Internship</span>
                <h3 className="mt-1 text-xl font-bold text-[#111111]">AI-Based Mechanical Part Detection</h3>
              </div>
            </div>
            <p className="mt-4 text-base text-[#333333]">
              Contributed to a computer-vision project integrating YOLOv8 Nano segmentation into a Unity Android/AR application. The project used a dataset of approximately 6,000 images across 25 mechanical component classes, combining synthetic and real-world data.
            </p>
            <Link
              href="/experience/mechanical-part-detection"
              className="inline-block mt-3 text-sm font-semibold text-[#0047FF] hover:underline"
            >
              Explore Lessons →
            </Link>
          </div>

          {/* Entry 3 */}
          <div className="pb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
              <div>
                <span className="text-sm font-medium uppercase text-[#0047FF]">Full-Stack Projects</span>
                <h3 className="mt-1 text-xl font-bold text-[#111111]">TableFlow & DeliveryProof</h3>
              </div>
            </div>
            <p className="mt-4 text-base text-[#333333]">
              Worked on two distinct full-stack projects: TableFlow, a restaurant-operations application, and DeliveryProof, an evidence-first logistics workflow. The projects involved role-aware workflows, application state, database operations, delivery-event records, and AI-assisted summaries.
            </p>
            <Link
              href="/experience/hackathons"
              className="inline-block mt-3 text-sm font-semibold text-[#0047FF] hover:underline"
            >
              Explore Lessons →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
