import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import experienceThumb from "../assets/experience.png";

/* =========================================================
   THREE.JS — CYBER CONSOLE BACKGROUND
   Transparent, fullscreen, section-scoped only.
========================================================= */
const CyberConsoleBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      48,
      mount.clientWidth / Math.max(1, mount.clientHeight),
      0.1,
      100
    );
    camera.position.set(0, 1.2, 13);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const clock = new THREE.Clock();

    /* ---------- materials ---------- */
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x9ea4aa,
      transparent: true,
      opacity: 0.15,
    });

    const brightLineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.42,
    });

    const dimLineMat = new THREE.LineBasicMaterial({
      color: 0x6d747b,
      transparent: true,
      opacity: 0.10,
    });

    /* ---------- floor / perspective grid ---------- */
    const grid = new THREE.Group();

    for (let z = -1; z >= -34; z -= 1.35) {
      const pts = [
        new THREE.Vector3(-25, -4.15, z),
        new THREE.Vector3(25, -4.15, z),
      ];
      grid.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        lineMat
      ));
    }

    for (let x = -24; x <= 24; x += 1.25) {
      const pts = [
        new THREE.Vector3(x, -4.15, 0),
        new THREE.Vector3(x * 1.9, -4.15, -34),
      ];
      grid.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        dimLineMat
      ));
    }

    root.add(grid);

    /* ---------- horizon scan lines ---------- */
    const horizon = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const y = -1.15 + i * 0.42;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-15, y, -8 - i * 1.5),
        new THREE.Vector3(15, y, -8 - i * 1.5),
      ]);
      horizon.add(new THREE.Line(geo, i === 0 ? brightLineMat : lineMat));
    }
    root.add(horizon);

    /* ---------- giant console rings ---------- */
    const rings = new THREE.Group();
    rings.position.set(0, 0.3, -9);

    [3.7, 4.65, 5.7].forEach((radius, index) => {
      const geo = new THREE.RingGeometry(radius, radius + 0.008, 128);
      const mat = new THREE.MeshBasicMaterial({
        color: index === 1 ? 0xffffff : 0x8c9399,
        transparent: true,
        opacity: index === 1 ? 0.16 : 0.075,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2.15;
      rings.add(mesh);
    });

    /* broken arc segments */
    for (let r = 6.4; r <= 8.2; r += 0.9) {
      for (let i = 0; i < 4; i++) {
        const start = i * Math.PI / 2 + 0.13;
        const end = start + 0.72;
        const pts = [];
        for (let a = start; a <= end; a += 0.035) {
          pts.push(new THREE.Vector3(
            Math.cos(a) * r,
            Math.sin(a) * r * 0.42,
            0
          ));
        }
        const arc = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          dimLineMat
        );
        arc.position.z = 0.04;
        rings.add(arc);
      }
    }
    root.add(rings);

    /* ---------- central targeting reticle ---------- */
    const reticle = new THREE.Group();
    reticle.position.set(0, 0.55, -5.5);

    const circle = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 97 }, (_, i) => {
          const a = (i / 96) * Math.PI * 2;
          return new THREE.Vector3(
            Math.cos(a) * 2.15,
            Math.sin(a) * 2.15,
            0
          );
        })
      ),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.14,
      })
    );
    reticle.add(circle);

    const inner = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 65 }, (_, i) => {
          const a = (i / 64) * Math.PI * 2;
          return new THREE.Vector3(
            Math.cos(a) * 1.15,
            Math.sin(a) * 1.15,
            0
          );
        })
      ),
      brightLineMat
    );
    reticle.add(inner);

    /* tactical ticks */
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const r1 = i % 4 === 0 ? 1.55 : 1.76;
      const r2 = 1.95;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(a) * r1, Math.sin(a) * r1, 0.02),
        new THREE.Vector3(Math.cos(a) * r2, Math.sin(a) * r2, 0.02),
      ]);
      reticle.add(new THREE.Line(geo, i % 4 === 0 ? brightLineMat : lineMat));
    }

    /* center cross */
    reticle.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.62, 0, 0.04),
        new THREE.Vector3(0.62, 0, 0.04),
      ]),
      brightLineMat
    ));
    reticle.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -0.62, 0.04),
        new THREE.Vector3(0, 0.62, 0.04),
      ]),
      brightLineMat
    ));

    root.add(reticle);

    /* ---------- particle field ---------- */
    const count = 900;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = -Math.random() * 30;
      sizes[i] = 0.015 + Math.random() * 0.045;
      speeds[i] = 0.15 + Math.random() * 0.55;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeo.setAttribute(
      "size",
      new THREE.BufferAttribute(sizes, 1)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0xdfe3e6,
      size: 0.035,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    root.add(particles);

    /* ---------- floating data bars ---------- */
    const dataBars = new THREE.Group();
    for (let i = 0; i < 26; i++) {
      const w = 0.15 + Math.random() * 1.2;
      const h = 0.008 + Math.random() * 0.025;
      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 5 === 0 ? 0xffffff : 0x737a80,
        transparent: true,
        opacity: 0.12 + Math.random() * 0.2,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const bar = new THREE.Mesh(geo, mat);
      bar.position.set(
        (Math.random() - 0.5) * 17,
        (Math.random() - 0.5) * 8,
        -2 - Math.random() * 17
      );
      bar.userData.baseX = bar.position.x;
      bar.userData.baseY = bar.position.y;
      bar.userData.speed = 0.25 + Math.random() * 0.7;
      bar.userData.phase = Math.random() * Math.PI * 2;
      dataBars.add(bar);
    }
    root.add(dataBars);

    /* ---------- top HUD rails ---------- */
    const hud = new THREE.Group();
    hud.position.set(0, 4.1, -4);

    [-1, 1].forEach((side) => {
      const x = side * 6.7;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x - side * 2.8, 0, 0),
        new THREE.Vector3(x, 0, 0),
        new THREE.Vector3(x + side * 0.9, -0.55, 0),
      ]);
      hud.add(new THREE.Line(geo, brightLineMat));

      for (let j = 0; j < 6; j++) {
        const xx = x - side * (j * 0.42);
        const tick = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(xx, -0.08, 0.02),
            new THREE.Vector3(xx, -0.24 - (j % 2) * 0.12, 0.02),
          ]),
          lineMat
        );
        hud.add(tick);
      }
    });
    root.add(hud);

    /* ---------- mouse parallax ---------- */
    let mouseX = 0;
    let mouseY = 0;

    const onPointerMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    };

    window.addEventListener("resize", resize);

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      rings.rotation.z = t * 0.025;
      rings.rotation.y = Math.sin(t * 0.22) * 0.045;
      reticle.rotation.z = -t * 0.045;

      horizon.position.y = Math.sin(t * 0.35) * 0.08;

      particles.rotation.y = t * 0.006;
      particles.rotation.x = Math.sin(t * 0.12) * 0.012;

      dataBars.children.forEach((bar) => {
        bar.position.x =
          bar.userData.baseX +
          Math.sin(t * bar.userData.speed + bar.userData.phase) * 0.06;
        bar.position.y =
          bar.userData.baseY +
          Math.sin(t * 0.35 + bar.userData.phase) * 0.05;
      });

      root.rotation.y +=
        ((mouseX * 0.018) - root.rotation.y) * 0.025;
      root.rotation.x +=
        ((-mouseY * 0.012) - root.rotation.x) * 0.025;

      camera.position.x += (mouseX * 0.22 - camera.position.x) * 0.018;
      camera.position.y += (1.2 - mouseY * 0.12 - camera.position.y) * 0.018;
      camera.lookAt(0, 0, -8);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);

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
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{
        background: "#000",
        pointerEvents: "none",
      }}
    />
  );
};

