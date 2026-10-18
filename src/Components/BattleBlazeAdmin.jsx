import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import logoUrl from "../assets/logoo2.png";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const money = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata",
  }).format(date) + " IST";
};

const GAMES = ["ALL", "BGMI", "VALORANT", "MLBB", "RC", "FIFA"];
const statusLabel = (status) => String(status || "unknown").replaceAll("_", " ").toUpperCase();

export default function BattleBlazeAdmin({ externalAuth = null, onLogout } = {}) {
  const [scholarId, setScholarId] = useState(externalAuth?.scholarId || "");
  const [password, setPassword] = useState(externalAuth?.password || "");
  const [loggedIn, setLoggedIn] = useState(Boolean(externalAuth));
  const [rows, setRows] = useState([]);
  const [gameFilter, setGameFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const invokeAdmin = useCallback(async (action, extra = {}) => {
    if (!supabase) throw new Error("Supabase environment variables are missing.");
    const { data, error: invokeError } = await supabase.functions.invoke("quick-processor", {
      body: { action, scholar_id: scholarId.trim(), password, ...extra },
    });
    if (invokeError) {
      let message = invokeError.message || "Admin request failed.";
      try {
        const payload = await invokeError.context?.json?.();
        if (payload?.error) message = payload.error;
      } catch {}
      throw new Error(message);
    }
    if (data?.error) throw new Error(data.error);
    return data;
  }, [scholarId, password]);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await invokeAdmin("list_battleblaze_registrations");
      setRows(Array.isArray(result.registrations) ? result.registrations : []);
      setLoggedIn(true);
    } catch (err) {
      setError(err?.message || "Could not load registrations.");
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, [invokeAdmin]);

  useEffect(() => {
    if (externalAuth) loadRows();
  }, [externalAuth, loadRows]);

  const login = async (event) => {
    event.preventDefault();
    setError("");
    if (!/^\d{7}$/.test(scholarId.trim())) {
      setError("Enter a valid 7-digit scholar ID.");
      return;
    }
    if (!password) {
      setError("Enter the admin password.");
      return;
    }
    await loadRows();
  };

  const updateStatus = async (registration, nextStatus) => {
    const label = registration.team_name || registration.igl_name || "this registration";
    if (!window.confirm(`${nextStatus === "verified" ? "Verify payment for" : "Reject"} ${label}?`)) return;
    setBusyId(registration.id);
    setError("");
    try {
      await invokeAdmin("update_battleblaze_status", {
        registration_id: registration.id,
        payment_status: nextStatus,
      });
      await loadRows();
    } catch (err) {
      setError(err?.message || "Could not update registration status.");
    } finally {
      setBusyId("");
    }
  };

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const game = String(row.game || "").toUpperCase();
      const status = String(row.payment_status || "").toLowerCase();
      if (gameFilter !== "ALL" && game !== gameFilter) return false;
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      return [
        row.team_name, row.igl_name, row.igl_ign, row.igl_email, row.phone1,
        row.phone2, row.game, row.tournament, row.event_name, row.id,
        row.player2_name, row.player3_name, row.player4_name, row.player5_name,
      ].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [rows, gameFilter, statusFilter, search]);

  const awaiting = rows.filter((r) => ["proof_submitted", "pending"].includes(String(r.payment_status || "").toLowerCase()));
  const verified = rows.filter((r) => String(r.payment_status || "").toLowerCase() === "verified");
  const totalFees = rows.reduce((sum, r) =>
    ["rejected"].includes(String(r.payment_status || "").toLowerCase()) ? sum : sum + Number(r.registration_fee || 0), 0);

  if (!loggedIn && !externalAuth) {
    return (
      <main className="bb-admin">
        <style>{styles}</style>
        <section className="bb-login">
          <div className="bb-kicker">BATTLEBLAZE 2026 · RESTRICTED ACCESS</div>
          <img src={logoUrl} alt="NITS Esports logo" />
          <h1>BATTLEBLAZE ADMIN</h1>
          <p>Review BGMI, Valorant, MLBB, RC and FIFA registrations and payment proofs.</p>
          <form onSubmit={login}>
            <label>SCHOLAR ID<input value={scholarId} onChange={(e) => setScholarId(e.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" autoComplete="username" placeholder="7-digit scholar ID" required /></label>
            <label>ADMIN PASSWORD<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Admin password" required /></label>
            {error && <div className="bb-error">{error}</div>}
            <button disabled={loading}>{loading ? "AUTHENTICATING…" : "LOGIN TO ADMIN PANEL"}</button>
          </form>
          <small>Credentials are validated by the quick-processor Edge Function.</small>
        </section>
      </main>
    );
  }

  return (
    <main className="bb-admin">
      <style>{styles}</style>
      <header className="bb-header">
        <div className="bb-brand"><img src={logoUrl} alt="NITS Esports logo" /><div><div className="bb-kicker">NITS ESPORTS PRESENTS</div><h1>BATTLEBLAZE ADMIN</h1><p>RAMPAGE 2026 · PAYMENT VERIFICATION</p></div></div>
        <div className="bb-actions">
          <button className="bb-secondary" onClick={loadRows} disabled={loading}>{loading ? "REFRESHING…" : "↻ REFRESH"}</button>
          <button className="bb-secondary" onClick={() => { if (onLogout) onLogout(); else { setLoggedIn(false); setRows([]); setPassword(""); setScholarId(""); } }}>LOG OUT</button>
        </div>
      </header>

      <section className="bb-stats">
        <div><span>TOTAL REGISTRATIONS</span><strong>{rows.length}</strong></div>
        <div><span>AWAITING PAYMENT REVIEW</span><strong>{awaiting.length}</strong></div>
        <div><span>VERIFIED PAYMENTS</span><strong>{verified.length}</strong></div>
        <div><span>REGISTRATION FEES</span><strong>{money(totalFees)}</strong></div>
      </section>

      <section className="bb-toolbar">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team, player, email, phone or ID…" aria-label="Search registrations" />
        <select value={gameFilter} onChange={(e) => setGameFilter(e.target.value)}>{GAMES.map((game) => <option key={game} value={game}>{game === "ALL" ? "All games" : game}</option>)}</select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option><option value="proof_submitted">Proof submitted</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option><option value="free">Free registration</option>
        </select>
        <span>{visibleRows.length} result(s)</span>
      </section>

      {error && <div className="bb-error bb-error-wide">{error}</div>}

      <section className="bb-list">
        {loading && rows.length === 0 ? <div className="bb-empty">Loading registrations…</div> :
          visibleRows.length === 0 ? <div className="bb-empty">No registrations match these filters.</div> :
          visibleRows.map((r) => {
            const status = String(r.payment_status || "unknown").toLowerCase();
            const isFree = status === "free" || Number(r.registration_fee || 0) === 0;
            const players = [
              ["Player 1 / IGL", r.igl_name, r.igl_ign],
              ["Player 2", r.player2_name, r.player2_ign],
              ["Player 3", r.player3_name, r.player3_ign],
              ["Player 4", r.player4_name, r.player4_ign],
              ["Player 5", r.player5_name, r.player5_ign],
              ["Substitute", r.substitute_name, r.substitute_ign],
            ].filter((p) => p[1] || p[2]);
            return (
              <article className="bb-card" key={r.id}>
                <div className="bb-card-top">
                  <div><div className="bb-kicker">{r.event_name || "BATTLEBLAZE 2026"} · {r.game || "GAME"}</div><h2>{r.team_name || r.igl_name || "Unnamed registration"}</h2><p>{r.tournament || r.game || "Tournament"} · Submitted {formatDate(r.created_at)}</p></div>
                  <span className={`bb-status bb-status-${status.replace(/[^a-z_]/g, "")}`}>{statusLabel(status)}</span>
                </div>
                <div className="bb-details">
                  <div><span>TEAM / PLAYER</span><strong>{r.team_name || r.igl_name || "—"}</strong></div>
                  <div><span>GAME</span><strong>{r.game || "—"}</strong></div>
                  <div><span>EMAIL</span><strong>{r.igl_email || "—"}</strong></div>
                  <div><span>PHONE 1</span><strong>{r.phone1 || "—"}</strong></div>
                  <div><span>PHONE 2</span><strong>{r.phone2 || "—"}</strong></div>
                  <div><span>REGISTRATION FEE</span><strong>{isFree ? "FREE" : money(r.registration_fee)}</strong></div>
                  <div><span>REGISTRATION ID</span><strong className="bb-id">{r.id}</strong></div>
                </div>
                {players.length > 0 && <div className="bb-players"><h3>PLAYER DETAILS</h3><div className="bb-player-grid">{players.map(([label, name, ign]) => <div key={label}><span>{label}</span><strong>{name || "—"}</strong>{ign && <small>IGN / UID: {ign}</small>}</div>)}</div></div>}
                {r.payment_proof_url ? <a className="bb-proof" href={r.payment_proof_url} target="_blank" rel="noreferrer">↗ VIEW PAYMENT SCREENSHOT</a> :
                  <div className="bb-no-proof">{isFree ? "NO PAYMENT REQUIRED FOR THIS REGISTRATION" : "PAYMENT PROOF URL UNAVAILABLE"}</div>}
                {!isFree && <div className="bb-review">
                  <button className="bb-verify" disabled={busyId === r.id || status === "verified"} onClick={() => updateStatus(r, "verified")}>{busyId === r.id ? "SAVING…" : "✓ VERIFY PAYMENT"}</button>
                  <button className="bb-reject" disabled={busyId === r.id || status === "rejected"} onClick={() => updateStatus(r, "rejected")}>✕ REJECT</button>
                </div>}
              </article>
            );
          })}
      </section>
      <footer>Only mark a payment verified after opening and checking its proof screenshot.</footer>
    </main>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
.bb-admin,.bb-admin *{box-sizing:border-box}
.bb-admin{min-height:100vh;background:radial-gradient(ellipse at 12% 0%,rgba(109,40,217,.22),transparent 38%),radial-gradient(ellipse at 100% 40%,rgba(0,234,255,.08),transparent 34%),#05030d;color:#f7f5ff;padding:clamp(18px,3vw,40px);font-family:'Rajdhani',system-ui,sans-serif;overflow-x:hidden}
.bb-admin button,.bb-admin input,.bb-admin select{font:inherit}
.bb-login{width:min(100%,460px);margin:0 auto;padding:clamp(22px,5vw,42px);border:1px solid #8b5cf688;border-radius:20px;background:#0b0818ed;box-shadow:0 25px 90px #0008;text-align:center}
.bb-login img{display:block;width:88px;height:88px;object-fit:contain;margin:20px auto}
.bb-kicker{color:#b9a6ff;font:700 10px 'Orbitron',sans-serif;letter-spacing:.2em;line-height:1.7;text-transform:uppercase;overflow-wrap:anywhere}
.bb-login h1,.bb-header h1{font-size:clamp(22px,4vw,34px);line-height:1.3;margin:8px 0;background:linear-gradient(100deg,#fff,#d8ccff 55%,#93c5fd);color:transparent;background-clip:text;-webkit-background-clip:text}
.bb-login p,.bb-header p{color:#b9b2ce;font-size:11px;line-height:1.8}
.bb-login form{display:grid;gap:14px;text-align:left;margin-top:22px}
.bb-login label{display:grid;gap:8px;color:#d9d0ff;font-size:10px;font-weight:800}
.bb-admin input,.bb-admin select{min-width:0;width:100%;background:#0b091a;color:#fff;border:1px solid #6d4eb0;border-radius:10px;padding:12px 13px;font-size:12px;outline:none}
.bb-admin button,.bb-proof{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:9px;padding:12px 14px;font-size:10px;font-weight:800;letter-spacing:.04em;text-decoration:none;cursor:pointer;line-height:1.5}
.bb-login button,.bb-verify{border:1px solid #b5a1ff;color:white;background:linear-gradient(100deg,#6d28d9,#8b5cf6,#2563eb)}
.bb-admin button:disabled{opacity:.55;cursor:not-allowed}
.bb-login small{display:block;color:#9d96b6;font-size:10px;line-height:1.8;margin-top:20px}
.bb-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;max-width:1440px;margin:0 auto 25px;flex-wrap:wrap}
.bb-brand{display:flex;align-items:center;gap:16px;min-width:0}.bb-brand img{width:66px;height:66px;object-fit:contain;flex-shrink:0}.bb-brand>div{min-width:0}
.bb-header h1{font:800 clamp(23px,4vw,36px) 'Orbitron',sans-serif;letter-spacing:.02em;margin:4px 0}.bb-header p{margin:8px 0 0;color:#b9b2ce;font-size:14px}
.bb-actions{display:flex;gap:9px;flex-wrap:wrap}.bb-secondary{background:#17102b;color:#eee8ff;border:1px solid #69518e}
.bb-stats{max-width:1440px;margin:0 auto 18px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.bb-stats>div{padding:18px;border:1px solid #49356c;border-radius:13px;background:#0b0918cc;min-width:0}
.bb-stats span,.bb-details span,.bb-player-grid span{display:block;color:#a99ccf;font:700 9px 'Orbitron',sans-serif;letter-spacing:.12em;line-height:1.7}
.bb-stats strong{display:block;font:800 clamp(19px,2vw,27px) 'Orbitron',sans-serif;margin-top:9px;overflow-wrap:anywhere}
.bb-toolbar{max-width:1440px;margin:0 auto 18px;display:grid;grid-template-columns:minmax(220px,1fr) minmax(120px,170px) minmax(150px,190px) auto;gap:10px;align-items:center}
.bb-toolbar>span{font-size:10px;color:#c5c0d7;white-space:nowrap}
.bb-list{max-width:1440px;margin:0 auto;display:grid;gap:15px}
.bb-card{border:1px solid #49356c;border-radius:16px;background:linear-gradient(145deg,#171026ed,#080817f5);padding:clamp(15px,2.5vw,24px);min-width:0;box-shadow:0 14px 40px #0003}
.bb-card-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:18px}.bb-card h2{font-size:clamp(17px,2.3vw,24px);margin:5px 0;overflow-wrap:anywhere}.bb-card p{font-size:10px;color:#a9a0c4;line-height:1.8;overflow-wrap:anywhere;margin:4px 0}
.bb-status{padding:8px 10px;border:1px solid #75639c;border-radius:8px;font-size:9px;font-weight:800;white-space:nowrap;background:#31234d;color:#e9ddff}
.bb-status-verified{border-color:#15803d;background:#14532d55;color:#86efac}.bb-status-rejected{border-color:#b91c1c;background:#7f1d1d55;color:#fca5a5}.bb-status-proof_submitted,.bb-status-pending{border-color:#b7791f;background:#78350f55;color:#fcd34d}.bb-status-free{border-color:#0f766e;background:#134e4a66;color:#99f6e4}
.bb-details{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.bb-details>div,.bb-player-grid>div{padding:12px;border:1px solid #33254b;border-radius:9px;background:#080713aa;min-width:0}
.bb-details strong,.bb-player-grid strong{display:block;font-size:11px;margin-top:6px;overflow-wrap:anywhere;word-break:break-word}
.bb-id{font-size:9px!important}
.bb-players{margin-top:15px}.bb-players h3{font-size:11px;letter-spacing:.1em}.bb-player-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.bb-player-grid small{display:block;color:#c4b5fd;font-size:9px;line-height:1.6;margin-top:6px;overflow-wrap:anywhere}
.bb-proof{margin-top:15px;border:1px solid #7c3aed;background:#4c1d9555;color:#e9ddff}
.bb-no-proof{display:inline-flex;margin-top:15px;color:#aaa1c5;font-size:10px;line-height:1.8}
.bb-review{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}.bb-reject{border:1px solid #b91c1c;background:#7f1d1d55;color:#fecaca}
.bb-error{padding:11px 13px;border:1px solid #f87171a6;border-radius:9px;color:#fecaca;background:#7f1d1d33;font-size:11px;line-height:1.7;overflow-wrap:anywhere}.bb-error-wide{max-width:1440px;margin:18px auto}
.bb-empty{padding:28px;text-align:center;border:1px dashed #49356c;border-radius:14px;color:#b9b2ce;font-size:12px}
.bb-admin footer{max-width:1440px;margin:20px auto 0;color:#9d96b6;font-size:10px;line-height:1.8}
@media(max-width:900px){.bb-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.bb-toolbar{grid-template-columns:1fr 1fr}.bb-toolbar input{grid-column:1/-1}.bb-details{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.bb-admin{padding:14px}.bb-brand{align-items:flex-start}.bb-brand img{width:56px;height:56px}.bb-header{align-items:stretch}.bb-actions>*{flex:1}.bb-stats{gap:8px}.bb-stats>div{padding:13px}.bb-toolbar{grid-template-columns:1fr}.bb-toolbar input{grid-column:auto}.bb-card-top{flex-direction:column}.bb-player-grid{grid-template-columns:1fr}.bb-details{gap:8px}.bb-review>*{flex:1}}
`;
