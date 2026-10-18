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
// VRXperience schedule is calculated from the resolved slot number.
const dayOf = (item) => {
  const direct = firstPresent(
    item?.day_number, item?.day, item?.day_no, item?.dayNumber,
    item?.day_index, item?.day_id, item?.selected_day, item?.selectedDay
  );
  if (direct !== undefined) {
    const match = String(direct).match(/\d+/);
    if (match) return Number(match[0]);
  }

  // Some payloads encode the day in a property/key, e.g. day_1_slots.
  const keyText = [
    item?.key, item?.name, item?.label, item?.day_key,
    item?.day_name, item?.booking_day
  ].filter(Boolean).join(" ");
  const match = keyText.match(/\bday[\s_-]*(\d+)\b/i);
  return match ? Number(match[1]) : undefined;
};

const slotList = (booking) => {
  const directFields = [
    "booked_slots", "slot_details", "slot_data", "day_slots",
    "selected_slots", "slots", "slot_numbers", "slot_ids",
    "selected_slot", "selected_slot_id", "vr_slots", "vr_slot_ids",
    "steering_slots", "steering_slot_ids", "steering_wheel_slots",
    "steering_wheel_slot_ids"
  ];

  const result = [];
  const seen = new Set();

  const addSlot = (rawSlot, index, inherited = {}) => {
    if (rawSlot === undefined || rawSlot === null || rawSlot === "") return;
    const raw = rawSlot && typeof rawSlot === "object" ? rawSlot : { slot: rawSlot };
    const merged = { ...inherited, ...raw };
    const nestedKeys = ["slots", "slot_ids", "selected_slots", "booked_slots", "slot_numbers", "slot_details"];
    const nested = nestedKeys.find((key) => Array.isArray(merged[key]) || (merged[key] && typeof merged[key] === "object"));
    if (nested) {
      const nestedValue = merged[nested];
      const list = Array.isArray(nestedValue) ? nestedValue : Object.entries(nestedValue).map(([key, value]) => (
        value && typeof value === "object" ? { key, ...value } : { key, slot: value }
      ));
      list.forEach((child, childIndex) => addSlot(child, childIndex, {
        day_number: dayOf(merged) ?? dayOf(inherited),
        setup_type: setupTypeOf(merged) || setupTypeOf(inherited),
        start_time: merged.start_time ?? merged.startTime,
        end_time: merged.end_time ?? merged.endTime,
        slot_price: merged.slot_price ?? merged.price_per_slot ?? merged.fee_per_slot,
      }));
      return;
    }

    const number = toSlotNumber(merged);
    const day = dayOf(merged) ?? dayOf(inherited) ?? dayOf(booking);
    const setup = setupTypeOf(merged) || setupTypeOf(inherited);
    const normalized = {
      ...merged,
      slot_number: number ?? (index + 1),
      slot_id: firstPresent(merged.slot_id, merged.slotId, merged.id, merged.slot_uuid),
      day_number: day,
      setup_type: setup || undefined,
      start_time: firstPresent(
        merged.start_time, merged.startTime, merged.start, merged.from_time,
        merged.from, merged.slot_start, merged.start_at, merged.starts_at,
        inherited.start_time, inherited.startTime, booking.start_time, booking.startTime
      ),
      end_time: firstPresent(
        merged.end_time, merged.endTime, merged.end, merged.to_time,
        merged.to, merged.slot_end, merged.end_at, merged.ends_at,
        inherited.end_time, inherited.endTime, booking.end_time, booking.endTime
      ),
      slot_price: firstPresent(
        merged.slot_price, merged.price_per_slot, merged.fee_per_slot,
        merged.slot_cost, merged.price, inherited.slot_price
      ),
    };
    const identity = `${String(normalized.day_number ?? "")}|${normalized.setup_type || ""}|${String(normalized.slot_id ?? "")}|${String(normalized.slot_number)}|${String(normalized.start_time ?? "")}`;
    if (!seen.has(identity)) {
      seen.add(identity);
      result.push(normalized);
    }
  };

  directFields.forEach((field) => {
    const value = booking?.[field];
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => addSlot(item, index, {
        day_number: dayOf(booking),
        setup_type: setupTypeOf(booking),
      }));
      return;
    }

    if (typeof value === "object") {
      Object.entries(value).forEach(([key, item], index) => {
        const dayMatch = key.match(/\bday[\s_-]*(\d+)\b/i);
        const inherited = {
          day_number: dayMatch ? Number(dayMatch[1]) : dayOf(booking),
          setup_type: setupTypeOf(booking),
        };
        if (item && typeof item === "object") addSlot({ key, ...item }, index, inherited);
        else addSlot({ key, slot: item }, index, inherited);
      });
      return;
    }

    const parsed = parseArray(value);
    parsed.forEach((item, index) => addSlot(item, index, {
      day_number: dayOf(booking),
      setup_type: setupTypeOf(booking),
    }));
  });

  // Also inspect separate day/setup-specific fields even if `day_slots` was absent.
  Object.entries(booking || {}).forEach(([key, value]) => {
    if (!/(day|slot)/i.test(key) || value === undefined || value === null) return;
    const dayMatch = key.match(/\bday[\s_-]*(\d+)\b/i);
    const type = /steer|wheel/i.test(key) ? "STEERING WHEEL" : /\bvr\b/i.test(key) ? "VR" : setupTypeOf(booking);
    const inherited = {
      day_number: dayMatch ? Number(dayMatch[1]) : dayOf(booking),
      setup_type: type,
    };
    if (Array.isArray(value)) value.forEach((item, index) => addSlot(item, index, inherited));
    else if (typeof value === "object") {
      Object.entries(value).forEach(([subKey, item], index) => {
        const nestedDay = subKey.match(/\bday[\s_-]*(\d+)\b/i);
        addSlot(item && typeof item === "object" ? { key: subKey, ...item } : { key: subKey, slot: item }, index, {
          ...inherited,
          day_number: nestedDay ? Number(nestedDay[1]) : inherited.day_number,
        });
      });
    }
  });

  if (result.length) return result;

  const directNumber = firstPresent(
    booking.slot_number, booking.selected_slot_number, booking.slot_no,
    booking.slot_num, booking.slotNumber, booking.slotNo, booking.slotNum,
    booking.slot_id, booking.selected_slot_id
  );
  if (directNumber !== undefined) {
    addSlot({
      slot_number: directNumber,
      start_time: booking.start_time ?? booking.startTime,
      end_time: booking.end_time ?? booking.endTime,
      day_number: dayOf(booking),
      setup_type: setupTypeOf(booking),
    }, 0, {});
  }
  return result;
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
  // VRXperience has 30-minute slots from 10:00 AM to 8:00 PM.
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

