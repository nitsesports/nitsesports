import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { ArrowRight, CalendarDays, Trophy } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import sportomaniaQR from "../assets/events/sqr.png";
import rampageQR from "../assets/rqr.png";
import sportomaniaPoster from "../assets/sportomania.png";
import sportomania2Poster from "../assets/sportomania2.png";
import rampage2Poster from "../assets/rampage2.png";
import rampageMLBBPoster from "../assets/1.png";
import rampageFreeFirePoster from "../assets/2.png";
import rampageBGMIPoster from "../assets/3.png";

const events = [
  {
    id: "01",
    image: rampage2Poster,
    category: "ESPORTS",
    title: "RAMPAGE 2026",
    date: "PROBABLE START: 12 OCTOBER 2026",
    location: "NIT SILCHAR",
    status: "REGISTRATIONS LIVE",
    description:
      "RAMPAGE 2026 — REGISTRATIONS ARE LIVE. BGMI, FREE FIRE & MLBB. REGISTRATIONS CLOSE ON 11 OCTOBER 2026 AT EOD.",
    color: "magenta",
  },
  {
    id: "02",
    image: sportomaniaPoster,
    category: "TOURNAMENT",
    title: "SPORTOMANIA",
    date: "PROBABLE START: 7 SEPTEMBER 2026",
    location: "NIT SILCHAR",
    status: "REGISTRATIONS CLOSED",
    description:
      "SPORTOMANIA — REGISTRATIONS ARE CLOSED. Thank you to everyone who registered. Stay tuned for tournament updates.",
    color: "blue",
  },
];

const tournamentDetails = {
  "RAMPAGE 2026": [
    { title: "BGMI TOURNAMENT", game: "BGMI", image: rampageBGMIPoster },
    { title: "FREE FIRE TOURNAMENT", game: "FREE FIRE", image: rampageFreeFirePoster },
    { title: "MLBB TOURNAMENT", game: "MLBB", image: rampageMLBBPoster },
  ],
  SPORTOMANIA: [
    { title: "BGMI TOURNAMENT", game: "BGMI", image: sportomania2Poster },
    { title: "FREE FIRE TOURNAMENT", game: "FREE FIRE", image: sportomania2Poster },
    { title: "MLBB TOURNAMENT", game: "MLBB", image: sportomania2Poster },
  ],
};

const RAMPAGE_LOGO = "/events/rampage-logo.png";
const RAMPAGE_QR = rampageQR;
const SPORTOMANIA_QR = sportomaniaQR;

const RAMPAGE_WHATSAPP_GROUPS = {
  "FREE FIRE": "https://chat.whatsapp.com/Hz3RixQNGQH2MVwWTNKtF6",
  "MLBB": "https://chat.whatsapp.com/DK65RfeWnKHCy5UnDQKFU1",
  "BGMI": "https://chat.whatsapp.com/JeG3Ip6dJ0oFaAuGkypmwU",
};

const getWhatsAppGroupForGame = (game = "") =>
  RAMPAGE_WHATSAPP_GROUPS[String(game).trim().toUpperCase()] || "";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase =
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

const RAMPAGE_REGISTRATION_TABLE = "rampage_registrations";
const RAMPAGE_PAYMENT_BUCKET = "rampage-payment-proofs";

const SPORTOMANIA_REGISTRATION_TABLE = "sportomania_registrations";
const SPORTOMANIA_PAYMENT_BUCKET = "sportomania-payment-proofs";

const SPORTOMANIA_FREE_SCHOLAR_PREFIXES = ["2411", "2311", "25CE", "26CE"];

const isSportomaniaScholarId = (scholarId = "") => {
  const normalized = String(scholarId || "").trim().toUpperCase();
  return SPORTOMANIA_FREE_SCHOLAR_PREFIXES.some((prefix) =>
    normalized.startsWith(prefix)
  );
};

const getSportomaniaFee = (form, playerCount) => {
  let payablePlayers = 0;

  for (let i = 1; i <= playerCount; i += 1) {
    const scholarId = form[`scholarId${i}`] || "";
    if (scholarId && !isSportomaniaScholarId(scholarId)) {
      payablePlayers += 1;
    }
  }

  const substituteName = String(form.substituteName || "").trim();
  const substituteIgn = String(form.substituteIgn || "").trim();
  const substituteScholarId = String(form.substituteScholarId || "").trim();

  if (
    substituteName &&
    substituteIgn &&
    substituteScholarId &&
    !isSportomaniaScholarId(substituteScholarId)
  ) {
    payablePlayers += 1;
  }

  return payablePlayers * 10;
};

const getRampageFee = (game = "") => {
  if (game === "MLBB") return 50;
  if (game === "BGMI" || game === "FREE FIRE") return 40;
  return 40;
};

const normalizeScholarId = (value = "") =>
  String(value || "").trim().toUpperCase();

const getFormScholarIds = (form, mainPlayerCount) => {
  const ids = [];

  for (let i = 1; i <= mainPlayerCount; i += 1) {
    const scholarId = normalizeScholarId(form[`scholarId${i}`] || "");

    if (scholarId) {
      ids.push({
        scholarId,
        playerLabel: `PLAYER ${i}`,
      });
    }
  }

  const substituteScholarId = normalizeScholarId(
    form.substituteScholarId || ""
  );

  if (substituteScholarId) {
    ids.push({
      scholarId: substituteScholarId,
      playerLabel: "SUBSTITUTE PLAYER",
    });
  }

  return ids;
};

const initialRampageForm = {
  teamName: "",
  iglName: "",
  iglIgn: "",
  player2Name: "",
  player3Name: "",
  player4Name: "",
  player5Name: "",
  player2Ign: "",
  player3Ign: "",
  player4Ign: "",
  player5Ign: "",
  substituteName: "",
  substituteIgn: "",
  substituteScholarId: "",
  phone1: "",
  phone2: "",
  scholarId1: "",
  scholarId2: "",
  scholarId3: "",
  scholarId4: "",
  scholarId5: "",
};

const monochrome = {
  border: "border-white/15",
  hoverBorder: "hover/55",
  text: "group-hover",
  line: "bg-white",
  glow:
    "hover:shadow-[0_0_25px_rgba(255,255,255,0.18),0_0_70px_rgba(0,0,0,0.55)]",
  dot: "bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.35)]",
  overlay: "group-hover/[0.035]",
};

/* ==========================================================
PAC-MAN MAZE BACKGROUND (Clean unmount on modal open)
========================================================== */

