import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const templates = {
  cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        \n    }\n};`,
  java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        \n    }\n}`,
  python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Your code here\n        pass`,
};

const testCases = [
  { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]" },
  { input: "nums = [3,2,4], target = 6", expected: "[1,2]" },
];

function ProblemDetailsApp() {
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(templates.cpp);
  const [verdict, setVerdict] = useState(null);
  const [running, setRunning] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [leftWidth, setLeftWidth] = useState(45);
  const [resizing, setResizing] = useState(false);
  const timerRefs = useRef([]);
  const leftPaneRef = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => setLoading(false), 400);
    return () => {
      window.clearTimeout(loadTimer);
      timerRefs.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (!resizing) return undefined;

    const handlePointerMove = (event) => {
      const workspace = workspaceRef.current;
      if (!workspace) return;
      const bounds = workspace.getBoundingClientRect();
      const minimumWidth = 300;
      const maximumWidth = bounds.width * 0.7;
      const nextWidth = Math.min(Math.max(event.clientX - bounds.left, minimumWidth), maximumWidth);
      setLeftWidth((nextWidth / bounds.width) * 100);
    };
    const stopResizing = () => setResizing(false);

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizing]);

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setCode(templates[nextLanguage]);
    setVerdict(null);
  };

  const handleEditorKeyDown = (event) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const start = event.currentTarget.selectionStart;
    const end = event.currentTarget.selectionEnd;
    const nextCode = `${code.slice(0, start)}    ${code.slice(end)}`;
    setCode(nextCode);
    window.requestAnimationFrame(() => {
      event.currentTarget.selectionStart = start + 4;
      event.currentTarget.selectionEnd = start + 4;
    });
  };

  const executeCode = (action) => {
    setRunning(true);
    setVerdict({ type: "running", title: "Pending execution..." });
    const timer = window.setTimeout(() => {
      setRunning(false);
      if (!code.trim()) {
        setVerdict({ type: "fail", title: "Error: Code cannot be empty or whitespace only." });
        return;
      }
      if (code.includes("401")) {
        setVerdict({ type: "fail", title: "Error: Authentication is required." });
        return;
      }
      if (code.includes("429")) {
        setVerdict({ type: "fail", title: "Error: Rate limit exceeded. Please try again in 30 seconds." });
        return;
      }
      const passed = !code.includes("fail");
      setVerdict({ type: passed ? "success" : "fail", title: passed ? (action === "run" ? "✓ Output Match" : "✓ Accepted") : "✗ Wrong Answer", passed });
    }, 1200);
    timerRefs.current.push(timer);
  };

  const explainCode = () => {
    setExplaining(true);
    setAiMessage("");
    const timer = window.setTimeout(() => {
      setExplaining(false);
      setAiMessage(code.includes("error") ? "error" : "success");
      window.requestAnimationFrame(() => {
        if (leftPaneRef.current) leftPaneRef.current.scrollTop = leftPaneRef.current.scrollHeight;
      });
    }, 2000);
    timerRefs.current.push(timer);
  };

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
      <header className="relative z-50 shrink-0 border-b border-[var(--line)] bg-[#f4f0e8]/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <a href="/" className="flex items-center gap-[9px] font-serif text-[22px] font-semibold tracking-[-1px]">
            <span className="grid h-6 w-6 -rotate-1 place-items-center border-[1.5px] border-[var(--ink)] font-mono text-[11px]">&lt;/&gt;</span>
            CodeVed
          </a>
          <nav className="hidden gap-[30px] text-sm text-[var(--muted)] md:flex"><a href="/problemlist.html" className="font-semibold text-[var(--ink)]">Problems</a><a href="/compiler.html">Compiler</a><a href="#">Learn</a></nav>
          <div className="hidden items-center gap-[18px] sm:flex"><a href="/login&register.html" className="text-sm text-[var(--muted)]">Sign in</a><a href="/dashboard.html" className="border border-[var(--ink)] bg-[var(--white)] px-4 py-2 font-sans text-[13px] font-semibold shadow-[2px_2px_0_var(--ink)]">Dashboard ↗</a></div>
        </div>
      </header>

      <main ref={workspaceRef} className="relative z-[2] flex flex-1 flex-col gap-4 overflow-auto p-4 lg:flex-row lg:overflow-hidden">
        {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--paper)] font-mono text-lg font-semibold text-[var(--muted)]">Loading Problem...</div>}
        <section ref={leftPaneRef} style={{ "--left-pane-width": `${leftWidth}%` }} className="flex min-h-[520px] flex-none flex-col overflow-auto border border-[var(--ink)] bg-[var(--white)] pb-6 shadow-[6px_6px_0_rgba(24,23,20,.08)] lg:w-[var(--left-pane-width)] lg:overflow-auto">
          <div className="sticky top-0 z-[2] border-b border-[var(--line)] bg-[var(--paper2)] px-6 py-5"><h1 className="mb-2 font-serif text-[28px] font-medium leading-tight tracking-[-.02em]">1. Two Sum</h1><span className="inline-block border border-[var(--ink)] bg-[var(--acid)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[.05em]">Easy</span></div>
          <div className="p-6 text-[15px] leading-[1.7]"><p className="mb-4">Given an array of integers <code className="border border-[var(--line)] bg-[var(--paper2)] px-1.5 py-0.5 font-mono text-[13px]">nums</code> and an integer <code className="border border-[var(--line)] bg-[var(--paper2)] px-1.5 py-0.5 font-mono text-[13px]">target</code>, return indices of the two numbers such that they add up to <code className="border border-[var(--line)] bg-[var(--paper2)] px-1.5 py-0.5 font-mono text-[13px]">target</code>.</p><p className="mb-4">You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice. You can return the answer in any order.</p><h2 className="mb-4 mt-8 text-lg font-semibold">Examples</h2><CodeBlock> <strong>Input:</strong> nums = [2,7,11,15], target = 9{`\n`}<strong>Output:</strong> [0,1]{`\n`}<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</CodeBlock><CodeBlock><strong>Input:</strong> nums = [3,2,4], target = 6{`\n`}<strong>Output:</strong> [1,2]</CodeBlock><h2 className="mb-4 mt-8 text-lg font-semibold">Constraints</h2><ul className="mb-4 list-disc space-y-2 pl-6 font-mono text-[13px] text-[var(--muted)]"><li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li><li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li><li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li><li><strong>Only one valid answer exists.</strong></li></ul></div>
          {aiMessage && <div className="mt-auto border-y border-[var(--green)] bg-[#f0f7f4]"><div className="bg-[var(--green)] px-4 py-2.5 font-mono text-[11px] font-semibold uppercase text-[var(--white)]">✨ CodeVed AI // Explanation</div><div className="p-5 text-sm leading-[1.6]">{aiMessage === "error" ? <span className="font-mono font-semibold text-[var(--red)]">❌ Error: The AI engine failed to analyze this code block.</span> : <><strong>AI Analysis:</strong><br /><br />This snippet represents the structural foundation for solving the Two Sum problem. To solve this efficiently in O(n) time, consider utilizing a Hash Map (Dictionary) to store the values you've previously seen along with their respective indices.</>}</div></div>}
        </section>
        <button type="button" aria-label="Resize problem description pane" onPointerDown={() => setResizing(true)} className={`group hidden w-2 shrink-0 cursor-col-resize items-center justify-center lg:flex ${resizing ? "bg-[var(--orange)]" : "bg-transparent hover:bg-[var(--line)]"}`}>
          <span className="h-12 w-0.5 bg-[var(--line)] transition group-hover:bg-[var(--ink)]" />
        </button>

        <section className="flex min-h-[600px] min-w-0 flex-1 flex-col overflow-hidden border border-[var(--ink)] bg-[#1d1c1a] shadow-[6px_6px_0_rgba(24,23,20,.08)]">
          <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-[#45413c] bg-[#181714] px-4"><label className="relative"><span className="sr-only">Language</span><select value={language} onChange={(event) => changeLanguage(event.target.value)} className="appearance-none border border-[#45413c] bg-[#2a2824] px-3 py-1.5 pr-7 font-sans text-xs font-semibold text-[#e9e4d8] outline-none focus:border-[var(--orange)]"><option value="cpp">C++</option><option value="java">Java</option><option value="python">Python</option></select><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#e9e4d8]">▼</span></label><button onClick={explainCode} disabled={explaining} className="border border-[var(--ink)] bg-[var(--white)] px-3 py-1.5 font-sans text-[11px] font-semibold text-[var(--ink)] shadow-[3px_3px_0_var(--orange)] disabled:opacity-60">{explaining ? "Generating..." : "✨ Explain Code"}</button></div>
          <textarea value={code} onChange={(event) => setCode(event.target.value)} onKeyDown={handleEditorKeyDown} spellCheck="false" placeholder="Write your solution here..." className="min-h-[320px] flex-1 resize-none border-0 bg-[#1d1c1a] p-5 font-mono text-sm leading-[1.7] text-[#e9e4d8] outline-none selection:bg-[rgba(217,255,90,.2)]" />
          {verdict && <Verdict verdict={verdict} onClose={() => setVerdict(null)} />}
          <div className="flex h-[60px] shrink-0 items-center justify-end gap-4 border-t border-[#45413c] bg-[#181714] px-5"><button onClick={() => executeCode("run")} disabled={running} className="border border-[var(--ink)] bg-[var(--acid)] px-4 py-2 font-sans text-[13px] font-semibold text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] disabled:cursor-not-allowed disabled:opacity-60">{running ? "Running..." : "▸ Run"}</button><button onClick={() => executeCode("submit")} disabled={running} className="border border-[var(--ink)] bg-[var(--green)] px-4 py-2 font-sans text-[13px] font-semibold text-[var(--white)] shadow-[3px_3px_0_var(--ink)] disabled:cursor-not-allowed disabled:opacity-60">{running ? "Submitting..." : "Submit"}</button></div>
        </section>
      </main>
    </div>
  );
}

function CodeBlock({ children }) { return <pre className="mb-4 overflow-x-auto border border-[var(--line)] border-l-4 border-l-[var(--orange)] bg-[var(--paper2)] p-4 font-mono text-[13px]">{children}</pre>; }
function Verdict({ verdict, onClose }) { const isRunning = verdict.type === "running"; return <div className="max-h-[45%] shrink-0 overflow-y-auto border-t border-[var(--ink)] bg-[var(--white)]"><div className="sticky top-0 z-[2] flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper2)] px-5 py-3 font-mono text-[13px] font-semibold"><span>Execution Result</span><button onClick={onClose} className="text-lg leading-none">×</button></div><div className="p-5"> <div className={`mb-5 flex items-center gap-3 border px-4 py-3 font-sans text-[15px] font-semibold ${isRunning ? "border-[var(--muted)] bg-[var(--paper)] text-[var(--ink)]" : verdict.type === "success" ? "border-[var(--green)] bg-[#eef7f4] text-[var(--green)]" : "border-[var(--red)] bg-[#fff2ef] text-[var(--red)]"}`}>{verdict.title}</div>{!isRunning && verdict.passed !== undefined && <div className="flex flex-col gap-4">{testCases.map((testCase, index) => <div key={testCase.input} className={`border border-[var(--line)] border-l-4 p-4 font-mono text-[13px] ${verdict.passed ? "border-l-[var(--green)] bg-[#f9fdfa]" : "border-l-[var(--red)] bg-[#fffaf9]"}`}><span className="mb-1 block text-[11px] uppercase text-[var(--muted)]">Test Case {index + 1}</span><span className="mb-1 block text-[11px] uppercase text-[var(--muted)]">Input</span><div className="mb-3 break-all border border-[var(--line)] bg-[var(--paper2)] p-2">{testCase.input}</div><div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1"><div><span className="mb-1 block text-[11px] uppercase text-[var(--muted)]">Expected Output</span><div className="border border-[var(--line)] bg-[var(--paper2)] p-2">{testCase.expected}</div></div><div><span className="mb-1 block text-[11px] uppercase text-[var(--muted)]">Actual Output</span><div className="border border-[var(--line)] bg-[var(--paper2)] p-2">{verdict.passed ? testCase.expected : index === 0 ? "[1,2]" : "[0,1]"}</div></div></div></div>)}</div>}</div></div>; }

createRoot(document.getElementById("root")).render(<ProblemDetailsApp />);
