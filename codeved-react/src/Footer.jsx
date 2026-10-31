import React from "react";

export default function Footer({ className = "" }) {
  return (
    <footer className={`border-t border-[var(--line)] bg-[var(--paper)] py-7 ${className}`}>
      <div className="mx-auto flex w-full max-w-[1464px] flex-wrap items-center justify-between gap-4 px-8 font-mono text-[11px] uppercase text-[var(--muted)]">
        <span>© 2026 CodeVed Studio · MIT License</span>
        <span className="flex flex-wrap gap-4">
          <a href="https://github.com/Aditi-Gp" target="_blank" rel="noreferrer" className="font-semibold text-[var(--ink)] underline decoration-[var(--orange)] decoration-2">GitHub ↗</a>
          <a href="https://www.linkedin.com/in/aditi-gupta-56429322a/" target="_blank" rel="noreferrer" className="font-semibold text-[var(--ink)] underline decoration-[var(--orange)] decoration-2">LinkedIn ↗</a>
          <span>Open source under MIT</span>
        </span>
      </div>
    </footer>
  );
}
