import { projects } from "@/lib/data";
import { FeaturedProjectCard } from "@/components/FeaturedProjectCard";
import { MoreProjects } from "@/components/MoreProjects";

const featured = projects.filter((p) => p.featured);

export function FeaturedProjects() {
  return (
    <section id="work" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="font-display text-2xl font-semibold text-[#E6E8EB]">
        Featured work
      </h2>
      <p className="mt-2 max-w-md text-sm text-[#8B93A1]">
        Two builds I&apos;d stand behind in an interview — problem, decisions,
        and the bugs I actually hit.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {featured.map((project) => (
          <FeaturedProjectCard key={project.slug} project={project} />
        ))}
      </div>

      <div className="mt-16">
        <h3 className="font-display text-lg font-semibold text-[#E6E8EB]">
          More projects
        </h3>
        <div className="mt-6">
          <MoreProjects />
        </div>
      </div>
    </section>
  );
}
