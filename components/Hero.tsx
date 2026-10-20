import Image from "next/image";
import { MapPin, ArrowDownRight, FileDown } from "lucide-react";
import { profile } from "@/lib/data";

export function Hero() {
  return (
    <section className="border-b border-[#111111]/15 bg-[#F9F8F6]">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        {/* Editorial Subheader Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#111111]/15 pb-6 text-xs font-semibold uppercase tracking-wider text-[#555555]">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0047FF]" />
            <span>PORTFOLIO & ARCHIVE / 2026</span>
          </div>
          <div className="text-right">
            <span>{profile.grad}</span>
          </div>
        </div>

        {/* Asymmetrical Grid: Oversized Title + Portrait */}
        <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="animate-fade-up">
            <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-[#111111] sm:text-7xl lg:text-8xl">
              FULL-STACK <br />
              <span className="text-[#0047FF]">ENGINEER.</span> <br />
              GENAI & RAG.
            </h1>

            <p className="mt-8 max-w-xl text-lg font-normal leading-relaxed text-[#444444] sm:text-xl">
              I build web products end-to-end, then wire generative AI,
              retrieval-augmented generation, and agentic workflows into the
              subsystems that actually need them.
            </p>

            {/* Location & relocation */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-[#555555]">
              <MapPin size={16} className="text-[#0047FF]" />
              <span className="font-medium text-[#111111]">{profile.location}</span>
              <span className="text-[#999999]">/</span>
              <span>Available to relocate: {profile.relocate.join(", ")}</span>
            </div>

            {/* Call to Actions */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#work"
                className="group inline-flex items-center gap-2.5 rounded-none border border-[#111111] bg-[#111111] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-[#0047FF] hover:bg-[#0047FF]"
              >
                <span>Explore Projects</span>
                <ArrowDownRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                />
              </a>
              <button
                disabled
                title="Verified resume asset pending verification"
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-none border border-[#111111]/25 bg-transparent px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#888888]"
              >
                <FileDown size={15} />
                <span>Resume (Pending)</span>
              </button>
            </div>
          </div>

          {/* Asymmetric Side Column: Image Frame with Swiss Graphic Accent */}
          <div className="relative animate-fade-up [animation-delay:150ms] lg:pl-6">
            <div className="border border-[#111111] bg-white p-3 shadow-[8px_8px_0px_0px_#111111]">
              <div className="overflow-hidden bg-[#E2DDD5]">
                <Image
                  src="/images/hero.png"
                  alt={`${profile.name} working at a laptop`}
                  width={900}
                  height={1100}
                  priority
                  className="h-full w-full object-cover grayscale contrast-110 transition-all duration-500 hover:grayscale-0"
                />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#111111]/15 pt-2 text-[11px] font-semibold uppercase tracking-wider text-[#555555]">
                <span>FIG. 01 / AYUSH HALPATI</span>
                <span className="text-[#0047FF]">SYS // ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