const normalizedSetupType = (value) => {
  const text = String(value || "").replaceAll("_", " ").trim().toUpperCase();
  if (!text) return "";
  if (text.includes("STEERING") || text.includes("WHEEL")) return "STEERING WHEEL";
  if (text === "VR" || text.includes("VR EXPERIENCE") || text.includes("VRXPERIENCE")) return "VR";
  if (text.includes("MIX")) return "MIXED";
  return text;
};

const setupTypeOf = (item, fallback = "") =>
  normalizedSetupType(
    item?.setup_type ?? item?.experience_type ?? item?.experience_mode ??
    item?.station_type ?? item?.device_type ?? item?.booking_type ??
    item?.booking_mode ?? item?.player_type ?? item?.mode ?? fallback
  );

// Use the robust dayOf helper declared above so day labels and numeric values normalize consistently.
const slotPriceOf = (entry, slot, setupType = setupTypeOf(entry)) => {
  const direct = numericValue(
    slot?.slot_price, slot?.price_per_slot, slot?.fee_per_slot, slot?.slot_cost,
    slot?.price, slot?.fee, slot?.amount
  );
  if (direct > 0) return direct;

  const entryDirect = numericValue(
    entry?.slot_price, entry?.price_per_slot, entry?.fee_per_slot,
    entry?.rate_per_slot, entry?.slot_cost
  );
  if (entryDirect > 0) return entryDirect;

  if (setupType === "VR") {
    return numericValue(entry?.vr_slot_price, entry?.vr_price_per_slot, entry?.vr_price, entry?.vr_fee);
  }
  if (setupType === "STEERING WHEEL") {
    return numericValue(
      entry?.steering_wheel_slot_price, entry?.steering_slot_price,
      entry?.steering_wheel_price_per_slot, entry?.steering_price_per_slot,
      entry?.steering_wheel_price, entry?.steering_price, entry?.wheel_fee
    );
  }
  return entrySlotPrice(entry);
};

