import React, { useCallback, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import logoUrl from "../assets/logoo2.png";

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

const formatEntryTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: true, timeZone: "Asia/Kolkata",
  }).format(date) + " IST";
};

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
        : `Reject ${booking.player_name}? This should release the booked slot and reopen it for other users.`;
    if (!window.confirm(confirmation)) return;

    setBusyId(booking.id);
    setError("");
    try {
      await invokeAdmin("update_status", {
        booking_id: booking.id,
        payment_status: nextStatus,
        // Backend must implement this for rejected bookings:
        // release the slot reservation and make the slot available again.
        release_slot: nextStatus === "rejected",
        reopen_slot: nextStatus === "rejected",
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
          <div className="ps5-emblem"><img src={logoUrl} alt="NITS Esports logo" /></div>
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
      <header className="ps5-brand-header">
        <div className="ps5-brand-presents">NITS ESPORTS PRESENTS</div>
        <img className="ps5-brand-logo" src={logoUrl} alt="NITS Esports logo" />
      </header>
      <header className="ps5-admin-header">
        <div className="ps5-admin-heading">
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
        <div className="ps5-stat"><span>BOOKING FEES</span><strong>{money(bookings.reduce((sum, b) => String(b.payment_status || "").toLowerCase() === "rejected" ? sum : sum + Number(b.registration_fee || 0), 0))}</strong></div>
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
                  <div className="ps5-entry-time"><span>ENTRY RECEIVED AT</span><strong>{formatEntryTime(booking.created_at)}</strong></div>
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
        Verify only after checking the actual payment proof. Rejecting a booking should release its slot and reopen availability; this requires the quick-processor Edge Function to process release_slot/reopen_slot.
      </p>
    </main>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
.ps5-admin-page,.ps5-admin-page *{box-sizing:border-box;font-family:'Orbitron',system-ui,sans-serif!important}
.ps5-admin-page{min-height:100vh;background:radial-gradient(ellipse at 10% 0%,rgba(109,40,217,.3),transparent 38%),radial-gradient(ellipse at 100% 38%,rgba(37,99,235,.19),transparent 36%),linear-gradient(145deg,#05030d,#0d0820 54%,#050817);color:#f7f5ff;padding:clamp(170px,19vh,220px) clamp(14px,3vw,40px) 40px;overflow-x:hidden}
.ps5-brand-header{width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;margin:0 auto 30px;padding:0 12px;position:relative;z-index:2}
.ps5-brand-presents{font-size:clamp(10px,1.8vw,13px);font-weight:800;letter-spacing:.24em;text-transform:uppercase;color:#c4b5fd;line-height:1.6;overflow-wrap:anywhere;text-align:center;max-width:100%}
.ps5-brand-logo{display:block;width:clamp(82px,10vw,118px);height:auto;max-height:118px;object-fit:contain;object-position:center;flex-shrink:0;filter:drop-shadow(0 0 16px rgba(139,92,246,.18))}
.ps5-kicker{color:#b9a6ff;font-size:10px;font-weight:800;letter-spacing:.16em;line-height:1.7;text-transform:uppercase;overflow-wrap:anywhere}
.ps5-login-card{width:min(100%,460px);margin:0 auto;padding:clamp(22px,5vw,42px);border:1px solid rgba(139,92,246,.55);border-radius:20px;background:linear-gradient(145deg,rgba(24,13,49,.97),rgba(5,4,17,.98));box-shadow:0 25px 90px #0008,0 0 40px #8b5cf622;text-align:center}
.ps5-emblem{width:82px;height:82px;display:grid;place-items:center;margin:22px auto 16px;border:1px solid #8b5cf6;border-radius:18px;background:linear-gradient(135deg,#8b5cf633,#2563eb2b);box-shadow:0 0 28px #8b5cf622;overflow:hidden}.ps5-emblem img{width:82%;height:82%;object-fit:contain;display:block}
.ps5-login-card h1,.ps5-admin-header h1{font-size:clamp(20px,4vw,34px);font-weight:900;letter-spacing:.015em;line-height:1.35;margin:8px 0 0;text-align:center;max-width:100%;overflow-wrap:anywhere;word-break:normal;background:linear-gradient(100deg,#fff,#d8ccff 55%,#93c5fd);color:transparent;background-clip:text;-webkit-background-clip:text}
.ps5-subtitle{color:#c5c0d7;font-size:12px;line-height:1.8;margin:12px 0 26px;overflow-wrap:anywhere}
.ps5-login-form{display:grid;gap:16px;text-align:left}
.ps5-login-form label{display:grid;gap:9px;color:#d9d0ff;font-size:10px;font-weight:800;letter-spacing:.08em;line-height:1.6}
.ps5-admin-page input,.ps5-admin-page select{width:100%;min-width:0;background:#0b091a;color:#fff;border:1px solid #6d4eb0;border-radius:10px;padding:13px 14px;outline:none;font-size:12px;letter-spacing:.01em}
.ps5-admin-page input::placeholder{color:#8d83aa}
.ps5-admin-page input:focus,.ps5-admin-page select:focus{border-color:#93c5fd;box-shadow:0 0 0 3px #3b82f622}
.ps5-primary-btn,.ps5-secondary-btn,.ps5-proof-btn,.ps5-verify-btn,.ps5-reject-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:9px;padding:12px 15px;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:.04em;line-height:1.5;cursor:pointer;transition:transform .18s ease,filter .18s ease;overflow-wrap:anywhere}
.ps5-primary-btn{border:1px solid #b5a1ff;color:#fff;background:linear-gradient(100deg,#6d28d9,#8b5cf6,#2563eb);margin-top:4px;width:100%}
.ps5-primary-btn:disabled,.ps5-admin-page button:disabled{opacity:.55;cursor:not-allowed}
.ps5-security-note,.ps5-footer-note{color:#9d96b6;font-size:10px;line-height:1.8;margin:20px 0 0}
.ps5-error{padding:11px 13px;border:1px solid #f87171a6;border-radius:9px;color:#fecaca;background:#7f1d1d33;font-size:11px;line-height:1.7;overflow-wrap:anywhere}.ps5-error-wide{max-width:1440px;margin:18px auto}
.ps5-admin-header{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;max-width:1440px;margin:0 auto 30px;padding:0 12px;position:relative;z-index:1}
.ps5-admin-heading{width:100%;min-width:0;text-align:center;display:flex;flex-direction:column;align-items:center}.ps5-admin-header h1{margin:8px auto 0}.ps5-admin-header p{color:#b9b2ce;margin:10px 0 0;font-size:11px;line-height:1.8;text-align:center;overflow-wrap:anywhere}
.ps5-header-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:100%}
.ps5-secondary-btn{border:1px solid #69518e;background:linear-gradient(120deg,#17102b,#101b3b);color:#eee8ff}
.ps5-stats{max-width:1440px;margin:0 auto 20px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.ps5-stat{min-width:0;padding:18px;border:1px solid #6d4eb066;border-radius:13px;background:linear-gradient(145deg,#17102b,#090714);box-shadow:0 10px 28px #0002}
.ps5-stat span,.ps5-detail-grid span{display:block;color:#a99ccf;font-size:9px;font-weight:800;letter-spacing:.09em;line-height:1.7;overflow-wrap:anywhere}
.ps5-stat strong{display:block;margin-top:9px;font-size:clamp(16px,2vw,25px);font-weight:900;color:#fff;overflow-wrap:anywhere}
.ps5-toolbar{max-width:1440px;margin:0 auto 18px;display:grid;grid-template-columns:minmax(220px,1fr) 190px auto;gap:12px;align-items:center}.ps5-toolbar>span{color:#bdb4d6;font-size:10px;text-align:right}
.ps5-booking-list{max-width:1440px;margin:0 auto;display:grid;gap:16px}
.ps5-booking-card{min-width:0;border:1px solid #6d4eb05c;border-radius:16px;padding:clamp(15px,2vw,24px);background:linear-gradient(145deg,#120d24f5,#070610f7 70%,#07121cf2);box-shadow:0 14px 35px #0003}
.ps5-booking-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding-bottom:17px;border-bottom:1px solid #8b5cf629}
.ps5-booking-id{font-size:9px;color:#9d8bcf;overflow-wrap:anywhere}.ps5-booking-top h2{font-size:clamp(15px,2vw,21px);font-weight:800;line-height:1.5;margin:8px 0;overflow-wrap:anywhere}.ps5-booking-top p{font-size:10px;line-height:1.8;color:#bdb5d1;margin:0;overflow-wrap:anywhere}
.ps5-status{display:inline-flex;white-space:nowrap;padding:7px 10px;border-radius:99px;font-size:9px;font-weight:800;text-transform:uppercase;border:1px solid #a78bfa66;background:#8b5cf61c;color:#ddd6fe}
.ps5-status-verified{border-color:#34d39988;background:#10b9811b;color:#6ee7b7}.ps5-status-rejected{border-color:#fb718588;background:#ef44441a;color:#fca5a5}
.ps5-detail-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;padding:18px 0}.ps5-detail-grid>div{min-width:0}.ps5-detail-grid strong{display:block;margin-top:6px;font-size:11px;line-height:1.7;color:#f7f5ff;overflow-wrap:anywhere}.ps5-entry-time strong{color:#c4b5fd;font-size:10px;line-height:1.8}
.ps5-slots-panel{border:1px solid #8b5cf62c;background:#080714a8;border-radius:12px;padding:15px}.ps5-panel-title{font-size:10px;font-weight:800;letter-spacing:.09em;line-height:1.7;color:#c4b5fd;margin-bottom:12px;overflow-wrap:anywhere}
.ps5-slot-chips{display:flex;flex-wrap:wrap;gap:9px}.ps5-slot-chip{display:grid;gap:5px;min-width:0;border:1px solid #67e8f93a;border-radius:9px;background:linear-gradient(135deg,#0c1720,#11112b);padding:9px 11px}.ps5-slot-chip strong{font-size:10px;font-weight:800;color:#a5f3fc}.ps5-slot-chip span{font-size:10px;color:#d5d2e4;overflow-wrap:anywhere}.ps5-muted{color:#a6a0bb;font-size:10px;line-height:1.7}
.ps5-booking-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:16px}.ps5-proof-btn{border:1px solid #67e8f977;background:#06b6d422;color:#a5f3fc}.ps5-proof-missing{color:#fca5a5;font-size:9px}
.ps5-review-actions{display:flex;gap:9px;flex-wrap:wrap}.ps5-verify-btn{border:1px solid #34d39977;background:#05966924;color:#6ee7b7}.ps5-reject-btn{border:1px solid #fb718577;background:#dc262624;color:#fca5a5}.ps5-empty{padding:40px;text-align:center;border:1px dashed #6d4eb066;border-radius:14px;color:#b9b2ce;font-size:11px}
@media(max-width:900px){.ps5-admin-header{grid-template-columns:1fr}.ps5-header-actions{grid-row:2}.ps5-detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ps5-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.ps5-toolbar{grid-template-columns:minmax(0,1fr) 160px}.ps5-toolbar>span{grid-column:1/-1;text-align:left}}
@media(max-width:600px){.ps5-admin-page{padding:clamp(145px,19vh,180px) 12px 28px}.ps5-brand-header{margin-bottom:24px}.ps5-brand-logo{width:82px}.ps5-admin-header{display:flex;flex-direction:column;align-items:center}.ps5-admin-header h1{font-size:clamp(19px,6vw,28px);line-height:1.45}.ps5-header-actions{width:100%}.ps5-header-actions button{flex:1}.ps5-toolbar{grid-template-columns:1fr}.ps5-detail-grid{grid-template-columns:1fr 1fr;gap:12px}.ps5-booking-top{display:grid}.ps5-status{justify-self:start}.ps5-booking-actions,.ps5-review-actions{width:100%}.ps5-proof-btn{width:100%}.ps5-review-actions button{flex:1}.ps5-stat{padding:13px}.ps5-stat span{font-size:8px}.ps5-login-card h1{font-size:clamp(19px,6vw,27px)}}
`;
