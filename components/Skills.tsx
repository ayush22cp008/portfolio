import { skillGroups } from "@/lib/data";

export function Skills() {
  return (
    <section id="stack" className="border-b border-[#111111]/15 bg-[#F9F8F6]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col justify-between gap-4 border-b border-[#111111]/15 pb-6 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
              SECTION // 03 — CAPABILITIES
            </span>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight text-[#111111] sm:text-5xl">
              TECHNICAL STACK
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#555555]">
            Core technologies and frameworks applied across production SaaS,
            retrieval pipelines, and computer vision models.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 divide-y border border-[#111111] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {skillGroups.map((group, idx) => (
            <div key={group.label} className="p-8">
              <div className="flex items-center justify-between border-b border-[#111111]/15 pb-4">
                <span className="font-display text-xs font-black tracking-widest text-[#0047FF]">
                  0{idx + 1}
                </span>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#111111]">
                  {group.label}
                </h3>
              </div>
              <ul className="mt-6 space-y-3">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm font-medium text-[#444444]"
                  >
                    <span className="inline-block h-1.5 w-1.5 bg-[#0047FF]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

