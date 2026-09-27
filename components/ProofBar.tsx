import { proofStats } from "@/lib/data";

export function ProofBar() {
  return (
    <section className="border-y border-[#232B36]/70 bg-[#121821]/40">
      <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-[#232B36]/70 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {proofStats.map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-3 py-6 sm:justify-center">
            <span className="font-display text-3xl font-semibold text-[#5EEAD4]">
              {stat.value}
            </span>
            <span className="text-sm text-[#8B93A1]">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
