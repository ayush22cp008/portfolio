"use client";

import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/data";

export function FeaturedProjectCard({
  project,
  index = 1,
}: {
  project: Project;
  index?: number;
}) {
  const formattedIndex = String(index).padStart(2, "0");

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col justify-between border border-[#111111] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#0047FF] hover:shadow-[8px_8px_0px_0px_#0047FF] sm:p-9"
    >
      <div>
        <div className="flex items-center justify-between border-b border-[#111111]/15 pb-4">
          <span className="font-display text-xs font-black tracking-widest text-[#0047FF]">
            CASE // {formattedIndex}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#555555]">
            {project.category}
          </span>
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111] group-hover:text-[#0047FF] transition-colors sm:text-3xl">
            {project.name}
          </h3>
          <ArrowUpRight
            size={22}
            className="mt-1 shrink-0 text-[#111111] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#0047FF]"
          />
        </div>

        <p className="mt-4 text-[15px] leading-relaxed text-[#555555]">
          {project.tagline}
        </p>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 6).map((tech) => (
            <span
              key={tech}
              className="border border-[#111111]/20 bg-[#F9F8F6] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-[#333333]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-[#111111]/15 pt-4 text-xs">
        <span className="font-semibold text-[#555555]">{project.status}</span>
        {project.liveUrl && (
          <span
            onClick={(e) => {
              e.preventDefault();
              window.open(project.liveUrl, "_blank", "noreferrer");
            }}
            className="inline-flex cursor-pointer items-center gap-1 font-bold uppercase tracking-wider text-[#0047FF] hover:underline"
          >
            Live build <ExternalLink size={13} />
          </span>
        )}
      </div>
    </Link>
  );
}

