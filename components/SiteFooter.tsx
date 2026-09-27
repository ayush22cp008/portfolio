import { GitBranch, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-[#232B36]/70">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#E6E8EB]">
              Building something worth talking about?
            </h2>
            <p className="mt-2 max-w-md text-sm text-[#8B93A1]">
              Open to full-stack and GenAI roles, and to freelance builds.
              Based in Gujarat, happy to relocate for the right team.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="https://github.com/ayush22cp008"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-[#232B36] px-4 py-2 text-sm text-[#E6E8EB] hover:border-[#5EEAD4]/50 hover:text-[#5EEAD4] transition-colors"
            >
              <GitBranch size={16} />
              GitHub
            </a>
            <a
              href="mailto:hello@example.com"
              className="inline-flex items-center gap-2 rounded-md bg-[#5EEAD4] px-4 py-2 text-sm font-medium text-[#0B0F14] hover:bg-[#2DD4BF] transition-colors"
            >
              <Mail size={16} />
              Get in touch
            </a>
          </div>
        </div>
        <p className="mt-12 text-xs text-[#8B93A1]">
          Ayush Halpati — Gujarat, India. Built with Next.js.
        </p>
      </div>
    </footer>
  );
}
