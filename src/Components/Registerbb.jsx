import { Fragment, useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

import { createClient } from "@supabase/supabase-js";

import logoUrl from "../assets/logoo2.png";

import rampageQR from "../assets/rqr.png";


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY

  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

  : null;

const RAMPAGE_REGISTRATION_TABLE = "rampage_registrations";

const RAMPAGE_PAYMENT_BUCKET = "rampage-payment-proofs";


const tournaments = {

  BGMI: {

    title: "BGMI",

    subtitle: "BATTLEGROUNDS MOBILE INDIA • RAMPAGE 2026",

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

    subtitle: "EA SPORTS FC / FIFA",

    fields: [

      { name: "playerName", label: "PLAYER NAME", placeholder: "Your full name" },

      { name: "email", label: "EMAIL ADDRESS", placeholder: "you@example.com", type: "email" },

      { name: "phone", label: "CONTACT NUMBER", placeholder: "10-digit mobile number", type: "tel" },

      { name: "gameId", label: "IN-GAME ID", placeholder: "Your EA ID / Gamer tag" },

      { name: "platform", label: "PLATFORM", options: ["PC", "PlayStation", "Xbox", "Other"] },

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

    title: "VR EXPERIENCE",

    subtitle: "IMMERSIVE VIRTUAL REALITY",

    fields: [

      { name: "playerName", label: "PLAYER NAME", placeholder: "Your full name" },

      { name: "email", label: "EMAIL ADDRESS", placeholder: "you@example.com", type: "email" },

      { name: "phone", label: "CONTACT NUMBER", placeholder: "10-digit mobile number", type: "tel" },

      { name: "slot", label: "PREFERRED SLOT", options: ["Morning", "Afternoon", "Evening"] },

      { name: "experience", label: "VR EXPERIENCE", options: ["VR Gaming", "VR Simulation", "Any Available Experience"] },

    ],

  },

  PS5_RUSH: {

    title: "PS5 RUSH",

    subtitle: "PLAYSTATION 5 CONSOLE CHALLENGE",

    fields: [

      { name: "playerName", label: "PLAYER NAME", placeholder: "Your full name" },

      { name: "email", label: "EMAIL ADDRESS", placeholder: "you@example.com", type: "email" },

      { name: "phone", label: "CONTACT NUMBER", placeholder: "10-digit mobile number", type: "tel" },

      { name: "gameId", label: "GAMER TAG (OPTIONAL)", placeholder: "Your gamer tag" },

      { name: "game", label: "PREFERRED GAME", options: ["EA Sports FC / FIFA", "Tekken", "Mortal Kombat", "Other"] },

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

  const query = typeof search === "string"

    ? search

    : (typeof window !== "undefined" ? window.location.search : "");

  const requestedGame = new URLSearchParams(query).get("game");

  const normalized = (requestedGame || "BGMI").trim().toUpperCase().replace(/[\s-]+/g, "_");


  // Accept common URL variations while keeping Battleblaze module keys supported.

  const aliases = {

    "FF": "FREE_FIRE",

    "FREEFIRE": "FREE_FIRE",

    "FREE_FIRE": "FREE_FIRE",

    "MLBB": "MOBILE_LEGENDS",

    "MOBILELEGENDS": "MOBILE_LEGENDS",

    "MOBILE_LEGENDS": "MOBILE_LEGENDS",

    "VR": "VR_EXPERIENCE",

    "VR_EXPERIENCE": "VR_EXPERIENCE",

    "PS5": "PS5_RUSH",

    "PS5_RUSH": "PS5_RUSH",

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


  // Select the correct form from the route query. No in-form game switching.

  useEffect(() => {

    setGame(getRequestedGame(location.search));

    setForm({});

    setPaymentProof(null);

    setReviewConfirmed(false);

    setFormError("");

    setSuccess(false);

  }, [location.search]);


  const current = tournaments[game];


  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const paymentGames = ["BGMI", "MOBILE_LEGENDS", "VALORANT", "RC"];
    if (paymentGames.includes(game)) {
      if (isSubmitting) return;

      const isRC = game === "RC";
      const playerCount = game === "MOBILE_LEGENDS" || game === "VALORANT" ? 5 : game === "BGMI" ? 4 : 1;
      const fee = game === "MOBILE_LEGENDS" ? 50 : 40;
      const player1Name = (isRC ? form.playerName : form.iglName || "").trim();
      const player1Ign = (isRC ? form.gameId : form.iglIgn || "").trim();
      const email = (isRC ? form.email : form.iglEmail || "").trim();
      const phone1 = isRC ? form.phone : form.phone1;

      if (!form.teamName?.trim()) {
        setFormError("TEAM NAME IS REQUIRED.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFormError("A VALID EMAIL ADDRESS IS REQUIRED.");
        return;
      }
      if (!player1Name || !player1Ign) {
        setFormError(isRC ? "PLAYER NAME AND PLAYER UID ARE REQUIRED." : "PLAYER 1 / IGL NAME AND IN-GAME NAME / RIOT ID ARE REQUIRED.");
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
          setFormError(game === "VALORANT" ? `PLAYER ${i}: IF YOU ENTER THIS PLAYER, BOTH FULL NAME AND RIOT ID ARE REQUIRED.` : `PLAYER ${i}: ENTER BOTH NAME AND IN-GAME NAME / RIOT ID, OR LEAVE BOTH EMPTY.`);
          return;
        }
      }

      const substituteName = (form.substituteName || "").trim();
      const substituteIgn = (form.substituteIgn || "").trim();
      if (!isRC && Boolean(substituteName) !== Boolean(substituteIgn)) {
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
      if (!paymentProof) {
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
        const safeFileName = paymentProof.name.toLowerCase().replace(/[^a-z0-9.\_-]/g, "-");
        const uniqueId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        uploadedProofPath = `rampage-2026/${Date.now()}-${uniqueId}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from(RAMPAGE_PAYMENT_BUCKET)
          .upload(uploadedProofPath, paymentProof, {
            cacheControl: "3600",
            upsert: false,
            contentType: paymentProof.type || "application/octet-stream",
          });
        if (uploadError) throw new Error(`PAYMENT PROOF UPLOAD FAILED: ${uploadError.message}`);

        const { error: insertError } = await supabase
          .from(RAMPAGE_REGISTRATION_TABLE)
          .insert({
            event_name: "RAMPAGE 2026",
            tournament: current.title,
            game: isRC ? "RC" : game === "MOBILE_LEGENDS" ? "MLBB" : game === "VALORANT" ? "VALORANT" : "BGMI",
            team_name: form.teamName.trim(),
            igl_name: player1Name,
            igl_ign: player1Ign,
            igl_email: email,
            player2_name: isRC ? null : ((form.player2Name || "").trim() || null),
            player2_ign: isRC ? null : ((form.player2Ign || "").trim() || null),
            player3_name: isRC ? null : ((form.player3Name || "").trim() || null),
            player3_ign: isRC ? null : ((form.player3Ign || "").trim() || null),
            player4_name: isRC ? null : ((form.player4Name || "").trim() || null),
            player4_ign: isRC ? null : ((form.player4Ign || "").trim() || null),
            player5_name: !isRC && (game === "MOBILE_LEGENDS" || game === "VALORANT") ? ((form.player5Name || "").trim() || null) : null,
            player5_ign: !isRC && (game === "MOBILE_LEGENDS" || game === "VALORANT") ? ((form.player5Ign || "").trim() || null) : null,
            substitute_name: !isRC ? (substituteName || null) : null,
            substitute_ign: !isRC ? (substituteIgn || null) : null,
            phone1,
            phone2: phone2 || null,
            payment_proof_path: uploadedProofPath,
            random_pairing: "NO",
          });
        if (insertError) throw new Error(`REGISTRATION SAVE FAILED: ${insertError.message}`);
        setSuccess(true);
      } catch (error) {
        if (uploadedProofPath) {
          await supabase.storage.from(RAMPAGE_PAYMENT_BUCKET).remove([uploadedProofPath]).catch(() => {});
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
      "player2Name", "player2Ign", "player3Name", "player3Ign", "player4Name", "player4Ign",
    ];
    const optionalValorantPlayerFields = [
      "player2Name", "player2Ign", "player3Name", "player3Ign",
      "player4Name", "player4Ign", "player5Name", "player5Ign",
    ];
    return field.label.includes("OPTIONAL") ||
      (game === "BGMI" && optionalBgmiPlayerFields.includes(field.name)) ||
      (game === "VALORANT" && optionalValorantPlayerFields.includes(field.name));
  }

  return (

    <main className="reg-page">

      <style>{`/* Force the same dark Battleblaze background used by the other registration forms */
html, body, #root {
  min-height: 100%;
  background-color: #070713 !important;
}
body {
  margin: 0;
}
.reg-page {
  min-height: 100vh !important;
  min-height: 100dvh !important;
  width: 100%;
  box-sizing: border-box;
  color: #f5f5ff !important;
  background: radial-gradient(ellipse at 12% 8%, rgba(139, 92, 246, .24), transparent 40%), radial-gradient(ellipse at 88% 78%, rgba(59, 130, 246, .16), transparent 38%), linear-gradient(135deg, #070713 0%, #100b2b 48%, #080d22 100%) !important;
}
/* Blue + purple scrollbar theme */
:root, * {
  scrollbar-width: thin;
  scrollbar-color: #8b5cf6 #0a1028;
}
*::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
*::-webkit-scrollbar-track {
  background: #0a1028;
  border-radius: 999px;
}
*::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3b82f6 0%, #6366f1 48%, #8b5cf6 100%);
  border: 2px solid #0a1028;
  border-radius: 999px;
}
*::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #60a5fa 0%, #818cf8 48%, #a78bfa 100%);
}
.reg-page {

  min-height: 100vh;

  padding: 24px clamp(16px, 4vw, 56px) 36px;

  color: #f5f5ff;

  background: radial-gradient(ellipse at 12% 8%, rgba(139, 92, 246, .24), transparent 40%), radial-gradient(ellipse at 88% 78%, rgba(59, 130, 246, .16), transparent 38%), linear-gradient(135deg, #070713 0%, #100b2b 48%, #080d22 100%) !important;

  font-family: Orbitron, system-ui, sans-serif;

  position: relative;

  overflow: hidden;

}

.reg-orb { position: absolute; width: 280px; height: 280px; border-radius: 50%; filter: blur(90px); opacity: .16; pointer-events: none; }

.reg-orb-one { background: #8b5cf6; top: 18%; left: -130px; }

.reg-orb-two { background: #3b82f6; right: -140px; bottom: 10%; }

.reg-header { max-width: 1120px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 20px; position: relative; z-index: 1; }

.reg-brand img { width: 76px; height: 76px; object-fit: contain; }

.reg-header-label, .reg-eyebrow, .reg-card-index, .reg-status, .reg-section-label, .reg-footnote, .reg-footer { letter-spacing: .12em; font-size: 11px; color: #b9b7d5; }

.reg-container { max-width: 920px; margin: 42px auto 0; position: relative; z-index: 1; }

.reg-heading { text-align: center; margin-bottom: 28px; }

/\* Event Overview-inspired glowing headline with violet-to-blue lighting. \*/

.reg-heading h1 {

  position: relative;

  display: inline-block;

  margin: 10px 0 26px;

  font-size: clamp(30px, 5vw, 52px);

  line-height: 1.1;

  font-weight: 800;

  letter-spacing: .045em;

  color: #eee8ff;

  background: linear-gradient(180deg, #ffffff 0%, #e4d5ff 42%, #b7a0ff 74%, #93c5fd 100%);

  -webkit-background-clip: text;

  background-clip: text;

  -webkit-text-fill-color: transparent;

  text-shadow: 0 0 12px rgba(167,139,250,.48), 0 0 28px rgba(139,92,246,.34), 0 0 48px rgba(96,165,250,.16);

  filter: drop-shadow(0 0 9px rgba(139,92,246,.32));

}

.reg-heading h1::after {

  content: "";

  position: absolute;

  left: 0;

  bottom: -18px;

  width: min(100%, 470px);

  height: 3px;

  background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 45%, #60a5fa 100%);

  box-shadow: 0 0 10px rgba(139,92,246,.55), 0 0 22px rgba(96,165,250,.24);

}

.reg-heading h1 span, .reg-card-top h2 span {

  color: #c4b5fd;

  background: linear-gradient(90deg, #c4b5fd 0%, #a78bfa 48%, #93c5fd 100%);

  -webkit-background-clip: text;

  background-clip: text;

  -webkit-text-fill-color: transparent;

  text-shadow: 0 0 12px rgba(167,139,250,.55), 0 0 26px rgba(96,165,250,.22);

}

.reg-heading p, .reg-card-top p { color: #aaa8c6; font-size: 13px; }

.reg-glass-card { border: 1px solid rgba(167, 139, 250, .30); background: linear-gradient(145deg, rgba(24, 16, 49, .94), rgba(8, 10, 28, .96)); border-radius: 16px; padding: clamp(18px, 4vw, 34px); box-shadow: 0 20px 70px rgba(0,0,0,.35); backdrop-filter: blur(14px); }

.reg-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }

.reg-card-top h2 {

  margin: 12px 0 8px;

  font-size: clamp(20px, 3vw, 30px);

  color: #f5f0ff;

  text-shadow: 0 0 10px rgba(139,92,246,.28), 0 0 22px rgba(96,165,250,.12);

}

.reg-status { border: 1px solid rgba(139,92,246,.35); border-radius: 30px; padding: 8px 10px; white-space: nowrap; }

.reg-status span { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #8b5cf6; margin-right: 7px; }

.reg-divider { height: 1px; background: linear-gradient(90deg, transparent, #4c426d, transparent); margin: 24px 0; }

.reg-section-label { margin-bottom: 18px; }

.reg-section-label span { color: #8b5cf6; margin-right: 10px; }

.reg-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }

.reg-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }

.reg-field > span { font-size: 10px; letter-spacing: .07em; color: #d0cde4; }

.reg-field b { color: #a78bfa; }

.reg-field input, .reg-field select { width: 100%; min-height: 46px; box-sizing: border-box; border: 1px solid #37314f; border-radius: 8px; outline: none; background: #0a0917; color: white; padding: 12px 13px; font: inherit; font-size: 12px; }

.reg-field input:focus, .reg-field select:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,.14); }

.reg-consent { display: flex; gap: 10px; align-items: flex-start; color: #bdbbd3; font-size: 11px; line-height: 1.6; }

.reg-consent input { accent-color: #8b5cf6; margin-top: 3px; }

.reg-submit { display: flex; justify-content: center; align-items: center; gap: 12px; width: 100%; margin-top: 22px; border: 0; border-radius: 8px; padding: 15px 18px; background: linear-gradient(90deg, #8a35ff, #3b82f6); color: white; font: inherit; font-size: 12px; font-weight: 700; letter-spacing: .08em; cursor: pointer; }

.reg-submit:hover { filter: brightness(1.12); }

.reg-footnote { text-align: center; margin-top: 15px; font-size: 9px; }

.reg-success { text-align: center; padding: 25px 0; }

.reg-success-icon { width: 54px; height: 54px; display: grid; place-items: center; margin: 0 auto 18px; border: 1px solid #a78bfa; border-radius: 50%; color: #c4b5fd; font-size: 28px; }

.reg-success h2 { font-size: 28px; }

.reg-success p { color: #bdbbd3; line-height: 1.7; font-size: 13px; }

.reg-footer { max-width: 920px; margin: 26px auto 0; display: flex; justify-content: space-between; gap: 12px; }

@media (max-width: 620px) {

  .reg-header { align-items: flex-start; }

  .reg-brand img { width: 58px; height: 58px; }

  .reg-header-label { text-align: right; max-width: 180px; line-height: 1.6; }

  .reg-container { margin-top: 28px; }

  .reg-card-top { flex-direction: column; }

  .reg-fields { grid-template-columns: 1fr; }

  .reg-footer { flex-direction: column; text-align: center; }

}

/\* Unified Battleblaze purple / blue theme — no pink accents \*/

.reg-page, .reg-page \* {

  --reg-violet: #8b5cf6;

  --reg-lavender: #c4b5fd;

  --reg-blue: #60a5fa;

}

.reg-page .reg-header-label,

.reg-page .reg-eyebrow,

.reg-page .reg-card-index,

.reg-page .reg-section-label span,

.reg-page .reg-field b,

.reg-page .reg-status span,

.reg-page .reg-success-icon {

  color: #c4b5fd !important;

}

.reg-page .reg-field b { color: #a78bfa !important; }

.reg-page .reg-status { border-color: rgba(139,92,246,.38) !important; }

.reg-page .reg-status span { background: #8b5cf6 !important; }

.reg-page .reg-field input:focus,

.reg-page .reg-field select:focus { border-color: #8b5cf6 !important; }

.reg-page .reg-consent input { accent-color: #8b5cf6 !important; }

.reg-page .reg-divider {

  background: linear-gradient(90deg, transparent, #6d28d9 25%, #8b5cf6 50%, #60a5fa 75%, transparent) !important;

}

.reg-page .reg-submit {

  background: linear-gradient(100deg, #6d28d9 0%, #8b5cf6 48%, #3b82f6 100%) !important;

  box-shadow: 0 8px 24px rgba(96,165,250,.12), 0 0 22px rgba(139,92,246,.14);

}

.reg-page .reg-glass-card {

  border-color: rgba(167,139,250,.30) !important;

  background: linear-gradient(145deg, rgba(24,16,49,.94), rgba(8,10,28,.96)) !important;

}

.reg-page .reg-field input,

.reg-page .reg-field select {

  border-color: rgba(139,92,246,.28) !important;

}

.reg-page .reg-success-icon { border-color: #8b5cf6 !important; }

.reg-header-branding { display:flex; flex-direction:column; align-items:center; gap:8px; }

.reg-header-presents { color:#e9ddff; font-size:clamp(10px,1.4vw,14px); font-weight:800; letter-spacing:.18em; text-align:center; text-shadow:0 0 14px rgba(139,92,246,.45); }

.reg-header-bgmi { justify-content:center; flex-direction:column; gap:14px; }

.reg-header-bgmi .reg-header-label { text-align:center; }

.reg-logo-large img { width:clamp(100px,13vw,150px); height:clamp(100px,13vw,150px); }

.reg-subsection-heading { grid-column: 1 / -1; margin: 10px 0 -4px; padding-top: 12px; border-top: 1px solid rgba(139,92,246,.18); color: #e9ddff; }

.reg-review { margin-top:24px; padding:18px; border:1px solid rgba(167,139,250,.28); border-radius:12px; background:rgba(10,9,23,.55); }

.reg-review-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }

.reg-review-item { min-width:0; padding:10px 12px; border:1px solid rgba(139,92,246,.16); border-radius:8px; background:rgba(139,92,246,.045); }

.reg-review-item small { display:block; color:#aaa8c6; font-size:9px; letter-spacing:.08em; margin-bottom:5px; }

.reg-review-item strong { display:block; color:#f5f0ff; font-size:12px; overflow-wrap:anywhere; }

.reg-qr-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; margin:14px 0 18px; }

.reg-qr-slot { min-height:170px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:12px; border:1px dashed rgba(167,139,250,.45); border-radius:10px; background:rgba(7,7,19,.6); text-align:center; }

.reg-qr-slot img { width:130px; height:130px; object-fit:contain; background:white; border-radius:6px; padding:5px; }

.reg-qr-slot strong { font-size:10px; letter-spacing:.08em; color:#e9ddff; }

.reg-qr-slot span { font-size:9px; color:#aaa8c6; line-height:1.5; }

.reg-review-consent { margin-top:16px; }

@media (max-width:620px) { .reg-review-grid,.reg-qr-grid { grid-template-columns:1fr; } }

.reg-payment-panel { margin: 4px 0 8px; padding: 18px; border: 1px solid rgba(139,92,246,.28); border-radius: 12px; background: linear-gradient(135deg, rgba(109,40,217,.10), rgba(59,130,246,.07)); }

.reg-payment-amount { color: #e9ddff; font-size: 13px; letter-spacing: .08em; margin: 0 0 8px; }

.reg-payment-amount strong { color: #c4b5fd; text-shadow: 0 0 12px rgba(139,92,246,.28); }

.reg-payment-note { color: #aaa8c6; font-size: 11px; line-height: 1.6; margin-bottom: 16px; }

.reg-payment-upload input { padding: 10px; min-height: auto; background: rgba(7,7,19,.7); }

.reg-form-error { margin-top: 16px; padding: 12px 14px; border: 1px solid rgba(248,113,113,.35); border-radius: 9px; background: rgba(127,29,29,.16); color: #fecaca; font-size: 10px; line-height: 1.6; letter-spacing: .04em; }

.reg-submit:disabled { opacity: .65; cursor: wait; }

`}</style>

      <div className="reg-orb reg-orb-one" />

      <div className="reg-orb reg-orb-two" />


      <header className={`reg-header ${["BGMI", "MOBILE_LEGENDS", "VALORANT", "RC"].includes(game) ? "reg-header-bgmi" : ""}`}>

        <div className="reg-header-branding">

          <span className="reg-header-presents">NITS ESPORTS PRESENTS</span>

          <a href="/" className={`reg-brand ${["BGMI", "MOBILE_LEGENDS", "VALORANT", "RC"].includes(game) ? "reg-logo-large" : ""}`} aria-label="NITS Esports home">

            <img src={logoUrl} alt="NITS Esports Logo" />

          </a>

        </div>

        <span className="reg-header-label">OFFICIAL TOURNAMENT REGISTRATION</span>

      </header>


      <section className="reg-container">

        <div className="reg-heading">

          <span className="reg-eyebrow">NITS ESPORTS PRESENTS</span>

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


          {success ? (

            <div className="reg-success">

              <div className="reg-success-icon">✓</div>

              <span className="reg-eyebrow">FORM COMPLETED</span>

              <h2>YOU'RE ALMOST IN.</h2>

              <p>

                {["BGMI", "MOBILE_LEGENDS", "VALORANT", "RC"].includes(game)

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

              {(game === "BGMI" || game === "MOBILE_LEGENDS" || game === "VALORANT" || game === "RC") && (

                <p className="reg-payment-note">

                  {game === "BGMI"

                    ? "Register at least one player. For every player you add, both full name and IGN are required."

                    : game === "MOBILE_LEGENDS"

                      ? "All five players must provide their full name and IGN."

                      : game === "VALORANT"
                        ? "At least one player is required. Player 1 / IGL must have a name and Riot ID. Players 2–5 are optional, but if you start entering any player’s details, both that player’s name and Riot ID must be completed. Only the IGL email is required; no other player email fields are collected."
                        : "Enter the mandatory team name, player name, player UID, email address and contact number 1. Contact number 2 is optional."}

                  {" "}Contact number 1 is mandatory.

                </p>

              )}


              <div className="reg-fields">

                {(game === "BGMI" || game === "MOBILE_LEGENDS" || game === "VALORANT" || game === "RC"

                  ? (game === "RC"
                    ? ["teamName", "playerName", "gameId", "email", "phone", "phone2"]
                    : [

                      "teamName", "iglName", "player2Name", "player3Name", "player4Name",

                      ...(["MOBILE_LEGENDS", "VALORANT"].includes(game) ? ["player5Name"] : []),

                      "iglIgn", "player2Ign", "player3Ign", "player4Ign",

                      ...(["MOBILE_LEGENDS", "VALORANT"].includes(game) ? ["player5Ign"] : []),

                      "iglEmail",

                      "substituteName", "substituteIgn", "phone1", "phone2",

                    ])

                      .map((name) => current.fields.find((field) => field.name === name))

                      .filter(Boolean)

                  : current.fields

                ).map((field) => {

                  const optional = isOptional(field);


                  const sectionHeading = (["BGMI", "MOBILE_LEGENDS", "VALORANT", "RC"].includes(game)) ? ({

                    teamName: "TEAM DETAILS",

                    iglName: "PLAYER NAMES",

                    iglIgn: "IN-GAME NAMES / RIOT IDs",

                    iglEmail: "IGL EMAIL",

                    substituteName: "SUBSTITUTE PLAYER",

                    phone1: "CONTACT DETAILS",

                  }[field.name]) : null;


                  return (

                    <Fragment key={`${game}-${field.name}-group`}>

                      {sectionHeading && (

                        <div className="reg-section-label reg-subsection-heading" key={`${game}-${field.name}-section`}>

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

                        {!optional && <b> \*</b>}

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

                          placeholder={field.placeholder}

                          required={!optional}

                          value={form[field.name] || ""}

                          onChange={(e) =>

                            setForm({ ...form, [field.name]: e.target.value })

                          }

                          maxLength={["phone", "phone1", "phone2"].includes(field.name) ? 10 : undefined}

                          pattern={["phone", "phone1", "phone2"].includes(field.name) ? "[0-9]{10}" : undefined}

                        />

                      )}

                    </label>

                    </Fragment>

                  );

                })}

              </div>


              {["BGMI", "MOBILE_LEGENDS", "VALORANT", "RC"].includes(game) && (

                <>

                  <div className="reg-divider" />

                  <section className="reg-review">

                    <div className="reg-section-label"><span>02</span> REVIEW YOUR ENTRIES</div>

                    <p className="reg-payment-note">Please verify the details below before confirming your registration.</p>

                    <div className="reg-review-grid">

                      {(game === "RC" ? [
                        ["TEAM NAME", form.teamName],
                        ["PLAYER NAME", form.playerName],
                        ["PLAYER UID", form.gameId],
                        ["EMAIL ADDRESS", form.email],
                        ["CONTACT NUMBER 1", form.phone],
                        ["CONTACT NUMBER 2", form.phone2],
                      ] : [
                        ["TEAM NAME", form.teamName],
                        ["PLAYER 1 / IGL NAME", form.iglName],
                        ["PLAYER 1 / IGL IGN", form.iglIgn],
                        ["PLAYER 2 NAME", form.player2Name],
                        ["PLAYER 2 IGN", form.player2Ign],
                        ["PLAYER 3 NAME", form.player3Name],
                        ["PLAYER 3 IGN", form.player3Ign],
                        ["PLAYER 4 NAME", form.player4Name],
                        ["PLAYER 4 IGN", form.player4Ign],
                        ...(["MOBILE_LEGENDS", "VALORANT"].includes(game) ? [["PLAYER 5 NAME", form.player5Name], ["PLAYER 5 IGN / RIOT ID", form.player5Ign]] : []),
                        ["IGL EMAIL", form.iglEmail],
                        ["CONTACT NUMBER 1", form.phone1],
                        ["CONTACT NUMBER 2", form.phone2],
                        ["SUBSTITUTE NAME", form.substituteName],
                        ["SUBSTITUTE IGN", form.substituteIgn],
                      ]).filter(([, value]) => String(value || "").trim()).map(([label, value]) => (

                        <div className="reg-review-item" key={label}>

                          <small>{label}</small><strong>{value}</strong>

                        </div>

                      ))}

                    </div>

                    <label className="reg-consent reg-review-consent">

                      <input type="checkbox" checked={reviewConfirmed} onChange={(e) => setReviewConfirmed(e.target.checked)} />

                      <span>I have reviewed the entries above and confirm that all information is correct. <b>\*</b></span>

                    </label>

                  </section>

                </>

              )}


              {(game === "BGMI" || game === "MOBILE_LEGENDS" || game === "VALORANT" || game === "RC") && (

                <>

                  <div className="reg-divider" />

                  <section className="reg-payment-panel">

                    <div className="reg-section-label">

                      <span>02</span> PAYMENT DETAILS

                    </div>

                    <p className="reg-payment-amount">

                      REGISTRATION FEE: <strong>₹{game === "MOBILE_LEGENDS" ? 50 : 40} PER TEAM</strong>

                    </p>

                    <p className="reg-payment-note">

                      Complete the payment, then upload the payment screenshot. Accepted formats: JPG, PNG or WEBP.

                    </p>

                    <div className="reg-qr-grid" aria-label="Payment QR codes">

                      <div className="reg-qr-slot">

                        <strong>PAYMENT QR — SLOT 1</strong>

                        <img src={rampageQR} alt="Rampage payment QR code 1" />

                        <span>Scan this QR to pay the registration fee.</span>

                      </div>

                      <div className="reg-qr-slot">

                        <strong>PAYMENT QR — SLOT 2</strong>

                        <img src={rampageQR} alt="Rampage payment QR code 2" />

                        <span>Alternate payment QR.</span>

                      </div>

                    </div>

                    <label className="reg-field reg-payment-upload">

                      <span>PAYMENT SCREENSHOT <b>\*</b></span>

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

              )}


              {formError && (

                <div className="reg-form-error" role="alert">{formError}</div>

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

          <span>NITS ESPORTS</span>

          <span>PLAY FAIR. PLAY TO WIN.</span>

        </footer>

      </section>

    </main>

  );

}
