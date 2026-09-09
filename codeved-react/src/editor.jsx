import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { explainCode, runCode as executeCode } from "./api.js";
import { handleCodeKeyDown } from "./editorUtils.js";

const templates = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Ready to compile. Change the world!" << endl;\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Ready to compile. Change the world!");\n    }\n}`,
  python: `def main():\n    print("Ready to compile. Change the world!")\n\nif __name__ == "__main__":\n    main()`,
};

function EditorApp() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(templates.cpp);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [duration, setDuration] = useState("");
  const [running, setRunning] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const resetOutput = () => {
    setOutput("");
    setError("");
    setDuration("");
    setAiMessage("");
  };

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setCode(templates[nextLanguage]);
    resetOutput();
  };

  const syncScroll = (event) => {
    if (!previewRef.current) return;
    previewRef.current.scrollTop = event.currentTarget.scrollTop;
    previewRef.current.scrollLeft = event.currentTarget.scrollLeft;
  };

  const runCode = async () => {
    setRunning(true);
    resetOutput();
    setOutput("Compiling and running your code...");
    try {
      const response = await executeCode(language, code, input);
      setOutput(response.output || "");
      setDuration(`Time: ${response.executionTime ?? "?"}ms`);
    } catch (requestError) {
      setOutput("");
      setError(requestError.message);
    } finally {
      setRunning(false);
    }
  };

  const requestExplanation = async () => {
    setExplaining(true);
    setAiMessage("loading");
    try {
      const response = await explainCode(language, code);
      setAiMessage(response.explanation || "No explanation returned.");
    } catch (requestError) {
      setAiMessage(requestError.message);
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div data-theme={theme} style={theme === "dark" ? { "--paper": "#181714", "--paper2": "#24221e", "--ink": "#f4f0e8", "--muted": "#9e9a92", "--line": "#45413c", "--orange": "#ff7b5a", "--green": "#9bd4c0", "--white": "#1d1c1a", "--red": "#ff7b5a", "--ai-bg": "#202a25" } : undefined} className="relative z-[2] flex min-h-screen flex-col bg-[var(--paper)] text-[var(--ink)] transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto flex h-[72px] w-full max-w-[1464px] items-center justify-between px-8">
          <a href="/" className="flex items-center gap-[9px] font-serif text-[25px] font-semibold tracking-[-1px]"><span className="grid h-7 w-7 -rotate-1 place-items-center border-[1.5px] border-[var(--ink)] font-mono text-[11px]">&lt;/&gt;</span>CodeVed</a>
          <nav className="hidden gap-6 text-sm text-[var(--muted)] md:flex"><a href="/problemlist.html">Problems</a><a href="/compiler.html">Compiler</a><a href="/dashboard.html">Dashboard</a><a href="/login&register.html">Sign in</a></nav>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} title="Toggle dark/light mode" className="border border-[var(--ink)] bg-[var(--paper2)] px-3 py-2 text-base shadow-[3px_3px_0_var(--orange)]">{theme === "light" ? "🌙" : "☀️"}</button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1464px] flex-1 px-8 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-4">
            <label className="relative"><span className="sr-only">Programming language</span><select value={language} onChange={(event) => changeLanguage(event.target.value)} className="appearance-none border border-[var(--ink)] bg-[var(--paper)] px-4 py-2 pr-8 text-[13px] font-semibold text-[var(--ink)] shadow-[2px_2px_0_var(--line)] outline-none focus:border-[var(--orange)]"><option value="cpp">C++ (GCC)</option><option value="java">Java (JDK 21)</option><option value="python">Python (3.11)</option></select><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px]">▼</span></label>
            <button onClick={requestExplanation} disabled={explaining} className="border border-[var(--ink)] bg-[var(--white)] px-4 py-2 font-sans text-[13px] font-semibold shadow-[3px_3px_0_var(--orange)] disabled:opacity-60">{explaining ? "Analyzing..." : "✨ Explain Code"}</button>
          </div>
          <button onClick={runCode} disabled={running} className="border border-[var(--ink)] bg-[var(--acid)] px-4 py-2 font-sans text-[13px] font-semibold shadow-[3px_3px_0_var(--ink)] disabled:cursor-not-allowed disabled:opacity-60">{running ? "Running..." : "▸ RUN CODE"}</button>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Pane title="workspace.src" suffix="EDITOR" className="bg-[var(--white)]">
            <div className="relative h-[390px] min-h-[350px] overflow-hidden font-mono text-sm leading-[1.6]">
              <pre ref={previewRef} aria-hidden="true" className="pointer-events-none absolute inset-0 m-0 overflow-auto whitespace-pre bg-[var(--white)] p-5 text-[var(--ink)]">{highlightCode(code, language)}</pre>
              <textarea ref={textareaRef} value={code} onChange={(event) => setCode(event.target.value)} onScroll={syncScroll} onKeyDown={(event) => handleCodeKeyDown(event, code, setCode)} spellCheck="false" autoCapitalize="off" autoComplete="off" className="absolute inset-0 z-[1] h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-5 font-mono text-sm leading-[1.6] text-transparent caret-[var(--ink)] outline-none selection:bg-[rgba(217,255,90,.35)]" />
            </div>
          </Pane>

          <div className="grid gap-6">
            <Pane title="STDIN (Optional)"><textarea value={input} onChange={(event) => setInput(event.target.value)} spellCheck="false" placeholder="Enter program inputs here..." className="min-h-[100px] w-full resize-y border-0 bg-[var(--white)] p-4 font-mono text-sm leading-[1.6] text-[var(--ink)] outline-none" /></Pane>
            <Pane title="STDOUT / VERDICT" className="min-h-[190px]"><div className="flex flex-col"><div className={`whitespace-pre-wrap p-4 font-mono text-sm leading-[1.6] ${output ? "text-[var(--ink)]" : "italic text-[var(--muted)]"}`}>{output || "Output will appear here..."}</div>{error && <div className="whitespace-pre-wrap border-l-4 border-t border-[var(--red)] bg-[#ffebe6] p-4 font-mono text-[13px] text-[var(--red)]">{error}</div>}{duration && <div className="flex justify-between border-t border-[var(--line)] bg-[var(--paper)] px-4 py-2 font-mono text-[11px] text-[var(--muted)]"><span>Status: Success</span><span>{duration}</span></div>}</div></Pane>
            {aiMessage && <Pane title="CodeVed AI // Explanation" className="border-[var(--green)] bg-[#f0f7f4] shadow-[8px_8px_0_var(--green)]"><div className="whitespace-pre-wrap p-4 text-sm leading-[1.7]">{aiMessage === "loading" ? <span className="italic text-[var(--muted)]">CodeVed AI is reading your code...</span> : aiMessage}</div></Pane>}
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--paper)] py-7"><div className="mx-auto flex w-full max-w-[1464px] flex-wrap justify-between gap-4 px-8 font-mono text-[11px] uppercase text-[var(--muted)]"><span>CodeVed Editor v1.0</span><span>Developed by <a href="https://github.com/Aditi-Gp" target="_blank" rel="noreferrer" className="font-semibold text-[var(--ink)] underline decoration-[var(--orange)] decoration-2">Aditi Gupta</a> · <a href="https://www.linkedin.com/in/aditi-gupta-56429322a/" target="_blank" rel="noreferrer" className="font-semibold text-[var(--ink)] underline decoration-[var(--orange)] decoration-2">LinkedIn</a></span></div></footer>
    </div>
  );
}

function Pane({ title, suffix, className = "", children }) {
  return <section className={`flex flex-col border border-[var(--ink)] bg-[var(--paper2)] shadow-[8px_8px_0_rgba(24,23,20,.08)] ${className}`}><div className="flex h-[42px] shrink-0 items-center justify-between border-b border-[var(--ink)] bg-[var(--paper)] px-4 font-mono text-[11px] font-semibold uppercase"><span>{title}</span>{suffix && <span className="text-[var(--orange)]">{suffix}</span>}</div><div className="flex flex-col">{children}</div></section>;
}

function highlightCode(code, language) {
  const keywordPattern = language === "python" ? /\b(def|return|if|else|in|class|import|from|for|as)\b/ : /\b(class|public|private|static|void|int|return|new|using|namespace|include)\b/;
  return code.split("\n").map((line, index) => <React.Fragment key={index}>{line.split(keywordPattern).map((part, partIndex) => partIndex % 2 === 1 ? <span key={partIndex} className="text-[var(--red)]">{part}</span> : <span key={partIndex}>{part}</span>)}{index < code.split("\n").length - 1 ? "\n" : ""}</React.Fragment>);
}

createRoot(document.getElementById("root")).render(<EditorApp />);
