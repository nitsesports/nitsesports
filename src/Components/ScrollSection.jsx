import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { ArrowRight, CalendarDays, Trophy } from "lucide-react";

import eventImage1 from "../assets/events/event1.png";
import eventImage2 from "../assets/events/event2.png";
import eventImage3 from "../assets/events/event3.png";

const events = [
  {
    id: "01",
    image: eventImage1,
    category: "ESPORTS",
    title: "NITS CYBER CLASH",
    date: "04 JUNE 2026",
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
    title: "NEON RIFT CUP",
    date: "12 JUNE 2026",
    location: "NIT SILCHAR",
    status: "UPCOMING",
    description:
      "Squad up, enter the arena and compete against the strongest gaming teams on campus.",
    color: "blue",
  },
  {
    id: "03",
    image: eventImage3,
    category: "CHAMPIONSHIP",
    title: "NITS GAMING LEAGUE",
    date: "21 JUNE 2026",
    location: "NIT SILCHAR",
    status: "REGISTER NOW",
    description:
      "The ultimate campus championship where strategy, skill and teamwork collide.",
    color: "white",
  },
];

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

  const [cardsVisible, setCardsVisible] =
    useState(false);

  const sectionRef =
    useRef(null);

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

  return (
    <section
      ref={sectionRef}
      id="about"
      className="
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
          fill: url(#liveEventsFill);
          stroke: none;
          paint-order: normal;
          filter: url(#liveEventsShadow);
        }

        .live-events-line {
          font-family: "The Last Shuriken", sans-serif;
          fill: url(#liveEventsInner);
          stroke: none;
          paint-order: normal;
          opacity: 0.34;
          pointer-events: none;
        }

        .live-events-shine {
          font-family: "The Last Shuriken", sans-serif;
          fill: url(#liveEventsShine);
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
      `}</style>

      {/* ==================================================
          PAC-MAN MAZE BACKGROUND
      ================================================== */}

      <WhiteCombatMaze />

      {/* ==================================================
          BACKGROUND OVERLAYS
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
          bg-black/[0.02]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[2]
          bg-gradient-to-b
          from-black/[0.18]
          via-transparent
          to-black/[0.12]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[2]
          bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(255,255,255,0.012)_48%,rgba(0,0,0,0.16)_100%)]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[2]
          bg-gradient-to-r
          from-black/[0.12]
          via-transparent
          to-black/[0.12]
        "
      />

      {/* ==================================================
          COLOR BLOOMS
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-[8%]
          top-[18%]
          z-[2]
          h-[420px]
          w-[420px]
          rounded-full
          bg-white/[0.018]
          blur-[150px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[12%]
          top-[28%]
          z-[2]
          h-[380px]
          w-[380px]
          rounded-full
          bg-white/[0.015]
          blur-[150px]
        "
      />

      {/* ==================================================
          MOVING GRID
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[2]
          opacity-[0.08]
          [background-image:linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)]
          [background-size:80px_80px]
        "
      />

      {/* ==================================================
          AMBIENT LIGHT
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-1/3
          z-[2]
          h-[500px]
          w-[500px]
          rounded-full
          bg-white/[0.018]
          blur-[150px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-1/4
          z-[2]
          h-[450px]
          w-[450px]
          rounded-full
          bg-white/[0.015]
          blur-[150px]
        "
      />

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
                className="live-events-neon-svg"
                viewBox="0 0 760 105"
                preserveAspectRatio="xMidYMid meet"
                role="heading"
                aria-level="2"
                aria-label="LIVE EVENTS"
              >
                <defs>
                  <linearGradient
                    id="liveEventsFill"
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
                    id="liveEventsInner"
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
                    id="liveEventsShine"
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
                  y="76"
                  textAnchor="middle"
                  fontFamily="The Last Shuriken, sans-serif"
                  fontSize="76"
                  fontWeight="700"
                  letterSpacing="-4"
                  className="live-events-base"
                >
                  LIVE EVENTS
                </text>

                <text
                  x="50%"
                  y="76"
                  textAnchor="middle"
                  fontFamily="The Last Shuriken, sans-serif"
                  fontSize="76"
                  fontWeight="700"
                  letterSpacing="-4"
                  className="live-events-line"
                  aria-hidden="true"
                >
                  LIVE EVENTS
                </text>

                <text
                  x="50%"
                  y="76"
                  textAnchor="middle"
                  fontFamily="The Last Shuriken, sans-serif"
                  fontSize="76"
                  fontWeight="700"
                  letterSpacing="-4"
                  className="live-events-shine"
                  aria-hidden="true"
                >
                  LIVE EVENTS
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
            COMPETE. CONQUER. CREATE LEGACY.
            <br />
            Enter the competitive world of NITS
            Esports and experience the next
            generation of campus gaming.
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
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
            lg:gap-6
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

      {/* ==================================================
          SECTION PAGE DIVIDER — REMOVED
      ================================================== */}
    </section>
  );
};

export default ScrollSection;