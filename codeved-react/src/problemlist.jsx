import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const problems = [
  { id: "two-sum", name: "Two Sum", difficulty: "Easy", statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target." },
  { id: "lru-cache", name: "LRU Cache", difficulty: "Medium", statement: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class." },
  { id: "trapping-rain", name: "Trapping Rain Water", difficulty: "Hard", statement: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining." },
  { id: "missing-data", name: "Ghost Problem", difficulty: null, statement: null },
  { id: "long-statement", name: "Long Description Example", difficulty: "Medium", statement: "This is a very long statement intended to test the truncation logic. It should precisely cut off at exactly one hundred characters and append the ellipsis at the end so it does not break the visual layout of the card structure." },
  { id: "valid-parentheses", name: "Valid Parentheses", difficulty: "Easy", statement: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.' },
];

function ProblemListApp() {
  const [view, setView] = useState("loading");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setView("data"), 800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative z-[2] flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[#f4f0e8]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1264px] items-center justify-between px-8">
          <a href="/" className="relative z-20 flex items-center gap-[9px] font-serif text-[25px] font-semibold tracking-[-1px]">
            <span className="grid h-7 w-7 -rotate-1 place-items-center border-[1.5px] border-[var(--ink)] font-mono text-[11px] font-medium">&lt;/&gt;</span>
            CodeVed
          </a>
          <nav className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-[72px] flex-col gap-5 border-b border-[var(--line)] bg-[var(--paper)] px-6 py-[22px] text-sm text-[var(--muted)] md:static md:flex md:flex-row md:gap-[30px] md:border-0 md:bg-transparent md:p-0`}>
            <a href="#" className="font-semibold text-[var(--ink)]">Problems</a>
            <a href="/compiler.html">Compiler</a>
            <a href="#">Learn</a>
            <a href="#">Mentors</a>
          </nav>
          <div className="hidden items-center gap-[18px] md:flex">
            <a href="/login&register.html" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">Sign in</a>
            <a href="/dashboard.html" className="bg-[var(--ink)] px-[17px] py-3 text-[13px] font-semibold text-[var(--paper)] shadow-[4px_4px_0_var(--orange)]">Dashboard ↗</a>
          </div>
          <button className="relative z-20 text-2xl md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="menu">☰</button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1264px] flex-1 px-8 pb-[100px] pt-[60px]">
        <div className="mb-[60px]">
          <h1 className="mb-3 font-serif text-[clamp(42px,5vw,64px)] font-medium leading-none tracking-[-.04em]">The Curriculum</h1>
          <p className="max-w-[600px] font-mono text-base text-[var(--muted)]">Browse the problem set. No sorting, no noise. Just pick a challenge and start thinking.</p>
        </div>
        {view === "loading" && <StatusState><div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--line)] border-t-[var(--orange)]" /><div className="font-mono text-sm font-semibold uppercase tracking-[.05em] text-[var(--muted)]">Loading problems...</div></StatusState>}
        {view === "error" && <StatusState className="border-[var(--red)] shadow-[8px_8px_0_rgba(217,79,43,.15)]"><div className="mb-4 text-[32px]">🔌</div><div className="mb-6 font-sans text-base font-semibold text-[var(--red)]">API Error: Failed to load problems. Please try again.</div><button onClick={() => setView("loading")} className="border border-[var(--ink)] bg-[var(--white)] px-3.5 py-2 font-sans text-xs font-semibold shadow-[3px_3px_0_var(--acid)] hover:translate-x-0.5 hover:translate-y-0.5">↻ Retry</button></StatusState>}
        {view === "empty" && <StatusState><div className="mb-4 text-[32px] opacity-50">📭</div><div className="font-mono text-base text-[var(--muted)]">No problems found.</div></StatusState>}
        {view === "data" && <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-8 max-[800px]:grid-cols-1">{problems.map((problem) => <ProblemCard key={problem.id} problem={problem} />)}</div>}
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--paper)] py-7">
        <div className="mx-auto flex w-full max-w-[1264px] flex-wrap justify-between gap-4 px-8 font-mono text-[11px] uppercase text-[var(--muted)]">
          <span>© 2024 CodeVed Studio / built for the long game</span>
          <span>NO ADS · NO PUBLIC SHAMING · JUST PRACTICE</span>
        </div>
      </footer>
    </div>
  );
}

function StatusState({ className = "", children }) {
  return <section className={`text-center border border-[var(--ink)] bg-[var(--white)] px-5 py-20 shadow-[8px_8px_0_rgba(24,23,20,.08)] ${className}`}>{children}</section>;
}

function ProblemCard({ problem }) {
  const difficulty = getDifficulty(problem.difficulty);
  const description = problem.statement?.trim() ? `${problem.statement.slice(0, 100)}${problem.statement.length > 100 ? "..." : ""}` : "No description";
  return (
    <article className="relative flex flex-col border border-[var(--ink)] bg-[var(--white)] p-7 shadow-[6px_6px_0_rgba(24,23,20,.06)] transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_var(--orange)]">
      <div className="mb-4 flex items-start justify-between"><span className={`border border-[var(--ink)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[.05em] ${difficulty.className}`}>{difficulty.label}</span></div>
      <h2 className="mb-3 font-sans text-[22px] font-semibold leading-tight">{problem.name || "Untitled Problem"}</h2>
      <p className={`mb-8 flex-1 font-mono text-sm leading-[1.6] text-[var(--muted)] ${problem.statement ? "" : "italic opacity-70"}`}>{description}</p>
      <div className="flex justify-end border-t border-[var(--line)] pt-5"><a href={`/problems/${problem.id || "#"}`} className="font-mono text-[13px] font-semibold uppercase hover:text-[var(--orange)]">View &amp; Solve ↗</a></div>
    </article>
  );
}

function getDifficulty(difficulty) {
  const normalized = (difficulty || "").toLowerCase();
  if (normalized === "easy") return { label: "Easy", className: "bg-[var(--acid)]" };
  if (normalized === "medium") return { label: "Medium", className: "bg-[var(--orange)] text-[var(--white)]" };
  if (normalized === "hard") return { label: "Hard", className: "bg-[var(--red)] text-[var(--white)]" };
  return { label: difficulty || "Unspecified", className: "border-[var(--muted)] bg-[var(--line)] text-[var(--muted)]" };
}

createRoot(document.getElementById("root")).render(<ProblemListApp />);
