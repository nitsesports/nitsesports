import React, { useCallback, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatTime = (value) => {
  if (!value) return "—";
  const parts = String(value).split(":");
  if (parts.length < 2) return value;
  let hour = Number(parts[0]);
  const minute = parts[1];
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${minute} ${suffix}`;
};

const slotList = (booking) => {
  const raw = booking.booked_slots;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default function PS5RushAdmin() {
  const [scholarId, setScholarId] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState("");

  const invokeAdmin = useCallback(
    async (action, extra = {}) => {
      if (!supabase) throw new Error("Supabase environment variables are missing.");
      const { data, error: invokeError } = await supabase.functions.invoke(
        "quick-processor",
        {
          body: {
            action,
            scholar_id: scholarId.trim(),
            password,
            ...extra,
          },
        }
      );
      if (invokeError) {
        let message = invokeError.message || "Admin request failed.";
        try {
          const response = invokeError.context;
          if (response && typeof response.json === "function") {
            const payload = await response.json();
            if (payload?.error) message = payload.error;
          }
        } catch {}
        throw new Error(message);
      }
      if (data?.error) throw new Error(data.error);
      return data;
    },
    [scholarId, password]
  );

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await invokeAdmin("list_bookings");
      setBookings(Array.isArray(result.bookings) ? result.bookings : []);
      setLoggedIn(true);
    } catch (err) {
      setError(err?.message || "Could not load bookings.");
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, [invokeAdmin]);

  const handleLogin = async (event) => {
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
    await loadBookings();
  };

  const updateStatus = async (booking, nextStatus) => {
    const confirmation =
      nextStatus === "verified"
        ? `Mark payment for ${booking.player_name} as VERIFIED?`
        : `Mark payment for ${booking.player_name} as REJECTED?`;
    if (!window.confirm(confirmation)) return;

    setBusyId(booking.id);
    setError("");
    try {
      await invokeAdmin("update_status", {
        booking_id: booking.id,
        payment_status: nextStatus,
      });
      await loadBookings();
    } catch (err) {
      setError(err?.message || "Could not update payment status.");
    } finally {
      setBusyId("");
    }
  };

  const visibleBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "all" ||
        String(booking.payment_status || "").toLowerCase() === statusFilter;
      const slots = slotList(booking)
        .map((slot) => `slot ${slot.slot_number} ${slot.start_time || ""}`)
        .join(" ");
      const haystack = [
        booking.player_name,
        booking.email,
        booking.phone1,
        booking.phone2,
        booking.gamer_tag,
        booking.preferred_game,
        booking.id,
        booking.day_number,
        booking.payment_status,
        slots,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!q || haystack.includes(q));
    });
  }, [bookings, search, statusFilter]);

  if (!loggedIn) {
    return (
      <main className="ps5-admin-page">
        <style>{styles}</style>
        <section className="ps5-login-card">
          <div className="ps5-kicker">BATTLEBLAZE 2026 · RESTRICTED ACCESS</div>
          <div className="ps5-emblem">BB</div>
          <h1>PS5 RUSH ADMIN</h1>
          <p className="ps5-subtitle">
            Sign in with an authorized scholar ID to review registrations and payment proofs.
          </p>
          <form onSubmit={handleLogin} className="ps5-login-form">
            <label>
              SCHOLAR ID
              <input
                value={scholarId}
                onChange={(event) => setScholarId(event.target.value.replace(/\D/g, "").slice(0, 7))}
                inputMode="numeric"
                autoComplete="username"
                placeholder="Enter scholar ID"
                required
              />
            </label>
            <label>
              PASSWORD
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="Enter admin password"
                required
              />
            </label>
            {error && <div className="ps5-error">{error}</div>}
            <button className="ps5-primary-btn" disabled={loading}>
              {loading ? "AUTHENTICATING…" : "LOGIN TO ADMIN PANEL"}
            </button>
          </form>
          <p className="ps5-security-note">
            Authorized access only. Credentials are checked by a server-side Edge Function.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="ps5-admin-page">
      <style>{styles}</style>
      <header className="ps5-admin-header">
        <div>
          <div className="ps5-kicker">BATTLEBLAZE 2026 · ADMIN CONSOLE</div>
          <h1>PS5 RUSH BOOKINGS</h1>
          <p>Review player details, booked slots and payment screenshots.</p>
        </div>
        <div className="ps5-header-actions">
          <button className="ps5-secondary-btn" onClick={loadBookings} disabled={loading}>
            {loading ? "REFRESHING…" : "↻ REFRESH"}
          </button>
          <button
            className="ps5-secondary-btn"
            onClick={() => {
              setLoggedIn(false);
              setBookings([]);
              setPassword("");
              setScholarId("");
            }}
          >
            LOG OUT
          </button>
        </div>
      </header>

      <section className="ps5-stats">
        <div className="ps5-stat"><span>TOTAL BOOKINGS</span><strong>{bookings.length}</strong></div>
        <div className="ps5-stat"><span>AWAITING REVIEW</span><strong>{bookings.filter((b) => b.payment_status === "proof_submitted").length}</strong></div>
        <div className="ps5-stat"><span>VERIFIED</span><strong>{bookings.filter((b) => b.payment_status === "verified").length}</strong></div>
        <div className="ps5-stat"><span>BOOKING FEES</span><strong>{money(bookings.reduce((sum, b) => sum + Number(b.registration_fee || 0), 0))}</strong></div>
      </section>

      <section className="ps5-toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search player, email, phone, slot, booking ID…"
          aria-label="Search bookings"
        />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="proof_submitted">Proof submitted</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <span>{visibleBookings.length} result(s)</span>
      </section>

      {error && <div className="ps5-error ps5-error-wide">{error}</div>}

      <section className="ps5-booking-list">
        {loading && bookings.length === 0 ? (
          <div className="ps5-empty">Loading bookings…</div>
        ) : visibleBookings.length === 0 ? (
          <div className="ps5-empty">No bookings match this filter.</div>
        ) : (
          visibleBookings.map((booking) => {
            const slots = slotList(booking).sort(
              (a, b) => Number(a.slot_number || 0) - Number(b.slot_number || 0)
            );
            const status = String(booking.payment_status || "unknown").toLowerCase();
            return (
              <article className="ps5-booking-card" key={booking.id}>
                <div className="ps5-booking-top">
                  <div>
                    <div className="ps5-booking-id">BOOKING · {booking.id}</div>
                    <h2>{booking.player_name || "Unnamed player"}</h2>
                    <p>{booking.email || "No email"} · {booking.phone1 || "No phone"}</p>
                  </div>
                  <span className={`ps5-status ps5-status-${status.replace(/[^a-z_]/g, "")}`}>
                    {status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="ps5-detail-grid">
                  <div><span>EMAIL</span><strong>{booking.email || "—"}</strong></div>
                  <div><span>PHONE 1</span><strong>{booking.phone1 || "—"}</strong></div>
                  <div><span>PHONE 2</span><strong>{booking.phone2 || "—"}</strong></div>
                  <div><span>GAMER TAG</span><strong>{booking.gamer_tag || "—"}</strong></div>
                  <div><span>PREFERRED GAME</span><strong>{booking.preferred_game || "—"}</strong></div>
                  <div><span>DAY</span><strong>Day {booking.day_number ?? "—"}</strong></div>
                  <div><span>REGISTRATION FEE</span><strong>{money(booking.registration_fee)}</strong></div>
                  <div><span>REGISTERED AT</span><strong>{booking.created_at ? new Date(booking.created_at).toLocaleString("en-IN") : "—"}</strong></div>
                </div>

                <div className="ps5-slots-panel">
                  <div className="ps5-panel-title">BOOKED SLOTS · DAY {booking.day_number ?? "—"}</div>
                  {slots.length ? (
                    <div className="ps5-slot-chips">
                      {slots.map((slot, index) => (
                        <div className="ps5-slot-chip" key={`${slot.slot_id || slot.slot_number || index}`}>
                          <strong>Slot {slot.slot_number ?? "—"}</strong>
                          <span>{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="ps5-muted">No slot details stored in booked_slots.</p>
                  )}
                </div>

                <div className="ps5-booking-actions">
                  {booking.payment_proof_url ? (
                    <a
                      className="ps5-proof-btn"
                      href={booking.payment_proof_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      ↗ VIEW PAYMENT SCREENSHOT
                    </a>
                  ) : (
                    <span className="ps5-proof-missing">
                      PAYMENT SCREENSHOT URL UNAVAILABLE
                    </span>
                  )}
                  <div className="ps5-review-actions">
                    <button
                      className="ps5-verify-btn"
                      onClick={() => updateStatus(booking, "verified")}
                      disabled={busyId === booking.id || status === "verified"}
                    >
                      {busyId === booking.id ? "SAVING…" : "✓ VERIFY PAYMENT"}
                    </button>
                    <button
                      className="ps5-reject-btn"
                      onClick={() => updateStatus(booking, "rejected")}
                      disabled={busyId === booking.id || status === "rejected"}
                    >
                      ✕ REJECT
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
      <p className="ps5-footer-note">
        Verify only after checking the actual payment proof. Updating status records the admin decision; it does not refund or alter the slot reservation.
      </p>
    </main>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Rajdhani:wght@400;500;600;700&display=swap');
.ps5-admin-page{min-height:100vh;background:radial-gradient(ellipse at 12% 0%,rgba(109,40,217,.22),transparent 38%),radial-gradient(ellipse at 100% 40%,rgba(0,234,255,.08),transparent 34%),#05030d;color:#f7f5ff;padding:clamp(18px,3vw,40px);font-family:'Rajdhani',system-ui,sans-serif}
.ps5-admin-page *{box-sizing:border-box}.ps5-admin-page button,.ps5-admin-page input,.ps5-admin-page select{font:inherit}
.ps5-kicker{color:#b9a6ff;font:700 10px 'Orbitron',sans-serif;letter-spacing:.2em;text-transform:uppercase}
.ps5-login-card{width:min(100%,440px);margin:7vh auto;padding:clamp(24px,5vw,42px);border:1px solid rgba(139,92,246,.52);border-radius:20px;background:linear-gradient(145deg,rgba(24,13,49,.96),rgba(5,4,17,.98));box-shadow:0 25px 90px #0008,0 0 40px #8b5cf622;text-align:center}
.ps5-emblem{width:66px;height:66px;display:grid;place-items:center;margin:22px auto 16px;border:1px solid #8b5cf6;border-radius:18px;background:linear-gradient(135deg,#8b5cf633,#00eaff15);font:800 24px 'Orbitron',sans-serif;color:#fff;box-shadow:0 0 28px #8b5cf622}
.ps5-login-card h1,.ps5-admin-header h1{font:800 clamp(23px,4vw,36px) 'Orbitron',sans-serif;letter-spacing:.02em;margin:0;background:linear-gradient(100deg,#fff,#d8ccff 55%,#a5f3fc);color:transparent;background-clip:text}
.ps5-subtitle{color:#c5c0d7;font-size:14px;line-height:1.6;margin:12px 0 26px}.ps5-login-form{display:grid;gap:16px;text-align:left}
.ps5-login-form label{display:grid;gap:8px;color:#d9d0ff;font:700 10px 'Orbitron',sans-serif;letter-spacing:.1em}
.ps5-admin-page input,.ps5-admin-page select{width:100%;min-width:0;background:#0b091a;color:#fff;border:1px solid #6d4eb0;border-radius:10px;padding:12px 14px;outline:none}
.ps5-admin-page input:focus,.ps5-admin-page select:focus{border-color:#67e8f9;box-shadow:0 0 0 3px #67e8f922}
.ps5-primary-btn,.ps5-secondary-btn,.ps5-proof-btn,.ps5-verify-btn,.ps5-reject-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:9px;padding:12px 15px;text-decoration:none;font:700 10px 'Orbitron',sans-serif;letter-spacing:.07em;cursor:pointer;transition:transform .18s ease,filter .18s ease}
.ps5-primary-btn{border:1px solid #b5a1ff;color:#fff;background:linear-gradient(100deg,#6d28d9,#8b5cf6,#2563eb);margin-top:4px}.ps5-primary-btn:disabled,.ps5-admin-page button:disabled{opacity:.55;cursor:not-allowed}
.ps5-security-note,.ps5-footer-note{color:#9d96b6;font-size:12px;line-height:1.6;margin:20px 0 0}.ps5-error{padding:11px 13px;border:1px solid #f87171a6;border-radius:9px;color:#fecaca;background:#7f1d1d33;font-size:13px}.ps5-error-wide{margin:18px 0}
.ps5-admin-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;max-width:1440px;margin:0 auto 25px}.ps5-admin-header p{color:#b9b2ce;margin:10px 0 0;font-size:15px}.ps5-header-actions{display:flex;gap:10px;flex-wrap:wrap}
.ps5-secondary-btn{border:1px solid #69518e;background:#100b22;color:#eee8ff}.ps5-stats{max-width:1440px;margin:0 auto 20px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.ps5-stat{padding:18px;border:1px solid #6d4eb04f;border-radius:13px;background:linear-gradient(145deg,#17102b,#090714)}.ps5-stat span,.ps5-detail-grid span{display:block;color:#a99ccf;font:700 9px 'Orbitron',sans-serif;letter-spacing:.12em}.ps5-stat strong{display:block;margin-top:9px;font:800 clamp(19px,2vw,27px) 'Orbitron',sans-serif;color:#fff;overflow-wrap:anywhere}
.ps5-toolbar{max-width:1440px;margin:0 auto 18px;display:grid;grid-template-columns:minmax(220px,1fr) 190px auto;gap:12px;align-items:center}.ps5-toolbar>span{color:#bdb4d6;font-size:13px;text-align:right}
.ps5-booking-list{max-width:1440px;margin:0 auto;display:grid;gap:16px}.ps5-booking-card{border:1px solid #6d4eb05c;border-radius:16px;padding:clamp(16px,2vw,24px);background:linear-gradient(145deg,#120d24f5,#070610f7 70%,#07121cf2);box-shadow:0 14px 35px #0003}
.ps5-booking-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding-bottom:17px;border-bottom:1px solid #8b5cf629}.ps5-booking-id{font-size:10px;color:#9d8bcf;overflow-wrap:anywhere}.ps5-booking-top h2{font:700 clamp(17px,2vw,23px) 'Orbitron',sans-serif;margin:8px 0}.ps5-booking-top p{font-size:13px;color:#bdb5d1;margin:0;overflow-wrap:anywhere}
.ps5-status{display:inline-flex;white-space:nowrap;padding:7px 10px;border-radius:99px;font:700 9px 'Orbitron',sans-serif;text-transform:uppercase;border:1px solid #a78bfa66;background:#8b5cf61c;color:#ddd6fe}.ps5-status-verified{border-color:#34d39988;background:#10b9811b;color:#6ee7b7}.ps5-status-rejected{border-color:#fb718588;background:#ef44441a;color:#fca5a5}
.ps5-detail-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;padding:18px 0}.ps5-detail-grid>div{min-width:0}.ps5-detail-grid strong{display:block;margin-top:6px;font-size:14px;color:#f7f5ff;overflow-wrap:anywhere}
.ps5-slots-panel{border:1px solid #8b5cf62c;background:#080714a8;border-radius:12px;padding:15px}.ps5-panel-title{font:700 10px 'Orbitron',sans-serif;letter-spacing:.12em;color:#c4b5fd;margin-bottom:12px}.ps5-slot-chips{display:flex;flex-wrap:wrap;gap:9px}.ps5-slot-chip{display:grid;gap:4px;border:1px solid #67e8f93a;border-radius:9px;background:#0c1720;padding:9px 11px}.ps5-slot-chip strong{font:700 11px 'Orbitron',sans-serif;color:#a5f3fc}.ps5-slot-chip span{font-size:12px;color:#d5d2e4}.ps5-muted{color:#a6a0bb;font-size:13px}
.ps5-booking-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:16px}.ps5-proof-btn{border:1px solid #67e8f977;background:#06b6d422;color:#a5f3fc}.ps5-proof-missing{color:#fca5a5;font-size:11px}.ps5-review-actions{display:flex;gap:9px;flex-wrap:wrap}.ps5-verify-btn{border:1px solid #34d39977;background:#05966924;color:#6ee7b7}.ps5-reject-btn{border:1px solid #fb718577;background:#dc262624;color:#fca5a5}.ps5-empty{padding:40px;text-align:center;border:1px dashed #6d4eb066;border-radius:14px;color:#b9b2ce}
@media(max-width:900px){.ps5-detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ps5-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.ps5-toolbar{grid-template-columns:1fr 170px}.ps5-toolbar>span{grid-column:1/-1;text-align:left}}
@media(max-width:600px){.ps5-admin-page{padding:14px}.ps5-admin-header{display:grid}.ps5-header-actions{width:100%}.ps5-header-actions button{flex:1}.ps5-toolbar{grid-template-columns:1fr}.ps5-detail-grid{grid-template-columns:1fr 1fr;gap:12px}.ps5-booking-top{display:grid}.ps5-status{justify-self:start}.ps5-booking-actions,.ps5-review-actions{width:100%}.ps5-proof-btn{width:100%}.ps5-review-actions button{flex:1}.ps5-stat{padding:14px}}
`;