// Expand a mixed entry into VR and Steering Wheel line items when the payload
// contains per-slot setup metadata. Never guess which setup a slot belongs to.
const expandEntriesForDisplay = (entries) => {
  const result = [];

  for (const entry of entries) {
    const parentType = setupTypeOf(entry, bookingTypeOf(entry));
    const slots = slotList(entry);

    // Prefer the per-slot day and setup values. This is essential when one
    // checkout contains multiple days and both VR and Steering Wheel.
    const hasUsefulSlotMetadata = slots.some((slot) =>
      dayOf(slot) !== undefined ||
      setupTypeOf(slot) === "VR" ||
      setupTypeOf(slot) === "STEERING WHEEL"
    );

    if (slots.length && (parentType === "MIXED" || hasUsefulSlotMetadata)) {
      const groups = new Map();

      slots.forEach((slot, index) => {
        const day = dayOf(slot) ?? dayOf(entry);
        const type = setupTypeOf(slot) || (parentType !== "MIXED" ? parentType : "TYPE NOT PROVIDED");
        const key = `${day ?? "—"}|${type}`;
        if (!groups.has(key)) {
          groups.set(key, {
            ...entry,
            day_number: day,
            display_type: type,
            display_slots: [],
          });
        }
        groups.get(key).display_slots.push(slot);
      });

      for (const item of groups.values()) {
        const priceSum = item.display_slots.reduce(
          (sum, slot) => sum + slotPriceOf(entry, slot, item.display_type), 0
        );
        item.display_fee = priceSum > 0
          ? priceSum
          : item.display_slots.length * slotPriceOf(entry, {}, item.display_type);
        if (!item.display_fee && item.display_slots.length === slots.length) {
          item.display_fee = entryFee(entry);
        }
        result.push(item);
      }
    } else {
      result.push({
        ...entry,
        day_number: dayOf(entry) ?? (slots.length ? dayOf(slots[0]) : undefined),
        display_type: parentType || "TYPE NOT PROVIDED",
        display_slots: slots,
        display_fee: entryFee(entry),
      });
    }
  }

  return result;
};

const daySetupBreakdown = (entries) => {
  const expanded = expandEntriesForDisplay(entries);
  const days = new Map();
  expanded.forEach((entry) => {
    const day = entry.day_number ?? dayOf((entry.display_slots || [])[0]) ?? "—";
    if (!days.has(String(day))) {
      days.set(String(day), { day, vr: 0, steering: 0, other: 0, total: 0, vrSlots: 0, steeringSlots: 0 });
    }
    const item = days.get(String(day));
    const type = entry.display_type || setupTypeOf(entry);
    const fee = numericValue(entry.display_fee, entryFee(entry));
    const slotCount = (entry.display_slots || slotList(entry)).length;
    if (type === "VR") {
      item.vr += fee;
      item.vrSlots += slotCount;
    } else if (type === "STEERING WHEEL") {
      item.steering += fee;
      item.steeringSlots += slotCount;
    } else {
      item.other += fee;
    }
    item.total += fee;
  });
  return [...days.values()].sort((a, b) => {
    const an = Number(a.day), bn = Number(b.day);
    if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
    return String(a.day).localeCompare(String(b.day));
  });
};


