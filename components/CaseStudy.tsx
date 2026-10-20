import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, GitBranch } from "lucide-react";

export function CaseStudyHeader({
  eyebrow,
  title,
  tagline,
  liveUrl,
  repoUrl,
  status,
}: {
  eyebrow: string;
  title: string;
  tagline: string;
  liveUrl?: string;
  repoUrl: string;
  status: string;
}) {
  return (
    <header className="border-b border-[#111111]/15 bg-[#F9F8F6]">
      <div className="mx-auto max-w-4xl px-6 pb-12 pt-14">
        <Link
          href="/#work"
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#555555] transition-colors hover:text-[#0047FF]"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Case Studies</span>
        </Link>

        <div className="mt-8 flex items-center justify-between border-b border-[#111111]/15 pb-4">
          <span className="text-xs font-black uppercase tracking-widest text-[#0047FF]">
            {eyebrow}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#555555]">
            {status}
          </span>
        </div>

        <h1 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-[#111111] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[#444444] sm:text-xl">
          {tagline}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-[#111111] bg-[#111111] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-[#0047FF] hover:bg-[#0047FF]"
            >
              <span>Live Application</span>
              <ExternalLink size={14} />
            </a>
          )}
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-[#111111] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#111111] transition-all hover:border-[#0047FF] hover:text-[#0047FF]"
          >
            <GitBranch size={14} />
            <span>Source Code</span>
          </a>
        </div>
      </div>
    </header>
  );
}

export function CaseStudySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-10 border-b border-[#111111]/10">
      <div className="border-b border-[#111111]/15 pb-3">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
          {title}
        </h2>
      </div>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-[#333333]">
        {children}
      </div>
    </section>
  );
}

export function StackRow({ stack }: { stack: string[] }) {
  return (
    <div className="border-b border-[#111111]/15 bg-white">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#777777]">
          VERIFIED STACK ARCHITECTURE
        </span>
        <div className="mt-3 flex flex-wrap gap-2">
          {stack.map((tech) => (
            <span
              key={tech}
              className="border border-[#111111]/20 bg-[#F9F8F6] px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[#111111]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BugCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-[#111111] bg-white p-7 shadow-[6px_6px_0px_0px_#111111]">
      <div className="flex items-center gap-2 border-b border-[#111111]/15 pb-3">
        <span className="inline-block h-2 w-2 bg-[#0047FF]" />
        <h3 className="font-display text-base font-bold uppercase tracking-tight text-[#111111]">
          {title}
        </h3>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#444444]">
        {children}
      </div>
    </div>
  );
}