/* =========================================================
   THREE.JS — FULLSCREEN CYBER KATANA SLASH
   Hover / click driven. No circular click effect.
   The slash sweeps across the entire screen while the
   video rectangle remains a protected clear zone.
========================================================= */
const CyberKatanaSlashes = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const slashes = [];
    const MAX_SLASHES = 7;

    const makeLine = (points, opacity = 1) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      return new THREE.Line(geometry, material);
    };

    const pointInside = (x, y, rect) =>
      !!rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    const getSectionRect = () =>
      mount.closest("section")?.getBoundingClientRect() || null;

    const getVideoRect = () =>
      mount.closest("section")
        ?.querySelector(".samurai-video-inner")
        ?.getBoundingClientRect() || null;

    const disposeGroup = (group) => {
      group.traverse((obj) => {
        obj.geometry?.dispose?.();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      scene.remove(group);
    };

    const createSlash = (worldX, worldY) => {
      const group = new THREE.Group();
      group.position.set(worldX, worldY, 0);
      group.rotation.z = -0.55 + (Math.random() - 0.5) * 0.20;
      group.scale.setScalar(0.78 + Math.random() * 0.10);
      scene.add(group);

      const bladePoints = [];
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const x = THREE.MathUtils.lerp(-0.46, 0.46, t);
        const y = Math.sin(t * Math.PI) * 0.055 - 0.018;
        bladePoints.push(new THREE.Vector3(x, y, 0.12));
      }
      const blade = makeLine(bladePoints, 0.95);
      group.add(blade);

      const glints = [];
      [-0.026, 0.026].forEach((offset, index) => {
        const pts = bladePoints.map(
          (p) => new THREE.Vector3(p.x * (index ? 0.94 : 0.98), p.y + offset, 0.08)
        );
        const line = makeLine(pts, index ? 0.30 : 0.42);
        group.add(line);
        glints.push(line);
      });

      const fragments = [];
      for (let i = 0; i < 18; i++) {
        const px = (Math.random() - 0.5) * 0.72;
        const py = (Math.random() - 0.5) * 0.13;
        const len = 0.018 + Math.random() * 0.055;
        const frag = makeLine(
          [
            new THREE.Vector3(px, py, 0.16),
            new THREE.Vector3(px + len, py + (Math.random() - 0.5) * 0.025, 0.16),
          ],
          0.30 + Math.random() * 0.30
        );
        frag.userData.vx = (Math.random() - 0.5) * 0.004;
        frag.userData.vy = (Math.random() - 0.5) * 0.004;
        group.add(frag);
        fragments.push(frag);
      }

      const sparks = [];
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2;
        const len = 0.035 + Math.random() * 0.075;
        const spark = makeLine(
          [
            new THREE.Vector3(0, 0, 0.2),
            new THREE.Vector3(Math.cos(a) * len, Math.sin(a) * len, 0.2),
          ],
          0.55
        );
        spark.userData.vx = Math.cos(a) * (0.002 + Math.random() * 0.004);
        spark.userData.vy = Math.sin(a) * (0.002 + Math.random() * 0.004);
        group.add(spark);
        sparks.push(spark);
      }

      slashes.push({
        group,
        blade,
        glints,
        fragments,
        sparks,
        life: 1,
        age: 0,
      });

      while (slashes.length > MAX_SLASHES) {
        const old = slashes.shift();
        disposeGroup(old.group);
      }
    };

    const onClick = (event) => {
      const sectionRect = getSectionRect();
      if (!sectionRect || !pointInside(event.clientX, event.clientY, sectionRect)) return;

      const videoRect = getVideoRect();
      if (pointInside(event.clientX, event.clientY, videoRect)) return;

      const nx = ((event.clientX - sectionRect.left) / Math.max(1, sectionRect.width)) * 2 - 1;
      const ny = -(((event.clientY - sectionRect.top) / Math.max(1, sectionRect.height)) * 2 - 1);
      const aspect = sectionRect.width / Math.max(1, sectionRect.height);

      createSlash(nx * aspect, ny);
    };

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;

      const aspect = w / h;
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("click", onClick);

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);

      for (let i = slashes.length - 1; i >= 0; i--) {
        const slash = slashes[i];
        slash.age += 0.045;
        slash.life = Math.max(0, 1 - slash.age);

        const attack = Math.min(1, slash.age / 0.11);
        const fade = Math.pow(slash.life, 1.7);
        const intensity = attack * fade;

        slash.blade.material.opacity = 0.92 * intensity;
        slash.glints.forEach((line, index) => {
          line.material.opacity = (index === 0 ? 0.34 : 0.22) * intensity;
        });

        slash.fragments.forEach((frag) => {
          frag.position.x += frag.userData.vx;
          frag.position.y += frag.userData.vy;
          frag.material.opacity *= 0.94;
        });

        slash.sparks.forEach((spark) => {
          spark.position.x += spark.userData.vx;
          spark.position.y += spark.userData.vy;
          spark.material.opacity = 0.45 * intensity;
        });

        slash.group.position.x += 0.0028 * intensity;
        slash.group.scale.x = 0.82 + attack * 0.22;
        slash.group.scale.y = 0.82 + attack * 0.06;

        if (slash.life <= 0.001) {
          disposeGroup(slash.group);
          slashes.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onClick);
      [...slashes].forEach((slash) => disposeGroup(slash.group));
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 z-[3] h-full w-full overflow-hidden"
      aria-hidden="true"
    />
  );
};

