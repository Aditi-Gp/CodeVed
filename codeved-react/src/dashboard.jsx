import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { clearSession, getDashboard, getToken, verifyToken } from "./api.js";

function DashboardApp() {
  const [view, setView] = useState("verifying");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!getToken()) {
      setView("authFailed");
      return;
    }

    verifyToken().then(() => getDashboard()).then((response) => {
      const dashboard = response.data;
      const analytics = dashboard.analytics;
      setData({
        totalSolved: analytics.problemsSolved,
        totalAttempted: analytics.totalAttempted,
        streakDays: analytics.streakDays || 0,
        topics: Object.entries(analytics.topicWise || {}),
        difficulties: Object.entries(analytics.difficultyWise || {}),
        profile: dashboard.profile,
        recentActivity: dashboard.recentActivity || [],
        heatmap: dashboard.heatmap || [],
      });
      setView("data");
    }).catch((requestError) => setView(requestError.status === 401 ? "authFailed" : "error"));
  }, []);

  return (
    <div className="relative z-[2] flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b-[3px] border-[var(--ink)] bg-[#f4f0e8]/95">
        <div className="mx-auto flex h-20 w-full max-w-[1404px] items-center justify-between px-8">
          <a href="/" className="flex items-center gap-3 font-serif text-[28px] font-semibold uppercase tracking-[-1px]">
            <span className="grid h-8 w-8 -rotate-1 place-items-center bg-[var(--ink)] font-mono text-[13px] text-[var(--acid)]">&lt;/&gt;</span>
            CodeVed
          </a>
          <nav className="hidden gap-10 text-sm font-semibold uppercase text-[var(--muted)] md:flex">
            <a href="/problemlist.html">Curriculum</a>
            <a href="/compiler.html">Sandbox</a>
          </nav>
          <button onClick={() => { clearSession(); window.location.href = "/login&register.html"; }} className="border-2 border-[var(--ink)] bg-[var(--acid)] px-3 py-1.5 font-mono text-[13px] font-semibold shadow-[4px_4px_0_var(--ink)]">LOG OUT</button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1404px] flex-1 flex-col px-8 pb-[120px] pt-[60px]">
        {view !== "data" ? <StateView view={view} /> : <DashboardData data={data} />}
      </main>

    </div>
  );
}

function StateView({ view }) {
  const states = {
    verifying: ["", "Authenticating Request..."],
    loading: ["", "Compiling Analytics..."],
    authFailed: ["🛑", "ACCESS DENIED. Session Invalid."],
    error: ["⚠️", "FATAL: Analytics API Unreachable."],
    empty: ["🕳️", "NULL POINTER: No activity found."],
  };
  const [icon, title] = states[view] || states.verifying;
  const isError = view === "authFailed" || view === "error";
  return (
    <section className={`relative mt-10 flex flex-1 flex-col items-center justify-center border-[3px] px-6 py-20 text-center shadow-[8px_8px_0_var(--ink)] ${isError ? "border-[var(--red)] bg-[#fff2ef] shadow-[12px_12px_0_var(--red)]" : "border-[var(--ink)] bg-[var(--white)]"}`}>
      <span className="absolute left-6 top-[-14px] bg-[var(--ink)] px-2 py-0.5 font-mono text-xs font-semibold text-[var(--acid)]">SYSTEM MSG</span>
      {icon ? <div className="mb-6 text-[56px]">{icon}</div> : <div className="mb-8 h-[60px] w-[60px] animate-spin rounded-full border-[6px] border-[var(--paper2)] border-t-[var(--orange)]" />}
      <div className={`font-mono text-xl font-semibold uppercase tracking-[.1em] ${isError ? "mb-6 text-[var(--red)]" : ""}`}>{title}</div>
      {view === "authFailed" && <button onClick={() => { window.location.href = "/login&register.html"; }} className="mt-6 border-2 border-[var(--ink)] bg-[var(--white)] px-6 py-3 font-mono text-sm font-semibold uppercase shadow-[3px_3px_0_var(--ink)]">Return to Login</button>}
      {view === "error" && <button onClick={() => window.location.reload()} className="mt-6 border-2 border-[var(--ink)] bg-[var(--white)] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase shadow-[3px_3px_0_var(--ink)]">Retry Connection</button>}
      {view === "empty" && <div className="mt-6 font-hand text-2xl text-[var(--orange)]">write some code!</div>}
    </section>
  );
}

