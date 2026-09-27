"use client";

import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/data";

export function FeaturedProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-2xl border border-[#232B36] bg-[#121821] p-7 transition-colors hover:border-[#5EEAD4]/40 hover:bg-[#161D28] sm:p-9"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#5EEAD4]">
            {project.category}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-[#E6E8EB]">
            {project.name}
          </h3>
        </div>
        <ArrowUpRight
          size={22}
          className="mt-1 shrink-0 text-[#8B93A1] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#5EEAD4]"
        />
      </div>

      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#8B93A1]">
        {project.tagline}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.stack.slice(0, 5).map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[#232B36] px-2.5 py-1 text-xs text-[#8B93A1]"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-between border-t border-[#232B36] pt-4">
        <span className="text-xs text-[#8B93A1]">{project.status}</span>
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5EEAD4] hover:underline"
          >
            Live demo <ExternalLink size={12} />
          </a>
        )}
      </div>
    </Link>
  );
}
