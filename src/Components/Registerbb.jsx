import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useLocation } from "react-router-dom";

import { createClient } from "@supabase/supabase-js";

import logoUrl from "../assets/logoo2.png";

import rampageQR from "../assets/rqr.png";
import rampageQR2 from "../assets/rqr2.png";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase =

  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY

    ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

    : null;

const BATTLEBLAZE_REGISTRATION_TABLE = "battleblaze2026";

const BATTLEBLAZE_PAYMENT_BUCKET = "battleblaze2026-payment-proofs";
const PS5_SLOT_TABLE = "ps5_rush_slots";
const VRX_SLOT_TABLE = "vrxperience_slots";
const PS5_BOOKING_RPC = "book_ps5_rush_multi_day_slots";
const VRX_BOOKING_RPC = "book_vrxperience_multi_day_slots";
const PS5_DAYS = [1, 2, 3, 4];

const BATTLEBLAZE_WHATSAPP_GROUPS = {
  RC: "https://chat.whatsapp.com/FCUZUlWJHYNCgMd7uP3o5R?s=cl&p=a&mlu=4&ilr=4",
  VALORANT: "https://chat.whatsapp.com/HFRAyJh4UnEEe4cHuJUKVb?s=cl&p=a&mlu=4&ilr=4",
  MOBILE_LEGENDS: "https://chat.whatsapp.com/LOUaQZ92r6sJAyt1lWaYDl?s=cl&p=a&mlu=4&ilr=4",
  BGMI: "https://chat.whatsapp.com/FTSoR5xFIucKl4opCG1qkB?s=cl&p=a&mlu=4&ilr=4",
  FIFA: "https://chat.whatsapp.com/DmVQOu8HqK1LjcFX5tMpsp?s=cl&p=a&mlu=4&ilr=4",
};

const tournaments = {

  BGMI: {

    title: "BGMI",

    subtitle: "BATTLEGROUNDS MOBILE INDIA • BATTLEBLAZE 2026",

    fields: [

      { name: "teamName", label: "TEAM NAME", placeholder: "Enter your team name" },

      { name: "iglName", label: "PLAYER 1 / IGL NAME", placeholder: "Full name" },

      { name: "player2Name", label: "PLAYER 2 NAME", placeholder: "Full name" },

      { name: "player3Name", label: "PLAYER 3 NAME", placeholder: "Full name" },

      { name: "player4Name", label: "PLAYER 4 NAME", placeholder: "Full name" },

      { name: "iglIgn", label: "PLAYER 1 / IGL IN-GAME NAME", placeholder: "In-game name" },

      { name: "iglEmail", label: "PLAYER 1 / IGL EMAIL ADDRESS", placeholder: "igl@example.com", type: "email" },

      { name: "player2Ign", label: "PLAYER 2 IN-GAME NAME", placeholder: "In-game name" },

      { name: "player3Ign", label: "PLAYER 3 IN-GAME NAME", placeholder: "In-game name" },

      { name: "player4Ign", label: "PLAYER 4 IN-GAME NAME", placeholder: "In-game name" },

      { name: "substituteName", label: "SUBSTITUTE PLAYER NAME (OPTIONAL)", placeholder: "Full name" },

      { name: "substituteIgn", label: "SUBSTITUTE PLAYER IGN (OPTIONAL)", placeholder: "In-game name" },

      { name: "phone1", label: "CONTACT NUMBER 1", placeholder: "10-digit mobile number", type: "tel" },

      { name: "phone2", label: "CONTACT NUMBER 2 (OPTIONAL)", placeholder: "10-digit mobile number", type: "tel" },

    ],

  },

  FREE_FIRE: {

    title: "FREE FIRE",

    subtitle: "GARENA FREE FIRE",

    fields: [

      { name: "teamName", label: "TEAM NAME", placeholder: "Enter your team name" },

      { name: "captain", label: "TEAM CAPTAIN", placeholder: "Captain's full name" },

      { name: "email", label: "EMAIL ADDRESS", placeholder: "you@example.com", type: "email" },

      { name: "phone", label: "CONTACT NUMBER", placeholder: "10-digit mobile number", type: "tel" },

      { name: "freeFireId", label: "CAPTAIN FREE FIRE UID", placeholder: "Enter your Free Fire UID" },

      { name: "player2", label: "PLAYER 2", placeholder: "Player name / UID" },

      { name: "player3", label: "PLAYER 3", placeholder: "Player name / UID" },

      { name: "player4", label: "PLAYER 4", placeholder: "Player name / UID" },

      { name: "substitute", label: "SUBSTITUTE (OPTIONAL)", placeholder: "Substitute player name / UID" },

    ],

  },

  VALORANT: {

    title: "VALORANT",

    subtitle: "TACTICAL 5V5 SHOOTER • BATTLE BLAZE",

    fields: [

      { name: "teamName", label: "TEAM NAME", placeholder: "Enter your team name" },

      { name: "iglName", label: "PLAYER 1 / IGL NAME", placeholder: "Full name" },

      { name: "player2Name", label: "PLAYER 2 NAME", placeholder: "Full name" },

      { name: "player3Name", label: "PLAYER 3 NAME", placeholder: "Full name" },

      { name: "player4Name", label: "PLAYER 4 NAME", placeholder: "Full name" },

      { name: "player5Name", label: "PLAYER 5 NAME", placeholder: "Full name" },

      { name: "iglIgn", label: "PLAYER 1 / IGL RIOT ID (IGN)", placeholder: "Riot ID: Name#TAG" },

      { name: "player2Ign", label: "PLAYER 2 RIOT ID (IGN)", placeholder: "Riot ID: Name#TAG" },

      { name: "player3Ign", label: "PLAYER 3 RIOT ID (IGN)", placeholder: "Riot ID: Name#TAG" },

      { name: "player4Ign", label: "PLAYER 4 RIOT ID (IGN)", placeholder: "Riot ID: Name#TAG" },

      { name: "player5Ign", label: "PLAYER 5 RIOT ID (IGN)", placeholder: "Riot ID: Name#TAG" },

      { name: "iglEmail", label: "PLAYER 1 / IGL EMAIL ADDRESS", placeholder: "igl@example.com", type: "email" },

      { name: "substituteName", label: "SUBSTITUTE PLAYER NAME (OPTIONAL)", placeholder: "Full name" },

      { name: "substituteIgn", label: "SUBSTITUTE RIOT ID (OPTIONAL)", placeholder: "Riot ID: Name#TAG" },

      { name: "phone1", label: "CONTACT NUMBER 1", placeholder: "10-digit mobile number", type: "tel" },

      { name: "phone2", label: "CONTACT NUMBER 2 (OPTIONAL)", placeholder: "10-digit mobile number", type: "tel" },

    ],

  },

  FIFA: {

    title: "FIFA",

    subtitle: "EA SPORTS FC / FIFA • RAMPAGE 2026",

    fields: [

      { name: "playerName", label: "PLAYER NAME", placeholder: "Your full name" },

      { name: "email", label: "EMAIL ADDRESS", placeholder: "you@example.com", type: "email" },

      { name: "phone", label: "CONTACT NUMBER 1", placeholder: "10-digit mobile number", type: "tel" },

      { name: "phone2", label: "CONTACT NUMBER 2 (OPTIONAL)", placeholder: "10-digit mobile number", type: "tel" },

    ],

  },

  MOBILE_LEGENDS: {

    title: "MOBILE LEGENDS",

    subtitle: "MOBILE LEGENDS: BANG BANG • RAMPAGE 2026",

    fields: [

      { name: "teamName", label: "TEAM NAME", placeholder: "Enter your team name" },

      { name: "iglName", label: "PLAYER 1 / IGL NAME", placeholder: "Full name" },

      { name: "player2Name", label: "PLAYER 2 NAME", placeholder: "Full name" },

      { name: "player3Name", label: "PLAYER 3 NAME", placeholder: "Full name" },

      { name: "player4Name", label: "PLAYER 4 NAME", placeholder: "Full name" },

      { name: "player5Name", label: "PLAYER 5 NAME", placeholder: "Full name" },

      { name: "iglIgn", label: "PLAYER 1 / IGL IN-GAME NAME", placeholder: "In-game name" },

      { name: "iglEmail", label: "PLAYER 1 / IGL EMAIL ADDRESS", placeholder: "igl@example.com", type: "email" },

      { name: "player2Ign", label: "PLAYER 2 IN-GAME NAME", placeholder: "In-game name" },

      { name: "player3Ign", label: "PLAYER 3 IN-GAME NAME", placeholder: "In-game name" },

      { name: "player4Ign", label: "PLAYER 4 IN-GAME NAME", placeholder: "In-game name" },

      { name: "player5Ign", label: "PLAYER 5 IN-GAME NAME", placeholder: "In-game name" },

      { name: "substituteName", label: "SUBSTITUTE PLAYER NAME (OPTIONAL)", placeholder: "Full name" },

      { name: "substituteIgn", label: "SUBSTITUTE PLAYER IGN (OPTIONAL)", placeholder: "In-game name" },

      { name: "phone1", label: "CONTACT NUMBER 1", placeholder: "10-digit mobile number", type: "tel" },

      { name: "phone2", label: "CONTACT NUMBER 2 (OPTIONAL)", placeholder: "10-digit mobile number", type: "tel" },

    ],

  },

  VR_EXPERIENCE: {
    title: "VRXPERIENCE",
    subtitle: "PS5 WITH VR · PS5 WITH STEERING WHEEL · FOUR-DAY SLOT BOOKING",
    fields: [
      { name: "playerName", label: "PLAYER NAME", placeholder: "Your full name" },
      { name: "email", label: "EMAIL ADDRESS", placeholder: "you@example.com", type: "email" },
      { name: "phone", label: "CONTACT NUMBER 1", placeholder: "10-digit mobile number", type: "tel" },
      { name: "phone2", label: "CONTACT NUMBER 2 (OPTIONAL)", placeholder: "10-digit mobile number", type: "tel" },
    ],
  },

  PS5_RUSH: {

    title: "PS5 RUSH",

    subtitle: "PLAYSTATION 5 CONSOLE CHALLENGE",

    fields: [

      { name: "playerName", label: "PLAYER NAME", placeholder: "Your full name" },

      { name: "email", label: "EMAIL ADDRESS", placeholder: "you@example.com", type: "email" },

      { name: "phone", label: "CONTACT NUMBER 1", placeholder: "10-digit mobile number", type: "tel" },

      { name: "phone2", label: "CONTACT NUMBER 2 (OPTIONAL)", placeholder: "10-digit mobile number", type: "tel" },

    ],

  },

  RC: {

    title: "RC",

    subtitle: "REAL CRICKET TOURNAMENT",

    fields: [

      { name: "teamName", label: "TEAM NAME", placeholder: "Enter your team name" },

      { name: "playerName", label: "PLAYER NAME", placeholder: "Your full name" },

      { name: "gameId", label: "PLAYER UID", placeholder: "Enter your Real Cricket player UID" },

      { name: "email", label: "EMAIL ADDRESS", placeholder: "you@example.com", type: "email" },

      { name: "phone", label: "CONTACT NUMBER 1", placeholder: "10-digit mobile number", type: "tel" },

      { name: "phone2", label: "CONTACT NUMBER 2 (OPTIONAL)", placeholder: "10-digit mobile number", type: "tel" },

    ],

  },

};

function getRequestedGame(search) {

  const query =

    typeof search === "string"

      ? search

      : typeof window !== "undefined"

      ? window.location.search

      : "";

  const requestedGame = new URLSearchParams(query).get("game");

  const normalized = (requestedGame || "BGMI")

    .trim()

    .toUpperCase()

    .replace(/[\s-]+/g, "_");

  const aliases = {

    FF: "FREE_FIRE",

    FREEFIRE: "FREE_FIRE",

    FREE_FIRE: "FREE_FIRE",

    MLBB: "MOBILE_LEGENDS",

    MOBILELEGENDS: "MOBILE_LEGENDS",

    MOBILE_LEGENDS: "MOBILE_LEGENDS",

    VR: "VR_EXPERIENCE",

    VR_EXPERIENCE: "VR_EXPERIENCE",

    PS5: "PS5_RUSH",

    PS5_RUSH: "PS5_RUSH",

  };

  const key = aliases[normalized] || normalized;

  return tournaments[key] ? key : "BGMI";

}

