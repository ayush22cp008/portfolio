"use client";

import Link from "next/link";
import { useState } from "react";

const navigationLinks = [
  { label: "Work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "Stack", href: "/#stack" },
  { label: "Ask Ayush", href: "/#ask" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#111111]/15 bg-[#F9F8F6]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-base font-bold tracking-tight text-[#111111]"
          onClick={() => setMenuOpen(false)}
        >
          <span className="inline-block h-2 w-2 rounded-full bg-[#0047FF] transition-transform group-hover:scale-125" />
          <span>AYUSH HALPATI</span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-wider text-[#555555] lg:flex"
        >
          {navigationLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap transition-colors hover:text-[#0047FF]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="https://github.com/ayush22cp008"
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap rounded border border-[#111111]/20 px-2.5 py-1 text-[#111111] transition-all hover:border-[#0047FF] hover:bg-[#0047FF] hover:text-white"
          >
            GitHub
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded border border-[#111111]/20 text-[#111111] transition-colors hover:border-[#0047FF] hover:text-[#0047FF] lg:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-[#111111]/15 px-4 py-3 lg:hidden sm:px-6"
        >
          <div className="mx-auto flex max-w-6xl flex-col">
            {navigationLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-[#111111]/10 py-3 text-xs font-semibold uppercase tracking-wider text-[#555555] transition-colors last:border-b-0 hover:text-[#0047FF]"
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://github.com/ayush22cp008"
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
              className="py-3 text-xs font-semibold uppercase tracking-wider text-[#555555] transition-colors hover:text-[#0047FF]"
            >
              GitHub ↗
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
