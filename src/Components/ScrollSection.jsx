import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { ArrowRight, CalendarDays, Trophy } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

import eventImage1 from "../assets/events/event1.png";
import eventImage2 from "../assets/events/event2.png";
import eventImage3 from "../assets/events/event3.png";

const events = [
  {
    id: "01",
    image: eventImage1,
    category: "ESPORTS",
    title: "RAMPAGE 2026",
    date: "TO BE ANNOUNCED",
    location: "NIT SILCHAR",
    status: "LIVE SOON",
    description:
      "A high-intensity competitive gaming experience built for the next generation of esports players.",
    color: "magenta",
  },
  {
    id: "02",
    image: eventImage2,
    category: "TOURNAMENT",
    title: "SPORTOMANIA",
    date: "TO BE ANNOUNCED",
    location: "NIT SILCHAR",
    status: "UPCOMING",
    description:
      "Squad up, enter the arena and compete against the strongest gaming teams on campus.",
    color: "blue",
  },
  
];

const tournamentDetails = {
  "RAMPAGE 2026": [
    { title: "BGMI TOURNAMENT", game: "BGMI", image: "/events/upcoming-01.jpg" },
    { title: "FREE FIRE TOURNAMENT", game: "FREE FIRE", image: "/events/upcoming-01.jpg" },
    { title: "MLBB TOURNAMENT", game: "MLBB", image: "/events/upcoming-01.jpg" },
  ],
  SPORTOMANIA: [
    { title: "BGMI TOURNAMENT", game: "BGMI", image: "/events/upcoming-02.jpg" },
    { title: "FREE FIRE TOURNAMENT", game: "FREE FIRE", image: "/events/upcoming-02.jpg" },
    { title: "MLBB TOURNAMENT", game: "MLBB", image: "/events/upcoming-02.jpg" },
    { title: "COD TOURNAMENT", game: "COD", image: "/events/upcoming-02.jpg" },
  ],
};


const RAMPAGE_LOGO = "/events/rampage-logo.png";
const RAMPAGE_QR = "/events/rampage-qr.png";
// Replace this with the official Rampage WhatsApp group invite link.
const RAMPAGE_WHATSAPP_GROUP = "";

// Supabase
// Add these to your .env file:
// VITE_SUPABASE_URL=your_supabase_project_url
// VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase =
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

const RAMPAGE_REGISTRATION_TABLE = "rampage_registrations";
const RAMPAGE_PAYMENT_BUCKET = "rampage-payment-proofs";

// Helpful during setup. This does NOT expose the secret key.
// The browser must use only the Supabase publishable/anon key.
if (import.meta.env.DEV) {
  console.log("RAMPAGE SUPABASE CONFIG:", {
    configured: Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY),
    table: RAMPAGE_REGISTRATION_TABLE,
    paymentBucket: RAMPAGE_PAYMENT_BUCKET,
  });
}

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
  hoverBorder: "hover:border-white/55",
  text: "group-hover:text-white",
  line: "bg-white",
  glow:
    "hover:shadow-[0_0_25px_rgba(255,255,255,0.18),0_0_70px_rgba(0,0,0,0.55)]",
  dot: "bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.35)]",
  overlay: "group-hover:bg-white/[0.035]",
};

/* ==========================================================
   PAC-MAN MAZE BACKGROUND
   ========================================================== */

