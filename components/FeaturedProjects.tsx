import { projects } from "@/lib/data";
import { FeaturedProjectCard } from "@/components/FeaturedProjectCard";
import { MoreProjects } from "@/components/MoreProjects";

const featured = projects.filter((p) => p.featured);

export function FeaturedProjects() {
  return (
    <section id="work" className="border-b border-[#111111]/15 bg-[#F9F8F6]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col justify-between gap-4 border-b border-[#111111]/15 pb-6 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
              SECTION // 01 — WORK
            </span>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight text-[#111111] sm:text-5xl">
              FEATURED CASE STUDIES
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#555555]">
            Two full-stack & AI production builds I stand behind — problem breakdown,
            architectural decisions, and exact bugs fixed.
          </p>
        </div>

        {/* Numbered Case Studies */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {featured.map((project, index) => (
            <FeaturedProjectCard
              key={project.slug}
              project={project}
              index={index + 1}
            />
          ))}
        </div>

        {/* Additional Projects Divider */}
        <div className="mt-20 border-t border-[#111111]/15 pt-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
                ARCHIVE // 02 — REPOSITORIES
              </span>
              <h3 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                ADDITIONAL SYSTEMS & EXPERIMENTS
              </h3>
            </div>
          </div>
          <MoreProjects />
        </div>
      </div>
    </section>
  );
}

