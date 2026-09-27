import Image from "next/image";
import { MapPin, ArrowRight, FileDown } from "lucide-react";
import { profile } from "@/lib/data";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-16 pt-14 sm:pt-20">
      <div className="grid grid-cols-1 items-center gap-12 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="animate-fade-up">
          <p className="font-display text-sm font-medium tracking-tight text-[#5EEAD4]">
            {profile.grad}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-[#E6E8EB] sm:text-5xl">
            {profile.name}
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-[#8B93A1]">
            {profile.tagline}. I build products end-to-end, then wire generative AI
            and retrieval into the parts that actually need it.
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm text-[#8B93A1]">
            <MapPin size={15} />
            <span>
              {profile.location} · open to relocate — {profile.relocate.join(", ")}
            </span>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-md bg-[#5EEAD4] px-5 py-2.5 text-sm font-medium text-[#0B0F14] hover:bg-[#2DD4BF] transition-colors"
            >
              See the work
              <ArrowRight size={15} />
            </a>
            <button
              disabled
              title="Coming soon"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-[#232B36] px-5 py-2.5 text-sm font-medium text-[#8B93A1] opacity-60"
            >
              <FileDown size={15} />
              Resume
            </button>
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="absolute -inset-4 -z-10 rounded-2xl bg-[#5EEAD4]/10 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-[#232B36] bg-[#121821]">
            <Image
              src="/images/hero.png"
              alt={`${profile.name} working at a laptop`}
              width={900}
              height={1100}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
