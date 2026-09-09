import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { runCode } from "./api.js";

const snippets = {
  py: [
    ["01", <span className="text-[#77736c] italic"># find it once. remember it.</span>],
    ["02", <><span className="text-[#ff9d7a]">def </span>{" "}<span className="text-[#d9ff5a]">two_sum</span>(nums, target):</>],
    ["03", <>{"  "}seen = {"{}"}</>],
    ["04", <>{"  "}<span className="text-[#ff9d7a]">for</span> i, n <span className="text-[#ff9d7a]">in</span>{" "}<span className="text-[#d9ff5a]">enumerate</span>(nums):</>],
    ["05", <>{"    "}<span className="text-[#ff9d7a]">if</span> target - n <span className="text-[#ff9d7a]">in</span> seen:</>],
    ["06", <>{"      "}<span className="text-[#ff9d7a]">return</span> [seen[target - n], i]</>],
    ["07", <>{"    "}seen[n] = i</>],
  ],
  cpp: [
    ["01", <span className="text-[#77736c] italic">// remember what the loop has seen</span>],
    ["02", <>vector&lt;<span className="text-[#ff9d7a]">int</span>&gt; <span className="text-[#d9ff5a]">twoSum</span>(vector&lt;<span className="text-[#ff9d7a]">int</span>&gt;&amp; nums, int target) {"{"}</>],
    ["03", <>{"  "}unordered_map&lt;int,int&gt; seen;</>],
    ["04", <>{"  "}<span className="text-[#ff9d7a]">for</span> (int i = <span className="text-[#e9be73]">0</span>; i &lt; nums.size(); i++) {"{"}</>],
    ["05", <>{"    "}<span className="text-[#ff9d7a]">if</span> (seen.count(target - nums[i]))</>],
    ["06", <>{"      "}<span className="text-[#ff9d7a]">return</span> {"{"}seen[target - nums[i]], i{"}"}</>],
    ["07", <>{"    "}seen[nums[i]] = i;</>],
  ],
  js: [
    ["01", <span className="text-[#77736c] italic">// keep the useful past nearby</span>],
    ["02", <><span className="text-[#ff9d7a]">function</span> <span className="text-[#d9ff5a]">twoSum</span>(nums, target) {"{"}</>],
    ["03", <>{"  "}<span className="text-[#ff9d7a]">const</span> seen = <span className="text-[#ff9d7a]">new</span> Map();</>],
    ["04", <>{"  "}<span className="text-[#ff9d7a]">for</span> (<span className="text-[#ff9d7a]">let</span> i = <span className="text-[#e9be73]">0</span>; i &lt; nums.length; i++) {"{"}</>],
    ["05", <>{"    "}<span className="text-[#ff9d7a]">if</span> (seen.has(target - nums[i]))</>],
    ["06", <>{"      "}<span className="text-[#ff9d7a]">return</span> [seen.get(target - nums[i]), i];</>],
    ["07", <>{"    "}seen.set(nums[i], i);</>],
  ],
};

const languages = ["Python","C++","java21","JavaScript","Rust","Go","Kotlin","TypeScript","Swift","Ruby","Scala","PHP","C#","Haskell","Elixir"];

const runnableSnippets = {
  py: 'print("CodeVed is ready")',
  cpp: '#include <iostream>\nint main() { std::cout << "CodeVed is ready"; return 0; }',
  js: 'console.log("CodeVed is ready")',
};

function App() {
  const [lang, setLang] = useState("py");
  const [running, setRunning] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setAccepted(false);
    setRunning(false);
  }, [lang]);

  const run = async () => {
    setRunning(true);
    setAccepted(false);
    try {
      await runCode(lang === "py" ? "python" : lang === "cpp" ? "cpp" : "javascript", runnableSnippets[lang]);
      setAccepted(true);
    } catch {
      setAccepted(false);
    } finally {
      setRunning(false);
    }
  };

  const currentSnippet = snippets[lang];

  return (
    <div className="relative z-[2] min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[#f4f0e8]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-8">
          <div className="relative z-20 flex items-center gap-[9px] font-serif text-[25px] font-semibold tracking-[-1px]">
            <span className="grid h-7 w-7 rotate-[-4deg] place-items-center border-[1.5px] border-[var(--ink)] font-mono text-[11px] font-medium">&lt;/&gt;</span>
            CodeVed
          </div>
          <nav className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-[72px] flex-col gap-5 border-b border-[var(--line)] bg-[var(--paper)] px-6 py-[22px] text-sm text-[var(--muted)] md:static md:flex md:flex-row md:gap-[30px] md:border-0 md:bg-transparent md:p-0`}>
            <a href="/problemlist.html">Problems</a>
            <a href="#compiler">Compiler</a>
            <a href="#curriculum">Learn</a>
            <a href="#mentors">Mentors</a>
          </nav>
          <div className="hidden items-center gap-[18px] md:flex">
            <a href="/login&register.html" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">Sign in</a>
            <a href="/compiler.html" className="bg-[var(--ink)] px-[17px] py-3 text-[13px] font-semibold text-[var(--paper)] shadow-[4px_4px_0_var(--orange)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--orange)]">Start coding ↗</a>
          </div>
          <button className="relative z-20 text-2xl md:hidden" onClick={() => setMenuOpen(v => !v)} aria-label="menu">☰</button>
        </div>
      </header>

      <main>
        <section id="compiler" className="relative overflow-hidden py-[60px] md:py-[100px]">
          <div className="mx-auto grid max-w-[1200px] items-center gap-[50px] px-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-[38px]">
            <div>
              <div className="mb-6 flex items-center gap-2.5">
                <i className="block h-2 w-2 rounded-full bg-[var(--green)]" />
                <span className="font-mono text-[11px] font-medium uppercase tracking-[.06em] text-[var(--muted)]">a quieter place to get good at code</span>
              </div>
              <h1 className="max-w-[720px] font-serif text-[58px] font-medium leading-[.91] tracking-[-.065em] md:text-[8vw] lg:text-[105px]">
                Get <em>fluent.</em><br />
                <span className="relative inline-block text-[var(--muted)]">
                  Not just ranked.
                  <span className="absolute left-[-3%] top-[53%] h-[3px] w-[106%] -rotate-2 bg-[var(--orange)]" />
                </span>
              </h1>
              <div className="relative">
                <p className="mt-6 max-w-[500px] text-[18px] leading-[1.6] text-[var(--muted)]">
                  A thinking environment for people who want to experiment, get stuck, discover patterns, and eventually stop translating ideas into syntax.
                </p>
                <div className="mt-6 ml-[10%] inline-block -rotate-1 font-hand text-[18px] text-[var(--orange)]">you can take your time here.</div>
              </div>
              <div className="mt-[34px] flex items-center gap-[22px]">
                <a href="/compiler.html" className="inline-block bg-[var(--ink)] px-[17px] py-3 text-[13px] font-semibold text-[var(--paper)] shadow-[4px_4px_0_var(--orange)]">Start coding free ↗</a>
                <a className="border-b border-[var(--ink)] pb-[3px] font-mono text-[13px] font-medium" href="#curriculum">SEE HOW LEARNING WORKS ↓</a>
              </div>
            </div>

            <Compiler lang={lang} setLang={setLang} run={run} running={running} accepted={accepted} currentSnippet={currentSnippet} />
          </div>
        </section>

        <section className="border-t border-[var(--line)] py-[100px] pb-[60px]">
          <div className="mx-auto max-w-[1200px] px-8">
            <div className="max-w-[1000px] font-serif text-[42px] font-medium leading-[.98] tracking-[-.055em] md:text-[7vw] lg:text-[96px]">
              <span className="relative inline-block text-[#9c978e]">
                Ranked. Watched. Judged.
                <svg className="absolute left-[-5%] top-1/2 h-[30px] w-[110%] -translate-y-1/2" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,10 Q25,5 50,12 T100,8" fill="none" stroke="var(--orange)" strokeLinecap="round" strokeWidth="4" />
                </svg>
              </span><br />
              Here, you just get <em className="text-[var(--green)]">fluent.</em>
            </div>
            <div className="mt-[60px] flex flex-col gap-6 md:flex-row md:flex-wrap">
              {[
                ["×","NO PUBLIC FAILURES"],["💡","HINTS BEFORE HUMILIATION"],["≠","PROGRESS IS NOT A NUMBER"]
              ].map(([icon,text]) => (
                <div key={text} className="flex items-center gap-2.5 rounded-full border-2 border-[var(--ink)] bg-[var(--paper)] px-7 py-3.5 font-mono text-[13px] font-semibold shadow-[4px_4px_0_var(--acid)] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--orange)]">
                  <span className="text-lg">{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="curriculum" className="border-b border-[var(--line)] py-[60px] pb-[120px]">
          <div className="mx-auto max-w-[900px] px-8">
            <div className="mb-20 text-center">
              <span className="font-mono text-xs font-medium uppercase tracking-[.1em] text-[var(--muted)]">02 // The Curriculum</span>
              <h2 className="my-4 font-serif text-5xl font-medium tracking-[-.03em]">A path, not a pile.</h2>
              <p className="mx-auto max-w-[680px] text-xl leading-[1.6]">
                Progress isn't a straight line. It's learning, <span className="mx-1 inline-block rotate-[-3deg] border border-[var(--ink)] bg-[var(--acid)] px-2 py-0.5 font-mono text-lg font-semibold">getting stuck</span>, reviewing foundations, and pushing forward.<br />
                <em className="mt-6 block font-serif text-2xl text-[var(--muted)]">Follow a conceptual map crafted by senior engineers.</em>
              </p>
            </div>
            <div className="relative pl-[50px]">
              <div className="absolute left-[61px] top-3 bottom-3 w-0.5 bg-[var(--line)]" />
              <div className="flex flex-col gap-12">
                {[
                  ["done","Memory & Pointers","Completed · 4 exercises"],
                  ["done","Data Structures I","Completed · Arrays, Strings, Hash Maps"],
                  ["active","Algorithmic Thinking","Current Focus · Sliding Window"],
                  ["","Data Structures II","Locked · Trees, Graphs"]
                ].map(([state,title,desc]) => (
                  <div key={title} className="relative z-[2] flex items-start gap-8">
                    <div className={`h-6 w-6 shrink-0 rounded-full border-2 ${state === "done" ? "border-[var(--green)] bg-[var(--green)] after:content-['✓'] after:relative after:left-[5px] after:top-[-2px] after:font-mono after:text-xs after:text-[var(--white)]" : state === "active" ? "border-[var(--ink)] bg-[var(--acid)] shadow-[2px_2px_0_var(--orange)]" : "border-[var(--line)] bg-[var(--paper)]"}`} />
                    <div>
                      <h3 className="mb-1.5 text-xl font-semibold leading-tight">{title}</h3>
                      <div className={`font-mono text-[13px] ${state === "active" ? "font-medium text-[var(--orange)]" : "text-[var(--muted)]"}`}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="mentors" className="bg-[var(--ink)] py-[120px] text-[#f3eee5]">
          <div className="mx-auto grid max-w-[1200px] items-center gap-[50px] px-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-[100px]">
            <div>
              <div className="mb-[22px] font-mono text-[11px] uppercase text-[#aaa49a]">03 / A HUMAN NOTICED YOUR THINKING</div>
              <h2 className="font-serif text-5xl font-medium leading-none tracking-[-.05em] md:text-[58px]">Stuck is not<br />a dead end.</h2>
              <p className="mt-[22px] text-[17px] leading-[1.65] text-[#aaa49a]">When you need help, get feedback that responds to the code you actually wrote—not a generic answer waiting to be copied.</p>
              <div className="mt-[34px] font-mono text-xs leading-[2.2] text-[#c9c1b6]">
                <div>→ context-aware line reviews</div>
                <div>→ hints that preserve the discovery</div>
                <div>→ real people, real conversations</div>
              </div>
            </div>
            <ReviewInterface />
          </div>
        </section>

        <section className="overflow-hidden bg-[var(--ink)] py-[120px] text-[var(--paper)]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-10 px-8 lg:flex-row">
            <h3 className="max-w-[400px] font-serif text-5xl font-medium text-[var(--white)]">One judge.<br /><em className="text-[var(--acid)]">Many ways to think.</em></h3>
            <div className="flex flex-wrap gap-8">
              {[["38","LANGUAGES"],["99.9%","UPTIME"],["<400ms","MEDIAN"]].map(([n,l]) => (
                <div key={l} className="flex flex-col gap-1.5">
                  <b className="font-mono text-4xl leading-none text-[var(--orange)]">{n}</b>
                  <span className="font-mono text-[11px] uppercase tracking-[.05em] text-[#9e9a92]">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-20 flex overflow-hidden whitespace-nowrap [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="marquee flex shrink-0 gap-6 pl-6">
              {[...languages,...languages].map((x,i) => <span key={i} className={`cursor-default rounded-full border border-[#3e3a34] bg-[#1d1c1a] px-6 py-3 font-serif text-2xl text-[#9e9a92] transition hover:-translate-y-0.5 hover:border-[var(--acid)] hover:bg-[var(--acid)] hover:text-[var(--ink)] ${i % 2 ? "font-mono text-lg" : ""}`}>{x}</span>)}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--paper2)] py-20 pb-10">
        <div className="mx-auto max-w-[1200px] px-8">
          <div className="mb-[60px] grid gap-[60px] lg:grid-cols-[1fr_1.5fr] lg:gap-20">
            <div>
              <h2 className="mb-3 font-serif text-[42px] font-medium leading-tight tracking-[-.03em]">One keystroke away.</h2>
              <p className="mb-8 text-lg text-[var(--muted)]">Begin your session.</p>
              <button className="bg-[var(--ink)] px-[17px] py-3 text-[13px] font-semibold text-[var(--paper)] shadow-[4px_4px_0_var(--orange)]">Start coding free ↗</button>
            </div>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                ["Product","Compiler","Curriculum","Mentorship","Pricing"],
                ["Philosophy","The Manifesto","Learning vs Ranking","Engineering Blog"],
                ["Legal","Privacy Policy","Terms of Service"]
              ].map(([heading,...links]) => (
                <div key={heading}>
                  <h4 className="mb-6 font-mono text-xs font-semibold uppercase tracking-[.05em]">{heading}</h4>
                  {links.map(x => <a href="/" key={x} className="mb-4 block text-[15px] text-[var(--muted)] hover:text-[var(--orange)]">{x}</a>)}
                </div>
              ))}
              <div>
                <h4 className="mb-6 font-mono text-xs font-semibold uppercase tracking-[.05em]">Connect</h4>
                <a href="https://github.com/Aditi-Gp" target="_blank" rel="noreferrer" className="mb-3 flex items-center justify-between border-2 border-[var(--ink)] bg-[var(--acid)] px-3 py-2.5 font-mono text-sm font-semibold text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--orange)] hover:text-[var(--white)] hover:shadow-[5px_5px_0_var(--ink)]">GitHub <span>↗</span></a>
                <a href="https://www.linkedin.com/in/aditi-gupta-56429322a/" target="_blank" rel="noreferrer" className="flex items-center justify-between border-2 border-[var(--ink)] bg-[var(--white)] px-3 py-2.5 font-mono text-sm font-semibold text-[var(--ink)] shadow-[3px_3px_0_var(--orange)] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--orange)] hover:text-[var(--white)] hover:shadow-[5px_5px_0_var(--ink)]">LinkedIn <span>↗</span></a>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-4 border-t border-[var(--line)] pt-[30px] font-mono text-xs text-[var(--muted)]">
            <span>© 2026 CodeVed Studio. All rights reserved.</span>
            <span>Designed for thinkers. Developed by Aditi Gupta.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Compiler({lang,setLang,run,running,accepted,currentSnippet}) {
  return (
    <div className="relative mt-5">
      <div className="absolute bottom-[-26px] right-[-30px] z-0 h-[64%] w-[72%] bg-[var(--acid)]" />
      <div className="relative z-[1] rotate-[.5deg] overflow-hidden border border-[#0c0c0b] bg-[#1d1c1a] text-[#e9e4d8] shadow-[12px_14px_0_rgba(24,23,20,.12)] lg:transform">
        <div className="flex h-[54px] items-center justify-between border-b border-[#45413c] px-3.5">
          <div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-[#5b5750]" /><span className="h-2 w-2 rounded-full bg-[#5b5750]" /><span className="h-2 w-2 rounded-full bg-[#5b5750]" /></div>
          <div className="flex h-full items-end font-mono text-[11px]">
            {["py","cpp","js"].map(x => (
              <button key={x} onClick={() => setLang(x)} className={`px-2.5 pb-4 ${lang===x ? "border-b-2 border-[var(--acid)] text-[var(--acid)]" : "text-[#9e9a92]"}`}>
                {x==="py" ? "two_sum.py" : x==="cpp" ? "two_sum.cpp" : "two_sum.js"}
              </button>
            ))}
          </div>
          <button disabled={running} onClick={run} className="flex items-center border border-[var(--acid)] px-2.5 py-1.5 font-mono text-[11px] text-[var(--acid)] disabled:opacity-50">▸ RUN</button>
        </div>
        <div className="min-h-[320px] p-[27px_18px_24px] font-mono text-sm leading-[1.75]">
          {currentSnippet.map(([ln,code],i) => (
            <div key={ln} className="animate-code-line flex gap-[18px]" style={{animationDelay:`${i*.08}s`}}>
              <span className="w-[18px] shrink-0 select-none text-right text-[#6d6961]">{ln}</span>
              <span className="flex items-center whitespace-pre">{code}{i===currentSnippet.length-1 && <span className="blinking-cursor" />}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[#45413c] px-[18px] py-3.5 font-mono text-[11px] text-[#98948d]">
          <div className={`flex items-center gap-2.5 ${running ? "text-[#e9be73]" : accepted ? "text-[#9bd4c0]" : ""}`}>
            <span className="h-2 w-2 rounded-full bg-current" />
            <span>{running ? "compiling / running tests…" : accepted ? <><b>Accepted</b> — nice.</> : <><b>Idle</b> — ready when you are</>}</span>
          </div>
          <div>{running ? "thinking" : accepted ? "12ms · 14.1MB" : "—"}</div>
        </div>
      </div>
    </div>
  );
}

function ReviewInterface() {
  return (
    <div className="relative z-[2] border border-[var(--ink)] bg-[#f6f2e9] text-[var(--ink)] shadow-[10px_10px_0_var(--orange)]">
      <div className="overflow-x-auto border-b border-[var(--ink)] bg-[#1d1c1a] p-6 font-mono text-sm leading-[1.8] text-[#e9e4d8]">
        <div><span className="text-[#ff9d7a]">function</span> <span className="text-[var(--acid)]">findMax</span>(arr) {"{"}</div>
        <div>&nbsp;&nbsp;<span className="text-[#ff9d7a]">let</span> max = <span className="text-[#e9be73]">0</span>; <span className="text-[#77736c] italic">// Assumes positive integers</span></div>
        <div>&nbsp;&nbsp;<span className="text-[#ff9d7a]">for</span>(<span className="text-[#ff9d7a]">let</span> i=<span className="text-[#e9be73]">0</span>; i&lt;arr.length; i++) {"{"}</div>
        <div className="border-l-[3px] border-[var(--acid)] bg-[rgba(217,255,90,.15)] pl-2.5">&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#ff9d7a]">if</span>(arr[i] &gt; max) max = arr[i];</div>
        <div>&nbsp;&nbsp;{"}"}</div><div>&nbsp;&nbsp;<span className="text-[#ff9d7a]">return</span> max;</div><div>{"}"}</div>
      </div>
      <div className="relative p-6">
        <div className="absolute bottom-6 left-10 top-6 w-0.5 bg-[var(--line)]" />
        <div className="relative z-[1] mb-6 border border-[var(--line)] border-l-4 border-l-[var(--orange)] bg-[var(--white)] p-[18px] shadow-[0_12px_30px_rgba(232,93,49,.15)]">
          <span className="absolute -right-2 -top-3 rotate-1 border border-[var(--ink)] bg-[var(--acid)] px-2 py-1 font-mono text-[10px] font-semibold">FEATURED</span>
          <div className="mb-2.5 flex flex-wrap items-center gap-2.5 font-mono text-xs"><b>Sarah Jenkins</b><span className="border border-[var(--ink)] bg-[var(--acid)] px-1.5 py-0.5 text-[10px]">Mentor</span><span className="text-[var(--muted)]">Line 4 · 2h ago</span></div>
          <p className="m-0 text-sm leading-[1.6]">Your logic works for positive arrays! But what happens if the array only contains negative numbers? E.g., <code>[-5, -2, -9]</code>. What would <code>max</code> return?</p>
        </div>
        <div className="relative z-[1] border border-[var(--line)] bg-[var(--white)] p-[18px]">
          <div className="mb-2.5 flex items-center gap-2.5 font-mono text-xs"><b>You</b><span className="text-[var(--muted)]">10m ago</span></div>
          <p className="m-0 text-sm leading-[1.6]">Ah, it would return 0, which isn't in the array. I should initialize <code>max = arr[0]</code> or <code>-Infinity</code>. Fixing it now.</p>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
