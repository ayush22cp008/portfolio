import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#111111]/15 bg-[#F9F8F6]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-base font-bold tracking-tight text-[#111111]"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-[#0047FF] transition-transform group-hover:scale-125" />
          <span>AYUSH HALPATI</span>
        </Link>
        <nav className="flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-[#555555]">
          <a
            href="/#work"
            className="transition-colors hover:text-[#0047FF]"
          >
            Work
          </a>
          <a
            href="/#experience"
            className="transition-colors hover:text-[#0047FF]"
          >
            Experience
          </a>
          <a
            href="/#stack"
            className="transition-colors hover:text-[#0047FF]"
          >
            Stack
          </a>
          <a
            href="/#ask"
            className="transition-colors hover:text-[#0047FF]"
          >
            Ask Ayush
          </a>
          <a
            href="/#about"
            className="transition-colors hover:text-[#0047FF]"
          >
            About
          </a>
          <a
            href="/#contact"
            className="transition-colors hover:text-[#0047FF]"
          >
            Contact
          </a>
          <a
            href="https://github.com/ayush22cp008"
            target="_blank"
            rel="noreferrer"
            className="rounded border border-[#111111]/20 px-2.5 py-1 text-[#111111] transition-all hover:border-[#0047FF] hover:bg-[#0047FF] hover:text-white"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

