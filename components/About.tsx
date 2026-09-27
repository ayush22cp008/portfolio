export function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-2xl font-semibold text-[#E6E8EB]">
          How I build
        </h2>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#8B93A1]">
          <p>
            I work with AI agents as part of my actual workflow — planning
            architecture with Claude, delegating implementation to coding
            agents, and treating the whole thing like a real engineering
            process: written specs, investigation before fixes, and a
            reviewable trail of what changed and why. That&apos;s not a
            shortcut around understanding the code. It&apos;s a different
            division of labor, and I think it&apos;s a real, underrated skill
            on its own.
          </p>
          <p>
            The honest caveat: that speed is only worth anything if I can
            explain, defend, and debug what gets built. So alongside
            shipping, I&apos;m deliberately keeping my own TypeScript and
            Python fundamentals sharp — reading every diff, understanding
            every schema decision, and being able to trace a bug to its root
            cause myself when something breaks in production.
          </p>
        </div>
      </div>
    </section>
  );
}
