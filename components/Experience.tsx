import React from 'react';

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
            A brief overview of my applied AI, full‑stack development and computer‑vision engineering work.
          </p>
        </div>
        {/* Entries */}
        <div className="mt-12 space-y-8">
          {/* Entry 1 */}
          <div className="border-b border-[#111111]/15 pb-6 last:border-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
              <div>
                <span className="text-sm font-medium uppercase text-[#0047FF]">Independent Project Work</span>
                <h3 className="mt-1 text-xl font-bold text-[#111111]">Applied AI & Full‑Stack Projects</h3>
              </div>
              <span className="mt-2 text-sm text-[#555555] sm:mt-0">2025 – 2026</span>
            </div>
            <p className="mt-4 text-base text-[#333333]">
              Built and iterated on applied AI and full‑stack projects spanning recommendation prototypes, data analytics, computer vision, retrieval‑augmented generation (RAG), local/cloud AI workflows and role‑aware operational applications. Emphasised requirements decomposition, architecture and data/state boundaries, debugging, AI‑agent coordination, change review and verification.
            </p>
          </div>
          {/* Entry 2 */}
          <div className="border-b border-[#111111]/15 pb-6 last:border-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
              <div>
                <span className="text-sm font-medium uppercase text-[#0047FF]">Internship</span>
                <h3 className="mt-1 text-xl font-bold text-[#111111]">AI‑Based Mechanical Part Detection</h3>
              </div>
              <span className="mt-2 text-sm text-[#555555] sm:mt-0">2025 – 2026</span>
            </div>
            <p className="mt-4 text-base text-[#333333]">
              Contributed to a computer‑vision project integrating YOLOv8 Nano segmentation into a Unity Android/AR workflow. The pipeline processed a dataset of ~6,000 images across 25 classes, handling training, evaluation and deployment workflows.
            </p>
          </div>
          {/* Entry 3 */}
          <div className="pb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
              <div>
                <span className="text-sm font-medium uppercase text-[#0047FF]">Hackathon Projects</span>
                <h3 className="mt-1 text-xl font-bold text-[#111111]">TableFlow & DeliveryProof</h3>
              </div>
              <span className="mt-2 text-sm text-[#555555] sm:mt-0">2026</span>
            </div>
            <p className="mt-4 text-base text-[#333333]">
              Developed operational application workflows involving role‑aware access, state handling, order claiming, chronological delivery evidence and AI‑assisted summaries. Addressed engineering challenges around real‑time data flow and verification without duplicating the detailed project cards shown in the Work section.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
