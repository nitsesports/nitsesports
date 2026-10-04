import * as THREE from "three";

// =============================================================
// MOBILE-ONLY PORTAL + STARFIELD
// - No additive blending (normal alpha only) -> no white glare/flash
// - ~10 draw calls total (9 portal layers + 1 starfield)
// - Rings face the camera (visible without mouse tilt) + idle sway + touch tilt
// - Persistent starfield with scroll fly-through
// - Canvas never resizes on iOS URL-bar toggle
// =============================================================

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function initMobilePortal(container) {
  const canvas = document.createElement("canvas");
  canvas.className = "hero-cyber-portal-canvas";
  canvas.style.opacity = "0";
  canvas.style.transition = "opacity 700ms ease";
  container.appendChild(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      precision: "highp",
    });
  } catch (e) {
    canvas.remove();
    return () => {};
  }
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
  camera.position.z = 9;

  let pr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;

  const starUni = {
    uTime: { value: 0 },
    uFlow: { value: 0 },
    uPR: { value: pr },
    uD: { value: 80 },
  };

  const fit = (force) => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (!force && Math.abs(w - W) < 2 && Math.abs(h - H) < 2) return;
    W = w;
    H = h;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    starUni.uPR.value = pr;
  };
  fit(true);

  const geoms = [];
  const mats = [];

  // -------------------------------------------------------------
  // STARFIELD (single Points draw call)
  // position = (x, y, d0): d0 is initial depth, wrapped in shader
  // -------------------------------------------------------------
  const STAR_N = 850;
  {
    const pos = new Float32Array(STAR_N * 3);
    const seed = new Float32Array(STAR_N);
    const tanH = Math.tan((45 * Math.PI) / 360);
    for (let i = 0; i < STAR_N; i++) {
      const d0 = Math.random() * 80;
      pos[i * 3] = (Math.random() * 2.2 - 1.1) * d0 * tanH * 0.65;
      pos[i * 3 + 1] = (Math.random() * 2.2 - 1.1) * d0 * tanH;
      pos[i * 3 + 2] = d0;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geoms.push(g);

    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: starUni,
      vertexShader: `
        uniform float uTime;
        uniform float uFlow;
        uniform float uPR;
        uniform float uD;
        attribute float aSeed;
        varying float vA;
        void main() {
          float d = mod(position.z - uFlow, uD);
          vec4 mv = vec4(position.xy, -d, 1.0);
          gl_Position = projectionMatrix * mv;
          float sz = 0.6 + aSeed * 1.2;
          float s = sz * uPR * 30.0 / max(d, 0.5);
          gl_PointSize = clamp(s, 1.3 * uPR, 6.5 * uPR);
          float tw = 0.75 + 0.25 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 40.0);
          float bright = 0.35 + 0.65 * aSeed;
          vA = bright * tw * smoothstep(0.6, 5.0, d) * (1.0 - smoothstep(55.0, 78.0, d));
        }
      `,
      fragmentShader: `
        varying float vA;
        void main() {
          float r = length(gl_PointCoord - 0.5) * 2.0;
          float a = 1.0 - smoothstep(0.35, 1.0, r);
          a *= a * vA;
          if (a < 0.01) discard;
          gl_FragColor = vec4(0.92, 0.95, 1.0, a);
        }
      `,
    });
    mats.push(m);
    const stars = new THREE.Points(g, m);
    stars.frustumCulled = false;
    stars.renderOrder = -10;
    scene.add(stars);
  }

  // -------------------------------------------------------------
  // PORTAL (merged layers, one shared material)
  // -------------------------------------------------------------
  const portalMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    uniforms: { uFade: { value: 1 } },
    vertexShader: `
      attribute float aAlpha;
      varying float vA;
      void main() {
        vA = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uFade;
      varying float vA;
      void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, vA * uFade);
      }
    `,
  });
  mats.push(portalMat);

  const portal = new THREE.Group();
  portal.scale.setScalar(0.52);
  scene.add(portal);

  const tri = (b, p0, p1, p2, al) => {
    b.p.push(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
    b.a.push(al, al, al);
  };
  const quad = (b, p0, p1, p2, p3, al) => {
    tri(b, p0, p1, p2, al);
    tri(b, p0, p2, p3, al);
  };
  const ring = (b, r0, r1, z, al, seg, st = 0, en = TAU) => {
    for (let i = 0; i < seg; i++) {
      const a0 = st + ((en - st) * i) / seg;
      const a1 = st + ((en - st) * (i + 1)) / seg;
      const c0 = Math.cos(a0), n0 = Math.sin(a0);
      const c1 = Math.cos(a1), n1 = Math.sin(a1);
      quad(
        b,
        [r0 * c0, r0 * n0, z],
        [r1 * c0, r1 * n0, z],
        [r1 * c1, r1 * n1, z],
        [r0 * c1, r0 * n1, z],
        al
      );
    }
  };
  const disc = (b, r, z, al, seg) => {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * TAU;
      const a1 = ((i + 1) / seg) * TAU;
      tri(b, [0, 0, z], [r * Math.cos(a0), r * Math.sin(a0), z], [r * Math.cos(a1), r * Math.sin(a1), z], al);
    }
  };
  // bar centred at radius rc, angle ang. len = radial size, wid = tangential size
  const bar = (b, ang, rc, len, wid, z, al) => {
    const c = Math.cos(ang), s = Math.sin(ang);
    const cx = c * rc, cy = s * rc;
    const hx = (c * len) / 2, hy = (s * len) / 2;
    const tx = (-s * wid) / 2, ty = (c * wid) / 2;
    quad(
      b,
      [cx - hx - tx, cy - hy - ty, z],
      [cx + hx - tx, cy + hy - ty, z],
      [cx + hx + tx, cy + hy + ty, z],
      [cx - hx + tx, cy - hy + ty, z],
      al
    );
  };

  const layers = [];
  const build = (fn, speed = 0, order = 1) => {
    const b = { p: [], a: [] };
    fn(b);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(b.p, 3));
    g.setAttribute("aAlpha", new THREE.Float32BufferAttribute(b.a, 1));
    geoms.push(g);
    const m = new THREE.Mesh(g, portalMat);
    m.frustumCulled = false;
    m.renderOrder = order;
    portal.add(m);
    if (speed) layers.push({ m, speed });
    return m;
  };

  // static concentric rings (outer + inner tunnel + reactor)
  build((b) => {
    [
      [3.25, 0.04, 0.8, 0],
      [3.05, 0.018, 0.4, -0.04],
      [2.82, 0.05, 0.95, -0.08],
      [2.62, 0.022, 0.5, -0.12],
      [2.42, 0.032, 0.7, -0.16],
    ].forEach(([r, w, al, z]) => ring(b, r, r + w, z, al, 96));

    for (let i = 0; i < 5; i++) {
      const r = 2.18 - i * 0.38;
      ring(b, r, r + 0.016, -0.3 - i * 0.22, 0.62 - i * 0.06, 80);
    }

    [
      [1.58, 0.014, 0.13], [1.46, 0.028, 0.22], [1.3, 0.01, 0.34], [1.14, 0.022, 0.2],
      [0.98, 0.012, 0.42], [0.82, 0.024, 0.24], [0.66, 0.014, 0.48], [0.52, 0.022, 0.34],
    ].forEach(([r, w, o], i) => {
      ring(b, r, r + Math.max(w, 0.016), -1.18 - i * 0.032, Math.min(1, o * 1.5), 72);
    });
  });

  // pulsing core
  const core = build((b) => {
    ring(b, 0.49, 0.525, -1.44, 0.5, 48);
    ring(b, 0.31, 0.34, -1.56, 0.4, 40);
    disc(b, 0.49, -1.5, 0.08, 48);
    ring(b, 0.1, 0.2, -1.67, 0.12, 32);
    disc(b, 0.085, -1.7, 0.8, 24);
  }, 0, 2);

  // rotating layers
  build((b) => {
    for (let i = 0; i < 48; i++) bar(b, (i / 48) * TAU, 2.72, 0.26, 0.04, -0.05, i % 3 === 0 ? 1 : 0.45);
  }, 0.045);

  build((b) => {
    for (let i = 0; i < 36; i++) bar(b, (i / 36) * TAU, 2.325, 1.75, 0.014, -0.12, i % 4 === 0 ? 0.6 : 0.2);
  }, -0.018);

  build((b) => {
    for (let i = 0; i < 24; i++) {
      const w = i % 2 === 0 ? 0.19 : 0.11;
      const h = i % 3 === 0 ? 0.055 : 0.032;
      bar(b, (i / 24) * TAU, 1.38, h, w, -1.16, i % 4 === 0 ? 0.6 : 0.24);
    }
  }, 0.03);

  build((b) => {
    for (let i = 0; i < 20; i++) bar(b, (i / 20) * TAU, 0.91, 0.16, 0.026, -1.14, i % 5 === 0 ? 0.7 : 0.22);
  }, -0.05);

  build((b) => {
    for (let i = 0; i < 40; i++) {
      const [r0, r1] = i % 2 === 0 ? [0.56, 1.1] : [0.7, 1.25];
      bar(b, (i / 40) * TAU, (r0 + r1) / 2, r1 - r0, 0.012, -1.22, i % 5 === 0 ? 0.6 : 0.16);
    }
  }, -0.02);

  build((b) => {
    [0, Math.PI / 2].forEach((a) => bar(b, a, 0, 1.56, 0.01, -1.28, 0.22));
    [Math.PI / 4, -Math.PI / 4].forEach((a) => bar(b, a, 0, 1.16, 0.01, -1.28, 0.14));
  }, 0.014);

  build((b) => {
    for (let i = 0; i < 8; i++) {
      const base = (i / 8) * TAU;
      ring(b, 0.38, 0.405, -1.38, 0.55, 8, base + 0.12, base + 0.46);
    }
  }, -0.075);

  // -------------------------------------------------------------
  // INPUT (touch tilt only, passive)
  // -------------------------------------------------------------
  let touchX = 0;
  let touchY = 0;
  const onTouch = (e) => {
    const t = e.touches && e.touches[0];
    if (!t) return;
    touchX = (t.clientX / window.innerWidth - 0.5) * 2;
    touchY = -((t.clientY / window.innerHeight - 0.5) * 2);
  };
  const onTouchEnd = () => {
    touchX = 0;
    touchY = 0;
  };
  window.addEventListener("touchstart", onTouch, { passive: true });
  window.addEventListener("touchmove", onTouch, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("touchcancel", onTouchEnd, { passive: true });

  let resizeRaf = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => fit(false));
  };
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize);

  // WebGL context loss (iOS)
  let lost = false;
  const onLost = (e) => {
    e.preventDefault();
    lost = true;
  };
  const onRestored = () => {
    lost = false;
    fit(true);
  };
  canvas.addEventListener("webglcontextlost", onLost, false);
  canvas.addEventListener("webglcontextrestored", onRestored, false);

  let hidden = document.hidden;
  let last = performance.now();
  const onVis = () => {
    hidden = document.hidden;
    last = performance.now();
  };
  document.addEventListener("visibilitychange", onVis);

  // -------------------------------------------------------------
  // LOOP
  // -------------------------------------------------------------
  let raf = 0;
  let t = 0;
  let fade = 1;
  let scrollCur = 0;
  let tx = 0;
  let ty = 0;
  let ema = 1 / 60;
  let slow = 0;
  let shown = false;

  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    if (hidden || lost) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (dt <= 0) return;
    t += dt;

    // adaptive resolution (only ever goes down)
    ema += (dt - ema) * 0.05;
    if (ema > 0.022 && pr > 1) {
      if (++slow > 60) {
        slow = 0;
        pr = Math.max(1, pr - 0.25);
        fit(true);
        ema = 1 / 60;
      }
    } else {
      slow = 0;
    }

    const sy = Math.max(window.scrollY || 0, 0);

    // portal fade on scroll (same curve as desktop)
    const fs = H * 0.05;
    const fe = H * 0.85;
    const p = clamp((sy - fs) / (fe - fs), 0, 1);
    const target = 1 - p * p * (3 - 2 * p);
    fade += (target - fade) * (1 - Math.exp(-12 * dt));
    if (target === 0 && fade < 0.004) fade = 0;
    else if (target === 1 && fade > 0.996) fade = 1;
    portalMat.uniforms.uFade.value = fade;
    portal.visible = fade > 0;

    // scroll depth
    const tgt = clamp((sy / H) * 3.5, 0, 4.2);
    scrollCur += (tgt - scrollCur) * (1 - Math.exp(-9 * dt));
    camera.position.z = 9 - scrollCur * 0.75;

    // tilt: idle sway + touch
    const k = 1 - Math.exp(-6 * dt);
    tx += (touchX - tx) * k;
    ty += (touchY - ty) * k;
    portal.rotation.y = Math.sin(t * 0.27) * 0.14 + tx * 0.22;
    portal.rotation.x = Math.sin(t * 0.35 + 1.3) * 0.1 + ty * 0.16;

    if (portal.visible) {
      for (let i = 0; i < layers.length; i++) layers[i].m.rotation.z = t * layers[i].speed;
      core.scale.setScalar(1 + Math.sin(t * 2.4) * 0.04);
    }

    starUni.uTime.value = t;
    starUni.uFlow.value = t * 0.7 + scrollCur * 6;

    renderer.render(scene, camera);

    if (!shown) {
      shown = true;
      requestAnimationFrame(() => {
        canvas.style.opacity = "1";
      });
    }
  };
  raf = requestAnimationFrame(loop);

  // -------------------------------------------------------------
  // CLEANUP
  // -------------------------------------------------------------
  return () => {
    cancelAnimationFrame(raf);
    cancelAnimationFrame(resizeRaf);
    window.removeEventListener("touchstart", onTouch);
    window.removeEventListener("touchmove", onTouch);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", onTouchEnd);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    document.removeEventListener("visibilitychange", onVis);
    canvas.removeEventListener("webglcontextlost", onLost, false);
    canvas.removeEventListener("webglcontextrestored", onRestored, false);
    geoms.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    renderer.dispose();
    if (canvas.parentNode === container) container.removeChild(canvas);
  };
}