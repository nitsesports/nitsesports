import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import battleblazeLogo from "../assets/logoo2.png";
import cctImage from "../assets/cct.png";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

const BGMI_RESULTS_TABLE = "cct_bgmi_results";

// Local fallback roster ensures all 25 teams per group remain visible at 0 points
// until their rows have been seeded in Supabase. Supabase values override these defaults.
const BGMI_GROUP_TEAMS = {
  A: [
    "SYNERGY OFFICIALS", "ZEROHP", "STORM BREAKERS", "APEX HUNTERS",
    "LUCENTRA ESPORTS", "FURY GLADIATORS", "IRON FALCONS", "PLAYSTATION SILCHAR",
    "LUNATIC GENZ", "VERSUS ESPORTS", "PHANTOM RAIDERS", "MUKIMA",
    "ELITE HUNTERS", "OUR GLORY ESPORTS", "ZORTAX", "PEGASUS", "GOLDEN EAGLES",
    "TASK FORCE ELITE", "BOOMBAM", "NIGHT WOLVES", "TEAM XEROX FARMING", "SHOGUNS",
    "ZERO NATION", "CRIMSON TITANS", "OLD GOATS"
  ],
  B: [
    "KYOS ESPORTS", "INSIDIOUS", "TITAN FURY", "TEAM MODI", "META 4",
    "BOMBS AND GUNS", "FOXTROT SQUADRON", "7 DOPE FALCONS", "DARK PHOENIX",
    "NOVA WARRIORS", "1KNOCKPUSH", "NOT SUSPICIOUS", "CHANKYA NITTI",
    "TEAM POLO APP", "TEAM REXN", "OLD GENERATION", "4 BLOOD THIRSTY",
    "SAVAGE REAPERS", "SHADOW STRIKERS", "VENOM SQUAD", "STEEL VIPERS",
    "BILLA GANG", "VORTEX REIGN ESPORTS", "ROGUE LEGION", "TEAM JODD"
  ],
  C: [
    "HANGUL ESPORTS", "HACKER ESPORTS", "GHOST RIDERS", "LONE SURVIVORS",
    "SILENT SNIPERS", "CARNAGE ESPORTS", "4BOTS", "THE BOYS", "ONE RISE E-SPORTS",
    "TEAM ESSENTIAL", "KACCHI UMAR", "LANGTA DON", "GHOULS ESPORTS",
    "THUNDER HAWKS", "ALAKH KE ANDHBHAKT", "OCTANE XAVIER", "BLACKLIST ESPORTS",
    "K4X ESPORTS", "RAVEN SQUAD", "RNTXXTAG", "COBRA CLAN", "BOMBASTIC",
    "GGGGG", "ALPHA STRIKERS", "VIRTUAL_CARNAGE"
  ],
  D: [
    "TEAM ALPHA", "TILLUBADMOS", "BLACK BEAST", "TEAM OVT", "TEAM BLANK",
    "4M VENOM", "JAATXPARK", "4SEA", "TEAM W", "ECHO SQUAD", "HBA",
    "TEAM KNIGHT WOLVES", "SOLAR FLARE", "FROST GIANTS", "V29 ESPORTS",
    "TEAM RYZEN", "BLITZ BRIGADE", "ATLAS WARRIORS", "ZENITH LEGION",
    "ROYAL ESPORTS", "RUTHLESS 4", "AVALANCHE ESPORTS", "TEAM VITALITY",
    "NEON NINJAS", "VIRTUAL_CARNAGE"
  ]
};

const GAMES = {
  BGMI: {
    title: "BGMI",
    subtitle: "BATTLE ROYALE",
    accent: "#a78bfa",
  },
  VALORANT: {
    title: "VALORANT",
    subtitle: "TACTICAL FPS",
    accent: "#a78bfa",
  },
  FIFA: {
    title: "FIFA",
    subtitle: "FOOTBALL",
    accent: "#a78bfa",
  },
  MOBILE_LEGENDS: {
    title: "MOBILE LEGENDS",
    subtitle: "MOBA",
    accent: "#a78bfa",
  },
  RC: {
    title: "REAL CRICKET",
    subtitle: "CRICKET",
    accent: "#a78bfa",
  },
};

