import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const initialMessages = {
  login: "> initializing session payload...",
  register: "> allocating new memory blocks...",
};

function AuthApp() {
  const [view, setView] = useState("login");
  const [message, setMessage] = useState(initialMessages.login);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [register, setRegister] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const timerRef = useRef();

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const switchView = (nextView) => {
    setView(nextView);
    setError("");
    setSuccess("");
    setSubmitting(false);
    setMessage(initialMessages[nextView]);
    if (nextView === "login") setLogin({ email: "", password: "" });
    else setRegister({ username: "", email: "", password: "" });
  };

  const updateField = (form, field, value) => {
    if (form === "login") setLogin((current) => ({ ...current, [field]: value }));
    else setRegister((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const submitLogin = (event) => {
    event.preventDefault();
    if (!login.email || !login.password) {
      setError("Syntax Error: Email and Password required.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("Logging in...");
    timerRef.current = window.setTimeout(() => {
      if (login.email === "error@codeved.com") finishWithError("Fatal: Connection refused (Port 8080 down).");
      else if (login.email === "rate@codeved.com") finishWithError("HTTP 429: Too many requests. Retry in 15s.");
      else if (login.password !== "password123") finishWithError("Authentication Failed: Invalid credentials.");
      else {
        setSuccess("Session Established. Redirecting...");
        timerRef.current = window.setTimeout(() => { window.location.href = "/dashboard.html"; }, 1000);
      }
    }, 1500);
  };

  const submitRegister = (event) => {
    event.preventDefault();
    if (!register.username || !register.email || !register.password) {
      setError("Syntax Error: All fields are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("Registering...");
    timerRef.current = window.setTimeout(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(register.email)) finishWithError("Validation Error: Invalid email format.");
      else if (register.username.length < 3 || register.username.length > 20) finishWithError("Validation Error: Username must be 3-20 chars.");
      else if (register.password.length < 6) finishWithError("Security Alert: Password must be at least 6 chars.");
      else if (register.email === "taken@codeved.com") finishWithError("Conflict: Email is already registered.");
      else if (register.email === "rate@codeved.com") finishWithError("HTTP 429: Too many requests. Retry in 15s.");
      else {
        setSuccess("User Created Successfully.");
        timerRef.current = window.setTimeout(() => switchView("login"), 1000);
      }
    }, 1500);
  };

  const finishWithError = (messageText) => {
    setError(messageText);
    setSuccess("");
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-auto lg:flex-row lg:overflow-hidden">
      <section className="relative flex min-h-[45vh] flex-1 flex-col justify-center overflow-hidden bg-[#0a0a09] px-8 py-[60px] text-[var(--white)] lg:min-h-screen lg:px-[60px]">
        <div className="absolute inset-[-30%] animate-[authPulseBg_20s_ease-in-out_infinite_alternate] blur-[60px]">
          <div className="absolute left-[-10%] top-[10%] h-[40vw] w-[40vw] animate-[authFloat_15s_ease-in-out_infinite_alternate] rounded-full bg-[var(--orange)] opacity-60 mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[10%] h-[45vw] w-[45vw] animate-[authFloat_18s_ease-in-out_infinite_alternate-reverse] rounded-full bg-[var(--green)] opacity-60 mix-blend-screen" />
          <div className="absolute left-[40%] top-[40%] h-[30vw] w-[30vw] animate-[authFloat_12s_ease-in-out_infinite_alternate] rounded-full bg-[var(--acid)] opacity-40 mix-blend-screen" />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] [background-image:linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:30px_30px]" />
        <div className="relative z-[2] max-w-[500px]">
          <div className="mb-10 grid h-10 w-10 -rotate-2 place-items-center border-2 border-[var(--acid)] font-mono text-sm text-[var(--acid)] shadow-[4px_4px_0_rgba(217,255,90,.3)]">&lt;/&gt;</div>
          <h1 className="mb-6 font-serif text-[clamp(48px,6vw,72px)] font-medium leading-[1.05] tracking-[-.04em]">Enter the<br /><em className="text-[var(--acid)]">Flow State.</em></h1>
          <div className="font-mono text-base leading-[1.7] text-[#a8a39a]"><span key={message} className="inline-block max-w-full overflow-hidden whitespace-nowrap border-r-2 border-[var(--orange)] animate-[authTyping_2s_steps(40,end),authBlinkCaret_.75s_step-end_infinite]">{message}</span></div>
        </div>
      </section>

      <section className="relative z-10 flex flex-1 items-center justify-center bg-[var(--paper)] px-6 py-[60px] lg:px-10 lg:py-10">
        <div className="relative flex w-full max-w-[440px] flex-col border-2 border-[var(--ink)] bg-[var(--white)] shadow-[12px_12px_0_var(--orange)] max-[900px]:shadow-[8px_8px_0_var(--orange)]">
          <div className={`absolute right-[-20px] top-[-35px] rotate-2 font-hand text-xl ${view === "login" ? "text-[var(--green)]" : "text-[var(--orange)]"}`}>{view === "login" ? "welcome back." : "join the flow."}</div>
          <div className="flex border-b-2 border-[var(--ink)] bg-[var(--paper2)] font-mono text-xs font-semibold uppercase">
            <button onClick={() => switchView("login")} className={`relative flex-1 border-r-2 border-[var(--ink)] p-4 ${view === "login" ? "bg-[var(--white)] text-[var(--ink)] after:absolute after:bottom-[-2px] after:left-0 after:h-0.5 after:w-full after:bg-[var(--white)]" : "text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"}`}>session.login</button>
            <button onClick={() => switchView("register")} className={`relative flex-1 p-4 ${view === "register" ? "bg-[var(--white)] text-[var(--ink)] after:absolute after:bottom-[-2px] after:left-0 after:h-0.5 after:w-full after:bg-[var(--white)]" : "text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"}`}>user.create</button>
          </div>
          <div className="overflow-hidden p-8">
            <form onSubmit={view === "login" ? submitLogin : submitRegister} className="flex animate-[slideUp_.3s_ease_forwards] flex-col gap-6" noValidate>
              {error && <div className="border border-[var(--red)] border-l-4 bg-[#fff2ef] p-3 font-mono text-[13px] font-medium text-[var(--red)]">{error}</div>}
              {success && <div className="border border-[var(--green)] border-l-4 bg-[#eef8f1] p-3 font-mono text-[13px] font-medium text-[var(--green)]">{success}</div>}
              {view === "register" && <AuthField label="Username" type="text" value={register.username} placeholder="fluent_coder" onChange={(value) => updateField("register", "username", value)} />}
              <AuthField label="Email Address" type="email" value={view === "login" ? login.email : register.email} placeholder="thinker@codeved.com" onChange={(value) => updateField(view, "email", value)} />
              <AuthField label="Password" type="password" value={view === "login" ? login.password : register.password} placeholder="••••••••" onChange={(value) => updateField(view, "password", value)} />
              <button type="submit" disabled={submitting} className="relative mt-3 overflow-hidden border-2 border-[var(--ink)] bg-[var(--ink)] p-[18px] font-mono text-sm font-semibold uppercase tracking-[.1em] text-[var(--paper)] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--orange)] hover:shadow-[6px_6px_0_var(--ink)] disabled:cursor-not-allowed disabled:bg-[var(--muted)]">{submitting ? (view === "login" ? "Logging in..." : "Registering...") : view === "login" ? "EXECUTE ▸" : "COMPILE & RUN ▸"}</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function AuthField({ label, type, value, placeholder, onChange }) {
  return <label className="flex flex-col gap-2"><span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[.05em] text-[var(--muted)]"><i className="h-1.5 w-1.5 rounded-full border border-[var(--ink)] bg-[var(--acid)]" />{label}</span><span className="relative flex items-center before:pointer-events-none before:absolute before:left-4 before:z-[1] before:font-mono before:text-sm before:font-semibold before:text-[var(--muted)] before:content-['>']"><input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full border border-[var(--ink)] bg-[var(--paper)] px-4 py-3.5 pl-10 text-[15px] font-medium text-[var(--ink)] outline-none shadow-[4px_4px_0_rgba(24,23,20,.05)] transition focus:-translate-x-0.5 focus:-translate-y-0.5 focus:bg-[var(--white)] focus:shadow-[4px_4px_0_var(--acid)]" required /></span></label>;
}

createRoot(document.getElementById("root")).render(<AuthApp />);