const WhiteCombatMaze = ({ disabled = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-6, 6, 6, -6, 0.1, 100);
    camera.position.set(0, 10, 0.0001);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);

    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
      precision: "mediump",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.25)
    );
    renderer.setClearColor(0x000000, 0);

    const SIZE = isMobile ? 17 : 21;
    const CELL = 0.56;
    const mazeWidth = SIZE * CELL;
    const mazeGroup = new THREE.Group();
    mazeGroup.scale.setScalar(0.78);
    mazeGroup.rotation.x = -0.58;
    mazeGroup.rotation.z = 0.06;
    scene.add(mazeGroup);

    const generateMaze = (size) => {
      const grid = Array.from({ length: size }, () => Array(size).fill(1));
      const directions = [
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2],
      ];

      const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };

      const carve = (row, col) => {
        grid[row][col] = 0;
        const dirs = shuffle([...directions]);
        dirs.forEach(([dr, dc]) => {
          const nr = row + dr;
          const nc = col + dc;
          if (
            nr > 0 &&
            nr < size - 1 &&
            nc > 0 &&
            nc < size - 1 &&
            grid[nr][nc] === 1
          ) {
            grid[row + dr / 2][col + dc / 2] = 0;
            carve(nr, nc);
          }
        });
      };

      carve(1, 1);

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (grid[r][c] === 1 && Math.random() < 0.045) {
            grid[r][c] = 0;
          }
        }
      }
      return grid;
    };

    const maze = generateMaze(SIZE);
    const offset = (SIZE * CELL) / 2;
    const wallSegments = [];

    const addWall = (x1, z1, x2, z2) => {
      wallSegments.push(new THREE.Vector3(x1, 0, z1), new THREE.Vector3(x2, 0, z2));
    };

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (maze[r][c] !== 0) continue;

        const x = c * CELL - offset;
        const z = r * CELL - offset;

        if (r === 0 || maze[r - 1][c] === 1) addWall(x, z, x + CELL, z);
        if (r === SIZE - 1 || maze[r + 1][c] === 1) addWall(x, z + CELL, x + CELL, z + CELL);
        if (c === 0 || maze[r][c - 1] === 1) addWall(x, z, x, z + CELL);
        if (c === SIZE - 1 || maze[r][c + 1] === 1) addWall(x + CELL, z, x + CELL, z + CELL);
      }
    }

    const wallGeometry = new THREE.BufferGeometry().setFromPoints(wallSegments);
    const wallMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const walls = new THREE.LineSegments(wallGeometry, wallMaterial);
    mazeGroup.add(walls);

    const borderPoints = [
      [-offset, -offset],
      [offset, -offset],
      [offset, offset],
      [-offset, offset],
      [-offset, -offset],
    ].map(([x, z]) => new THREE.Vector3(x, 0, z));

    const borderGeometry = new THREE.BufferGeometry().setFromPoints(borderPoints);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const border = new THREE.Line(borderGeometry, borderMaterial);
    mazeGroup.add(border);

    const glowGeometry = wallGeometry.clone();
    const glowMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.LineSegments(glowGeometry, glowMaterial);
    glow.scale.set(1.008, 1, 1.008);
    mazeGroup.add(glow);

    const pacmanGroup = new THREE.Group();
    mazeGroup.add(pacmanGroup);

    const shape = new THREE.Shape();
    const radius = CELL * 0.3;
    const mouth = Math.PI / 5;
    shape.moveTo(0, 0);
    shape.lineTo(Math.cos(mouth) * radius, Math.sin(mouth) * radius);
    for (let i = 0; i <= 30; i++) {
      const angle = mouth + ((Math.PI * 2 - mouth * 2) * i) / 30;
      shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    shape.lineTo(0, 0);

    const pacmanGeometry = new THREE.ShapeGeometry(shape);
    const pacmanMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
    const pacman = new THREE.Mesh(pacmanGeometry, pacmanMaterial);
    pacman.rotation.x = -Math.PI / 2;
    pacman.position.y = 0.025;
    pacmanGroup.add(pacman);

    const pellets = [];
    const pelletGeometry = new THREE.CircleGeometry(0.035, 6);
    const pelletMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });

    for (let r = 1; r < SIZE - 1; r++) {
      for (let c = 1; c < SIZE - 1; c++) {
        if (
          maze[r][c] !== 0 ||
          Math.random() > (isMobile ? 0.32 : 0.48)
        ) continue;

        const pellet = new THREE.Mesh(pelletGeometry, pelletMaterial);
        pellet.rotation.x = -Math.PI / 2;
        pellet.position.set(
          c * CELL - offset + CELL / 2,
          0.018,
          r * CELL - offset + CELL / 2
        );
        mazeGroup.add(pellet);
        pellets.push({
          mesh: pellet,
          active: true,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    const cursor = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.13, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      })
    );
    cursor.rotation.x = -Math.PI / 2;
    cursor.position.y = 0.05;
    scene.add(cursor);

    const target = new THREE.Vector3();
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
      target.set(mouseX * mazeWidth * 0.48, 0.04, mouseY * mazeWidth * 0.4);
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const shock = new THREE.Mesh(
      new THREE.RingGeometry(0.08, 0.11, 64),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
    );
    shock.rotation.x = -Math.PI / 2;
    mazeGroup.add(shock);
    let shockLife = 0;

    const onClick = () => {
      shock.position.copy(pacmanGroup.position);
      shock.position.y = 0.08;
      shock.scale.setScalar(0.1);
      shock.material.opacity = 0.8;
      shockLife = 1;
    };
    window.addEventListener("click", onClick);

    let scrollVelocity = 0;
    let lastScroll = window.scrollY || 0;

    const onScroll = () => {
      const current = window.scrollY || 0;
      scrollVelocity = THREE.MathUtils.clamp(
        scrollVelocity + (current - lastScroll) * 0.0015,
        -0.08,
        0.08
      );
      lastScroll = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      const view = 12;
      camera.top = view / 2;
      camera.bottom = -view / 2;
      camera.right = (view * aspect) / 2;
      camera.left = -(view * aspect) / 2;
      camera.updateProjectionMatrix();
    };
    const onContextLost = (event) => {
      event.preventDefault();
    };

    const onContextRestored = () => {};

    canvas.addEventListener("webglcontextlost", onContextLost, false);
    canvas.addEventListener("webglcontextrestored", onContextRestored, false);

    window.addEventListener("resize", resize);
    resize();

    const clock = new THREE.Clock();
    let animationFrame;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      cursor.position.x = target.x;
      cursor.position.z = target.z;
      cursor.rotation.z = time * 0.6;
      cursor.scale.setScalar(1 + Math.sin(time * 3) * 0.08);

      pacmanGroup.position.lerp(target, 0.045);
      const dx = target.x - pacmanGroup.position.x;
      const dz = target.z - pacmanGroup.position.z;
      if (Math.abs(dx) + Math.abs(dz) > 0.02) {
        pacman.rotation.z = Math.atan2(dx, dz);
      }
      pacman.scale.y = 0.82 + Math.sin(time * 9) * 0.16;

      pellets.forEach((pellet) => {
        if (!pellet.active) return;
        const pulse = Math.sin(time * 3 + pellet.phase) * 0.5 + 0.5;
        pellet.mesh.material.opacity = 0.35 + pulse * 0.3;
        pellet.mesh.scale.setScalar(0.85 + pulse * 0.25);
        const distance = Math.hypot(
          pellet.mesh.position.x - pacmanGroup.position.x,
          pellet.mesh.position.z - pacmanGroup.position.z
        );
        if (distance < 0.28) {
          pellet.active = false;
          pellet.mesh.scale.setScalar(0.01);
        }
      });

      const targetRotationX = -0.58 + mouseY * 0.26;
      const targetRotationZ = 0.06 - mouseX * 0.2;
      mazeGroup.rotation.x += (targetRotationX - mazeGroup.rotation.x) * 0.055;
      mazeGroup.rotation.z += (targetRotationZ - mazeGroup.rotation.z) * 0.055;

      const targetPosX = mouseX * 0.16;
      const targetPosZ = mouseY * 0.12;
      mazeGroup.position.x += (targetPosX - mazeGroup.position.x) * 0.035;
      mazeGroup.position.z += (targetPosZ - mazeGroup.position.z) * 0.035;

      scrollVelocity *= 0.9;
      mazeGroup.position.y += scrollVelocity * 0.8;
      mazeGroup.position.y *= 0.94;

      if (shockLife > 0) {
        shockLife -= 0.045;
        const progress = 1 - shockLife;
        shock.scale.setScalar(0.2 + progress * 2.6);
        shock.material.opacity = shockLife * 0.75;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);

      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      // Force hardware context loss on Safari to immediately reclaim GPU memory
      renderer.dispose();
    };
  }, [disabled]);

  return (
    <div className="white-pacman-maze">
      {!disabled && <canvas ref={canvasRef} className="white-pacman-maze-canvas" />}
      <div className="maze-vignette" />
      <style>{`
        .white-pacman-maze {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background: #000;
        }
        .white-pacman-maze-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          opacity: 1;
          mix-blend-mode: screen;
        }
        .maze-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            ellipse at center,
            transparent 30%,
            rgba(0,0,0,0.20) 62%,
            rgba(0,0,0,0.78) 100%
          );
        }
        @media (max-width: 768px) {
          .white-pacman-maze-canvas {
            opacity: 0.82;
          }
        }
      `}</style>
    </div>
  );
};