export default function Registerbb() {

  const location = useLocation();

  const [game, setGame] = useState(() => getRequestedGame(location.search));

  const [form, setForm] = useState({});

  const [success, setSuccess] = useState(false);

  const [paymentProof, setPaymentProof] = useState(null);

  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const [formError, setFormError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ps5Day, setPs5Day] = useState(1);
  const [ps5BookingType, setPs5BookingType] = useState(() => getRequestedGame(location.search) === "VR_EXPERIENCE" ? "PS5_WITH_VR" : "SOLO");
  const [ps5Slots, setPs5Slots] = useState([]);
  const [ps5SelectedSlots, setPs5SelectedSlots] = useState({});
  // PS5 RUSH: each selected slot stores its own SOLO/DUO choice.
  // The top selector sets the type for the next slot; selected slots can be changed individually below.
  const ps5SlotPrice = game === "VR_EXPERIENCE" ? (ps5BookingType === "PS5_WITH_VR" ? 200 : 150) : (ps5BookingType === "DUO" ? 150 : 100);
  const ps5TotalSelectedSlots = Object.values(ps5SelectedSlots).reduce((sum, slots) => sum + slots.length, 0);
  const getSelectedSlotPrice = (slot) => game === "VR_EXPERIENCE"
    ? (slot.setup_type === "PS5_WITH_STEERING_WHEEL" ? 150 : 200)
    : ((slot.booking_type || ps5BookingType) === "DUO" ? 150 : 100);
  const setSelectedSlotBookingType = (dayNumber, slotId, bookingType) => {
    setPs5SelectedSlots((old) => ({
      ...old,
      [dayNumber]: (old[dayNumber] || []).map((slot) =>
        slot.id === slotId ? { ...slot, booking_type: bookingType } : slot
      ),
    }));
    setFormError("");
  };
  const ps5TotalFee = Object.values(ps5SelectedSlots).flat().reduce((sum, slot) => sum + getSelectedSlotPrice(slot), 0);
  const [ps5SlotsLoading, setPs5SlotsLoading] = useState(false);
  const [ps5DayOpen, setPs5DayOpen] = useState(true);

  useEffect(() => {

    setGame(getRequestedGame(location.search));

    setForm({});

    setPaymentProof(null);

    setReviewConfirmed(false);

    setFormError("");

    setSuccess(false);

    if (typeof window !== "undefined") {

      window.scrollTo({ top: 0, behavior: "instant" });

    }

  }, [location.search]);

  useEffect(() => {
    if (!(game === "PS5_RUSH" || game === "VR_EXPERIENCE") || !supabase) return undefined;
    let active = true;
    const loadSlots = async () => {
      setPs5SlotsLoading(true);
      const isVrxSlotsTable = game === "VR_EXPERIENCE";
      // PS5 RUSH slots do not need setup_type. Selecting a column that is
      // absent from ps5_rush_slots makes Supabase return an error and zero slots.
      const { data, error } = await supabase
        .from(isVrxSlotsTable ? VRX_SLOT_TABLE : PS5_SLOT_TABLE)
        .select(
          isVrxSlotsTable
            ? "id, day_number, slot_number, start_time, end_time, is_booked, is_open, setup_type"
            : "id, day_number, slot_number, start_time, end_time, is_booked, is_open"
        )
        .eq("day_number", ps5Day)
        .order("slot_number", { ascending: true });
      if (!active) return;
      if (error) {
        setFormError(`COULD NOT LOAD PS5 SLOTS: ${error.message}`);
        setPs5Slots([]);
        setPs5DayOpen(false);
      } else {
        setPs5Slots(data || []);
        setPs5DayOpen((data || []).some((slot) => slot.is_open === true && slot.is_booked !== true));
      }
      setPs5SlotsLoading(false);
    };
    loadSlots();
    const channel = supabase
      .channel(`${game === "VR_EXPERIENCE" ? "vrxperience" : "ps5-rush"}-slots-day-${ps5Day}`)
      .on("postgres_changes", { event: "*", schema: "public", table: game === "VR_EXPERIENCE" ? VRX_SLOT_TABLE : PS5_SLOT_TABLE, filter: `day_number=eq.${ps5Day}` }, loadSlots)
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [game, ps5Day]);

  const current = tournaments[game];

  // BGMI and RC are free to register; other games in this form require ₹100 per team.
  const isPaymentGame = ["BGMI", "MOBILE_LEGENDS", "VALORANT", "RC", "FIFA"].includes(game);
  const isFreeRegistration = ["BGMI", "RC"].includes(game);
  const requiresPayment = isPaymentGame && !isFreeRegistration;
  const successDisplayName =
    (form.teamName || form.playerName || form.iglName || form.captain || "").trim() ||
    "YOUR REGISTRATION";
  const successNameType = form.teamName?.trim() ? "TEAM NAME" : "PLAYER NAME";
  const whatsappGroupUrl = BATTLEBLAZE_WHATSAPP_GROUPS[game];

  async function handleSubmit(e) {

    e.preventDefault();

    // BGMI registrations are closed. Block submissions even if a stale form is open.
    if (game === "BGMI") {
      setFormError("BGMI REGISTRATION IS CLOSED. FURTHER DETAILS WILL BE SHARED SOON.");
      return;
    }

    setFormError("");

    if (game === "PS5_RUSH" || game === "VR_EXPERIENCE") {
      if (isSubmitting) return;
      const name = (form.playerName || "").trim();
      const email = (form.email || "").trim();
      const phone = (form.phone || "").trim();
      const phone2 = (form.phone2 || "").trim();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFormError("PLAYER NAME AND A VALID EMAIL ADDRESS ARE REQUIRED."); return;
      }
      if (!/^\d{10}$/.test(phone) || (phone2 && !/^\d{10}$/.test(phone2))) {
        setFormError("CONTACT NUMBER 1 MUST BE 10 DIGITS. CONTACT NUMBER 2 MUST ALSO BE 10 DIGITS IF PROVIDED."); return;
      }
      const selectedByDay = PS5_DAYS
        .map((day_number) => ({
          day_number,
          slots: ps5SelectedSlots[day_number] || [],
        }))
        .filter((day) => day.slots.length > 0);
      const totalSelectedSlots = selectedByDay.reduce((total, day) => total + day.slots.length, 0);
      if (totalSelectedSlots < 1) {
        setFormError("SELECT AT LEAST ONE AVAILABLE SLOT FROM ANY OF THE FOUR DAYS."); return;
      }
      if (!reviewConfirmed) { setFormError("PLEASE REVIEW YOUR DETAILS AND CONFIRM THEM BEFORE SUBMITTING."); return; }
      const totalPayment = selectedByDay.reduce(
        (sum, day) => sum + day.slots.reduce((daySum, slot) => daySum + getSelectedSlotPrice(slot), 0),
        0
      );
      const selectedPs5Types = [...new Set(selectedByDay.flatMap((day) => day.slots.map((slot) => slot.booking_type || ps5BookingType)))];
      const combinedPs5BookingType = selectedPs5Types.length > 1 ? "MIXED" : (selectedPs5Types[0] || ps5BookingType);
      if (!paymentProof) { setFormError(`PAYMENT SCREENSHOT IS REQUIRED FOR ₹${totalPayment}.`); return; }
      if (!supabase) { setFormError("SUPABASE IS NOT CONFIGURED. CHECK YOUR VITE SUPABASE ENVIRONMENT VARIABLES."); return; }
      setIsSubmitting(true);
      let uploadedProofPath = "";
      try {
        const safeFileName = paymentProof.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
        const uniqueId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        uploadedProofPath = `${game === "VR_EXPERIENCE" ? "vrxperience" : "ps5-rush"}/${Date.now()}-${uniqueId}-${safeFileName}`;
        const { error: uploadError } = await supabase.storage.from(BATTLEBLAZE_PAYMENT_BUCKET).upload(uploadedProofPath, paymentProof, {
          cacheControl: "3600", upsert: false, contentType: paymentProof.type || "application/octet-stream",
        });
        if (uploadError) throw new Error(`PAYMENT PROOF UPLOAD FAILED: ${uploadError.message}`);
        const { error: bookingError } = await supabase.rpc(game === "VR_EXPERIENCE" ? VRX_BOOKING_RPC : PS5_BOOKING_RPC, {
          // PS5 RUSH RPC: every slot carries its own SOLO/DUO type.
          // Keep VRXperience's existing payload unchanged.
          p_day_slots: selectedByDay.map((day) => game === "PS5_RUSH"
            ? {
                day_number: day.day_number,
                slots: day.slots.map((slot) => ({
                  slot_id: slot.id,
                  booking_type: slot.booking_type || ps5BookingType,
                })),
              }
            : {
                day_number: day.day_number,
                slot_ids: day.slots.map((slot) => slot.id),
                slot_setups: day.slots.map((slot) => ({
                  slot_id: slot.id,
                  setup_type: slot.setup_type || "PS5_WITH_VR",
                  slot_price: getSelectedSlotPrice(slot),
                })),
              }),
          p_player_name: name,
          p_email: email,
          p_phone1: phone,
          p_phone2: phone2 || null,
          p_gamer_tag: null,
          p_preferred_game: null,
          p_payment_proof_path: uploadedProofPath,
          // The current PS5 booking RPC validates p_booking_type as SOLO or DUO;
          // never send the unsupported value "MIXED". Per-slot choices and prices
          // remain included in p_day_slots.slots and p_total_fee.
          p_booking_type: game === "VR_EXPERIENCE"
            ? (selectedByDay.flatMap((day) => day.slots)[0]?.setup_type || "PS5_WITH_VR")
            : (selectedPs5Types[0] || "SOLO"),
          p_slot_price: game === "VR_EXPERIENCE" ? 200 : ((selectedPs5Types[0] || "SOLO") === "DUO" ? 150 : 100),
          p_total_fee: totalPayment,
        });
        if (bookingError) throw new Error(`BOOKING FAILED: ${bookingError.message}`);
        setSuccess(true);
      } catch (error) {
        if (uploadedProofPath) await supabase.storage.from(BATTLEBLAZE_PAYMENT_BUCKET).remove([uploadedProofPath]).catch(() => {});
        setFormError(error?.message || (game === "VR_EXPERIENCE" ? "VRXPERIENCE REGISTRATION FAILED. PLEASE TRY AGAIN." : "PS5 RUSH REGISTRATION FAILED. PLEASE TRY AGAIN."));
      } finally { setIsSubmitting(false); }
      return;
    }

    if (isPaymentGame) {

      if (isSubmitting) return;

      const isRC = game === "RC";

      const isFIFA = game === "FIFA";

      const isSoloPaidGame = isRC || isFIFA;

      const playerCount =

        game === "MOBILE_LEGENDS" || game === "VALORANT" ? 5 : game === "BGMI" ? 4 : 1;

      const fee = 100;

      const player1Name = (isSoloPaidGame ? form.playerName || "" : form.iglName || "").trim();

      const player1Ign = (isSoloPaidGame ? form.gameId || "" : form.iglIgn || "").trim();

      const email = (isSoloPaidGame ? form.email || "" : form.iglEmail || "").trim();

      const phone1 = isSoloPaidGame ? form.phone : form.phone1;

      if (!isFIFA && !form.teamName?.trim()) {

        setFormError("TEAM NAME IS REQUIRED.");

        return;

      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        setFormError("A VALID EMAIL ADDRESS IS REQUIRED.");

        return;

      }

      if (!player1Name || (!isFIFA && !player1Ign)) {

        setFormError(

          isRC

            ? "PLAYER NAME AND PLAYER UID ARE REQUIRED."

            : isFIFA

            ? "PLAYER NAME IS REQUIRED."

            : "PLAYER 1 / IGL NAME AND IN-GAME NAME / RIOT ID ARE REQUIRED."

        );

        return;

      }

      for (let i = 2; i <= playerCount; i += 1) {

        const name = (form[`player${i}Name`] || "").trim();

        const ign = (form[`player${i}Ign`] || "").trim();

        if (game === "MOBILE_LEGENDS" && (!name || !ign)) {

          setFormError(`PLAYER ${i}: NAME AND IN-GAME NAME ARE REQUIRED.`);

          return;

        }

        if (Boolean(name) !== Boolean(ign)) {

          setFormError(

            game === "VALORANT"

              ? `PLAYER ${i}: IF YOU ENTER THIS PLAYER, BOTH FULL NAME AND RIOT ID ARE REQUIRED.`

              : `PLAYER ${i}: ENTER BOTH NAME AND IN-GAME NAME / RIOT ID, OR LEAVE BOTH EMPTY.`

          );

          return;

        }

      }

      const substituteName = (form.substituteName || "").trim();

      const substituteIgn = (form.substituteIgn || "").trim();

      if (!isSoloPaidGame && Boolean(substituteName) !== Boolean(substituteIgn)) {

        setFormError("SUBSTITUTE: ENTER BOTH NAME AND IN-GAME NAME, OR LEAVE BOTH EMPTY.");

        return;

      }

      if (!/^\d{10}$/.test(phone1 || "")) {

        setFormError("CONTACT NUMBER 1 MUST CONTAIN EXACTLY 10 DIGITS.");

        return;

      }

      const phone2 = (form.phone2 || "").trim();

      if (phone2 && !/^\d{10}$/.test(phone2)) {

        setFormError("CONTACT NUMBER 2 MUST CONTAIN EXACTLY 10 DIGITS IF PROVIDED.");

        return;

      }

      if (!reviewConfirmed) {

        setFormError("PLEASE REVIEW YOUR ENTRIES AND CONFIRM THAT ALL DETAILS ARE CORRECT.");

        return;

      }

      if (requiresPayment && !paymentProof) {

        setFormError(`PAYMENT SCREENSHOT IS REQUIRED FOR ₹${fee}.`);

        return;

      }

      if (!supabase) {

        setFormError("SUPABASE IS NOT CONFIGURED. CHECK VITE_SUPABASE_URL AND VITE_SUPABASE_PUBLISHABLE_KEY.");

        return;

      }

      setIsSubmitting(true);

      let uploadedProofPath = "";

      try {

        if (requiresPayment && paymentProof) {
          const safeFileName = paymentProof.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
          const uniqueId =
            globalThis.crypto?.randomUUID?.() ||
            `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          uploadedProofPath = `battleblaze2026/${Date.now()}-${uniqueId}-${safeFileName}`;

          const { error: uploadError } = await supabase.storage
            .from(BATTLEBLAZE_PAYMENT_BUCKET)
            .upload(uploadedProofPath, paymentProof, {
              cacheControl: "3600",
              upsert: false,
              contentType: paymentProof.type || "application/octet-stream",
            });

          if (uploadError) throw new Error(`PAYMENT PROOF UPLOAD FAILED: ${uploadError.message}`);
        }

        const { error: insertError } = await supabase

          .from(BATTLEBLAZE_REGISTRATION_TABLE)

          .insert({

            event_name: "RAMPAGE 2026",

            tournament: current.title,

            game: isRC

              ? "RC"

              : isFIFA

              ? "FIFA"

              : game === "MOBILE_LEGENDS"

              ? "MLBB"

              : game === "VALORANT"

              ? "VALORANT"

              : "BGMI",

            // FIFA is a solo registration; use the player's name for the existing required team_name column.

            team_name: isFIFA ? player1Name : form.teamName.trim(),

            igl_name: player1Name,

            // EA ID/platform are not collected in the simplified FIFA registration form.

            igl_ign: isFIFA ? null : player1Ign,

            igl_email: email,

            player2_name: isSoloPaidGame ? null : (form.player2Name || "").trim() || null,

            player2_ign: isSoloPaidGame ? null : (form.player2Ign || "").trim() || null,

            player3_name: isSoloPaidGame ? null : (form.player3Name || "").trim() || null,

            player3_ign: isSoloPaidGame ? null : (form.player3Ign || "").trim() || null,

            player4_name: isSoloPaidGame ? null : (form.player4Name || "").trim() || null,

            player4_ign: isSoloPaidGame ? null : (form.player4Ign || "").trim() || null,

            player5_name:

              !isSoloPaidGame && (game === "MOBILE_LEGENDS" || game === "VALORANT")

                ? (form.player5Name || "").trim() || null

                : null,

            player5_ign:

              !isSoloPaidGame && (game === "MOBILE_LEGENDS" || game === "VALORANT")

                ? (form.player5Ign || "").trim() || null

                : null,

            substitute_name: !isSoloPaidGame ? substituteName || null : null,

            substitute_ign: !isSoloPaidGame ? substituteIgn || null : null,

            phone1,

            phone2: phone2 || null,

            registration_fee: isFreeRegistration ? 0 : fee,

            payment_status: isFreeRegistration ? "free" : "proof_submitted",

            payment_proof_path: uploadedProofPath || null,


          });

        if (insertError) throw new Error(`REGISTRATION SAVE FAILED: ${insertError.message}`);

        setSuccess(true);

      } catch (error) {

        if (uploadedProofPath) {

          await supabase.storage

            .from(BATTLEBLAZE_PAYMENT_BUCKET)

            .remove([uploadedProofPath])

            .catch(() => {});

        }

        setFormError(error?.message || "REGISTRATION FAILED. PLEASE TRY AGAIN.");

      } finally {

        setIsSubmitting(false);

      }

      return;

    }

    setSuccess(true);

  }

  function isOptional(field) {

    const optionalBgmiPlayerFields = [

      "player2Name",

      "player2Ign",

      "player3Name",

      "player3Ign",

      "player4Name",

      "player4Ign",

    ];

    const optionalValorantPlayerFields = [

      "player2Name",

      "player2Ign",

      "player3Name",

      "player3Ign",

      "player4Name",

      "player4Ign",

      "player5Name",

      "player5Ign",

    ];

    return (

      field.label.includes("OPTIONAL") ||

      (game === "BGMI" && optionalBgmiPlayerFields.includes(field.name)) ||

      (game === "VALORANT" && optionalValorantPlayerFields.includes(field.name))

    );

  }

  async function downloadBookingReceipt() {
    if (!(game === "PS5_RUSH" || game === "VR_EXPERIENCE")) return;

    const isVR = game === "VR_EXPERIENCE";
    const receiptTitle = isVR ? "VRXPERIENCE" : "PS5 RUSH";
    const receiptName = (form.playerName || "").trim() || "Registered Player";
    const receiptEmail = (form.email || "").trim() || "—";
    const receiptPhone = (form.phone || "").trim() || "—";
    const bookedDays = PS5_DAYS
      .map((day) => ({
        day,
        slots: [...(ps5SelectedSlots[day] || [])].sort(
          (a, b) => Number(a.slot_number) - Number(b.slot_number)
        ),
      }))
      .filter((entry) => entry.slots.length > 0);

    const rows = bookedDays.flatMap(({ day, slots }) => slots.map((slot) => ({
      day,
      slotNumber: slot.slot_number ?? "—",
      setup: isVR
        ? (slot.setup_type === "PS5_WITH_STEERING_WHEEL" ? "PS5 WITH STEERING WHEEL" : "PS5 WITH VR")
        : ((slot.booking_type || ps5BookingType) === "DUO" ? "DUO BOOKING · 2 PLAYERS" : "SOLO BOOKING · 1 PLAYER"),
      start: slot.start_time,
      end: slot.end_time,
      price: getSelectedSlotPrice(slot),
    })));

    const generatedAt = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    // Load the NITS Esports logo before drawing so it is embedded in the downloaded PNG.
    let receiptLogo = null;
    try {
      receiptLogo = await new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = logoUrl;
      });
    } catch {
      receiptLogo = null;
    }

    // Wait for Orbitron before drawing; canvas PNGs do not inherit the page CSS font automatically.
    try {
      if (document.fonts?.load) {
        await Promise.all([
          document.fonts.load("500 16px Orbitron"),
          document.fonts.load("700 16px Orbitron"),
          document.fonts.load("800 32px Orbitron"),
        ]);
      }
    } catch (fontError) {
      console.warn("Orbitron font could not be loaded; receipt will use the fallback font.", fontError);
    }
    const canvas = document.createElement("canvas");
    const scale = 2;
    const width = 1200;
    const margin = 64;
    const rowHeight = 76;
    const tableTop = 670; // Keep the DAY-WISE SLOT BREAKDOWN safely below the contact/detail cards.
    const footerHeight = 170;
    const height = Math.max(1050, tableTop + 66 + rows.length * rowHeight + 160 + footerHeight);
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setFormError("COULD NOT GENERATE RECEIPT IMAGE. PLEASE TRY AGAIN.");
      return;
    }
    ctx.scale(scale, scale);

    const roundedRect = (x, y, w, h, r, fill, stroke = null) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
    };
    const text = (value, x, y, size = 18, color = "#f5f3ff", weight = 400, align = "left") => {
      ctx.font = `${weight} ${size}px Orbitron, Arial, Helvetica, sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.fillText(String(value ?? "—"), x, y);
    };
    const formatTime = (value) => {
      if (!value) return "Time unavailable";
      const parts = String(value).split(":");
      const hours = Number(parts[0]);
      const minutes = String(parts[1] || "00").slice(0, 2).padStart(2, "0");
      if (!Number.isFinite(hours)) return String(value);
      return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? "PM" : "AM"}`;
    };

    // Premium BattleBlaze receipt: deep purple/blue gradient, neon accents, and Orbitron typography.
    const pageGradient = ctx.createLinearGradient(0, 0, width, height);
    pageGradient.addColorStop(0, "#070516");
    pageGradient.addColorStop(0.48, "#120a2b");
    pageGradient.addColorStop(1, "#07152d");
    ctx.fillStyle = pageGradient;
    ctx.fillRect(0, 0, width, height);
    roundedRect(24, 24, width - 48, height - 48, 22, "#0b091b", "#4c3286");

    const headerGradient = ctx.createLinearGradient(24, 24, width - 24, 264);
    headerGradient.addColorStop(0, "#6d28d9");
    headerGradient.addColorStop(0.52, "#4338ca");
    headerGradient.addColorStop(1, "#0369a1");
    roundedRect(24, 24, width - 48, 240, 20, headerGradient);

    // Required receipt header: NITS ESPORTS PRESENTS, then logoo2.png underneath.
    text("NITS ESPORTS PRESENTS", width / 2, 66, 20, "#f3e8ff", 800, "center");
    if (receiptLogo) {
      const maxLogoWidth = 116;
      const maxLogoHeight = 104;
      const ratio = Math.min(maxLogoWidth / receiptLogo.width, maxLogoHeight / receiptLogo.height);
      const logoWidth = receiptLogo.width * ratio;
      const logoHeight = receiptLogo.height * ratio;
      ctx.save();
      ctx.shadowColor = "rgba(255,255,255,0.25)";
      ctx.shadowBlur = 12;
      ctx.drawImage(receiptLogo, (width - logoWidth) / 2, 78, logoWidth, logoHeight);
      ctx.restore();
    } else {
      // Keep the layout intact if the bundled logo asset fails to load.
      text("NITS ESPORTS", width / 2, 132, 15, "#ffffff", 800, "center");
    }
    text(`${receiptTitle} - REGISTRATION RECEIPT`, width / 2, 204, 26, "#ffffff", 800, "center");
    text(`Registration submitted  |  Generated ${generatedAt}`, width / 2, 238, 12, "#e0e7ff", 500, "center");

    const accentGradient = ctx.createLinearGradient(24, 0, width - 24, 0);
    accentGradient.addColorStop(0, "#c084fc");
    accentGradient.addColorStop(0.5, "#818cf8");
    accentGradient.addColorStop(1, "#67e8f9");
    ctx.fillStyle = accentGradient;
    ctx.fillRect(24, 260, width - 48, 7);

    roundedRect(margin, 288, 300, 42, 10, "#102d3a", "#22d3ee");
    text("REGISTRATION SUBMITTED", margin + 16, 314, 13, "#67e8f9", 700);

    roundedRect(margin, 348, width - margin * 2, 92, 14, "#17102e", "#7656e8");
    text("EVENT VENUE", margin + 22, 379, 13, "#c4b5fd", 700);
    text("NEW GALLERY G301", margin + 22, 415, 25, "#ffffff", 800);

    const detailY = 464;
    const detailW = (width - margin * 2 - 18) / 2;
    const detailCards = [
      ["PLAYER NAME", receiptName],
      ["EMAIL ADDRESS", receiptEmail],
      ["CONTACT NUMBER", receiptPhone],
      ["BOOKING SUMMARY", `${rows.length} slot(s) across ${bookedDays.length} day(s)`],
    ];
    detailCards.forEach(([label, value], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + col * (detailW + 18);
      const y = detailY + row * 76;
      roundedRect(x, y, detailW, 62, 10, "#120e25", "#35245e");
      text(label, x + 14, y + 22, 10, "#b9a6ff", 700);
      let shown = String(value);
      ctx.font = "700 14px Orbitron, Arial, Helvetica, sans-serif";
      while (shown.length > 4 && ctx.measureText(shown).width > detailW - 28) shown = `${shown.slice(0, -4)}…`;
      text(shown, x + 14, y + 46, 14, "#f5f3ff", 700);
    });

    if (!isVR) {
      const soloCount = rows.filter((row) => row.setup.startsWith("SOLO")).length;
      const duoCount = rows.filter((row) => row.setup.startsWith("DUO")).length;
      text(`BOOKING TYPES: ${soloCount} SOLO × INR 100  |  ${duoCount} DUO × INR 150`, margin, 630, 13, "#67e8f9", 700);
    }

    const titleY = tableTop - 22;
    text("DAY-WISE SLOT BREAKDOWN", margin, titleY, 19, "#c4b5fd", 800);
    const tableX = margin;
    const tableW = width - margin * 2;
    const headerY = tableTop;
    const colWidths = [100, 110, 300, 270, tableW - 780];
    const colX = [tableX];
    for (let i = 0; i < colWidths.length - 1; i++) colX.push(colX[i] + colWidths[i]);
    roundedRect(tableX, headerY, tableW, 48, 8, "#211443", "#4c3286");
    ["DAY", "SLOT", "SETUP / TYPE", "TIME", "PRICE"].forEach((label, i) => {
      text(label, colX[i] + 12, headerY + 30, 11, "#ddd6fe", 700, i === 4 ? "right" : "left");
    });

    rows.forEach((row, index) => {
      const y = headerY + 48 + index * rowHeight;
      if (index % 2 === 0) ctx.fillStyle = "#100d21"; else ctx.fillStyle = "#0d1226";
      ctx.fillRect(tableX, y, tableW, rowHeight);
      ctx.strokeStyle = "#30244f";
      ctx.beginPath(); ctx.moveTo(tableX, y + rowHeight); ctx.lineTo(tableX + tableW, y + rowHeight); ctx.stroke();
      const values = [
        `Day ${row.day}`,
        `Slot ${row.slotNumber}`,
        row.setup,
        `${formatTime(row.start)} - ${formatTime(row.end)}`,
        `INR ${row.price}`,
      ];
      values.forEach((value, i) => {
        let shown = String(value);
        ctx.font = `${i === 4 ? 700 : 500} 11px Orbitron, Arial, Helvetica, sans-serif`;
        const maxWidth = colWidths[i] - 20;
        while (shown.length > 5 && ctx.measureText(shown).width > maxWidth) shown = `${shown.slice(0, -4)}…`;
        text(shown, i === 4 ? colX[i] + colWidths[i] - 12 : colX[i] + 12, y + 43, 11, i === 4 ? "#6ee7b7" : "#e9e5ff", i === 4 ? 700 : 500, i === 4 ? "right" : "left");
      });
    });

    const totalY = headerY + 48 + rows.length * rowHeight + 26;
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(margin, totalY); ctx.lineTo(width - margin, totalY); ctx.stroke();
    text("TOTAL BOOKING FEE", margin, totalY + 42, 17, "#e9d5ff", 700);
    text(`INR ${ps5TotalFee}`, width - margin, totalY + 44, 26, "#6ee7b7", 800, "right");
    const footY = totalY + 92;
    roundedRect(margin, footY, width - margin * 2, 82, 10, "#111027", "#3c2a68");
    text("Keep this receipt for your reference.", margin + 16, footY + 29, 12, "#c4b5fd", 700);
    text("Booking submitted successfully. Payment verification may be completed separately by the event team.", margin + 16, footY + 54, 10, "#b9b5d0", 500);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) {
      setFormError("COULD NOT EXPORT RECEIPT PNG. PLEASE TRY AGAIN.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${isVR ? "VRXperience" : "PS5-Rush"}-Receipt-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  return (

    <Fragment>
    <main className="reg-page">

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&display=swap');

        /* BattleblazeHero.jsx Exact Page Scrollbar */

        html, body {

          min-height: 100%;

          margin: 0;

          background-color: #05030d !important;

          scrollbar-width: thin;

          scrollbar-color: #7656e8 #100a2a;

        }

        html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar {

          width: 10px;

          height: 10px;

        }

        html::-webkit-scrollbar-track, body::-webkit-scrollbar-track, *::-webkit-scrollbar-track {

          background: linear-gradient(180deg, #100a2a 0%, #1b0c36 55%, #100a2a 100%);

          border-left: 1px solid rgba(0, 234, 255, 0.12);

        }

        html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb, *::-webkit-scrollbar-thumb {

          background: linear-gradient(180deg, #a78bfa 0%, #7656e8 48%, #7d2bd4 100%);

          border: 2px solid #100a2a;

          border-radius: 999px;

        }

        html::-webkit-scrollbar-thumb:hover, body::-webkit-scrollbar-thumb:hover, *::-webkit-scrollbar-thumb:hover {

          background: linear-gradient(180deg, #c4b5fd 0%, #8b5cf6 48%, #00cfe8 100%);

        }

        /* Global Typography & BattleblazeHero.jsx Nebula Background */

        .reg-page, .reg-page *, .reg-page *::before, .reg-page *::after {

          box-sizing: border-box;

          font-family: 'Orbitron', system-ui, sans-serif !important;

        }

        .reg-page {

          position: relative;

          isolation: isolate;

          min-height: 100vh;

          min-height: 100svh;

          width: 100%;

          padding: clamp(24px, 4vw, 44px) clamp(16px, 4vw, 56px) 52px;

          color: #fff;

          background-color: #05030d;

          background-image:

            radial-gradient(ellipse at 12% 18%, rgba(109, 40, 217, 0.28), transparent 40%),

            radial-gradient(ellipse at 88% 30%, rgba(37, 99, 235, 0.16), transparent 42%),

            radial-gradient(ellipse at 52% 100%, rgba(79, 70, 229, 0.16), transparent 50%),

            linear-gradient(135deg, #05030d 0%, #100821 48%, #050914 100%);

          overflow-x: hidden;

        }

        /* ─────────────── HEADER & LOGO SHELL ─────────────── */

        .reg-header {

          max-width: 1120px;

          /* Move the complete presents + logo block below the navbar */

          margin: clamp(130px, 14vh, 170px) auto 0;

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 18px;

          position: relative;

          z-index: 1;

        }

        .reg-header-bgmi {

          justify-content: center;

          flex-direction: column;

          gap: 12px;

        }

        .reg-header-branding {

          display: flex;

          flex-direction: column;

          align-items: center;

          gap: 10px;

        }

        .reg-header-presents {

          color: #c4b5fd;

          font-size: clamp(10px, 1.2vw, 12px);

          font-weight: 800;

          letter-spacing: 0.28em;

          text-align: center;

          text-transform: uppercase;

        }

        /* Matches .bb-modules-logo-shell from BattleblazeHero.jsx */

        .reg-brand {

          display: grid;

          place-items: center;

          width: 82px;

          height: 82px;

          border: 1px solid rgba(139, 92, 246, 0.5);

          border-radius: 22px;

          background: linear-gradient(110deg, rgba(139, 92, 246, 0.14), rgba(8, 12, 37, 0.65), rgba(0, 234, 255, 0.12));

          box-shadow: 0 0 32px rgba(139, 92, 246, 0.14);

          transition: transform 220ms ease, border-color 220ms ease;

        }

        .reg-brand:hover {

          transform: translateY(-2px);

          border-color: rgba(196, 181, 253, 0.78);

        }

        .reg-brand img {

          width: 80%;

          height: 80%;

          object-fit: contain;

          filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.24));

        }

        .reg-logo-large {

          width: clamp(96px, 12vw, 138px);

          height: clamp(96px, 12vw, 138px);

          border-radius: 26px;

        }

        .reg-header-label,

        .reg-eyebrow,

        .reg-card-index,

        .reg-status,

        .reg-section-label,

        .reg-footnote,

        .reg-footer {

          letter-spacing: 0.2em;

          font-size: 10px;

          font-weight: 800;

          color: #c4b5fd;

          text-transform: uppercase;

        }

        .reg-header-bgmi .reg-header-label {

          text-align: center;

        }

        /* ─────────────── MAIN CONTAINER & BATTLEBLAZE HEADING ─────────────── */

        .reg-container {

          max-width: 940px;

          margin: clamp(28px, 4vw, 42px) auto 0;

          position: relative;

          z-index: 1;

        }

        .reg-heading {

          text-align: center;

          margin-bottom: clamp(24px, 3.5vw, 34px);

        }

        /* Exact Heading Color & Gradient from BattleblazeHero.jsx (.bb-overview-title / .bb-modules-title) */

        .reg-heading h1 {

          position: relative;

          display: inline-block;

          margin: 10px 0 24px;

          font-size: clamp(2rem, 4.6vw, 3.8rem);

          line-height: 1.08;

          font-weight: 800;

          letter-spacing: 0.02em;

          text-transform: uppercase;

          color: #fff;

          background: linear-gradient(100deg, #fff 8%, #ddd6fe 48%, #bfdbfe 100%);

          -webkit-background-clip: text;

          background-clip: text;

          -webkit-text-fill-color: transparent;

          filter: drop-shadow(0 0 18px rgba(139, 92, 246, 0.22));

        }

        .reg-heading h1 span {

          background: inherit;

          -webkit-background-clip: text;

          background-clip: text;

          -webkit-text-fill-color: transparent;

        }

        .reg-heading h1::after {

          content: "";

          position: absolute;

          left: 50%;

          transform: translateX(-50%);

          bottom: -14px;

          width: min(84%, 360px);

          height: 2px;

          background: linear-gradient(90deg, transparent, #8b5cf6, #60a5fa, transparent);

          box-shadow: 0 0 12px rgba(139, 92, 246, 0.55);

        }

        .reg-heading p,

        .reg-card-top p {

          margin: 0;

          color: rgba(255, 255, 255, 0.78);

          font-size: clamp(11px, 0.95vw, 13px);

          line-height: 1.55;

        }

        /* ─────────────── MAIN CARD (MATCHES BATTLEBLAZE CARDS) ─────────────── */

        .reg-glass-card {

          position: relative;

          overflow: hidden;

          border: 1px solid rgba(139, 92, 246, 0.45);

          border-radius: 18px;

          padding: clamp(18px, 3.8vw, 34px);

          background: linear-gradient(

            145deg,

            rgba(139, 92, 246, 0.12),

            rgba(8, 4, 17, 0.95) 65%,

            rgba(59, 130, 246, 0.08)

          );

          box-shadow:

            0 18px 42px rgba(0, 0, 0, 0.35),

            inset 0 1px 0 rgba(255, 255, 255, 0.06);

        }

        .reg-glass-card::before {

          content: "";

          position: absolute;

          top: 0;

          left: clamp(18px, 3.8vw, 34px);

          width: 96px;

          height: 2px;

          background: linear-gradient(90deg, #6d28d9, #8b5cf6, #60a5fa);

          box-shadow: 0 0 14px rgba(139, 92, 246, 0.65);

        }

        .reg-card-top {

          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 16px;

        }

        .reg-card-top h2 {

          margin: 10px 0 8px;

          font-size: clamp(1.35rem, 2.8vw, 2.1rem);

          font-weight: 800;

          line-height: 1.12;

          text-transform: uppercase;

          background: linear-gradient(100deg, #fff 8%, #ddd6fe 48%, #bfdbfe 100%);

          -webkit-background-clip: text;

          background-clip: text;

          -webkit-text-fill-color: transparent;

          filter: drop-shadow(0 0 14px rgba(139, 92, 246, 0.2));

        }

        .reg-card-top h2 span {

          background: inherit;

          -webkit-background-clip: text;

          background-clip: text;

          -webkit-text-fill-color: transparent;

        }

        .reg-status {

          display: inline-flex;

          align-items: center;

          border: 1px solid rgba(196, 181, 253, 0.38);

          border-radius: 999px;

          padding: 8px 12px;

          background: rgba(139, 92, 246, 0.12);

          color: #f5f3ff;

          font-size: 9px;

          letter-spacing: 0.14em;

          white-space: nowrap;

        }

        .reg-status span {

          display: inline-block;

          width: 6px;

          height: 6px;

          border-radius: 50%;

          background: #60a5fa;

          box-shadow: 0 0 8px #60a5fa;

          margin-right: 8px;

        }

        .reg-divider {

          height: 1px;

          background: linear-gradient(90deg, transparent, #6d28d9 25%, #8b5cf6 50%, #60a5fa 75%, transparent);

          margin: 24px 0;

          opacity: 0.75;

        }

        .reg-section-label {

          display: flex;

          align-items: center;

          gap: 8px;

          margin-bottom: 16px;

          color: #c4b5fd;

          font-size: 11px;

          letter-spacing: 0.22em;

        }

        .reg-section-label span {

          color: #60a5fa;

        }

        .reg-subsection-heading {

          grid-column: 1 / -1;

          margin: 8px 0 -2px;

          padding-top: 14px;

          border-top: 1px solid rgba(139, 92, 246, 0.22);

          color: #f5f3ff;

        }

        /* ─────────────── FORM FIELDS ─────────────── */

        .reg-fields {

          display: grid;

          grid-template-columns: repeat(2, minmax(0, 1fr));

          gap: 16px;

        }

        .reg-field {

          display: flex;

          flex-direction: column;

          gap: 8px;

          min-width: 0;

        }

        .reg-field > span {

          font-size: 10px;

          font-weight: 700;

          letter-spacing: 0.08em;

          color: rgba(255, 255, 255, 0.88);

        }

        .reg-field b {

          color: #60a5fa;

        }

        .reg-field input,

        .reg-field select {

          width: 100%;

          min-height: 48px;

          border: 1px solid rgba(139, 92, 246, 0.35);

          border-radius: 10px;

          outline: none;

          background: rgba(6, 5, 16, 0.88);

          color: #fff;

          padding: 12px 14px;

          font-size: 12px;

          font-weight: 500;

          letter-spacing: 0.03em;

          transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;

        }

        .reg-field input::placeholder {

          color: rgba(196, 181, 253, 0.42);

        }

        .reg-field input:focus,

        .reg-field select:focus {

          border-color: #60a5fa;

          background: rgba(10, 8, 26, 0.96);

          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.16), 0 0 14px rgba(139, 92, 246, 0.2);

        }

        /* ─────────────── REVIEW & PAYMENT PANELS ─────────────── */

        .reg-review,

        .reg-payment-panel {

          margin-top: 8px;

          padding: clamp(16px, 2.5vw, 22px);

          border: 1px solid rgba(139, 92, 246, 0.38);

          border-radius: 14px;

          background: linear-gradient(

            145deg,

            rgba(139, 92, 246, 0.09),

            rgba(7, 5, 18, 0.92) 68%,

            rgba(59, 130, 246, 0.07)

          );

        }

        .reg-review-grid {

          display: grid;

          grid-template-columns: repeat(2, minmax(0, 1fr));

          gap: 12px;

        }

        .reg-review-item {

          min-width: 0;

          padding: 10px 12px;

          border: 1px solid rgba(139, 92, 246, 0.25);

          border-radius: 9px;

          background: rgba(139, 92, 246, 0.06);

        }

        .reg-review-item small {

          display: block;

          color: #c4b5fd;

          font-size: 9px;

          font-weight: 700;

          letter-spacing: 0.1em;

          margin-bottom: 5px;

        }

        .reg-review-item strong {
          display: block;
          color: #fff;
          font-size: 12px;
          overflow-wrap: anywhere;
        }
        .reg-selected-slots {
          grid-column: 1 / -1;
          padding: 14px;
          border: 1px solid rgba(96, 165, 250, 0.34);
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.08), rgba(139, 92, 246, 0.08));
        }
        .reg-selected-slots-heading {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px;
          margin-bottom: 12px; color: #e9e4ff; font-size: 11px; font-weight: 800; letter-spacing: .08em;
        }
        .reg-selected-slots-count {
          border: 1px solid rgba(96, 165, 250, .4); border-radius: 999px; padding: 5px 9px;
          color: #bfdbfe; background: rgba(59, 130, 246, .1); font-size: 9px; white-space: nowrap;
        }
        .reg-selected-day { margin-top: 10px; padding: 11px; border: 1px solid rgba(139, 92, 246, .22); border-radius: 9px; background: rgba(5, 3, 13, .55); }
        .reg-selected-day-title { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin-bottom: 9px; color: #c4b5fd; font-size: 10px; font-weight: 800; letter-spacing: .08em; }
        .reg-selected-slot-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap: 8px; }
        .reg-selected-slot-chip {
          display: flex; flex-direction: column; align-items: flex-start; gap: 7px;
          min-width: 0; padding: 13px; border: 1px solid rgba(96, 165, 250, .34);
          border-radius: 10px; background: linear-gradient(145deg, rgba(19, 25, 52, .96), rgba(13, 10, 31, .98));
          box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
        }
        .reg-selected-slot-chip b { display: block; margin: 0; color: #ffffff !important; font-size: 11px; font-weight: 800; letter-spacing: .06em; }
        .reg-selected-slot-chip span { display: block; color: #dbeafe !important; font-size: 12px; font-weight: 600; line-height: 1.5; }
        .reg-selected-slot-chip .reg-slot-setup {
          display: inline-flex; align-items: center; width: fit-content; max-width: 100%;
          padding: 6px 9px; border: 1px solid rgba(167,139,250,.42); border-radius: 7px;
          background: rgba(124,58,237,.18); color: #e9d5ff !important;
          font-size: 10px; font-style: normal; font-weight: 800; line-height: 1.45;
          letter-spacing: .035em; overflow-wrap: anywhere;
        }
        .reg-selected-slot-chip .reg-slot-price { color: #67e8f9 !important; font-size: 12px; font-weight: 800; }
        .reg-selected-empty { color: rgba(255,255,255,.62); font-size: 11px; line-height: 1.6; }

        .reg-payment-amount {

          color: #fff;

          font-size: 13px;

          font-weight: 700;

          letter-spacing: 0.08em;

          margin: 0 0 8px;

        }

        .reg-payment-amount strong {

          color: #93c5fd;

          text-shadow: 0 0 12px rgba(96, 165, 250, 0.35);

        }

        .reg-payment-note {

          color: rgba(255, 255, 255, 0.76);

          font-size: 11px;

          line-height: 1.6;

          margin: 0 0 16px;

        }

        .reg-qr-grid {

          display: grid;

          grid-template-columns: repeat(2, minmax(0, 1fr));

          gap: 14px;

          margin: 14px 0 18px;

        }

        .reg-qr-slot {

          min-height: 176px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 10px;

          padding: 14px;

          border: 1px dashed rgba(167, 139, 250, 0.48);

          border-radius: 12px;

          background: rgba(6, 5, 16, 0.75);

          text-align: center;

        }

        .reg-qr-slot img {

          width: 132px;

          height: 132px;

          object-fit: contain;

          background: #fff;

          border-radius: 8px;

          padding: 6px;

        }

        .reg-qr-slot strong {

          font-size: 10px;

          letter-spacing: 0.1em;

          color: #f5f3ff;

        }

        .reg-qr-slot span {

          font-size: 9px;

          color: rgba(255, 255, 255, 0.7);

          line-height: 1.5;

        }

        .reg-payment-upload input {

          padding: 10px;

          min-height: auto;

          background: rgba(6, 5, 16, 0.85);

          cursor: pointer;

        }

        /* ─────────────── CONSENT, SUBMIT & STATUS ─────────────── */

        .reg-consent {

          display: flex;

          gap: 10px;

          align-items: flex-start;

          color: rgba(255, 255, 255, 0.82);

          font-size: 11px;

          line-height: 1.6;

          cursor: pointer;

        }

        .reg-consent input {

          width: 16px;

          height: 16px;

          accent-color: #8b5cf6;

          margin-top: 2px;

          flex-shrink: 0;

        }

        .reg-review-consent {

          margin-top: 16px;

        }

        .reg-form-error {

          margin-top: 16px;

          padding: 12px 14px;

          border: 1px solid rgba(248, 113, 113, 0.45);

          border-radius: 10px;

          background: rgba(127, 29, 29, 0.22);

          color: #fecaca;

          font-size: 10px;

          font-weight: 700;

          line-height: 1.6;

          letter-spacing: 0.05em;

        }

        /* Matches BattleblazeHero.jsx CTA Button Styling */

        .reg-submit {

          display: flex;

          justify-content: center;

          align-items: center;

          gap: 10px;

          width: 100%;

          margin-top: 22px;

          border: 1px solid rgba(196, 181, 253, 0.55);

          border-radius: 10px;

          padding: 15px 18px;

          background: linear-gradient(100deg, #6d28d9 0%, #8b5cf6 48%, #3b82f6 100%);

          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.32), 0 0 20px rgba(139, 92, 246, 0.22);

          color: #fff;

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 0.14em;

          text-transform: uppercase;

          cursor: pointer;

          transition: transform 200ms ease, filter 200ms ease, border-color 200ms ease;

        }

        .reg-submit:hover:not(:disabled) {

          transform: translateY(-2px);

          border-color: #fff;

          filter: brightness(1.12);

        }

        .reg-submit:disabled {

          opacity: 0.65;

          cursor: wait;

        }

        .reg-footnote {

          text-align: center;

          margin-top: 15px;

          font-size: 9px;

          color: rgba(196, 181, 253, 0.72);

        }

        .reg-success {

          text-align: center;

          padding: 28px 0;

        }

        .reg-success-icon {

          width: 56px;

          height: 56px;

          display: grid;

          place-items: center;

          margin: 0 auto 18px;

          border: 1px solid #8b5cf6;

          border-radius: 50%;

          background: rgba(139, 92, 246, 0.14);

          color: #c4b5fd;

          font-size: 26px;

          box-shadow: 0 0 22px rgba(139, 92, 246, 0.25);

        }

        .reg-success h2 {

          margin: 10px 0 12px;

          font-size: clamp(22px, 3.2vw, 30px);

          background: linear-gradient(100deg, #fff 8%, #ddd6fe 48%, #bfdbfe 100%);

          -webkit-background-clip: text;

          background-clip: text;

          -webkit-text-fill-color: transparent;

        }

        .reg-success p {

          color: rgba(255, 255, 255, 0.8);

          line-height: 1.7;

          font-size: 12px;

          margin: 0 auto 8px;

          max-width: 520px;

        }

        /* ─────────────── SUCCESS POPUP / BATTLEBLAZE THEME ─────────────── */
        .bb-success-overlay,
        .bb-success-overlay * {
          box-sizing: border-box;
          font-family: 'Orbitron', system-ui, sans-serif;
        }

        .bb-success-overlay {
          position: fixed;
          inset: 0;
          z-index: 2147483000;
          display: grid;
          place-items: center;
          padding: 20px;
          overflow-y: auto;
          background: rgba(2, 2, 12, 0.82);
          -webkit-backdrop-filter: blur(18px);
          backdrop-filter: blur(18px);
          animation: bb-success-overlay-in 220ms ease both;
        }

        .bb-success-modal {
          position: relative;
          width: min(100%, 660px);
          padding: clamp(24px, 4vw, 40px);
          overflow: hidden;
          text-align: center;
          border: 1px solid rgba(139, 92, 246, 0.64);
          border-radius: 22px;
          background:
            radial-gradient(ellipse at 12% 0%, rgba(109, 40, 217, 0.25), transparent 42%),
            radial-gradient(ellipse at 100% 100%, rgba(0, 234, 255, 0.11), transparent 40%),
            linear-gradient(145deg, rgba(15, 10, 35, 0.99), rgba(5, 4, 17, 0.99) 58%, rgba(9, 10, 30, 0.99));
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.62), 0 0 45px rgba(109, 40, 217, 0.2), inset 0 1px 0 rgba(255,255,255,0.08);
          animation: bb-success-modal-in 300ms cubic-bezier(.2,.8,.2,1) both;
        }

        .bb-success-modal::before {
          content: "";
          position: absolute;
          top: 0;
          left: 12%;
          right: 12%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #8b5cf6, #00eaff, transparent);
          box-shadow: 0 0 18px rgba(0, 234, 255, 0.35);
        }

        .bb-success-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(196, 181, 253, 0.28);
          border-radius: 10px;
          background: rgba(139, 92, 246, 0.1);
          color: #e9e4ff;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
        }

        .bb-success-close:hover {
          transform: rotate(90deg);
          border-color: #00eaff;
          background: rgba(0, 234, 255, 0.12);
        }

        .bb-success-logo-shell {
          width: 84px;
          height: 84px;
          display: grid;
          place-items: center;
          margin: 0 auto 18px;
          border: 1px solid rgba(139, 92, 246, 0.58);
          border-radius: 23px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(8, 12, 37, 0.78) 56%, rgba(0, 234, 255, 0.12));
          box-shadow: 0 0 34px rgba(139, 92, 246, 0.18), inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .bb-success-logo-shell img {
          width: 80%;
          height: 80%;
          object-fit: contain;
          filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.3));
        }

        .bb-success-check {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          margin: 0 auto 14px;
          border: 1px solid rgba(103, 232, 249, 0.72);
          border-radius: 50%;
          color: #67e8f9;
          background: rgba(0, 234, 255, 0.08);
          box-shadow: 0 0 28px rgba(0, 234, 255, 0.16);
          font-size: 23px;
          font-weight: 800;
        }

        .bb-success-kicker {
          display: block;
          margin-bottom: 10px;
          color: #c4b5fd;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        .bb-success-title {
          margin: 0;
          font-size: clamp(24px, 4.5vw, 36px);
          line-height: 1.13;
          font-weight: 800;
          letter-spacing: 0.015em;
          background: linear-gradient(100deg, #fff 8%, #ddd6fe 48%, #bfdbfe 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 16px rgba(139, 92, 246, 0.2));
        }

        .bb-success-message {
          max-width: 480px;
          margin: 12px auto 20px;
          color: rgba(255, 255, 255, 0.78);
          font-size: 12px;
          line-height: 1.75;
        }

        .bb-success-name-card {
          margin: 0 auto 26px;
          max-width: 470px;
          padding: 16px 18px;
          border: 1px solid rgba(0, 234, 255, 0.32);
          border-radius: 12px;
          background: linear-gradient(110deg, rgba(139, 92, 246, 0.13), rgba(0, 234, 255, 0.055));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .bb-success-name-card span {
          display: block;
          margin-bottom: 7px;
          color: #67e8f9;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.19em;
        }

        .bb-success-name-card strong {
          display: block;
          color: #fff;
          font-size: clamp(15px, 2.5vw, 20px);
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .bb-success-venue {
          max-width: 470px;
          margin: -10px auto 22px;
          padding: 13px 16px;
          border: 1px solid rgba(196, 181, 253, 0.48);
          border-radius: 12px;
          background: linear-gradient(110deg, rgba(139, 92, 246, 0.17), rgba(96, 165, 250, 0.08));
          text-align: left;
        }
        .bb-success-venue span {
          display: block;
          margin-bottom: 6px;
          color: #c4b5fd;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .18em;
        }
        .bb-success-venue strong {
          display: block;
          color: #fff;
          font-size: clamp(14px, 2.5vw, 18px);
          letter-spacing: .04em;
        }

        .bb-ps5-booking-summary {
          width: 100%;
          max-width: 560px;
          margin: 0 auto 24px;
          padding: 16px;
          border: 1px solid rgba(0, 234, 255, 0.3);
          border-radius: 14px;
          background: rgba(3, 8, 25, 0.72);
          text-align: left;
        }
        .bb-ps5-booking-heading {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 14px;
          color: #67e8f9;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .1em;
        }
        .bb-ps5-day-booking {
          padding: 12px 0;
          border-top: 1px solid rgba(139, 92, 246, .25);
        }
        .bb-ps5-day-booking h3 {
          margin: 0 0 9px;
          color: #ddd6fe;
          font-size: 11px;
          letter-spacing: .1em;
        }
        .bb-ps5-slot-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .bb-ps5-slot-item {
          min-width: 0;
          padding: 9px 10px;
          border: 1px solid rgba(139, 92, 246, .3);
          border-radius: 9px;
          background: rgba(139, 92, 246, .08);
        }
        .bb-ps5-slot-item strong, .bb-ps5-slot-item span {
          display: block;
          overflow-wrap: anywhere;
        }
        .bb-ps5-slot-item strong { color: #fff !important; font-size: 10px; margin-bottom: 5px; }
        /* Explicitly style the setup label in the success popup; browser default em text is black. */
        .bb-success-modal .bb-ps5-slot-item em {
          display: block;
          margin: 3px 0 5px;
          color: #67e8f9 !important;
          -webkit-text-fill-color: #67e8f9 !important;
          font-size: 11px;
          font-style: normal !important;
          font-weight: 800;
          line-height: 1.5;
          letter-spacing: .035em;
          overflow-wrap: anywhere;
          text-shadow: 0 0 10px rgba(103, 232, 249, .14);
        }
        .bb-ps5-slot-item span { color: #e2e8f0 !important; font-size: 10px; line-height: 1.6; }
        .bb-success-modal .bb-ps5-slot-item,
        .bb-success-modal .bb-ps5-slot-item * { opacity: 1; }
        .bb-ps5-total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 12px;
          padding-top: 14px;
          border-top: 1px solid rgba(0,234,255,.28);
          color: #fff;
          font-size: 11px;
          font-weight: 800;
        }
        .bb-ps5-total-row strong { color: #67e8f9; font-size: 18px; }
        @media (max-width: 480px) {
          .bb-ps5-booking-summary { padding: 12px; }
          .bb-ps5-slot-list { grid-template-columns: minmax(0, 1fr); }
          .bb-ps5-booking-heading { font-size: 9px; }
        }

        .bb-success-actions {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 11px;
        }

        .bb-success-action {
          appearance: none;
          width: 100%;
          font-family: inherit;
          cursor: pointer;
          min-height: 92px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 12px;
          border: 1px solid rgba(139, 92, 246, 0.48);
          border-radius: 12px;
          color: #f5f3ff;
          text-decoration: none;
          text-align: center;
          background: linear-gradient(145deg, rgba(139, 92, 246, 0.16), rgba(4, 6, 21, 0.82));
          font-size: 10px;
          font-weight: 800;
          line-height: 1.5;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }

        .bb-success-action:hover {
          transform: translateY(-3px);
          border-color: #00eaff;
          background: linear-gradient(145deg, rgba(139, 92, 246, 0.22), rgba(0, 234, 255, 0.08));
          box-shadow: 0 10px 26px rgba(0,0,0,0.25), 0 0 22px rgba(0,234,255,0.11);
        }

        .bb-success-action-icon {
          color: #67e8f9;
          font-size: 22px;
          line-height: 1;
        }

        .bb-success-action-whatsapp {
          border-color: rgba(74, 222, 128, 0.45);
          background: linear-gradient(145deg, rgba(34, 197, 94, 0.13), rgba(4, 6, 21, 0.86));
        }

        .bb-success-action-whatsapp .bb-success-action-icon { color: #86efac; }
        .bb-success-action-whatsapp:hover { border-color: #86efac; }
        .bb-success-action-receipt {
          border-color: rgba(103, 232, 249, .55);
          background: linear-gradient(145deg, rgba(8, 145, 178, .18), rgba(4, 6, 21, .86));
        }
        .bb-success-action-receipt .bb-success-action-icon { color: #67e8f9; }
        .bb-success-action-receipt:hover { border-color: #67e8f9; }

        .bb-success-action-disabled {
          opacity: 0.48;
          cursor: not-allowed;
          pointer-events: none;
        }

        @keyframes bb-success-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bb-success-modal-in {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 620px) {
          .bb-success-overlay { padding: 12px; }
          .bb-success-modal { padding: 28px 16px 20px; border-radius: 17px; }
          .bb-success-logo-shell { width: 68px; height: 68px; border-radius: 18px; margin-bottom: 14px; }
          .bb-success-message { font-size: 11px; }
          .bb-success-actions { grid-template-columns: 1fr; gap: 9px; }
          .bb-success-action { min-height: 64px; flex-direction: row; justify-content: flex-start; text-align: left; padding: 14px 16px; }
          .bb-success-action-icon { width: 28px; flex: 0 0 28px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .bb-success-overlay, .bb-success-modal, .bb-success-close, .bb-success-action {
            animation: none !important;
            transition: none !important;
          }
        }

        .reg-footer {

          max-width: 940px;

          margin: 26px auto 0;

          display: flex;

          justify-content: space-between;

          gap: 12px;

          color: rgba(196, 181, 253, 0.75);

        }

        /* ─────────────── MOBILE & TABLET OPTIMIZATION ─────────────── */

        @media (max-width: 680px) {

          .reg-page {

            padding: 20px 14px 40px;

          }

          .reg-header {

            align-items: center;

          margin-top: 110px;

          }

          .reg-brand {

            width: 64px;

            height: 64px;

            border-radius: 18px;

          }

          .reg-logo-large {

            width: 88px;

            height: 88px;

            border-radius: 22px;

          }

          .reg-header-label {

            text-align: right;

            max-width: 175px;

            line-height: 1.5;

            font-size: 9px;

          }

          .reg-container {

            margin-top: 22px;

          }

          .reg-heading h1 {

            font-size: clamp(1.65rem, 7.2vw, 2.4rem);

          }

          .reg-glass-card {

            padding: 18px 14px;

            border-radius: 15px;

          }

          .reg-card-top {

            flex-direction: column;

            gap: 12px;

          }

          .reg-fields,

          .reg-review-grid,

          .reg-qr-grid {

            grid-template-columns: 1fr;

            gap: 14px;

          }

          .reg-field input,

          .reg-field select {

            font-size: 13px;

            min-height: 48px;

          }

          .reg-footer {

            flex-direction: column;

            text-align: center;

            gap: 8px;

          }

        }

          /* ─────────────── BATTLEBLAZE UI CONSISTENCY POLISH ─────────────── */

          .reg-page {

            background-color: #05030d;

            background-image:

              radial-gradient(ellipse at 14% 7%, rgba(109, 40, 217, 0.22), transparent 36%),

              radial-gradient(ellipse at 88% 16%, rgba(0, 234, 255, 0.09), transparent 32%),

              radial-gradient(ellipse at 50% 95%, rgba(59, 130, 246, 0.12), transparent 48%),

              linear-gradient(135deg, #05030d 0%, #100821 48%, #050914 100%);

          }

          .reg-page::before {

            content: "";

            position: absolute;

            inset: 0;

            z-index: 0;

            pointer-events: none;

            opacity: 0.18;

            background-image:

              linear-gradient(rgba(139, 92, 246, 0.12) 1px, transparent 1px),

              linear-gradient(90deg, rgba(0, 234, 255, 0.08) 1px, transparent 1px);

            background-size: 48px 48px;

            mask-image: linear-gradient(to bottom, #000 0%, rgba(0, 0, 0, 0.65) 62%, transparent 100%);

          }

          .reg-header,

          .reg-container,

          .reg-footer {

            position: relative;

            z-index: 1;

          }

          .reg-brand {

            border-color: rgba(139, 92, 246, 0.58);

            background: linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(8, 12, 37, 0.78) 56%, rgba(0, 234, 255, 0.12));

            box-shadow: 0 0 28px rgba(139, 92, 246, 0.17), inset 0 1px 0 rgba(255, 255, 255, 0.08);

          }

          .reg-glass-card,

          .reg-review,

          .reg-payment-panel {

            -webkit-backdrop-filter: blur(14px);

            backdrop-filter: blur(14px);

          }

          .reg-glass-card {

            border-color: rgba(139, 92, 246, 0.5);

            background:

              linear-gradient(145deg, rgba(139, 92, 246, 0.14), rgba(8, 4, 17, 0.94) 58%, rgba(0, 234, 255, 0.055));

            box-shadow: 0 22px 52px rgba(0, 0, 0, 0.42), 0 0 30px rgba(109, 40, 217, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.065);

          }

          .reg-status {

            border-color: rgba(96, 165, 250, 0.42);

            background: linear-gradient(110deg, rgba(139, 92, 246, 0.14), rgba(59, 130, 246, 0.12));

          }

          .reg-field input,

          .reg-field select {

            border-color: rgba(139, 92, 246, 0.38);

            background: rgba(4, 4, 15, 0.82);

          }

          .reg-field input:hover,

          .reg-field select:hover {

            border-color: rgba(167, 139, 250, 0.7);

          }

          .reg-field input:focus,

          .reg-field select:focus {

            border-color: #00eaff;

            box-shadow: 0 0 0 3px rgba(0, 234, 255, 0.1), 0 0 18px rgba(139, 92, 246, 0.18);

          }

          .reg-submit {

            min-height: 52px;

            border-color: rgba(196, 181, 253, 0.62);

            border-radius: 7px;

            background: linear-gradient(105deg, #6d28d9 0%, #8b5cf6 48%, #2563eb 100%);

            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.34), 0 0 22px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.14);

          }

          .reg-submit:hover:not(:disabled) {

            border-color: #00eaff;

            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.38), 0 0 26px rgba(0, 234, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.18);

          }

          .reg-success-icon {

            border-color: rgba(0, 234, 255, 0.72);

            color: #67e8f9;

            box-shadow: 0 0 24px rgba(0, 234, 255, 0.2), 0 0 22px rgba(139, 92, 246, 0.16);

          }

          .reg-footer {

            border-top: 1px solid rgba(139, 92, 246, 0.18);

            padding-top: 16px;

          }

          .ps5-day-tabs { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin:16px 0; }
          .ps5-day-tab { min-height:44px; border:1px solid rgba(139,92,246,.45); border-radius:9px; color:#e9e4ff; background:rgba(139,92,246,.08); cursor:pointer; font-size:11px; font-weight:800; letter-spacing:.08em; }
          .ps5-day-tab.active { color:#fff; border-color:#00eaff; background:linear-gradient(105deg,rgba(109,40,217,.72),rgba(37,99,235,.55)); box-shadow:0 0 18px rgba(0,234,255,.12); }
          /* VRX setup labels are a legend, not selectable/active buttons. */
          .vrx-setup-legend { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .vrx-setup-legend .vrx-setup-label { display:flex; align-items:center; gap:9px; min-height:44px; padding:10px 12px; border:1px solid rgba(139,92,246,.38); border-radius:9px; background:rgba(139,92,246,.07); color:#e9e4ff; font-size:10px; font-weight:800; letter-spacing:.04em; line-height:1.45; }
          .vrx-setup-legend .vrx-setup-dot { flex:0 0 8px; width:8px; height:8px; border-radius:50%; }
          .vrx-setup-legend .vrx-setup-dot.vr { background:#a78bfa; box-shadow:0 0 8px rgba(167,139,250,.55); }
          .vrx-setup-legend .vrx-setup-dot.steering { background:#60a5fa; box-shadow:0 0 8px rgba(96,165,250,.55); }
          @media (max-width:620px) { .vrx-setup-legend .vrx-setup-label { font-size:9px; padding:8px; } }
          .ps5-slot-status { margin:10px 0 14px; color:#c4b5fd; font-size:10px; font-weight:800; letter-spacing:.08em; }
          .ps5-slot-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }
          .ps5-slot { display:flex; flex-direction:column; gap:7px; min-width:0; min-height:112px; padding:13px 9px; border:1px solid rgba(139,92,246,.32); border-radius:12px; background:rgba(7,5,18,.9); color:#fff; cursor:pointer; text-align:center; transition:border-color .18s ease, background .18s ease, box-shadow .18s ease, transform .18s ease; }
          .ps5-slot strong { font-size:10px; }
          .ps5-slot span { font-size:9px; line-height:1.45; color:#e5e7eb; }
          .ps5-slot small { font-size:8px; font-weight:800; color:#86efac; letter-spacing:.05em; line-height:1.45; }
          /* Separate setup identities: purple = VR, blue = Steering Wheel */
          .ps5-slot.vrx-vr { border-color:rgba(167,139,250,.72); background:linear-gradient(145deg,rgba(109,40,217,.16),rgba(7,5,18,.94) 70%); }
          .ps5-slot.vrx-vr > strong { color:#d8b4fe; }
          .ps5-slot.vrx-vr > small:first-of-type { color:#c4b5fd; }
          .ps5-slot.vrx-steering { border-color:rgba(96,165,250,.72); background:linear-gradient(145deg,rgba(37,99,235,.17),rgba(7,5,18,.94) 70%); }
          .ps5-slot.vrx-steering > strong { color:#93c5fd; }
          .ps5-slot.vrx-steering > small:first-of-type { color:#7dd3fc; }
          .ps5-slot.vrx-vr.selected { border:2px solid #c084fc; padding:12px 8px; background:linear-gradient(145deg,rgba(126,34,206,.42),rgba(7,5,18,.96)); box-shadow:0 0 18px rgba(192,132,252,.22); }
          .ps5-slot.vrx-steering.selected { border:2px solid #38bdf8; padding:12px 8px; background:linear-gradient(145deg,rgba(3,105,161,.42),rgba(7,5,18,.96)); box-shadow:0 0 18px rgba(56,189,248,.22); }
          .ps5-slot:not(.unavailable):hover { transform:translateY(-2px); }
          .ps5-slot.selected:not(.vrx-vr):not(.vrx-steering) { border-color:#00eaff; background:rgba(8,145,178,.19); box-shadow:0 0 16px rgba(0,234,255,.12); }
          .ps5-slot.unavailable { opacity:.42; cursor:not-allowed; border-color:rgba(248,113,113,.22); }
          .ps5-slot.unavailable small { color:#fca5a5; }
          @media (max-width: 620px) { .ps5-slot-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .ps5-day-tabs { gap:6px; } .ps5-day-tab { font-size:9px; } }

          @media (prefers-reduced-motion: reduce) {

            .reg-brand,

            .reg-submit,

            .reg-field input,

            .reg-field select {

              transition: none !important;

            }

          }

`}</style>

      <header className={`reg-header ${isPaymentGame || game === "PS5_RUSH" || game === "VR_EXPERIENCE" ? "reg-header-bgmi" : ""}`}>

        <div className="reg-header-branding">

          <span className="reg-header-presents">NITS ESPORTS PRESENTS</span>

          <a

            href="/"

            className={`reg-brand ${isPaymentGame || game === "PS5_RUSH" || game === "VR_EXPERIENCE" ? "reg-logo-large" : ""}`}

            aria-label="NITS Esports home"

          >

            <img src={logoUrl} alt="NITS Esports Logo" draggable="false" />

          </a>

        </div>

        <span className="reg-header-label">OFFICIAL TOURNAMENT REGISTRATION</span>

      </header>

      <section className="reg-container">

        <div className="reg-heading">

          <span className="reg-eyebrow">BATTLEBLAZE // 2026</span>

          <h1>

            PLAYER <span>REGISTRATION</span>

          </h1>

          <p>Complete the registration form for your selected tournament.</p>

        </div>

        <section className="reg-glass-card">

          <div className="reg-card-top">

            <div>

              <span className="reg-card-index">

                TOURNAMENT / 0{Object.keys(tournaments).indexOf(game) + 1}

              </span>

              <h2>

                {current.title} <span>REGISTRATION</span>

              </h2>

              <p>{current.subtitle}</p>

            </div>

            <div className="reg-status">

              <span />

              REGISTRATION FORM

            </div>

          </div>

          <div className="reg-divider" />

          {game === "BGMI" ? (

            <div
              role="status"
              aria-live="polite"
              style={{
                padding: "clamp(24px, 5vw, 48px) 20px",
                textAlign: "center",
                border: "1px solid rgba(196, 181, 253, 0.42)",
                borderRadius: "14px",
                background: "rgba(139, 92, 246, 0.09)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: "64px",
                  height: "64px",
                  margin: "0 auto 20px",
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid #a78bfa",
                  borderRadius: "50%",
                  color: "#c4b5fd",
                  fontSize: "30px",
                  fontWeight: 800,
                }}
              >
                ×
              </div>
              <span className="reg-eyebrow">BATTLEBLAZE 2026 • BGMI REGISTRATION STATUS</span>
              <h2 style={{ margin: "14px 0", color: "#fff", fontSize: "clamp(20px, 3vw, 30px)" }}>
                REGISTRATION CLOSED
              </h2>
              <p style={{ margin: "0 auto", maxWidth: "620px", color: "rgba(255,255,255,.8)", lineHeight: 1.8, fontSize: "clamp(12px, 1.4vw, 15px)" }}>
                Further details will be shared soon.
              </p>
            </div>

          ) : success ? (

            <div className="reg-success">

              <div className="reg-success-icon">✓</div>

              <span className="reg-eyebrow">FORM COMPLETED</span>

              <h2>YOU'RE ALMOST IN.</h2>

              <p>

                {isPaymentGame

                  ? "Your tournament registration has been saved successfully."

                  : "Your form was completed successfully."}

              </p>

              <button

                className="reg-submit"

                onClick={() => setSuccess(false)}

                type="button"

              >

                EDIT REGISTRATION <span>↗</span>

              </button>

            </div>

          ) : (

            <form onSubmit={handleSubmit}>

              <div className="reg-section-label">

                <span>01</span> PLAYER INFORMATION

              </div>

              {isPaymentGame && (

                <p className="reg-payment-note">

                  {game === "BGMI"

                    ? "Register at least one player. For every player you add, both full name and IGN are required."

                    : game === "MOBILE_LEGENDS"

                    ? "All five players must provide their full name and IGN."

                    : game === "VALORANT"

                    ? "At least one player is required. Player 1 / IGL must have a name and Riot ID. Players 2–5 are optional, but if you start entering any player’s details, both that player’s name and Riot ID must be completed. Only the IGL email is required; no other player email fields are collected."

                    : game === "FIFA"

                    ? "Complete the single-player registration with player name, email address and contact number 1. Contact number 2 is optional."

                    : "Enter the mandatory team name, player name, player UID, email address and contact number 1. Contact number 2 is optional."}{" "}

                  Contact number 1 is mandatory.

                </p>

              )}

              <div className="reg-fields">

                {(isPaymentGame

                  ? (game === "RC"

                      ? ["teamName", "playerName", "gameId", "email", "phone", "phone2"]

                      : game === "FIFA"

                      ? ["playerName", "email", "phone", "phone2"]

                      : [

                          "teamName",

                          "iglName",

                          "player2Name",

                          "player3Name",

                          "player4Name",

                          ...(["MOBILE_LEGENDS", "VALORANT"].includes(game) ? ["player5Name"] : []),

                          "iglIgn",

                          "player2Ign",

                          "player3Ign",

                          "player4Ign",

                          ...(["MOBILE_LEGENDS", "VALORANT"].includes(game) ? ["player5Ign"] : []),

                          "iglEmail",

                          "substituteName",

                          "substituteIgn",

                          "phone1",

                          "phone2",

                        ]

                    )

                      .map((name) => current.fields.find((field) => field.name === name))

                      .filter(Boolean)

                  : current.fields

                ).map((field) => {

                  const optional = isOptional(field);

                  const isPhoneField = ["phone", "phone1", "phone2"].includes(field.name);

                  const sectionHeading = isPaymentGame

                    ? {

                        teamName: "TEAM DETAILS",

                        playerName: game === "FIFA" ? "PLAYER DETAILS" : undefined,

                        email: game === "FIFA" ? "CONTACT DETAILS" : undefined,

                        iglName: "PLAYER NAMES",

                        iglIgn: "IN-GAME NAMES / RIOT IDs",

                        iglEmail: "IGL EMAIL",

                        substituteName: "SUBSTITUTE PLAYER",

                        phone1: "CONTACT DETAILS",

                      }[field.name]

                    : null;

                  return (

                    <Fragment key={`${game}-${field.name}-group`}>

                      {sectionHeading && (

                        <div

                          className="reg-section-label reg-subsection-heading"

                          key={`${game}-${field.name}-section`}

                        >

                          <span>◆</span> {sectionHeading}

                        </div>

                      )}

                      <label

                        className={`reg-field ${

                          field.name === "teamName" || field.name === "captain"

                            ? "reg-field-half"

                            : ""

                        }`}

                        key={`${game}-${field.name}`}

                      >

                        <span>

                          {field.label}

                          {!optional && <b> *</b>}

                        </span>

                        {field.options ? (

                          <select

                            required={!optional}

                            value={form[field.name] || ""}

                            onChange={(e) =>

                              setForm({ ...form, [field.name]: e.target.value })

                            }

                          >

                            <option value="">Select an option</option>

                            {field.options.map((option) => (

                              <option key={option} value={option}>

                                {option}

                              </option>

                            ))}

                          </select>

                        ) : (

                          <input

                            type={field.type || "text"}

                            inputMode={isPhoneField ? "numeric" : undefined}

                            placeholder={field.placeholder}

                            required={!optional}

                            value={form[field.name] || ""}

                            onChange={(e) =>

                              setForm({ ...form, [field.name]: e.target.value })

                            }

                            maxLength={isPhoneField ? 10 : undefined}

                            pattern={isPhoneField ? "[0-9]{10}" : undefined}

                          />

                        )}

                      </label>

                    </Fragment>

                  );

                })}

              </div>

              {(game === "PS5_RUSH" || game === "VR_EXPERIENCE") && (
                <>
                  <div className="reg-divider" />
                  <section className="reg-payment-panel">
                    <div className="reg-section-label"><span>02</span> SELECT DAY & TIME SLOTS</div>
                    <p className="reg-payment-note">{game === "PS5_RUSH" ? "Choose SOLO or DUO, then select multiple available 30-minute slots across Days 1–4 (10:00 AM–8:00 PM). You can book slots day-wise in one registration; all selected slots are combined into one booking with one total payment and one payment screenshot." : "Each day has 40 bookable slots: 20 PS5 with VR slots and 20 PS5 with Steering Wheel slots. Each slot lasts 30 minutes from 10:00 AM to 8:00 PM. Select any available slots from either setup across Days 1–4; all selected slots are combined into one booking with one total payment and one screenshot."}</p>
                    {game === "VR_EXPERIENCE" ? <div className="ps5-day-tabs vrx-setup-legend" aria-label="VRXperience setup price legend">
                      <div className="vrx-setup-label"><span className="vrx-setup-dot vr" aria-hidden="true" />VR SLOTS · ₹200 EACH</div>
                      <div className="vrx-setup-label"><span className="vrx-setup-dot steering" aria-hidden="true" />STEERING WHEEL · ₹150 EACH</div>
                    </div> : <div className="ps5-day-tabs" role="group" aria-label="Choose PS5 Rush booking type">
                      <button type="button" className={`ps5-day-tab ${ps5BookingType === "SOLO" ? "active" : ""}`} onClick={() => { setPs5BookingType("SOLO"); setFormError(""); }}>SOLO · ₹100 / SLOT</button>
                      <button type="button" className={`ps5-day-tab ${ps5BookingType === "DUO" ? "active" : ""}`} onClick={() => { setPs5BookingType("DUO"); setFormError(""); }}>DUO · ₹150 / SLOT</button>
                    </div>}
                    <div className="ps5-day-tabs">
                      {PS5_DAYS.map((day) => <button key={day} type="button" className={`ps5-day-tab ${ps5Day === day ? "active" : ""}`} onClick={() => { setPs5Day(day); setFormError(""); }}>DAY {day}</button>)}
                    </div>
                    <div className="ps5-slot-status">{ps5SlotsLoading ? "LOADING LIVE AVAILABILITY…" : ps5Slots.length === 0 ? `NO SLOTS FOUND FOR DAY ${ps5Day} — CHECK SLOT TABLE DATA` : ps5DayOpen ? `DAY ${ps5Day} — ${(ps5SelectedSlots[ps5Day] || []).length} SELECTED · ₹${(ps5SelectedSlots[ps5Day] || []).reduce((sum, slot) => sum + getSelectedSlotPrice(slot), 0)} · TOTAL ${Object.values(ps5SelectedSlots).reduce((sum, slots) => sum + slots.length, 0)} SLOTS` : `DAY ${ps5Day} IS CLOSED — ENABLE SLOTS IN SUPABASE`}</div>
                    <div className="ps5-slot-grid">
                      {ps5Slots.map((slot) => {
                        const selectedForDay = ps5SelectedSlots[ps5Day] || [];
                        const selected = selectedForDay.some((item) => item.id === slot.id);
                        const unavailable = slot.is_booked || !slot.is_open;
                        const timeLabel = (value) => {
                          const [hh, mm] = String(value).split(":").map(Number);
                          const hour = hh % 12 || 12;
                          return `${hour}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`;
                        };
                        const isVrx = game === "VR_EXPERIENCE";
                        const setupType = slot.setup_type || "PS5_WITH_VR";
                        const isSteering = setupType === "PS5_WITH_STEERING_WHEEL";
                        const setupClass = isVrx ? (isSteering ? "vrx-steering" : "vrx-vr") : "";
                        return <button key={slot.id} type="button" className={`ps5-slot ${setupClass} ${selected ? "selected" : ""} ${unavailable ? "unavailable" : ""}`} disabled={unavailable || ps5SlotsLoading} onClick={() => { setPs5SelectedSlots((old) => { const currentDaySlots = old[ps5Day] || []; const nextDaySlots = selected ? currentDaySlots.filter((item) => item.id !== slot.id) : [...currentDaySlots, { id: slot.id, day_number: ps5Day, slot_number: slot.slot_number, start_time: slot.start_time, end_time: slot.end_time, ...(isVrx ? { setup_type: setupType } : { booking_type: ps5BookingType }) }]; return { ...old, [ps5Day]: nextDaySlots }; }); setFormError(""); }}>
                          <strong>{isVrx ? (isSteering ? "STEERING · SLOT " : "VR · SLOT ") : "SLOT "}{slot.slot_number}</strong><span>{timeLabel(slot.start_time)} – {timeLabel(slot.end_time)}</span>{isVrx && <small>{isSteering ? "STEERING WHEEL · ₹150" : "PS5 WITH VR · ₹200"}</small>}<small>{!slot.is_open ? "CLOSED" : slot.is_booked ? "BOOKED" : selected ? (isVrx ? "✓ SELECTED" : `✓ SELECTED · ${(selectedForDay.find((item) => item.id === slot.id)?.booking_type || ps5BookingType)} ₹${getSelectedSlotPrice(selectedForDay.find((item) => item.id === slot.id) || { booking_type: ps5BookingType })}`) : "AVAILABLE"}</small>
                        </button>;
                      })}
                    </div>
                    <div className="reg-divider" />
                    <div className="reg-section-label"><span>03</span> REVIEW YOUR BOOKING</div>
                    {game === "VR_EXPERIENCE" && <div className="reg-review-item"><small>SETUP BREAKDOWN</small><strong>{Object.values(ps5SelectedSlots).flat().filter((slot) => (slot.setup_type || "PS5_WITH_VR") === "PS5_WITH_VR").length} VR slots · {Object.values(ps5SelectedSlots).flat().filter((slot) => slot.setup_type === "PS5_WITH_STEERING_WHEEL").length} steering-wheel slots</strong></div>}
                    {game === "PS5_RUSH" && <div className="reg-review-item"><small>SELECT TYPE FOR THE NEXT SLOT</small><strong>SOLO · ₹100 / SLOT &nbsp; | &nbsp; DUO · ₹150 / SLOT</strong><small>Choose SOLO or DUO above before selecting each slot. You can mix SOLO and DUO slots across any day, and change the type of an already-selected slot below.</small></div>}
                    <div className="reg-review-grid">
                      <div className="reg-review-item"><small>PLAYER NAME</small><strong>{form.playerName || "—"}</strong></div>
                      <div className="reg-review-item"><small>EMAIL ADDRESS</small><strong>{form.email || "—"}</strong></div>
                      <div className="reg-review-item"><small>CONTACT NUMBER 1</small><strong>{form.phone || "—"}</strong></div>
                      <div className="reg-review-item"><small>CONTACT NUMBER 2</small><strong>{form.phone2 || "Not provided"}</strong></div>
                      <div className="reg-review-item"><small>BOOKING DAYS</small><strong>{PS5_DAYS.filter((day) => (ps5SelectedSlots[day] || []).length).map((day) => `DAY ${day} (${ps5SelectedSlots[day].length} slots)`).join(", ") || "No days selected"}</strong></div>
                      <div className="reg-selected-slots">
                        <div className="reg-selected-slots-heading">
                          <span>YOUR SELECTED SLOT SCHEDULE</span>
                          <span className="reg-selected-slots-count">{ps5TotalSelectedSlots} SLOT{ps5TotalSelectedSlots === 1 ? "" : "S"} SELECTED</span>
                        </div>
                        {PS5_DAYS.filter((day) => (ps5SelectedSlots[day] || []).length > 0).length ? (
                          PS5_DAYS.filter((day) => (ps5SelectedSlots[day] || []).length > 0).map((day) => {
                            const daySlots = [...(ps5SelectedSlots[day] || [])].sort((a, b) => a.slot_number - b.slot_number);
                            const formatTime = (value) => { const [hh, mm] = String(value).split(":").map(Number); const hour = hh % 12 || 12; return `${hour}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`; };
                            return (
                              <div className="reg-selected-day" key={day}>
                                <div className="reg-selected-day-title"><span>DAY {day}</span><span>{daySlots.length} SLOT{daySlots.length === 1 ? "" : "S"}</span></div>
                                <div className="reg-selected-slot-list">
                                  {daySlots.map((slot) => (
                                    <div className="reg-selected-slot-chip" key={slot.id}>
                                      <b>DAY {day} · SLOT {slot.slot_number}</b>
                                      <span>{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
                                      {game === "VR_EXPERIENCE" ? (
                                        <>
                                          <small className="reg-slot-setup">
                                            {(slot.setup_type || "PS5_WITH_VR") === "PS5_WITH_VR" ? "PS5 WITH VR" : "PS5 WITH STEERING WHEEL"}
                                          </small>
                                          <strong className="reg-slot-price">₹{getSelectedSlotPrice(slot)} / 30 MIN</strong>
                                        </>
                                      ) : (
                                        <>
                                          <small className="reg-slot-setup">
                                            {(slot.booking_type || ps5BookingType) === "DUO" ? "DUO BOOKING · 2 PLAYERS" : "SOLO BOOKING · 1 PLAYER"}
                                          </small>
                                          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                                            <button type="button" className={`ps5-day-tab ${(slot.booking_type || ps5BookingType) === "SOLO" ? "active" : ""}`} onClick={() => setSelectedSlotBookingType(day, slot.id, "SOLO")}>SOLO ₹100</button>
                                            <button type="button" className={`ps5-day-tab ${(slot.booking_type || ps5BookingType) === "DUO" ? "active" : ""}`} onClick={() => setSelectedSlotBookingType(day, slot.id, "DUO")}>DUO ₹150</button>
                                          </div>
                                          <strong className="reg-slot-price">₹{getSelectedSlotPrice(slot)} / SLOT</strong>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        ) : <div className="reg-selected-empty">No slots selected yet. Choose one or more available slots above. Your selected slots will appear here, grouped by day.</div>}
                      </div>
                      <div className="reg-review-item"><small>TOTAL SLOT FEE</small><strong>₹{ps5TotalFee} ({ps5TotalSelectedSlots} slots{game === "VR_EXPERIENCE" ? "; setup-wise pricing" : ` · ${Object.values(ps5SelectedSlots).flat().filter((slot) => (slot.booking_type || ps5BookingType) === "SOLO").length} SOLO × ₹100 + ${Object.values(ps5SelectedSlots).flat().filter((slot) => (slot.booking_type || ps5BookingType) === "DUO").length} DUO × ₹150`})</strong></div>
                    </div>
                    <label className="reg-consent reg-review-consent"><input type="checkbox" checked={reviewConfirmed} onChange={(e) => setReviewConfirmed(e.target.checked)} /><span>I have reviewed my details and selected slot times and confirm they are correct. <b>*</b></span></label>
                  </section>
                  <div className="reg-divider" />
                  <section className="reg-payment-panel">
                    <div className="reg-section-label"><span>04</span> PAYMENT DETAILS</div>
                    <p className="reg-payment-amount">TOTAL REGISTRATION FEE: <strong>₹{ps5TotalFee}</strong></p>
                    <p className="reg-payment-note">{game === "VR_EXPERIENCE" ? "VR slots cost ₹200 each and steering-wheel slots cost ₹150 each." : `SOLO slots cost ₹100 each and DUO slots cost ₹150 each. The total above includes the price of every selected slot.`} Pay once for all selected days and setups, then upload one payment screenshot. Accepted formats: JPG, PNG or WEBP.</p>
                    <div className="reg-qr-grid">
                      <div className="reg-qr-slot"><strong>PAYMENT QR</strong><img src={rampageQR} alt={game === "VR_EXPERIENCE" ? "VRXperience payment QR" : "PS5 Rush payment QR"} loading="lazy" /><span>{game === "VR_EXPERIENCE" ? "Pay the combined total shown above." : `SOLO ₹100 / slot · DUO ₹150 / slot. Pay the combined total shown above.`}</span></div>
                      <div className="reg-qr-slot"><strong>ALTERNATE PAYMENT QR</strong><img src={rampageQR2} alt="Alternate payment QR" loading="lazy" /><span>Use either QR code.</span></div>
                    </div>
                    <label className="reg-field reg-payment-upload"><span>PAYMENT SCREENSHOT <b>*</b></span><input type="file" accept="image/png,image/jpeg,image/webp" required onChange={(e) => { setPaymentProof(e.target.files?.[0] || null); setFormError(""); }} /></label>
                  </section>
                </>
              )}

              {isPaymentGame && (

                <>

                  <div className="reg-divider" />

                  <section className="reg-review">

                    <div className="reg-section-label">

                      <span>02</span> REVIEW YOUR ENTRIES

                    </div>

                    <p className="reg-payment-note">

                      Please verify the details below before confirming your registration.

                    </p>

                    <div className="reg-review-grid">

                      {(game === "RC"

                        ? [

                            ["TEAM NAME", form.teamName],

                            ["PLAYER NAME", form.playerName],

                            ["PLAYER UID", form.gameId],

                            ["EMAIL ADDRESS", form.email],

                            ["CONTACT NUMBER 1", form.phone],

                            ["CONTACT NUMBER 2", form.phone2],

                          ]

                        : game === "FIFA"

                        ? [

                            ["PLAYER NAME", form.playerName],

                            ["EMAIL ADDRESS", form.email],

                            ["CONTACT NUMBER 1", form.phone],

                            ["CONTACT NUMBER 2", form.phone2],

                          ]

                        : [

                            ["TEAM NAME", form.teamName],

                            ["PLAYER 1 / IGL NAME", form.iglName],

                            ["PLAYER 1 / IGL IGN", form.iglIgn],

                            ["PLAYER 2 NAME", form.player2Name],

                            ["PLAYER 2 IGN", form.player2Ign],

                            ["PLAYER 3 NAME", form.player3Name],

                            ["PLAYER 3 IGN", form.player3Ign],

                            ["PLAYER 4 NAME", form.player4Name],

                            ["PLAYER 4 IGN", form.player4Ign],

                            ...(["MOBILE_LEGENDS", "VALORANT"].includes(game)

                              ? [

                                  ["PLAYER 5 NAME", form.player5Name],

                                  ["PLAYER 5 IGN / RIOT ID", form.player5Ign],

                                ]

                              : []),

                            ["IGL EMAIL", form.iglEmail],

                            ["CONTACT NUMBER 1", form.phone1],

                            ["CONTACT NUMBER 2", form.phone2],

                            ["SUBSTITUTE NAME", form.substituteName],

                            ["SUBSTITUTE IGN", form.substituteIgn],

                          ]

                      )

                        .filter(([, value]) => String(value || "").trim())

                        .map(([label, value]) => (

                          <div className="reg-review-item" key={label}>

                            <small>{label}</small>

                            <strong>{value}</strong>

                          </div>

                        ))}

                    </div>

                    <label className="reg-consent reg-review-consent">

                      <input

                        type="checkbox"

                        checked={reviewConfirmed}

                        onChange={(e) => setReviewConfirmed(e.target.checked)}

                      />

                      <span>

                        I have reviewed the entries above and confirm that all information is correct.{" "}

                        <b>*</b>

                      </span>

                    </label>

                  </section>

                  {requiresPayment ? (
                    <>
                      <div className="reg-divider" />
                      <section className="reg-payment-panel">
                        <div className="reg-section-label">
                          <span>03</span> PAYMENT DETAILS
                        </div>
                        <p className="reg-payment-amount">
                          REGISTRATION FEE:{" "}
                          <strong>₹100 PER TEAM</strong>
                        </p>
                        <p className="reg-payment-note">
                          Complete the ₹100 team payment, then upload the payment screenshot. Accepted formats: JPG, PNG or WEBP.
                        </p>
                        <div className="reg-qr-grid" aria-label="Payment QR codes">
                          <div className="reg-qr-slot">
                            <strong>PAYMENT QR — SLOT 1</strong>
                            <img
                              src={rampageQR}
                              alt="Rampage payment QR code 1"
                              loading="lazy"
                              decoding="async"
                            />
                            <span>Scan this QR to pay the registration fee.</span>
                          </div>
                          <div className="reg-qr-slot">
                            <strong>PAYMENT QR — SLOT 2</strong>
                            <img
                              src={rampageQR2}
                              alt="Rampage payment QR code 2"
                              loading="lazy"
                              decoding="async"
                            />
                            <span>Alternate payment QR.</span>
                          </div>
                        </div>
                        <label className="reg-field reg-payment-upload">
                          <span>PAYMENT SCREENSHOT <b>*</b></span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            required
                            onChange={(e) => {
                              setPaymentProof(e.target.files?.[0] || null);
                              setFormError("");
                            }}
                          />
                        </label>
                      </section>
                    </>
                  ) : (
                    <>
                      <div className="reg-divider" />
                      <section className="reg-payment-panel reg-free-registration-panel">
                        <div className="reg-section-label">
                          <span>03</span> REGISTRATION FEE
                        </div>
                        <p className="reg-payment-amount">
                          REGISTRATION FEE: <strong>FREE</strong>
                        </p>
                        <p className="reg-payment-note">
                          {current.title} registration is free. No payment or payment screenshot is required.
                        </p>
                      </section>
                    </>
                  )}

                </>

              )}

              {formError && (

                <div className="reg-form-error" role="alert">

                  {formError}

                </div>

              )}

              <div className="reg-divider" />

              <label className="reg-consent">

                <input type="checkbox" required />

                <span>

                  I agree to follow the official tournament rules and understand that incorrect registration details may lead to disqualification.

                </span>

              </label>

              <button className="reg-submit" type="submit" disabled={isSubmitting}>

                {isSubmitting ? "SUBMITTING..." : "COMPLETE REGISTRATION"} <span>↗</span>

              </button>

              <p className="reg-footnote">

                PLEASE VERIFY ALL DETAILS BEFORE SUBMITTING.

              </p>

            </form>

          )}

        </section>

        <footer className="reg-footer">

          <span>NITS ESPORTS · BATTLEBLAZE 2026</span>

          <span>PLAY FAIR. PLAY TO WIN.</span>

        </footer>

      </section>

    </main>

    {success && typeof document !== "undefined" && createPortal(
      <div className="bb-success-overlay">
        <section
          className="bb-success-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bb-success-title"
          aria-describedby="bb-success-message"
        >
          <button
            className="bb-success-close"
            type="button"
            aria-label="Close registration success popup"
            onClick={() => {
              setSuccess(false);
              setForm({});
              setPaymentProof(null);
              setReviewConfirmed(false);
              setFormError("");
            }}
          >
            ×
          </button>

          <div className="bb-success-logo-shell">
            <img src={logoUrl} alt="NITS Esports logo" draggable="false" />
          </div>
          <div className="bb-success-check" aria-hidden="true">✓</div>
          <span className="bb-success-kicker">BATTLEBLAZE 2026 · REGISTRATION CONFIRMED</span>
          <h2 className="bb-success-title" id="bb-success-title">REGISTRATION SUCCESSFUL</h2>
          <p className="bb-success-message" id="bb-success-message">
            {(game === "PS5_RUSH" || game === "VR_EXPERIENCE")
              ? `Your ${game === "VR_EXPERIENCE" ? "VRXperience" : "PS5 Rush"} booking has been submitted for ${Object.values(ps5SelectedSlots).reduce((sum, slots) => sum + slots.length, 0)} slot(s). ${game === "VR_EXPERIENCE" ? `Setup breakdown: ${Object.values(ps5SelectedSlots).flat().filter((slot) => (slot.setup_type || "PS5_WITH_VR") === "PS5_WITH_VR").length} VR slot(s), ${Object.values(ps5SelectedSlots).flat().filter((slot) => slot.setup_type === "PS5_WITH_STEERING_WHEEL").length} steering-wheel slot(s).` : `Booking types: ${[...new Set(Object.values(ps5SelectedSlots).flat().map((slot) => slot.booking_type || ps5BookingType))].join(" + ")}.`} Total fee: ₹${ps5TotalFee}. Welcome to the arena!`
              : `Your ${current.title} registration has been submitted successfully. Welcome to the arena!`}
          </p>
          <div className="bb-success-name-card">
            <span>{successNameType}</span>
            <strong>{successDisplayName}</strong>
          </div>

          {(game === "PS5_RUSH" || game === "VR_EXPERIENCE") && (
            <div className="bb-success-venue">
              <span>EVENT VENUE</span>
              <strong>NEW GALLERY G301</strong>
            </div>
          )}

          {(game === "PS5_RUSH" || game === "VR_EXPERIENCE") && (() => {
            const bookedDays = PS5_DAYS
              .map((day) => ({ day, slots: [...(ps5SelectedSlots[day] || [])].sort((a, b) => a.slot_number - b.slot_number) }))
              .filter((entry) => entry.slots.length > 0);
            const totalSlots = bookedDays.reduce((sum, entry) => sum + entry.slots.length, 0);
            return (
              <section className="bb-ps5-booking-summary" aria-label={game === "VR_EXPERIENCE" ? "Confirmed VRXperience slots" : "Confirmed PS5 Rush slots"}>
                <div className="bb-ps5-booking-heading">
                  <span>{game === "VR_EXPERIENCE" ? "YOUR CONFIRMED VRXPERIENCE SLOTS" : "YOUR CONFIRMED PS5 RUSH SLOTS"}</span>
                  <span>{game === "VR_EXPERIENCE" ? `${Object.values(ps5SelectedSlots).flat().filter((slot) => (slot.setup_type || "PS5_WITH_VR") === "PS5_WITH_VR").length} VR · ${Object.values(ps5SelectedSlots).flat().filter((slot) => slot.setup_type === "PS5_WITH_STEERING_WHEEL").length} STEERING` : `${Object.values(ps5SelectedSlots).flat().filter((slot) => (slot.booking_type || ps5BookingType) === "SOLO").length} SOLO · ${Object.values(ps5SelectedSlots).flat().filter((slot) => (slot.booking_type || ps5BookingType) === "DUO").length} DUO`} · {totalSlots} SLOT{totalSlots === 1 ? "" : "S"}</span>
                </div>
                {bookedDays.map(({ day, slots }) => (
                  <div className="bb-ps5-day-booking" key={day}>
                    <h3>DAY {day} · {slots.length} SLOT{slots.length === 1 ? "" : "S"}</h3>
                    <div className="bb-ps5-slot-list">
                      {slots.map((slot) => {
                        const timeLabel = (value) => {
                          const [hh, mm] = String(value).split(":").map(Number);
                          return `${hh % 12 || 12}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`;
                        };
                        return <div className="bb-ps5-slot-item" key={slot.id}>
                          <strong>SLOT {slot.slot_number} · ₹{getSelectedSlotPrice(slot)}</strong>
                          {game === "VR_EXPERIENCE" ? (
                            <em>{(slot.setup_type || "PS5_WITH_VR") === "PS5_WITH_VR" ? "PS5 WITH VR" : "PS5 WITH STEERING WHEEL"}</em>
                          ) : (
                            <em>{(slot.booking_type || ps5BookingType) === "DUO" ? "DUO BOOKING · 2 PLAYERS · ₹150" : "SOLO BOOKING · 1 PLAYER · ₹100"}</em>
                          )}
                          <span>{timeLabel(slot.start_time)} – {timeLabel(slot.end_time)}</span>
                        </div>;
                      })}
                    </div>
                  </div>
                ))}
                <div className="bb-ps5-total-row"><span>TOTAL BOOKING FEE</span><strong>₹{ps5TotalFee}</strong></div>
              </section>
            );
          })()}
          <div className="bb-success-actions">
            {(game === "PS5_RUSH" || game === "VR_EXPERIENCE") && (
              <button
                className="bb-success-action bb-success-action-receipt"
                type="button"
                onClick={downloadBookingReceipt}
                title="Download your booking receipt as a PNG image"
              >
                <span className="bb-success-action-icon" aria-hidden="true">⇩</span>
                <span>DOWNLOAD RECEIPT (PNG)</span>
              </button>
            )}
            <a
              className={`bb-success-action bb-success-action-whatsapp ${whatsappGroupUrl ? "" : "bb-success-action-disabled"}`}
              href={whatsappGroupUrl || undefined}
              target={whatsappGroupUrl ? "_blank" : undefined}
              rel={whatsappGroupUrl ? "noopener noreferrer" : undefined}
              aria-disabled={!whatsappGroupUrl}
              title={whatsappGroupUrl ? `Join the ${current.title} WhatsApp group` : "WhatsApp group link is not configured for this game"}
            >
              <span className="bb-success-action-icon" aria-hidden="true">☏</span>
              <span>JOIN WHATSAPP GROUP</span>
            </a>
            <a className="bb-success-action" href="/battleblaze#modules">
              <span className="bb-success-action-icon" aria-hidden="true">⌘</span>
              <span>EXPLORE OTHER MODULES</span>
            </a>
            <a className="bb-success-action" href="/battleblaze">
              <span className="bb-success-action-icon" aria-hidden="true">↗</span>
              <span>EXPLORE BATTLEBLAZE</span>
            </a>
          </div>

          {(game === "PS5_RUSH" || game === "VR_EXPERIENCE") && (
            <p
              className="bb-success-receipt-note"
              role="note"
              style={{
                margin: "18px 0 0",
                padding: "14px 16px",
                border: "1px solid rgba(96, 165, 250, 0.42)",
                borderRadius: "12px",
                background: "linear-gradient(110deg, rgba(109,40,217,0.18), rgba(3,105,161,0.16))",
                color: "#dbeafe",
                fontSize: "12px",
                lineHeight: 1.7,
                textAlign: "center",
                letterSpacing: "0.04em",
              }}
            >
              <strong style={{ color: "#a5f3fc" }}>IMPORTANT NOTE:</strong>{" "}
              Please download and save your receipt. If downloading the receipt is not available, you can take a screenshot of this popup and show it at the venue for verification. This applies to both PS5 RUSH and VRXPERIENCE.
            </p>
          )}
        </section>
      </div>,
      document.body
    )}
    </Fragment>

  );

}
