import React, { useCallback, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import BattleBlazeAdmin from "./BattleBlazeAdmin";
import PS5RushAdmin from "./PS5RushAdmin";
import VRXperienceAdmin from "./VRXperience";
import logoUrl from "../assets/logoo2.png";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function AdminPanel() {
  const [activePanel, setActivePanel] = useState("home");
  const [auth, setAuth] = useState(null);
  const [scholarId, setScholarId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useCallback(async (event) => {
    event.preventDefault();
    setError("");
    if (!supabase) {
      setError("Supabase configuration missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
      return;
    }
    if (!/^\d{7}$/.test(scholarId.trim())) {
      setError("Enter a valid 7-digit scholar ID.");
      return;
    }
    if (!password) {
      setError("Enter the admin password.");
      return;
    }
    setLoading(true);
    try {
      // Validate once against the same quick-processor used by Games Admin.
      const { data, error: invokeError } = await supabase.functions.invoke("quick-processor", {
        body: {
          action: "list_battleblaze_registrations",
          scholar_id: scholarId.trim(),
          password,
        },
      });
      if (invokeError) {
        let message = invokeError.message || "Could not reach quick-processor.";
        try {
          const response = invokeError.context;
          if (response?.clone) {
            const copy = response.clone();
            const contentType = copy.headers?.get("content-type") || "";
            if (contentType.includes("json")) {
              const body = await copy.json();
              message = body?.error || body?.message || `${message} (HTTP ${copy.status})`;
            } else {
              const body = await copy.text();
              if (body) message = `${message}: ${body.slice(0, 200)}`;
            }
          }
        } catch {}
        throw new Error(message);
      }
      if (data?.error) throw new Error(data.error);
      setAuth({ scholarId: scholarId.trim(), password });
      setActivePanel("home");
      setError("");
    } catch (err) {
      setError(err?.message || "Login failed. Check the deployed Edge Function and its logs.");
    } finally {
      setLoading(false);
    }
  }, [scholarId, password]);

  const logout = () => {
    setAuth(null);
    setScholarId("");
    setPassword("");
    setActivePanel("home");
    setError("");
  };

  return (
    <div className="ap-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
        /* Remove the browser's default white page gutter behind the admin route. */
        html,body,#root{margin:0!important;min-height:100%;background:#05030d}
        body{overflow-x:hidden}
        .ap-shell,.ap-shell *{box-sizing:border-box;font-family:'Orbitron',system-ui,sans-serif}
        .ap-shell{position:relative;isolation:isolate;display:flow-root;width:100%;min-height:100vh;margin:0;padding:0;overflow-x:clip;background:radial-gradient(ellipse at 10% 0%,#6d28d933,transparent 38%),radial-gradient(ellipse at 100% 38%,#2563eb22,transparent 36%),linear-gradient(145deg,#05030d,#0d0820 54%,#050817);color:#f7f5ff}
        .ap-login-wrap{min-height:100vh;min-height:100svh;display:grid;place-items:center;padding:220px 16px 40px;position:relative;z-index:2}
        .ap-login-card{width:min(100%,460px);padding:clamp(22px,5vw,42px);border:1px solid #8b5cf688;border-radius:20px;background:#0b0818ed;box-shadow:0 25px 90px #0008;text-align:center}
        .ap-brand{display:flex;align-items:center;justify-content:center;gap:14px;margin:0 auto 20px;text-align:left}
        .ap-brand img{width:76px;height:76px;object-fit:contain;flex-shrink:0}
        .ap-kicker{color:#b9a6ff;font-size:10px;font-weight:800;letter-spacing:.14em;line-height:1.7;overflow-wrap:anywhere}
        .ap-brand-title{font-size:clamp(17px,4vw,23px);font-weight:900;line-height:1.35;margin:3px 0;background:linear-gradient(100deg,#fff,#d8ccff 55%,#93c5fd);color:transparent;background-clip:text;-webkit-background-clip:text}
        .ap-login-card h1{font-size:clamp(22px,4vw,32px);line-height:1.3;margin:14px 0 8px;background:linear-gradient(100deg,#fff,#d8ccff 55%,#93c5fd);color:transparent;background-clip:text;-webkit-background-clip:text}
        .ap-login-card p{color:#b9b2ce;font-size:11px;line-height:1.9;margin:0 auto 22px}
        .ap-login-form{display:grid;gap:14px;text-align:left}
        .ap-login-form label{display:grid;gap:8px;color:#d9d0ff;font-size:10px;font-weight:800;letter-spacing:.08em}
        .ap-login-form input{width:100%;min-width:0;background:#0b091a;color:#fff;border:1px solid #6d4eb0;border-radius:10px;padding:13px;font-size:12px;outline:none}
        .ap-login-form input:focus{border-color:#67e8f9;box-shadow:0 0 0 3px #67e8f922}
        .ap-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #b5a1ff;border-radius:9px;padding:13px 14px;color:white;background:linear-gradient(100deg,#6d28d9,#8b5cf6,#2563eb);font-size:10px;font-weight:800;letter-spacing:.06em;cursor:pointer}
        .ap-btn:disabled{opacity:.6;cursor:wait}
        .ap-error{padding:11px 13px;border:1px solid #f87171a6;border-radius:9px;color:#fecaca;background:#7f1d1d33;font-size:11px;line-height:1.7;overflow-wrap:anywhere}
        .ap-note{display:block;color:#9d96b6;font-size:9px;line-height:1.8;margin-top:18px}
        .ap-nav{position:relative;top:auto;z-index:50;width:min(calc(100% - 24px),1200px);margin:14px auto 26px;display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #ffffff24;border-radius:16px;background:rgba(7,7,17,.94);backdrop-filter:blur(18px);box-shadow:0 12px 40px #0008}
        .ap-top-brand{width:min(calc(100% - 28px),1200px);margin:126px auto 0;display:flex;align-items:center;justify-content:center;gap:14px;text-align:left;padding:12px 16px 4px}.ap-top-brand img{width:58px;height:58px;object-fit:contain;flex-shrink:0}.ap-top-brand span{display:block;color:#b9a6ff;font-size:10px;font-weight:800;letter-spacing:.16em;line-height:1.7}.ap-top-brand strong{display:block;margin-top:3px;font-size:clamp(16px,2.5vw,22px);font-weight:900;letter-spacing:.04em;background:linear-gradient(100deg,#fff,#d8ccff 55%,#93c5fd);color:transparent;background-clip:text;-webkit-background-clip:text}.ap-nav-brand{display:flex;align-items:center;gap:10px;min-width:0;margin-right:auto}.ap-nav-brand img{width:38px;height:38px;object-fit:contain}.ap-nav-brand strong{display:block;font-size:10px;letter-spacing:.05em}.ap-nav-brand span{display:block;color:#b9a6ff;font-size:8px;letter-spacing:.12em;margin-top:4px}
        .ap-nav button{border:1px solid #ffffff24;border-radius:10px;padding:11px 13px;background:#141322;color:#ddd;font-size:9px;font-weight:800;letter-spacing:.04em;cursor:pointer;white-space:nowrap}
        .ap-nav button.active{background:linear-gradient(100deg,#6d28d9,#7c3aed 55%,#2563eb);color:white;border-color:#c4b5fd}
        .ap-home{min-height:calc(100vh - 150px);display:grid;place-items:center;padding:24px 20px 40px}
        .ap-home-inner{width:min(100%,850px);text-align:center}.ap-home h1{font-size:clamp(28px,6vw,48px);line-height:1.2;margin:12px 0;background:linear-gradient(100deg,#fff,#d8ccff 55%,#93c5fd);color:transparent;background-clip:text;-webkit-background-clip:text}
        .ap-home p{color:#aaa5bd;font-size:12px;line-height:1.9;margin:0 auto 28px;max-width:560px}
        .ap-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;text-align:left}
        .ap-card{position:relative;overflow:hidden;min-height:200px;border:1px solid #ffffff22;border-radius:20px;padding:24px;background:linear-gradient(145deg,#171326,#090914);color:white;text-align:left;cursor:pointer;transition:transform .2s,border-color .2s,box-shadow .2s}
        .ap-card:hover{transform:translateY(-4px);border-color:#a78bfa;box-shadow:0 20px 55px #0006}.ap-card .ap-icon{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;background:#8b5cf633;border:1px solid #a78bfa66;font-size:23px;margin-bottom:18px}.ap-card strong{display:block;font-size:16px;line-height:1.5}.ap-card span{display:block;margin-top:8px;color:#b6b0ca;font-size:10px;line-height:1.8}.ap-card .ap-arrow{position:absolute;right:20px;bottom:18px;font-size:20px;color:#c4b5fd}
        @media(max-width:620px){.ap-brand img{width:60px;height:60px}.ap-login-wrap{padding:155px 12px 32px}.ap-top-brand{margin-top:104px;gap:10px;padding:8px}.ap-top-brand img{width:48px;height:48px}.ap-top-brand span{font-size:8px}.ap-nav{flex-wrap:wrap;gap:6px;padding:8px;margin:10px auto 20px}.ap-nav-brand{width:100%;margin:0 0 2px}.ap-nav button{flex:1;padding:10px 6px;font-size:8px}.ap-cards{grid-template-columns:1fr}.ap-card{min-height:155px;padding:19px}.ap-home{padding-top:150px}}
      `}</style>

      {!auth ? (
        <main className="ap-login-wrap">
          <section className="ap-login-card">
            <div className="ap-brand">
              <img src={logoUrl} alt="NITS Esports logo" />
              <div><div className="ap-kicker">NITS ESPORTS PRESENTS</div><div className="ap-brand-title">BATTLEBLAZE 2026</div></div>
            </div>
            <div className="ap-kicker">RESTRICTED ACCESS · ADMIN CONSOLE</div>
            <h1>ADMIN LOGIN</h1>
            <p>Sign in once to access PS5 Rush, VRXperience bookings and game registrations.</p>
            <form className="ap-login-form" onSubmit={login}>
              <label>SCHOLAR ID<input value={scholarId} onChange={(e) => setScholarId(e.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" autoComplete="username" placeholder="Enter 7-digit scholar ID" required /></label>
              <label>ADMIN PASSWORD<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Enter admin password" required /></label>
              {error && <div className="ap-error">{error}</div>}
              <button className="ap-btn" type="submit" disabled={loading}>{loading ? "AUTHENTICATING…" : "LOGIN TO ADMIN PANEL"}</button>
            </form>
            <small className="ap-note">Authorized access only. Credentials are checked by the deployed quick-processor Edge Function.</small>
          </section>
        </main>
      ) : (
        <>
          <header className="ap-top-brand"><img src={logoUrl} alt="NITS Esports logo"/><div><span>NITS ESPORTS PRESENTS</span><strong>BATTLEBLAZE 2026</strong></div></header>
          <nav className="ap-nav" aria-label="Admin panel navigation">
            <div className="ap-nav-brand"><img src={logoUrl} alt="NITS Esports logo"/><div><strong>NITS ESPORTS</strong><span>ADMIN CONSOLE</span></div></div>
            <button className={activePanel === "home" ? "active" : ""} onClick={() => setActivePanel("home")}>☰ MENU</button>
            <button className={activePanel === "ps5" ? "active" : ""} onClick={() => setActivePanel("ps5")}>🎮 PS5 RUSH</button>
            <button className={activePanel === "vrx" ? "active" : ""} onClick={() => setActivePanel("vrx")}>🥽 VRXPERIENCE</button>
            <button className={activePanel === "games" ? "active" : ""} onClick={() => setActivePanel("games")}>🏆 GAMES ADMIN</button>
            <button onClick={logout}>LOG OUT</button>
          </nav>
          {activePanel === "home" && <main className="ap-home"><section className="ap-home-inner"><div className="ap-kicker">NITS ESPORTS · ADMIN CONSOLE</div><h1>ADMIN CONTROL PANEL</h1><p>Choose which section you want to manage. You are signed in once and can switch between all admin panels without logging in again.</p><div className="ap-cards"><button className="ap-card" onClick={() => setActivePanel("ps5")}><div className="ap-icon">🎮</div><strong>PS5 RUSH ADMIN</strong><span>Manage bookings, time slots and payment verification.</span><span className="ap-arrow">↗</span></button><button className="ap-card" onClick={() => setActivePanel("vrx")}><div className="ap-icon">🥽</div><strong>VRXPERIENCE ADMIN</strong><span>Manage VR and Steering Wheel bookings, day-wise slots and combined payment verification.</span><span className="ap-arrow">↗</span></button><button className="ap-card" onClick={() => setActivePanel("games")}><div className="ap-icon">🏆</div><strong>GAMES ADMIN</strong><span>Review BGMI, Valorant, MLBB, RC and FIFA registrations.</span><span className="ap-arrow">↗</span></button></div></section></main>}
          {activePanel === "ps5" && <PS5RushAdmin externalAuth={auth} onLogout={logout} />}
          {activePanel === "vrx" && <VRXperienceAdmin externalAuth={auth} onLogout={logout} />}
          {activePanel === "games" && <BattleBlazeAdmin externalAuth={auth} onLogout={logout} />}
        </>
      )}
    </div>
  );
}