function normalizeGame(value = "") {
  const normalized = value
    .trim()
    .toUpperCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

  if (normalized === "REAL_CRICKET") return "RC";
  if (normalized === "MLBB") return "MOBILE_LEGENDS";

  return normalized;
}

export default function BBResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState("A");
  // Each group has Match 1, Match 2, Match 3, and Overall views.
  const [selectedMatch, setSelectedMatch] = useState("overall");
  const [bgmiRows, setBgmiRows] = useState([]);
  const [bgmiLoading, setBgmiLoading] = useState(false);
  const [bgmiError, setBgmiError] = useState("");

  const requestedGame = normalizeGame(
    searchParams.get("game") || "BGMI"
  );

  const game = GAMES[requestedGame] ? requestedGame : "BGMI";
  const details = GAMES[game];

  const fetchBgmiResults = useCallback(async () => {
    if (!supabase) {
      setBgmiError("Supabase is not configured. Check your VITE_SUPABASE_URL and public key environment variables.");
      setBgmiRows([]);
      return;
    }

    setBgmiLoading(true);
    setBgmiError("");
    // Select all available columns so an optional/missing updated_at column
    // cannot cause the entire results request to fail.
    const { data, error } = await supabase
      .from(BGMI_RESULTS_TABLE)
      .select("*");

    if (error) {
      setBgmiError(`${error.message || "Unable to load BGMI results."} (Table: public.${BGMI_RESULTS_TABLE})`);
      setBgmiLoading(false);
      return;
    }

    // Keep the match-wise database columns intact. The selected view below
    // derives KP/PP/TP from match1_*, match2_*, and match3_* columns.
    setBgmiRows((data || []).map((row) => ({
      ...row,
      group_name: String(row.group_name || "").trim().toUpperCase().replace(/^GROUP\s+/, ""),
      team_name: String(row.team_name || "").trim(),
    })));
    setBgmiError("");
    setBgmiLoading(false);
  }, []);

  useEffect(() => {
    if (game !== "BGMI") return undefined;
    fetchBgmiResults();

    if (!supabase) return undefined;
    const channel = supabase
      .channel("cct-bgmi-results-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: BGMI_RESULTS_TABLE },
        () => { void fetchBgmiResults(); }
      )
      .subscribe();

    // Polling + focus refresh keeps the page current even if Realtime is not
    // enabled for this table in the Supabase publication.
    const pollId = window.setInterval(() => { void fetchBgmiResults(); }, 5000);
    const handleFocus = () => { void fetchBgmiResults(); };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(pollId);
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, [game, fetchBgmiResults]);

  const visibleBgmiRows = useMemo(() => {
    const groupRoster = BGMI_GROUP_TEAMS[selectedGroup] || [];
    const databaseRows = bgmiRows.filter((row) =>
      String(row.group_name || "").trim().toUpperCase().replace(/^GROUP\s+/, "") === selectedGroup
    );
    const usedIds = new Set();

    // Keep every official roster team visible, even before its row is seeded in Supabase.
    const mergedRows = groupRoster.map((teamName, rosterIndex) => {
      const matchingRow = databaseRows.find(
        (row) => String(row.team_name || "").trim().toLowerCase() === teamName.toLowerCase()
      );
      if (matchingRow) usedIds.add(matchingRow.id);
      return matchingRow
        ? { ...matchingRow, team_name: teamName, rosterIndex }
        : {
            id: `fallback-${selectedGroup}-${rosterIndex}`,
            group_name: selectedGroup,
            team_name: teamName,
            match1_kp: 0, match1_pp: 0, match1_tp: 0,
            match2_kp: 0, match2_pp: 0, match2_tp: 0,
            match3_kp: 0, match3_pp: 0, match3_tp: 0,
            rosterIndex,
          };
    });

    // Also show extra teams inserted directly into the results table.
    databaseRows.forEach((row, extraIndex) => {
      if (!usedIds.has(row.id) && !groupRoster.some(
        (name) => name.toLowerCase() === String(row.team_name || "").trim().toLowerCase()
      )) {
        mergedRows.push({ ...row, rosterIndex: groupRoster.length + extraIndex });
      }
    });

    // Table columns are match1_kp/match1_pp, match2_kp/match2_pp,
    // match3_kp/match3_pp. TP is consistently calculated as KP + PP.
    const scoredRows = mergedRows.map((row) => {
      let kp = 0;
      let pp = 0;

      if (selectedMatch === "overall") {
        for (let matchNo = 1; matchNo <= 3; matchNo += 1) {
          kp += Number(row[`match${matchNo}_kp`] || 0);
          pp += Number(row[`match${matchNo}_pp`] || 0);
        }
      } else {
        const matchNo = Number(selectedMatch.replace("match", ""));
        kp = Number(row[`match${matchNo}_kp`] || 0);
        pp = Number(row[`match${matchNo}_pp`] || 0);
      }

      return { ...row, kp, pp, tp: kp + pp };
    });

    // Rank within the currently selected group and selected match/overall view.
    return scoredRows
      .sort((a, b) =>
        b.tp - a.tp ||
        b.kp - a.kp ||
        b.pp - a.pp ||
        a.rosterIndex - b.rosterIndex
      )
      .map((row, index) => ({ ...row, displayRank: index + 1 }));
  }, [bgmiRows, selectedGroup, selectedMatch]);

  return (
    <main
      className="bbr-page"
      style={{ "--accent": details.accent }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');

        .bbr-page {
          min-height: 100vh;
          /* Leave room for the site's fixed navbar so the page header/logo never overlaps it. */
          padding: clamp(150px, 18vh, 180px) clamp(16px, 4vw, 56px) 24px !important;
          color: #f8fafc;
          font-family: 'Orbitron', sans-serif;
          background:
            radial-gradient(ellipse at 50% 10%, rgba(75,35,155,.32), transparent 48%),
            radial-gradient(ellipse at 10% 85%, rgba(0,234,255,.10), transparent 35%),
            #070711;
          position: relative;
          isolation: isolate;
          overflow: hidden;
          box-sizing: border-box;
        }

        .bbr-page * {
          box-sizing: border-box;
        }

        .bbr-grid {
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: .14;
          background-image:
            linear-gradient(rgba(168,85,247,.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,.2) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
        }

        .bbr-header {
          width: min(1240px, 100%);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          position: relative;
          z-index: 100;
          margin-top: 24px;
          padding: 12px 0 24px;
          text-align: center;
        }

        .bbr-brand-title {
          margin: 0;
          color: #ffffff;
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(12px, 2vw, 17px);
          font-weight: 800;
          letter-spacing: .18em;
        }

        .bbr-logo {
          display: block;
          width: clamp(115px, 16vw, 180px);
          max-height: 78px;
          object-fit: contain;
        }

        .bbr-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 12px 16px;
          min-height: 42px;
          border: 1px solid rgba(168,85,247,.75);
          color: white;
          background: rgba(18,12,38,.8);
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .07em;
          text-decoration: none;
          transition: .2s ease;
        }

        .bbr-link:hover {
          border-color: #c4b5fd;
          background: rgba(167,139,250,.08);
          transform: translateY(-2px);
        }

        .bbr-content {
          width: min(980px, 100%);
          margin: clamp(44px, 7vh, 78px) auto 70px;
          text-align: center;
        }

        .bbr-eyebrow {
          margin: 0 0 12px;
          color: #c4b5fd;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .2em;
        }

        .bbr-main-title {
          margin: 0;
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(27px, 5vw, 52px);
          font-weight: 900;
          line-height: 1.15;
          background: linear-gradient(100deg, #fff 10%, #d8b4fe 55%, #93c5fd 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .bbr-description {
          max-width: 600px;
          margin: 16px auto 28px;
          color: rgba(226,232,240,.75);
          font-size: 17px;
        }

        .bbr-tabs {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 9px;
          margin-bottom: 24px;
        }

        .bbr-tab {
          padding: 11px 15px;
          border: 1px solid rgba(148,163,184,.28);
          color: #dbeafe;
          background: rgba(15,15,32,.88);
          cursor: pointer;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          transition: .2s ease;
        }

        .bbr-tab:hover,
        .bbr-tab.active {
          border-color: var(--accent);
          color: white;
          background: rgba(167,139,250,.12);
          box-shadow: inset 0 -2px 0 var(--accent);
        }

        .bbr-panel {
          position: relative;
          overflow: hidden;
          padding: clamp(24px, 5vw, 48px);
          border: 1px solid var(--accent);
          background: linear-gradient(135deg, rgba(18,18,32,.98), rgba(8,10,20,.98));
          box-shadow: 0 18px 55px rgba(0,0,0,.36);
        }

        .bbr-topline {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #cbd5e1;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .12em;
          text-align: left;
        }

        .bbr-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 12px var(--accent);
        }

        .bbr-code {
          margin-left: auto;
          color: #94a3b8;
        }

        .bbr-game-icon {
          display: grid;
          place-items: center;
          width: 68px;
          height: 68px;
          margin: 30px auto 14px;
          border: 1px solid var(--accent);
          color: var(--accent);
          background: rgba(255,255,255,.03);
          font-size: 36px;
        }

        .bbr-game-icon img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .bbr-game-subtitle {
          margin: 0 0 4px;
          color: var(--accent);
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .24em;
        }

        .bbr-game-title {
          margin: 0 0 24px;
          color: white;
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(25px, 4vw, 40px);
          font-weight: 900;
        }

        .bbr-status {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          max-width: 640px;
          margin: auto;
          padding: 20px;
          border: 1px solid rgba(148,163,184,.2);
          background: rgba(2,6,23,.48);
          text-align: left;
        }

        .bbr-status-icon {
          color: var(--accent);
          font-size: 28px;
          line-height: 1;
        }

        .bbr-status h3 {
          margin: 0 0 7px;
          color: white;
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(12px, 2vw, 15px);
        }

        .bbr-status p {
          margin: 0;
          color: #cbd5e1;
          font-size: 16px;
          line-height: 1.5;
        }

        .bbr-note {
          margin-top: 20px;
          color: #94a3b8;
          font-size: 14px;
        }

        .bbr-footer {
          width: min(1240px, 100%);
          margin: auto;
          padding-top: 18px;
          border-top: 1px solid rgba(148,163,184,.16);
          display: flex;
          justify-content: space-between;
          gap: 16px;
          color: #64748b;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .12em;
        }

        .bbr-group-tabs {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin: 8px 0 24px;
        }

        .bbr-group-tab {
          min-width: 112px;
          padding: 12px 18px;
          border: 1px solid rgba(167,139,250,.38);
          color: #cbd5e1;
          background: rgba(15,15,32,.92);
          cursor: pointer;
          font: 800 11px 'Orbitron', sans-serif;
          letter-spacing: .08em;
          transition: .2s ease;
        }

        .bbr-group-tab:hover,
        .bbr-group-tab.active {
          color: #fff;
          border-color: var(--accent);
          background: rgba(167,139,250,.18);
          box-shadow: 0 0 18px rgba(167,139,250,.12), inset 0 -2px 0 var(--accent);
        }

        .bbr-match-tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 9px;
          margin: -8px 0 22px;
        }

        .bbr-match-tab {
          min-width: 0;
          padding: 12px 10px;
          border: 1px solid rgba(34,211,238,.32);
          color: #cbd5e1;
          background: rgba(8,18,34,.9);
          cursor: pointer;
          font: 800 10px 'Orbitron', sans-serif;
          letter-spacing: .06em;
          transition: .2s ease;
        }

        .bbr-match-tab:hover,
        .bbr-match-tab.active {
          color: #fff;
          border-color: #22d3ee;
          background: rgba(34,211,238,.12);
          box-shadow: inset 0 -2px 0 #22d3ee, 0 0 16px rgba(34,211,238,.08);
        }

        .bbr-table-wrap {
          width: 100%;
          overflow-x: auto;
          margin-top: 22px;
          border: 1px solid rgba(167,139,250,.22);
        }

        .bbr-results-table {
          width: 100%;
          min-width: 520px;
          border-collapse: collapse;
          text-align: left;
          font-family: 'Orbitron', sans-serif;
        }

        .bbr-results-table th {
          padding: 15px 16px;
          color: #c4b5fd;
          background: rgba(167,139,250,.10);
          font-size: 10px;
          letter-spacing: .1em;
          white-space: nowrap;
        }

        .bbr-results-table td {
          padding: 14px 16px;
          border-top: 1px solid rgba(148,163,184,.12);
          color: #e2e8f0;
          font-size: 12px;
        }

        .bbr-results-table tbody tr:first-child td {
          border-top-color: rgba(167,139,250,.35);
        }

        .bbr-results-table tbody tr:hover td {
          background: rgba(167,139,250,.06);
        }

        .bbr-rank {
          color: #c4b5fd !important;
          font-weight: 900;
        }

        .bbr-team-name {
          color: #fff !important;
          font-weight: 700;
        }

        .bbr-zero-state {
          padding: 28px 14px;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.7;
        }

        .bbr-results-summary {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 22px;
          color: #94a3b8;
          font-size: 10px;
          letter-spacing: .06em;
        }

        .bbr-refresh-button {
          border: 1px solid rgba(167,139,250,.45);
          padding: 8px 12px;
          color: #e9d5ff;
          background: rgba(167,139,250,.08);
          cursor: pointer;
          font: 700 9px 'Orbitron', sans-serif;
        }

        .bbr-refresh-button:disabled {
          opacity: .5;
          cursor: wait;
        }

        @media (max-width: 560px) {
          .bbr-page {
            /* Keep the header clear of the centered navbar logo on mobile too. */
            padding-top: 88px;
          }

          .bbr-header {
            align-items: center;
            padding-top: 8px;
          }

          .bbr-link {
            max-width: 175px;
            padding: 8px 10px;
            font-size: 8px;
          }

          .bbr-content {
            margin-top: 44px;
          }

          .bbr-eyebrow {
            font-size: 8px;
            line-height: 1.7;
          }

          .bbr-tabs {
            gap: 6px;
          }

          .bbr-tab {
            padding: 10px 9px;
            font-size: 8px;
          }

          .bbr-topline {
            font-size: 7px;
          }

          .bbr-match-tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 7px;
          }

          .bbr-match-tab {
            padding: 11px 7px;
            font-size: 8px;
          }

          .bbr-status {
            padding: 15px;
          }

          .bbr-footer {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>

      <div className="bbr-grid" aria-hidden="true" />

      <header className="bbr-header">
        <p className="bbr-brand-title">NITS ESPORTS PRESENTS</p>
        <Link to="/" aria-label="Battleblaze home">
          <img
            src={battleblazeLogo}
            alt="NITS Esports logo"
            className="bbr-logo"
          />
        </Link>
        <Link to="/battleblaze" className="bbr-link">
          ← BACK TO BATTLEBLAZE
        </Link>
      </header>

      <section className="bbr-content">
        <p className="bbr-eyebrow">
          BATTLEBLAZE 2026 · OFFICIAL RESULTS
        </p>

        <h1 className="bbr-main-title">TOURNAMENT RESULTS</h1>

        <p className="bbr-description">
          Official fixtures and results for each Battleblaze game will appear here.
        </p>

        <nav className="bbr-tabs" aria-label="Choose game results">
          {Object.entries(GAMES).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={`bbr-tab ${game === key ? "active" : ""}`}
              onClick={() =>
                navigate(`/results?game=${encodeURIComponent(key)}`)
              }
              aria-current={game === key ? "page" : undefined}
            >
              {item.title}
            </button>
          ))}
        </nav>

        <article className="bbr-panel">
          <div className="bbr-topline">
            <span className="bbr-dot" aria-hidden="true" />
            <span>OFFICIAL RESULT DESK</span>
            <span className="bbr-code">BB / 2026</span>
          </div>

          <div className="bbr-game-icon" aria-hidden="true">
            {game === "BGMI" ? (
              <img src={cctImage} alt="" />
            ) : game === "VALORANT" ? (
              "◈"
            ) : game === "FIFA" ? (
              "⚽"
            ) : game === "MOBILE_LEGENDS" ? (
              "⬡"
            ) : (
              "↗"
            )}
          </div>

          <p className="bbr-game-subtitle">{details.subtitle}</p>
          <h2 className="bbr-game-title">{details.title}</h2>

          {game === "BGMI" ? (
            <section aria-label="BGMI group standings">
              <p className="bbr-note" style={{ margin: "0 0 18px" }}>
                LIVE GROUP STANDINGS · RANKED BY TOTAL POINTS
              </p>

              <div className="bbr-group-tabs" role="tablist" aria-label="Choose BGMI group">
                {["A", "B", "C", "D"].map((group) => (
                  <button
                    key={group}
                    type="button"
                    role="tab"
                    aria-selected={selectedGroup === group}
                    className={`bbr-group-tab ${selectedGroup === group ? "active" : ""}`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    GROUP {group}
                  </button>
                ))}
              </div>

              <nav className="bbr-match-tabs" role="tablist" aria-label={`Choose match standings for Group ${selectedGroup}`}>
                {[
                  { key: "match1", label: "MATCH 1" },
                  { key: "match2", label: "MATCH 2" },
                  { key: "match3", label: "MATCH 3" },
                  { key: "overall", label: "OVERALL RANKING" },
                ].map((view) => (
                  <button
                    key={view.key}
                    type="button"
                    role="tab"
                    aria-selected={selectedMatch === view.key}
                    className={`bbr-match-tab ${selectedMatch === view.key ? "active" : ""}`}
                    onClick={() => setSelectedMatch(view.key)}
                  >
                    {view.label}
                  </button>
                ))}
              </nav>

              <div className="bbr-results-summary">
                <span>GROUP {selectedGroup} · {selectedMatch === "overall" ? "OVERALL RANKING" : selectedMatch.replace("match", "MATCH ").toUpperCase()} · {visibleBgmiRows.length} TEAMS</span>
                <button
                  type="button"
                  className="bbr-refresh-button"
                  onClick={fetchBgmiResults}
                  disabled={bgmiLoading}
                >
                  {bgmiLoading ? "UPDATING..." : "↻ REFRESH"}
                </button>
              </div>

              {bgmiError && (
                <div className="bbr-zero-state" role="alert" style={{ marginBottom: 16 }}>
                  <strong>LIVE SCORES UNAVAILABLE</strong>
                  <p>{bgmiError}</p>
                  <p>Official team names and zero-point standings are shown below. Configure the <code>cct_bgmi_results</code> table and public SELECT access to load live scores.</p>
                </div>
              )}

              <div className="bbr-table-wrap">
                <table className="bbr-results-table">
                  <thead>
                    <tr>
                      <th>RANK</th>
                      <th>TEAM NAME</th>
                      <th>KP</th>
                      <th>PP</th>
                      <th>TP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleBgmiRows.map((row) => (
                      <tr key={row.id}>
                        <td className="bbr-rank">{String(row.displayRank).padStart(2, "0")}</td>
                        <td className="bbr-team-name">{row.team_name}</td>
                        <td>{Number(row.kp || 0)}</td>
                        <td>{Number(row.pp || 0)}</td>
                        <td style={{ color: "#c4b5fd", fontWeight: 900 }}>{Number(row.tp ?? Number(row.kp || 0) + Number(row.pp || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="bbr-note">
                All official roster teams are shown. Match 1–3 views read their respective match columns from Supabase. Overall ranking sums KP and PP across all three matches; TP = KP + PP. Scores refresh automatically when Supabase data changes.
              </p>
            </section>
          ) : (
            <>
              <div className="bbr-status">
                <span className="bbr-status-icon" aria-hidden="true">◷</span>
                <div>
                  <h3>RESULTS NOT UPLOADED YET</h3>
                  <p>
                    The {details.title} results have not been published.
                    Please check back here after the matches are completed.
                  </p>
                </div>
              </div>

              <p className="bbr-note">
                Official standings and match results will be displayed here once available.
              </p>
            </>
          )}
        </article>

        <Link to="/schedule" className="bbr-link" style={{ marginTop: 24 }}>
          VIEW MATCH SCHEDULE ↗
        </Link>
      </section>

      <footer className="bbr-footer">
        <span>NITS ESPORTS</span>
        <span>COMPETE · CONNECT · CONQUER</span>
      </footer>
    </main>
  );
}