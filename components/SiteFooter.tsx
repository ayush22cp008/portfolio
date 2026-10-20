import { GitBranch, Mail, ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t-2 border-[#111111] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
              SECTION // 06 — CONTACT & INQUIRIES
            </span>
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight text-[#111111] sm:text-5xl">
              BUILDING SOMETHING <br />
              WORTH TALKING ABOUT?
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#555555]">
              Open to full-stack, GenAI, and agentic engineering roles. Based in
              Gujarat, India — open to relocate for the right engineering team.
            </p>
          </div>

          <div className="flex flex-col justify-between border-t border-[#111111]/15 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#777777]">
                DIRECT CHANNELS
              </span>
              <div className="flex flex-col gap-3">
                <a
                  href="https://github.com/ayush22cp008"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between border border-[#111111] bg-[#F9F8F6] p-4 text-xs font-bold uppercase tracking-wider text-[#111111] transition-all hover:border-[#0047FF] hover:bg-[#0047FF] hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <GitBranch size={16} />
                    GITHUB // AYUSH22CP008
                  </span>
                  <ArrowUpRight size={16} />
                </a>

                <a
                  href="mailto:YOUR_EMAIL"
                  className="group flex items-center justify-between border border-[#111111] bg-[#111111] p-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-[#0047FF] hover:bg-[#0047FF]"
                >
                  <span className="flex items-center gap-2">
                    <Mail size={16} />
                    GET IN TOUCH VIA EMAIL
                  </span>
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>

            <div className="mt-8 border-t border-[#111111]/15 pt-6 text-xs text-[#777777]">
              <span>AYUSH HALPATI — GUJARAT, INDIA. BOLD SWISS EDITORIAL // NEXT.JS.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

