import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { runCode as executeCode } from "./api.js";

const templates = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello CodeVed!" << endl;\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello CodeVed!");\n    }\n}`,
  python: `def main():\n    print("Hello CodeVed!")\n\nif __name__ == "__main__":\n    main()`,
};

const languages = [
  ["cpp", "C++ (GCC)"],
  ["java", "Java (JDK 21)"],
  ["python", "Python (3.11)"],
];

function CompilerApp() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(templates.cpp);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Ready");
  const [running, setRunning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const markUnsaved = () => {
    if (status !== "Ready") setStatus("Unsaved changes");
  };

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setCode(templates[nextLanguage]);
    setInput("");
    setOutput("");
    setError("");
    setStatus("Ready");
  };

  const runCode = async () => {
    setRunning(true);
    setOutput("Compiling and running your code...");
    setError("");
    setStatus("Executing");

    try {
      const response = await executeCode(language, code, input);
      setOutput(response.output || "");
      setStatus(`Executed in ${response.executionTime ?? "?"}ms`);
    } catch (requestError) {
      setOutput("");
      setError(requestError.message);
      setStatus("Runtime Error");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="relative z-[2] flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[#f4f0e8]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1464px] items-center justify-between px-8">
          <a href="/" className="relative z-20 flex items-center gap-[9px] font-serif text-[25px] font-semibold tracking-[-1px]">
            <span className="grid h-7 w-7 rotate-[-4deg] place-items-center border-[1.5px] border-[var(--ink)] font-mono text-[11px] font-medium">&lt;/&gt;</span>
            CodeVed
          </a>
          <nav className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-[72px] flex-col gap-5 border-b border-[var(--line)] bg-[var(--paper)] px-8 py-[22px] text-sm text-[var(--muted)] md:static md:flex md:flex-row md:gap-[30px] md:border-0 md:bg-transparent md:p-0`}>
            <a href="/problemlist.html">Problems</a>
            <a href="/compiler.html" className="font-semibold text-[var(--ink)]">Compiler</a>
            <a href="/">Learn</a>
            <a href="/">Mentors</a>
          </nav>
          <div className="hidden items-center gap-[18px] md:flex">
            <a href="/login&register.html" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">Sign in</a>
            <a href="/dashboard.html" className="bg-[var(--ink)] px-[17px] py-3 text-[13px] font-semibold text-[var(--paper)] shadow-[4px_4px_0_var(--orange)]">Dashboard ↗</a>
          </div>
          <button className="relative z-20 text-2xl md:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="menu">☰</button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1464px] flex-1 px-8 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="mb-2 font-serif text-[42px] font-medium leading-none tracking-[-.04em]">Sandbox Playground</h1>
            <p className="font-mono text-sm text-[var(--muted)]">A minimal environment to test logic, without the noise.</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="relative">
              <span className="sr-only">Programming language</span>
              <select value={language} onChange={(event) => changeLanguage(event.target.value)} className="cursor-pointer appearance-none border border-[var(--ink)] bg-[var(--paper)] px-4 py-2.5 pr-8 text-[13px] font-semibold text-[var(--ink)] shadow-[2px_2px_0_var(--line)] outline-none focus:border-[var(--orange)] focus:shadow-[2px_2px_0_var(--orange)]">
                {languages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px]">▼</span>
            </label>
            <button onClick={runCode} disabled={running} className="border border-[var(--ink)] bg-[var(--acid)] px-[17px] py-3 text-[13px] font-semibold text-[var(--ink)] shadow-[4px_4px_0_var(--ink)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--ink)] disabled:cursor-not-allowed disabled:opacity-60">{running ? "Running..." : "▸ RUN CODE"}</button>
          </div>
        </div>

        <div className="grid min-h-[500px] gap-6 lg:h-[65vh] lg:grid-cols-[1.4fr_1fr]">
          <Pane title="editor.src" dark note="experiment away!" className="min-h-[400px]">
            <textarea value={code} onChange={(event) => { setCode(event.target.value); markUnsaved(); }} spellCheck="false" placeholder="Write your code here..." className="h-full min-h-[400px] w-full resize-none border-0 bg-[#1d1c1a] p-5 font-mono text-sm leading-[1.7] text-[#e9e4d8] outline-none selection:bg-[rgba(217,255,90,.2)]" />
          </Pane>

          <div className="grid min-h-[400px] gap-6 lg:grid-rows-[1fr_1.5fr]">
            <Pane title="STDIN (Optional)">
              <textarea value={input} onChange={(event) => { setInput(event.target.value); markUnsaved(); }} spellCheck="false" placeholder="Provide program input here..." className="h-full min-h-[170px] w-full resize-none border-0 bg-[var(--white)] p-5 font-mono text-sm leading-[1.7] text-[var(--ink)] outline-none" />
            </Pane>
            <Pane title="STDOUT / VERDICT" className="min-h-[260px]">
              <div className="flex min-h-0 flex-1 flex-col">
                <div className={`min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap bg-[var(--white)] p-5 font-mono text-sm leading-[1.6] ${output ? "text-[var(--ink)]" : "italic text-[var(--muted)]"}`}>{output || "Output will appear here..."}</div>
                {error && <div className="whitespace-pre-wrap border-l-4 border-[var(--red)] border-t border-[var(--red)] bg-[#ffebe6] p-4 font-mono text-[13px] text-[var(--red)]">{error}</div>}
                <div className={`flex h-8 shrink-0 items-center gap-2 border-t border-[var(--line)] bg-[var(--paper)] px-4 font-mono text-[11px] ${status === "Executing" ? "text-[var(--orange)]" : status.includes("Error") || status === "Failed" ? "text-[var(--red)]" : status.startsWith("Executed") ? "text-[var(--green)]" : "text-[var(--muted)]"}`}>
                  <span className="h-2 w-2 rounded-full bg-current" />
                  <span>{status}</span>
                </div>
              </div>
            </Pane>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--paper)] py-7">
        <div className="mx-auto flex w-full max-w-[1464px] flex-wrap justify-between gap-4 px-8 font-mono text-[11px] uppercase text-[var(--muted)]">
          <span>© 2024 CodeVed Studio / built for the long game</span>
          <span>NO ADS · NO PUBLIC SHAMING · JUST PRACTICE</span>
        </div>
      </footer>
    </div>
  );
}

function Pane({ title, dark = false, note, className = "", children }) {
  return (
    <section className={`flex flex-col border border-[var(--ink)] bg-[var(--paper2)] shadow-[8px_8px_0_rgba(24,23,20,.08)] ${dark ? "bg-[#1d1c1a] shadow-[10px_10px_0_var(--orange)]" : ""} ${className}`}>
      <div className={`relative flex h-[42px] shrink-0 items-center justify-between border-b border-[var(--ink)] px-4 font-mono text-[11px] font-semibold uppercase ${dark ? "border-[#45413c] bg-[#1d1c1a] text-[var(--muted)]" : "bg-[var(--paper)]"}`}>
        <span>{title}</span>
        {note && <span className="absolute right-10 top-[-30px] rotate-1 font-hand text-base font-normal normal-case text-[var(--orange)] max-[960px]:hidden">{note}</span>}
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

createRoot(document.getElementById("root")).render(<CompilerApp />);