export default function VRXperienceAdmin({ externalAuth = null, onLogout } = {}) {
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
      // VRXperience bookings are expected to be served by the deployed
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
      const result = await invokeAdmin("list_vrxperience_bookings");
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
    if (!window.confirm(`${actionWord} the single payment of ${amount} for ${booking.player_name || "this booking"}? This will update all ${entries.length} day-wise VR/Steering Wheel entries in this payment group.`)) return;

    setBusyId(String(booking.id));
    setError("");
    try {
      // One payment decision applies to every child row in the booking group.
      for (const entry of entries) {
        if (String(entry.payment_status || "").toLowerCase() === nextStatus) continue;
        await invokeAdmin("update_vrxperience_status", {
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
      <main className="vrx-admin-page">
        <style>{styles}</style>
        <section className="vrx-login-card">
          <div className="vrx-kicker">BATTLEBLAZE 2026 · RESTRICTED ACCESS</div>
          <div className="vrx-emblem">BB</div>
          <h1>VRXPERIENCE ADMIN</h1>
          <p className="vrx-subtitle">
            Sign in with an authorized scholar ID to review registrations and payment proofs.
          </p>
          <form onSubmit={handleLogin} className="vrx-login-form">
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
            {error && <div className="vrx-error">{error}</div>}
            <button className="vrx-primary-btn" disabled={loading}>
              {loading ? "AUTHENTICATING…" : "LOGIN TO ADMIN PANEL"}
            </button>
          </form>
          <p className="vrx-security-note">
            Authorized access only. Credentials are checked by a server-side Edge Function.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="vrx-admin-page">
      <style>{styles}</style>
      <header className="vrx-admin-header">
        <div className="vrx-admin-brand">
          <img src={logoUrl} alt="NITS Esports logo" />
          <div className="vrx-admin-brand-copy">
            <div className="vrx-kicker">NITS ESPORTS PRESENTS</div>
            <h1>VRXPERIENCE BOOKINGS</h1>
            <p>BATTLEBLAZE 2026 · Review bookings and payment screenshots.</p>
          </div>
        </div>
        <div className="vrx-header-actions">
          <button className="vrx-secondary-btn" onClick={loadBookings} disabled={loading}>
            {loading ? "REFRESHING…" : "↻ REFRESH"}
          </button>
          <button
            className="vrx-secondary-btn"
            onClick={() => {
              if (onLogout) onLogout();
              else { setLoggedIn(false); setBookings([]); setPassword(""); setScholarId(""); }
            }}
          >
            LOG OUT
          </button>
        </div>
      </header>

      <section className="vrx-stats">
        <div className="vrx-stat"><span>TOTAL PAYMENT GROUPS</span><strong>{groupBookingRows(bookings).length}</strong></div>
        <div className="vrx-stat"><span>AWAITING PAYMENT REVIEW</span><strong>{groupBookingRows(bookings).filter((b) => b.payment_status === "proof_submitted").length}</strong></div>
        <div className="vrx-stat"><span>VERIFIED PAYMENTS</span><strong>{groupBookingRows(bookings).filter((b) => b.payment_status === "verified").length}</strong></div>
        <div className="vrx-stat"><span>VERIFIED PAYMENT TOTAL</span><strong>{money(groupBookingRows(bookings).reduce((sum, b) => sum + (b.payment_status === "verified" ? Number(b.registration_fee || 0) : 0), 0))}</strong></div>
      </section>

      <section className="vrx-toolbar">
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

      {error && <div className="vrx-error vrx-error-wide">{error}</div>}

      <section className="vrx-booking-list">
        {loading && bookings.length === 0 ? (
          <div className="vrx-empty">Loading bookings…</div>
        ) : visibleBookings.length === 0 ? (
          <div className="vrx-empty">No bookings match this filter.</div>
        ) : (
          visibleBookings.map((booking, bookingIndex) => {
            const entries = booking.entries || [booking];
            const status = String(booking.payment_status || "unknown").toLowerCase();
            // Only show rows with a real day value. Do not render placeholder
            // rows or fabricate a day for older bookings whose metadata is absent.
            const dayRows = daySetupBreakdown(entries).filter((row) => row.day !== "—" && row.day !== undefined && row.day !== null);
            const displayEntries = expandEntriesForDisplay(entries).filter((entry) => {
              const slots = entry.display_slots || slotList(entry);
              const day = entry.day_number ?? dayOf(entry) ?? dayOf(slots[0]);
              return day !== undefined && day !== null && day !== "—";
            });
            return (
              <article className="vrx-booking-card" key={entries.map((entry) => entry.id).join("-")}>
                <div className="vrx-booking-top">
                  <div>
                    <div className="vrx-booking-id">S.NO. {bookingIndex + 1} · COMPLETE BOOKING · {booking.player_name || "Unnamed player"} · {entries.length} ENTRY/ENTRIES</div>
                    <h2>{booking.player_name || "Unnamed player"}</h2>
                    <p>{booking.email || "No email"} · {booking.phone1 || "No phone"}</p>
                  </div>
                  <span className={`vrx-status vrx-status-${status.replace(/[^a-z_]/g, "")}`}>
                    {status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="vrx-detail-grid">
                  <div><span>EMAIL</span><strong>{booking.email || "—"}</strong></div>
                  <div><span>PHONE 1</span><strong>{booking.phone1 || "—"}</strong></div>
                  <div><span>PHONE 2</span><strong>{booking.phone2 || "—"}</strong></div>
                  <div><span>PLAYER PHONE / SETUP</span><strong>{booking.setup_type || booking.experience_type || booking.booking_type || "—"}</strong></div>
                  <div><span>SETUP TYPE</span><strong>{booking.setup_type || booking.experience_type || "—"}</strong></div>
                  <div><span>TOTAL REQUESTED</span><strong>{money(booking.registration_fee)}</strong></div>
                  <div><span>VERIFIED AMOUNT</span><strong>{money(booking.verified_fee)}</strong></div>
                  <div><span>REGISTERED AT</span><strong>{booking.created_at ? new Date(booking.created_at).toLocaleString("en-IN") : "—"}</strong></div>
                </div>

                <div className="vrx-slots-panel">
                  <div className="vrx-panel-title">ONE PAYMENT · COMPLETE DAY-WISE VR / STEERING WHEEL BREAKDOWN</div>
                  <div className="vrx-day-summary">
                    <div className="vrx-day-summary-title">COMPLETE BOOKING BREAKDOWN · EACH DAY + EACH SETUP</div>
                    <div className="vrx-day-summary-table">
                      <div className="vrx-day-summary-row vrx-day-summary-head">
                        <span>DAY NO.</span><span>VR TOTAL</span><span>STEERING WHEEL TOTAL</span><span>DAY TOTAL</span>
                      </div>
                      {dayRows.length > 0 ? (
                        <>
                          {dayRows.map((dayRow) => (
                            <div className="vrx-day-summary-row" key={`day-summary-${dayRow.day}`}>
                              <strong>{`Day ${dayRow.day}`}</strong>
                              <span>
                                {money(dayRow.vr)}
                                <small>{dayRow.vrSlots} slot(s)</small>
                              </span>
                              <span>
                                {money(dayRow.steering)}
                                <small>{dayRow.steeringSlots} slot(s)</small>
                              </span>
                              <strong>{money(dayRow.total)}</strong>
                            </div>
                          ))}
                          <div className="vrx-day-summary-row vrx-day-summary-grand">
                            <strong>ALL DAYS</strong>
                            <strong>{money(dayRows.reduce((sum, day) => sum + day.vr, 0))}</strong>
                            <strong>{money(dayRows.reduce((sum, day) => sum + day.steering, 0))}</strong>
                            <strong>{money(dayRows.reduce((sum, day) => sum + day.total, 0))}</strong>
                          </div>
                        </>
                      ) : (
                        <div className="vrx-muted" style={{ padding: "12px 4px" }}>
                          Day-wise breakdown is unavailable for this booking.
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="vrx-entry-list">
                    {displayEntries.length ? displayEntries.map((entry, displayIndex) => {
                      const slots = (entry.display_slots || slotList(entry)).slice().sort(
                        (a, b) => Number(a.slot_number ?? 0) - Number(b.slot_number ?? 0)
                      );
                      const displayType = entry.display_type || setupTypeOf(entry) || "TYPE NOT PROVIDED";
                      const displayDay = entry.day_number ?? dayOf(entry) ?? "—";
                      const displayFee = numericValue(entry.display_fee, entryFee(entry));
                      const perSlot = slots.length ? displayFee / slots.length : 0;
                      return (
                        <div className="vrx-entry-row" key={`${entry.id || "entry"}-${displayDay}-${displayType}-${displayIndex}`}>
                          <div className="vrx-entry-heading">
                            <strong>
                              {`DAY ${displayDay}`} · SETUP: {displayType}
                            </strong>
                            <span className="vrx-muted">{slots.length} slot(s)</span>
                          </div>

                          <div className="vrx-entry-cost">
                            <span>{`DAY ${displayDay}`} · {displayType} · ENTRY TOTAL</span>
                            <strong>{money(displayFee)}</strong>
                            <small>
                              {slots.length
                                ? `${money(perSlot)} per slot × ${slots.length} slot(s)`
                                : "No slot details returned by the booking record"}
                            </small>
                          </div>

                          <div className="vrx-slot-chips">
                            {slots.length ? slots.map((slot, index) => (
                              <div className="vrx-slot-chip" key={`${entry.id || displayIndex}-${slot.slot_id || slot.slot_number || index}`}>
                                <strong>SLOT NO. {slot.slot_number ?? index + 1}</strong>
                                <span>TIME: {inferredSlotTimes(slot)}</span>
                                <small>{dayOf(slot) ?? displayDay} · {setupTypeOf(slot) || displayType} · {money(slotPriceOf(entry, slot, displayType) || perSlot)} / SLOT</small>
                              </div>
                            )) : <span className="vrx-muted">Slot number/time not returned by backend for Day {displayDay} · {displayType}</span>}
                          </div>

                          <div className="vrx-entry-footer">
                            <span className={`vrx-status vrx-status-${String(entry.payment_status || "unknown").toLowerCase().replace(/[^a-z_]/g, "")}`}>
                              {String(entry.payment_status || "unknown").replaceAll("_", " ")}
                            </span>
                            <span className="vrx-entry-payment-note">
                              DAY {displayDay} TOTAL · {displayType} · {money(displayFee)}
                            </span>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="vrx-muted" style={{ padding: "12px 4px" }}>
                        Slot details are unavailable for this booking.
                      </div>
                    )}
                  </div>
                  <div className="vrx-payment-summary">
                    <div className="vrx-payment-amount">
                      <span>ONE TOTAL PAYMENT</span>
                      <strong>{money(booking.registration_fee)}</strong>
                    </div>
                    <div className="vrx-payment-proof">
                      <span className="vrx-payment-label">PAYMENT PROOF</span>
                      {booking.payment_proof_url ? (
                        <a className="vrx-proof-btn" href={booking.payment_proof_url} target="_blank" rel="noreferrer">↗ VIEW SCREENSHOT</a>
                      ) : <span className="vrx-muted">Screenshot unavailable</span>}
                    </div>
                    <div className="vrx-payment-actions">
                      <div className="vrx-review-actions">
                        <button
                          className="vrx-verify-btn"
                          onClick={() => updateBookingStatus(booking, "verified")}
                          disabled={busyId === String(booking.id) || booking.payment_status === "verified"}
                        >
                          {busyId === String(booking.id) ? "SAVING…" : "✓ VERIFY PAYMENT"}
                        </button>
                        <button
                          className="vrx-reject-btn"
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
      <p className="vrx-footer-note">
        Verify only after checking the actual payment proof. Updating status records the admin decision; it does not refund or alter the VRXperience slot reservation.
      </p>
    </main>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Rajdhani:wght@400;500;600;700&display=swap');
.vrx-admin-page{min-height:100vh;background:radial-gradient(ellipse at 12% 0%,rgba(109,40,217,.22),transparent 38%),radial-gradient(ellipse at 100% 40%,rgba(0,234,255,.08),transparent 34%),#05030d;color:#f7f5ff;padding:clamp(14px,2.2vw,28px);font-family:'Rajdhani',system-ui,sans-serif}
.vrx-admin-page *{box-sizing:border-box}.vrx-admin-page button,.vrx-admin-page input,.vrx-admin-page select{font:inherit}
.vrx-kicker{color:#b9a6ff;font:700 10px 'Orbitron',sans-serif;letter-spacing:.2em;text-transform:uppercase}
.vrx-login-card{width:min(100%,440px);margin:7vh auto;padding:clamp(24px,5vw,42px);border:1px solid rgba(139,92,246,.52);border-radius:20px;background:linear-gradient(145deg,rgba(24,13,49,.96),rgba(5,4,17,.98));box-shadow:0 25px 90px #0008,0 0 40px #8b5cf622;text-align:center}
.vrx-emblem{width:66px;height:66px;display:grid;place-items:center;margin:22px auto 16px;border:1px solid #8b5cf6;border-radius:18px;background:linear-gradient(135deg,#8b5cf633,#00eaff15);font:800 24px 'Orbitron',sans-serif;color:#fff;box-shadow:0 0 28px #8b5cf622}
.vrx-login-card h1,.vrx-admin-header h1{font:800 clamp(23px,4vw,36px) 'Orbitron',sans-serif;letter-spacing:.02em;margin:0;background:linear-gradient(100deg,#fff,#d8ccff 55%,#a5f3fc);color:transparent;background-clip:text}
.vrx-subtitle{color:#c5c0d7;font-size:14px;line-height:1.6;margin:12px 0 26px}.vrx-login-form{display:grid;gap:16px;text-align:left}
.vrx-login-form label{display:grid;gap:8px;color:#d9d0ff;font:700 10px 'Orbitron',sans-serif;letter-spacing:.1em}
.vrx-admin-page input,.vrx-admin-page select{width:100%;min-width:0;background:#0b091a;color:#fff;border:1px solid #6d4eb0;border-radius:10px;padding:10px 11px;outline:none}
.vrx-admin-page input:focus,.vrx-admin-page select:focus{border-color:#67e8f9;box-shadow:0 0 0 3px #67e8f922}
.vrx-primary-btn,.vrx-secondary-btn,.vrx-proof-btn,.vrx-verify-btn,.vrx-reject-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:9px;padding:9px 11px;text-decoration:none;font:700 9px 'Orbitron',sans-serif;letter-spacing:.07em;cursor:pointer;transition:transform .18s ease,filter .18s ease}
.vrx-primary-btn{border:1px solid #b5a1ff;color:#fff;background:linear-gradient(100deg,#6d28d9,#8b5cf6,#2563eb);margin-top:4px}.vrx-primary-btn:disabled,.vrx-admin-page button:disabled{opacity:.55;cursor:not-allowed}
.vrx-security-note,.vrx-footer-note{color:#9d96b6;font-size:12px;line-height:1.6;margin:20px 0 0}.vrx-error{padding:11px 13px;border:1px solid #f87171a6;border-radius:9px;color:#fecaca;background:#7f1d1d33;font-size:13px}.vrx-error-wide{margin:18px 0}
.vrx-admin-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;max-width:1440px;margin:0 auto 20px;flex-wrap:wrap}.vrx-admin-brand{display:flex;align-items:center;gap:16px;min-width:0}.vrx-admin-brand>img{width:58px;height:58px;object-fit:contain;flex-shrink:0}.vrx-admin-brand-copy{min-width:0}.vrx-admin-header p{color:#b9b2ce;margin:8px 0 0;font-size:12px}.vrx-header-actions{display:flex;gap:10px;flex-wrap:wrap}
.vrx-secondary-btn{border:1px solid #69518e;background:#100b22;color:#eee8ff}.vrx-stats{max-width:1440px;margin:0 auto 20px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.vrx-stat{padding:14px;border:1px solid #6d4eb04f;border-radius:13px;background:linear-gradient(145deg,#17102b,#090714)}.vrx-stat span,.vrx-detail-grid span{display:block;color:#a99ccf;font:700 8px 'Orbitron',sans-serif;letter-spacing:.1em}.vrx-stat strong{display:block;margin-top:7px;font:800 clamp(16px,1.8vw,22px) 'Orbitron',sans-serif;color:#fff;overflow-wrap:anywhere}
.vrx-toolbar{max-width:1440px;margin:0 auto 18px;display:grid;grid-template-columns:minmax(220px,1fr) 190px auto;gap:9px;align-items:center}.vrx-toolbar>span{color:#bdb4d6;font-size:11px;text-align:right}
.vrx-booking-list{max-width:1440px;margin:0 auto;display:grid;gap:12px}.vrx-booking-card{border:1px solid #6d4eb05c;border-radius:14px;padding:clamp(13px,1.6vw,19px);background:linear-gradient(145deg,#120d24f5,#070610f7 70%,#07121cf2);box-shadow:0 14px 35px #0003}
.vrx-booking-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding-bottom:12px;border-bottom:1px solid #8b5cf629}.vrx-booking-id{font-size:10px;color:#9d8bcf;overflow-wrap:anywhere}.vrx-booking-top h2{font:700 clamp(15px,1.7vw,19px) 'Orbitron',sans-serif;margin:6px 0}.vrx-booking-top p{font-size:11px;color:#bdb5d1;margin:0;overflow-wrap:anywhere}
.vrx-status{display:inline-flex;white-space:nowrap;padding:7px 10px;border-radius:99px;font:700 9px 'Orbitron',sans-serif;text-transform:uppercase;border:1px solid #a78bfa66;background:#8b5cf61c;color:#ddd6fe}.vrx-status-verified{border-color:#34d39988;background:#10b9811b;color:#6ee7b7}.vrx-status-mixed{border-color:#fbbf2488;background:#f59e0b1a;color:#fde68a}.vrx-status-rejected{border-color:#fb718588;background:#ef44441a;color:#fca5a5}
.vrx-detail-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:14px 0}.vrx-detail-grid>div{min-width:0}.vrx-detail-grid strong{display:block;margin-top:6px;font-size:12px;color:#f7f5ff;overflow-wrap:anywhere}
.vrx-entry-list{display:grid;gap:12px}.vrx-entry-row{padding:12px;border:1px solid #ffffff1c;border-radius:10px;background:#0b0918}.vrx-entry-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.vrx-entry-heading>strong{font:700 11px 'Orbitron',sans-serif;color:#f3edff}.vrx-entry-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:12px;color:#c5c0d7;font-size:12px}.vrx-slots-panel{border:1px solid #8b5cf62c;background:#080714a8;border-radius:10px;padding:12px}.vrx-panel-title{font:700 10px 'Orbitron',sans-serif;letter-spacing:.12em;color:#c4b5fd;margin-bottom:12px}.vrx-slot-chips{display:flex;flex-wrap:wrap;gap:7px}.vrx-slot-chip{display:grid;gap:3px;border:1px solid #67e8f93a;border-radius:9px;background:#0c1720;padding:7px 9px}.vrx-slot-chip strong{font:700 11px 'Orbitron',sans-serif;color:#a5f3fc}.vrx-slot-chip span{font-size:11px;color:#d5d2e4}.vrx-muted{color:#a6a0bb;font-size:13px}
.ps5-booking-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:12px}.vrx-proof-btn{border:1px solid #67e8f977;background:#06b6d422;color:#a5f3fc}.ps5-proof-missing{color:#fca5a5;font-size:11px}.vrx-review-actions{display:flex;gap:9px;flex-wrap:wrap}.vrx-verify-btn{border:1px solid #34d39977;background:#05966924;color:#6ee7b7}.vrx-reject-btn{border:1px solid #fb718577;background:#dc262624;color:#fca5a5}.vrx-empty{padding:28px;text-align:center;border:1px dashed #6d4eb066;border-radius:14px;color:#b9b2ce}
.vrx-payment-summary{display:grid;grid-template-columns:minmax(130px,.75fr) minmax(150px,.8fr) auto;align-items:center;gap:14px;padding:12px;margin-bottom:12px;border:1px solid #34d39955;border-radius:10px;background:#061b1733}.vrx-payment-summary>div>span{display:block;color:#a99ccf;font:700 8px 'Orbitron',sans-serif;letter-spacing:.08em;margin-bottom:6px}.vrx-payment-amount>strong{font:800 22px 'Orbitron',sans-serif;color:#6ee7b7}.ps5-payment-verified>strong{font:800 16px 'Orbitron',sans-serif;color:#f7f5ff}.vrx-payment-proof{min-width:0}.vrx-payment-summary .vrx-payment-label{font-size:7px;letter-spacing:.06em;color:#9d96b6;margin-bottom:6px}.vrx-payment-summary .vrx-proof-btn{font-size:8px;letter-spacing:.03em;padding:8px 9px;white-space:nowrap}.vrx-payment-actions{justify-self:end}.vrx-payment-actions .vrx-review-actions{gap:7px;justify-content:flex-end}.vrx-entry-row{padding:12px;border:1px solid #8b5cf629;border-radius:10px;background:#0b0918}.vrx-entry-heading{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.vrx-entry-heading strong{font:700 11px 'Orbitron',sans-serif;color:#ddd6fe}.vrx-entry-footer{display:flex}.vrx-entry-payment-note{margin-left:auto;color:#8f88a8;font-size:10px}
@media(max-width:900px){.vrx-detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vrx-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.vrx-toolbar{grid-template-columns:1fr 170px}.vrx-toolbar>span{grid-column:1/-1;text-align:left}}
/* Keep action buttons compact even when global site button styles are present. */
.vrx-admin-page .vrx-header-actions .vrx-secondary-btn,
.vrx-admin-page .vrx-review-actions .vrx-verify-btn,
.vrx-admin-page .vrx-review-actions .vrx-reject-btn{
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
.vrx-admin-page .vrx-header-actions{gap:7px}
.vrx-admin-page .vrx-review-actions{gap:7px}
.vrx-admin-page .vrx-review-actions .vrx-verify-btn,
.vrx-admin-page .vrx-review-actions .vrx-reject-btn{height:32px !important;padding:6px 9px !important}
.vrx-admin-page .vrx-header-actions .vrx-secondary-btn:hover,
.vrx-admin-page .vrx-review-actions .vrx-verify-btn:hover,
.vrx-admin-page .vrx-review-actions .vrx-reject-btn:hover{filter:brightness(1.08)}
.vrx-entry-cost{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin:0 0 10px;color:#c5c0d7;font-size:11px}.vrx-entry-cost>span{font:700 8px 'Orbitron',sans-serif;color:#a99ccf;letter-spacing:.08em}.vrx-entry-cost>strong{font:800 15px 'Orbitron',sans-serif;color:#6ee7b7}.vrx-entry-cost small{color:#9d96b6;font-size:10px}.vrx-entry-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid #8b5cf629}.vrx-entry-footer .vrx-review-actions{margin-left:auto}@media(max-width:900px){.vrx-payment-summary{grid-template-columns:1fr 1fr}.vrx-payment-actions{justify-self:stretch;grid-column:1/-1}.vrx-payment-actions .vrx-review-actions{justify-content:flex-start}}
@media(max-width:600px){.vrx-payment-summary{grid-template-columns:1fr}.vrx-payment-actions{grid-column:auto}.vrx-payment-summary .vrx-review-actions{width:100%;display:flex;flex-wrap:wrap}.vrx-payment-summary .vrx-review-actions button{flex:1}.vrx-admin-page{padding:12px}.vrx-admin-header{display:grid}.vrx-admin-brand{align-items:flex-start}.vrx-admin-brand>img{width:56px;height:56px}.vrx-header-actions{width:100%}.vrx-header-actions button{flex:1}.vrx-toolbar{grid-template-columns:1fr}.vrx-detail-grid{grid-template-columns:1fr 1fr;gap:12px}.vrx-booking-top{display:grid}.vrx-status{justify-self:start}.ps5-booking-actions,.vrx-review-actions{width:100%}.vrx-proof-btn{width:100%}.vrx-review-actions button{flex:1}.vrx-stat{padding:11px}}

.vrx-day-summary{margin:0 0 14px;padding:12px;border:1px solid #34d39945;border-radius:10px;background:linear-gradient(135deg,#071b1838,#0b0918)}
.vrx-day-summary-title{font:700 10px 'Orbitron',sans-serif;letter-spacing:.09em;color:#6ee7b7;margin-bottom:10px}
.vrx-day-summary-table{display:grid;gap:6px}
.vrx-day-summary-row{display:grid;grid-template-columns:minmax(80px,.7fr) repeat(3,minmax(110px,1fr));align-items:center;gap:10px;padding:9px 10px;border:1px solid #ffffff12;border-radius:7px;background:#080714}
.vrx-day-summary-row>span,.vrx-day-summary-row>strong{min-width:0;overflow-wrap:anywhere;color:#e9e5f7;font-size:12px}
.vrx-day-summary-row>span small{display:block;margin-top:3px;color:#9d96b6;font-size:10px}
.vrx-day-summary-head{background:#151027;border-color:#8b5cf62c}
.vrx-day-summary-head span{font:700 8px 'Orbitron',sans-serif;color:#b9a6ff;letter-spacing:.05em}
.vrx-day-summary-grand{background:#061b1733;border-color:#34d39955}
.vrx-day-summary-grand strong{color:#6ee7b7;font:700 10px 'Orbitron',sans-serif}
.vrx-breakdown-note{margin:10px 0 0;color:#fcd34d;font-size:11px;line-height:1.5}
.vrx-slot-chip small{color:#6ee7b7;font-size:10px}
@media(max-width:650px){.vrx-day-summary-row{grid-template-columns:1fr 1fr;gap:8px}.vrx-day-summary-head{display:none}.vrx-day-summary-row>span,.vrx-day-summary-row>strong{font-size:11px}}


.vrx-booking-id{font-weight:800;letter-spacing:.08em;color:#c4b5fd}
.vrx-day-summary-title{line-height:1.5}
.vrx-slot-chip{min-width:170px}
.vrx-slot-chip strong{font-size:10px;letter-spacing:.04em}
.vrx-slot-chip span{font-weight:600}
.vrx-slot-chip small{line-height:1.4}
.vrx-entry-heading strong{line-height:1.6}

`;

