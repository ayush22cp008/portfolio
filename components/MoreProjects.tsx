"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/lib/data";

const filters = ["All", "Full-Stack", "GenAI", "Computer Vision"] as const;
type Filter = (typeof filters)[number];

const secondary = projects.filter((p) => !p.featured);

export function MoreProjects() {
  const [active, setActive] = useState<Filter>("All");

  const visible =
    active === "All" ? secondary : secondary.filter((p) => p.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              active === f
                ? "border-[#0047FF] bg-[#0047FF] text-white"
                : "border-[#111111]/25 bg-white text-[#555555] hover:border-[#111111] hover:text-[#111111]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((project, idx) => (
          <ProjectCard key={project.slug} project={project} index={idx + 3} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const formattedIndex = String(index).padStart(2, "0");

  return (
    <a
      href={project.repoUrl}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col justify-between border border-[#111111] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#0047FF] hover:shadow-[6px_6px_0px_0px_#0047FF]"
    >
      <div>
        <div className="flex items-center justify-between border-b border-[#111111]/15 pb-3">
          <span className="font-display text-[10px] font-black tracking-widest text-[#0047FF]">
            ARCHIVE // {formattedIndex}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#777777]">
            {project.category}
          </span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <h4 className="font-display text-lg font-bold uppercase tracking-tight text-[#111111] group-hover:text-[#0047FF] transition-colors">
            {project.name}
          </h4>
          <ArrowUpRight
            size={18}
            className="mt-0.5 shrink-0 text-[#111111] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#0047FF]"
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#555555]">
          {project.tagline}
        </p>
      </div>

      <div className="mt-6 border-t border-[#111111]/15 pt-3">
        <p className="text-[11px] font-medium tracking-wide text-[#777777]">
          {project.stack.slice(0, 4).join(" · ")}
        </p>
      </div>
    </a>
  );
}

