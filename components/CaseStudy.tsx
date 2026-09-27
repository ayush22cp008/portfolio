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
    <header className="mx-auto max-w-3xl px-6 pb-10 pt-14">
      <Link
        href="/#work"
        className="inline-flex items-center gap-1.5 text-sm text-[#8B93A1] hover:text-[#5EEAD4] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to work
      </Link>

      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-[#5EEAD4]">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-[#E6E8EB] sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#8B93A1]">
        {tagline}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-[#5EEAD4] px-4 py-2 text-sm font-medium text-[#0B0F14] hover:bg-[#2DD4BF] transition-colors"
          >
            Live demo
            <ExternalLink size={14} />
          </a>
        )}
        <a
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-[#232B36] px-4 py-2 text-sm text-[#E6E8EB] hover:border-[#5EEAD4]/50 hover:text-[#5EEAD4] transition-colors"
        >
          <GitBranch size={14} />
          Source
        </a>
        <span className="text-xs text-[#8B93A1]">{status}</span>
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
    <section className="mx-auto max-w-3xl px-6 py-8">
      <h2 className="font-display text-xl font-semibold text-[#E6E8EB]">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#8B93A1]">
        {children}
      </div>
    </section>
  );
}

export function StackRow({ stack }: { stack: string[] }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="flex flex-wrap gap-2 border-y border-[#232B36] py-5">
        {stack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[#232B36] px-3 py-1 text-xs text-[#8B93A1]"
          >
            {tech}
          </span>
        ))}
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
    <div className="rounded-xl border border-[#232B36] bg-[#121821] p-6">
      <h3 className="font-display text-base font-semibold text-[#E6E8EB]">
        {title}
      </h3>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#8B93A1]">
        {children}
      </div>
    </div>
  );
}
