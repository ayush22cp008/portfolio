export function About() {
  return (
    <section id="about" className="border-b border-[#111111]/15 bg-[#F9F8F6]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
              SECTION // 05 — ABOUT
            </span>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight text-[#111111] sm:text-5xl">
              HOW I <br /> BUILD SOFTWARE
            </h2>
            <div className="mt-8 border-l-2 border-[#0047FF] pl-4 text-xs font-bold uppercase tracking-wider text-[#555555]">
              PRACTICAL BUILDING / FAST LEARNING / CONTINUOUS IMPROVEMENT
            </div>
          </div>

          <div className="border border-[#111111] bg-white p-8 shadow-[8px_8px_0px_0px_#111111] sm:p-10">
            <div className="space-y-6 text-base leading-relaxed text-[#333333]">
              <p>
                I am a 2026 Computer Engineering graduate focused on full-stack
                software development. I enjoy turning requirements into working
                applications, connecting user interfaces with APIs and databases,
                and improving features through testing and debugging.
              </p>
              <p>
                Through independent projects and my AI/ML internship, I have
                worked on role-based workflows, PostgreSQL operations, REST API
                integrations, real-time notifications, and application interfaces.
                These projects have helped me practise taking work from an initial
                idea through implementation and delivery.
              </p>
              <p>
                I am at the beginning of my professional career and am looking for
                an entry-level opportunity where I can contribute, learn a team's
                engineering practices, take ownership of development tasks, and
                grow as a software developer. I also explore AI tools and
                integrations when they provide practical value to an application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
