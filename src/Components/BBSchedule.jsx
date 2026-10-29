import React, { useCallback, useEffect, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import { createClient } from "@supabase/supabase-js";

import battleblazeLogo from "../assets/logoo2.png";



const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_KEY =

  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||

  import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =

  SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;



// Create a PUBLIC Supabase Storage bucket with this name: battleblaze-schedule

const STORAGE_BUCKET = "battleblaze-schedule";



const GAMES = {

  BGMI: {

    title: "BGMI",

    subtitle: "BATTLE ROYALE",

    accent: "#a78bfa",

    items: [

      { key: "group-division", title: "GROUP DIVISION", description: "Official team distribution for Groups A, B, C and D.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "rules-regulations", title: "TOURNAMENT RULES & REGULATIONS", description: "Rules, scoring system, match conduct and tournament regulations.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "tournament-flow", title: "TOURNAMENT FLOW", description: "Tournament stages and progression explained step by step.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "match-schedule-poster", title: "MATCH SCHEDULE", description: "Official BGMI match schedule poster, displayed in a large 4:5 Instagram-post layout.", kind: "image", label: "SCHEDULE POSTER", icon: "▧", large: true },

    ],

  },

  VALORANT: {

    title: "VALORANT",

    subtitle: "TACTICAL FPS",

    accent: "#a78bfa",

    items: [

      { key: "match-format", title: "MATCH FORMAT & FIXTURES", description: "Tournament format, fixtures and match progression.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "rules-regulations", title: "RULES & REGULATIONS", description: "Match rules, map selection and competitive conduct.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "tournament-flow", title: "TOURNAMENT FLOW", description: "Stages, qualification criteria and finals progression.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "match-schedule-poster", title: "MATCH SCHEDULE", description: "Official Valorant match schedule poster.", kind: "image", label: "SCHEDULE POSTER", icon: "▧", large: true },

    ],

  },

  FIFA: {

    title: "FIFA",

    subtitle: "FOOTBALL",

    accent: "#a78bfa",

    items: [

      { key: "match-format", title: "MATCH FORMAT & FIXTURES", description: "Tournament format and match fixtures.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "rules-regulations", title: "RULES & REGULATIONS", description: "Gameplay settings, match rules and tie-breakers.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "tournament-flow", title: "TOURNAMENT FLOW", description: "Qualification stages and final match progression.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "match-schedule-poster", title: "MATCH SCHEDULE", description: "Official FIFA match schedule poster.", kind: "image", label: "SCHEDULE POSTER", icon: "▧", large: true },

    ],

  },

  MOBILE_LEGENDS: {

    title: "MOBILE LEGENDS",

    subtitle: "MOBA",

    accent: "#a78bfa",

    items: [

      { key: "match-format", title: "MATCH FORMAT & FIXTURES", description: "Team brackets, fixtures and match format.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "rules-regulations", title: "RULES & REGULATIONS", description: "Tournament rules, draft requirements and match conduct.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "tournament-flow", title: "TOURNAMENT FLOW", description: "Tournament stages and qualification path.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "match-schedule-poster", title: "MATCH SCHEDULE", description: "Official Mobile Legends match schedule poster.", kind: "image", label: "SCHEDULE POSTER", icon: "▧", large: true },

    ],

  },

  RC: {

    title: "REAL CRICKET",

    subtitle: "CRICKET",

    accent: "#a78bfa",

    items: [

      { key: "match-format", title: "MATCH FORMAT & FIXTURES", description: "Tournament format, fixtures and match structure.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "rules-regulations", title: "RULES & REGULATIONS", description: "Gameplay rules, match settings and tie-breakers.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "tournament-flow", title: "TOURNAMENT FLOW", description: "Qualification stages and final progression.", kind: "pdf", label: "PDF DOCUMENT", icon: "▤" },

      { key: "match-schedule-poster", title: "MATCH SCHEDULE", description: "Official Real Cricket match schedule poster.", kind: "image", label: "SCHEDULE POSTER", icon: "▧", large: true },

    ],

  },

};






export default function BBSchedule() {

  const [searchParams, setSearchParams] = useSearchParams();

  const normalizeGame = (value = "BGMI") => {

    const key = value.trim().toUpperCase().replaceAll("-", "_").replaceAll(" ", "_");

    if (key === "MLBB") return "MOBILE_LEGENDS";

    if (key === "REAL_CRICKET") return "RC";

    if (key === "PS5_RUSH" || key === "VRXPERIENCE" || key === "VR_EXPERIENCE") return "BGMI";

    return GAMES[key] ? key : "BGMI";

  };

  const requestedGame = normalizeGame(searchParams.get("game") || "BGMI");

  const [selectedGame, setSelectedGame] = useState(requestedGame);

  const [assets, setAssets] = useState({});

  const [status, setStatus] = useState({});

  const game = GAMES[selectedGame];



  useEffect(() => {

    const nextGame = normalizeGame(searchParams.get("game") || "BGMI");

    setSelectedGame(nextGame);

  }, [searchParams]);



  useEffect(() => {

    const sectionKey = searchParams.get("section");

    if (!sectionKey) return;

    const frame = window.requestAnimationFrame(() => {

      document.getElementById(`bbs-card-${selectedGame}-${sectionKey}`)

        ?.scrollIntoView({ behavior: "smooth", block: "center" });

    });

    return () => window.cancelAnimationFrame(frame);

  }, [selectedGame, searchParams]);



  const chooseGame = (key) => {

    setSelectedGame(key);

    const next = new URLSearchParams(searchParams);

    next.set("game", key);

    next.delete("section");

    setSearchParams(next, { replace: false });

  };



  const loadAssets = useCallback(async (gameKey) => {

    if (!supabase) {
      setStatus((prev) => ({
        ...prev,
        [`${gameKey}-storage`]:
          "Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in your environment.",
      }));
      return;
    }

    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(gameKey, {

      limit: 100,

      sortBy: { column: "name", order: "asc" },

    });

    if (error) {

      setStatus((prev) => ({

        ...prev,

        [`${gameKey}-storage`]: `Storage unavailable: ${error.message}. Check that the public bucket "${STORAGE_BUCKET}" exists and has read access.`,

      }));

      return;

    }



    const next = {};

    (data || []).forEach((file) => {

      const slot = game.items.find((item) => file.name.startsWith(`${item.key}.`));

      if (slot) {

        const path = `${gameKey}/${file.name}`;

        const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

        next[slot.key] = {

          url: publicData.publicUrl,

          name: file.name,

          updatedAt: file.updated_at || file.created_at || null,

        };

      }

    });

    setAssets((prev) => ({ ...prev, [gameKey]: next }));

  }, []);



  useEffect(() => {

    void loadAssets(selectedGame);

  }, [selectedGame, loadAssets]);




  return (

    <main className="bbs-page" style={{ "--bbs-accent": "#a78bfa" }}>

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght\@400;500;600;700;800;900&display=swap');

        .bbs-page { min-height:100vh; padding:clamp(140px,17vh,175px) clamp(16px,4vw,56px) 28px; color:#f8fafc; font-family:'Orbitron',sans-serif; background:radial-gradient(ellipse at 50% 5%, color-mix(in srgb,var(--bbs-accent) 20%,transparent),transparent 48%),radial-gradient(ellipse at 10% 85%,rgba(0,234,255,.08),transparent 35%),#070711; position:relative; isolation:isolate; overflow:hidden; box-sizing:border-box; }

        .bbs-page * { box-sizing:border-box; }

        .bbs-grid { position:absolute; inset:0; z-index:-1; pointer-events:none; opacity:.14; background-image:linear-gradient(rgba(168,85,247,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,.2) 1px,transparent 1px); background-size:44px 44px; mask-image:linear-gradient(to bottom,black,transparent 90%); }

        .bbs-header { width:min(1240px,100%); margin:0 auto; display:flex; flex-direction:column; align-items:center; gap:12px; padding:12px 0 24px; text-align:center; position:relative; z-index:2; }

        .bbs-brand { margin:0; color:#fff; font-size:clamp(12px,2vw,17px); font-weight:800; letter-spacing:.18em; }

        .bbs-logo { display:block; width:clamp(115px,16vw,180px); max-height:78px; object-fit:contain; }

        .bbs-link { display:inline-flex; align-items:center; justify-content:center; padding:11px 15px; min-height:40px; border:1px solid color-mix(in srgb,var(--bbs-accent) 75%,transparent); color:#fff; background:rgba(18,12,38,.8); font-size:10px; font-weight:700; letter-spacing:.07em; text-decoration:none; transition:.2s ease; }

        .bbs-link:hover { border-color:var(--bbs-accent); transform:translateY(-2px); }

        .bbs-content { width:min(1120px,100%); margin:clamp(30px,5vh,60px) auto 65px; text-align:center; }

        .bbs-eyebrow { margin:0 0 12px; color:var(--bbs-accent); font-size:10px; font-weight:700; letter-spacing:.2em; }

        .bbs-title { margin:0; font-size:clamp(28px,5vw,52px); font-weight:900; line-height:1.15; background:linear-gradient(100deg,#fff 10%,var(--bbs-accent) 55%,#93c5fd 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }

        .bbs-description { max-width:720px; margin:16px auto 28px; color:rgba(226,232,240,.75); font-size:14px; line-height:1.8; }

        .bbs-game-tabs { display:flex; flex-wrap:wrap; justify-content:center; gap:9px; margin:0 0 28px; }

        .bbs-tab { padding:11px 15px; border:1px solid rgba(148,163,184,.28); color:#dbeafe; background:rgba(15,15,32,.88); cursor:pointer; font:700 10px 'Orbitron',sans-serif; transition:.2s ease; }

        .bbs-tab:hover,.bbs-tab.active { border-color:var(--bbs-accent); color:#fff; background:color-mix(in srgb,var(--bbs-accent) 14%,transparent); box-shadow:inset 0 -2px 0 var(--bbs-accent); }

        .bbs-panel { padding:clamp(20px,4vw,38px); border:1px solid color-mix(in srgb,var(--bbs-accent) 65%,transparent); background:linear-gradient(135deg,rgba(18,18,32,.98),rgba(8,10,20,.98)); box-shadow:0 18px 55px rgba(0,0,0,.36); }

        .bbs-topline { display:flex; align-items:center; gap:9px; color:#cbd5e1; font-size:9px; font-weight:700; letter-spacing:.12em; text-align:left; }

        .bbs-dot { width:7px; height:7px; flex-shrink:0; border-radius:50%; background:var(--bbs-accent); box-shadow:0 0 12px var(--bbs-accent); }

        .bbs-code { margin-left:auto; color:#94a3b8; }

        .bbs-section-title { margin:24px 0 8px; font-size:clamp(18px,3vw,26px); font-weight:800; }

        .bbs-section-copy { margin:0 auto 26px; max-width:700px; color:#94a3b8; font-size:12px; line-height:1.8; }

        .bbs-card-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; text-align:left; }

        .bbs-card { display:flex; flex-direction:column; min-height:255px; padding:20px; border:1px solid rgba(148,163,184,.2); background:linear-gradient(145deg,rgba(25,25,45,.94),rgba(9,11,22,.95)); transition:transform .2s,border-color .2s; }

        .bbs-card:hover { transform:translateY(-3px); border-color:color-mix(in srgb,var(--bbs-accent) 70%,transparent); }

        .bbs-card-icon { display:grid; place-items:center; width:48px; height:48px; margin-bottom:18px; border:1px solid color-mix(in srgb,var(--bbs-accent) 65%,transparent); color:var(--bbs-accent); background:color-mix(in srgb,var(--bbs-accent) 10%,transparent); font-size:24px; }

        .bbs-card-label { color:var(--bbs-accent); font-size:8px; font-weight:700; letter-spacing:.15em; }

        .bbs-card-title { margin:9px 0 10px; color:#fff; font-size:13px; line-height:1.6; font-weight:800; }

        .bbs-card-copy { margin:0 0 18px; color:#94a3b8; font-family:Arial,sans-serif; font-size:13px; line-height:1.65; }

        .bbs-card-actions { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:auto; }

        .bbs-action { display:inline-flex; justify-content:center; align-items:center; min-height:36px; padding:9px 12px; border:1px solid color-mix(in srgb,var(--bbs-accent) 65%,transparent); color:#fff; background:color-mix(in srgb,var(--bbs-accent) 12%,transparent); font:700 9px 'Orbitron',sans-serif; letter-spacing:.04em; text-decoration:none; cursor:pointer; }

        .bbs-action.secondary { border-color:rgba(148,163,184,.3); background:rgba(15,23,42,.7); color:#cbd5e1; }

        .bbs-action:disabled { opacity:.55; cursor:wait; }

        .bbs-admin-note { display:inline-flex; align-items:center; min-height:36px; padding:9px 12px; border:1px solid rgba(148,163,184,.22); color:#94a3b8; background:rgba(15,23,42,.45); font:700 8px/1.5 Arial,sans-serif; letter-spacing:.05em; }

        .bbs-file-name { width:100%; color:#a5b4fc; font:11px Arial,sans-serif; overflow-wrap:anywhere; margin-top:8px; }

        .bbs-status { width:100%; margin-top:10px; color:#c4b5fd; font:11px/1.6 Arial,sans-serif; overflow-wrap:anywhere; }

        .bbs-poster-card { grid-column:1/-1; display:grid; grid-template-columns:minmax(0,1.6fr) minmax(240px,.6fr); align-items:stretch; min-height:0; border-color:rgba(167,139,250,.55); }

        .bbs-poster-preview { display:grid; place-items:center; width:100%; max-width:900px; aspect-ratio:4/5; align-self:center; justify-self:center; min-height:0; padding:8px; background:rgba(2,6,23,.6); border:1px solid rgba(167,139,250,.35); overflow:hidden; }

        .bbs-poster-preview img { display:block; width:100%; height:100%; max-width:100%; max-height:none; object-fit:contain; }

        .bbs-poster-placeholder { text-align:center; color:#94a3b8; font-size:12px; line-height:1.8; }

        .bbs-poster-info { display:flex; flex-direction:column; align-items:flex-start; justify-content:center; padding:clamp(20px,3vw,34px); }

        .bbs-poster-info .bbs-card-title { font-size:clamp(17px,2.4vw,25px); }

        .bbs-footer { width:min(1240px,100%); margin:auto; padding-top:18px; border-top:1px solid rgba(148,163,184,.16); display:flex; justify-content:space-between; gap:16px; color:#64748b; font-size:9px; font-weight:700; letter-spacing:.12em; }

        @media(max-width:800px) { .bbs-card-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .bbs-poster-card { grid-template-columns:1fr; min-height:0; } .bbs-poster-preview { width:min(100%,700px); min-height:0; } }

        @media(max-width:540px) { .bbs-page { padding-top:100px; } .bbs-card-grid { grid-template-columns:1fr; } .bbs-card { min-height:220px; } .bbs-poster-card { grid-column:1/-1; } .bbs-poster-preview { width:100%; padding:8px; } .bbs-topline { font-size:7px; } .bbs-footer { flex-direction:column; align-items:center; text-align:center; } .bbs-tab { padding:10px 9px; font-size:8px; } }

      `}</style>



      <div className="bbs-grid" aria-hidden="true" />

      <header className="bbs-header">

        <p className="bbs-brand">NITS ESPORTS PRESENTS</p>

        <Link to="/" aria-label="BattleBlaze home">

          <img src={battleblazeLogo} alt="NITS Esports logo" className="bbs-logo" />

        </Link>

        <Link to="/battleblaze" className="bbs-link">← BACK TO BATTLEBLAZE</Link>

      </header>



      <section className="bbs-content">

        <p className="bbs-eyebrow">BATTLEBLAZE 2026 · SCHEDULE & DETAILS</p>

        <h1 className="bbs-title">TOURNAMENT HUB</h1>

        <p className="bbs-description">

          Choose a game to access its group distribution, rules, tournament flow and match schedule.

          Official documents and posters are managed by admins in Supabase Storage and are available here for participants to view.

        </p>



        <nav className="bbs-game-tabs" aria-label="Choose game">

          {Object.entries(GAMES).map(([key, item]) => (

            <button

              key={key}

              type="button"

              className={`bbs-tab ${selectedGame === key ? "active" : ""}`}

              onClick={() => chooseGame(key)}

              aria-pressed={selectedGame === key}

            >

              {item.title}

            </button>

          ))}

        </nav>



        <article className="bbs-panel" style={{ "--bbs-accent": "#a78bfa" }}>

          <div className="bbs-topline">

            <span className="bbs-dot" aria-hidden="true" />

            <span>OFFICIAL SCHEDULE DESK</span>

            <span className="bbs-code">BB / 2026</span>

          </div>

          <h2 className="bbs-section-title">{game.title} · {game.subtitle}</h2>

          <p className="bbs-section-copy">

            {selectedGame === "BGMI"

              ? "Three official PDF documents and one large match-schedule poster slot are available for BGMI."

              : `Official ${game.title} documents and match-schedule poster are managed separately from other games.`}

          </p>



          <div className="bbs-card-grid">

            {game.items.map((item) => {

              const asset = assets[selectedGame]?.[item.key];




              return (

                <section

                    key={item.key}

                    id={`bbs-card-${selectedGame}-${item.key}`}

                    className={`bbs-card ${item.large ? "bbs-poster-card" : ""}`}

                  >

                  {item.large && (

                    <div className="bbs-poster-preview">

                      {asset?.url ? (

                        <img src={asset.url} alt={`${game.title} match schedule poster`} />

                      ) : (

                        <div className="bbs-poster-placeholder">

                          <div style={{ fontSize: 42, color: "#a78bfa", marginBottom: 12 }}>▧</div>

                          MATCH SCHEDULE POSTER<br />4:5 INSTAGRAM POST

                        </div>

                      )}

                    </div>

                  )}



                  <div className={item.large ? "bbs-poster-info" : ""}>

                    {!item.large && <div className="bbs-card-icon" aria-hidden="true">{item.icon}</div>}

                    <div className="bbs-card-label">{item.label}</div>

                    <h3 className="bbs-card-title">{item.title}</h3>

                    <p className="bbs-card-copy">{item.description}</p>

                    <div className="bbs-card-actions">

                      {asset?.url && item.kind === "pdf" && (

                        <a className="bbs-action" href={asset.url} target="_blank" rel="noreferrer">VIEW PDF ↗</a>

                      )}

                      {asset?.url && item.kind === "image" && (

                        <a className="bbs-action" href={asset.url} target="_blank" rel="noreferrer">VIEW POSTER ↗</a>

                      )}
                        <span className="bbs-admin-note">FILES MANAGED VIA SUPABASE STORAGE</span>

                    </div>

                    {asset?.name && <div className="bbs-file-name">FILE: {asset.name}</div>}


                  </div>

                </section>

              );

            })}

          </div>

          {status[`${selectedGame}-storage`] && (

            <p className="bbs-status" role="alert">{status[`${selectedGame}-storage`]}</p>

          )}

        </article>

      </section>



      <footer className="bbs-footer">

        <span>NITS ESPORTS</span>

        <span>COMPETE · CONNECT · CONQUER</span>

      </footer>

    </main>

  );

}
