export function About() {
  return (
    <section id="about" className="border-b border-[#111111]/15 bg-[#F9F8F6]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          {/* Left Column: Heading and metadata */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
              SECTION // 05 — PHILOSOPHY
            </span>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight text-[#111111] sm:text-5xl">
              ENGINEERING <br />
              METHODOLOGY
            </h2>
            <div className="mt-8 border-l-2 border-[#0047FF] pl-4 text-xs font-bold uppercase tracking-wider text-[#555555]">
              VERIFIABLE WORKFLOWS / NO GUESSWORK / SPEC-DRIVEN
            </div>
          </div>

          {/* Right Column: Editorial Body with Card Border */}
          <div className="border border-[#111111] bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_#111111]">
            <div className="space-y-6 text-base leading-relaxed text-[#333333]">
              <p>
                I work with AI agents as part of my actual engineering workflow —
                planning architecture and schemas upfront, delegating implementation
                to coding agents against locked specifications, and maintaining a
                rigorous reviewable trail of every change and root cause.
              </p>
              <p>
                That is not a shortcut around understanding the code. It is an
                intentional division of engineering labor: treating models as
                high-throughput executors while keeping human architectural judgment,
                schema integrity, and runtime verification strictly in control.
              </p>
              <p className="border-t border-[#111111]/15 pt-6 font-medium text-[#111111]">
                Speed is only valuable if what gets shipped is provable and
                debuggable. Alongside rapid iteration, I keep my TypeScript,
                Postgres, and Python fundamentals sharp — reading every diff,
                validating database RPCs, and tracing production bugs down to
                their root cause.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