function DashboardData({ data }) {
  const accuracy = data.totalAttempted ? `${((data.totalSolved / data.totalAttempted) * 100).toFixed(1)}%` : "NaN%";
  return (
    <div className="animate-[slideUp_.5s_ease]">
      <div className="relative mb-[60px] pt-5">
        <div className="pointer-events-none absolute -left-5 -top-10 z-[1] font-sans text-[120px] font-semibold text-[var(--paper2)]">DATA</div>
        <h1 className="relative z-[2] whitespace-nowrap font-serif text-[8vw] font-medium uppercase leading-[.85] tracking-[-.05em]">Telemetry.</h1>
        <div className="absolute bottom-2 right-[5%] z-[3] rotate-[-5deg] font-hand text-2xl text-[var(--orange)]">look at you go.</div>
      </div>
      <div className="grid grid-cols-12 gap-8 max-[1100px]:flex max-[1100px]:flex-col">
        <BentoCard className="col-span-4 row-span-2 bg-[var(--acid)] shadow-[12px_12px_0_var(--ink)] hover:shadow-[16px_16px_0_var(--ink)]">
          <div className="absolute right-5 top-5 h-[30px] w-[60px] opacity-80 [background:repeating-linear-gradient(90deg,var(--ink),var(--ink)_2px,transparent_2px,transparent_4px,var(--ink)_4px,var(--ink)_5px,transparent_5px,transparent_8px)]" />
          <CardHeader title="Identity Matrix" />
          <div className="flex flex-1 flex-col items-start justify-end">
            <div className="mb-6 grid h-16 w-16 -rotate-1 place-items-center border-2 border-[var(--ink)] bg-[var(--paper)] shadow-[4px_4px_0_var(--ink)]"><div className="relative flex h-6 w-8 animate-[hoverFloat_3s_ease-in-out_infinite] items-center justify-evenly rounded border-2 border-[var(--paper)] bg-[var(--ink)] before:absolute before:-top-2 before:left-1/2 before:h-2 before:w-0.5 before:-translate-x-1/2 before:bg-[var(--ink)] after:absolute after:-top-3 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-[var(--orange)]"><i className="h-1.5 w-1.5 animate-[blinkEye_4s_infinite] bg-[var(--acid)]" /><i className="h-1.5 w-1.5 animate-[blinkEye_4s_infinite] bg-[var(--acid)]" /></div></div>
            <div className="mb-3 font-serif text-[42px] font-medium leading-none tracking-[-.04em]">{data.profile?.name || "coder"}</div>
            <div className="mb-6 bg-[var(--ink)] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase text-[var(--white)]">Knight Level</div>
            <div className="grid w-full grid-cols-2 gap-4 border-t-2 border-[var(--ink)] pt-4">{[["Email", data.profile?.email || "-"], ["Joined", data.profile?.joinedDate ? new Date(data.profile.joinedDate).toLocaleDateString() : "-"], ["Solved", data.totalSolved], ["Status", "Active"]].map(([label, value]) => <div key={label} className="flex flex-col"><span className="font-mono text-[10px] font-semibold uppercase text-[var(--muted)]">{label}</span><span className="truncate text-xl font-bold">{value}</span></div>)}</div>
          </div>
        </BentoCard>

        <div className="col-span-8 grid grid-cols-4 border-[3px] border-[var(--ink)] bg-[var(--white)] shadow-[8px_8px_0_var(--ink)] max-[700px]:grid-cols-2">
          {[['Total Solved', data.totalSolved], ['Attempted', data.totalAttempted], ['Accuracy Rate', accuracy], ['Burn Streak', <>{data.streakDays}<small className="ml-2 text-xl">D</small></>]].map(([label, value], index) => <div key={label} className={`flex min-h-[140px] flex-col justify-center border-r-2 border-[var(--ink)] p-6 last:border-0 max-[700px]:border-b-2 max-[700px]:odd:border-r-2 ${index === 3 ? "bg-[var(--ink)] text-[var(--white)]" : ""}`}><span className={`mb-3 font-mono text-xs font-semibold uppercase ${index === 3 ? "text-[var(--acid)]" : "text-[var(--muted)]"}`}>{label}</span><div className="font-serif text-[56px] font-medium leading-none tracking-[-.05em]">{value}{label === "Accuracy Rate" && !data.totalAttempted && <span className="ml-2 inline-block rotate-[-10deg] border border-[var(--ink)] bg-[var(--white)] px-1 font-hand text-base text-[var(--orange)]">DIV/0 ERR</span>}</div></div>)}
        </div>

        <BentoCard className="col-span-8 bg-[var(--ink)] text-[var(--paper)]"><CardHeader title="Activity Matrix (T-30)" dark /><Heatmap entries={data.heatmap} /></BentoCard>
        <BentoCard className="col-span-6 row-span-2 bg-[var(--paper2)]"><CardHeader title="Architectural Focus" /><BarChart data={data.topics} /></BentoCard>
        <BentoCard className="col-span-6 row-span-2 bg-[var(--paper2)]"><CardHeader title="Complexity Index" /><BarChart data={data.difficulties} /></BentoCard>
        <BentoCard className="col-span-12"><CardHeader title="Execution Log" /><Feed items={data.recentActivity} /></BentoCard>
      </div>
    </div>
  );
}