const WhiteCombatMaze = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    /* ========================================================
       THREE.JS SETUP
    ======================================================== */

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      -6,
      6,
      6,
      -6,
      0.1,
      100
    );

    camera.position.set(0, 10, 0.0001);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setClearColor(0x000000, 0);

    /* ========================================================
       MAZE SETTINGS
    ======================================================== */

    const SIZE = 21;

    /*
      Increased from 0.48 → 0.56.
      This makes the maze visibly larger without
      making it occupy the entire screen.
    */
    const CELL = 0.56;

    const mazeWidth = SIZE * CELL;

    const mazeGroup = new THREE.Group();

    /*
      Increased from 0.72 → 0.78.
      Still leaves comfortable breathing space around
      the maze.
    */
    mazeGroup.scale.setScalar(0.78);

    /*
      Stronger initial 3D presentation.
      Maze itself remains completely flat.
    */
    mazeGroup.rotation.x = -0.58;
    mazeGroup.rotation.z = 0.06;

    scene.add(mazeGroup);

    /* ========================================================
       MAZE GENERATOR
    ======================================================== */

    const generateMaze = (size) => {
      const grid = Array.from(
        { length: size },
        () => Array(size).fill(1)
      );

      const directions = [
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2],
      ];

      const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));

          [array[i], array[j]] = [
            array[j],
            array[i],
          ];
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

      /*
        Additional openings.
      */
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (
            grid[r][c] === 1 &&
            Math.random() < 0.045
          ) {
            grid[r][c] = 0;
          }
        }
      }

      return grid;
    };

    const maze = generateMaze(SIZE);

    const offset = (SIZE * CELL) / 2;

    /* ========================================================
       WALLS
    ======================================================== */

    const wallSegments = [];

    const addWall = (x1, z1, x2, z2) => {
      wallSegments.push(
        new THREE.Vector3(x1, 0, z1),
        new THREE.Vector3(x2, 0, z2)
      );
    };

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (maze[r][c] !== 0) continue;

        const x = c * CELL - offset;
        const z = r * CELL - offset;

        if (r === 0 || maze[r - 1][c] === 1) {
          addWall(
            x,
            z,
            x + CELL,
            z
          );
        }

        if (
          r === SIZE - 1 ||
          maze[r + 1][c] === 1
        ) {
          addWall(
            x,
            z + CELL,
            x + CELL,
            z + CELL
          );
        }

        if (c === 0 || maze[r][c - 1] === 1) {
          addWall(
            x,
            z,
            x,
            z + CELL
          );
        }

        if (
          c === SIZE - 1 ||
          maze[r][c + 1] === 1
        ) {
          addWall(
            x + CELL,
            z,
            x + CELL,
            z + CELL
          );
        }
      }
    }

    const wallGeometry =
      new THREE.BufferGeometry().setFromPoints(
        wallSegments
      );

    const wallMaterial =
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.70,
        depthWrite: false,
      });

    const walls = new THREE.LineSegments(
      wallGeometry,
      wallMaterial
    );

    mazeGroup.add(walls);

    /* ========================================================
       MAZE BORDER
    ======================================================== */

    const borderPoints = [
      [-offset, -offset],
      [offset, -offset],
      [offset, offset],
      [-offset, offset],
      [-offset, -offset],
    ].map(
      ([x, z]) =>
        new THREE.Vector3(x, 0, z)
    );

    const borderGeometry =
      new THREE.BufferGeometry().setFromPoints(
        borderPoints
      );

    const borderMaterial =
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
      });

    const border = new THREE.Line(
      borderGeometry,
      borderMaterial
    );

    mazeGroup.add(border);

    /* ========================================================
       SUBTLE MAZE GLOW
    ======================================================== */

    const glowGeometry = wallGeometry.clone();

    const glowMaterial =
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.055,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

    const glow = new THREE.LineSegments(
      glowGeometry,
      glowMaterial
    );

    glow.scale.set(
      1.008,
      1,
      1.008
    );

    mazeGroup.add(glow);

    /* ========================================================
       PAC-MAN
    ======================================================== */

    const pacmanGroup = new THREE.Group();

    mazeGroup.add(pacmanGroup);

    const shape = new THREE.Shape();

    const radius = CELL * 0.30;
    const mouth = Math.PI / 5;

    shape.moveTo(0, 0);

    shape.lineTo(
      Math.cos(mouth) * radius,
      Math.sin(mouth) * radius
    );

    for (let i = 0; i <= 30; i++) {
      const angle =
        mouth +
        ((Math.PI * 2 - mouth * 2) * i) /
          30;

      shape.lineTo(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
    }

    shape.lineTo(0, 0);

    const pacmanGeometry =
      new THREE.ShapeGeometry(shape);

    const pacmanMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      });

    const pacman = new THREE.Mesh(
      pacmanGeometry,
      pacmanMaterial
    );

    pacman.rotation.x = -Math.PI / 2;
    pacman.position.y = 0.025;

    pacmanGroup.add(pacman);

    /* ========================================================
       PELLETS
    ======================================================== */

    const pellets = [];

    const pelletGeometry =
      new THREE.CircleGeometry(
        0.035,
        8
      );

    for (let r = 1; r < SIZE - 1; r++) {
      for (let c = 1; c < SIZE - 1; c++) {
        if (
          maze[r][c] !== 0 ||
          Math.random() > 0.48
        ) {
          continue;
        }

        const pelletMaterial =
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
          });

        const pellet = new THREE.Mesh(
          pelletGeometry,
          pelletMaterial
        );

        pellet.rotation.x = -Math.PI / 2;

        pellet.position.set(
          c * CELL -
            offset +
            CELL / 2,
          0.018,
          r * CELL -
            offset +
            CELL / 2
        );

        mazeGroup.add(pellet);

        pellets.push({
          mesh: pellet,
          active: true,
          phase:
            Math.random() *
            Math.PI *
            2,
        });
      }
    }

    /* ========================================================
       CURSOR RING
    ======================================================== */

    const cursor = new THREE.Mesh(
      new THREE.RingGeometry(
        0.10,
        0.13,
        32
      ),
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

    /* ========================================================
       MOUSE
    ======================================================== */

    const target = new THREE.Vector3();

    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (event) => {
      mouseX =
        (event.clientX /
          window.innerWidth -
          0.5) *
        2;

      mouseY =
        -(
          event.clientY /
            window.innerHeight -
          0.5
        ) *
        2;

      target.set(
        mouseX * mazeWidth * 0.48,
        0.04,
        mouseY * mazeWidth * 0.40
      );
    };

    window.addEventListener(
      "mousemove",
      onMouseMove,
      {
        passive: true,
      }
    );

    /* ========================================================
       CLICK SHOCKWAVE
    ======================================================== */

    const shock = new THREE.Mesh(
      new THREE.RingGeometry(
        0.08,
        0.11,
        64
      ),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending:
          THREE.AdditiveBlending,
      })
    );

    shock.rotation.x = -Math.PI / 2;

    mazeGroup.add(shock);

    let shockLife = 0;

    const onClick = () => {
      shock.position.copy(
        pacmanGroup.position
      );

      shock.position.y = 0.08;

      shock.scale.setScalar(0.1);

      shock.material.opacity = 0.8;

      shockLife = 1;
    };

    window.addEventListener(
      "click",
      onClick
    );

    /* ========================================================
       SCROLL REACTION
    ======================================================== */

    let scrollVelocity = 0;
    let lastScroll =
      window.scrollY || 0;

    const onScroll = () => {
      const current =
        window.scrollY || 0;

      scrollVelocity =
        THREE.MathUtils.clamp(
          scrollVelocity +
            (current - lastScroll) *
              0.0015,
          -0.08,
          0.08
        );

      lastScroll = current;
    };

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      }
    );

    /* ========================================================
       RESIZE
    ======================================================== */

    const resize = () => {
      const width =
        canvas.clientWidth ||
        window.innerWidth;

      const height =
        canvas.clientHeight ||
        window.innerHeight;

      renderer.setSize(
        width,
        height,
        false
      );

      const aspect =
        width / height;

      const view = 12;

      camera.top = view / 2;
      camera.bottom = -view / 2;

      camera.right =
        (view * aspect) / 2;

      camera.left =
        -(view * aspect) / 2;

      camera.updateProjectionMatrix();
    };

    window.addEventListener(
      "resize",
      resize
    );

    resize();

    /* ========================================================
       ANIMATION
    ======================================================== */

    const clock = new THREE.Clock();

    let animationFrame;

    const animate = () => {
      animationFrame =
        requestAnimationFrame(
          animate
        );

      const time =
        clock.getElapsedTime();

      /* --------------------------------
         CURSOR
      -------------------------------- */

      cursor.position.x = target.x;
      cursor.position.z = target.z;

      cursor.rotation.z =
        time * 0.6;

      cursor.scale.setScalar(
        1 +
          Math.sin(time * 3) *
            0.08
      );

      /* --------------------------------
         PAC-MAN FOLLOW
      -------------------------------- */

      pacmanGroup.position.lerp(
        target,
        0.045
      );

      const dx =
        target.x -
        pacmanGroup.position.x;

      const dz =
        target.z -
        pacmanGroup.position.z;

      if (
        Math.abs(dx) +
          Math.abs(dz) >
        0.02
      ) {
        pacman.rotation.z =
          Math.atan2(dx, dz);
      }

      /* --------------------------------
         MOUTH ANIMATION
      -------------------------------- */

      pacman.scale.y =
        0.82 +
        Math.sin(time * 9) *
          0.16;

      /* --------------------------------
         PELLETS
      -------------------------------- */

      pellets.forEach(
        (pellet) => {
          if (!pellet.active)
            return;

          const pulse =
            Math.sin(
              time * 3 +
                pellet.phase
            ) *
              0.5 +
            0.5;

          pellet.mesh.material.opacity =
            0.35 +
            pulse * 0.3;

          pellet.mesh.scale.setScalar(
            0.85 +
              pulse * 0.25
          );

          const distance =
            Math.hypot(
              pellet.mesh.position.x -
                pacmanGroup.position.x,
              pellet.mesh.position.z -
                pacmanGroup.position.z
            );

          if (distance < 0.28) {
            pellet.active = false;

            pellet.mesh.scale.setScalar(
              0.01
            );
          }
        }
      );

      /* ======================================================
         STRONGER 3D MAZE MOVEMENT

         Maze remains FLAT 2D.
         Only the complete board tilts in 3D.
      ====================================================== */

      const targetRotationX =
        -0.58 +
        mouseY * 0.26;

      const targetRotationZ =
        0.06 -
        mouseX * 0.20;

      mazeGroup.rotation.x +=
        (
          targetRotationX -
          mazeGroup.rotation.x
        ) * 0.055;

      mazeGroup.rotation.z +=
        (
          targetRotationZ -
          mazeGroup.rotation.z
        ) * 0.055;

      /* --------------------------------
         SUBTLE POSITIONAL PARALLAX
      -------------------------------- */

      const targetPosX =
        mouseX * 0.16;

      const targetPosZ =
        mouseY * 0.12;

      mazeGroup.position.x +=
        (
          targetPosX -
          mazeGroup.position.x
        ) * 0.035;

      mazeGroup.position.z +=
        (
          targetPosZ -
          mazeGroup.position.z
        ) * 0.035;

      /* --------------------------------
         SCROLL MOVEMENT
      -------------------------------- */

      scrollVelocity *= 0.90;

      mazeGroup.position.y +=
        scrollVelocity * 0.8;

      mazeGroup.position.y *=
        0.94;

      /* --------------------------------
         CLICK SHOCKWAVE
      -------------------------------- */

      if (shockLife > 0) {
        shockLife -= 0.045;

        const progress =
          1 - shockLife;

        shock.scale.setScalar(
          0.2 +
            progress * 2.6
        );

        shock.material.opacity =
          shockLife * 0.75;
      }

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    /* ========================================================
       CLEANUP
    ======================================================== */

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "mousemove",
        onMouseMove
      );

      window.removeEventListener(
        "click",
        onClick
      );

      window.removeEventListener(
        "scroll",
        onScroll
      );

      window.removeEventListener(
        "resize",
        resize
      );

      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (
            Array.isArray(
              object.material
            )
          ) {
            object.material.forEach(
              (material) =>
                material.dispose()
            );
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, []);

  return (
    <div className="white-pacman-maze">
      <canvas
        ref={canvasRef}
        className="white-pacman-maze-canvas"
      />

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
          opacity: 0.82;
          mix-blend-mode: screen;
        }

        .maze-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              ellipse at center,
              transparent 30%,
              rgba(0,0,0,0.20) 62%,
              rgba(0,0,0,0.78) 100%
            );
        }

        @media (max-width: 768px) {
          .white-pacman-maze-canvas {
            opacity: 0.55;
          }
        }
      `}</style>
    </div>
  );
};

/* ==========================================================
   SCROLL SECTION
   ========================================================== */

const ScrollSection = () => {
  const [activeCard, setActiveCard] =
    useState(null);

  // RAMPAGE registration flow — same process/form/table/bucket as File 1.
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [rampageForm, setRampageForm] = useState(initialRampageForm);
  const [paymentProof, setPaymentProof] = useState(null);
  const [formError, setFormError] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [qrLoadFailed, setQrLoadFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cardsVisible, setCardsVisible] =
    useState(false);

  const sectionRef =
    useRef(null);

  useEffect(() => {
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
      powerPreference: "high-performance",
    });

    const getPixelRatio = () =>
      Math.min(window.devicePixelRatio || 1, 1.25);

    renderer.setPixelRatio(getPixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMappingExposure = 1.15;

    // ---------------------------------------------------------
    // PARTICLE TUNNEL — EXACT HERO STAR PROPERTIES
    // ---------------------------------------------------------

    const particleCount = 1400;
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
    const particlePositionAttribute = particleGeometry.attributes.position;

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.085,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );

    scene.add(particles);

    // ---------------------------------------------------------
    // MOUSE PARALLAX — SAME AS HERO
    // ---------------------------------------------------------

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
        scrollTarget + delta * 0.02,
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

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    handleResize();

    const clock = new THREE.Clock();
    let animationFrame;
    let time = 0;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.033);
      time += dt;

      const damping = (speed) => 1 - Math.exp(-speed * dt);

      smoothX += (mouseX - smoothX) * damping(9);
      smoothY += (mouseY - smoothY) * damping(9);

      scrollCurrent +=
        (scrollTarget - scrollCurrent) * damping(5.5);

      const cameraZ = 9 - scrollCurrent * 1.35;
      camera.position.z +=
        (cameraZ - camera.position.z) * damping(6);

      for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        let z = positions[index + 2] + particleSpeeds[i];

        if (z > 3) z = -10;

        positions[index + 2] = z;
      }

      particles.rotation.z = time * 0.025;
      particlePositionAttribute.needsUpdate = true;

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

      particleGeometry.dispose();
      particles.material.dispose();
      renderer.dispose();

      if (canvas.parentNode === document.body) {
        document.body.removeChild(canvas);
      }
    };
  }, []);


  useEffect(() => {
    const section =
      sectionRef.current;

    if (!section) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCardsVisible(false);

            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setCardsVisible(true);
              });
            });
          } else {
            setCardsVisible(false);
          }
        },
        {
          threshold: 0.18,
        }
      );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const game = selectedTournament?.game;
    const mainPlayerCount = game === "MLBB" ? 5 : 4;

    // Main player Scholar IDs must be exactly 7 digits.
    for (let i = 1; i <= mainPlayerCount; i += 1) {
      const scholarId = rampageForm[`scholarId${i}`] || "";
      if (!/^\d{7}$/.test(scholarId)) {
        setFormError(`PLAYER ${i} SCHOLAR ID must contain exactly 7 digits.`);
        return;
      }
    }

    // Phone 1 is required and Phone 2 is optional.
    if (!/^\d{10}$/.test(rampageForm.phone1)) {
      setFormError("Phone Number 1 must contain exactly 10 digits.");
      return;
    }

    if (rampageForm.phone2 && !/^\d{10}$/.test(rampageForm.phone2)) {
      setFormError("Phone Number 2 must contain exactly 10 digits if provided.");
      return;
    }

    // Substitute section is completely optional.
    // Empty, partial, or fully filled substitute details are allowed.
    const hasSubstitute = Boolean(
      rampageForm.substituteName.trim() ||
        rampageForm.substituteIgn.trim() ||
        rampageForm.substituteScholarId.trim()
    );

    if (!paymentProof) {
      setFormError(
        "Payment proof is required. Registration cannot be completed without uploading the ₹40 payment screenshot."
      );
      return;
    }

    if (!supabase) {
      setFormError(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env.local file."
      );
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    let uploadedProofPath = "";

    try {
      const safeFileName = paymentProof.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "-");

      const proofPath = `rampage-2026/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(RAMPAGE_PAYMENT_BUCKET)
        .upload(proofPath, paymentProof, {
          cacheControl: "3600",
          upsert: false,
          contentType: paymentProof.type || "application/octet-stream",
        });

      if (uploadError) {
        console.error("RAMPAGE SUPABASE STORAGE ERROR:", uploadError);
        throw new Error(
          `Payment proof upload failed: ${uploadError.message}. ` +
          `Check that the "${RAMPAGE_PAYMENT_BUCKET}" bucket exists and has an INSERT policy for anon users.`
        );
      }

      uploadedProofPath = proofPath;

      // IMPORTANT:
      // The Supabase table uses separate columns for every player.
      // Send every field directly so the submitted form appears
      // as normal columns in Supabase Table Editor.
      const { error: insertError } = await supabase
        .from(RAMPAGE_REGISTRATION_TABLE)
        .insert({
          // This column is NOT NULL in the Supabase table created
          // by the setup SQL.
          event_name: "RAMPAGE 2026",

          tournament: selectedTournament?.title || "",
          game: game || "",

          team_name: rampageForm.teamName.trim(),

          // Player 1 / IGL
          igl_name: rampageForm.iglName.trim(),
          igl_ign: rampageForm.iglIgn.trim(),
          scholar_id_1: rampageForm.scholarId1,

          // Player 2
          player2_name: rampageForm.player2Name.trim(),
          player2_ign: rampageForm.player2Ign.trim(),
          scholar_id_2: rampageForm.scholarId2,

          // Player 3
          player3_name: rampageForm.player3Name.trim(),
          player3_ign: rampageForm.player3Ign.trim(),
          scholar_id_3: rampageForm.scholarId3,

          // Player 4
          player4_name: rampageForm.player4Name.trim(),
          player4_ign: rampageForm.player4Ign.trim(),
          scholar_id_4: rampageForm.scholarId4,

          // Player 5 is required only for MLBB.
          player5_name:
            game === "MLBB" ? rampageForm.player5Name.trim() : null,
          player5_ign:
            game === "MLBB" ? rampageForm.player5Ign.trim() : null,
          scholar_id_5:
            game === "MLBB" ? rampageForm.scholarId5 : null,

          // Optional substitute
          substitute_name: hasSubstitute
            ? rampageForm.substituteName.trim()
            : null,
          substitute_ign: hasSubstitute
            ? rampageForm.substituteIgn.trim()
            : null,
          substitute_scholar_id: hasSubstitute
            ? rampageForm.substituteScholarId
            : null,

          // Contact
          phone1: rampageForm.phone1,
          phone2: rampageForm.phone2 || null,

          // Payment proof file path in Supabase Storage
          payment_proof_path: uploadedProofPath,
        });

      if (insertError) {
        console.error("RAMPAGE SUPABASE INSERT ERROR:", insertError);
        throw new Error(
          `Registration save failed: ${insertError.message}${
            insertError.code ? ` [${insertError.code}]` : ""
          }`
        );
      }

      setRegistrationComplete(true);
    } catch (error) {
      // If the database insert fails after the proof was uploaded,
      // remove the orphaned file from Supabase Storage.
      if (uploadedProofPath) {
        await supabase.storage
          .from(RAMPAGE_PAYMENT_BUCKET)
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

        .live-events-section,
        .live-events-section *,
        .live-events-section button,
        .live-events-section h3,
        .live-events-section p,
        .live-events-section span {
          font-family: "The Last Shuriken", sans-serif;
        }

        .live-events-neon-svg {
          display: block;
          width: min(92vw, 760px);
          height: auto;
          overflow: visible;
          pointer-events: none;
        }

        .live-events-base {
          font-family: "The Last Shuriken", sans-serif;
          fill: url(#eventsTitleFill);
          stroke: none;
          paint-order: normal;
          filter: url(#eventsTitleShadow);
        }

        .live-events-line {
          font-family: "The Last Shuriken", sans-serif;
          fill: url(#eventsTitleInner);
          stroke: none;
          paint-order: normal;
          opacity: 0.34;
          pointer-events: none;
        }

        .live-events-shine {
          font-family: "The Last Shuriken", sans-serif;
          fill: url(#eventsTitleShine);
          stroke: none;
          paint-order: normal;
          opacity: 0.88;
          mix-blend-mode: screen;
          filter:
            drop-shadow(0 0 4px rgba(255,255,255,.20))
            drop-shadow(0 0 11px rgba(255,255,255,.08));
          pointer-events: none;
        }

        @keyframes synchronizedTicker {
          0% {
            transform: translate3d(-100%, 0, 0);
          }

          100% {
            transform: translate3d(100vw, 0, 0);
          }
        }

        .event-ticker,
        .sponsor-ticker {
          width: max-content;
          flex: 0 0 auto;

          animation:
            synchronizedTicker
            18s
            linear
            infinite;

          will-change: transform;
        }

        .sponsor-logo {
          height: 20px;
          max-width: 75px;
          width: auto;
          object-fit: contain;

          opacity: .78;

          filter:
            grayscale(1)
            contrast(1.1)
            brightness(.92)
            drop-shadow(
              0 2px 4px
              rgba(0,0,0,.55)
            );

          transition:
            opacity 300ms ease,
            transform 300ms ease,
            filter 300ms ease;
        }

        .sponsor-logo:hover {
          opacity: 1;

          transform:
            scale(1.05);

          filter:
            grayscale(1)
            contrast(1.15)
            drop-shadow(
              0 3px 7px
              rgba(255,255,255,.14)
            );
        }

        .ticker-switch {
          transition:
            opacity 450ms ease,
            transform 450ms ease;
        }

        .ticker-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .ticker-hidden {
          opacity: 0;
          transform: translateY(5px);
        }

        @media (max-width: 768px) {
          .event-ticker,
          .sponsor-ticker {
            animation-duration: 18s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .event-ticker,
          .sponsor-ticker {
            animation: none !important;
          }

          .live-events-line {
            animation: none !important;
          }
        }


        /* FILE 1 — EXACT DARK SAMURAI THEME */

        .merch-starfield-canvas {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
        }

        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

        .events-root,
        .events-root * {
          font-family: 'The Last Shuriken', sans-serif;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #030305;
        }

        ::selection {
          background: rgba(255,255,255,.18);
          color: #fff;
        }

        .events-title-center {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
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

        .events-title-text {
          font-size: 60px;
        }

        @media (min-width: 640px) {
          .events-title-text {
            font-size: 72px;
          }
        }

        @media (min-width: 768px) {
          .events-title-text {
            font-size: 84px;
          }
        }

        @media (min-width: 1024px) {
          .events-title-text {
            font-size: 92px;
          }
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

        .events-divider {
          position: relative;
          height: 18px;
          gap: 0;
        }

        .events-divider-line {
          height: 1px;
          flex: 1 1 auto;
          background: rgba(255,255,255,.32);
          box-shadow: 0 0 5px rgba(255,255,255,.05);
        }

        .events-divider-left {
          margin-right: 14px;
          background:
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,255,255,.28) 8%,
              rgba(255,255,255,.36) 100%
            );
        }

        .events-divider-right {
          margin-left: 14px;
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,.36) 0%,
              rgba(255,255,255,.28) 92%,
              transparent 100%
            );
        }

        .events-divider-diamond {
          position: relative;
          width: 10px;
          height: 10px;
          flex: 0 0 10px;
          transform: rotate(45deg);
          border: 1px solid rgba(255,255,255,.58);
          background: rgba(3,3,5,.94);
          box-shadow:
            0 0 7px rgba(255,255,255,.08),
            inset 0 0 5px rgba(255,255,255,.04);
        }

        .events-divider-diamond::after {
          content: "";
          position: absolute;
          inset: 2px;
          border: 1px solid rgba(255,255,255,.12);
        }

        .events-section-icon {
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 12px;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.07),
              rgba(3,3,5,.76)
            );
          color: rgba(255,255,255,.68);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.08),
            0 10px 30px rgba(0,0,0,.40);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transition: all .3s ease;
        }

        .events-section-icon::before {
          content: "";
          position: absolute;
          inset: 5px;
          border: 1px solid rgba(255,255,255,.045);
          border-radius: 8px;
          pointer-events: none;
        }

        .events-section-icon:hover {
          border-color: rgba(255,255,255,.35);
          color: rgba(255,255,255,.90);
          background: rgba(255,255,255,.07);
          box-shadow:
            0 0 25px rgba(255,255,255,.08),
            inset 0 1px 0 rgba(255,255,255,.12);
        }

        .events-section-heading,
        .events-card-title {
          font-family: 'The Last Shuriken', sans-serif !important;
          font-weight: 700;
          letter-spacing: .025em;
          text-shadow:
            0 3px 0 rgba(0,0,0,.82),
            0 6px 16px rgba(0,0,0,.88),
            0 0 10px rgba(255,255,255,.06);
        }

        .events-section-heading {
          position: relative;
        }

        .events-section-heading::after {
          content: "";
          display: block;
          width: 52px;
          height: 1px;
          margin-top: 9px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.18),
              rgba(255,255,255,.72),
              rgba(255,255,255,.18),
              transparent
            );
          box-shadow: 0 0 10px rgba(255,255,255,.10);
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

        .events-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(255,255,255,.065),
              transparent 36%
            );
          opacity: .9;
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

        .events-card-top-edge {
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.20),
              rgba(255,255,255,.62),
              rgba(255,255,255,.20),
              transparent
            );
          opacity: .70;
        }

        .events-hover-line {
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.22),
              rgba(255,255,255,.78),
              rgba(255,255,255,.22),
              transparent
            );
          box-shadow: 0 0 12px rgba(255,255,255,.12);
        }

        .events-tag {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(255,255,255,.11);
          border-radius: 999px;
          background: rgba(255,255,255,.035);
          padding: 6px 12px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .16em;
          color: rgba(255,255,255,.46);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .events-tag-primary {
          border-color: rgba(255,255,255,.20);
          background: rgba(255,255,255,.055);
          color: rgba(255,255,255,.72);
        }

        .scroll-reveal {
          opacity: 0;
          transform: translateY(75px) scale(.97);
          filter: blur(6px);
          transition:
            opacity .8s ease,
            transform .8s cubic-bezier(.16,1,.3,1),
            filter .8s ease;
        }

        .scroll-reveal.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }

        @media (max-width: 640px) {
          .events-title-svg {
            width: min(94vw, 720px);
          }

          .events-divider {
            max-width: 88vw;
          }

          .events-divider-left {
            margin-right: 11px;
          }

          .events-divider-right {
            margin-left: 11px;
          }

          .events-divider-diamond {
            width: 9px;
            height: 9px;
            flex-basis: 9px;
          }

          .events-card {
            border-radius: 22px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-reveal {
            opacity: 1;
            transform: none;
            filter: none;
            transition: none;
            animation: none;
          }

          html {
            scroll-behavior: auto;
          }
        }
            `}</style>

      {/* PAC-MAN MAZE BACKGROUND — RESTORED */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <WhiteCombatMaze />
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

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div
        className="
          live-events-section
          relative
          z-10
          mx-auto
          max-w-7xl
        "
      >
        {/* ==================================================
            SECTION HEADER
        ================================================== */}

        <div
          className="
            mb-14
            grid
            grid-cols-1
            gap-8
            lg:grid-cols-[1fr_300px]
            lg:items-end
          "
        >
          {/* HEADING */}

          <div
            className="
              lg:absolute
              lg:left-1/2
              lg:-translate-x-1/2
              lg:translate-y-6
              lg:w-max
            "
          >
            <div
              className={`
                relative
                flex
                justify-center
                overflow-visible
                transform
                transition-all
                duration-1000
                ease-[cubic-bezier(0.16,1,0.3,1)]
                ${
                  cardsVisible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-[100px] scale-[0.88] opacity-0"
                }
              `}
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
                  <linearGradient
                    id="eventsTitleFill"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#ffffff"
                    />
                    <stop
                      offset="14%"
                      stopColor="#f1f1f1"
                    />
                    <stop
                      offset="30%"
                      stopColor="#dcdcdc"
                    />
                    <stop
                      offset="46%"
                      stopColor="#686868"
                    />
                    <stop
                      offset="60%"
                      stopColor="#303030"
                    />
                    <stop
                      offset="72%"
                      stopColor="#8a8a8a"
                    />
                    <stop
                      offset="86%"
                      stopColor="#d9d9d9"
                    />
                    <stop
                      offset="100%"
                      stopColor="#ffffff"
                    />
                  </linearGradient>

                  <linearGradient
                    id="eventsTitleInner"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#ffffff"
                    />
                    <stop
                      offset="38%"
                      stopColor="#dddddd"
                    />
                    <stop
                      offset="58%"
                      stopColor="#666666"
                    />
                    <stop
                      offset="78%"
                      stopColor="#bdbdbd"
                    />
                    <stop
                      offset="100%"
                      stopColor="#ffffff"
                    />
                  </linearGradient>

                  <linearGradient
                    id="eventsTitleShine"
                    gradientUnits="userSpaceOnUse"
                    x1="-260"
                    y1="0"
                    x2="-80"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    />

                    <stop
                      offset="38%"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    />

                    <stop
                      offset="50%"
                      stopColor="#ffffff"
                      stopOpacity="0.92"
                    />

                    <stop
                      offset="62%"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    />

                    <stop
                      offset="100%"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    />

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
                    id="liveEventsShadow"
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

                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="1"
                      floodColor="#ffffff"
                      floodOpacity=".10"
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

          {/* DESCRIPTION */}

          <p
            className="
              max-w-sm
              text-[9px]
              font-medium
              uppercase
              leading-6
              tracking-[0.22em]
              text-white/65
              lg:pb-1
            "
          >
            Upcoming battles, completed tournaments and the moments
            <br />
            that define our esports arena.
          </p>
        </div>

        {/* ==================================================
            EVENT GRID
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            place-items-center
            gap-8
            sm:grid-cols-2
            lg:grid-cols-2
            lg:gap-14
          "
        >
          {events.map((event, index) => {
            const style = monochrome;

            return (
              <article
                key={event.id}
                onMouseEnter={() =>
                  setActiveCard(index)
                }
                onMouseLeave={() =>
                  setActiveCard(null)
                }
                className={`
                  events-card
                  group
                  relative
                  mx-auto
                  h-[240px]
                  w-full
                  max-w-[330px]
                  cursor-pointer
                  overflow-hidden
                  rounded-2xl
                  border
                  ${style.border}
                  ${style.hoverBorder}
                  bg-white/[0.07]
                  transform
                  transition-all
                  duration-700
                  ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${
                    cardsVisible
                      ? "translate-y-0 scale-100 rotate-0 opacity-100"
                      : "translate-y-[220px] scale-[0.75] rotate-[2deg] opacity-0"
                  }
                  hover:-translate-y-2
                  hover:scale-[1.02]
                  ${style.glow}
                `}
              >
                {/* IMAGE */}

                <img
                  src={event.image}
                  alt={event.title}
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-cover
                    opacity-85
                    brightness-[1.08]
                    saturate-[1.12]
                    transition-all
                    duration-700
                    group-hover:scale-110
                    group-hover:opacity-90
                  "
                />

                {/* IMAGE DARKEN */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/90
                    via-black/25
                    to-black/5
                  "
                />

                {/* GLASS LAYER */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-white/[0.025]
                  "
                />

                {/* NEON OVERLAY */}

                <div
                  className={`
                    absolute
                    inset-0
                    opacity-0
                    transition-all
                    duration-500
                    ${style.overlay}
                  `}
                />

                {/* TOP INFO */}

                <div
                  className="
                    absolute
                    left-5
                    right-5
                    top-5
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <span
                      className={`
                        h-1.5
                        w-1.5
                        rounded-full
                        ${style.dot}
                      `}
                    />

                    <span
                      className="
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.25em]
                        text-white/70
                      "
                    >
                      {event.category}
                    </span>
                  </div>

                  <span
                    className="
                      text-[9px]
                      font-bold
                      tracking-[0.15em]
                      text-white/30
                    "
                  >
                    {event.id}
                  </span>
                </div>

                {/* STATUS */}

                <div
                  className="
                    absolute
                    right-5
                    top-14
                    hidden
                    items-center
                    gap-2
                    sm:flex
                  "
                >
                  <span
                    className={`
                      h-1
                      w-1
                      rounded-full
                      ${style.dot}
                    `}
                  />

                  <span
                    className="
                      text-[7px]
                      uppercase
                      tracking-[0.2em]
                      text-white/40
                    "
                  >
                    {event.status}
                  </span>
                </div>

                {/* CARD CONTENT */}

                <div
                  className="
                    absolute
                    bottom-0
                    left-0
                    right-0
                    p-5
                  "
                >
                  <h3
                    className={`
                      events-card-title
                      text-lg
                      font-bold
                      uppercase
                      tracking-[-0.02em]
                      text-white
                      transition-colors
                      duration-300
                      ${style.text}
                    `}
                  >
                    {event.title}
                  </h3>

                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      items-center
                      gap-x-4
                      gap-y-2
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <CalendarDays
                        size={11}
                        className="text-white/40"
                      />

                      <span
                        className="
                          text-[7px]
                          font-medium
                          uppercase
                          tracking-[0.15em]
                          text-white/45
                        "
                      >
                        {event.date}
                      </span>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <Trophy
                        size={11}
                        className="text-white/40"
                      />

                      <span
                        className="
                          text-[7px]
                          font-medium
                          uppercase
                          tracking-[0.15em]
                          text-white/45
                        "
                      >
                        {event.location}
                      </span>
                    </div>
                  </div>

                  <p
                    className="
                      mt-3
                      max-w-[300px]
                      text-[9px]
                      leading-4
                      tracking-[0.04em]
                      text-white/35
                    "
                  >
                    {event.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      if (event.title === "RAMPAGE 2026") {
                        setFormError("");
                        setPaymentProof(null);
                        setQrLoadFailed(false);
                        setRampageForm(initialRampageForm);
                        setSelectedTournament(null);
                        setRegistrationComplete(false);
                        // This is the same entry point File 1 uses after VIEW MORE.
                        setSelectedEvent("RAMPAGE 2026");
                      }
                    }}
                    className="
                      mt-4
                      inline-flex
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-white/25
                      bg-white/[0.06]
                      px-4
                      py-2
                      text-[7px]
                      font-bold
                      uppercase
                      tracking-[0.22em]
                      text-white/70
                      backdrop-blur-md
                      transition-all
                      duration-300
                      hover:border-white
                      hover:bg-white/[0.12]
                      hover:text-white
                    "
                  >
                    REGISTER NOW
                    <ArrowRight
                      size={11}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </div>

                {/* BOTTOM LINE */}

                <div
                  className={`
                    absolute
                    bottom-0
                    left-0
                    h-[2px]
                    ${style.line}
                    transition-all
                    duration-700
                    ${
                      activeCard === index
                        ? "w-full"
                        : "w-0"
                    }
                  `}
                />

                {/* CORNER */}

                <div
                  className="
                    absolute
                    right-0
                    top-0
                    h-7
                    w-7
                    border-r
                    border-t
                    border-white/30
                    opacity-0
                    transition-all
                    duration-300
                    group-hover:opacity-100
                  "
                />
              </article>
            );
          })}
        </div>

        {/* ==================================================
            VIEW ALL EVENTS
        ================================================== */}

        <div
          className="
            mt-12
            flex
            justify-center
          "
        >
          
          <button   
            className="
            
              group
              relative
              flex
              items-center
              gap-4
              overflow-hidden
              rounded-xl
              border
              border-white/20
              bg-white/[0.06]
              px-8
              py-3.5
              text-[8px]
              font-bold
              uppercase
              tracking-[0.3em]
              text-white/60
              backdrop-blur-xl
              transition-all
              duration-300
              hover:border-white
              hover:bg-white/[0.10]
              hover:text-white
              hover:shadow-[0_0_25px_rgba(255,255,255,0.16),0_0_45px_rgba(255,255,255,0.08)]
            "
            
          >
          
            <span className="relative z-10">
              VIEW ALL EVENTS
            </span>

            <ArrowRight
              size={14}
              className="
                relative
                z-10
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </button>
        </div>
      </div>

      {/* TOURNAMENT LIST MODAL */}
      {selectedEvent && (
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
                  ? "Choose your battle and register now"
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
                          className="h-full w-full object-cover opacity-55 grayscale contrast-[1.12] saturate-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-75"
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
                          PROBABLE DATE: TO BE ANNOUNCED
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
                              setSelectedTournament(tournament);
                            }
                          }}
                          className={`mt-5 flex w-full items-center justify-center rounded-xl border px-4 py-3 text-[9px] font-bold uppercase tracking-[0.22em] transition-all duration-300 ${
                            isRegistrationOpen
                              ? "border-white/20 bg-white/[0.055] text-white/75 hover:border-white/60 hover:bg-white/[0.10] hover:text-white"
                              : "cursor-not-allowed border-white/10 bg-white/[0.02] text-white/30"
                          }`}
                        >
                          {isRegistrationOpen ? "REGISTER NOW" : "REGISTRATION SOON"}
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
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 px-4 py-6 backdrop-blur-md sm:px-6"
          onClick={() => setSelectedTournament(null)}
        >
          <div
            className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/15 bg-[#050507]/98 p-5 shadow-[0_25px_120px_rgba(0,0,0,.9)] sm:p-8"
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
                RAMPAGE 2026 • TEAM REGISTRATION
              </p>
              <h2 className="events-section-heading mt-2 text-2xl font-bold uppercase text-white sm:text-3xl">
                {selectedTournament.title}
              </h2>
              <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-white/40">
                Registration Fee: ₹40 Per Team
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-7">
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
                    value={rampageForm.teamName}
                    onChange={(e) =>
                      setRampageForm({ ...rampageForm, teamName: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                    placeholder="Enter official squad / team name"
                  />
                </label>
              </div>

              {/* TEAM PLAYERS (NAMES) */}
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
                      value={rampageForm.iglName}
                      onChange={(e) =>
                        setRampageForm({ ...rampageForm, iglName: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                      placeholder="Enter In-Game Leader (IGL) full name"
                    />
                  </label>

                  {[
                    ["PLAYER 2 NAME", "player2Name"],
                    ["PLAYER 3 NAME", "player3Name"],
                    ["PLAYER 4 NAME", "player4Name"],
                    ...(selectedTournament.game === "MLBB"
                      ? [["PLAYER 5 NAME", "player5Name"]]
                      : []),
                  ].map(([label, key]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                        {label} *
                      </span>
                      <input
                        name={key}
                        required
                        value={rampageForm[key]}
                        onChange={(e) =>
                          setRampageForm({ ...rampageForm, [key]: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* TEAM PLAYERS (IN-GAME NAMES) */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">
                    PLAYER IN-GAME NAME (IGN) — {selectedTournament.game === "MLBB" ? "PLAYERS 1–5" : "PLAYERS 1–4"}
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
                      value={rampageForm.iglIgn}
                      onChange={(e) =>
                        setRampageForm({ ...rampageForm, iglIgn: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                      placeholder="Enter In-Game Leader (IGL) in-game handle"
                    />
                  </label>

                  {[
                    ["PLAYER 2 IN-GAME NAME (IGN)", "player2Ign"],
                    ["PLAYER 3 IN-GAME NAME (IGN)", "player3Ign"],
                    ["PLAYER 4 IN-GAME NAME (IGN)", "player4Ign"],
                    ...(selectedTournament.game === "MLBB"
                      ? [["PLAYER 5 IN-GAME NAME (IGN)", "player5Ign"]]
                      : []),
                  ].map(([label, key]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                        {label} *
                      </span>
                      <input
                        name={key}
                        required
                        value={rampageForm[key]}
                        onChange={(e) =>
                          setRampageForm({ ...rampageForm, [key]: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* SUBSTITUTE PLAYER + CONTACT */}
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
                      value={rampageForm.substituteName}
                      onChange={(e) =>
                        setRampageForm({
                          ...rampageForm,
                          substituteName: e.target.value,
                        })
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
                      value={rampageForm.substituteIgn}
                      onChange={(e) =>
                        setRampageForm({
                          ...rampageForm,
                          substituteIgn: e.target.value,
                        })
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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{7}"
                      maxLength={7}
                      value={rampageForm.substituteScholarId}
                      onChange={(e) =>
                        setRampageForm({
                          ...rampageForm,
                          substituteScholarId: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 7),
                        })
                      }
                      className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                      placeholder="7 digit Scholar ID"
                    />
                  </label>
                </div>

                <p className="mt-3 text-[8px] uppercase tracking-[0.14em] text-white/30">
                  Leave all three fields empty if you are not registering a substitute.
                </p>
              </div>

              {/* CONTACT */}
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
                        pattern={required ? "[0-9]{10}" : "[0-9]{10}"}
                        maxLength={10}
                        value={rampageForm[key]}
                        onChange={(e) =>
                          setRampageForm({
                            ...rampageForm,
                            [key]: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          })
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
                  {(selectedTournament.game === "MLBB"
                    ? [1, 2, 3, 4, 5]
                    : [1, 2, 3, 4]
                  ).map((number) => {
                    const key = `scholarId${number}`;
                    const isIgl = number === 1;

                    return (
                      <label key={key} className="block">
                        <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.20em] text-white/45">
                          {isIgl
                            ? "PLAYER 1 — IN-GAME LEADER (IGL) SCHOLAR ID *"
                            : `PLAYER ${number} SCHOLAR ID *`}
                        </span>
                        <input
                          name={key}
                          required
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]{7}"
                          maxLength={7}
                          value={rampageForm[key]}
                          onChange={(e) =>
                            setRampageForm({
                              ...rampageForm,
                              [key]: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 7),
                            })
                          }
                          className="w-full rounded-xl border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/50"
                          placeholder="7 digit Scholar ID"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* QR + PAYMENT */}
              <div className="rounded-2xl border border-white/15 bg-white/[0.035] p-5 sm:p-6">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/45">
                      PAYMENT
                    </p>
                    <h3 className="mt-2 text-lg font-bold uppercase text-white">
                      PAY ₹40 PER TEAM
                    </h3>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/35">
                      Scan the QR below and complete the payment before uploading proof.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/[0.045] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white/55">
                    ₹40 / TEAM
                  </span>
                </div>

                <div className="mb-5 flex justify-center">
                  <div className="rounded-2xl border border-white/15 bg-white p-3 shadow-[0_0_35px_rgba(255,255,255,.08)]">
                    {!qrLoadFailed ? (
                      <img
                        src={RAMPAGE_QR}
                        alt="RAMPAGE 2026 payment QR code"
                        className="h-52 w-52 object-contain sm:h-60 sm:w-60"
                        onError={() => setQrLoadFailed(true)}
                      />
                    ) : (
                      <div className="flex h-52 w-52 items-center justify-center p-5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[#111] sm:h-60 sm:w-60">
                        ADD RAMPAGE QR AT /events/rampage-qr.png
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

      {/* REGISTRATION COMPLETE MODAL */}
      {registrationComplete && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/85 px-5 py-8 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-[#050507]/98 p-7 text-center shadow-[0_25px_120px_rgba(0,0,0,.9)] sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/[0.06] text-2xl text-white">
              ✓
            </div>
            <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.30em] text-white/35">
              RAMPAGE 2026
            </p>
            <h2 className="events-section-heading mt-2 text-2xl font-bold uppercase text-white sm:text-3xl">
              REGISTRATION COMPLETED
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[10px] leading-6 uppercase tracking-[0.12em] text-white/45">
              Registration submitted successfully for squad{" "}
              <span className="font-bold text-white">"{rampageForm.teamName}"</span> in{" "}
              {selectedTournament?.title || "TOURNAMENT"}. Join the official WhatsApp group for bracket and fixture updates.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  if (RAMPAGE_WHATSAPP_GROUP) {
                    window.open(
                      RAMPAGE_WHATSAPP_GROUP,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  } else {
                    setFormError(
                      "Add the official Rampage WhatsApp group invite link in RAMPAGE_WHATSAPP_GROUP."
                    );
                  }
                }}
                className="rounded-xl border border-white/20 bg-white/[0.055] px-4 py-3 text-[8px] font-bold uppercase tracking-[0.16em] text-white/75 transition hover:border-white/60 hover:bg-white/[0.10] hover:text-white"
              >
                WHATSAPP GROUP
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegistrationComplete(false);
                  setSelectedTournament(null);
                  setSelectedEvent("RAMPAGE 2026");
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
                  window.scrollTo({ top: 0, behavior: "smooth" });
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

      {/* =========================================================
          STYLES — DARK SAMURAI SYSTEM
      ========================================================= */}


      {/* ==================================================
          SECTION PAGE DIVIDER — REMOVED
      ================================================== */}
    </section>
  );
};

export default ScrollSection;