/* ==========================================================
SCROLL SECTION COMPONENT
========================================================== */

const ScrollSection = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [rampageForm, setRampageForm] = useState(initialRampageForm);
  const rampageFormRef = useRef(initialRampageForm);

  const updateRampageFormField = (key, value) => {
    rampageFormRef.current[key] = value;
    setRampageForm((current) => ({ ...current, [key]: value }));
  };

  const [paymentProof, setPaymentProof] = useState(null);
  const [formError, setFormError] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [qrLoadFailed, setQrLoadFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [randomPairing, setRandomPairing] = useState(false);
  const [randomPairingPromptOpen, setRandomPairingPromptOpen] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const sectionRef = useRef(null);

  /* HIGHLY OPTIMIZED STARFIELD BACKGROUND */
  useEffect(() => {
    if (selectedTournament && !registrationComplete) return;

    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));

    const canvas = document.createElement("canvas");
    canvas.className = "merch-starfield-canvas";
    document.body.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.018);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: isMobile ? "low-power" : "high-performance",
      precision: isMobile ? "mediump" : "highp",
    });

    const getPixelRatio = () =>
      Math.min(window.devicePixelRatio || 1, isMobile ? 1.15 : 1.25);

    renderer.setPixelRatio(getPixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);

    const particleCount = isMobile ? 450 : 900;
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.2 + Math.pow(Math.random(), 0.52) * 11.5;
      const z = -10 + Math.random() * 12;

      particleSpeeds[i] = 0.008 + Math.random() * 0.035;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.sin(a) * r;
      positions[i * 3 + 2] = z;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const positionAttr = particleGeometry.attributes.position;
    const posArray = positionAttr.array;

    const starTexCanvas = document.createElement("canvas");
    starTexCanvas.width = 32;
    starTexCanvas.height = 32;

    const ctx = starTexCanvas.getContext("2d");

    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.22, "rgba(255,255,255,1)");
      grad.addColorStop(0.48, "rgba(255,255,255,0.62)");
      grad.addColorStop(0.72, "rgba(255,255,255,0.22)");
      grad.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    const starTexture = new THREE.CanvasTexture(starTexCanvas);
    starTexture.minFilter = THREE.LinearFilter;
    starTexture.magFilter = THREE.LinearFilter;
    starTexture.generateMipmaps = false;

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: isMobile ? 0.065 : 0.078,
        map: starTexture,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })
    );
    scene.add(particles);

    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -((event.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let scrollTarget = 0;
    let scrollCurrent = 0;
    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScroll;
      scrollTarget = THREE.MathUtils.clamp(
        scrollTarget + delta * 0.016,
        -3.5,
        9
      );
      lastScroll = current;
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(getPixelRatio());
      renderer.setSize(width, height, false);
    };

    const onStarfieldContextLost = (event) => {
      event.preventDefault();
    };

    const onStarfieldContextRestored = () => {};

    canvas.addEventListener(
      "webglcontextlost",
      onStarfieldContextLost,
      false
    );
    canvas.addEventListener(
      "webglcontextrestored",
      onStarfieldContextRestored,
      false
    );

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let animationFrame;
    let time = 0;
    const arrayLength = particleCount * 3;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.033);
      time += dt;

      const damping = (speed) => 1 - Math.exp(-speed * dt);

      smoothX += (mouseX - smoothX) * damping(8);
      smoothY += (mouseY - smoothY) * damping(8);

      scrollCurrent += (scrollTarget - scrollCurrent) * damping(5.5);
      const cameraZ = 9 - scrollCurrent * 1.35;
      camera.position.z += (cameraZ - camera.position.z) * damping(6);

      for (let i = 2, s = 0; i < arrayLength; i += 3, s++) {
        let z = posArray[i] + particleSpeeds[s];
        if (z > 1.8) {
          z = -10;
        }
        posArray[i] = z;
      }

      particles.rotation.z = time * 0.022;
      positionAttr.needsUpdate = true;

      if (!document.hidden) {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      canvas.removeEventListener(
        "webglcontextlost",
        onStarfieldContextLost
      );
      canvas.removeEventListener(
        "webglcontextrestored",
        onStarfieldContextRestored
      );

      particleGeometry.dispose();
      particles.material.dispose();
      starTexture.dispose();
      renderer.dispose();

      if (canvas.parentNode === document.body) {
        document.body.removeChild(canvas);
      }
    };
  }, [selectedTournament, registrationComplete]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setCardsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const isSportomania = selectedEvent === "SPORTOMANIA";
  const isRampage = selectedEvent === "RAMPAGE 2026";
  const sportomaniaMainPlayerCount = selectedTournament?.game === "MLBB" ? 5 : 4;
  const sportomaniaFee = isSportomania
    ? getSportomaniaFee(rampageForm, sportomaniaMainPlayerCount)
    : 0;
  const rampageFee = isRampage
    ? getRampageFee(selectedTournament?.game)
    : 0;

  const currentMainCount = selectedTournament?.game === "MLBB" ? 5 : 4;
  const registeredPlayerCount = Array.from(
    { length: currentMainCount },
    (_, index) => index + 1
  ).filter((number) => {
    const name = String(
      number === 1 ? rampageForm.iglName : rampageForm[`player${number}Name`] || ""
    ).trim();
    const ign = String(
      number === 1 ? rampageForm.iglIgn : rampageForm[`player${number}Ign`] || ""
    ).trim();
    const scholarId = String(rampageForm[`scholarId${number}`] || "").trim();
    return Boolean(name && ign && scholarId);
  }).length;

  /* =========================================================
     HANDLE FORM SUBMIT
     ========================================================= */
  const handleFormSubmit = async (e = null, forcedRandomPairing = null) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (isSubmitting) return;

    // Use current form state safely
    const form = { ...rampageFormRef.current, ...rampageForm };

    const game = selectedTournament?.game;
    const isSportomania = selectedEvent === "SPORTOMANIA";
    const isRampage = selectedEvent === "RAMPAGE 2026";

    // Defensive guard: SPORTOMANIA registrations are closed.
    if (isSportomania) {
      setFormError("SPORTOMANIA REGISTRATIONS ARE CLOSED.");
      return;
    }

    const mainPlayerCount = game === "MLBB" ? 5 : 4;
    const currentSportomaniaFee = isSportomania
      ? getSportomaniaFee(form, mainPlayerCount)
      : 0;
    const currentRampageFee = isRampage ? getRampageFee(game) : 0;
    const registrationFee = isSportomania
      ? currentSportomaniaFee
      : currentRampageFee;

    const currentRegisteredPlayerCount = Array.from(
      { length: game === "MLBB" ? 5 : 4 },
      (_, index) => index + 1
    ).filter((number) => {
      const name = String(
        number === 1 ? form.iglName : form[`player${number}Name`] || ""
      ).trim();
      const ign = String(
        number === 1 ? form.iglIgn : form[`player${number}Ign`] || ""
      ).trim();
      const scholarId = String(form[`scholarId${number}`] || "").trim();
      return Boolean(name && ign && scholarId);
    }).length;

    /* =========================================================
       MAIN PLAYER VALIDATION
       ========================================================= */
    const player1Name = String(form.iglName || "").trim();
    const player1Ign = String(form.iglIgn || "").trim();
    const player1ScholarId = normalizeScholarId(form.scholarId1);

    if (!player1Name || !player1Ign || !player1ScholarId) {
      setFormError("PLAYER 1 NAME, IGN AND SCHOLAR ID are required.");
      return;
    }

    for (let i = 1; i <= mainPlayerCount; i += 1) {
      const name = String(
        i === 1 ? form.iglName : form[`player${i}Name`] || ""
      ).trim();
      const ign = String(
        i === 1 ? form.iglIgn : form[`player${i}Ign`] || ""
      ).trim();
      const scholarId = normalizeScholarId(form[`scholarId${i}`] || "");

      const hasAnyPlayerData = Boolean(name || ign || scholarId);

      if (i > 1 && !hasAnyPlayerData) {
        continue;
      }

      if (!name || !ign || !scholarId) {
        setFormError(
          `PLAYER ${i} NAME, IGN AND SCHOLAR ID are all required. Complete all three fields or leave this player slot completely empty.`
        );
        return;
      }

      if (!/^(?:\d{7}|[A-Z0-9]{9})$/.test(scholarId)) {
        setFormError(
          `PLAYER ${i} SCHOLAR ID must be exactly 7 digits or 9 alphanumeric characters.`
        );
        return;
      }
    }

    /* =========================================================
       PHONE VALIDATION
       ========================================================= */
    if (!/^\d{10}$/.test(form.phone1)) {
      setFormError("Phone Number 1 must contain exactly 10 digits.");
      return;
    }

    if (form.phone2 && !/^\d{10}$/.test(form.phone2)) {
      setFormError(
        "Phone Number 2 must contain exactly 10 digits if provided."
      );
      return;
    }

    /* =========================================================
       SUBSTITUTE VALIDATION
       ========================================================= */
    const substituteName = String(form.substituteName || "").trim();
    const substituteIgn = String(form.substituteIgn || "").trim();
    const substituteScholarId = normalizeScholarId(form.substituteScholarId);

    const hasAnySubstituteData = Boolean(
      substituteName || substituteIgn || substituteScholarId
    );

    const hasCompleteSubstitute = Boolean(
      substituteName && substituteIgn && substituteScholarId
    );

    if (hasAnySubstituteData && !hasCompleteSubstitute) {
      setFormError(
        "SUBSTITUTE PLAYER NAME, IGN AND SCHOLAR ID are all required. Complete all three fields or leave the substitute section completely empty."
      );
      return;
    }

    if (hasCompleteSubstitute) {
      if (!/^(?:\d{7}|[A-Z0-9]{9})$/.test(substituteScholarId)) {
        setFormError(
          "SUBSTITUTE SCHOLAR ID must be exactly 7 digits or 9 alphanumeric characters."
        );
        return;
      }
    }

    /* =========================================================
       SAME-FORM DUPLICATE CHECK
       ========================================================= */
    const formScholarIds = getFormScholarIds(form, mainPlayerCount);
    const seenScholarIds = new Map();

    for (const item of formScholarIds) {
      const normalized = normalizeScholarId(item.scholarId);

      if (seenScholarIds.has(normalized)) {
        setFormError(
          `SCHOLAR ID ${normalized} CANNOT BE USED BY MORE THAN ONE PLAYER IN THE SAME GAME.`
        );
        return;
      }

      seenScholarIds.set(normalized, item.playerLabel);
    }

    /* =========================================================
       PAYMENT VALIDATION
       ========================================================= */
    const hasSubstitute = hasCompleteSubstitute;

    if (registrationFee > 0 && !paymentProof) {
      setFormError(
        `Payment proof is required. Registration cannot be completed without uploading the payment screenshot for ₹${registrationFee}.`
      );
      return;
    }

    /* =========================================================
       SUPABASE CONFIGURATION
       ========================================================= */
    if (!supabase) {
      setFormError(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env.local file."
      );
      return;
    }

    /* =========================================================
       RANDOM PAIRING PROMPT
       ========================================================= */
    if (
      (isSportomania || isRampage) &&
      currentRegisteredPlayerCount >= 1 &&
      currentRegisteredPlayerCount <= (selectedTournament?.game === "MLBB" ? 4 : 3) &&
      forcedRandomPairing === null
    ) {
      setRandomPairingPromptOpen(true);
      return;
    }

    const effectiveRandomPairing =
      (isSportomania || isRampage) &&
      currentRegisteredPlayerCount <= (selectedTournament?.game === "MLBB" ? 4 : 3)
        ? Boolean(forcedRandomPairing)
        : false;

    setRandomPairing(effectiveRandomPairing);
    setRandomPairingPromptOpen(false);
    setIsSubmitting(true);
    setFormError("");

    let uploadedProofPath = "";

    const registrationTable = isSportomania
      ? SPORTOMANIA_REGISTRATION_TABLE
      : RAMPAGE_REGISTRATION_TABLE;

    const paymentBucket = isSportomania
      ? SPORTOMANIA_PAYMENT_BUCKET
      : RAMPAGE_PAYMENT_BUCKET;

    const registrationEventName = isSportomania
      ? "SPORTOMANIA"
      : "RAMPAGE 2026";

    try {
      if (registrationFee > 0) {
        const safeFileName = paymentProof.name
          .toLowerCase()
          .replace(/[^a-z0-9._-]/g, "-");

        const uniqueId =
          globalThis.crypto?.randomUUID?.() ||
          `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

        const proofPath = `${
          isSportomania ? "sportomania" : "rampage-2026"
        }/${Date.now()}-${uniqueId}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from(paymentBucket)
          .upload(proofPath, paymentProof, {
            cacheControl: "3600",
            upsert: false,
            contentType:
              paymentProof.type || "application/octet-stream",
          });

        if (uploadError) {
          throw new Error(
            `Payment proof upload failed: ${uploadError.message}. ` +
              `Check that the "${paymentBucket}" bucket exists and has an INSERT policy for anon users.`
          );
        }

        uploadedProofPath = proofPath;
      }

      const player2Present = Boolean(
        String(form.player2Name || "").trim() ||
        String(form.player2Ign || "").trim() ||
        String(form.scholarId2 || "").trim()
      );

      const player3Present = Boolean(
        String(form.player3Name || "").trim() ||
        String(form.player3Ign || "").trim() ||
        String(form.scholarId3 || "").trim()
      );

      const player4Present = Boolean(
        String(form.player4Name || "").trim() ||
        String(form.player4Ign || "").trim() ||
        String(form.scholarId4 || "").trim()
      );

      const player5Present = Boolean(
        String(form.player5Name || "").trim() ||
        String(form.player5Ign || "").trim() ||
        String(form.scholarId5 || "").trim()
      );

      const { error: insertError } = await supabase
        .from(registrationTable)
        .insert({
          event_name: registrationEventName,
          tournament: selectedTournament?.title || "",
          game: game || "",
          team_name: String(form.teamName || "").trim(),

          igl_name: String(form.iglName || "").trim(),
          igl_ign: String(form.iglIgn || "").trim(),
          scholar_id_1: normalizeScholarId(form.scholarId1),

          player2_name: isSportomania
            ? player2Present
              ? String(form.player2Name || "").trim()
              : null
            : String(form.player2Name || "").trim(),

          player2_ign: isSportomania
            ? player2Present
              ? String(form.player2Ign || "").trim()
              : null
            : String(form.player2Ign || "").trim(),

          scholar_id_2: isSportomania
            ? player2Present
              ? normalizeScholarId(form.scholarId2)
              : null
            : normalizeScholarId(form.scholarId2),

          player3_name: isSportomania
            ? player3Present
              ? String(form.player3Name || "").trim()
              : null
            : String(form.player3Name || "").trim(),

          player3_ign: isSportomania
            ? player3Present
              ? String(form.player3Ign || "").trim()
              : null
            : String(form.player3Ign || "").trim(),

          scholar_id_3: isSportomania
            ? player3Present
              ? normalizeScholarId(form.scholarId3)
              : null
            : normalizeScholarId(form.scholarId3),

          player4_name: isSportomania
            ? player4Present
              ? String(form.player4Name || "").trim()
              : null
            : String(form.player4Name || "").trim(),

          player4_ign: isSportomania
            ? player4Present
              ? String(form.player4Ign || "").trim()
              : null
            : String(form.player4Ign || "").trim(),

          scholar_id_4: isSportomania
            ? player4Present
              ? normalizeScholarId(form.scholarId4)
              : null
            : normalizeScholarId(form.scholarId4),

          player5_name: isSportomania
            ? player5Present
              ? String(form.player5Name || "").trim()
              : null
            : String(form.player5Name || "").trim(),

          player5_ign: isSportomania
            ? player5Present
              ? String(form.player5Ign || "").trim()
              : null
            : String(form.player5Ign || "").trim(),

          scholar_id_5: isSportomania
            ? player5Present
              ? normalizeScholarId(form.scholarId5)
              : null
            : normalizeScholarId(form.scholarId5),

          substitute_name: hasSubstitute
            ? String(form.substituteName || "").trim()
            : null,

          substitute_ign: hasSubstitute
            ? String(form.substituteIgn || "").trim()
            : null,

          substitute_scholar_id: hasSubstitute
            ? normalizeScholarId(form.substituteScholarId)
            : null,

          phone1: form.phone1,
          phone2: form.phone2 || null,
          payment_proof_path: uploadedProofPath || null,

          random_pairing:
            (isSportomania || isRampage) &&
            currentRegisteredPlayerCount <= (game === "MLBB" ? 4 : 3)
              ? effectiveRandomPairing
                ? "YES"
                : "NO"
              : "NO",
        });

      if (insertError) {
        if (
          insertError.code === "P0001" &&
          /SCHOLAR ID .* ALREADY REGISTERED FOR GAME/i.test(insertError.message || "")
        ) {
          throw new Error(insertError.message);
        }

        throw new Error(
          `Registration save failed: ${insertError.message}${
            insertError.code ? ` [${insertError.code}]` : ""
          }`
        );
      }

      setRegistrationComplete(true);
    } catch (error) {
      if (uploadedProofPath) {
        await supabase.storage
          .from(paymentBucket)
          .remove([uploadedProofPath])
          .catch(() => {});
      }
      setFormError(
        error?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="
        events-root
        relative
        min-h-screen
        w-full
        overflow-hidden
        bg-[#030305]
        px-5
        py-24
        sm:px-8
        md:px-12
        lg:px-[8%]
      "
    >
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

        .events-root,
        .events-root *,
        .live-events-section,
        .live-events-section button,
        .live-events-section h3,
        .live-events-section p,
        .live-events-section span {
          font-family: "The Last Shuriken", sans-serif;
        }

        .merch-starfield-canvas {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
        }

        .events-title-svg {
          display: block;
          width: min(92vw, 1000px);
          height: auto;
          overflow: visible;
          pointer-events: none;
          margin-left: auto;
          margin-right: auto;
        }

        .events-title-base {
          fill: url(#eventsTitleFill);
          stroke: none;
          paint-order: normal;
          filter: url(#eventsTitleShadow);
        }

        .events-title-inner {
          fill: url(#eventsTitleInner);
          stroke: none;
          opacity: .34;
          pointer-events: none;
        }

        .events-title-shine {
          fill: url(#eventsTitleShine);
          stroke: none;
          paint-order: normal;
          pointer-events: none;
          opacity: .88;
          mix-blend-mode: screen;
          filter:
            drop-shadow(0 0 4px rgba(255,255,255,.20))
            drop-shadow(0 0 11px rgba(255,255,255,.08));
        }

        .events-card {
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.075),
              rgba(3,3,5,.80) 48%,
              rgba(255,255,255,.025)
            );
          border-color: rgba(255,255,255,.15);
          backdrop-filter: blur(20px) saturate(70%);
          -webkit-backdrop-filter: blur(20px) saturate(70%);
          box-shadow: 0 18px 65px rgba(0,0,0,.65);
        }

        .events-card:hover {
          border-color: rgba(255,255,255,.35);
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.09),
              rgba(3,3,5,.82) 48%,
              rgba(255,255,255,.035)
            );
          box-shadow:
            0 22px 75px rgba(0,0,0,.72),
            0 0 28px rgba(255,255,255,.045);
        }

        /* iOS Safari Stability: Prevents GPU memory overflow and zoom on focus */
        @media (max-width: 768px) {
          .events-root input,
          .events-root button,
          .events-root label {
            -webkit-tap-highlight-color: transparent;
          }

          /* Font size must be 16px to prevent iOS Safari auto-zoom crash */
          .events-root input {
            font-size: 16px !important;
            -webkit-appearance: none;
            appearance: none;
          }

          .events-card {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background: rgba(8, 8, 12, 0.92) !important;
          }
        }
      `}</style>

      {/* PAC-MAN MAZE BACKGROUND (Completely unmounted when modal is open) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <WhiteCombatMaze disabled={Boolean(selectedTournament && !registrationComplete)} />
      </div>

      {/* BACKGROUND TEXTURE */}
      <div
        className="pointer-events-none fixed inset-0 z-[2] opacity-[.055]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="pointer-events-none fixed left-[8%] top-[18%] z-[2] h-[320px] w-[420px] rounded-full bg-white/[.075] blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[5%] right-[7%] z-[2] h-[340px] w-[430px] rounded-full bg-white/[.055] blur-[130px]" />

      {/* MAIN CONTENT */}
      <div className="live-events-section relative z-10 mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
          <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:translate-y-6 lg:w-max">
            <div
              className={`relative flex justify-center overflow-visible transform transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                cardsVisible
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-[100px] scale-[0.88] opacity-0"
              }`}
            >
              <svg
                className="events-title-svg"
                viewBox="0 0 1000 120"
                preserveAspectRatio="xMidYMid meet"
                role="heading"
                aria-level="2"
                aria-label="EVENTS"
              >
                <defs>
                  <linearGradient id="eventsTitleFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="14%" stopColor="#f1f1f1" />
                    <stop offset="30%" stopColor="#dcdcdc" />
                    <stop offset="46%" stopColor="#686868" />
                    <stop offset="60%" stopColor="#303030" />
                    <stop offset="72%" stopColor="#8a8a8a" />
                    <stop offset="86%" stopColor="#d9d9d9" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>

                  <linearGradient id="eventsTitleInner" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="38%" stopColor="#dddddd" />
                    <stop offset="58%" stopColor="#666666" />
                    <stop offset="78%" stopColor="#bdbdbd" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>

                  <linearGradient
                    id="eventsTitleShine"
                    gradientUnits="userSpaceOnUse"
                    x1="-260"
                    y1="0"
                    x2="-80"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="38%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.92" />
                    <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    <animateTransform
                      attributeName="gradientTransform"
                      type="translate"
                      from="0 0"
                      to="1320 0"
                      dur="3.8s"
                      repeatCount="indefinite"
                    />
                  </linearGradient>

                  <filter
                    id="eventsTitleShadow"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="180%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="7"
                      stdDeviation="5"
                      floodColor="#000000"
                      floodOpacity=".98"
                    />
                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="2"
                      floodColor="#000000"
                      floodOpacity=".70"
                    />
                  </filter>
                </defs>

                <text
                  x="50%"
                  y="86"
                  textAnchor="middle"
                  fontFamily="The Last Shuriken, sans-serif"
                  fontSize="92"
                  fontWeight="700"
                  letterSpacing="-4"
                  className="events-title-base"
                >
                  EVENTS
                </text>
                <text
                  x="50%"
                  y="86"
                  textAnchor="middle"
                  fontFamily="The Last Shuriken, sans-serif"
                  fontSize="92"
                  fontWeight="700"
                  letterSpacing="-4"
                  className="events-title-inner"
                  aria-hidden="true"
                >
                  EVENTS
                </text>
                <text
                  x="50%"
                  y="86"
                  textAnchor="middle"
                  fontFamily="The Last Shuriken, sans-serif"
                  fontSize="92"
                  fontWeight="700"
                  letterSpacing="-4"
                  className="events-title-shine"
                  aria-hidden="true"
                >
                  EVENTS
                </text>
              </svg>
            </div>
          </div>

          <p className="max-w-sm text-[9px] font-medium uppercase leading-6 tracking-[0.22em] text-white/65 lg:pb-1">
            Upcoming battles, completed tournaments and the moments
            <br />
            that define our esports arena.
          </p>
        </div>

        {/* EVENT CARDS */}
        <div className="grid grid-cols-1 place-items-center gap-8 sm:grid-cols-2 lg:grid-cols-2 lg:gap-14">
          {events.map((event, index) => {
            const style = monochrome;

            return (
              <article
                key={event.id}
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
                className={`events-card group relative mx-auto aspect-[4/5] w-full max-w-[330px] cursor-pointer overflow-hidden rounded-2xl border ${
                  style.border
                } ${style.hoverBorder} bg-white/[0.07] transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  cardsVisible
                    ? "translate-y-0 scale-100 rotate-0 opacity-100"
                    : "translate-y-[220px] scale-[0.75] rotate-[2deg] opacity-0"
                } hover:-translate-y-2 hover:scale-[1.02] ${style.glow}`}
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="absolute inset-0 h-full w-full object-cover object-[center_58%] opacity-85 brightness-[1.08] saturate-[1.12] transition-all duration-700 group-hover:scale-110 group-hover:opacity-90"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5" />
                <div className="absolute inset-0 bg-white/[0.025]" />
                <div className={`absolute inset-0 opacity-0 transition-all duration-500 ${style.overlay}`} />

                <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/70">
                      {event.category}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold tracking-[0.15em] text-white/30">
                    {event.id}
                  </span>
                </div>

                <div className="absolute right-5 top-14 hidden items-center gap-2 sm:flex">
                  <span className={`h-1 w-1 rounded-full ${style.dot}`} />
                  <span className="text-[7px] uppercase tracking-[0.2em] text-white/40">
                    {event.status}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3
                    className={`events-card-title text-lg font-bold uppercase tracking-[-0.02em] text-white transition-colors duration-300 ${style.text}`}
                  >
                    {event.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={11} className="text-white/40" />
                      <span className="text-[7px] font-medium uppercase tracking-[0.15em] text-white/45">
                        {event.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy size={11} className="text-white/40" />
                      <span className="text-[7px] font-medium uppercase tracking-[0.15em] text-white/45">
                        {event.location}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 max-w-[300px] text-[9px] leading-4 tracking-[0.04em] text-white/35">
                    {event.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      setPaymentProof(null);
                      setQrLoadFailed(false);
                      setRampageForm(initialRampageForm);
                      rampageFormRef.current = { ...initialRampageForm };
                      setRandomPairing(false);
                      setSelectedTournament(null);
                      setRegistrationComplete(false);
                      setSelectedEvent(event.title);
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/[0.06] px-4 py-2 text-[7px] font-bold uppercase tracking-[0.22em] text-white/70 backdrop-blur-md transition-all duration-300 hover:border-white hover:bg-white/[0.12] hover:text-white"
                  >
                    {event.title === "SPORTOMANIA" ? "VIEW DETAILS" : "REGISTER NOW"}
                    <ArrowRight
                      size={11}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </div>

                <div
                  className={`absolute bottom-0 left-0 h-[2px] ${style.line} transition-all duration-700 ${
                    activeCard === index ? "w-full" : "w-0"
                  }`}
                />
              </article>
            );
          })}
        </div>

        {/* VIEW ALL BUTTON */}
        <div className="mt-12 flex justify-center">
          <button className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-white/20 bg-white/[0.06] px-8 py-3.5 text-[8px] font-bold uppercase tracking-[0.3em] text-white/60 backdrop-blur-xl transition-all duration-300 hover:border-white hover:bg-white/[0.10] hover:text-white hover:shadow-[0_0_25px_rgba(255,255,255,0.16)]">
            <span className="relative z-10">VIEW ALL EVENTS</span>
            <ArrowRight
              size={14}
              className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>

      {/* TOURNAMENT LIST MODAL (Unmounted while Registration Form is open to free GPU memory) */}
      {selectedEvent && !selectedTournament && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 py-8 backdrop-blur-md"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-white/15 bg-[#050507]/95 p-6 shadow-[0_25px_100px_rgba(0,0,0,.8)] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white/60 transition hover:border-white/40 hover:text-white"
              aria-label="Close"
            >
              ×
            </button>

            <div className="mb-8 pr-12">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.28em] text-white/35">
                {tournamentDetails[selectedEvent] ? "TOURNAMENTS" : "EVENT DETAILS"}
              </p>
              <h2 className="events-section-heading text-2xl font-bold uppercase text-white sm:text-3xl">
                {selectedEvent}
              </h2>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/40">
                {tournamentDetails[selectedEvent]
                  ? selectedEvent === "SPORTOMANIA"
                    ? "REGISTRATIONS CLOSED — VIEW TOURNAMENT DETAILS"
                    : "Choose your battle and register now"
                  : "Additional event details will be announced soon"}
              </p>
            </div>

            {tournamentDetails[selectedEvent] ? (
              <div
                className={`grid gap-6 ${
                  tournamentDetails[selectedEvent].length === 3
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
                }`}
              >
                {tournamentDetails[selectedEvent].map((tournament, index) => {
                  const isRegistrationOpen = selectedEvent === "RAMPAGE 2026";

                  return (
                    <article
                      key={tournament.title}
                      className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.045] shadow-[0_18px_55px_rgba(0,0,0,.55)] transition-all duration-500 hover:-translate-y-1 hover:border-white/35"
                    >
                      <div className="relative h-40 overflow-hidden bg-[#070709]">
                        <img
                          src={tournament.image}
                          alt={tournament.title}
                          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 opacity-90 contrast-[1.05] saturate-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />
                        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white/65 backdrop-blur-xl">
                          {tournament.game}
                        </div>
                        <div className="absolute right-4 top-4 text-[8px] font-bold tracking-[0.2em] text-white/35">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="events-card-title text-base font-bold uppercase leading-tight text-white">
                          {tournament.title}
                        </h3>
                        <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-white/35">
                          {selectedEvent === "SPORTOMANIA"
                            ? "REGISTRATIONS CLOSED"
                            : "REGISTRATIONS LIVE • RAMPAGE 2026"}
                        </p>

                        <button
                          type="button"
                          disabled={!isRegistrationOpen}
                          onClick={() => {
                            if (isRegistrationOpen) {
                              setFormError("");
                              setPaymentProof(null);
                              setQrLoadFailed(false);
                              setRampageForm(initialRampageForm);
                              rampageFormRef.current = { ...initialRampageForm };
                              setRandomPairing(false);
                              setSelectedTournament(tournament);
                            }
                          }}
                          className={`mt-5 flex w-full items-center justify-center rounded-xl border px-4 py-3 text-[9px] font-bold uppercase tracking-[0.22em] transition-all duration-300 ${
                            isRegistrationOpen
                              ? "border-white/20 bg-white/[0.055] text-white/75 hover:border-white/60 hover:bg-white/[0.10] hover:text-white"
                              : "cursor-not-allowed border-white/10 bg-white/[0.02] text-white/30"
                          }`}
                        >
                          {isRegistrationOpen
                            ? "REGISTER NOW"
                            : selectedEvent === "SPORTOMANIA"
                              ? "REGISTRATIONS CLOSED"
                              : "REGISTRATION COMING SOON"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                  No additional tournament details available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REGISTRATION FORM MODAL */}
      {selectedTournament && !registrationComplete && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/95 px-2 py-3 sm:px-6 sm:py-6"
          onClick={() => setSelectedTournament(null)}
        >
          <div
            className="relative max-h-[96vh] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-3xl border border-white/15 bg-[#050507] p-4 shadow-[0_20px_80px_rgba(0,0,0,.85)] sm:max-h-[94vh] sm:bg-[#050507]/98 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedTournament(null)}
              className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white/60 transition hover:border-white/40 hover:text-white"
              aria-label="Close registration form"
            >
              ×
            </button>

            <div className="mb-8 flex flex-col items-center pr-10 text-center">
              <img
                src={RAMPAGE_LOGO}
                alt="RAMPAGE 2026"
                className="mb-5 h-20 w-auto object-contain grayscale brightness-150"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <p className="text-[9px] font-bold uppercase tracking-[0.30em] text-white/35">
                {selectedEvent} • TEAM REGISTRATION
              </p>
              <h2 className="events-section-heading mt-2 text-2xl font-bold uppercase text-white sm:text-3xl">
                {selectedTournament.title}
              </h2>
              <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-white/40">
                {isSportomania
                  ? sportomaniaFee === 0
                    ? "REGISTRATION FEE: FREE FOR CIVIL STUDENTS"
                    : `REGISTRATION FEE: ₹${sportomaniaFee} TOTAL • ₹10 PER OTHER-BRANCH PLAYER (SUBSTITUTE INCLUDED)`
                  : `REGISTRATION FEE: ₹${rampageFee} PER TEAM`}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-7">
              {isSportomania && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-red-400/25 bg-red-500/[0.06] px-4 py-3 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] leading-5 text-red-200/85">
                      PLEASE FILL THE FORM CAREFULLY. FALSE INFORMATION WILL LEAD TO DISQUALIFICATION FROM THE TOURNAMENT.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/15 bg-white/[0.035] px-4 py-4 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] leading-5 text-white/70">
                      SPORTOMANIA REGISTRATION NOTE
                    </p>
                    <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.10em] leading-5 text-white/45">
                      FREE EXCLUSIVELY FOR CIVIL ENGINEERING STUDENTS. STUDENTS FROM OTHER BRANCHES PAY ₹10 PER PERSON. SUBSTITUTE PLAYER ALSO FOLLOWS THE SAME SCHOLAR ID FEE RULE. ONLY THE TEAM LEADER / IGL MUST JOIN THE OFFICIAL WHATSAPP GROUP PROVIDED IN THIS FORM.
                    </p>
                  </div>
                </div>
              )}

              {isRampage && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/15 bg-white/[0.035] px-4 py-4 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] leading-5 text-white/70">
                      RAMPAGE NOTE
                    </p>
                    <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.10em] leading-5 text-white/45">
                      PLAYER 1 REQUIRED • OTHERS OPTIONAL • NAME + IGN + SCHOLAR ID REQUIRED IF FILLED • SCHOLAR ID: 7 DIGITS OR 9 ALPHANUMERIC CHARACTERS • SAME ID NOT ALLOWED TWICE IN THE SAME GAME.
                    </p>
                  </div>
                </div>
              )}

              {/* TEAM INFORMATION */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">
                    TEAM DETAILS
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <label className="block">
                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                    TEAM NAME *
                  </span>
                  <input
                    name="teamName"
                    required
                    value={rampageForm.teamName || ""}
                    onChange={(e) => updateRampageFormField("teamName", e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                    placeholder="Enter official squad / team name"
                  />
                </label>
              </div>

              {/* REAL NAMES */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">
                    TEAM PLAYERS (REAL NAMES)
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                      PLAYER 1 — IN-GAME LEADER (IGL) NAME *
                    </span>
                    <input
                      name="iglName"
                      required
                      value={rampageForm.iglName || ""}
                      onChange={(e) => updateRampageFormField("iglName", e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                      placeholder="Enter In-Game Leader (IGL) full name"
                    />
                  </label>

                  {[
                    ["PLAYER 2 NAME", "player2Name"],
                    ["PLAYER 3 NAME", "player3Name"],
                    ["PLAYER 4 NAME", "player4Name"],
                    ...(selectedTournament?.game === "MLBB"
                      ? [["PLAYER 5 NAME", "player5Name"]]
                      : []),
                  ].map(([label, key]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                        {label}
                      </span>
                      <input
                        name={key}
                        required={false}
                        value={rampageForm[key] || ""}
                        onChange={(e) => updateRampageFormField(key, e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* IGNS */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">
                    PLAYER IN-GAME NAME (IGN) — PLAYERS {selectedTournament?.game === "MLBB" ? "1–5" : "1–4"}
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                      PLAYER 1 — IN-GAME LEADER (IGL) IN-GAME NAME (IGN) *
                    </span>
                    <input
                      name="iglIgn"
                      required
                      value={rampageForm.iglIgn || ""}
                      onChange={(e) => updateRampageFormField("iglIgn", e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                      placeholder="Enter In-Game Leader (IGL) in-game handle"
                    />
                  </label>

                  {[
                    ["PLAYER 2 IN-GAME NAME (IGN)", "player2Ign"],
                    ["PLAYER 3 IN-GAME NAME (IGN)", "player3Ign"],
                    ["PLAYER 4 IN-GAME NAME (IGN)", "player4Ign"],
                    ...(selectedTournament?.game === "MLBB"
                      ? [["PLAYER 5 IN-GAME NAME (IGN)", "player5Ign"]]
                      : []),
                  ].map(([label, key]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                        {label}
                      </span>
                      <input
                        name={key}
                        required={false}
                        value={rampageForm[key] || ""}
                        onChange={(e) => updateRampageFormField(key, e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* SUBSTITUTE */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">
                    SUBSTITUTE PLAYER — OPTIONAL
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                      SUBSTITUTE PLAYER NAME
                    </span>
                    <input
                      name="substituteName"
                      required={Boolean(
                        rampageForm.substituteName ||
                          rampageForm.substituteIgn ||
                          rampageForm.substituteScholarId
                      )}
                      value={rampageForm.substituteName || ""}
                      onChange={(e) =>
                        updateRampageFormField("substituteName", e.target.value)
                      }
                      className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                      placeholder="Enter substitute real name"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                      SUBSTITUTE IGN
                    </span>
                    <input
                      name="substituteIgn"
                      required={Boolean(
                        rampageForm.substituteName ||
                          rampageForm.substituteIgn ||
                          rampageForm.substituteScholarId
                      )}
                      value={rampageForm.substituteIgn || ""}
                      onChange={(e) =>
                        updateRampageFormField("substituteIgn", e.target.value)
                      }
                      className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                      placeholder="Enter substitute IGN"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                      SUBSTITUTE SCHOLAR ID
                    </span>
                    <input
                      name="substituteScholarId"
                      required={Boolean(
                        rampageForm.substituteName ||
                          rampageForm.substituteIgn ||
                          rampageForm.substituteScholarId
                      )}
                      type="text"
                      inputMode="text"
                      pattern="(?:[0-9]{7}|[A-Za-z0-9]{9})"
                      maxLength={9}
                      value={rampageForm.substituteScholarId || ""}
                      onChange={(e) =>
                        updateRampageFormField(
                          "substituteScholarId",
                          e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, 9)
                        )
                      }
                      className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                      placeholder="7 digits or 9 alphanumeric characters"
                    />
                  </label>
                </div>
              </div>

              {/* CONTACT DETAILS */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">
                    CONTACT DETAILS
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    ["CONTACT PHONE NUMBER 1", "phone1", true],
                    ["CONTACT PHONE NUMBER 2", "phone2", false],
                  ].map(([label, key, required]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                        {label} {required ? "*" : "(OPTIONAL)"}
                      </span>
                      <input
                        name={key}
                        required={required}
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        value={rampageForm[key] || ""}
                        onChange={(e) =>
                          updateRampageFormField(
                            key,
                            e.target.value.replace(/\D/g, "").slice(0, 10)
                          )
                        }
                        className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                        placeholder={
                          required
                            ? "Enter 10 digit number"
                            : "Enter 10 digit number (optional)"
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* SCHOLAR IDS */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">
                    COLLEGE SCHOLAR ID
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from(
                    { length: selectedTournament?.game === "MLBB" ? 5 : 4 },
                    (_, index) => index + 1
                  ).map((number) => {
                    const key = `scholarId${number}`;
                    const isIgl = number === 1;

                    return (
                      <label key={key} className="block">
                        <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                          {isIgl
                            ? "PLAYER 1 — IN-GAME LEADER (IGL) SCHOLAR ID *"
                            : `PLAYER ${number} SCHOLAR ID`}
                        </span>
                        <input
                          name={key}
                          required={number === 1}
                          type="text"
                          inputMode="text"
                          pattern="(?:[0-9]{7}|[A-Za-z0-9]{9})"
                          maxLength={9}
                          value={rampageForm[key] || ""}
                          onChange={(e) =>
                            updateRampageFormField(
                              key,
                              e.target.value
                                .toUpperCase()
                                .replace(/[^A-Z0-9]/g, "")
                                .slice(0, 9)
                            )
                          }
                          className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                          placeholder="7 digits or 9 alphanumeric characters"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* PAYMENT & PROOF */}
              {(!isSportomania || sportomaniaFee > 0) && (
                <div className="rounded-2xl border border-white/15 bg-white/[0.035] p-5 sm:p-6">
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/45">
                        PAYMENT
                      </p>
                      <h3 className="mt-2 text-lg font-bold uppercase text-white">
                        PAY ₹{isSportomania ? sportomaniaFee : rampageFee} TOTAL
                      </h3>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/35">
                        {isSportomania
                          ? "CIVIL STUDENTS ARE FREE • OTHER BRANCHES PAY ₹10 PER PERSON. SCAN THE QR AND UPLOAD PAYMENT PROOF IF PAYMENT IS REQUIRED."
                          : "SCAN THE QR BELOW AND COMPLETE THE PAYMENT BEFORE UPLOADING PROOF."}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/15 bg-white/[0.045] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white/55">
                      {isSportomania ? `₹${sportomaniaFee} TOTAL` : `₹${rampageFee} / TEAM`}
                    </span>
                  </div>

                  <div className="mb-5 flex justify-center">
                    <div className="rounded-2xl border border-white/15 bg-white p-3 shadow-[0_0_35px_rgba(255,255,255,.08)]">
                      {!qrLoadFailed ? (
                        <img
                          src={isSportomania ? SPORTOMANIA_QR : RAMPAGE_QR}
                          alt={`${isSportomania ? "SPORTOMANIA" : "RAMPAGE 2026"} payment QR code`}
                          className="h-52 w-52 object-contain sm:h-60 sm:w-60"
                          onError={() => setQrLoadFailed(true)}
                        />
                      ) : (
                        <div className="flex h-52 w-52 items-center justify-center p-5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[#111] sm:h-60 sm:w-60">
                          {isSportomania
                            ? "SPORTOMANIA QR COULD NOT BE LOADED"
                            : "RAMPAGE QR COULD NOT BE LOADED"}
                        </div>
                      )}
                    </div>
                  </div>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/20 px-5 py-8 text-center transition hover:border-white/45 hover:bg-white/[0.03]">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        setPaymentProof(e.target.files?.[0] || null);
                        setFormError("");
                      }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-white/65">
                      {paymentProof
                        ? `FILE SELECTED: ${paymentProof.name}`
                        : "CLICK TO UPLOAD PAYMENT PHOTO *"}
                    </span>
                    <span className="mt-2 text-[8px] uppercase tracking-[0.14em] text-white/30">
                      JPG • PNG • WEBP • REQUIRED
                    </span>
                  </label>
                </div>
              )}

              {formError && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/[0.07] px-4 py-3 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-red-200">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-xl border border-white/25 bg-white/[0.08] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-all duration-300 hover:border-white hover:bg-white/[0.14] hover:shadow-[0_0_30px_rgba(255,255,255,.12)] disabled:cursor-wait disabled:opacity-50"
              >
                {isSubmitting ? "SUBMITTING REGISTRATION..." : "SUBMIT REGISTRATION"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RANDOM PAIRING SUBMIT POPUP */}
      {randomPairingPromptOpen && (
        <div
          className="fixed inset-0 z-[180] flex items-center justify-center bg-black/85 px-5 py-6 backdrop-blur-md"
          onClick={() => setRandomPairingPromptOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-white/20 bg-[#050507]/98 p-7 text-center shadow-[0_25px_120px_rgba(0,0,0,.95)] sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-white">
              ?
            </div>

            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/40">
              {selectedEvent}
            </p>

            <h3 className="mt-3 text-xl font-bold uppercase leading-tight tracking-[-0.02em] text-white">
              {registeredPlayerCount} PLAYER
              {registeredPlayerCount === 1 ? "" : "S"} REGISTERED
            </h3>

            <p className="mt-4 text-[10px] font-bold uppercase leading-5 tracking-[0.13em] text-white/60">
              DO YOU WANT RANDOM PAIRING WITH OTHER REGISTERED PLAYERS?
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRandomPairing(true);
                  setRandomPairingPromptOpen(false);
                  handleFormSubmit(null, true);
                }}
                className="rounded-xl border border-white/25 bg-white/[0.08] px-5 py-3 text-[9px] font-bold uppercase tracking-[0.20em] text-white transition hover:border-white hover:bg-white/[0.15]"
              >
                YES
              </button>

              <button
                type="button"
                onClick={() => {
                  setRandomPairing(false);
                  setRandomPairingPromptOpen(false);
                  handleFormSubmit(null, false);
                }}
                className="rounded-xl border border-white/15 bg-white/[0.03] px-5 py-3 text-[9px] font-bold uppercase tracking-[0.20em] text-white/65 transition hover:border-white/40 hover:bg-white/[0.08] hover:text-white"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION COMPLETE MODAL */}
      {registrationComplete && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/85 px-5 py-8 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-[#050507]/98 p-7 text-center shadow-[0_25px_120px_rgba(0,0,0,.9)] sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/[0.06] text-2xl text-white">
              ✓
            </div>
            <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.30em] text-white/35">
              {selectedEvent || "SPORTOMANIA"}
            </p>
            <h2 className="events-section-heading mt-2 text-2xl font-bold uppercase text-white sm:text-3xl">
              REGISTRATION COMPLETED
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[10px] leading-6 uppercase tracking-[0.12em] text-white/45">
              Registration submitted successfully for squad{" "}
              <span className="font-bold text-white">"{rampageForm.teamName}"</span> in{" "}
              {selectedTournament?.title || "TOURNAMENT"}. Only the team leader / IGL needs to join the official WhatsApp group provided in the registration form for bracket and fixture updates.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {getWhatsAppGroupForGame(selectedTournament?.game) && (
                <button
                  type="button"
                  onClick={() => {
                    const whatsappGroup = getWhatsAppGroupForGame(
                      selectedTournament?.game
                    );
                    if (whatsappGroup) {
                      window.location.href = whatsappGroup;
                    }
                  }}
                  className="rounded-xl border border-white/20 bg-white/[0.055] px-4 py-3 text-[8px] font-bold uppercase tracking-[0.16em] text-white/75 transition hover:border-white/60 hover:bg-white/[0.10] hover:text-white"
                >
                  WHATSAPP GROUP
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setRegistrationComplete(false);
                  setSelectedTournament(null);
                  setSelectedEvent(
                    selectedEvent === "SPORTOMANIA" ? "SPORTOMANIA" : "RAMPAGE 2026"
                  );
                  setFormError("");
                }}
                className="rounded-xl border border-white/20 bg-white/[0.055] px-4 py-3 text-[8px] font-bold uppercase tracking-[0.16em] text-white/75 transition hover:border-white/60 hover:bg-white/[0.10] hover:text-white"
              >
                VIEW OTHER EVENTS
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegistrationComplete(false);
                  setSelectedTournament(null);
                  setSelectedEvent(null);
                  setFormError("");
                  window.location.assign("/");
                }}
                className="rounded-xl border border-white/20 bg-white/[0.055] px-4 py-3 text-[8px] font-bold uppercase tracking-[0.16em] text-white/75 transition hover:border-white/60 hover:bg-white/[0.10] hover:text-white"
              >
                HOME SCREEN
              </button>
            </div>

            {formError && (
              <p className="mt-5 text-[8px] font-bold uppercase tracking-[0.12em] text-red-200">
                {formError}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ScrollSection;