import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const galleryImages = [
  "/gallery/gallery1.jpg",
  "/gallery/gallery2.jpg",
  "/gallery/gallery3.jpg",
  "/gallery/gallery4.jpg",
  "/gallery/gallery5.jpg",
  "/gallery/gallery6.jpg",
];

const features = [
  {
    number: "01",
    icon: "✦",
    title: "Competitive Gaming",
    description: "Participate in tournaments and climb the rankings.",
  },
  {
    number: "02",
    icon: "◉",
    title: "Active Community",
    description: "Join a vibrant community of passionate gamers.",
  },
  {
    number: "03",
    icon: "▣",
    title: "Regular Events",
    description: "Weekly tournaments and gaming sessions.",
  },
];

const stars = Array.from({ length: 42 }, (_, i) => ({
  id: i,
  left: `${(i * 47) % 100}%`,
  top: `${5 + ((i * 31) % 62)}%`,
  size: `${1 + (i % 3)}px`,
  delay: `${(i % 8) * 0.7}s`,
  duration: `${3 + (i % 6)}s`,
}));

const dustParticles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  top: `${15 + ((i * 43) % 70)}%`,
  depth: (0.2 + (i % 5) * 0.12).toFixed(2),
  rise: 10 + (i % 6) * 7,
  duration: `${4 + (i % 7)}s`,
}));