const ScrollSection4 = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(false);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setVisible(true);
            });
          });
        } else {
          setVisible(false);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-black text-white isolate"
    >
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

        .experience-page,
        .experience-page *,
        .experience-page svg text {
          font-family: 'The Last Shuriken', sans-serif !important;
        }

        /* =========================================================
           HERO-STYLE HEADING — SAME METALLIC TREATMENT
        ========================================================= */

        .shining-heading-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          line-height: 1;
        }

        .shining-heading-svg {
          display: block;
          width: min(760px, 92vw);
          height: auto;
          overflow: visible;
          pointer-events: none;
        }

        /* =========================================================
           SAMURAI VIDEO FRAME
        ========================================================= */

        .samurai-video-frame {
          position: relative;
          width: min(1040px, 88vw);
          aspect-ratio: 16 / 9;
          isolation: isolate;
          overflow: visible;
        }

        .samurai-video-inner {
          position: absolute;
          inset: 10px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(255,255,255,.24);
          box-shadow:
            0 0 0 1px rgba(255,255,255,.04),
            0 14px 45px rgba(0,0,0,.72),
            0 0 55px rgba(255,255,255,.045);
        }

        .samurai-video-inner::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,.07),
              transparent 12%,
              transparent 88%,
              rgba(255,255,255,.07)
            ),
            linear-gradient(
              180deg,
              rgba(255,255,255,.055),
              transparent 14%,
              transparent 86%,
              rgba(255,255,255,.08)
            );
        }

        .samurai-video-inner::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          border: 1px solid rgba(255,255,255,.06);
          box-shadow: inset 0 0 35px rgba(0,0,0,.65);
        }

        .samurai-corner {
          position: absolute;
          z-index: 10;
          width: 42px;
          height: 42px;
          pointer-events: none;
        }

        .samurai-corner.tl {
          left: 0;
          top: 0;
          border-left: 2px solid rgba(255,255,255,.78);
          border-top: 2px solid rgba(255,255,255,.78);
        }

        .samurai-corner.tr {
          right: 0;
          top: 0;
          border-right: 2px solid rgba(255,255,255,.78);
          border-top: 2px solid rgba(255,255,255,.78);
        }

        .samurai-corner.bl {
          left: 0;
          bottom: 0;
          border-left: 2px solid rgba(255,255,255,.52);
          border-bottom: 2px solid rgba(255,255,255,.52);
        }

        .samurai-corner.br {
          right: 0;
          bottom: 0;
          border-right: 2px solid rgba(255,255,255,.52);
          border-bottom: 2px solid rgba(255,255,255,.52);
        }

        .samurai-edge {
          position: absolute;
          pointer-events: none;
          z-index: 9;
          left: 11%;
          right: 11%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.55),
            transparent
          );
        }

        .samurai-edge.top {
          top: 0;
        }

        .samurai-edge.bottom {
          bottom: 0;
        }

        .samurai-label {
          font-family: 'The Last Shuriken', sans-serif;
          letter-spacing: .30em;
          text-shadow:
            0 2px 7px rgba(0,0,0,.8),
            0 0 10px rgba(255,255,255,.08);
        }

        @media (max-width: 640px) {
          .samurai-video-frame {
            width: 92vw;
          }

          .samurai-video-inner {
            inset: 7px;
          }

          .samurai-corner {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>

      <div className="experience-page absolute inset-0 z-0">
        <CyberConsoleBackground />
        <CyberKatanaSlashes />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.055),transparent_38%),linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.72))]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="experience-page relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 py-20 sm:px-8 md:px-12">

        {/* THE EXPERIENCE — SAME HEADING AS AMENDED FILE 1 */}
        <div
          className={`
            shining-heading-wrap
            transform-gpu
            transition-all
            duration-[1000ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${visible
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-16 scale-95 opacity-0"}
          `}
        >
          <svg
            className="shining-heading-svg"
            style={{
              width: "min(760px, 92vw)",
              height: "auto",
              overflow: "visible",
            }}
            viewBox="0 0 760 100"
            preserveAspectRatio="xMidYMid meet"
            role="heading"
            aria-level="2"
            aria-label="THE EXPERIENCE"
          >
            <defs>
              {/* FILE 1 STYLE — METALLIC GRADIENT */}
              <linearGradient
                id="experienceFile1Metal"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f2f2f2" />
                <stop offset="15%" stopColor="#d9d9d9" />
                <stop offset="32%" stopColor="#a7a7a7" />
                <stop offset="48%" stopColor="#4d4d4d" />
                <stop offset="62%" stopColor="#303030" />
                <stop offset="74%" stopColor="#777777" />
                <stop offset="88%" stopColor="#c3c3c3" />
                <stop offset="100%" stopColor="#eeeeee" />
              </linearGradient>

              {/* FILE 1 STYLE — INNER METAL */}
              <linearGradient
                id="experienceFile1Inner"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#eeeeee" />
                <stop offset="38%" stopColor="#c8c8c8" />
                <stop offset="58%" stopColor="#555555" />
                <stop offset="78%" stopColor="#a0a0a0" />
                <stop offset="100%" stopColor="#e5e5e5" />
              </linearGradient>

              {/* FILE 1 STYLE — MOVING SHINE */}
              <linearGradient
                id="experienceFile1Shine"
                gradientUnits="userSpaceOnUse"
                x1="-300"
                y1="0"
                x2="-60"
                y2="0"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="38%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.82" />
                <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />

                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  from="0 0"
                  to="1500 0"
                  dur="3.8s"
                  repeatCount="indefinite"
                />
              </linearGradient>

              {/* FILE 1 STYLE — CLEAN DEEP SHADOW */}
              <filter
                id="experienceFile1Shadow"
                x="-30%"
                y="-30%"
                width="160%"
                height="160%"
              >
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="5"
                  floodColor="#000000"
                  floodOpacity="0.90"
                />
                <feDropShadow
                  dx="0"
                  dy="7"
                  stdDeviation="9"
                  floodColor="#000000"
                  floodOpacity="0.70"
                />
              </filter>
            </defs>

            {/* BASE METALLIC TEXT */}
            <text
              x="380"
              y="72"
              textAnchor="middle"
              fontFamily="The Last Shuriken, Arial, sans-serif"
              fontSize="76"
              fontWeight="700"
              letterSpacing="0.015em"
              fill="url(#experienceFile1Metal)"
              filter="url(#experienceFile1Shadow)"
            >
              THE EXPERIENCE
            </text>

            {/* INNER METAL TEXT */}
            <text
              x="380"
              y="72"
              textAnchor="middle"
              fontFamily="The Last Shuriken, Arial, sans-serif"
              fontSize="76"
              fontWeight="700"
              letterSpacing="0.015em"
              fill="url(#experienceFile1Inner)"
              opacity="0.30"
              pointerEvents="none"
              aria-hidden="true"
            >
              THE EXPERIENCE
            </text>

            {/* MOVING WHITE SHINE */}
            <text
              x="380"
              y="72"
              textAnchor="middle"
              fontFamily="The Last Shuriken, Arial, sans-serif"
              fontSize="76"
              fontWeight="700"
              letterSpacing="0.015em"
              fill="url(#experienceFile1Shine)"
              opacity="0.82"
              style={{ mixBlendMode: "screen" }}
              pointerEvents="none"
              aria-hidden="true"
            >
              THE EXPERIENCE
            </text>
          </svg>
        </div>

        {/* SAMURAI DIVIDER */}
        <div
          className={`
            mt-5 mb-8 flex items-center justify-center gap-3
            transition-all duration-[900ms] delay-[180ms]
            ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}
          `}
        >
          <div className="h-px w-14 bg-gradient-to-r from-transparent via-white to-white/40 sm:w-24 md:w-32" />
          <div className="h-1.5 w-1.5 rotate-45 bg-white shadow-[0_0_8px_rgba(255,255,255,.9)]" />
          <div className="h-px w-14 bg-gradient-to-l from-transparent via-white to-white/40 sm:w-24 md:w-32" />
        </div>

        {/* YOUTUBE — NORMAL SIZE */}
        <div
          className={`
            samurai-video-frame
            transform-gpu
            transition-all
            duration-[1000ms]
            delay-[300ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${visible
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-12 scale-[0.97] opacity-0"}
          `}
        >
          <span className="samurai-corner tl" />
          <span className="samurai-corner tr" />
          <span className="samurai-corner bl" />
          <span className="samurai-corner br" />

          <span className="samurai-edge top" />
          <span className="samurai-edge bottom" />

          <div className="samurai-video-inner">
            {!videoStarted ? (
              <div className="absolute inset-0 z-[4] flex items-center justify-center bg-black">
                {/* EXPERIENCE THUMBNAIL */}
                <img
                  src={experienceThumb}
                  alt="The Experience Thumbnail"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/35" />
                <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.055),transparent_34%)]" />

                <div className="relative flex flex-col items-center justify-center">
                  <div className="mb-7 flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.9)] animate-pulse" />
                    <span className="text-[8px] uppercase tracking-[0.48em] text-white/45">
                      SYSTEM READY
                    </span>
                    <span className="h-px w-16 bg-gradient-to-r from-white/50 to-transparent" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setVideoStarted(true)}
                    className="group relative flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/[0.035] transition-all duration-300 hover:scale-110 hover:border-white/75 hover:bg-white/[0.08] focus:outline-none"
                    aria-label="Start The Experience"
                  >
                    <span className="absolute inset-2 rounded-full border border-white/10 transition-all duration-500 group-hover:rotate-90 group-hover:border-white/30" />
                    <span className="absolute inset-0 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,.04),0_0_35px_rgba(255,255,255,.08)] group-hover:shadow-[0_0_0_1px_rgba(255,255,255,.12),0_0_55px_rgba(255,255,255,.16)]" />
                    <span className="ml-1 h-0 w-0 border-y-[9px] border-y-transparent border-l-[14px] border-l-white transition-transform duration-300 group-hover:scale-110" />
                  </button>

                  <div className="mt-7 text-center">
                    <div className="text-[10px] uppercase tracking-[0.38em] text-white/75">
                      START
                    </div>
                    <div className="mt-2 text-[7px] uppercase tracking-[0.30em] text-white/25">
                      INITIALIZE EXPERIENCE
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute left-5 top-5 h-8 w-8 border-l border-t border-white/20" />
                <div className="pointer-events-none absolute right-5 top-5 h-8 w-8 border-r border-t border-white/20" />
                <div className="pointer-events-none absolute bottom-5 left-5 h-8 w-8 border-b border-l border-white/20" />
                <div className="pointer-events-none absolute bottom-5 right-5 h-8 w-8 border-b border-r border-white/20" />

                <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-[6px] uppercase tracking-[0.45em] text-white/20">
                  CONNECTION // STANDBY
                </div>
              </div>
            ) : (
              <iframe
                className="absolute inset-0 z-[1] h-full w-full"
                src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1"
                title="The Experience"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        </div>

        <p
          className={`
            samurai-label
            mt-7
            text-[9px]
            uppercase
            text-white/35
            transition-all
            duration-700
            delay-[450ms]
            ${visible ? "opacity-100" : "opacity-0"}
          `}
        >
          ENTER THE EXPERIENCE
        </p>
      </div>

    </section>
  );
};

export default ScrollSection4;