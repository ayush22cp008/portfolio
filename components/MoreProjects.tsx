"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/lib/data";

const filters = ["All", "Full-Stack", "GenAI/RAG", "Computer Vision"] as const;
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
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              active === f
                ? "border-[#5EEAD4]/60 bg-[#5EEAD4]/10 text-[#5EEAD4]"
                : "border-[#232B36] text-[#8B93A1] hover:border-[#8B93A1]/60 hover:text-[#E6E8EB]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visible.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.repoUrl}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-xl border border-[#232B36] bg-[#121821] p-5 transition-colors hover:border-[#5EEAD4]/40 hover:bg-[#161D28]"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-display text-base font-semibold text-[#E6E8EB]">
          {project.name}
        </h4>
        <ArrowUpRight
          size={17}
          className="mt-0.5 shrink-0 text-[#8B93A1] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#5EEAD4]"
        />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[#8B93A1]">{project.tagline}</p>
      <p className="mt-4 text-xs text-[#8B93A1]">
        {project.stack.slice(0, 4).join(" · ")}
      </p>
    </a>
  );
}
