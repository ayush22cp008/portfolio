import Link from 'next/link';

export function Experience() {
  return (
    <section id="experience" className="border-b border-[#111111]/15 bg-[#F9F8F6]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col justify-between gap-4 border-b border-[#111111]/15 pb-6 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
              SECTION // 02 — EXPERIENCE
            </span>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight text-[#111111] sm:text-5xl">
              EXPERIENCE & PROJECT WORK
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#555555]">
            My background combines a full-semester AI/ML internship with
            independently developed web and software projects. The project work
            below is presented separately from professional employment.
          </p>
        </div>

        <div className="mt-8 border-l-2 border-[#0047FF] pl-4 text-sm text-[#444444]">
          I work from clear requirements, break features into manageable tasks,
          connect frontend, backend and data layers, and test important workflows
          before delivery.
        </div>

        <div className="mt-12 space-y-8">
          <div className="border-b border-[#111111]/15 pb-6">
            <span className="text-sm font-medium uppercase text-[#0047FF]">Internship</span>
            <h3 className="mt-1 text-xl font-bold text-[#111111]">AI/ML Intern — Invisible Fiction</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#666666]">
              15 Dec 2025 – 10 Apr 2026 / V.V. Nagar, Anand, Gujarat
            </p>
            <p className="mt-4 text-base text-[#333333]">
              Worked on an AI-based mechanical-part detection project, training a
              YOLOv8 Nano segmentation model for 25 part classes and integrating
              it into an Android application using Unity/AR Foundation. The work
              included dataset curation, augmentation, model evaluation and
              inference stability.
            </p>
            <Link href="/experience/mechanical-part-detection" className="mt-3 inline-block text-sm font-semibold text-[#0047FF] hover:underline">
              View internship project →
            </Link>
          </div>

          <div className="border-b border-[#111111]/15 pb-6">
            <span className="text-sm font-medium uppercase text-[#0047FF]">Independent Project Work</span>
            <h3 className="mt-1 text-xl font-bold text-[#111111]">Full-Stack Web Applications</h3>
            <p className="mt-4 text-base text-[#333333]">
              Built TableFlow and DeliveryProof with Next.js, TypeScript/React,
              Supabase and PostgreSQL. Implemented role-aware workflows,
              database operations, real-time notifications, delivery-event
              records and API integrations. These are independent project
              experiences, not paid employment roles.
            </p>
            <Link href="/experience/hackathons" className="mt-3 inline-block text-sm font-semibold text-[#0047FF] hover:underline">
              View project work →
            </Link>
          </div>

          <div className="pb-6">
            <span className="text-sm font-medium uppercase text-[#0047FF]">Additional Project Work</span>
            <h3 className="mt-1 text-xl font-bold text-[#111111]">Applied AI & Full-Stack Experiments</h3>
            <p className="mt-4 text-base text-[#333333]">
              Developed AI-enabled applications and prototypes involving RAG,
              embeddings, LLM APIs, recommendation workflows and data processing.
              This work complements my primary interest in software and web
              application development.
            </p>
            <Link href="/experience/applied-ai-full-stack" className="mt-3 inline-block text-sm font-semibold text-[#0047FF] hover:underline">
              Explore additional projects →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
