import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#232B36]/70 bg-[#0B0F14]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-sm font-semibold tracking-tight text-[#E6E8EB] hover:text-[#5EEAD4] transition-colors"
        >
          Ayush Halpati
        </Link>
        <nav className="flex items-center gap-6 text-sm text-[#8B93A1]">
          <a href="/#work" className="hover:text-[#E6E8EB] transition-colors">
            Work
          </a>
          <a href="/#stack" className="hover:text-[#E6E8EB] transition-colors">
            Stack
          </a>
          <a href="/#about" className="hover:text-[#E6E8EB] transition-colors">
            About
          </a>
          <a
            href="https://github.com/ayush22cp008"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#E6E8EB] transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
