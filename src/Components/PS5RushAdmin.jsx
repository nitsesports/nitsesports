import React, { useCallback, useEffect, useMemo, useState } from "react";
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

const parseArray = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    // Some Edge Function responses return JSON objects instead of arrays.
    const values = Object.values(raw);
    return values.length ? values : [];
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return Object.values(parsed);
    } catch {
      if (raw.includes(",")) return raw.split(",").map((value) => value.trim()).filter(Boolean);
      return [raw.trim()];
    }
  }
  return [];
};

const firstPresent = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const toSlotNumber = (slot) => {
  if (typeof slot === "number" && Number.isFinite(slot)) return slot;
  if (typeof slot === "string") {
    const trimmed = slot.trim();
    if (/^\d+$/.test(trimmed)) return Number(trimmed);
    // Handles labels such as "Slot 3" or "slot_number: 3".
    const match = trimmed.match(/(?:slot(?:_number|_no|_num)?\s*)[:#-]?\s*(\d+)/i);
    if (match) return Number(match[1]);
    return null;
  }
  if (!slot || typeof slot !== "object") return null;
  const raw = firstPresent(
    slot.slot_number, slot.slot_no, slot.slot_num, slot.slotNumber,
    slot.slotNo, slot.slotNum, slot.number, slot.slot, slot.position,
    slot.sequence, slot.index
  );
  if (raw !== undefined) {
    const number = toSlotNumber(raw);
    if (number !== null) return number;
  }
  // Some payloads put the numeric slot number in a generic `name` or `label`.
  const label = firstPresent(slot.label, slot.name, slot.title, slot.slot_label);
  return label !== undefined ? toSlotNumber(label) : null;
};

const normalizeSlot = (rawSlot, index, booking = {}) => {
  const raw = rawSlot && typeof rawSlot === "object" ? rawSlot : { slot: rawSlot };
  const number = toSlotNumber(raw);
  const startTime = firstPresent(
    raw.start_time, raw.startTime, raw.start, raw.from_time, raw.from,
    raw.slot_start, raw.start_at, raw.starts_at,
    booking.start_time, booking.startTime
  );
  const endTime = firstPresent(
    raw.end_time, raw.endTime, raw.end, raw.to_time, raw.to,
    raw.slot_end, raw.end_at, raw.ends_at,
    booking.end_time, booking.endTime
  );
  const id = firstPresent(raw.slot_id, raw.slotId, raw.id, raw.slot_uuid);
  return {
    ...raw,
    slot_number: number ?? (index + 1),
    slot_id: id ?? raw.slot_id,
    start_time: startTime,
    end_time: endTime,
  };
};

// Accept multiple versions of the quick-processor response and the slot schema.
// The display has a safe ordinal fallback when the API sends slot IDs but omits
// the actual slot number. If time values are absent, the standard 30-minute
// PS5 Rush schedule is calculated from the resolved slot number.
const slotList = (booking) => {
  const candidates = [
    booking.booked_slots,
    booking.slot_details,
    booking.slot_data,
    booking.day_slots,
    booking.selected_slots,
    booking.slots,
    booking.slot_numbers,
    booking.slot_ids,
    booking.slot_id,
    booking.selected_slot,
    booking.selected_slot_id,
  ];

  for (const candidate of candidates) {
    const parsed = parseArray(candidate);
    if (parsed.length) {
      return parsed.map((slot, index) => normalizeSlot(slot, index, booking));
    }
  }

  const direct = normalizeSlot({
    slot_number: firstPresent(
      booking.slot_number, booking.selected_slot_number, booking.slot_no,
      booking.slot_num, booking.slotNumber, booking.slotNo, booking.slotNum
    ),
    slot_id: firstPresent(booking.slot_id, booking.selected_slot_id),
    start_time: firstPresent(booking.start_time, booking.startTime),
    end_time: firstPresent(booking.end_time, booking.endTime),
  }, 0, booking);

  const hasDirectSlot = firstPresent(
    booking.slot_number, booking.selected_slot_number, booking.slot_no,
    booking.slot_num, booking.slotNumber, booking.slotNo, booking.slotNum,
    booking.slot_id, booking.selected_slot_id, booking.start_time, booking.startTime
  ) !== undefined;

  return hasDirectSlot ? [direct] : [];
};

const inferredSlotTimes = (slot) => {
  const normalizeTime = (value) => {
    if (!value) return "";
    const raw = String(value).trim();
    // Already formatted display value, or an ISO timestamp.
    if (/\b(?:AM|PM)\b/i.test(raw)) return raw;
    const match = raw.match(/(?:T|\s)?(\d{1,2}):(\d{2})(?::\d{2})?/);
    if (!match) return raw;
    const hour24 = Number(match[1]);
    const minute = match[2];
    const suffix = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return `${String(hour12).padStart(2, "0")}:${minute} ${suffix}`;
  };

  const start = normalizeTime(slot?.start_time);
  const end = normalizeTime(slot?.end_time);
  if (start && end) return `${start} – ${end}`;
  if (start) return `${start} – ${normalizeTime(slot?.end_time) || "End unavailable"}`;

  const number = Number(slot?.slot_number);
  // PS5 Rush has 30-minute slots from 10:00 AM to 8:00 PM.
  if (Number.isInteger(number) && number >= 1 && number <= 20) {
    const startMinutes = 10 * 60 + (number - 1) * 30;
    const endMinutes = startMinutes + 30;
    const fmt = (minutes) => {
      const hour24 = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const hour12 = hour24 % 12 || 12;
      return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${hour24 >= 12 ? "PM" : "AM"}`;
    };
    return `${fmt(startMinutes)} – ${fmt(endMinutes)}`;
  }
  return "Time unavailable";
};

const bookingTypeOf = (booking) => String(
  booking.booking_type || booking.booking_mode || booking.player_type || booking.mode || "Unknown"
).replaceAll("_", " ").toUpperCase();

const numericValue = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return 0;
};

const entrySlotPrice = (entry) => {
  const type = bookingTypeOf(entry);
  const slotLevelPrice = slotList(entry)
    .map((slot) => numericValue(slot.slot_price, slot.price_per_slot, slot.fee_per_slot, slot.slot_cost))
    .find((price) => price > 0);

  const commonPrice = numericValue(
    entry.slot_price,
    entry.price_per_slot,
    entry.fee_per_slot,
    entry.rate_per_slot,
    entry.slot_cost
  );
  if (commonPrice > 0) return commonPrice;
  if (slotLevelPrice > 0) return slotLevelPrice;

  if (type.includes("DUO")) {
    return numericValue(entry.duo_slot_price, entry.duo_price_per_slot, entry.duo_price, entry.duo_fee);
  }
  if (type.includes("SOLO")) {
    return numericValue(entry.solo_slot_price, entry.solo_price_per_slot, entry.solo_price, entry.solo_fee);
  }
  return 0;
};

const entryFee = (entry) => {
  const explicitLineAmount = numericValue(
    entry.entry_total,
    entry.line_total,
    entry.day_total,
    entry.entry_amount,
    entry.amount_for_entry,
    entry.fee_amount
  );
  if (explicitLineAmount > 0) return explicitLineAmount;

  const pricePerSlot = entrySlotPrice(entry);
  if (pricePerSlot > 0) {
    const count = slotList(entry).length || 1;
    return pricePerSlot * count;
  }

  return numericValue(entry.registration_fee, entry.amount, entry.fee, entry.slot_fee);
};

// Combine rows from one checkout/payment. Each child row stays independently
// reviewable by day and Solo/Duo, while the payment proof/total is shown once.
const groupBookingRows = (rows) => {
  const groups = new Map();

  for (const row of rows) {
    const identity = [row.email, row.phone1, row.gamer_tag, row.player_name]
      .map((v) => String(v || "").trim().toLowerCase()).join("|");
    const explicitGroupId = row.booking_group_id || row.booking_id || row.payment_group_id || row.transaction_id || row.payment_reference;
    const proofValue = row.payment_proof_path || row.payment_proof_url || "";
    const groupRef = explicitGroupId
      ? `group:${String(explicitGroupId)}`
      : proofValue
        ? `proof:${String(proofValue)}`
        : `timestamp:${String(row.created_at || row.id)}`;
    const groupKey = `${identity}|${groupRef}`;
    if (!groups.has(groupKey)) groups.set(groupKey, { ...row, entries: [], groupKey });
    groups.get(groupKey).entries.push(row);
  }

  return [...groups.values()].map((group) => {
    const entries = group.entries;
    const statuses = entries.map((entry) => String(entry.payment_status || "unknown").toLowerCase());
    const allVerified = statuses.length > 0 && statuses.every((status) => status === "verified");
    const allRejected = statuses.length > 0 && statuses.every((status) => status === "rejected");
    const hasPending = statuses.some((status) => ["proof_submitted", "pending"].includes(status));
    const groupStatus = allVerified ? "verified" : allRejected ? "rejected" : hasPending ? "proof_submitted" : "mixed";

    // If Solo/Duo per-slot prices are available, the checkout total MUST be
    // the sum of every day/type entry (price per slot × selected slot count).
    // Some backend rows repeat a partial/individual total in total_fee, so that
    // field must not override the actual multi-entry calculation.
    const explicitTotal = entries.reduce((max, entry) => Math.max(
      max,
      numericValue(entry.total_fee, entry.total_amount, entry.booking_total, entry.payment_amount, entry.p_total_fee)
    ), 0);
    const hasSlotPricing = entries.some((entry) => entrySlotPrice(entry) > 0);
    const hasLineAmounts = entries.some((entry) => numericValue(
      entry.entry_total, entry.line_total, entry.day_total, entry.entry_amount,
      entry.amount_for_entry, entry.fee_amount
    ) > 0);
    const feeValues = entries.map((entry) => numericValue(entry.registration_fee, entry.amount, entry.fee, entry.slot_fee)).filter((n) => n > 0);
    const feesAreIdentical = feeValues.length > 0 && feeValues.every((fee) => fee === feeValues[0]);
    const calculatedEntryTotal = entries.reduce((sum, entry) => sum + entryFee(entry), 0);
    const fallbackFeeTotal = feesAreIdentical
      ? Math.max(...feeValues)
      : feeValues.reduce((sum, fee) => sum + fee, 0);
    // Pricing/line-item data is more specific than a repeated row-level total.
    // Example: Day 2 Duo ₹150 + Day 2 Solo (2 × ₹100) = ₹350.
    const totalFee = (hasSlotPricing || hasLineAmounts)
      ? calculatedEntryTotal
      : (explicitTotal || fallbackFeeTotal);

    return {
      ...group,
      id: group.groupKey,
      entries,
      payment_status: groupStatus,
      registration_fee: totalFee,
      verified_fee: allVerified ? totalFee : 0,
      payment_proof_url: group.payment_proof_url || entries.find((entry) => entry.payment_proof_url)?.payment_proof_url || "",
      payment_proof_path: group.payment_proof_path || entries.find((entry) => entry.payment_proof_path)?.payment_proof_path || "",
    };
  });
};

export default function PS5RushAdmin({ externalAuth = null, onLogout } = {}) {
  const [scholarId, setScholarId] = useState(externalAuth?.scholarId || "");
  const [password, setPassword] = useState(externalAuth?.password || "");
  const [loggedIn, setLoggedIn] = useState(Boolean(externalAuth));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState("");

  const invokeAdmin = useCallback(
    async (action, extra = {}) => {
      if (!supabase) throw new Error("Supabase environment variables are missing.");
      // PS5 bookings and game registrations are served by the deployed
      // quick-processor Edge Function in this project.
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
          const context = invokeError.context;
          if (context && typeof context.clone === "function") {
            const response = context.clone();
            const contentType = response.headers?.get?.("content-type") || "";
            if (contentType.includes("application/json")) {
              const payload = await response.json();
              message = payload?.error || payload?.message || `${message} (HTTP ${response.status})`;
            } else {
              const detail = await response.text();
              message = detail ? `${message}: ${detail.slice(0, 240)}` : `${message} (HTTP ${response.status})`;
            }
          } else if (invokeError.name === "FunctionsFetchError") {
            message = "Could not reach quick-processor. Check VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, network, and that quick-processor is deployed.";
          } else if (invokeError.name === "FunctionsRelayError") {
            message = "Supabase could not relay the request to quick-processor. Check the function deployment and logs.";
          } else if (invokeError.name === "FunctionsHttpError") {
            message = `${message}. Check quick-processor logs for the server-side error.`;
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

  useEffect(() => {
    if (externalAuth?.scholarId && externalAuth?.password) loadBookings();
    // Primitive dependencies prevent repeated reloads if the parent recreates
    // the externalAuth object during panel renders.
  }, [externalAuth?.scholarId, externalAuth?.password, loadBookings]);

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

  const updateBookingStatus = async (booking, nextStatus) => {
    const entries = booking.entries || [booking];
    const actionWord = nextStatus === "verified" ? "VERIFY" : "REJECT";
    const amount = money(booking.registration_fee);
    if (!window.confirm(`${actionWord} the single payment of ${amount} for ${booking.player_name || "this booking"}? This will update all ${entries.length} day-wise/Solo-Duo entries in this payment group.`)) return;

    setBusyId(String(booking.id));
    setError("");
    try {
      // One payment decision applies to every child row in the booking group.
      for (const entry of entries) {
        if (String(entry.payment_status || "").toLowerCase() === nextStatus) continue;
        await invokeAdmin("update_status", {
          booking_id: entry.id,
          payment_status: nextStatus,
        });
      }
      await loadBookings();
    } catch (err) {
      setError(err?.message || `Could not ${actionWord.toLowerCase()} the full booking payment. Refresh and check each entry status.`);
    } finally {
      setBusyId("");
    }
  };

  const visibleBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groupBookingRows(bookings).filter((group) => {
      const entries = group.entries || [group];
      const matchesStatus = statusFilter === "all" || entries.some(
        (entry) => String(entry.payment_status || "").toLowerCase() === statusFilter
      );
      const slots = entries.flatMap((entry) => slotList(entry).map((slot) =>
        `day ${entry.day_number ?? entry.day ?? ""} ${bookingTypeOf(entry)} slot ${slot.slot_number ?? ""} ${slot.start_time || ""}`
      )).join(" ");
      const haystack = [
        group.player_name, group.email, group.phone1, group.phone2, group.gamer_tag,
        group.preferred_game, entries.map((entry) => entry.id).join(" "),
        entries.map((entry) => entry.day_number ?? entry.day ?? "").join(" "),
        entries.map((entry) => entry.payment_status || "").join(" "), slots,
        entries.map(bookingTypeOf).join(" "),
      ].filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && (!q || haystack.includes(q));
    });
  }, [bookings, search, statusFilter]);

  if (!loggedIn && !externalAuth) {
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
        <div className="ps5-admin-brand">
          <img src={logoUrl} alt="NITS Esports logo" />
          <div className="ps5-admin-brand-copy">
            <div className="ps5-kicker">NITS ESPORTS PRESENTS</div>
            <h1>PS5 RUSH BOOKINGS</h1>
            <p>BATTLEBLAZE 2026 · Review bookings and payment screenshots.</p>
          </div>
        </div>
        <div className="ps5-header-actions">
          <button className="ps5-secondary-btn" onClick={loadBookings} disabled={loading}>
            {loading ? "REFRESHING…" : "↻ REFRESH"}
          </button>
          <button
            className="ps5-secondary-btn"
            onClick={() => {
              if (onLogout) onLogout();
              else { setLoggedIn(false); setBookings([]); setPassword(""); setScholarId(""); }
            }}
          >
            LOG OUT
          </button>
        </div>
      </header>

      <section className="ps5-stats">
        <div className="ps5-stat"><span>TOTAL PAYMENT GROUPS</span><strong>{groupBookingRows(bookings).length}</strong></div>
        <div className="ps5-stat"><span>AWAITING PAYMENT REVIEW</span><strong>{groupBookingRows(bookings).filter((b) => b.payment_status === "proof_submitted").length}</strong></div>
        <div className="ps5-stat"><span>VERIFIED PAYMENTS</span><strong>{groupBookingRows(bookings).filter((b) => b.payment_status === "verified").length}</strong></div>
        <div className="ps5-stat"><span>VERIFIED PAYMENT TOTAL</span><strong>{money(groupBookingRows(bookings).reduce((sum, b) => sum + (b.payment_status === "verified" ? Number(b.registration_fee || 0) : 0), 0))}</strong></div>
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
          visibleBookings.map((booking, bookingIndex) => {
            const entries = booking.entries || [booking];
            const status = String(booking.payment_status || "unknown").toLowerCase();
            return (
              <article className="ps5-booking-card" key={entries.map((entry) => entry.id).join("-")}>
                <div className="ps5-booking-top">
                  <div>
                    <div className="ps5-booking-id">S.NO. {bookingIndex + 1} · BOOKING GROUP · {entries.length} ENTRY/ENTRIES</div>
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
                  <div><span>TOTAL REQUESTED</span><strong>{money(booking.registration_fee)}</strong></div>
                  <div><span>VERIFIED AMOUNT</span><strong>{money(booking.verified_fee)}</strong></div>
                  <div><span>REGISTERED AT</span><strong>{booking.created_at ? new Date(booking.created_at).toLocaleString("en-IN") : "—"}</strong></div>
                </div>

                <div className="ps5-slots-panel">
                  <div className="ps5-panel-title">ONE PAYMENT · DAY-WISE / SOLO-DUO BREAKDOWN</div>
                  <div className="ps5-entry-list">
                    {entries.map((entry) => {
                      const slots = slotList(entry).sort((a, b) => Number(a.slot_number ?? 0) - Number(b.slot_number ?? 0));
                      return (
                        <div className="ps5-entry-row" key={entry.id}>
                          <div className="ps5-entry-heading">
                            <strong>S.NO. {bookingIndex + 1} · Day {entry.day_number ?? entry.day ?? "—"} · {bookingTypeOf(entry)}</strong>
                            <span className="ps5-muted">{slots.length} slot(s)</span>
                          </div>
                          <div className="ps5-entry-cost">
                            <span>ENTRY COST · {bookingTypeOf(entry)}</span>
                            <strong>{money(entryFee(entry))}</strong>
                            <small>
                              {entrySlotPrice(entry) > 0
                                ? `${money(entrySlotPrice(entry))} per slot × ${slots.length || 1} slot(s)`
                                : "Using fee supplied by booking record"}
                            </small>
                          </div>
                          <div className="ps5-slot-chips">
                            {slots.length ? slots.map((slot, index) => (
                              <div className="ps5-slot-chip" key={`${entry.id}-${slot.slot_id || slot.slot_number || index}`}>
                                <strong>Slot {slot.slot_number ?? index + 1}</strong>
                                <span>{inferredSlotTimes(slot)}</span>
                              </div>
                            )) : <span className="ps5-muted">Slot details unavailable</span>}
                          </div>
                          <div className="ps5-entry-footer">
                            <span className={`ps5-status ps5-status-${String(entry.payment_status || "unknown").toLowerCase().replace(/[^a-z_]/g, "")}`}>
                              {String(entry.payment_status || "unknown").replaceAll("_", " ")}
                            </span>
                            <span className="ps5-entry-payment-note">Included in the single booking payment above</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="ps5-payment-summary">
                    <div className="ps5-payment-amount">
                      <span>ONE TOTAL PAYMENT</span>
                      <strong>{money(booking.registration_fee)}</strong>
                    </div>
                    <div className="ps5-payment-proof">
                      <span className="ps5-payment-label">PAYMENT PROOF</span>
                      {booking.payment_proof_url ? (
                        <a className="ps5-proof-btn" href={booking.payment_proof_url} target="_blank" rel="noreferrer">↗ VIEW SCREENSHOT</a>
                      ) : <span className="ps5-muted">Screenshot unavailable</span>}
                    </div>
                    <div className="ps5-payment-actions">
                      <div className="ps5-review-actions">
                        <button
                          className="ps5-verify-btn"
                          onClick={() => updateBookingStatus(booking, "verified")}
                          disabled={busyId === String(booking.id) || booking.payment_status === "verified"}
                        >
                          {busyId === String(booking.id) ? "SAVING…" : "✓ VERIFY PAYMENT"}
                        </button>
                        <button
                          className="ps5-reject-btn"
                          onClick={() => updateBookingStatus(booking, "rejected")}
                          disabled={busyId === String(booking.id) || booking.payment_status === "rejected"}
                        >
                          ✕ REJECT PAYMENT
                        </button>
                      </div>
                    </div>
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
.ps5-admin-page{min-height:100vh;background:radial-gradient(ellipse at 12% 0%,rgba(109,40,217,.22),transparent 38%),radial-gradient(ellipse at 100% 40%,rgba(0,234,255,.08),transparent 34%),#05030d;color:#f7f5ff;padding:clamp(14px,2.2vw,28px);font-family:'Rajdhani',system-ui,sans-serif}
.ps5-admin-page *{box-sizing:border-box}.ps5-admin-page button,.ps5-admin-page input,.ps5-admin-page select{font:inherit}
.ps5-kicker{color:#b9a6ff;font:700 10px 'Orbitron',sans-serif;letter-spacing:.2em;text-transform:uppercase}
.ps5-login-card{width:min(100%,440px);margin:7vh auto;padding:clamp(24px,5vw,42px);border:1px solid rgba(139,92,246,.52);border-radius:20px;background:linear-gradient(145deg,rgba(24,13,49,.96),rgba(5,4,17,.98));box-shadow:0 25px 90px #0008,0 0 40px #8b5cf622;text-align:center}
.ps5-emblem{width:66px;height:66px;display:grid;place-items:center;margin:22px auto 16px;border:1px solid #8b5cf6;border-radius:18px;background:linear-gradient(135deg,#8b5cf633,#00eaff15);font:800 24px 'Orbitron',sans-serif;color:#fff;box-shadow:0 0 28px #8b5cf622}
.ps5-login-card h1,.ps5-admin-header h1{font:800 clamp(23px,4vw,36px) 'Orbitron',sans-serif;letter-spacing:.02em;margin:0;background:linear-gradient(100deg,#fff,#d8ccff 55%,#a5f3fc);color:transparent;background-clip:text}
.ps5-subtitle{color:#c5c0d7;font-size:14px;line-height:1.6;margin:12px 0 26px}.ps5-login-form{display:grid;gap:16px;text-align:left}
.ps5-login-form label{display:grid;gap:8px;color:#d9d0ff;font:700 10px 'Orbitron',sans-serif;letter-spacing:.1em}
.ps5-admin-page input,.ps5-admin-page select{width:100%;min-width:0;background:#0b091a;color:#fff;border:1px solid #6d4eb0;border-radius:10px;padding:10px 11px;outline:none}
.ps5-admin-page input:focus,.ps5-admin-page select:focus{border-color:#67e8f9;box-shadow:0 0 0 3px #67e8f922}
.ps5-primary-btn,.ps5-secondary-btn,.ps5-proof-btn,.ps5-verify-btn,.ps5-reject-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:9px;padding:9px 11px;text-decoration:none;font:700 9px 'Orbitron',sans-serif;letter-spacing:.07em;cursor:pointer;transition:transform .18s ease,filter .18s ease}
.ps5-primary-btn{border:1px solid #b5a1ff;color:#fff;background:linear-gradient(100deg,#6d28d9,#8b5cf6,#2563eb);margin-top:4px}.ps5-primary-btn:disabled,.ps5-admin-page button:disabled{opacity:.55;cursor:not-allowed}
.ps5-security-note,.ps5-footer-note{color:#9d96b6;font-size:12px;line-height:1.6;margin:20px 0 0}.ps5-error{padding:11px 13px;border:1px solid #f87171a6;border-radius:9px;color:#fecaca;background:#7f1d1d33;font-size:13px}.ps5-error-wide{margin:18px 0}
.ps5-admin-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;max-width:1440px;margin:0 auto 20px;flex-wrap:wrap}.ps5-admin-brand{display:flex;align-items:center;gap:16px;min-width:0}.ps5-admin-brand>img{width:58px;height:58px;object-fit:contain;flex-shrink:0}.ps5-admin-brand-copy{min-width:0}.ps5-admin-header p{color:#b9b2ce;margin:8px 0 0;font-size:12px}.ps5-header-actions{display:flex;gap:10px;flex-wrap:wrap}
.ps5-secondary-btn{border:1px solid #69518e;background:#100b22;color:#eee8ff}.ps5-stats{max-width:1440px;margin:0 auto 20px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.ps5-stat{padding:14px;border:1px solid #6d4eb04f;border-radius:13px;background:linear-gradient(145deg,#17102b,#090714)}.ps5-stat span,.ps5-detail-grid span{display:block;color:#a99ccf;font:700 8px 'Orbitron',sans-serif;letter-spacing:.1em}.ps5-stat strong{display:block;margin-top:7px;font:800 clamp(16px,1.8vw,22px) 'Orbitron',sans-serif;color:#fff;overflow-wrap:anywhere}
.ps5-toolbar{max-width:1440px;margin:0 auto 18px;display:grid;grid-template-columns:minmax(220px,1fr) 190px auto;gap:9px;align-items:center}.ps5-toolbar>span{color:#bdb4d6;font-size:11px;text-align:right}
.ps5-booking-list{max-width:1440px;margin:0 auto;display:grid;gap:12px}.ps5-booking-card{border:1px solid #6d4eb05c;border-radius:14px;padding:clamp(13px,1.6vw,19px);background:linear-gradient(145deg,#120d24f5,#070610f7 70%,#07121cf2);box-shadow:0 14px 35px #0003}
.ps5-booking-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding-bottom:12px;border-bottom:1px solid #8b5cf629}.ps5-booking-id{font-size:10px;color:#9d8bcf;overflow-wrap:anywhere}.ps5-booking-top h2{font:700 clamp(15px,1.7vw,19px) 'Orbitron',sans-serif;margin:6px 0}.ps5-booking-top p{font-size:11px;color:#bdb5d1;margin:0;overflow-wrap:anywhere}
.ps5-status{display:inline-flex;white-space:nowrap;padding:7px 10px;border-radius:99px;font:700 9px 'Orbitron',sans-serif;text-transform:uppercase;border:1px solid #a78bfa66;background:#8b5cf61c;color:#ddd6fe}.ps5-status-verified{border-color:#34d39988;background:#10b9811b;color:#6ee7b7}.ps5-status-mixed{border-color:#fbbf2488;background:#f59e0b1a;color:#fde68a}.ps5-status-rejected{border-color:#fb718588;background:#ef44441a;color:#fca5a5}
.ps5-detail-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:14px 0}.ps5-detail-grid>div{min-width:0}.ps5-detail-grid strong{display:block;margin-top:6px;font-size:12px;color:#f7f5ff;overflow-wrap:anywhere}
.ps5-entry-list{display:grid;gap:12px}.ps5-entry-row{padding:12px;border:1px solid #ffffff1c;border-radius:10px;background:#0b0918}.ps5-entry-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.ps5-entry-heading>strong{font:700 11px 'Orbitron',sans-serif;color:#f3edff}.ps5-entry-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:12px;color:#c5c0d7;font-size:12px}.ps5-slots-panel{border:1px solid #8b5cf62c;background:#080714a8;border-radius:10px;padding:12px}.ps5-panel-title{font:700 10px 'Orbitron',sans-serif;letter-spacing:.12em;color:#c4b5fd;margin-bottom:12px}.ps5-slot-chips{display:flex;flex-wrap:wrap;gap:7px}.ps5-slot-chip{display:grid;gap:3px;border:1px solid #67e8f93a;border-radius:9px;background:#0c1720;padding:7px 9px}.ps5-slot-chip strong{font:700 11px 'Orbitron',sans-serif;color:#a5f3fc}.ps5-slot-chip span{font-size:11px;color:#d5d2e4}.ps5-muted{color:#a6a0bb;font-size:13px}
.ps5-booking-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:12px}.ps5-proof-btn{border:1px solid #67e8f977;background:#06b6d422;color:#a5f3fc}.ps5-proof-missing{color:#fca5a5;font-size:11px}.ps5-review-actions{display:flex;gap:9px;flex-wrap:wrap}.ps5-verify-btn{border:1px solid #34d39977;background:#05966924;color:#6ee7b7}.ps5-reject-btn{border:1px solid #fb718577;background:#dc262624;color:#fca5a5}.ps5-empty{padding:28px;text-align:center;border:1px dashed #6d4eb066;border-radius:14px;color:#b9b2ce}
.ps5-payment-summary{display:grid;grid-template-columns:minmax(130px,.75fr) minmax(150px,.8fr) auto;align-items:center;gap:14px;padding:12px;margin-bottom:12px;border:1px solid #34d39955;border-radius:10px;background:#061b1733}.ps5-payment-summary>div>span{display:block;color:#a99ccf;font:700 8px 'Orbitron',sans-serif;letter-spacing:.08em;margin-bottom:6px}.ps5-payment-amount>strong{font:800 22px 'Orbitron',sans-serif;color:#6ee7b7}.ps5-payment-verified>strong{font:800 16px 'Orbitron',sans-serif;color:#f7f5ff}.ps5-payment-proof{min-width:0}.ps5-payment-summary .ps5-payment-label{font-size:7px;letter-spacing:.06em;color:#9d96b6;margin-bottom:6px}.ps5-payment-summary .ps5-proof-btn{font-size:8px;letter-spacing:.03em;padding:8px 9px;white-space:nowrap}.ps5-payment-actions{justify-self:end}.ps5-payment-actions .ps5-review-actions{gap:7px;justify-content:flex-end}.ps5-entry-row{padding:12px;border:1px solid #8b5cf629;border-radius:10px;background:#0b0918}.ps5-entry-heading{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.ps5-entry-heading strong{font:700 11px 'Orbitron',sans-serif;color:#ddd6fe}.ps5-entry-footer{display:flex}.ps5-entry-payment-note{margin-left:auto;color:#8f88a8;font-size:10px}
@media(max-width:900px){.ps5-detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ps5-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.ps5-toolbar{grid-template-columns:1fr 170px}.ps5-toolbar>span{grid-column:1/-1;text-align:left}}
/* Keep action buttons compact even when global site button styles are present. */
.ps5-admin-page .ps5-header-actions .ps5-secondary-btn,
.ps5-admin-page .ps5-review-actions .ps5-verify-btn,
.ps5-admin-page .ps5-review-actions .ps5-reject-btn{
  width:auto !important;
  min-width:0 !important;
  min-height:0 !important;
  height:34px !important;
  padding:7px 10px !important;
  font-family:'Orbitron',sans-serif !important;
  font-size:9px !important;
  line-height:1.15 !important;
  letter-spacing:.04em !important;
  font-weight:700 !important;
  border-radius:7px !important;
  box-shadow:none !important;
  transform:none;
}
.ps5-admin-page .ps5-header-actions{gap:7px}
.ps5-admin-page .ps5-review-actions{gap:7px}
.ps5-admin-page .ps5-review-actions .ps5-verify-btn,
.ps5-admin-page .ps5-review-actions .ps5-reject-btn{height:32px !important;padding:6px 9px !important}
.ps5-admin-page .ps5-header-actions .ps5-secondary-btn:hover,
.ps5-admin-page .ps5-review-actions .ps5-verify-btn:hover,
.ps5-admin-page .ps5-review-actions .ps5-reject-btn:hover{filter:brightness(1.08)}
.ps5-entry-cost{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin:0 0 10px;color:#c5c0d7;font-size:11px}.ps5-entry-cost>span{font:700 8px 'Orbitron',sans-serif;color:#a99ccf;letter-spacing:.08em}.ps5-entry-cost>strong{font:800 15px 'Orbitron',sans-serif;color:#6ee7b7}.ps5-entry-cost small{color:#9d96b6;font-size:10px}.ps5-entry-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid #8b5cf629}.ps5-entry-footer .ps5-review-actions{margin-left:auto}@media(max-width:900px){.ps5-payment-summary{grid-template-columns:1fr 1fr}.ps5-payment-actions{justify-self:stretch;grid-column:1/-1}.ps5-payment-actions .ps5-review-actions{justify-content:flex-start}}
@media(max-width:600px){.ps5-payment-summary{grid-template-columns:1fr}.ps5-payment-actions{grid-column:auto}.ps5-payment-summary .ps5-review-actions{width:100%;display:flex;flex-wrap:wrap}.ps5-payment-summary .ps5-review-actions button{flex:1}.ps5-admin-page{padding:12px}.ps5-admin-header{display:grid}.ps5-admin-brand{align-items:flex-start}.ps5-admin-brand>img{width:56px;height:56px}.ps5-header-actions{width:100%}.ps5-header-actions button{flex:1}.ps5-toolbar{grid-template-columns:1fr}.ps5-detail-grid{grid-template-columns:1fr 1fr;gap:12px}.ps5-booking-top{display:grid}.ps5-status{justify-self:start}.ps5-booking-actions,.ps5-review-actions{width:100%}.ps5-proof-btn{width:100%}.ps5-review-actions button{flex:1}.ps5-stat{padding:11px}}
`;