function BentoCard({ className = "", children }) { return <section className={`relative flex flex-col border-[3px] border-[var(--ink)] bg-[var(--white)] p-8 shadow-[8px_8px_0_var(--ink)] transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_var(--acid)] ${className}`}>{children}</section>; }
function CardHeader({ title, dark = false }) { return <div className={`mb-6 flex items-center justify-between border-b-2 pb-4 font-mono text-xs font-semibold uppercase tracking-[.1em] ${dark ? "border-[#333]" : "border-[var(--ink)]"}`}><span><b className="mr-2 text-[var(--orange)]">///</b>{title}</span></div>; }
function Heatmap({ entries }) { const counts = new Map(entries.map((entry) => [entry.date, entry.count])); const days = Array.from({ length: 35 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (34 - index)); const key = date.toISOString().slice(0, 10); return { key, count: counts.get(key) || 0 }; }); return <div className="flex min-h-[116px] flex-1 items-end gap-1.5 overflow-hidden">{days.map(({ key, count }) => { const level = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 7 ? 3 : 4; return <div key={key} title={`${key}: ${count} submission${count === 1 ? "" : "s"}`} className={`h-4 w-4 cursor-crosshair rounded-full transition hover:scale-125 hover:border hover:border-[var(--white)] ${level === 0 ? "bg-[#222]" : level === 1 ? "bg-[#4052d6] shadow-[0_0_4px_#4052d6]" : level === 2 ? "bg-[var(--orange)] shadow-[0_0_6px_var(--orange)]" : level === 3 ? "bg-[var(--acid)] shadow-[0_0_8px_var(--acid)]" : "bg-[var(--white)] shadow-[0_0_10px_var(--white)]"}`} />; })}</div>; }
function BarChart({ data }) { const max = Math.max(...data.map(([, value]) => value), 10); return <div className="relative mt-5 flex min-h-[240px] flex-1 items-end justify-around border-b-[3px] border-[var(--ink)] pb-10">{data.map(([name, value]) => <div key={name} className="group relative flex h-full flex-1 flex-col items-center justify-end px-2"><div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border-2 border-[var(--ink)] bg-[var(--orange)] px-3 py-2 font-mono text-xs font-semibold text-[var(--white)] opacity-0 shadow-[4px_4px_0_var(--ink)] transition group-hover:opacity-100">{name} // {value}</div><div className="w-full max-w-[50px] border-2 border-b-0 border-[var(--ink)] bg-[var(--orange)] transition-all duration-500 group-hover:bg-[var(--ink)]" style={{ height: `${Math.max((value / max) * 100, 8)}%` }} /><span className="absolute bottom-[-35px] w-full text-center font-mono text-[11px] font-semibold uppercase">{name}</span></div>)}</div>; }
function Feed({ items }) { if (!items?.length) return <div className="border-2 border-[var(--ink)] p-10 text-center font-mono text-sm font-semibold uppercase text-[var(--muted)]">[ Buffer Empty ]</div>; return <div className="border-2 border-[var(--ink)]">{items.map((item, index) => { const accepted = item.status === "Accepted"; return <div key={`${item.problemName}-${index}`} className="flex items-center justify-between border-b-2 border-[var(--ink)] bg-[var(--white)] p-5 last:border-0 hover:bg-[var(--acid)] max-[700px]:items-start max-[700px]:gap-4"><div className="flex items-center gap-6 max-[700px]:items-start max-[700px]:gap-3"><span className={`border-2 border-[var(--ink)] px-3 py-1.5 font-mono text-[11px] font-bold uppercase text-[var(--white)] shadow-[2px_2px_0_var(--ink)] ${accepted ? "bg-[var(--green)]" : "bg-[var(--red)]"}`}>{item.status}</span><span className="text-lg font-bold max-[700px]:text-sm">{item.problemName}</span></div><div className="flex gap-6 font-mono text-sm font-semibold text-[var(--muted)] max-[700px]:flex-col max-[700px]:gap-1 max-[700px]:text-right"><span className="border-l-2 border-[var(--line)] pl-6 max-[700px]:border-0 max-[700px]:p-0">{item.language}</span><span>{new Date(item.submittedAt).toLocaleDateString()}</span></div></div>; })}</div>; }

createRoot(document.getElementById("root")).render(<DashboardApp />);