const ScrollSection2 = () => {
  const sectionRef = useRef(null);
  const whyJoinRef = useRef(null);
  const galleryRef = useRef(null);
  const [whyJoinVisible, setWhyJoinVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);

  /* ============================================================
PRECISION SAMURAI CROSSHAIR — THREE.JS HUD
- reference-inspired circular military/samurai reticle
- cursor tracking + inertial parallax
- scroll momentum
- click lock / pulse / radial impact
============================================================ */
  const hudCanvasRef = useRef(null);
  useEffect(() => {
    const canvas = hudCanvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const root = new THREE.Group();
    scene.add(root);

    const hud = new THREE.Group();
    root.add(hud);

    const white = new THREE.Color(0xffffff);
    const soft = new THREE.Color(0xb7bcc2);

    const makeLine = (points, opacity = 0.5, target = hud) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: white,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(geometry, material);
      target.add(line);
      return line;
    };

    const makeRing = (
      radius,
      segments = 160,
      opacity = 0.45,
      rotation = 0,
      target = hud
    ) => {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push(
          new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0)
        );
      }
      const ring = makeLine(pts, opacity, target);
      ring.rotation.z = rotation;
      return ring;
    };

    const makeDottedRing = (
      radius,
      count,
      dotSize,
      opacity,
      target = hud,
      phase = 0
    ) => {
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + phase;
        positions[i * 3] = Math.cos(a) * radius;
        positions[i * 3 + 1] = Math.sin(a) * radius;
        positions[i * 3 + 2] = 0.015;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      const material = new THREE.PointsMaterial({
        color: white,
        size: dotSize,
        transparent: true,
        opacity,
        sizeAttenuation: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geometry, material);
      target.add(points);
      return points;
    };

    /* ---------------- OUTER REFERENCE RINGS ---------------- */

    makeRing(2.08, 192, 0.09);
    const outerRing = makeRing(1.91, 192, 0.5);
    const outerInner = makeRing(1.79, 192, 0.15);
    const tacticalRing = makeRing(1.58, 160, 0.22);
    const innerRing = makeRing(1.22, 144, 0.25);
    makeRing(0.83, 128, 0.2);
    makeRing(0.46, 112, 0.58);
    makeRing(0.27, 96, 0.74);

    /* ---------------- DOTTED TARGETING RINGS ---------------- */

    const dotsOuter = makeDottedRing(1.83, 96, 2.2, 0.82, hud, 0.012);
    const dotsMid = makeDottedRing(1.47, 72, 1.65, 0.58, hud, Math.PI / 72);
    const dotsInner = makeDottedRing(1.08, 64, 1.25, 0.42, hud, 0.04);

    /* ---------------- OUTER SEGMENTED SCALE ---------------- */

    const segmentGroup = new THREE.Group();
    hud.add(segmentGroup);

    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const major = i % 6 === 0;
      const medium = i % 3 === 0;

      const r1 = major ? 1.92 : medium ? 1.955 : 1.98;
      const r2 = 2.08;

      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(a) * r1, Math.sin(a) * r1, 0.01),
        new THREE.Vector3(Math.cos(a) * r2, Math.sin(a) * r2, 0.01),
      ]);

      const mat = new THREE.LineBasicMaterial({
        color: i % 6 === 0 ? white : soft,
        transparent: true,
        opacity: major ? 0.78 : medium ? 0.38 : 0.19,
        depthWrite: false,
      });

      segmentGroup.add(new THREE.Line(geo, mat));
    }

    /* ---------------- INNER PRECISION TICKS ---------------- */

    const ticks = new THREE.Group();
    hud.add(ticks);

    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const major = i % 8 === 0;
      const medium = i % 4 === 0;

      const r1 = major ? 1.45 : medium ? 1.48 : 1.51;
      const r2 = major ? 1.59 : medium ? 1.56 : 1.54;

      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(a) * r1, Math.sin(a) * r1, 0.018),
        new THREE.Vector3(Math.cos(a) * r2, Math.sin(a) * r2, 0.018),
      ]);

      const mat = new THREE.LineBasicMaterial({
        color: white,
        transparent: true,
        opacity: major ? 0.65 : medium ? 0.32 : 0.13,
        depthWrite: false,
      });

      ticks.add(new THREE.Line(geo, mat));
    }

    /* ---------------- FOUR CORNER TARGET BRACKETS ---------------- */

    const bracketGroup = new THREE.Group();
    hud.add(bracketGroup);

    const makeBracket = (sx, sy) => {
      const g = new THREE.Group();
      const x = 0.83 * sx;
      const y = 0.83 * sy;
      const outer = 0.29;
      const inner = 0.08;

      const add = (pts, opacity = 0.62) => makeLine(pts, opacity, g);

      add([
        new THREE.Vector3(x, y, 0.03),
        new THREE.Vector3(x - outer * sx, y, 0.03),
      ]);

      add([
        new THREE.Vector3(x, y, 0.03),
        new THREE.Vector3(x, y - outer * sy, 0.03),
      ]);

      add(
        [
          new THREE.Vector3(x - inner * sx, y - outer * sy, 0.03),
          new THREE.Vector3(x - outer * sx, y - outer * sy, 0.03),
        ],
        0.26
      );

      add(
        [
          new THREE.Vector3(x - outer * sx, y - inner * sy, 0.03),
          new THREE.Vector3(x - outer * sx, y - outer * sy, 0.03),
        ],
        0.18
      );

      bracketGroup.add(g);
    };

    makeBracket(1, 1);
    makeBracket(-1, 1);
    makeBracket(1, -1);
    makeBracket(-1, -1);

    /* ---------------- CARDINAL CROSS / PHOTO-LIKE AXES ---------------- */

    const axisGroup = new THREE.Group();
    hud.add(axisGroup);

    makeLine(
      [new THREE.Vector3(-2.34, 0, 0), new THREE.Vector3(-0.82, 0, 0)],
      0.48,
      axisGroup
    );
    makeLine(
      [new THREE.Vector3(0.82, 0, 0), new THREE.Vector3(2.34, 0, 0)],
      0.48,
      axisGroup
    );
    makeLine(
      [new THREE.Vector3(0, -2.34, 0), new THREE.Vector3(0, -0.82, 0)],
      0.48,
      axisGroup
    );
    makeLine(
      [new THREE.Vector3(0, 0.82, 0), new THREE.Vector3(0, 2.34, 0)],
      0.48,
      axisGroup
    );

    [1, -1].forEach((s) => {
      makeLine(
        [
          new THREE.Vector3(1.99 * s, -0.08, 0.02),
          new THREE.Vector3(1.99 * s, 0.08, 0.02),
        ],
        0.65,
        axisGroup
      );

      makeLine(
        [
          new THREE.Vector3(-0.08, 1.99 * s, 0.02),
          new THREE.Vector3(0.08, 1.99 * s, 0.02),
        ],
        0.65,
        axisGroup
      );
    });

    /* ---------------- CENTRAL PRECISION CROSSHAIR ---------------- */

    const centerGroup = new THREE.Group();
    hud.add(centerGroup);

    makeRing(0.36, 96, 0.82, 0, centerGroup);
    makeRing(0.17, 72, 0.58, 0, centerGroup);

    const arm = 0.48;
    const gap = 0.095;

    makeLine(
      [new THREE.Vector3(-arm, 0, 0.06), new THREE.Vector3(-gap, 0, 0.06)],
      0.92,
      centerGroup
    );
    makeLine(
      [new THREE.Vector3(gap, 0, 0.06), new THREE.Vector3(arm, 0, 0.06)],
      0.92,
      centerGroup
    );
    makeLine(
      [new THREE.Vector3(0, -arm, 0.06), new THREE.Vector3(0, -gap, 0.06)],
      0.92,
      centerGroup
    );
    makeLine(
      [new THREE.Vector3(0, gap, 0.06), new THREE.Vector3(0, arm, 0.06)],
      0.92,
      centerGroup
    );

    const core = new THREE.Mesh(
      new THREE.CircleGeometry(0.035, 24),
      new THREE.MeshBasicMaterial({
        color: white,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    centerGroup.add(core);

    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      makeLine(
        [
          new THREE.Vector3(Math.cos(a) * 0.21, Math.sin(a) * 0.21, 0.06),
          new THREE.Vector3(Math.cos(a) * 0.28, Math.sin(a) * 0.28, 0.06),
        ],
        0.62,
        centerGroup
      );
    }

    /* ---------------- ROTATING SCANNER / SENSOR ARC ---------------- */

    const scannerGroup = new THREE.Group();
    hud.add(scannerGroup);

    const scanPoints = [];
    const scanSegments = 52;
    for (let i = 0; i <= scanSegments; i++) {
      const a = -0.82 + (i / scanSegments) * 1.64;
      scanPoints.push(
        new THREE.Vector3(Math.cos(a) * 1.48, Math.sin(a) * 1.48, 0.07)
      );
    }

    makeLine(scanPoints, 0.92, scannerGroup);

    makeLine(
      [new THREE.Vector3(0, 0, 0.07), new THREE.Vector3(0, 1.47, 0.07)],
      0.2,
      scannerGroup
    );

    /* ---------------- FOUR MICRO SENSOR MARKERS ---------------- */

    const markerGroup = new THREE.Group();
    hud.add(markerGroup);

    [
      [-1.27, 0.6],
      [1.27, 0.6],
      [-1.27, -0.6],
      [1.27, -0.6],
    ].forEach(([x, y], index) => {
      const g = new THREE.Group();

      const dot = new THREE.Mesh(
        new THREE.CircleGeometry(index === 0 ? 0.028 : 0.019, 12),
        new THREE.MeshBasicMaterial({
          color: soft,
          transparent: true,
          opacity: 0.78,
          depthWrite: false,
        })
      );
      g.add(dot);

      makeLine(
        [
          new THREE.Vector3(x, y, 0.03),
          new THREE.Vector3(x + (x > 0 ? 0.17 : -0.17), y, 0.03),
        ],
        0.28,
        g
      );

      markerGroup.add(g);
    });

    /* ---------------- CLICK / LOCK FX ---------------- */

    const shotGroup = new THREE.Group();
    hud.add(shotGroup);

    const shotRing = makeRing(0.18, 96, 0, 0, shotGroup);
    shotRing.material.opacity = 0;

    const lockRing = makeRing(0.58, 112, 0, 0, shotGroup);
    lockRing.material.opacity = 0;

    const lockRingOuter = makeRing(0.9, 112, 0, 0, shotGroup);
    lockRingOuter.material.opacity = 0;

    const shotFlash = new THREE.Mesh(
      new THREE.CircleGeometry(0.075, 24),
      new THREE.MeshBasicMaterial({
        color: white,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    shotGroup.add(shotFlash);

    const shotRays = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const long = i % 4 === 0 ? 0.42 : 0.3;

      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(angle) * 0.09, Math.sin(angle) * 0.09, 0.08),
        new THREE.Vector3(Math.cos(angle) * long, Math.sin(angle) * long, 0.08),
      ]);

      const mat = new THREE.LineBasicMaterial({
        color: white,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const ray = new THREE.Line(geo, mat);
      shotGroup.add(ray);
      shotRays.push(ray);
    }

    const tracerGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0.08),
      new THREE.Vector3(0, 0, 0.08),
    ]);

    const tracer = new THREE.Line(
      tracerGeometry,
      new THREE.LineBasicMaterial({
        color: white,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    shotGroup.add(tracer);

    /* ---------------- CURSOR RETICLE ---------------- */

    const cursorReticle = new THREE.Group();
    hud.add(cursorReticle);

    const cursorRing = makeRing(0.23, 72, 0.86, 0, cursorReticle);
    cursorRing.position.z = 0.11;

    const cursorRing2 = makeRing(0.31, 72, 0.28, 0, cursorReticle);
    cursorRing2.position.z = 0.11;

    const cursorArms = [
      [-0.43, 0, -0.12, 0],
      [0.12, 0, 0.43, 0],
      [0, -0.43, 0, -0.12],
      [0, 0.12, 0, 0.43],
    ];

    cursorArms.forEach(([x1, y1, x2, y2]) => {
      makeLine(
        [new THREE.Vector3(x1, y1, 0.12), new THREE.Vector3(x2, y2, 0.12)],
        0.88,
        cursorReticle
      );
    });

    const cursorDot = new THREE.Mesh(
      new THREE.CircleGeometry(0.024, 16),
      new THREE.MeshBasicMaterial({
        color: white,
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    cursorDot.position.z = 0.13;
    cursorReticle.add(cursorDot);

    /* ---------------- POINTER / SCROLL STATE ---------------- */

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const cursorTarget = new THREE.Vector3();
    const cursorWorld = new THREE.Vector3();
    const hitPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    let scrollVelocity = 0;
    let lastScroll = window.scrollY;

    let shotTime = 0;
    let lockTime = 0;
    let shotX = 0;
    let shotY = 0;

    let frameId;
    let baseHudScale = 1;

    const onPointerMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;

      pointerNdc.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerNdc.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointerNdc, camera);

      if (raycaster.ray.intersectPlane(hitPlane, cursorWorld)) {
        cursorTarget.copy(cursorWorld);
        cursorTarget.z = 0.12;
      }
    };

    const onPointerLeave = () => {
      mouseX = 0;
      mouseY = 0;
      cursorTarget.set(0, 0, 0.12);
    };

    const onScroll = () => {
      const next = window.scrollY;
      scrollVelocity += (next - lastScroll) * 0.0045;
      scrollVelocity = THREE.MathUtils.clamp(scrollVelocity, -0.16, 0.16);
      lastScroll = next;
    };

    const onClick = (event) => {
      pointerNdc.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerNdc.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointerNdc, camera);

      if (raycaster.ray.intersectPlane(hitPlane, cursorWorld)) {
        shotX = cursorWorld.x;
        shotY = cursorWorld.y;
      } else {
        shotX = 0;
        shotY = 0;
      }

      shotGroup.position.set(shotX, shotY, 0.04);

      shotTime = 1;
      lockTime = 1;

      shotFlash.scale.setScalar(0.65);
      shotFlash.material.opacity = 1;

      shotRing.scale.setScalar(0.25);
      shotRing.material.opacity = 1;

      lockRing.scale.setScalar(0.55);
      lockRing.material.opacity = 0.95;

      lockRingOuter.scale.setScalar(0.35);
      lockRingOuter.material.opacity = 0.78;

      shotRays.forEach((ray, i) => {
        ray.material.opacity = i % 4 === 0 ? 1 : 0.72;
        ray.scale.setScalar(0.45);
      });

      const center = new THREE.Vector3(0, 0, 0.08);
      const direction = new THREE.Vector3(shotX * 0.13, shotY * 0.13, 0);

      tracer.geometry.setFromPoints([center, direction]);
      tracer.material.opacity = 0.92;

      cursorReticle.scale.setScalar(1.18);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      /*
      Compact premium sizing:
      keep the crosshair detailed, but stop it from dominating
      the whole viewport on large desktop screens.
    */
      const scale = Math.min(width, height) / 560;

      baseHudScale = Math.max(0.64, Math.min(scale, 1.08));

      hud.scale.setScalar(baseHudScale);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onPointerMove, {
      passive: true,
    });
    window.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, {
      passive: true,
    });
    window.addEventListener("click", onClick);

    resize();

    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();

      currentX += (mouseX - currentX) * 0.055;
      currentY += (mouseY - currentY) * 0.055;

      root.rotation.y += currentX * 0.045 - root.rotation.y * 0.045;
      root.rotation.x += -currentY * 0.035 - root.rotation.x * 0.045;

      scrollVelocity *= 0.9;

      hud.rotation.z += 0.00055 + scrollVelocity * 0.55;

      const scrollTilt = THREE.MathUtils.clamp(
        scrollVelocity * 3.5,
        -0.32,
        0.32
      );

      root.rotation.z += (scrollTilt - root.rotation.z) * 0.06;

      root.position.x += (currentX * 0.075 - root.position.x) * 0.04;

      root.position.y +=
        (-currentY * 0.055 + scrollVelocity * 0.75 - root.position.y) * 0.04;

      const motionScale =
        1 + Math.min(Math.abs(scrollVelocity) * 1.15, 0.075);

      hud.scale.setScalar(baseHudScale * motionScale);

      outerRing.rotation.z -= 0.0008;
      outerInner.rotation.z += 0.00045;
      tacticalRing.rotation.z -= 0.0006;
      innerRing.rotation.z += 0.0008;

      dotsOuter.rotation.z -= 0.0007;
      dotsMid.rotation.z += 0.0009;
      dotsInner.rotation.z -= 0.0012;

      segmentGroup.rotation.z -= 0.00035;
      ticks.rotation.z += 0.00025;
      scannerGroup.rotation.z += 0.0085;

      const pulse = 1 + Math.sin(t * 2.2) * 0.035;
      core.scale.setScalar(pulse);

      cursorReticle.position.lerp(cursorTarget, 0.2);

      cursorReticle.rotation.z = -t * 0.11;

      cursorRing2.rotation.z = t * 0.24;

      cursorDot.scale.setScalar(1 + Math.sin(t * 8.5) * 0.13);

      if (lockTime > 0) {
        lockTime -= 0.038;

        lockRing.scale.multiplyScalar(1.025);
        lockRingOuter.scale.multiplyScalar(1.034);

        lockRing.material.opacity = Math.max(0, lockTime * 0.95);

        lockRingOuter.material.opacity = Math.max(0, lockTime * 0.78);
      }

      if (shotTime > 0) {
        shotTime -= 0.055;

        const p = 1 - shotTime;
        const ease = 1 - Math.pow(1 - p, 3);

        shotFlash.scale.setScalar(0.65 + ease * 2.2);

        shotFlash.material.opacity = Math.max(0, shotTime * 0.9);

        shotRing.scale.setScalar(0.25 + ease * 2.15);

        shotRing.material.opacity = Math.max(0, shotTime * 0.95);

        shotRays.forEach((ray, i) => {
          ray.scale.setScalar(0.45 + ease * (1.5 + (i % 4) * 0.18));

          ray.material.opacity = Math.max(
            0,
            shotTime * (i % 4 === 0 ? 1 : 0.72)
          );
        });

        tracer.material.opacity = Math.max(0, shotTime * 0.72);
      } else {
        cursorReticle.scale.lerp(new THREE.Vector3(1, 1, 1), 0.18);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);

      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, []);

  /* ============================================================
INTERSECTION OBSERVER
============================================================ */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === whyJoinRef.current) {
            setWhyJoinVisible(entry.isIntersecting);
          }

          if (entry.target === galleryRef.current) {
            setGalleryVisible(entry.isIntersecting);
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    if (whyJoinRef.current) {
      observer.observe(whyJoinRef.current);
    }

    if (galleryRef.current) {
      observer.observe(galleryRef.current);
    }

    return () => observer.disconnect();
  }, []);

  /* ============================================================
MOUSE + SCROLL PARALLAX
============================================================ */
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    let mouseX = 0;
    let mouseY = 0;

    let currentX = 0;
    let currentY = 0;

    let animationFrame;

    const handleMouseMove = (event) => {
      const rect = section.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;

      mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const handleMouseLeave = () => {
      mouseX = 0;
      mouseY = 0;
    };

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();

      const progress =
        (window.innerHeight * 0.5 - rect.top) / Math.max(rect.height, 1);

      const clampedProgress = Math.max(-1, Math.min(2, progress));

      section.style.setProperty("--scroll", `${clampedProgress * 100}`);

      section.style.setProperty("--scroll-progress", clampedProgress);
    };

    const animate = () => {
      currentX += (mouseX - currentX) * 0.055;
      currentY += (mouseY - currentY) * 0.055;

      section.style.setProperty("--mouse-x", currentX);
      section.style.setProperty("--mouse-y", currentY);

      section.style.setProperty("--parallax-x", `${currentX * 38}px`);

      section.style.setProperty("--parallax-y", `${currentY * 30}px`);

      animationFrame = requestAnimationFrame(animate);
    };

    section.addEventListener("mousemove", handleMouseMove, { passive: true });

    section.addEventListener("mouseleave", handleMouseLeave);

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);

      section.removeEventListener("mousemove", handleMouseMove);

      section.removeEventListener("mouseleave", handleMouseLeave);

      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="gallery-page-font relative min-h-screen w-full overflow-hidden isolate bg-black text-white m-0 p-0 border-0 outline-0 shadow-none border-t-0 border-b-0"
      style={{
        fontFamily: "'The Last Shuriken', sans-serif",
        "--mouse-x": 0,
        "--mouse-y": 0,
        "--parallax-x": "0px",
        "--parallax-y": "0px",
        "--scroll": 0,
        "--scroll-progress": 0,
      }}
    >
      {/* =========================================================
GLOBAL CSS
========================================================= */}

      <style>{`

    /* ============================================================
       VIEWPORT EDGE RESET — NO WHITE TOP/BOTTOM/SIDE BORDERS
    ============================================================ */
    html,
    body,
    #root {
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      outline: 0 !important;
      width: 100%;
      min-height: 100%;
      background: #000 !important;
    }

    html {
      overflow-x: hidden;
      background: #000 !important;
    }

    body {
      overflow-x: hidden;
      background: #000 !important;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    /* FULL-WIDTH DIVIDER REMOVAL */
    .gallery-page-font,
    .gallery-page-font *,
    .gallery-page-font::before,
    .gallery-page-font::after {
      border-top: 0 !important;
      border-bottom: 0 !important;
      outline: 0 !important;
    }

    .gallery-page-font {
      box-shadow: none !important;
    }

    .gallery-page-font {
      margin: 0 !important;
      border: 0 !important;
      outline: 0 !important;
      box-shadow: none;
    }

    .gallery-page-font::before,
    .gallery-page-font::after {
      border: 0 !important;
      outline: 0 !important;
    }

    @import url(
      'https://fonts.cdnfonts.com/css/the-last-shuriken'
    );

    .gallery-page-font,
    .gallery-page-font *,
    .gallery-page-font svg text {
      font-family:
        'The Last Shuriken',
        sans-serif !important;
    }

    .samurai-display {
      font-family:
        'The Last Shuriken',
        sans-serif;

      font-weight: 700;
      letter-spacing: 0.025em;

      text-shadow:
        0 4px 0 rgba(0,0,0,.9),
        0 7px 18px rgba(0,0,0,.85),
        0 0 12px rgba(255,255,255,.08);
    }

    .samurai-label {
      font-family:
        'The Last Shuriken',
        sans-serif;

      letter-spacing: .18em;

      text-shadow:
        0 2px 7px rgba(0,0,0,.9);
    }



    /* Hard edge protection for oversized visual layers */
    .gallery-page-font {
      overflow-x: clip;
      background: #000 !important;
    }

    .gallery-page-font > * {
      border-top: 0 !important;
      border-bottom: 0 !important;
      outline: 0 !important;
    }

    /* ========================================================
       PRECISION SAMURAI / TACTICAL HUD BACKGROUND
    ======================================================== */

    .tactical-hud-background {
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
      background:
        radial-gradient(
          circle at 50% 48%,
          rgba(255,255,255,.032),
          transparent 30%
        ),
        radial-gradient(
          circle at 50% 48%,
          rgba(255,255,255,.012),
          transparent 52%
        ),
        #000;
    }

    .tactical-hud-canvas {
      position: absolute;
      inset: -2%;
      width: 104%;
      height: 104%;
      display: block;
      opacity: .94;
      pointer-events: none;
      mix-blend-mode: screen;
      filter: contrast(1.08);
    }

    .tactical-hud-vignette {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(
          ellipse at center,
          transparent 25%,
          rgba(0,0,0,.12) 48%,
          rgba(0,0,0,.52) 72%,
          rgba(0,0,0,.92) 100%
        );
    }

    .tactical-hud-grid {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: .075;
      background-image:
        linear-gradient(
          rgba(255,255,255,.20) 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          rgba(255,255,255,.20) 1px,
          transparent 1px
        );
      background-size: 72px 72px;
      mask-image:
        radial-gradient(
          ellipse at center,
          black 0%,
          black 34%,
          transparent 76%
        );
      -webkit-mask-image:
        radial-gradient(
          ellipse at center,
          black 0%,
          black 34%,
          transparent 76%
        );
      transform:
        translate3d(
          calc(var(--mouse-x) * -10px),
          calc(var(--mouse-y) * -7px),
          0
        );
      transition: transform .2s ease-out;
    }

    .tactical-hud-scanline {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: .045;
      background:
        repeating-linear-gradient(
          0deg,
          transparent 0 3px,
          rgba(255,255,255,.09) 4px,
          transparent 5px
        );
      mix-blend-mode: screen;
    }

    .tactical-hud-background::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 48%;
      width: min(62vw, 900px);
      height: min(62vw, 900px);
      transform:
        translate(-50%, -50%)
        translate3d(
          calc(var(--mouse-x) * 75px),
          calc(var(--mouse-y) * 55px),
          0
        );
      background:
        radial-gradient(
          circle,
          rgba(255,255,255,.045),
          rgba(255,255,255,.012) 30%,
          transparent 68%
        );
      filter: blur(10px);
      opacity: .75;
      transition: transform .18s ease-out;
      pointer-events: none;
    }

    @media (max-width: 768px) {
      .tactical-hud-canvas {
        opacity: .76;
      }

      .tactical-hud-grid {
        background-size: 48px 48px;
        opacity: .045;
      }

      .tactical-hud-background::after {
        width: 520px;
        height: 520px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tactical-hud-scanline {
        display: none;
      }
    }

    /* ========================================================
       GALLERY AUTO SCROLL
    ======================================================== */

    @keyframes galleryScroll {
      from {
        transform: translateX(0);
      }

      to {
        transform: translateX(-50%);
      }
    }

    .animate-galleryScroll {
      animation:
        galleryScroll
        32s
        linear
        infinite;
    }

    /* ========================================================
       HEADING
    ======================================================== */

    .neon-heading-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .neon-heading-svg {
      display: block;
      width: min(720px, 92vw);
      height: auto;
      overflow: visible;
      pointer-events: none;
    }

    .gallery-neon-svg {
      display: block;
      width: min(560px, 92vw);
      height: auto;
      overflow: visible;
      pointer-events: none;
    }

    .neon-heading-base {
      fill: url(#headingFillGradient);
      filter: url(#headingPremiumShadow);
    }

    .neon-heading-inner {
      fill: url(#headingInnerGradient);
      opacity: .34;
    }

    .neon-heading-shine {
      fill: url(#headingShineGradient);
      opacity: .9;
      mix-blend-mode: screen;
    }

    .gallery-heading-base {
      fill: url(#galleryFillGradient);
      filter: url(#galleryPremiumShadow);
    }

    .gallery-heading-inner {
      fill: url(#galleryInnerGradient);
      opacity: .34;
    }

    .gallery-heading-shine {
      fill: url(#galleryShineGradient);
      opacity: .9;
      mix-blend-mode: screen;
    }

    /* ========================================================
       ZEN BACKGROUND
    ======================================================== */

    .zen-background {
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;

      background:
        linear-gradient(
          180deg,
          #000000 0%,
          #030303 20%,
          #0a0a0a 43%,
          #111111 55%,
          #070707 73%,
          #000000 100%
        );
    }

    /* ========================================================
       SKY GLOW
    ======================================================== */

    .zen-sky {
      position: absolute;
      inset: -10%;

      background:
        radial-gradient(
          ellipse at 50% 30%,
          rgba(255,255,255,.12) 0%,
          rgba(255,255,255,.055) 17%,
          rgba(255,255,255,.015) 35%,
          transparent 60%
        );

      transform:
        translate3d(
          calc(var(--mouse-x) * 7px),
          calc(var(--mouse-y) * 5px),
          0
        );

      transition:
        transform .25s ease-out;
    }

    /* ========================================================
       MOON
    ======================================================== */

    .zen-moon-wrap {
      position: absolute;

      right: clamp(7%, 12vw, 17%);
      top: clamp(7%, 9vh, 13%);

      width: clamp(200px, 26vw, 420px);
      height: clamp(200px, 26vw, 420px);

      z-index: 3;

      transform:
        translate3d(
          calc(var(--parallax-x) * .45),
          calc(
            var(--parallax-y) * .45
            +
            var(--scroll-progress) * -30px
          ),
          0
        );

      transition:
        transform .2s ease-out;
    }

    .zen-moon {
      position: absolute;
      inset: 0;

      border-radius: 50%;

      background:
        radial-gradient(
          circle at 37% 32%,
          #ffffff 0%,
          #ededed 20%,
          #c8c8c8 40%,
          #888888 62%,
          #3d3d3d 82%,
          #111111 100%
        );

      opacity: .5;

      box-shadow:
        0 0 45px rgba(255,255,255,.16),
        0 0 120px rgba(255,255,255,.08);

      filter: grayscale(1);
    }

    .zen-moon::before {
      content: "";

      position: absolute;
      inset: 8%;

      border-radius: 50%;

      background:
        radial-gradient(
          circle at 22% 30%,
          rgba(0,0,0,.18) 0 5%,
          transparent 6%
        ),

        radial-gradient(
          circle at 63% 21%,
          rgba(0,0,0,.13) 0 8%,
          transparent 9%
        ),

        radial-gradient(
          circle at 72% 58%,
          rgba(0,0,0,.15) 0 6%,
          transparent 7%
        ),

        radial-gradient(
          circle at 38% 71%,
          rgba(0,0,0,.12) 0 9%,
          transparent 10%
        );
    }

    .zen-moon-haze {
      position: absolute;
      inset: -25%;

      border-radius: 50%;

      background:
        radial-gradient(
          circle,
          rgba(255,255,255,.11),
          transparent 65%
        );

      filter: blur(28px);
    }

    /* ========================================================
       STARS
    ======================================================== */

    .zen-stars {
      position: absolute;
      inset: 0;
      z-index: 2;
    }

    .zen-star {
      position: absolute;

      border-radius: 50%;

      background:
        rgba(255,255,255,.9);

      box-shadow:
        0 0 9px rgba(255,255,255,.5);

      animation:
        starPulse
        var(--star-duration)
        ease-in-out
        infinite;

      animation-delay:
        var(--star-delay);
    }

    @keyframes starPulse {
      0%,
      100% {
        opacity: .08;
        transform: scale(.65);
      }

      50% {
        opacity: .8;
        transform: scale(1.4);
      }
    }

    /* ========================================================
       CLOUD / INK MIST
    ======================================================== */

    .zen-cloud-field {
      position: absolute;
      inset: 0;
      z-index: 7;

      transform:
        translate3d(
          calc(var(--parallax-x) * -.4),
          calc(
            var(--parallax-y) * -.25
            +
            var(--scroll-progress) * -40px
          ),
          0
        );

      transition:
        transform .2s ease-out;
    }

    .zen-cloud {
      position: absolute;

      width: clamp(400px, 55vw, 900px);
      height: clamp(100px, 15vw, 250px);

      background:
        radial-gradient(
          ellipse,
          rgba(255,255,255,.13),
          rgba(255,255,255,.05) 35%,
          transparent 72%
        );

      filter: blur(24px);

      opacity: .5;

      animation:
        cloudFloat
        14s
        ease-in-out
        infinite alternate;
    }

    .cloud-one {
      left: -12%;
      top: 40%;
    }

    .cloud-two {
      right: -18%;
      top: 48%;

      animation-delay: -6s;
      animation-duration: 17s;
    }

    .cloud-three {
      left: 20%;
      top: 61%;

      width: 70vw;

      opacity: .28;

      animation-delay: -3s;
    }

    @keyframes cloudFloat {
      from {
        transform:
          translateX(-70px)
          scale(1);
      }

      to {
        transform:
          translateX(90px)
          scale(1.12);
      }
    }

    /* ========================================================
       MOUNTAINS
    ======================================================== */

    .zen-mountains {
      position: absolute;
      inset: 0;
      z-index: 5;

      transform:
        translate3d(
          calc(var(--parallax-x) * .25),
          calc(
            var(--parallax-y) * .18
            +
            var(--scroll-progress) * -22px
          ),
          0
        );

      transition:
        transform .2s ease-out;
    }

    .mountain {
      position: absolute;

      bottom: 16%;

      width: 75%;
      height: 42%;

      background:
        linear-gradient(
          145deg,
          #292929 0%,
          #111111 43%,
          #020202 100%
        );

      clip-path:
        polygon(
          0 100%,
          8% 77%,
          17% 83%,
          27% 54%,
          35% 67%,
          45% 26%,
          51% 42%,
          58% 16%,
          63% 39%,
          72% 28%,
          81% 59%,
          91% 72%,
          100% 100%
        );

      filter:
        drop-shadow(
          0 -10px 35px rgba(0,0,0,.8)
        );
    }

    .mountain-far {
      left: -13%;
      bottom: 21%;

      width: 80%;
      height: 35%;

      opacity: .5;

      background:
        linear-gradient(
          150deg,
          #555555,
          #171717 55%,
          #060606
        );

      transform:
        translateX(
          calc(var(--parallax-x) * -.35)
        );
    }

    .mountain-main {
      left: -18%;

      transform:
        translateX(
          calc(var(--parallax-x) * -.65)
        );
    }

    .mountain-right {
      right: -19%;

      transform:
        scaleX(-1)
        translateX(
          calc(var(--parallax-x) * -.5)
        );

      opacity: .9;
    }

    /* ========================================================
       MOUNTAIN EDGES
    ======================================================== */

    .mountain-edge {
      position: absolute;

      bottom: 39%;
      left: 12%;

      width: 55%;
      height: 2px;

      background:
        linear-gradient(
          90deg,
          transparent,
          rgba(255,255,255,.3),
          rgba(255,255,255,.05),
          transparent
        );

      transform:
        rotate(-8deg)
        translate3d(
          calc(var(--parallax-x) * -.7),
          0,
          0
        );

      opacity: .55;
    }

    .mountain-edge.right {
      left: auto;
      right: 8%;
      bottom: 36%;

      transform:
        rotate(8deg)
        translate3d(
          calc(var(--parallax-x) * .7),
          0,
          0
        );
    }

    /* ========================================================
       TORII
    ======================================================== */

    .zen-torii {
      position: absolute;

      left: 50%;
      bottom: 19%;

      width: 180px;
      height: 150px;

      z-index: 9;

      opacity: .72;

      transform:
        translateX(-50%)
        translate3d(
          calc(var(--parallax-x) * .7),
          calc(
            var(--parallax-y) * .45
            +
            var(--scroll-progress) * -18px
          ),
          0
        );

      transition:
        transform .2s ease-out;
    }

    .torii-top {
      position: absolute;

      left: -12px;
      top: 5px;

      width: 204px;
      height: 10px;

      background: #050505;

      box-shadow:
        0 0 15px rgba(0,0,0,.8);
    }

    .torii-top::before {
      content: "";

      position: absolute;

      left: 9px;
      top: -7px;

      width: 186px;
      height: 8px;

      background: #111111;

      transform:
        skewX(-18deg);
    }

    .torii-cross {
      position: absolute;

      left: 4px;
      top: 30px;

      width: 172px;
      height: 8px;

      background: #080808;
    }

    .torii-post {
      position: absolute;

      bottom: 0;

      width: 13px;
      height: 125px;

      background:
        linear-gradient(
          90deg,
          #030303,
          #151515,
          #020202
        );

      box-shadow:
        0 0 12px rgba(0,0,0,.8);
    }

    .torii-post.left {
      left: 17px;
    }

    .torii-post.right {
      right: 17px;
    }

    .torii-shadow {
      position: absolute;

      left: 50%;
      bottom: -7px;

      width: 230px;
      height: 18px;

      transform:
        translateX(-50%);

      background:
        radial-gradient(
          ellipse,
          rgba(0,0,0,.95),
          transparent 70%
        );

      filter: blur(5px);
    }

    /* ========================================================
       WATER
    ======================================================== */

    .zen-water {
      position: absolute;

      left: -5%;
      bottom: -3%;

      width: 110%;
      height: 28%;

      z-index: 10;

      background:
        linear-gradient(
          to bottom,
          rgba(10,10,10,.05),
          #020202 65%,
          #000000
        );

      transform:
        perspective(900px)
        rotateX(55deg)
        translate3d(
          var(--parallax-x),
          calc(
            var(--parallax-y)
            +
            var(--scroll-progress) * -50px
          ),
          0
        );

      transform-origin:
        center top;

      transition:
        transform .2s ease-out;
    }

    .water-lines {
      position: absolute;
      inset: 0;

      opacity: .42;

      background:
        repeating-linear-gradient(
          0deg,
          transparent 0 14px,
          rgba(255,255,255,.055) 15px,
          transparent 16px
        );

      animation:
        waterFlow
        8s
        linear
        infinite;
    }

    @keyframes waterFlow {
      from {
        background-position: 0 0;
      }

      to {
        background-position: 0 160px;
      }
    }

    .water-reflection {
      position: absolute;

      left: 50%;
      top: -12%;

      width: 240px;
      height: 90%;

      transform:
        translateX(-50%);

      background:
        linear-gradient(
          to bottom,
          rgba(255,255,255,.14),
          rgba(255,255,255,.025) 40%,
          transparent
        );

      filter: blur(10px);

      opacity: .4;
    }

    /* ========================================================
       BRUSH STROKES
    ======================================================== */

    .zen-brush {
      position: absolute;

      z-index: 15;

      width: 58%;
      height: 90px;

      left: -12%;
      top: 54%;

      background:
        linear-gradient(
          90deg,
          transparent,
          rgba(255,255,255,.05) 20%,
          rgba(255,255,255,.12) 48%,
          rgba(255,255,255,.035) 73%,
          transparent
        );

      clip-path:
        polygon(
          0 43%,
          14% 29%,
          31% 35%,
          51% 16%,
          72% 31%,
          89% 21%,
          100% 44%,
          83% 62%,
          61% 54%,
          43% 76%,
          23% 59%,
          6% 68%
        );

      filter: blur(6px);

      opacity: .55;

      transform:
        translate3d(
          calc(var(--mouse-x) * 45px),
          calc(var(--scroll-progress) * -45px),
          0
        );

      transition:
        transform .2s ease-out;

      animation:
        brushMove
        11s
        ease-in-out
        infinite alternate;
    }

    .zen-brush.right {
      left: auto;
      right: -16%;
      top: 64%;

      transform:
        scaleX(-1)
        translate3d(
          calc(var(--mouse-x) * 35px),
          calc(var(--scroll-progress) * -30px),
          0
        );

      opacity: .3;
    }

    @keyframes brushMove {
      from {
        margin-left: -25px;
      }

      to {
        margin-left: 80px;
      }
    }

    /* ========================================================
       MOUSE LIGHT
    ======================================================== */

    .zen-mouse-light {
      position: absolute;

      width: 600px;
      height: 600px;

      left: 50%;
      top: 48%;

      z-index: 16;

      transform:
        translate(-50%, -50%)
        translate3d(
          calc(var(--mouse-x) * 160px),
          calc(var(--mouse-y) * 120px),
          0
        );

      background:
        radial-gradient(
          circle,
          rgba(255,255,255,.06),
          rgba(255,255,255,.018) 30%,
          transparent 70%
        );

      filter: blur(5px);

      mix-blend-mode: screen;

      transition:
        transform .15s ease-out;
    }

    /* ========================================================
       DUST
    ======================================================== */

    .zen-dust {
      position: absolute;
      inset: 0;
      z-index: 17;
    }

    .zen-dust span {
      position: absolute;

      width: 2px;
      height: 2px;

      border-radius: 50%;

      background:
        rgba(255,255,255,.7);

      box-shadow:
        0 0 8px rgba(255,255,255,.3);

      transform:
        translate3d(
          calc(var(--parallax-x) * var(--depth)),
          calc(
            var(--parallax-y) * var(--depth)
            +
            var(--scroll-progress) * var(--rise)
          ),
          0
        );

      animation:
        dustFloat
        var(--duration)
        ease-in-out
        infinite alternate;
    }

    @keyframes dustFloat {
      from {
        opacity: .05;
      }

      to {
        opacity: .7;
      }
    }

    /* ========================================================
       VIGNETTE
    ======================================================== */

    .zen-vignette {
      position: absolute;
      inset: 0;

      z-index: 30;

      pointer-events: none;

      background:
        radial-gradient(
          ellipse at center,
          transparent 15%,
          rgba(0,0,0,.25) 55%,
          rgba(0,0,0,.94) 100%
        );
    }

    .zen-edge {
      position: absolute;
      inset: 0;

      z-index: 31;

      pointer-events: none;

      background:
        linear-gradient(
          to bottom,
          rgba(0,0,0,.88) 0%,
          transparent 18%,
          transparent 78%,
          rgba(0,0,0,.96) 100%
        );
    }

    /* ========================================================
       GRAIN
    ======================================================== */

    .zen-grain {
      position: absolute;

      inset: -50%;

      z-index: 32;

      pointer-events: none;

      opacity: .035;

      background-image:
        repeating-radial-gradient(
          circle at 0 0,
          #fff 0,
          #fff 1px,
          transparent 1px,
          transparent 3px
        );

      background-size: 7px 7px;

      animation:
        grainMove
        .35s
        steps(2)
        infinite;
    }

    @keyframes grainMove {
      0% {
        transform: translate(0,0);
      }

      25% {
        transform: translate(2%,-1%);
      }

      50% {
        transform: translate(-1%,2%);
      }

      75% {
        transform: translate(1%,1%);
      }

      100% {
        transform: translate(0,0);
      }
    }

    /* ========================================================
       FEATURE CARDS
    ======================================================== */

    .feature-card {
      transform-style: preserve-3d;

      transition:
        transform .45s ease,
        border-color .45s ease,
        box-shadow .45s ease,
        background .45s ease;
    }

    .feature-card:hover {
      transform:
        translateY(-9px)
        scale(1.018);

      border-color:
        rgba(255,255,255,.75);

      background:
        rgba(20,20,20,.9);

      box-shadow:
        0 0 40px rgba(255,255,255,.13),
        inset 0 0 30px rgba(255,255,255,.025);
    }

    .card-scan {
      position: absolute;
      inset: 0;

      pointer-events: none;

      opacity: 0;

      transform:
        translateX(-120%);

      background:
        linear-gradient(
          110deg,
          transparent 30%,
          rgba(255,255,255,.18) 50%,
          transparent 70%
        );
    }

    .feature-card:hover .card-scan {
      opacity: 1;

      animation:
        cardScan
        .8s
        ease
        forwards;
    }

    @keyframes cardScan {
      to {
        transform:
          translateX(120%);
      }
    }

    /* ========================================================
       GALLERY CARDS
    ======================================================== */

    .gallery-card {
      transition:
        transform .6s ease,
        border-color .5s ease,
        box-shadow .5s ease;
    }

    .gallery-card:hover {
      transform:
        translateY(-8px)
        scale(1.025);

      border-color:
        rgba(255,255,255,.75);

      box-shadow:
        0 0 35px rgba(255,255,255,.16);
    }

    /* ========================================================
       MOBILE
    ======================================================== */

    @media (max-width: 768px) {
      .zen-moon-wrap {
        right: 4%;
        top: 9%;

        width: 220px;
        height: 220px;
      }

      .zen-torii {
        transform:
          translateX(-50%)
          scale(.7);
      }

      .mountain {
        bottom: 19%;
      }

      .zen-water {
        height: 25%;
      }

      .zen-brush {
        width: 90%;
      }

      .zen-mouse-light {
        width: 420px;
        height: 420px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .zen-star,
      .zen-cloud,
      .zen-brush,
      .zen-dust span,
      .water-lines,
      .zen-grain,
      .animate-galleryScroll {
        animation: none !important;
      }
    }
  `}</style>

      {/* =========================================================
      PROFESSIONAL TACTICAL HUD BACKGROUND
  ========================================================= */}

      <div className="tactical-hud-background" aria-hidden="true">
        <canvas ref={hudCanvasRef} className="tactical-hud-canvas" />

        <div className="tactical-hud-vignette" />
        <div className="tactical-hud-grid" />
        <div className="tactical-hud-scanline" />
      </div>

      {/* =========================================================
      MAIN CONTENT
  ========================================================= */}

      <div
        className="
      relative
      z-40
      px-5
      py-20
      md:px-10
      lg:px-16
    "
      >
        <div className="mx-auto max-w-[1700px]">
          {/* =====================================================
          WHY JOIN US
      ===================================================== */}

          <div
            ref={whyJoinRef}
            className={`
          mb-14
          text-center
          transform
          transition-all
          duration-1000
          ease-[cubic-bezier(0.16,1,0.3,1)]
          ${
            whyJoinVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-24 opacity-0 scale-95"
          }
        `}
          >
            <p
              className="
            samurai-label
            mb-4
            text-xs
            font-medium
            uppercase
            tracking-[0.35em]
            text-white/55
          "
            >
              Level Up Your Experience
            </p>

            <div className="neon-heading-wrap">
              <svg
                className="neon-heading-svg"
                viewBox="0 0 720 105"
                preserveAspectRatio="xMidYMid meet"
                role="heading"
                aria-level="2"
                aria-label="WHY JOIN US?"
              >
                <defs>
                  <linearGradient
                    id="headingFillGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#fff" />
                    <stop offset="18%" stopColor="#eee" />
                    <stop offset="45%" stopColor="#777" />
                    <stop offset="65%" stopColor="#4b4b4b" />
                    <stop offset="82%" stopColor="#d5d5d5" />
                    <stop offset="100%" stopColor="#fff" />
                  </linearGradient>

                  <linearGradient
                    id="headingInnerGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#fff" />
                    <stop offset="45%" stopColor="#ddd" />
                    <stop offset="60%" stopColor="#666" />
                    <stop offset="100%" stopColor="#fff" />
                  </linearGradient>

                  <linearGradient
                    id="headingShineGradient"
                    gradientUnits="userSpaceOnUse"
                    x1="-260"
                    y1="0"
                    x2="-80"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="38%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#fff" stopOpacity=".95" />
                    <stop offset="62%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />

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
                    id="headingPremiumShadow"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="180%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="7"
                      stdDeviation="4"
                      floodColor="#000"
                      floodOpacity=".95"
                    />

                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="2"
                      floodColor="#000"
                      floodOpacity=".7"
                    />
                  </filter>
                </defs>

                <text
                  x="360"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontWeight="700"
                  className="neon-heading-base"
                >
                  WHY JOIN US?
                </text>

                <text
                  x="360"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontWeight="700"
                  className="neon-heading-inner"
                >
                  WHY JOIN US?
                </text>

                <text
                  x="360"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontWeight="700"
                  className="neon-heading-shine"
                >
                  WHY JOIN US?
                </text>
              </svg>
            </div>

            <div
              className="
            mx-auto
            mt-6
            flex
            w-44
            items-center
            justify-center
            gap-2
          "
            >
              <span
                className="
              h-px
              flex-1
              bg-gradient-to-r
              from-transparent
              via-white/55
              to-white/15
            "
              />

              <span
                className="
              h-1.5
              w-1.5
              rounded-full
              bg-white
              shadow-[0_0_14px_rgba(255,255,255,.55)]
            "
              />

              <span
                className="
              h-px
              flex-1
              bg-gradient-to-r
              from-white/15
              via-white/55
              to-transparent
            "
              />
            </div>
          </div>

          {/* =====================================================
          FEATURE CARDS
      ===================================================== */}

          <div
            className="
          grid
          grid-cols-1
          gap-6
          md:grid-cols-3
        "
          >
            {features.map((feature) => (
              <div
                key={feature.number}
                className="
              feature-card
              group
              relative
              min-h-[230px]
              overflow-hidden
              rounded-2xl
              border
              border-white/25
              bg-black/75
              p-7
              backdrop-blur-sm
              shadow-[0_15px_40px_rgba(0,0,0,.75)]
            "
              >
                <span className="card-scan" />

                <div
                  className="
                absolute
                left-0
                top-0
                h-[2px]
                w-full
                bg-gradient-to-r
                from-transparent
                via-white/80
                to-transparent
              "
                />

                <div
                  className="
                absolute
                right-6
                top-5
                text-xs
                tracking-[0.3em]
                text-white/30
              "
                >
                  {feature.number}
                </div>

                <div
                  className="
                mb-8
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-xl
                border
                border-white/35
                bg-white/[0.055]
                text-xl
                text-white
                transition-all
                duration-500
                group-hover:border-white
                group-hover:bg-white/[0.11]
                group-hover:shadow-[0_0_25px_rgba(255,255,255,.15)]
              "
                >
                  {feature.icon}
                </div>

                <h3
                  className="
                samurai-display
                text-2xl
                font-semibold
                tracking-tight
                text-white
              "
                >
                  {feature.title}
                </h3>

                <p
                  className="
                mt-4
                max-w-md
                font-sans
                text-sm
                leading-6
                text-white/60
              "
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* =====================================================
          GALLERY HEADING
      ===================================================== */}

          <div
            ref={galleryRef}
            className={`
          mb-10
          mt-28
          text-center
          transform
          transition-all
          duration-1000
          ease-[cubic-bezier(0.16,1,0.3,1)]
          ${
            galleryVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-24 opacity-0 scale-95"
          }
        `}
          >
            <p
              className="
            samurai-label
            mb-4
            text-xs
            uppercase
            tracking-[0.35em]
            text-white/50
          "
            >
              Moments From The Arena
            </p>

            <div className="neon-heading-wrap">
              <svg
                className="gallery-neon-svg"
                viewBox="0 0 560 105"
                preserveAspectRatio="xMidYMid meet"
                role="heading"
                aria-level="2"
                aria-label="GALLERY"
              >
                <defs>
                  <linearGradient
                    id="galleryFillGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#fff" />
                    <stop offset="20%" stopColor="#eee" />
                    <stop offset="48%" stopColor="#777" />
                    <stop offset="68%" stopColor="#4d4d4d" />
                    <stop offset="85%" stopColor="#ddd" />
                    <stop offset="100%" stopColor="#fff" />
                  </linearGradient>

                  <linearGradient
                    id="galleryInnerGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#fff" />
                    <stop offset="42%" stopColor="#ddd" />
                    <stop offset="60%" stopColor="#666" />
                    <stop offset="100%" stopColor="#fff" />
                  </linearGradient>

                  <linearGradient
                    id="galleryShineGradient"
                    gradientUnits="userSpaceOnUse"
                    x1="-260"
                    y1="0"
                    x2="-80"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="38%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#fff" stopOpacity=".95" />
                    <stop offset="62%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />

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
                    id="galleryPremiumShadow"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="180%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="7"
                      stdDeviation="4"
                      floodColor="#000"
                      floodOpacity=".95"
                    />

                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="2"
                      floodColor="#000"
                      floodOpacity=".7"
                    />
                  </filter>
                </defs>

                <text
                  x="280"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontWeight="700"
                  className="gallery-heading-base"
                >
                  GALLERY
                </text>

                <text
                  x="280"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontWeight="700"
                  className="gallery-heading-inner"
                >
                  GALLERY
                </text>

                <text
                  x="280"
                  y="76"
                  textAnchor="middle"
                  fontSize="76"
                  fontWeight="700"
                  className="gallery-heading-shine"
                >
                  GALLERY
                </text>
              </svg>
            </div>

            <div
              className="
            mx-auto
            mt-6
            flex
            w-44
            items-center
            justify-center
            gap-2
          "
            >
              <span
                className="
              h-px
              flex-1
              bg-gradient-to-r
              from-transparent
              via-white/55
              to-white/15
            "
              />

              <span
                className="
              h-1.5
              w-1.5
              rounded-full
              bg-white
              shadow-[0_0_14px_rgba(255,255,255,.55)]
            "
              />

              <span
                className="
              h-px
              flex-1
              bg-gradient-to-r
              from-white/15
              via-white/55
              to-transparent
            "
              />
            </div>

            <p
              className="
            mx-auto
            mt-4
            max-w-2xl
            font-sans
            text-sm
            text-white/55
            md:text-base
          "
            >
              Explore moments from our tournaments, events, and community
              gatherings.
            </p>
          </div>
        </div>

        {/* =======================================================
        GALLERY STRIP
    ======================================================= */}

        <div
          className="
        relative
        left-1/2
        w-screen
        -translate-x-1/2
        overflow-hidden
      "
        >
          <div
            className="
          pointer-events-none
          absolute
          left-0
          top-0
          z-20
          h-full
          w-24
          bg-gradient-to-r
          from-black
          to-transparent
          md:w-40
        "
          />

          <div
            className="
          pointer-events-none
          absolute
          right-0
          top-0
          z-20
          h-full
          w-24
          bg-gradient-to-l
          from-black
          to-transparent
          md:w-40
        "
          />

          <div
            className="
          flex
          w-max
          animate-galleryScroll
          gap-5
        "
          >
            {[...galleryImages, ...galleryImages].map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="
                gallery-card
                group
                relative
                h-[180px]
                w-[280px]
                flex-shrink-0
                overflow-hidden
                rounded-xl
                border
                border-white/30
                bg-black/80
                p-[2px]
                shadow-[0_0_25px_rgba(255,255,255,.12)]
              "
              >
                <div
                  className="
                  relative
                  h-full
                  w-full
                  overflow-hidden
                  rounded-[10px]
                "
                >
                  <img
                    src={image}
                    alt={`Gallery moment ${
                      (index % galleryImages.length) + 1
                    }`}
                    loading="lazy"
                    decoding="async"
                    className="
                    h-full
                    w-full
                    object-cover
                    brightness-[0.72]
                    contrast-[1.08]
                    saturate-[0.72]
                    transition-all
                    duration-700
                    group-hover:scale-110
                    group-hover:brightness-[0.9]
                  "
                  />

                  <div
                    className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/75
                    via-transparent
                    to-transparent
                  "
                  />

                  <div
                    className="
                    pointer-events-none
                    absolute
                    inset-0
                    translate-x-[-120%]
                    bg-gradient-to-r
                    from-transparent
                    via-white/15
                    to-transparent
                    transition-transform
                    duration-700
                    group-hover:translate-x-[120%]
                  "
                  />

                  <div
                    className="
                    absolute
                    left-3
                    top-3
                    h-5
                    w-5
                    border-l
                    border-t
                    border-white/60
                    opacity-0
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                  "
                  />

                  <div
                    className="
                    absolute
                    bottom-3
                    right-3
                    h-5
                    w-5
                    border-b
                    border-r
                    border-white/60
                    opacity-0
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                  "
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-16" />
      </div>
    </section>
  );
};

export default ScrollSection2;