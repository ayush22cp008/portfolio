import { skillGroups } from "@/lib/data";

export function Skills() {
  return (
    <section id="stack" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="font-display text-2xl font-semibold text-[#E6E8EB]">
        What I build with
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {skillGroups.map((group) => (
          <div key={group.label}>
            <h3 className="text-sm font-medium text-[#5EEAD4]">{group.label}</h3>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li key={item} className="text-sm text-[#8B93A1]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
