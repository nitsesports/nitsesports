import React from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import battleblazeLogo from "../assets/logoo2.png";

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

  const requestedGame = normalizeGame(
    searchParams.get("game") || "BGMI"
  );

  const game = GAMES[requestedGame] ? requestedGame : "BGMI";
  const details = GAMES[game];

  return (
    <main
      className="bbr-page"
      style={{ "--accent": details.accent }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');

        .bbr-page {
          min-height: 100vh;
          padding: 24px clamp(16px, 4vw, 56px);
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

        @media (max-width: 560px) {
          .bbr-page {
            padding-top: 16px;
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
            {game === "BGMI"
              ? "⌖"
              : game === "VALORANT"
              ? "◈"
              : game === "FIFA"
              ? "⚽"
              : game === "MOBILE_LEGENDS"
              ? "⬡"
              : "↗"}
          </div>

          <p className="bbr-game-subtitle">{details.subtitle}</p>
          <h2 className="bbr-game-title">{details.title}</h2>

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