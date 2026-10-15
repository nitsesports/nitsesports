import React, { useEffect, useRef, useState } from "react";

import * as THREE from "three";

import bgmUrl from "../assets/bgm.mp4";

import artworkUrl from "../assets/BattleblazeHeroArtwork.png";

import jetUrl from "../assets/jet.png";




import island3Url from "../assets/island3.png";



import island6Url from "../assets/island6.png";

import logoUrl from "../assets/logoo2.png";

import overviewPosterUrl from "../assets/bgp.png";
import feUrl from "../assets/fe.png";
import ssUrl from "../assets/ss.png";
import coordinator1Photo from "../assets/Members/member1.png";
import moduleCoHeadPhoto from "../assets/Members/member2.png";
import moduleHeadPhoto from "../assets/Members/member3.png";
import coordinator2Photo from "../assets/Members/member4.png";

const EVENTS = [
  { id: "FIFA", color: "#45ffb0", x: 9.5 },
  { id: "VALORANT", color: "#8b5cf6", x: 22.5 },
  { id: "BGMI", color: "#ffb347", x: 35.5 },
  { id: "FF", color: "#ff6b35", x: 48.5 },
  { id: "PS5 RUSH", color: "#5c8dff", x: 61.5 },
  { id: "VRXPERIENCE", color: "#bf7bff", x: 74.5 },
  { id: "RC", color: "#00eaff", x: 87.5 },
];

const randomBetween = (min, max) => min + Math.random() * (max - min);

export default function BattleblazeHero({ onSelectEvent }) {

  const sceneMount = useRef(null);

  const audioRef = useRef(null);

  const rootRef = useRef(null);

  const cursorRef = useRef(null);

  const ringRef = useRef(null);

  const target = useRef({ x: 0, y: 0 });

  const current = useRef({ x: 0, y: 0 });

  const [activeEvent, setActiveEvent] = useState("FIFA");

  const [hoverColor, setHoverColor] = useState("#9b7bff");

  const [hovered, setHovered] = useState(false);

  const [muted, setMuted] = useState(false);

  useEffect(() => {

    const audio = audioRef.current;

    if (!audio) return;

    audio.loop = true;

    audio.volume = 1;

    audio.muted = muted;

    if (muted) {

      audio.pause();

      return;

    }

    const tryPlay = () => {

      const currentAudio = audioRef.current;

      if (!currentAudio || muted) return;

      currentAudio.loop = true;

      currentAudio.volume = 1;

      currentAudio.muted = false;

      const playback = currentAudio.play();

      if (playback && typeof playback.catch === "function") playback.catch(() => {});

    };

    tryPlay();

    window.addEventListener("pointerdown", tryPlay, { once: true });

    window.addEventListener("keydown", tryPlay, { once: true });

    return () => {

      window.removeEventListener("pointerdown", tryPlay);

      window.removeEventListener("keydown", tryPlay);

    };

  }, [muted]);

  useEffect(() => {

    const host = sceneMount.current;

    if (!host) return undefined;

    let disposed = false;

    let raf = 0;

    let previousTime = 0;

    let shipTexture = null;

    const spaceshipFleet = [];


    const floatingIslands = [];

    const shootingStars = [];

    const disposableTextures = [];

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1200);

    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({

      alpha: true,

      antialias: true,

      powerPreference: "low-power",

    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));

    renderer.setClearColor(0x000000, 0);

    host.appendChild(renderer.domElement);

    // ─────────────── ENHANCED DEEP SPACE STARFIELD ───────────────

    const starCount = 950;

    const positions = new Float32Array(starCount * 3);

    const colors = new Float32Array(starCount * 3);

    const starPalette = [

      new THREE.Color("#8b5cf6"),

      new THREE.Color("#00eaff"),

      new THREE.Color("#a88bff"),

      new THREE.Color("#ffffff"),

      new THREE.Color("#00eaff"),

    ];

    for (let i = 0; i < starCount; i += 1) {

      positions[i * 3] = (Math.random() - 0.5) * 260;

      positions[i * 3 + 1] = (Math.random() - 0.5) * 150;

      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const color = starPalette[Math.floor(Math.random() * starPalette.length)];

      colors[i * 3] = color.r;

      colors[i * 3 + 1] = color.g;

      colors[i * 3 + 2] = color.b;

    }

    const starGeometry = new THREE.BufferGeometry();

    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({

      size: 0.72,

      vertexColors: true,

      transparent: true,

      opacity: 0.45,

      depthWrite: false,

      blending: THREE.AdditiveBlending,

    });

    const stars = new THREE.Points(starGeometry, starMaterial);

    scene.add(stars);

    const getVisibleWidth = () =>

      2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;

    const getVisibleHeight = () =>

      2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

    // ─────────────── DYNAMIC SHOOTING STARS (METEOR SYSTEM) ───────────────

    const createMeteorTexture = () => {

      const canvas = document.createElement("canvas");

      canvas.width = 256;

      canvas.height = 16;

      const ctx = canvas.getContext("2d");

      if (!ctx) return null;

      const grad = ctx.createLinearGradient(0, 8, 256, 8);

      grad.addColorStop(0, "rgba(255, 255, 255, 0)");

      grad.addColorStop(0.45, "rgba(0, 234, 255, 0.45)");

      grad.addColorStop(0.85, "rgba(139, 92, 246, 0.9)");

      grad.addColorStop(1, "rgba(255, 255, 255, 1)");

      ctx.fillStyle = grad;

      ctx.beginPath();

      ctx.moveTo(0, 7.5);

      ctx.lineTo(240, 4);

      ctx.arc(248, 8, 4, -Math.PI / 2, Math.PI / 2);

      ctx.lineTo(240, 12);

      ctx.closePath();

      ctx.fill();

      const radGrad = ctx.createRadialGradient(248, 8, 0, 248, 8, 8);

      radGrad.addColorStop(0, "rgba(255, 255, 255, 1)");

      radGrad.addColorStop(0.4, "rgba(0, 234, 255, 0.85)");

      radGrad.addColorStop(1, "rgba(0, 234, 255, 0)");

      ctx.fillStyle = radGrad;

      ctx.beginPath();

      ctx.arc(248, 8, 8, 0, Math.PI * 2);

      ctx.fill();

      const tex = new THREE.CanvasTexture(canvas);

      tex.colorSpace = THREE.SRGBColorSpace;

      disposableTextures.push(tex);

      return tex;

    };

    const meteorTexture = createMeteorTexture();

    const meteorGeo = new THREE.PlaneGeometry(1, 1);

    const spawnMeteor = (meteor) => {

      const visibleW = getVisibleWidth();

      const visibleH = getVisibleHeight();

      const shootLeft = Math.random() < 0.65;

      const angleDeg = shootLeft ? randomBetween(-145, -165) : randomBetween(-15, -35);

      const angle = THREE.MathUtils.degToRad(angleDeg);

      const speed = randomBetween(140, 240);

      meteor.vx = Math.cos(angle) * speed;

      meteor.vy = Math.sin(angle) * speed;

      const startX = shootLeft

        ? randomBetween(-visibleW * 0.1, visibleW * 0.55)

        : randomBetween(-visibleW * 0.55, visibleW * 0.1);

      const startY = randomBetween(visibleH * 0.2, visibleH * 0.58);

      const z = randomBetween(8, 22);

      meteor.mesh.position.set(startX, startY, z);

      meteor.mesh.rotation.z = angle;

      const len = randomBetween(16, 28);

      const thickness = randomBetween(0.85, 1.4);

      meteor.mesh.scale.set(len, thickness, 1);

      meteor.life = 0;

      meteor.maxLife = randomBetween(0.5, 0.85);

      meteor.active = true;

      meteor.mesh.visible = true;

    };

    for (let i = 0; i < 3; i += 1) {

      const material = new THREE.MeshBasicMaterial({

        map: meteorTexture,

        transparent: true,

        opacity: 0,

        blending: THREE.AdditiveBlending,

        depthWrite: false,

        side: THREE.DoubleSide,

      });

      const mesh = new THREE.Mesh(meteorGeo, material);

      mesh.visible = false;

      scene.add(mesh);

      shootingStars.push({

        mesh,

        material,

        active: false,

        cooldown: randomBetween(0.8, 3.5) * (i + 1),

        life: 0,

        maxLife: 1,

        vx: 0,

        vy: 0,

      });

    }

    // ─────────────── IMAGE-BASED SPACESHIPS ───────────────

    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(

      jetUrl,

      (texture) => {

        if (disposed) {

          texture.dispose();

          return;

        }

        shipTexture = texture;

        texture.colorSpace = THREE.SRGBColorSpace;

        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);

        const aspect =

          texture.image?.width && texture.image?.height

            ? texture.image.width / texture.image.height

            : 2.5;

        const shipCount = 2;

        const halfWidth = getVisibleWidth() / 2;

        const halfHeight = getVisibleHeight() / 2;

        for (let i = 0; i < shipCount; i += 1) {

          const direction = Math.random() < 0.5 ? 1 : -1;

          const width = randomBetween(10, 16);

          const height = width / Math.max(aspect, 0.1);

          const material = new THREE.SpriteMaterial({

            map: texture,

            transparent: true,

            opacity: randomBetween(0.78, 0.98),

            depthWrite: false,

            depthTest: true,

            alphaTest: 0.03,

            toneMapped: false,

          });

          const sprite = new THREE.Sprite(material);

          sprite.scale.set(width, height, 1);

          sprite.material.rotation = direction < 0 ? Math.PI : 0;

          const ship = {

            sprite,

            direction,

            speed: randomBetween(5, 10),

            baseY: randomBetween(-halfHeight * 0.7, halfHeight * 0.7),

            amplitude: randomBetween(4.5, 8),

            frequency: randomBetween(0.65, 1.15),

            phase: Math.random() * Math.PI * 2,

            baseWidth: width,

            width,

            aspect: Math.max(aspect, 0.1),

            opacity: material.opacity,

            depth:

              i % 3 === 0

                ? randomBetween(8, 13)

                : i % 3 === 1

                ? randomBetween(22, 27)

                : randomBetween(12, 19),

          };

          sprite.position.set(randomBetween(-halfWidth, halfWidth), ship.baseY, ship.depth);

          scene.add(sprite);

          spaceshipFleet.push(ship);

        }

      },

      undefined,

      (error) => console.error("Unable to load jet.png:", error)

    );

    // ─────────────── FLOATING ISLANDS ───────────────

    const makeWhiteBackgroundTransparent = (image) => {

      const canvas = document.createElement("canvas");

      const w = image.naturalWidth || image.width;

      const h = image.naturalHeight || image.height;

      if (!w || !h) return null;

      canvas.width = w;

      canvas.height = h;

      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (!context) return null;

      context.drawImage(image, 0, 0, w, h);

      try {

        const imageData = context.getImageData(0, 0, w, h);

        const pixels = imageData.data;

        let alreadyHasAlpha = false;

        for (let i = 3; i < pixels.length; i += 16) {

          if (pixels[i] < 128) {

            alreadyHasAlpha = true;

            break;

          }

        }

        if (alreadyHasAlpha) return null;

        const visited = new Uint8Array(w * h);

        const queue = [];

        const isWhitePixel = (idx) => {

          const p = idx * 4;

          const r = pixels[p];

          const g = pixels[p + 1];

          const b = pixels[p + 2];

          const brightness = (r + g + b) / 3;

          const nearNeutral = Math.max(r, g, b) - Math.min(r, g, b) < 35;

          return brightness > 220 && nearNeutral;

        };

        for (let x = 0; x < w; x++) {

          const top = x;

          const bottom = (h - 1) * w + x;

          if (isWhitePixel(top) && !visited[top]) { visited[top] = 1; queue.push(top); }

          if (isWhitePixel(bottom) && !visited[bottom]) { visited[bottom] = 1; queue.push(bottom); }

        }

        for (let y = 0; y < h; y++) {

          const left = y * w;

          const right = y * w + (w - 1);

          if (isWhitePixel(left) && !visited[left]) { visited[left] = 1; queue.push(left); }

          if (isWhitePixel(right) && !visited[right]) { visited[right] = 1; queue.push(right); }

        }

        let head = 0;

        while (head < queue.length) {

          const curr = queue[head++];

          pixels[curr * 4 + 3] = 0;

          const cx = curr % w;

          const cy = (curr / w) | 0;

          if (cx > 0) {

            const next = curr - 1;

            if (!visited[next] && isWhitePixel(next)) { visited[next] = 1; queue.push(next); }

          }

          if (cx < w - 1) {

            const next = curr + 1;

            if (!visited[next] && isWhitePixel(next)) { visited[next] = 1; queue.push(next); }

          }

          if (cy > 0) {

            const next = curr - w;

            if (!visited[next] && isWhitePixel(next)) { visited[next] = 1; queue.push(next); }

          }

          if (cy < h - 1) {

            const next = curr + w;

            if (!visited[next] && isWhitePixel(next)) { visited[next] = 1; queue.push(next); }

          }

        }

        context.putImageData(imageData, 0, 0);

        return canvas;

      } catch (error) {

        console.warn("Could not key out the island image background.", error);

        return null;

      }

    };

    const islandLayout = [
      {
        asset: 2, // Island 3 — main foreground island
        x: -0.28,
        y: -0.20,
        widthFrac: 0.72,
        z: 32,
        renderOrder: 10,
        phase: 0,
        drift: 0,
        speed: 0,
        isStatic: true,
      },
      {
        asset: 5, // Large foreground island at bottom-right
        x: 0.31,
        y: -0.28,
        widthFrac: 0.74,
        z: 30,
        renderOrder: 8,
        phase: Math.random() * Math.PI * 2,
        drift: randomBetween(1.0, 1.6),
        speed: randomBetween(0.18, 0.26),
        isStatic: false,
      },
    ];

    // Soft ambient shadows add depth while staying subtle against the space background.
    const createIslandShadowTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 96;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      const gradient = ctx.createRadialGradient(128, 48, 4, 128, 48, 118);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.42)");
      gradient.addColorStop(0.38, "rgba(3, 7, 18, 0.24)");
      gradient.addColorStop(0.72, "rgba(4, 8, 20, 0.08)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const shadowTexture = new THREE.CanvasTexture(canvas);
      shadowTexture.colorSpace = THREE.SRGBColorSpace;
      disposableTextures.push(shadowTexture);
      return shadowTexture;
    };

    const islandShadowTexture = createIslandShadowTexture();

    const addIslandTexture = (texture, assetIndex) => {

      if (disposed) {

        texture.dispose();

        return;

      }

      texture.colorSpace = THREE.SRGBColorSpace;

      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);

      let displayTexture = texture;

      const keyedCanvas = makeWhiteBackgroundTransparent(texture.image);

      if (keyedCanvas) {

        displayTexture = new THREE.CanvasTexture(keyedCanvas);

        displayTexture.colorSpace = THREE.SRGBColorSpace;

        displayTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);

        displayTexture.needsUpdate = true;

        disposableTextures.push(displayTexture);

        texture.dispose();

      } else {

        disposableTextures.push(texture);

      }

      const image = displayTexture.image;

      const aspect = image?.width && image?.height ? image.width / image.height : 1.7;

      const visibleWidth = getVisibleWidth();

      const visibleHeight = getVisibleHeight();

      islandLayout

        .filter((config) => config.asset === assetIndex)

        .forEach((config) => {

          const width = visibleWidth * config.widthFrac;

          const height = width / Math.max(aspect, 0.1);

          const islandX = config.x * visibleWidth;

          const islandY = config.y * visibleHeight;

          // A soft ellipse beneath the island adds ambient depth, not a hard drop-shadow.
          const shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(width * 0.82, Math.max(height * 0.19, 1.2)),
            new THREE.MeshBasicMaterial({
              map: islandShadowTexture,
              transparent: true,
              opacity: assetIndex === 2 ? 0.18 : 0.28,
              depthWrite: false,
              depthTest: true,
              toneMapped: false,
            })
          );
          shadow.position.set(islandX, islandY - height * 0.28, config.z - 0.35);
          shadow.renderOrder = config.renderOrder ? config.renderOrder - 1 : 0;
          scene.add(shadow);

          const material = new THREE.SpriteMaterial({
            map: displayTexture,
            transparent: true,
            opacity: 1.0,
            depthWrite: true,
            depthTest: true,
            alphaTest: 0.05,
            toneMapped: false,
          });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(width, height, 1);
          sprite.position.set(islandX, islandY, config.z);
          if (config.renderOrder) sprite.renderOrder = config.renderOrder;
          scene.add(sprite);

          floatingIslands.push({

            sprite,

            shadow,

            shadowOffsetY: height * 0.28,

            xFrac: config.x,

            yFrac: config.y,

            baseX: sprite.position.x,

            baseY: sprite.position.y,

            phase: config.phase,

            drift: config.drift,

            speed: config.speed,

            baseWidthFrac: config.widthFrac,

            widthFrac: config.widthFrac,

            aspect,

            assetIndex: config.asset,

            isStatic: config.isStatic || config.asset === 2,

            index: floatingIslands.length,

          });

        });

    };



    textureLoader.load(island3Url, (tex) => addIslandTexture(tex, 2), undefined, (e) => console.error("island3:", e));



    textureLoader.load(island6Url, (tex) => addIslandTexture(tex, 5), undefined, (e) => console.error("island6:", e));

    // ─────────────── RESPONSIVE CANVAS & MOBILE SCALING ───────────────

    const resize = () => {

      if (disposed) return;

      const width = Math.max(host.clientWidth, 1);

      const height = Math.max(host.clientHeight, 1);

      const aspect = width / height;

      camera.aspect = aspect;

      // Expand FOV on narrow/mobile screens to prevent extreme horizontal clipping

      const baseFov = 60;

      if (aspect < 1) {

        camera.fov = baseFov * Math.max(1.1, 1 / Math.pow(aspect, 0.5));

      } else {

        camera.fov = baseFov;

      }

      camera.updateProjectionMatrix();

      renderer.setSize(width, height, false);

      const visibleWidth = getVisibleWidth();

      const visibleHeight = getVisibleHeight();

      // Make items proportionately larger on mobile layout

      const scaleMultiplier = aspect < 1 ? 1.08 : 1;

      floatingIslands.forEach((island) => {

        island.widthFrac = island.baseWidthFrac * scaleMultiplier;

        const islandWidth = visibleWidth * island.widthFrac;

        const islandHeight = islandWidth / Math.max(island.aspect, 0.1);

        island.baseX = island.xFrac * visibleWidth;

        island.baseY = island.yFrac * visibleHeight;

        island.sprite.scale.set(islandWidth, islandHeight, 1);
        if (island.shadow) {
          island.shadowOffsetY = islandHeight * 0.28;
          island.shadow.geometry.dispose();
          island.shadow.geometry = new THREE.PlaneGeometry(islandWidth * 0.82, Math.max(islandHeight * 0.19, 1.2));
          island.shadow.position.x = island.baseX;
          island.shadow.position.y = island.baseY - island.shadowOffsetY;
        }

      });

      spaceshipFleet.forEach((ship) => {

        ship.width = ship.baseWidth * scaleMultiplier;

        ship.sprite.scale.set(ship.width, ship.width / ship.aspect, 1);

      });

    };

    const handleScrollZoom = () => {

      if (disposed) return;

      const hero = rootRef.current;

      if (!hero) return;

      const rect = hero.getBoundingClientRect();

      // Brightness progressively fades as the first page scrolls away.
      // At the end of the scroll range, the hero becomes almost completely dark.
      const travel = Math.max(window.innerHeight * 1.15, 1);
      const progress = THREE.MathUtils.clamp(-rect.top / travel, 0, 1);
      const easedProgress = progress * progress * (3 - 2 * progress);
      const darkness = easedProgress * 0.97;

      hero.style.setProperty("--bb-scroll-darkness", String(darkness));

      const zoomWave = Math.sin(progress * Math.PI);

      camera.position.z = 100 - zoomWave * 12;
      camera.updateProjectionMatrix();

      hero.style.setProperty("--bb-scroll-scale", String(1 + zoomWave * 0.12));
      hero.style.setProperty("--bb-ship-zoom", String(1 + zoomWave * 0.38));

      const headingZoom = 1 + zoomWave * 0.20;
      hero.style.setProperty("--bb-heading-zoom", String(headingZoom));

    };

    window.addEventListener("scroll", handleScrollZoom, { passive: true });

    handleScrollZoom();

    resize();

    const observer = new ResizeObserver(resize);

    observer.observe(host);

    // ─────────────── ANIMATION LOOP ───────────────

    const animate = (timestamp) => {

      if (disposed) return;

      raf = requestAnimationFrame(animate);

      const delta = previousTime ? Math.min((timestamp - previousTime) / 1000, 0.04) : 0;

      previousTime = timestamp;

      const time = timestamp * 0.001;

      current.current.x += (target.current.x - current.current.x) * 0.045;

      current.current.y += (target.current.y - current.current.y) * 0.045;

      scene.position.x = -current.current.x * 4.5;

      scene.position.y = current.current.y * 2.6;

      stars.rotation.y += delta * 0.007;

      stars.rotation.x = current.current.y * 0.025;

      stars.position.x = -current.current.x * 1.2;

      stars.position.y = current.current.y * 0.7;

      starMaterial.opacity = 0.42 + Math.sin(time * 2.2) * 0.08;

      shootingStars.forEach((meteor) => {

        if (meteor.active) {

          meteor.life += delta;

          meteor.mesh.position.x += meteor.vx * delta;

          meteor.mesh.position.y += meteor.vy * delta;

          const progress = meteor.life / meteor.maxLife;

          if (progress < 0.2) {

            meteor.material.opacity = progress / 0.2;

          } else {

            meteor.material.opacity = Math.max(0, 1 - (progress - 0.2) / 0.8);

          }

          if (meteor.life >= meteor.maxLife) {

            meteor.active = false;

            meteor.mesh.visible = false;

            meteor.cooldown = randomBetween(1.2, 4.0);

          }

        } else {

          meteor.cooldown -= delta;

          if (meteor.cooldown <= 0) spawnMeteor(meteor);

        }

      });

      const halfWidth = getVisibleWidth() / 2;

      spaceshipFleet.forEach((ship) => {

        const { sprite, direction, speed, amplitude, frequency, phase, width } = ship;

        sprite.position.x += direction * speed * delta;

        sprite.position.y = ship.baseY + Math.sin(time * frequency + phase) * amplitude;

        const pulse = 0.93 + Math.sin(time * 7 + phase) * 0.07;

        const distanceToEdge =

          direction > 0 ? halfWidth - sprite.position.x : halfWidth + sprite.position.x;

        const fade = THREE.MathUtils.clamp(

          (distanceToEdge + width * 0.35) / Math.max(width * 0.7, 1),

          0,

          1

        );

        sprite.material.opacity = ship.opacity * pulse * fade;

        if (direction > 0 && sprite.position.x > halfWidth + width) {

          sprite.position.x = -halfWidth - width;

          ship.baseY = randomBetween(-40, 40);

          ship.phase = Math.random() * Math.PI * 2;

        } else if (direction < 0 && sprite.position.x < -halfWidth - width) {

          sprite.position.x = halfWidth + width;

          ship.baseY = randomBetween(-40, 40);

          ship.phase = Math.random() * Math.PI * 2;

        }

      });

      // ─────────────── CALM & SMOOTH FLOATING ISLANDS MOVEMENT ───────────────

      floatingIslands.forEach((island) => {

        if (island.isStatic || island.assetIndex === 2) {

          island.sprite.position.x = island.baseX;

          island.sprite.position.y = island.baseY;

          return;

        }

        // A secondary slow sway makes the float feel organic rather than mechanical.
        const vFloat = Math.sin(time * island.speed + island.phase) * island.drift;
        const secondaryFloat = Math.sin(time * island.speed * 0.47 + island.phase * 1.8) * island.drift * 0.16;
        const hDrift = Math.cos(time * (island.speed * 0.7) + island.phase) * (island.drift * 0.75);
        const slowDrift = Math.sin(time * 0.23 + island.phase) * island.drift * 0.12;
        island.sprite.position.y = island.baseY + vFloat + secondaryFloat;
        island.sprite.position.x = island.baseX + hDrift + slowDrift;
        if (island.shadow) {
          island.shadow.position.x = island.sprite.position.x;
          island.shadow.position.y = island.sprite.position.y - island.shadowOffsetY;
          const lift = THREE.MathUtils.clamp((vFloat + island.drift) / Math.max(2 * island.drift, 0.01), 0, 1);
          island.shadow.material.opacity = (island.assetIndex === 2 ? 0.18 : 0.28) * (0.78 + lift * 0.22);
        }

      });

      renderer.render(scene, camera);

    };

    raf = requestAnimationFrame(animate);

    return () => {

      disposed = true;

      cancelAnimationFrame(raf);

      observer.disconnect();

      window.removeEventListener("scroll", handleScrollZoom);

      spaceshipFleet.forEach(({ sprite }) => {

        scene.remove(sprite);

        sprite.material.dispose();

      });

      floatingIslands.forEach(({ sprite, shadow }) => {
        scene.remove(sprite);
        sprite.material.dispose();
        if (shadow) {
          scene.remove(shadow);
          shadow.geometry.dispose();
          shadow.material.dispose();
        }
      });

      shootingStars.forEach(({ mesh, material }) => {

        scene.remove(mesh);

        material.dispose();

      });

      meteorGeo.dispose();

      if (shipTexture) shipTexture.dispose();

      disposableTextures.forEach((texture) => texture.dispose());

      starGeometry.dispose();

      starMaterial.dispose();

      renderer.dispose();

      if (renderer.domElement.parentNode === host) {

        host.removeChild(renderer.domElement);

      }

    };

  }, []);

  const moveCursor = (event) => {

    const rect = rootRef.current?.getBoundingClientRect();

    if (!rect) return;

    const x = event.clientX - rect.left;

    const y = event.clientY - rect.top;

    target.current.x = (x / rect.width) * 2 - 1;

    target.current.y = (y / rect.height) * 2 - 1;

    rootRef.current?.style.setProperty(

      "--bb-parallax-x",

      `${-target.current.x * 10}px`

    );

    rootRef.current?.style.setProperty(

      "--bb-parallax-y",

      `${target.current.y * 6}px`

    );

    const transform = `translate3d(${x}px, ${y}px, 0)`;

    if (cursorRef.current) cursorRef.current.style.transform = transform;

    if (ringRef.current) ringRef.current.style.transform = transform;

  };

  // Scroll reveal is intentionally scoped to pages 2–4; page 1 remains untouched.
  useEffect(() => {
    const revealTargets = document.querySelectorAll(
      ".bb-next-section .bb-overview-copy > *, .bb-modules-section .bb-modules-heading > *, .bb-module-card, .bb-team-section .bb-team-heading > *, .bb-team-card"
    );
    if (!("IntersectionObserver" in window) || !revealTargets.length) {
      revealTargets.forEach((el) => el.classList.add("bb-scroll-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("bb-scroll-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const chooseEvent = (id) => {

    setActiveEvent(id);

    if (typeof onSelectEvent === "function") onSelectEvent(id);

  };

  const resetHover = () => {

    setHovered(false);

    setHoverColor("#00f0ff");

  };

  const hover = (color) => {

    setHovered(true);

    setHoverColor(color);

  };

  return (

    <div className="bb-page" style={{ "--bb-artwork-background": `url(${artworkUrl})` }}>

      <audio

        ref={audioRef}

        src={bgmUrl}

        loop

        preload="auto"

        playsInline

        aria-label="Battleblaze background music"

      />

      <main

        className="bb-match"

        ref={rootRef}

        onMouseMove={moveCursor}

        onMouseLeave={resetHover}

        aria-label="Battleblaze 2026"

        style={{

          "--bb-cursor": hoverColor,

          "--bb-parallax-x": "0px",

          "--bb-parallax-y": "0px",

          "--bb-scroll-scale": "1",
          "--bb-ship-zoom": "1",
          "--bb-scroll-darkness": "0",

        }}

      >

        <div
          className="bb-match-art"
          aria-hidden="true"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />

        {/* Spacecraft with multiple targeting astronauts — fully visible, top-left */}
        <img
          className="bb-ss-art"
          src={ssUrl}
          alt=""
          aria-hidden="true"
          draggable="false"
        />

        <div className="bb-match-stars" ref={sceneMount} aria-hidden="true" />

        <div className="bb-match-vignette" aria-hidden="true" />
        <div className="bb-scroll-darken" aria-hidden="true" />
        <div className="bb-load-black-fade" aria-hidden="true" />

        <a className="bb-hotspot bb-hotspot-brand" href="#home" aria-label="Battleblaze home" />

        {/* ─────────────── CENTER EVENT LOGO WITH NEON FIRE EFFECT ─────────────── */}

        <div className="bb-hero-logo-box">

          <div className="bb-fire-backdrop" aria-hidden="true">

            <div className="bb-fire-glow-base" />

            <div className="bb-fire-glow-flare" />

            <div className="bb-fire-glow-ring" />

            <div className="bb-fire-sparks">

              <span className="bb-spark bb-spark-1" />

              <span className="bb-spark bb-spark-2" />

              <span className="bb-spark bb-spark-3" />

              <span className="bb-spark bb-spark-4" />

              <span className="bb-spark bb-spark-5" />

            </div>

          </div>

          <a

            className="bb-logo-link"

            href="/battleblaze"

            aria-label="Battleblaze Event"

            onMouseEnter={() => hover("#8b5cf6")}

            onMouseLeave={resetHover}

          >

            <img

              className="bb-event-logo"

              src={logoUrl}

              alt="Battleblaze 2026"

              draggable="false"

            />

          </a>

        </div>

        {/* Featured artwork — centered near the bottom, with safe spacing from the edge */}
        <img
          className="bb-fe-art"
          src={feUrl}
          alt=""
          aria-hidden="true"
          draggable="false"
        />

        <a className="bb-hotspot bb-hotspot-contact" href="#contact" aria-label="Contact" />

        {/* ─────────────── EVENT SELECTION HOTSPOTS ─────────────── */}

        {EVENTS.map((event) => (

          <button

            key={event.id}

            type="button"

            className={`bb-hotspot bb-hotspot-event ${

              activeEvent === event.id ? "is-active" : ""

            }`}

            style={{

              left: `${event.x}%`,

              "--event-accent": event.color,

            }}

            aria-label={`Select ${event.id}`}

            aria-pressed={activeEvent === event.id}

            onClick={() => chooseEvent(event.id)}

            onMouseEnter={() => hover(event.color)}

            onMouseLeave={resetHover}

          />

        ))}

        <button

          type="button"

          className="bb-hotspot bb-hotspot-sound"

          aria-label={muted ? "Enable background music" : "Mute background music"}

          aria-pressed={!muted}

          title={muted ? "Turn background music on" : "Mute background music"}

          onClick={() => setMuted((value) => !value)}

          onMouseEnter={() => hover("#8b5cf6")}

          onMouseLeave={resetHover}

        >

          {muted ? (

            <svg viewBox="0 0 24 24" aria-hidden="true">

              <path d="M11 5 6 9H3v6h3l5 4V5Z" />

              <path d="m17 9 5 6m0-6-5 6" />

            </svg>

          ) : (

            <svg viewBox="0 0 24 24" aria-hidden="true">

              <path d="M11 5 6 9H3v6h3l5 4V5Z" />

              <path d="M15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13" />

            </svg>

          )}

        </button>

        {/* ─────────────── CUSTOM CURSOR ─────────────── */}

        <div

          className={`bb-match-cursor ${hovered ? "is-hovered" : ""}`}

          ref={cursorRef}

          aria-hidden="true"

        >

          <span />

        </div>

        <div

          className={`bb-match-ring ${hovered ? "is-hovered" : ""}`}

          ref={ringRef}

          aria-hidden="true"

        >

          <i /><i /><i /><i />

        </div>

<span className="bb-match-sound-state" aria-live="polite">

          {muted ? "AUDIO MUTED" : "AUDIO ON"}

        </span>

        <style>{`
          /* Full-screen black cover fades away smoothly on initial load. */
          .bb-load-black-fade {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: #000;
            pointer-events: none;
            opacity: 1;
            animation: bb-initial-black-reveal 2.2s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards;
          }
          @keyframes bb-initial-black-reveal {
            0% { opacity: 1; visibility: visible; }
            75% { opacity: 0.12; }
            100% { opacity: 0; visibility: hidden; }
          }
          @media (prefers-reduced-motion: reduce) {
            .bb-load-black-fade { animation-duration: 0.35s; }
          }

          /* Battleblaze themed page scrollbar: deep violet track, violet-blue thumb */
          html {
            scrollbar-width: thin;
            scrollbar-color: #7656e8 #100a2a;
          }

          body {
            scrollbar-width: thin;
            scrollbar-color: #7656e8 #100a2a;
          }

          html::-webkit-scrollbar,
          body::-webkit-scrollbar,
          *::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }

          html::-webkit-scrollbar-track,
          body::-webkit-scrollbar-track,
          *::-webkit-scrollbar-track {
            background: linear-gradient(180deg, #100a2a 0%, #1b0c36 55%, #100a2a 100%);
            border-left: 1px solid rgba(0, 234, 255, 0.12);
          }

          html::-webkit-scrollbar-thumb,
          body::-webkit-scrollbar-thumb,
          *::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #a78bfa 0%, #7656e8 48%, #7d2bd4 100%);
            border: 2px solid #100a2a;
            border-radius: 999px;
            box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.22);
          }

          html::-webkit-scrollbar-thumb:hover,
          body::-webkit-scrollbar-thumb:hover,
          *::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #c4b5fd 0%, #8b5cf6 48%, #00cfe8 100%);
          }

          html::-webkit-scrollbar-corner,
          body::-webkit-scrollbar-corner,
          *::-webkit-scrollbar-corner {
            background: #100a2a;
          }

          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Rajdhani:wght@400;500;600;700&display=swap');

          /* Consistent Orbitron typography throughout the page */
          .bb-page,
          .bb-page *,
          .bb-page *::before,
          .bb-page *::after {
            font-family: 'Orbitron', sans-serif !important;
          }


          .bb-match {

            --bb-cursor: #00f0ff;

            --bb-scroll-scale: 1;

            position: relative;

            isolation: isolate;

            width: 100%;

            height: 100vh;

            min-height: 480px;

            overflow: hidden;

            background: #090725;

            color: #fff;

            cursor: none;

          }

          .bb-match *,

          .bb-match *::before,

          .bb-match *::after {

            box-sizing: border-box;

          }

          /* ─────────────── HERO ART & BACKGROUND ─────────────── */

          .bb-match-art {

            position: absolute;

            inset: 0;

            z-index: 1;

            display: block;

            width: 100%;

            height: 100%;

            object-fit: cover;

            object-position: center;

            filter: blur(0.70px) saturate(1.5) contrast(1.15) brightness(0.8) hue-rotate(-12deg);

            transform: translate3d(var(--bb-parallax-x, 0px), var(--bb-parallax-y, 0px), 0) scale(calc(1.05 * var(--bb-scroll-scale, 1)));

            transition: transform 80ms linear;

            pointer-events: none;

            user-select: none;

          }

          /* Spacecraft: slightly clipped on the left, gently floating, and tied to the hero's Three.js scroll zoom/darken variables. */
          .bb-ss-art {
            position: absolute;
            top: clamp(108px, 13vh, 144px);
            left: clamp(-76px, -4.5vw, -34px);
            z-index: 1; /* Keep the spaceship behind the Three.js island layer, including island3 */
            display: block;
            width: clamp(220px, 27vw, 390px);
            height: auto;
            max-width: 40vw;
            max-height: 48vh;
            object-fit: contain;
            object-position: left top;
            pointer-events: none;
            user-select: none;
            opacity: calc(1 - var(--bb-scroll-darkness, 0) * 0.78);
            transform: translate3d(0, 0, 0) scale(calc(var(--bb-scroll-scale, 1) * var(--bb-ship-zoom, 1)));
            transform-origin: left top;
            animation: bb-ss-float 3.8s ease-in-out infinite alternate;
            will-change: transform, opacity;
            filter: drop-shadow(0 6px 8px rgba(5, 3, 24, 0.2));
          }

          @keyframes bb-ss-float {
            from { translate: 0 0; }
            to { translate: 0 -26px; }
          }

          @media (max-width: 700px) {
            .bb-ss-art {
              top: 104px;
              left: -52px;
              width: clamp(160px, 39vw, 240px);
              max-width: 46vw;
              max-height: 30vh;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .bb-ss-art { animation: none; }
          }

          @media (max-width: 420px) {
            .bb-ss-art {
              top: 100px;
              left: -38px;
              width: 52vw;
              max-width: 220px;
              max-height: 29vh;
            }
          }

          .bb-match-stars {

            position: absolute;

            inset: 0;

            z-index: 2;

            overflow: hidden;

            pointer-events: none;

          }

          .bb-match-stars canvas {

            display: block;

            width: 100%;

            height: 100%;

          }

          .bb-match-vignette {

            position: absolute;

            inset: 0;

            z-index: 3;

            pointer-events: none;

            background:

              linear-gradient(115deg, rgba(91, 70, 190, 0.28), transparent 50%, rgba(48, 83, 190, 0.22)),

              linear-gradient(180deg, rgba(20, 10, 50, 0.5) 0%, transparent 30%, rgba(91, 70, 190, 0.15) 70%, rgba(15, 5, 35, 0.6) 100%);

            mix-blend-mode: screen;

            opacity: 0.95;

          }

          /* Scroll-driven black overlay: darkens the entire first-page scene smoothly. */
          .bb-scroll-darken {
            position: absolute;
            inset: 0;
            z-index: 8;
            pointer-events: none;
            background: #000;
            opacity: var(--bb-scroll-darkness, 0);
            will-change: opacity;
          }

          /* ─────────────── CENTER LOGO & FIRE EFFECT ─────────────── */

          .bb-hero-logo-box {

            position: absolute;

            left: 50%;

            top: 46%;

            transform: translate(-50%, -50%) translate3d(calc(var(--bb-parallax-x, 0px) * 0.4), calc(var(--bb-parallax-y, 0px) * 0.4), 0);

            z-index: 6;

            display: flex;

            align-items: center;

            justify-content: center;

            pointer-events: none;

            animation: bb-logo-float 6s ease-in-out infinite alternate;

          }

          @keyframes bb-logo-float {

            0% { transform: translate(-50%, -50%) translate3d(calc(var(--bb-parallax-x, 0px) * 0.4), calc(var(--bb-parallax-y, 0px) * 0.4), 0) translateY(0px); }

            100% { transform: translate(-50%, -50%) translate3d(calc(var(--bb-parallax-x, 0px) * 0.4), calc(var(--bb-parallax-y, 0px) * 0.4), 0) translateY(-10px); }

          }

          .bb-fire-backdrop {

            position: absolute;

            inset: -45px -70px;

            scale: var(--bb-heading-zoom, 1);

            transform-origin: center center;

            will-change: scale;

            pointer-events: none;

            z-index: 1;

            display: flex;

            align-items: center;

            justify-content: center;

          }

          .bb-fire-backdrop::before,

          .bb-fire-backdrop::after {

            content: "";

            position: absolute;

            inset: 4% 7% -2%;

            border-radius: 48% 52% 40% 60%;

            pointer-events: none;

            background:

              conic-gradient(from 215deg at 50% 70%,

                transparent 0deg,

                rgba(0, 225, 255, .04) 24deg,

                rgba(0, 225, 255, .09) 48deg,

                transparent 74deg,

                rgba(139, 92, 246, .11) 112deg,

                transparent 145deg,

                rgba(145, 90, 255, .035) 183deg,

                transparent 220deg,

                rgba(139, 92, 246, .09) 272deg,

                transparent 316deg);

            filter: blur(19px);

            mix-blend-mode: screen;

            opacity: .13;

            transform-origin: 50% 65%;

            animation: bb-logo-flame-spin 7s linear infinite, bb-logo-flame-flicker 1.9s ease-in-out infinite alternate;

          }

          .bb-fire-backdrop::after {

            inset: 12% 0 -8%;

            opacity: .08;

            filter: blur(24px);

            animation-duration: 10s, 1.45s;

            animation-direction: reverse, alternate;

          }

          @keyframes bb-logo-flame-spin {

            from { transform: rotate(0deg) scaleY(.94); }

            to { transform: rotate(360deg) scaleY(1.08); }

          }

          @keyframes bb-logo-flame-flicker {

            from { opacity: .08; }

            to { opacity: .16; }

          }

          .bb-fire-glow-base {

            position: absolute;

            width: 94%;

            height: 86%;

            background: radial-gradient(ellipse at 48% 48%,

              rgba(139, 92, 246, 0.035) 0%,

              rgba(115, 75, 255, 0.03) 31%,

              rgba(30, 155, 255, 0.025) 52%,

              rgba(145, 90, 255, 0.008) 67%,

              transparent 78%);

            filter: blur(20px);

            mix-blend-mode: screen;

            opacity: 0.16;

            animation: bb-fire-pulse 4.2s ease-in-out infinite alternate;

          }

          .bb-fire-glow-flare {

            position: absolute;

            width: 72%;

            height: 70%;

            background: radial-gradient(ellipse at 50% 48%,

              rgba(139, 92, 246, 0.025) 0%,

              rgba(60, 145, 255, 0.025) 38%,

              rgba(0, 225, 255, 0.008) 58%,

              transparent 74%);

            filter: blur(20px);

            mix-blend-mode: screen;

            opacity: 0.13;

            animation: bb-flare-flicker 3.6s ease-in-out infinite alternate;

          }

          .bb-fire-glow-ring {

            position: absolute;

            width: 82%;

            height: 78%;

            background: conic-gradient(from 0deg,

              transparent 0deg,

              rgba(139, 92, 246, 0.025) 55deg,

              rgba(55, 150, 255, 0.025) 135deg,

              rgba(145, 90, 255, 0.008) 205deg,

              rgba(145, 90, 255, 0.025) 285deg,

              transparent 360deg);

            filter: blur(25px);

            mix-blend-mode: screen;

            opacity: 0.12;

            animation: bb-fire-spin 18s linear infinite;

            border-radius: 50%;

          }

          .bb-fire-sparks {

            position: absolute;

            inset: 0;

            pointer-events: none;

          }

          .bb-spark {

            position: absolute;

            width: 3px;

            height: 3px;

            border-radius: 50%;

            background: #a78bfa;

            box-shadow: 0 0 3px rgba(167,139,250, 0.35), 0 0 6px rgba(65, 155, 255, 0.25);

            opacity: 0;

            animation: bb-spark-float 2.8s ease-in infinite;

          }

          .bb-spark-1 { left: 25%; bottom: 15%; animation-delay: 0s; }

          .bb-spark-2 { left: 45%; bottom: 10%; animation-delay: 0.7s; }

          .bb-spark-3 { left: 65%; bottom: 18%; animation-delay: 1.3s; }

          .bb-spark-4 { left: 80%; bottom: 12%; animation-delay: 1.9s; }

          .bb-spark-5 { left: 35%; bottom: 8%;  animation-delay: 2.3s; }

          @keyframes bb-spark-float {

            0% { transform: translateY(0) scale(0.6); opacity: 0; }

            30% { opacity: 0.9; }

            100% { transform: translateY(-70px) scale(0.2); opacity: 0; }

          }

          @keyframes bb-fire-pulse {

            0% { transform: scale(0.97); opacity: 0.66; }

            100% { transform: scale(1.03); opacity: 0.86; }

          }

          @keyframes bb-flare-flicker {

            0% { transform: scale(0.98) rotate(-0.5deg); opacity: 0.62; }

            50% { transform: scale(1.02) rotate(0.5deg); opacity: 0.25; }

            100% { transform: scale(0.99) rotate(-0.2deg); opacity: 0.66; }

          }

          @keyframes bb-fire-spin {

            from { transform: rotate(0deg); }

            to { transform: rotate(360deg); }

          }

          .bb-logo-link {

            position: relative;

            z-index: 2;

            display: inline-block;

            text-decoration: none;

            cursor: pointer;

            pointer-events: auto;

            scale: var(--bb-heading-zoom, 1);

            transform-origin: center center;

            will-change: scale;

            transition: scale 260ms cubic-bezier(0.2, 0.8, 0.2, 1);

          }

          .bb-logo-link:hover {

            scale: calc(var(--bb-heading-zoom, 1) * 1.035);

          }

          .bb-event-logo {

            display: block;

         width: clamp(440px, 58vw, 900px);
max-width: 90vw;
            height: auto;

            object-fit: contain;

            /* Restrained depth: crisp edge separation, soft natural shadow, minimal brand glow. */
            filter:
              drop-shadow(0 5px 4px rgba(5, 0, 20, 0.42))
              drop-shadow(0 13px 13px rgba(5, 0, 20, 0.30))
              drop-shadow(0 1px 1px rgba(235, 232, 255, 0.22))
              drop-shadow(0 0 10px rgba(139, 92, 246, 0.16));

            transition: filter 260ms ease, transform 260ms ease;

          }

          .bb-logo-link:hover .bb-event-logo {

            filter:
              drop-shadow(0 6px 5px rgba(5, 0, 20, 0.46))
              drop-shadow(0 16px 15px rgba(5, 0, 20, 0.34))
              drop-shadow(0 1px 1px rgba(235, 232, 255, 0.26))
              drop-shadow(0 0 13px rgba(139, 92, 246, 0.22));

          }

          /* fe.png: larger, lower-middle placement with a stronger cinematic shadow */
          .bb-fe-art {
            position: absolute;
            left: 50%;
            top: 73%;
            transform: translateX(-50%);
            z-index: 7;
            display: block;
            width: clamp(300px, 32vw, 460px);
            max-width: 58vw;
            max-height: 28vh;
            height: auto;
            object-fit: contain;
            pointer-events: none;
            user-select: none;
            filter:
              drop-shadow(0 8px 12px rgba(0, 0, 0, 0.72))
              drop-shadow(0 0 18px rgba(0, 225, 255, 0.34))
              drop-shadow(0 0 26px rgba(139, 92, 246, 0.28));
          }

          /* ─────────────── HOTSPOTS & AUDIO ─────────────── */

          .bb-hotspot {

            position: absolute;

            z-index: 5;

            display: block;

            margin: 0;

            padding: 0;

            border: 0;

            border-radius: 3px;

            background: transparent;

            color: inherit;

            cursor: none;

            -webkit-tap-highlight-color: transparent;

          }

          /* Remove the unwanted rectangular focus box around hero hotspots. */
          .bb-hotspot:focus,
          .bb-hotspot:focus-visible {
            outline: none !important;
            box-shadow: none !important;
          }

          .bb-hotspot-brand {

            left: 3%;

            top: 3%;

            width: 20%;

            height: 12%;

          }

          .bb-hotspot-contact {

            right: 2%;

            top: 3%;

            width: 10%;

            height: 10%;

          }

          .bb-hotspot-event {

            top: 65%;

            width: 14%;

            height: 22%;

            transform: translateX(-50%);

            border: 1px solid transparent;

            transition:

              border-color 180ms ease,

              background 180ms ease,

              box-shadow 180ms ease;

          }

          .bb-hotspot-event.is-active {

            border-color: color-mix(in srgb, var(--event-accent) 65%, transparent);

            background: color-mix(in srgb, var(--event-accent) 8%, transparent);

            box-shadow:

              0 0 14px color-mix(in srgb, var(--event-accent) 30%, transparent),

              inset 0 0 14px color-mix(in srgb, var(--event-accent) 8%, transparent);

          }

          .bb-hotspot-sound {

            right: 2.5%; bottom: 4%; z-index: 12; width: 54px; height: 54px;

            display: grid; place-items: center; border: 1px solid rgba(139,92,246,.8);

            border-radius: 50%; background: rgba(13,7,30,.72);

            box-shadow: 0 0 20px rgba(139,92,246,.2), inset 0 0 18px rgba(139,92,246,.08);

            cursor: pointer; transition: background 180ms ease,transform 180ms ease;

          }

          .bb-hotspot-sound:hover { background:rgba(139,92,246,.22); transform:scale(1.06); }

          .bb-hotspot-sound svg { width:22px;height:22px;fill:none;stroke:#fff;stroke-width:1.8;

            stroke-linecap:round;stroke-linejoin:round; }

          /* ─────────────── CURSOR & RING ─────────────── */

          .bb-match-cursor {

            position: absolute; top: 0; left: 0; z-index: 10;

            width: 7px; height: 7px; margin: -3.5px 0 0 -3.5px;

            border-radius: 50%; background: var(--bb-cursor);

            box-shadow: 0 0 8px var(--bb-cursor), 0 0 20px var(--bb-cursor);

            pointer-events: none; will-change: transform;

          }

          .bb-match-cursor span {

            position: absolute; inset: -5px;

            border: 1px solid var(--bb-cursor); border-radius: 50%; opacity: 0.55;

          }

          .bb-match-ring {

            position: absolute; top: 0; left: 0; z-index: 9;

            width: 32px; height: 32px; margin: -16px 0 0 -16px;

            border: 1px solid color-mix(in srgb, var(--bb-cursor) 50%, transparent);

            border-radius: 50%; pointer-events: none; will-change: transform;

            transition: width 180ms ease, height 180ms ease, margin 180ms ease, border-color 180ms ease;

          }

          .bb-match-ring i {

            position: absolute; width: 5px; height: 5px; border: 1px solid var(--bb-cursor);

          }

          .bb-match-ring i:nth-child(1) { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }

          .bb-match-ring i:nth-child(2) { top: -2px; right: -2px; border-left: 0; border-bottom: 0; }

          .bb-match-ring i:nth-child(3) { bottom: -2px; left: -2px; border-right: 0; border-top: 0; }

          .bb-match-ring i:nth-child(4) { right: -2px; bottom: -2px; border-left: 0; border-top: 0; }

          .bb-match-ring.is-hovered {

            width: 45px; height: 45px; margin: -22.5px 0 0 -22.5px;

            border-color: var(--bb-cursor);

          }

          /* ─────────────── COMING SOON ARTWORK ─────────────── */

          .bb-coming-soon-wrap {

            position: absolute;

            left: 48%;

            top: 69.5%;

            right: auto;

            bottom: auto;

            transform: translateX(-50%);

            z-index: 7;

            width: clamp(240px, 22vw, 330px);

            display: grid;

            place-items: center;

            isolation: isolate;

            pointer-events: none;

            animation: bb-coming-float 5.8s ease-in-out infinite;

          }

          .bb-coming-soon-aura {

            position: absolute; z-index: -1; inset: -18% -24%; border-radius: 48%;

            background:

              radial-gradient(ellipse at 50% 70%, rgba(139, 92, 246, .16) 0%, rgba(139, 92, 246, .06) 34%, transparent 66%),

              radial-gradient(ellipse at 28% 55%, rgba(0, 224, 255, .12) 0%, transparent 55%),

              radial-gradient(ellipse at 75% 48%, rgba(100, 116, 255, .08) 0%, transparent 48%);

            filter: blur(14px); opacity: .52;

            scale: var(--bb-heading-zoom, 1); transform-origin: center center; will-change: scale;

            animation: bb-coming-aura 3.8s ease-in-out infinite alternate;

          }

          .bb-coming-soon-aura::before, .bb-coming-soon-aura::after {

            content: ""; position: absolute; inset: 8% 12% 0;

            border-radius: 45% 55% 48% 52%;

            background: conic-gradient(from 205deg at 50% 65%,

              transparent 0deg, rgba(0, 225, 255, .08) 34deg,

              rgba(0, 225, 255, .22) 58deg, transparent 82deg,

              rgba(139, 92, 246, .20) 126deg, transparent 151deg,

              rgba(100, 116, 255, .08) 193deg, transparent 220deg,

              rgba(139, 92, 246, .18) 274deg, transparent 310deg);

            filter: blur(12px); mix-blend-mode: screen; opacity: .45; transform-origin: 50% 65%;

            animation: bb-coming-flame-spin 5.8s linear infinite;

          }

          .bb-coming-soon-aura::after {

            inset: 18% 4% -8%; opacity: .32; filter: blur(16px);

            animation: bb-coming-flame-spin 4.1s linear infinite reverse, bb-coming-flame-flicker 1.8s ease-in-out infinite alternate;

          }

          .bb-coming-soon-art {

            position: relative; z-index: 1; display: block; width: 100%; height: auto;

            scale: var(--bb-heading-zoom, 1); transform-origin: center center; will-change: scale;

            object-fit: contain;

            filter: drop-shadow(0 0 5px rgba(139, 92, 246, .28))

                    drop-shadow(0 0 10px rgba(0, 220, 255, .18))

                    drop-shadow(0 0 14px rgba(255, 174, 65, .08));

            opacity: .94; user-select: none;

          }

          @keyframes bb-coming-float {

            0%, 100% { transform: translateX(-50%) translateY(0) scale(1); }

            50% { transform: translateX(-50%) translateY(-4px) scale(1.008); }

          }

          @keyframes bb-coming-aura {

            from { opacity: .68; transform: scale(.94) rotate(-3deg); }

            to { opacity: .98; transform: scale(1.08) rotate(3deg); }

          }

          @keyframes bb-coming-flame-spin { from { transform: rotate(0deg) scaleY(.96); } to { transform: rotate(360deg) scaleY(1.06); } }

          @keyframes bb-coming-flame-flicker {

            from { opacity: .42; transform: scale(.94) skewX(-3deg); }

            to { opacity: .86; transform: scale(1.06) skewX(3deg); }

          }

          .bb-match-sound-state {

            position: absolute; right: 3%; bottom: 2%; z-index: 6;

            color: #fff; font-family: monospace; font-size: 9px;

            letter-spacing: 2px; opacity: 0.75; pointer-events: none;

          }

          /* ─────────────── RESPONSIVE BREAKPOINTS ─────────────── */

          @media (hover: none), (pointer: coarse) {

            .bb-match { cursor: auto; }

            .bb-match-cursor, .bb-match-ring { display: none; }

            .bb-hotspot { cursor: pointer; }

          }

          /* Tablets and smaller laptops */

          @media (max-width: 900px) {

            .bb-match { min-height: 560px; }

            .bb-hero-logo-box { top: 43%; left: 50%; max-width: 96vw; }

            .bb-event-logo {

              width: clamp(300px, 68vw, 600px);

              max-width: 90vw;

            }

            .bb-coming-soon-wrap {

              left: 50%;

              top: 70%;

              right: auto;

              bottom: auto;

              width: clamp(190px, 27vw, 255px);

              max-width: 42vw;

              transform: translateX(-50%);

            }

          }

          /* Mobile portrait: larger logo and a visible Coming Soon artwork */

          @media (max-width: 700px) {

            .bb-match {

              width: 100%;

              height: 100vh;

              height: 100svh;

              min-height: 560px;

              overflow: hidden;

            }

            .bb-match-art {

              background-position: center center;

              transform: translate3d(var(--bb-parallax-x, 0px), var(--bb-parallax-y, 0px), 0)

                scale(calc(1.08 * var(--bb-scroll-scale, 1)));

            }

            .bb-hero-logo-box {

              top: 42%;

              left: 50%;

              width: 100%;

              max-width: 100vw;

              justify-content: center;

            }

            .bb-logo-link { max-width: 90vw; }

            .bb-event-logo {

              display: block;

              width: 86vw;

              max-width: 450px;

              max-height: 32svh;

              height: auto;

              object-fit: contain;

            }

            .bb-fire-backdrop { inset: -24px -15px; }

            .bb-fire-glow-base { width: 100%; height: 90%; filter: blur(22px); }

            .bb-fire-glow-flare { width: 90%; height: 80%; filter: blur(18px); }

            .bb-fire-glow-ring { width: 92%; height: 86%; filter: blur(18px); }

            .bb-coming-soon-wrap {

              left: 50%;

              top: 65%;

              right: auto;

              bottom: auto;

              width: clamp(165px, 42vw, 215px);

              max-width: 48vw;

              transform: translateX(-50%);

              z-index: 7;

            }

            .bb-coming-soon-art {

              width: 100%;

              max-height: 13svh;

              object-fit: contain;

            }

            .bb-coming-soon-aura { inset: -8% -12%; filter: blur(8px); opacity: 0.45; }

            .bb-hotspot-event {

              top: 65%;

              width: 21%;

              height: 15%;

              min-height: 54px;

              border-radius: 8px;

            }

            .bb-hotspot-sound {

              right: max(14px, env(safe-area-inset-right));

              bottom: max(14px, env(safe-area-inset-bottom));

              width: 46px;

              height: 46px;

            }

            .bb-match-sound-state {

              right: 70px;

              bottom: max(29px, calc(env(safe-area-inset-bottom) + 15px));

              font-size: 8px;

              letter-spacing: 1.4px;

            }

            .bb-match-cursor, .bb-match-ring { display: none; }

            .bb-next-section {

              min-height: 100vh;

              min-height: 100svh;

              padding: 10vh 5vw;

            }

            .bb-next-title { font-size: clamp(2.2rem, 8vw, 3.8rem); }

          }

          /* Narrow phones */

          @media (max-width: 420px) {

            .bb-match { min-height: 540px; }

            .bb-hero-logo-box { top: 42%; }

            .bb-logo-link { max-width: 86vw; }

            .bb-event-logo {

              width: 82vw;

              max-width: 370px;

              max-height: 30svh;

            }

            .bb-coming-soon-wrap {

              left: 50%;

              top: 65%;

              right: auto;

              bottom: auto;

              width: clamp(165px, 42vw, 215px);

              max-width: 48vw;

              transform: translateX(-50%);

            }

            .bb-hotspot-event {

              top: 69%;

              width: 21.5%;

              height: 14%;

              min-height: 50px;

            }

            .bb-hotspot-sound { width: 42px; height: 42px; }

            .bb-match-sound-state { right: 62px; font-size: 7px; letter-spacing: 1px; }

          }

          @media (max-width: 360px) {

            .bb-event-logo { width: 78vw; max-width: 330px; max-height: 28svh; }

            .bb-coming-soon-wrap { width: 47vw; max-width: 175px; top: 65%; left: 50%; right: auto; bottom: auto; transform: translateX(-50%); }

            .bb-hotspot-event { width: 22%; }

          }

          /* Landscape phones */

          @media (max-width: 900px) and (orientation: landscape) {

            .bb-match {

              height: 100vh;

              height: 100svh;

              min-height: 400px;

            }

            .bb-hero-logo-box { top: 43%; }

            .bb-event-logo { width: min(58vw, 460px); max-height: 40svh; }

            .bb-coming-soon-wrap {

              left: 50%;

              top: 66%;

              right: auto;

              bottom: auto;

              width: clamp(150px, 19vw, 210px);

              transform: translateX(-50%);

            }

            .bb-hotspot-event { top: 69%; height: 20%; }

          }

          @media (max-width: 700px) {
            .bb-fe-art {
              top: 72%;
              width: clamp(210px, 52vw, 320px);
              max-width: 70vw;
              max-height: 20svh;
            }
          }

          @media (max-width: 420px) {
            .bb-fe-art {
              top: 71%;
              width: 55vw;
              max-width: 230px;
              max-height: 18svh;
            }
          }

          @media (prefers-reduced-motion: reduce) {

            .bb-hotspot-event, .bb-match-art { transition: none; }

            .bb-hero-logo-box, .bb-coming-soon-wrap { animation: none; }

            .bb-coming-soon-aura, .bb-coming-soon-aura::before,

            .bb-coming-soon-aura::after, .bb-fire-glow-base,

            .bb-fire-glow-flare, .bb-fire-glow-ring { animation: none; }

          }

          /* ─────────────── OVERVIEW SCROLL SECTION ─────────────── */
          .bb-page { width: 100%; background: #050311; color: #fff; }

          .bb-next-section {
            position: relative;
            min-height: 100vh;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            isolation: isolate;
            padding: clamp(64px, 8vw, 120px) clamp(22px, 7vw, 110px);
            background: #050311;
            color: #fff;
          }

          .bb-next-section::before {
            content: "";
            position: absolute;
            inset: -8%;
            pointer-events: none;
            z-index: -2;
            background:
              radial-gradient(ellipse at 14% 22%, rgba(92, 57, 255, .34) 0%, transparent 34%),
              radial-gradient(ellipse at 78% 28%, rgba(0, 190, 255, .23) 0%, transparent 31%),
              radial-gradient(ellipse at 68% 82%, rgba(139, 92, 246, .20) 0%, transparent 34%),
              radial-gradient(ellipse at 35% 72%, rgba(71, 38, 174, .24) 0%, transparent 37%),
              radial-gradient(ellipse at 50% 50%, rgba(13, 21, 62, .45) 0%, transparent 62%),
              linear-gradient(135deg, #030511 0%, #080b26 42%, #10071f 72%, #030511 100%);
            background-size: 130% 130%;
            animation: bb-overview-nebula-drift 24s ease-in-out infinite alternate;
          }

          .bb-next-section::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: -1;
            opacity: .72;
            background:
              radial-gradient(2px 2px at 7% 22%, rgba(255,255,255,.95) 45%, transparent 75%),
              radial-gradient(1px 1px at 15% 78%, rgba(174,229,255,.9) 45%, transparent 75%),
              radial-gradient(1.5px 1.5px at 23% 16%, rgba(255,255,255,.85) 45%, transparent 75%),
              radial-gradient(2px 2px at 31% 64%, rgba(0,234,255,.9) 45%, transparent 75%),
              radial-gradient(1px 1px at 38% 34%, rgba(255,255,255,.85) 45%, transparent 75%),
              radial-gradient(1.5px 1.5px at 47% 87%, rgba(255,255,255,.8) 45%, transparent 75%),
              radial-gradient(2px 2px at 57% 19%, rgba(174,229,255,.9) 45%, transparent 75%),
              radial-gradient(1px 1px at 64% 52%, rgba(255,255,255,.85) 45%, transparent 75%),
              radial-gradient(1.5px 1.5px at 73% 72%, rgba(139,92,246,.9) 45%, transparent 75%),
              radial-gradient(2px 2px at 82% 13%, rgba(255,255,255,.9) 45%, transparent 75%),
              radial-gradient(1px 1px at 91% 43%, rgba(0,234,255,.9) 45%, transparent 75%),
              radial-gradient(1.5px 1.5px at 96% 83%, rgba(255,255,255,.8) 45%, transparent 75%),
              radial-gradient(ellipse at 50% 50%, transparent 34%, rgba(0,0,0,.30) 100%);
            background-size: 100% 100%;
            animation: bb-overview-space-drift 9s ease-in-out infinite alternate;
          }

          .bb-next-section {
            background-image:
              linear-gradient(rgba(110, 155, 255, .025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(110, 155, 255, .025) 1px, transparent 1px);
            background-size: 64px 64px;
          }

          @keyframes bb-overview-space-drift {
            from { opacity: .48; transform: translate3d(0, 0, 0) scale(1); }
            to { opacity: .88; transform: translate3d(-8px, -12px, 0) scale(1.025); }
          }

          @keyframes bb-overview-nebula-drift {
            from { transform: translate3d(-1.5%, 0, 0) scale(1); filter: hue-rotate(0deg); }
            to { transform: translate3d(1.5%, -1%, 0) scale(1.06); filter: hue-rotate(12deg); }
          }

          .bb-overview-poster {
            position: absolute;
            z-index: 0;
            top: 0;
            right: 0;
            height: 100%;
            width: auto;
            max-width: 48vw;
            object-fit: contain;
            object-position: right center;
            pointer-events: none;
            user-select: none;
            opacity: 1;
            filter: drop-shadow(-10px 0 28px rgba(0, 0, 0, .3));
          }

          .bb-next-section {
            align-items: flex-start;
            justify-content: flex-start;
            padding: clamp(34px, 4vw, 62px) clamp(22px, 4vw, 64px) 64px;
          }

          .bb-next-layout {
            position: relative;
            z-index: 2;
            width: min(100%, 1060px);
            margin: 0 0 0 clamp(168px, 18vw, 250px);
            display: block;
          }

          .bb-overview-copy { width: 100%; max-width: 900px; text-align: left; }

          .bb-overview-kicker {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin: 0 0 12px;
            color: #8deeff;
            font: 700 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .28em;
            text-transform: uppercase;
          }

          .bb-overview-kicker::before {
            content: "";
            width: 30px;
            height: 2px;
            background: linear-gradient(90deg, #8b5cf6, #00eaff);
            box-shadow: 0 0 12px rgba(0,234,255,.55);
          }

          .bb-overview-title {
            margin: 0;
            font-family: "Orbitron", "Arial Black", sans-serif;
            font-weight: 800;
            font-size: clamp(2rem, 4.2vw, 3.7rem);
            line-height: 1.08;
            letter-spacing: .025em;
            text-transform: uppercase;
            background: linear-gradient(100deg, #fff 8%, #d9d2ff 38%, #8b5cf6 63%, #82efff 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 8px 26px rgba(139,92,246,.16));
            overflow-wrap: anywhere;
          }

          .bb-overview-rule {
            width: min(340px, 70%);
            height: 2px;
            margin: 18px 0;
            background: linear-gradient(90deg, #8b5cf6, #8a5cff 52%, #00eaff, transparent);
            box-shadow: 0 0 18px rgba(0,234,255,.18);
          }

          .bb-overview-card {
            position: relative;
            max-width: 780px;
            padding: 20px 24px;
            border: 1px solid rgba(159, 150, 255, .27);
            border-radius: 16px;
            background: linear-gradient(115deg, rgba(139, 92, 246, .14), rgba(13, 19, 53, .9) 48%, rgba(0, 210, 255, .10));
            box-shadow: 0 20px 55px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08);
            backdrop-filter: blur(12px);
            overflow: hidden;
          }

          .bb-overview-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 24px;
            width: 86px;
            height: 2px;
            background: linear-gradient(90deg, #8b5cf6, #00eaff);
            box-shadow: 0 0 18px rgba(139,92,246,.6);
          }

          .bb-overview-card-label {
            margin: 0 0 8px;
            color: #a78bfa;
            font: 800 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .2em;
            text-transform: uppercase;
          }

          .bb-overview-description {
            margin: 0;
            color: rgba(244, 245, 255, .86);
            font: 400 clamp(12px, .95vw, 15px)/1.65 'Orbitron', sans-serif;
          }

          .bb-overview-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }

          .bb-overview-tag {
            padding: 7px 10px;
            border: 1px solid rgba(137, 222, 255, .22);
            border-radius: 999px;
            color: #dffaff;
            background: rgba(0, 205, 255, .06);
            font: 700 9px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .09em;
            text-transform: uppercase;
          }

          .bb-overview-events {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-top: 18px;
            max-width: 780px;
          }

          .bb-overview-event-card {
            position: relative;
            min-width: 0;
            padding: 14px 16px 13px;
            overflow: hidden;
            border: 1px solid color-mix(in srgb, var(--event-accent) 48%, transparent);
            border-radius: 13px;
            background:
              linear-gradient(135deg, color-mix(in srgb, var(--event-accent) 13%, transparent), rgba(9, 12, 35, .92) 54%),
              rgba(8, 9, 28, .88);
            box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 10px 28px rgba(0,0,0,.22);
            backdrop-filter: blur(10px);
            transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease;
          }

          .bb-overview-event-card::after {
            content: "";
            position: absolute;
            top: 0;
            left: 16px;
            width: 54px;
            height: 2px;
            background: var(--event-accent);
            box-shadow: 0 0 14px var(--event-accent);
          }

          .bb-overview-event-card:hover {
            transform: translateY(-3px);
            border-color: var(--event-accent);
            box-shadow: 0 12px 32px rgba(0,0,0,.32), 0 0 18px color-mix(in srgb, var(--event-accent) 15%, transparent);
          }

          .bb-overview-event-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
          .bb-overview-event-icon { color: var(--event-accent); font-size: 20px; text-shadow: 0 0 14px var(--event-accent); }
          .bb-overview-event-code { color: rgba(210,225,255,.62); font: 700 9px/1.2 ui-monospace, monospace; letter-spacing: .16em; }
          .bb-overview-event-card h3 {
            margin: 7px 0 12px;
            color: #fff;
            font: 800 clamp(13px, 1.2vw, 17px)/1.25 'Orbitron', sans-serif;
            letter-spacing: .045em;
            overflow-wrap: anywhere;
            text-shadow: 0 0 18px color-mix(in srgb, var(--event-accent) 22%, transparent);
          }
          .bb-overview-event-prize {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 6px 10px;
            padding-top: 9px;
            border-top: 1px solid rgba(255,255,255,.10);
          }
          .bb-overview-event-prize span { color: rgba(215,225,255,.62); font: 700 9px/1.3 ui-monospace, monospace; letter-spacing: .13em; }
          .bb-overview-event-prize strong { color: var(--event-accent); font: 800 9px/1.3 'Orbitron', sans-serif; letter-spacing: .06em; }

          /* Overview event grid — keep all content clear of the right-side poster */
          .bb-next-section {
            align-items: flex-start;
            justify-content: flex-start;
            padding: clamp(38px, 5vw, 70px) clamp(22px, 4vw, 64px) 64px;
          }

          .bb-overview-poster {
            position: absolute;
            z-index: 0;
            top: 0;
            right: 0;
            height: 100%;
            width: auto;
            max-width: 48vw;
            object-fit: contain;
            object-position: right center;
            pointer-events: none;
            user-select: none;
            opacity: 1;
            filter: drop-shadow(-10px 0 28px rgba(0, 0, 0, .3));
          }

          .bb-next-layout {
            position: relative;
            z-index: 2;
            width: min(100%, 980px);
            margin: 0;
          }

          .bb-overview-copy { width: min(100%, 900px); text-align: left; }

          .bb-overview-events {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-top: 18px;
            max-width: 760px;
          }

          .bb-overview-event-card { min-height: 132px; padding: 14px 16px 13px; }

          .bb-overview-event-card h3 { margin: 7px 0 12px; font-size: clamp(13px, 1.15vw, 17px); }

          .bb-overview-event-prize strong { color: var(--event-accent); font-size: 10px; }

          @media (min-width: 1200px) {
            .bb-overview-poster { max-width: 48vw; }
            .bb-next-layout { width: min(58%, 860px); }
          }

          @media (max-width: 850px) {
            .bb-next-section { padding: 28px 22px 50px; }
            .bb-overview-poster { right: 0; height: 100%; max-width: 58vw; opacity: 1; object-position: right center; }
            .bb-next-layout { width: min(100%, 720px); margin: 0; }
            .bb-overview-copy { max-width: 100%; }
            .bb-overview-title { font-size: clamp(1.8rem, 5.5vw, 3rem); }
            .bb-overview-events { gap: 9px; max-width: 100%; }
            .bb-overview-event-card { padding: 12px; }
          }

          @media (max-width: 600px) {
            .bb-next-section { min-height: 100svh; padding: 24px 16px 42px; }
            .bb-overview-poster { height: 88%; max-width: 96vw; width: auto; right: 0; top: 0; opacity: 1; object-fit: contain; object-position: right top; }
            .bb-next-layout { width: 100%; margin: 0; }
            .bb-overview-copy { position: relative; z-index: 2; }
            .bb-overview-title { font-size: clamp(1.7rem, 8vw, 2.5rem); }
            .bb-overview-rule { margin: 14px 0; }
            .bb-overview-card { padding: 16px; border-radius: 14px; }
            .bb-overview-tags { gap: 7px; margin-top: 12px; }
            .bb-overview-events { grid-template-columns: 1fr; gap: 9px; margin-top: 14px; }
            .bb-overview-event-card { min-height: 118px; padding: 12px 14px; }
          }

          /* ─────────────── MODULES SCROLL PAGE ─────────────── */
          .bb-modules-section {
            position: relative;
            isolation: isolate;
            overflow: hidden;
            width: 100%;
            min-height: 100vh;
            padding: clamp(70px, 8vw, 118px) clamp(20px, 5vw, 76px);
            color: #fff;
            background:
              radial-gradient(ellipse at 8% 18%, rgba(91, 70, 190, .25), transparent 38%),
              radial-gradient(ellipse at 92% 35%, rgba(0, 205, 255, .23), transparent 40%),
              radial-gradient(ellipse at 50% 100%, rgba(105, 57, 255, .19), transparent 48%),
              linear-gradient(135deg, #090515 0%, #100821 42%, #061225 100%);
          }
          .bb-modules-section::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            opacity: .7;
            background-image:
              radial-gradient(1px 1px at 7% 15%, #fff 55%, transparent 75%),
              radial-gradient(1.5px 1.5px at 18% 73%, #8deeff 55%, transparent 75%),
              radial-gradient(1px 1px at 34% 31%, #fff 55%, transparent 75%),
              radial-gradient(2px 2px at 55% 14%, #a78bfa 55%, transparent 75%),
              radial-gradient(1px 1px at 71% 65%, #fff 55%, transparent 75%),
              radial-gradient(1.5px 1.5px at 88% 27%, #8deeff 55%, transparent 75%),
              radial-gradient(1px 1px at 94% 83%, #fff 55%, transparent 75%);
            background-size: 100% 100%;
            animation: bb-space-twinkle 5s ease-in-out infinite alternate;
          }
          .bb-modules-section::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            background: linear-gradient(180deg, rgba(6,4,18,.06), rgba(4,5,20,.3));
          }
          @keyframes bb-space-twinkle {
            from { opacity: .35; transform: translateY(0); }
            to { opacity: .8; transform: translateY(-5px); }
          }
          .bb-modules-inner {
            position: relative;
            z-index: 1;
            width: min(1500px, 100%);
            margin: 0 auto;
          }
          .bb-modules-heading {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin: 0 auto clamp(38px, 5vw, 68px);
          }
          .bb-modules-logo-shell {
            display: grid;
            place-items: center;
            width: clamp(100px, 13vw, 158px);
            aspect-ratio: 1;
            margin-bottom: 14px;
            border: 1px solid rgba(255,255,255,.13);
            border-radius: 28px;
            background: linear-gradient(145deg, rgba(139,92,246,.12), rgba(8,12,37,.62), rgba(0,234,255,.12));
            box-shadow: 0 0 40px rgba(139,92,246,.13), 0 0 55px rgba(0,234,255,.1), inset 0 1px 0 rgba(255,255,255,.08);
            backdrop-filter: blur(10px);
          }
          .bb-modules-logo {
            display: block;
            width: 82%;
            max-height: 82%;
            object-fit: contain;
            filter: drop-shadow(0 0 16px rgba(139,92,246,.25));
          }
          .bb-modules-kicker {
            margin: 0 0 12px;
            color: #9cefff;
            font: 800 11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .32em;
            text-transform: uppercase;
          }
          .bb-modules-title {
            margin: 0;
            font-family: "Orbitron", "Arial Black", sans-serif;
            font-weight: 800;
            font-size: clamp(2.4rem, 5.6vw, 4.5rem);
            line-height: .9;
            letter-spacing: -.025em;
            text-transform: uppercase;
            background: linear-gradient(100deg, #fff 8%, #d9d2ff 38%, #8b5cf6 63%, #82efff 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 8px 26px rgba(139,92,246,.16));
          }
          .bb-modules-subtitle {
            max-width: 620px;
            margin: 18px auto 0;
            color: rgba(232,238,255,.72);
            font: 500 clamp(12px, 1vw, 14px)/1.6 "Rajdhani", "Segoe UI", sans-serif;
          }
          .bb-modules-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: clamp(18px, 2vw, 28px);
          }
          .bb-module-card {
            min-width: 0;
            padding: 10px;
            border: 1px solid rgba(173,183,255,.19);
            border-radius: 19px;
            background: linear-gradient(145deg, rgba(255,255,255,.065), rgba(11,12,36,.64) 48%, rgba(0,210,255,.045));
            box-shadow: 0 20px 55px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.07);
            backdrop-filter: blur(12px);
            transition: transform .28s ease, border-color .28s ease, box-shadow .28s ease;
          }
          .bb-module-card:hover {
            transform: translateY(-7px);
            border-color: rgba(126,231,255,.5);
            box-shadow: 0 25px 65px rgba(0,0,0,.34), 0 0 28px rgba(0,210,255,.1);
          }
          .bb-module-poster {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            aspect-ratio: 4 / 5;
            padding: clamp(15px, 1.5vw, 22px);
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,.14);
            background:
              radial-gradient(ellipse at 15% 10%, rgba(139,92,246,.3), transparent 48%),
              radial-gradient(ellipse at 90% 85%, rgba(0,234,255,.25), transparent 48%),
              linear-gradient(150deg, rgba(21,12,48,.98), rgba(5,13,32,.98));
          }
          .bb-module-poster::before {
            content: "";
            position: absolute;
            inset: 10px;
            border: 1px solid rgba(255,255,255,.13);
            border-radius: 8px;
            pointer-events: none;
          }
          .bb-module-poster::after {
            content: "";
            position: absolute;
            width: 150%;
            height: 45%;
            left: -25%;
            bottom: -16%;
            border-radius: 50%;
            background: linear-gradient(90deg, rgba(139,92,246,.23), rgba(105,83,255,.1), rgba(0,234,255,.22));
            filter: blur(25px);
            pointer-events: none;
          }
          .bb-poster-top, .bb-poster-bottom { position: relative; z-index: 1; }
          .bb-poster-index {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: rgba(223,243,255,.72);
            font: 800 10px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .16em;
          }
          .bb-poster-index::before {
            content: "";
            width: 18px;
            height: 2px;
            background: linear-gradient(90deg, #8b5cf6, #00eaff);
          }
          .bb-poster-icon {
            display: grid;
            place-items: center;
            width: 58px;
            height: 58px;
            margin: 18px 0 16px;
            border: 1px solid rgba(145,229,255,.35);
            border-radius: 17px;
            color: #dffaff;
            font-size: 27px;
            background: linear-gradient(135deg, rgba(139,92,246,.18), rgba(0,234,255,.12));
            box-shadow: 0 0 25px rgba(0,234,255,.12);
          }
          .bb-poster-title {
            margin: 0;
            color: #fff;
            font: 800 clamp(19px, 2vw, 27px)/.98 "Orbitron", "Arial Black", sans-serif;
            letter-spacing: .015em;
            text-transform: uppercase;
            overflow-wrap: anywhere;
            text-shadow: 0 3px 20px rgba(0,0,0,.4);
          }
          .bb-poster-code {
            margin: 10px 0 0;
            color: #9defff;
            font: 800 9px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .2em;
            text-transform: uppercase;
          }
          .bb-module-card-copy { padding: 17px 5px 5px; }
          .bb-module-description {
            min-height: 66px;
            margin: 0 0 16px;
            color: rgba(232,238,255,.7);
            font: 600 13px/1.45 "Rajdhani", "Segoe UI", sans-serif;
          }
          .bb-register-button {
            position: relative;
            z-index: 5;
            pointer-events: auto;
            cursor: pointer;
            font-family: "Orbitron", "Rajdhani", sans-serif;
            font-weight: 700;
            letter-spacing: .045em;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            width: 100%;
            padding: 12px 13px;
            border: 1px solid rgba(255,255,255,.19);
            border-radius: 10px;
            color: #fff;
            text-decoration: none;
            text-transform: uppercase;
            font: 800 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .12em;
            background: linear-gradient(100deg, rgba(139,92,246,.24), rgba(104,70,255,.16), rgba(0,234,255,.2));
            transition: border-color .2s ease, filter .2s ease, transform .2s ease;
          }
          .bb-register-button:hover {
            border-color: rgba(140,239,255,.65);
            filter: brightness(1.2);
          }
          .bb-register-button span:last-child { color: #9cefff; font-size: 16px; }
          @media (max-width: 1100px) {
            .bb-modules-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          }
          @media (max-width: 720px) {
            .bb-modules-section { padding: 70px 20px; }
            .bb-modules-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
            .bb-module-card { padding: 7px; border-radius: 15px; }
            .bb-module-poster { padding: 14px; }
            .bb-poster-icon { width: 45px; height: 45px; font-size: 22px; margin: 15px 0 12px; }
            .bb-poster-title { font-size: clamp(14px, 2.5vw, 19px); }
            .bb-module-card-copy { padding: 13px 4px 4px; }
            .bb-module-description { min-height: 88px; font-size: 11px; }
            .bb-register-button { padding: 11px 9px; font-size: 9px; letter-spacing: .07em; }
          }
          @media (max-width: 380px) {
            .bb-modules-grid { grid-template-columns: 1fr; max-width: 330px; margin: 0 auto; }
            .bb-module-description { min-height: 0; }
          }

          /* ─────────────── TEAM SCROLL PAGE ─────────────── */
          .bb-team-section {
            position: relative;
            isolation: isolate;
            overflow: hidden;
            width: 100%;
            min-height: 100vh;
            padding: clamp(76px, 8vw, 124px) clamp(20px, 5vw, 76px);
            color: #fff;
            background:
              radial-gradient(ellipse at 10% 16%, rgba(91, 70, 190, .24), transparent 38%),
              radial-gradient(ellipse at 90% 34%, rgba(0, 205, 255, .22), transparent 40%),
              radial-gradient(ellipse at 50% 100%, rgba(105, 57, 255, .22), transparent 48%),
              linear-gradient(135deg, #080411 0%, #100821 43%, #061225 100%);
          }
          .bb-team-section::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            opacity: .68;
            background-image:
              radial-gradient(1px 1px at 6% 18%, #fff 55%, transparent 75%),
              radial-gradient(1.5px 1.5px at 17% 72%, #8deeff 55%, transparent 75%),
              radial-gradient(1px 1px at 29% 38%, #fff 55%, transparent 75%),
              radial-gradient(2px 2px at 48% 13%, #a78bfa 55%, transparent 75%),
              radial-gradient(1px 1px at 66% 81%, #fff 55%, transparent 75%),
              radial-gradient(1.5px 1.5px at 82% 28%, #8deeff 55%, transparent 75%),
              radial-gradient(1px 1px at 94% 63%, #fff 55%, transparent 75%);
            background-size: 100% 100%;
            animation: bb-space-twinkle 6s ease-in-out infinite alternate-reverse;
          }
          .bb-team-section::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            background: linear-gradient(180deg, rgba(6,4,18,.05), rgba(4,5,20,.32));
          }
          .bb-team-inner { position: relative; z-index: 1; width: min(1380px, 100%); margin: 0 auto; }
          .bb-team-heading { text-align: center; margin: 0 auto clamp(36px, 5vw, 64px); }
          .bb-team-logo-shell { margin-left: auto; margin-right: auto; }
          .bb-team-kicker {
            margin: 0 0 12px; color: #9cefff;
            font: 800 11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .32em; text-transform: uppercase;
          }
          .bb-team-title {
            margin: 0; font-family: "Orbitron", "Arial Black", sans-serif; font-weight: 800;
            font-size: clamp(2.3rem, 5.4vw, 4.4rem); line-height: .95; letter-spacing: -.025em;
            text-transform: uppercase;
            background: linear-gradient(100deg, #fff 8%, #d9d2ff 38%, #8b5cf6 63%, #82efff 100%);
            -webkit-background-clip: text; background-clip: text; color: transparent;
            filter: drop-shadow(0 0 26px rgba(139, 92, 246, .15));
          }
          .bb-team-subtitle { max-width: 620px; margin: 18px auto 0; color: rgba(233,241,255,.72); font: 500 clamp(12px, 1.1vw, 15px)/1.55 "Rajdhani", sans-serif; }
          .bb-team-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: clamp(14px, 2vw, 26px); }
          .bb-team-card {
            min-width: 0; padding: 12px; border: 1px solid rgba(174,213,255,.2); border-radius: 20px;
            background: linear-gradient(145deg, rgba(255,255,255,.075), rgba(8,10,31,.7));
            box-shadow: 0 18px 55px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.07);
            backdrop-filter: blur(12px); transition: transform .28s ease, border-color .28s ease, box-shadow .28s ease;
          }
          .bb-team-card:hover { transform: translateY(-7px); border-color: rgba(130,239,255,.62); box-shadow: 0 20px 60px rgba(0,0,0,.28), 0 0 28px rgba(0,205,255,.1); }
          .bb-team-photo {
            position: relative; display: grid; place-items: center; overflow: hidden; aspect-ratio: 4 / 5;
            border-radius: 13px; border: 1px solid rgba(255,255,255,.13);
            background:
              radial-gradient(ellipse at 50% 35%, rgba(139, 92, 246, .25), transparent 38%),
              radial-gradient(ellipse at 80% 80%, rgba(0,205,255,.18), transparent 45%),
              linear-gradient(145deg, rgba(24,15,48,.95), rgba(5,13,32,.98));
          }
          .bb-team-photo { isolation: isolate; }
          .bb-team-member-photo {
            display: block;
            width: 100%;
            height: 100%;
            position: absolute;
            inset: 0;
            z-index: 0;
            object-fit: cover;
            object-position: center top;
            border-radius: inherit;
          }
          .bb-team-photo::before, .bb-team-photo::after { content: ""; position: absolute; pointer-events: none; z-index: 1; }
          .bb-team-photo::before { inset: 12px; border: 1px solid rgba(130,239,255,.18); border-radius: 9px; }
          .bb-team-photo::after { width: 76%; height: 1px; bottom: 17%; background: linear-gradient(90deg, transparent, rgba(130,239,255,.8), rgba(139, 92, 246, .8), transparent); box-shadow: 0 0 15px rgba(0,205,255,.45); }
          .bb-team-avatar-mark { color: rgba(255,255,255,.9); font-size: clamp(44px, 6vw, 76px); line-height: 1; text-shadow: 0 0 25px rgba(130,239,255,.42); }
          .bb-team-photo-hint { position: absolute; z-index: 1; bottom: 25px; left: 10px; right: 10px; text-align: center; color: rgba(224,241,255,.56); font: 700 9px/1.4 "Rajdhani", sans-serif; letter-spacing: .17em; text-transform: uppercase; }
          .bb-team-card-meta { padding: 18px 7px 8px; }
          .bb-team-role { margin: 0 0 7px; color: #91edff; font: 700 10px/1.4 "Rajdhani", sans-serif; letter-spacing: .19em; text-transform: uppercase; }
          .bb-team-name { margin: 0; color: #fff; font: 800 clamp(17px, 1.8vw, 24px)/1.2 "Orbitron", sans-serif; text-transform: uppercase; }
          .bb-team-name-hint { margin: 8px 0 0; color: rgba(226,236,255,.48); font: 600 12px/1.5 "Rajdhani", sans-serif; }
          .bb-team-phone {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            margin-top: 10px;
            color: #91edff;
            font: 700 12px/1.5 "Rajdhani", sans-serif;
            letter-spacing: .06em;
            text-decoration: none;
            transition: color 180ms ease, text-shadow 180ms ease;
          }
          .bb-team-phone:hover { color: #c4b5fd; text-shadow: 0 0 12px rgba(145,237,255,.38); }
          @media (max-width: 1000px) { .bb-team-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 760px; margin: 0 auto; } }
          @media (max-width: 520px) {
            .bb-team-section { padding: 72px 17px; }
            .bb-team-grid { gap: 12px; }
            .bb-team-card { padding: 8px; border-radius: 15px; }
            .bb-team-card-meta { padding: 13px 4px 6px; }
            .bb-team-role { font-size: 9px; letter-spacing: .12em; }
            .bb-team-name { font-size: clamp(13px, 3vw, 16px); }
            .bb-team-photo-hint { font-size: 8px; bottom: 20px; }
          }
          @media (prefers-reduced-motion: reduce) {
            .bb-team-card, .bb-team-section::before, .bb-next-section::after, .bb-modules-section::before { animation: none !important; transition: none !important; }
          }

          /* ─────────────── DEEP BLUE NEBULA SPACE — SCROLL PAGES ─────────────── */
          .bb-next-section,
          .bb-modules-section,
          .bb-team-section {
            background:
              radial-gradient(ellipse at 50% 115%, rgba(34, 75, 255, .48), transparent 48%),
              radial-gradient(ellipse at 12% 22%, rgba(0, 174, 255, .30), transparent 34%),
              radial-gradient(ellipse at 88% 30%, rgba(89, 62, 255, .38), transparent 38%),
              radial-gradient(ellipse at 52% 48%, rgba(20, 70, 180, .22), transparent 56%),
              linear-gradient(135deg, #020513 0%, #061333 32%, #10165d 62%, #030817 100%) !important;
            isolation: isolate;
          }

          .bb-next-section::before,
          .bb-modules-section::before,
          .bb-team-section::before {
            z-index: -1;
            opacity: 1;
            background:
              radial-gradient(ellipse at 18% 28%, rgba(0, 183, 255, .28), transparent 29%),
              radial-gradient(ellipse at 76% 72%, rgba(60, 80, 255, .30), transparent 36%),
              radial-gradient(ellipse at 54% 14%, rgba(139, 92, 246, .24), transparent 32%),
              radial-gradient(ellipse at 82% 8%, rgba(83, 185, 255, .12), transparent 24%),
              repeating-linear-gradient(115deg, transparent 0 110px, rgba(115, 174, 255, .035) 111px, transparent 113px 220px),
              radial-gradient(circle at 50% 50%, transparent 20%, rgba(1, 4, 18, .42) 100%);
            animation: bb-blue-nebula-drift 18s ease-in-out infinite alternate;
          }

          .bb-next-section::after,
          .bb-modules-section::after,
          .bb-team-section::after {
            z-index: -1;
            opacity: .82;
            background:
              radial-gradient(1px 1px at 5% 12%, rgba(255,255,255,.95) 50%, transparent 75%),
              radial-gradient(2px 2px at 14% 66%, rgba(126,218,255,.95) 50%, transparent 75%),
              radial-gradient(1px 1px at 22% 36%, rgba(255,255,255,.85) 50%, transparent 75%),
              radial-gradient(1.5px 1.5px at 31% 82%, rgba(100,178,255,.9) 50%, transparent 75%),
              radial-gradient(2px 2px at 43% 19%, rgba(197,190,255,.95) 50%, transparent 75%),
              radial-gradient(1px 1px at 56% 59%, rgba(255,255,255,.9) 50%, transparent 75%),
              radial-gradient(1.5px 1.5px at 67% 29%, rgba(104,222,255,.9) 50%, transparent 75%),
              radial-gradient(1px 1px at 73% 88%, rgba(255,255,255,.8) 50%, transparent 75%),
              radial-gradient(2px 2px at 84% 48%, rgba(155,143,255,.95) 50%, transparent 75%),
              radial-gradient(1px 1px at 95% 17%, rgba(255,255,255,.9) 50%, transparent 75%),
              radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0, 3, 18, .34) 100%);
            background-size: 100% 100%;
            animation: bb-blue-stars-twinkle 8s ease-in-out infinite alternate;
          }

          @keyframes bb-blue-nebula-drift {
            0% { filter: hue-rotate(0deg); transform: translate3d(-.4%, 0, 0) scale(1.02); }
            100% { filter: hue-rotate(13deg); transform: translate3d(.4%, -1%, 0) scale(1.06); }
          }

          @keyframes bb-blue-stars-twinkle {
            0% { opacity: .48; }
            100% { opacity: .95; }
          }

          @media (prefers-reduced-motion: reduce) {
            .bb-next-section::before,
            .bb-modules-section::before,
            .bb-team-section::before,
            .bb-next-section::after,
            .bb-modules-section::after,
            .bb-team-section::after {
              animation: none;
            }
          }

          /* Compact typography: prevent oversized headings and clipped copy */
          .bb-overview-title,
          .bb-modules-title,
          .bb-team-title,
          .bb-next-title {
            max-width: 100%;
            font-size: clamp(2rem, 4.8vw, 4.2rem) !important;
            line-height: 1.08 !important;
            letter-spacing: 0 !important;
            overflow-wrap: anywhere;
            word-break: normal;
          }
          .bb-poster-title {
            font-size: clamp(13px, 1.6vw, 18px) !important;
            line-height: 1.15 !important;
            overflow-wrap: anywhere;
          }
          .bb-team-name { font-size: clamp(12px, 1.2vw, 15px) !important; }
          .bb-overview-description,
          .bb-modules-subtitle,
          .bb-team-subtitle,
          .bb-module-description {
            font-size: clamp(11px, .95vw, 13px) !important;
            line-height: 1.5 !important;
          }
          .bb-overview-card-label { font-size: 10px !important; }
          @media (max-width: 600px) {
            .bb-overview-title,
            .bb-modules-title,
            .bb-team-title,
            .bb-next-title {
              font-size: clamp(1.75rem, 7.5vw, 2.7rem) !important;
              line-height: 1.12 !important;
            }
            .bb-poster-title { font-size: 13px !important; }
            .bb-overview-description,
            .bb-modules-subtitle,
            .bb-team-subtitle,
            .bb-module-description { font-size: 11px !important; }
          }


          /* FINAL OVERVIEW LAYOUT: distinct content and framed poster columns */
          .bb-next-section {
            position: relative;
            isolation: isolate;
            min-height: 100vh;
            padding: clamp(42px, 4.2vw, 68px) clamp(22px, 3.2vw, 54px) 72px;
            overflow: hidden;
          }

          /* Keep the poster in its own right-side column so it never sits behind text/cards. */
          .bb-overview-poster {
            position: absolute;
            top: 50%;
            right: clamp(20px, 2.4vw, 42px);
            transform: translateY(-50%);
            width: min(31vw, 520px);
            height: auto;
            max-width: 31vw;
            max-height: 78%;
            object-fit: contain;
            object-position: center;
            opacity: 1;
            z-index: 1;
            padding: 8px;
            border: 2px solid rgba(255,255,255,.92);
            border-radius: 18px;
            background: linear-gradient(145deg, rgba(255,255,255,.10), rgba(5,10,30,.88));
            box-shadow: 0 0 0 1px rgba(255,255,255,.12), 0 0 18px rgba(255,255,255,.22), 0 18px 48px rgba(0,0,0,.5), inset 0 0 18px rgba(255,255,255,.07);
          }

          .bb-next-layout {
            width: min(55%, 900px);
            max-width: 900px;
            margin: 0;
            position: relative;
            z-index: 2;
          }

          .bb-overview-copy { width: 100%; max-width: 900px; }

          .bb-overview-title {
            color: #fff !important;
            background: none !important;
            -webkit-background-clip: initial !important;
            background-clip: initial !important;
            -webkit-text-fill-color: #fff !important;
            text-shadow: 0 0 8px rgba(255,255,255,.72), 0 0 24px rgba(255,255,255,.28);
            filter: none;
          }

          .bb-overview-kicker,
          .bb-overview-card-label,
          .bb-overview-description,
          .bb-overview-tag,
          .bb-overview-event-code,
          .bb-overview-event-card h3,
          .bb-overview-event-prize span,
          .bb-overview-event-prize strong {
            color: #fff !important;
            -webkit-text-fill-color: #fff !important;
          }

          .bb-overview-kicker::before,
          .bb-overview-rule {
            background: linear-gradient(90deg, #fff, rgba(255,255,255,.45), transparent) !important;
            box-shadow: 0 0 16px rgba(255,255,255,.72), 0 0 30px rgba(255,255,255,.22) !important;
          }

          /* Overview intro uses a clean angular HUD panel rather than the previous rounded glass box. */
          .bb-overview-card {
            border: 1px solid rgba(255,255,255,.7) !important;
            border-radius: 4px 18px 4px 18px !important;
            background: linear-gradient(115deg, rgba(15,28,52,.96), rgba(5,9,24,.96) 72%) !important;
            box-shadow: 7px 7px 0 rgba(255,255,255,.045), 0 14px 34px rgba(0,0,0,.36), 0 0 18px rgba(255,255,255,.09), inset 4px 0 0 rgba(255,255,255,.16) !important;
            backdrop-filter: blur(12px);
          }

          .bb-overview-card::before {
            background: #fff !important;
            box-shadow: 0 0 12px rgba(255,255,255,.9), 0 0 24px rgba(255,255,255,.35) !important;
          }

          .bb-overview-tag {
            border-color: rgba(255,255,255,.65) !important;
            border-radius: 3px 10px 3px 10px !important;
            background: rgba(255,255,255,.075) !important;
            box-shadow: 0 0 10px rgba(255,255,255,.06) !important;
          }

          .bb-overview-events {
            width: 100%;
            max-width: 900px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
            margin-top: 22px;
          }

          /* Event cards: squared esports HUD panels with a white top rail. */
          .bb-overview-event-card {
            border: 1px solid rgba(255,255,255,.64) !important;
            border-radius: 4px 14px 4px 14px !important;
            background: linear-gradient(135deg, rgba(20,34,58,.98), rgba(4,8,22,.98) 72%) !important;
            box-shadow: 5px 5px 0 rgba(255,255,255,.035), 0 12px 26px rgba(0,0,0,.38), inset 3px 0 0 rgba(255,255,255,.10) !important;
            backdrop-filter: blur(10px);
            min-width: 0;
          }

          .bb-overview-event-card::after {
            background: #fff !important;
            box-shadow: 0 0 10px rgba(255,255,255,.95), 0 0 20px rgba(255,255,255,.32) !important;
          }

          .bb-overview-event-card:hover {
            transform: translateY(-3px);
            border-color: #fff !important;
            box-shadow: 5px 5px 0 rgba(255,255,255,.07), 0 16px 30px rgba(0,0,0,.4), 0 0 18px rgba(255,255,255,.16) !important;
          }

          .bb-overview-event-icon,
          .bb-overview-event-card h3,
          .bb-overview-event-prize strong {
            color: #fff !important;
            text-shadow: 0 0 10px rgba(255,255,255,.42);
          }

          .bb-overview-event-prize { border-top-color: rgba(255,255,255,.32) !important; }

          @media (min-width: 1200px) {
            .bb-next-layout { width: min(55%, 900px); }
            .bb-overview-poster { width: min(31vw, 520px); max-width: 31vw; max-height: 78%; }
          }

          @media (max-width: 1000px) {
            .bb-next-section { min-height: auto; padding: 36px 22px 54px; }
            .bb-overview-poster {
              position: relative;
              display: block;
              transform: none;
              top: auto; right: auto;
              width: min(68%, 440px);
              max-width: 100%; max-height: none;
              margin: 0 auto 28px;
              opacity: 1;
            }
            .bb-next-layout { width: 100%; max-width: 820px; margin: 0 auto; }
            .bb-overview-copy, .bb-overview-events { max-width: 100%; }
          }

          @media (max-width: 600px) {
            .bb-next-section { min-height: auto; padding: 28px 16px 44px; }
            .bb-overview-poster { width: min(88%, 380px); margin-bottom: 24px; padding: 6px; border-radius: 12px; }
            .bb-next-layout { width: 100%; }
            .bb-overview-events { grid-template-columns: 1fr; gap: 11px; }
            .bb-overview-event-card { min-height: 112px; }
          }

          /* ─────────────── GLOBAL BATTLEBLAZE THEME BRIDGE ───────────────
             Unifies the scroll sections with the first page's pink / violet / cyan
             artwork while keeping every section readable and visually connected. */
          .bb-page {
            --bb-pink: #8b5cf6;
            --bb-cyan: #00eaff;
            --bb-violet: #795cff;
            background: #07091b !important;
            color: #fff;
          }

          .bb-next-section,
          .bb-modules-section,
          .bb-team-section {
            color: #fff !important;
            background-color: #080a20 !important;
            background-image:
              radial-gradient(ellipse at 8% 12%, rgba(139,92,246,.19) 0%, transparent 34%),
              radial-gradient(ellipse at 88% 20%, rgba(0,234,255,.15) 0%, transparent 32%),
              radial-gradient(ellipse at 52% 100%, rgba(111,76,255,.18) 0%, transparent 43%),
              linear-gradient(135deg, #071126 0%, #101034 48%, #09091f 100%) !important;
            border-top: 1px solid rgba(255,255,255,.10);
            box-shadow: inset 0 1px 0 rgba(255,255,255,.035);
          }

          .bb-next-section::before,
          .bb-modules-section::before,
          .bb-team-section::before {
            background:
              radial-gradient(ellipse at 12% 18%, rgba(139,92,246,.19), transparent 35%),
              radial-gradient(ellipse at 84% 22%, rgba(0,234,255,.14), transparent 34%),
              radial-gradient(ellipse at 54% 88%, rgba(121,92,255,.16), transparent 40%),
              linear-gradient(115deg, rgba(3,7,24,.16), rgba(8,10,31,.02), rgba(3,7,24,.2)) !important;
            opacity: .92;
          }

          .bb-next-section::after {
            opacity: .48 !important;
            background:
              radial-gradient(1.5px 1.5px at 8% 24%, rgba(255,255,255,.9) 45%, transparent 75%),
              radial-gradient(1px 1px at 24% 72%, rgba(0,234,255,.8) 45%, transparent 75%),
              radial-gradient(1.5px 1.5px at 44% 17%, rgba(255,255,255,.8) 45%, transparent 75%),
              radial-gradient(1px 1px at 69% 64%, rgba(139,92,246,.85) 45%, transparent 75%),
              radial-gradient(1.5px 1.5px at 91% 31%, rgba(255,255,255,.8) 45%, transparent 75%),
              linear-gradient(180deg, rgba(4,7,22,.05), rgba(4,7,22,.2)) !important;
          }

          .bb-modules-section::after,
          .bb-team-section::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            background-image:
              linear-gradient(rgba(135,174,255,.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(135,174,255,.025) 1px, transparent 1px);
            background-size: 58px 58px;
            mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent);
          }

          .bb-overview-title,
          .bb-modules-title,
          .bb-team-title {
            color: #fff !important;
            background: none !important;
            -webkit-background-clip: initial !important;
            background-clip: initial !important;
            -webkit-text-fill-color: #fff !important;
            text-shadow: 0 0 10px rgba(255,255,255,.48), 0 0 28px rgba(139,92,246,.22), 0 0 42px rgba(0,234,255,.12);
            filter: none !important;
          }

          .bb-overview-kicker,
          .bb-modules-kicker,
          .bb-team-kicker {
            color: #fff !important;
            text-shadow: 0 0 12px rgba(0,234,255,.35);
          }

          .bb-overview-kicker::before,
          .bb-overview-rule,
          .bb-poster-index::before {
            background: linear-gradient(90deg, #8b5cf6, #a58bff 52%, #00eaff) !important;
            box-shadow: 0 0 14px rgba(139,92,246,.36), 0 0 20px rgba(0,234,255,.25) !important;
          }

          .bb-overview-card,
          .bb-overview-event-card,
          .bb-module-card,
          .bb-team-card {
            border: 1px solid rgba(173,208,255,.32) !important;
            background:
              linear-gradient(135deg, rgba(17,29,59,.88), rgba(8,10,30,.94) 62%, rgba(30,13,48,.82)) !important;
            box-shadow:
              0 14px 36px rgba(0,0,0,.28),
              0 0 18px rgba(0,234,255,.055),
              inset 0 1px 0 rgba(255,255,255,.09) !important;
            backdrop-filter: blur(14px);
            transition: transform .24s ease, border-color .24s ease, box-shadow .24s ease;
          }

          .bb-overview-card:hover,
          .bb-overview-event-card:hover,
          .bb-module-card:hover,
          .bb-team-card:hover {
            border-color: rgba(0,234,255,.68) !important;
            box-shadow:
              0 18px 42px rgba(0,0,0,.36),
              0 0 22px rgba(0,234,255,.12),
              0 0 28px rgba(139,92,246,.08),
              inset 0 1px 0 rgba(255,255,255,.12) !important;
          }

          .bb-overview-card::before,
          .bb-overview-event-card::after {
            background: linear-gradient(90deg, #8b5cf6, #fff 50%, #00eaff) !important;
            box-shadow: 0 0 12px rgba(255,255,255,.46), 0 0 18px rgba(0,234,255,.25) !important;
          }

          .bb-overview-event-card h3,
          .bb-overview-event-code,
          .bb-overview-event-prize span,
          .bb-overview-event-prize strong,
          .bb-module-description,
          .bb-poster-index,
          .bb-poster-code,
          .bb-team-role,
          .bb-team-name-hint {
            color: #fff !important;
          }

          .bb-overview-tag,
          .bb-modules-logo-shell,
          .bb-poster-icon,
          .bb-register-button {
            border-color: rgba(255,255,255,.32) !important;
            background: linear-gradient(110deg, rgba(139,92,246,.12), rgba(120,92,255,.12), rgba(0,234,255,.12)) !important;
            box-shadow: 0 0 16px rgba(0,234,255,.06), inset 0 1px 0 rgba(255,255,255,.08);
          }

          .bb-overview-poster {
            border: 1px solid rgba(255,255,255,.78);
            padding: 7px;
            background: rgba(5,8,25,.72);
            box-shadow: 0 0 0 1px rgba(0,234,255,.14), 0 0 26px rgba(0,234,255,.12), 0 18px 48px rgba(0,0,0,.32);
          }

          .bb-modules-logo {
            filter: drop-shadow(0 0 12px rgba(139,92,246,.18)) drop-shadow(0 0 14px rgba(0,234,255,.14));
          }

          .bb-register-button:hover {
            border-color: rgba(255,255,255,.78) !important;
            box-shadow: 0 0 18px rgba(0,234,255,.14), 0 0 22px rgba(139,92,246,.10);
          }

          @media (prefers-reduced-motion: reduce) {
            .bb-next-section::before,
            .bb-next-section::after,
            .bb-team-section::before,
            .bb-modules-section::before {
              animation: none !important;
            }
          }

          /* FINAL COLOR + POSTER OVERRIDES: stronger pink with a pink/blue neon glow */
          .bb-page {
            --bb-pink: #8b5cf6;
            --bb-cyan: #4d7dff;
            --bb-violet: #9a55ff;
          }

          .bb-next-section,
          .bb-modules-section,
          .bb-team-section {
            background-image:
              radial-gradient(ellipse at 8% 12%, rgba(139,92,246,.34) 0%, transparent 38%),
              radial-gradient(ellipse at 88% 20%, rgba(65,112,255,.27) 0%, transparent 36%),
              radial-gradient(ellipse at 52% 100%, rgba(154,85,255,.25) 0%, transparent 45%),
              linear-gradient(135deg, #10091f 0%, #111438 48%, #09091f 100%) !important;
          }

          .bb-next-section::before,
          .bb-modules-section::before,
          .bb-team-section::before {
            background:
              radial-gradient(ellipse at 12% 18%, rgba(139,92,246,.32), transparent 38%),
              radial-gradient(ellipse at 84% 22%, rgba(65,112,255,.26), transparent 36%),
              radial-gradient(ellipse at 54% 88%, rgba(154,85,255,.22), transparent 42%),
              linear-gradient(115deg, rgba(3,7,24,.08), rgba(8,10,31,.01), rgba(3,7,24,.16)) !important;
            opacity: 1 !important;
          }

          .bb-overview-title,
          .bb-modules-title,
          .bb-team-title {
            text-shadow:
              0 0 10px rgba(255,255,255,.5),
              0 0 24px rgba(139,92,246,.42),
              0 0 42px rgba(91,111,255,.34) !important;
          }

          .bb-overview-kicker::before,
          .bb-overview-rule,
          .bb-poster-index::before {
            background: linear-gradient(90deg, #8b5cf6 0%, #a855f7 48%, #4d7dff 100%) !important;
            box-shadow: 0 0 16px rgba(139,92,246,.58), 0 0 30px rgba(77,125,255,.42) !important;
          }

          .bb-overview-card,
          .bb-overview-event-card,
          .bb-module-card,
          .bb-team-card {
            border-color: rgba(99, 102, 241, .46) !important;
            box-shadow:
              0 14px 36px rgba(0,0,0,.3),
              0 0 20px rgba(139,92,246,.13),
              0 0 24px rgba(77,125,255,.10),
              inset 0 1px 0 rgba(255,255,255,.10) !important;
          }

          .bb-overview-card:hover,
          .bb-overview-event-card:hover,
          .bb-module-card:hover,
          .bb-team-card:hover {
            border-color: rgba(99, 102, 241, .82) !important;
            box-shadow:
              0 18px 42px rgba(0,0,0,.36),
              0 0 26px rgba(139,92,246,.24),
              0 0 32px rgba(77,125,255,.18),
              inset 0 1px 0 rgba(255,255,255,.14) !important;
          }

          .bb-overview-card::before,
          .bb-overview-event-card::after {
            background: linear-gradient(90deg, #8b5cf6, #f6d7ff 48%, #4d7dff) !important;
            box-shadow: 0 0 14px rgba(139,92,246,.72), 0 0 24px rgba(77,125,255,.52) !important;
          }

          /* PINK-ONLY THEME OVERRIDE — larger framed overview poster */
          .bb-next-section,
          .bb-modules-section,
          .bb-team-section {
            --bb-pink: #8b5cf6 !important;
            --bb-cyan: #ff63bd !important;
            --bb-violet: #ff4fa8 !important;
            background:
              radial-gradient(ellipse at 18% 22%, rgba(139,92,246,.30), transparent 42%),
              radial-gradient(ellipse at 78% 76%, rgba(139, 92, 246, .20), transparent 46%),
              linear-gradient(135deg, #16071b 0%, #21091f 52%, #100719 100%) !important;
            color: #fff !important;
          }
          .bb-next-section::before,
          .bb-modules-section::before,
          .bb-team-section::before {
            background:
              radial-gradient(ellipse at 12% 18%, rgba(139,92,246,.34), transparent 38%),
              radial-gradient(ellipse at 84% 22%, rgba(139, 92, 246, .22), transparent 40%),
              linear-gradient(115deg, rgba(20,4,18,.08), rgba(38,6,30,.02), rgba(18,4,20,.18)) !important;
          }
          .bb-overview-title,
          .bb-modules-title,
          .bb-team-title {
            color: #fff !important;
            background: none !important;
            -webkit-background-clip: initial !important;
            background-clip: initial !important;
            -webkit-text-fill-color: #fff !important;
            text-shadow: 0 0 10px rgba(139, 92, 246, .65), 0 0 28px rgba(139,92,246,.42) !important;
          }
          .bb-overview-kicker::before,
          .bb-overview-rule,
          .bb-poster-index::before {
            background: #ff4fa8 !important;
            box-shadow: 0 0 12px rgba(139,92,246,.8), 0 0 26px rgba(139,92,246,.45) !important;
          }
          .bb-overview-card,
          .bb-overview-event-card,
          .bb-team-card {
            border-color: rgba(99, 102, 241, .58) !important;
            background: linear-gradient(145deg, rgba(55,12,43,.94), rgba(18,7,24,.97) 72%) !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.32), 0 0 18px rgba(139,92,246,.12), inset 0 1px 0 rgba(255,210,235,.12) !important;
          }
          .bb-overview-card::before,
          .bb-overview-event-card::after {
            background: #ff63bd !important;
            box-shadow: 0 0 12px rgba(139, 92, 246, .95), 0 0 24px rgba(139,92,246,.48) !important;
          }
          .bb-overview-tag,
          .bb-register-button {
            border-color: rgba(99, 102, 241, .72) !important;
            background: rgba(139,92,246,.12) !important;
            box-shadow: 0 0 14px rgba(139,92,246,.16), inset 0 1px 0 rgba(255,220,240,.12) !important;
          }
          .bb-next-section {
            position: relative;
            min-height: max(112vh, 1080px) !important;
            overflow: hidden;
          }
          .bb-next-layout {
            position: relative;
            z-index: 3 !important;
            width: min(43%, 700px) !important;
            max-width: 700px !important;
          }
          .bb-overview-copy,
          .bb-overview-events {
            max-width: 100% !important;
          }
          .bb-overview-poster {
            position: absolute !important;
            z-index: 2 !important;
            top: 50% !important;
            right: clamp(8px, 1vw, 20px) !important;
            transform: translateY(-50%) !important;
            display: block !important;
            width: min(55vw, 1000px) !important;
            max-width: 55vw !important;
            height: auto !important;
            max-height: none !important;
            padding: 10px !important;
            border: 2px solid rgba(99, 102, 241, .98) !important;
            border-radius: 18px !important;
            background: rgba(30,5,25,.92) !important;
            box-shadow:
              0 0 0 1px rgba(139,92,246,.45),
              0 0 26px rgba(139,92,246,.72),
              0 0 62px rgba(139,92,246,.42),
              0 28px 72px rgba(0,0,0,.56),
              inset 0 0 18px rgba(255,210,235,.10) !important;
            object-fit: contain !important;
            opacity: 1 !important;
          }
          @media (min-width: 1500px) {
            .bb-next-layout { width: min(41%, 700px) !important; }
            .bb-overview-poster { width: min(58vw, 1120px) !important; max-width: 58vw !important; }
          }
          @media (max-width: 1000px) {
            .bb-next-section {
              min-height: auto !important;
              padding-top: 42px !important;
              overflow: visible !important;
            }
            .bb-overview-poster {
              position: relative !important;
              top: auto !important;
              right: auto !important;
              transform: none !important;
              width: min(88%, 760px) !important;
              max-width: 100% !important;
              height: auto !important;
              margin: 0 auto 32px !important;
              display: block !important;
            }
            .bb-next-layout { width: 100% !important; max-width: 820px !important; }
          }
          @media (max-width: 600px) {
            .bb-overview-poster {
              width: min(96%, 520px) !important;
              padding: 6px !important;
              border-radius: 12px !important;
            }
          }


          /* Final poster sizing: keep the artwork smaller and reserve a separate text column. */
          .bb-next-section {
            position: relative;
            display: block;
            overflow: hidden;
          }
          .bb-overview-poster {
            position: absolute !important;
            top: 50% !important;
            right: 2.5% !important;
            left: auto !important;
            transform: translateY(-50%) !important;
            width: auto !important;
            height: auto !important;
            max-width: min(34vw, 500px) !important;
            max-height: 82% !important;
            object-fit: contain !important;
            object-position: center !important;
            opacity: .92 !important;
          }
          .bb-next-layout {
            position: relative !important;
            z-index: 2 !important;
            width: calc(100% - min(37vw, 530px)) !important;
            max-width: 900px !important;
            margin: 0 !important;
          }
          .bb-overview-copy { width: 100% !important; max-width: 100% !important; }
          .bb-overview-events { max-width: 100% !important; }
          @media (max-width: 850px) {
            .bb-overview-poster {
              max-width: 30vw !important;
              max-height: 65% !important;
              right: 1.5% !important;
              opacity: .78 !important;
            }
            .bb-next-layout {
              width: calc(100% - 32vw) !important;
              max-width: none !important;
            }
          }
          @media (max-width: 600px) {
            .bb-next-section {
              display: flex !important;
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 18px !important;
            }
            .bb-overview-poster {
              position: relative !important;
              top: auto !important;
              right: auto !important;
              left: auto !important;
              transform: none !important;
              display: block !important;
              width: min(78%, 340px) !important;
              max-width: 340px !important;
              max-height: none !important;
              height: auto !important;
              margin: 0 auto !important;
              opacity: 1 !important;
            }
            .bb-next-layout {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
            }
          }



          /* MATCH PAGE 1 ARTWORK ALIGNMENT, ZOOM AND TONE ON SCROLL PAGES 2/3 */
          .bb-page {
            background: #07091b !important;
            background-image: var(--bb-artwork-background) !important;
            background-size: 105% 105% !important;
            background-position: center center !important;
            background-repeat: no-repeat !important;
            background-attachment: fixed !important;
          }

          .bb-next-section,
          .bb-modules-section,
          .bb-team-section {
            background-color: transparent !important;
            background-image: var(--bb-artwork-background) !important;
            background-size: 105% 105% !important;
            background-position: center center !important;
            background-repeat: no-repeat !important;
            background-attachment: fixed !important;
            background-blend-mode: normal !important;
          }

          /* Remove the extra dark/pink overlays so artwork opacity matches page 1 */
          .bb-next-section::before,
          .bb-modules-section::before,
          .bb-team-section::before {
            background: transparent !important;
            opacity: 0 !important;
          }

          @media (max-width: 768px) {
            .bb-page { background-attachment: scroll !important; }
            .bb-next-section,
            .bb-modules-section,
            .bb-team-section {
              background-attachment: scroll !important;
              background-size: cover !important;
              background-position: center center !important;
            }
          }
          /* ── Pages 2–4: smooth bottom-to-top text reveal; page 1 is unchanged ── */
          .bb-next-section .bb-overview-copy > *,
          .bb-modules-section .bb-modules-heading > *,
          .bb-module-card,
          .bb-team-section .bb-team-heading > *,
          .bb-team-card {
            opacity: 0;
            transform: translate3d(0, 34px, 0);
            transition: opacity 720ms ease, transform 780ms cubic-bezier(.2,.75,.25,1);
            will-change: opacity, transform;
          }

          .bb-next-section .bb-overview-copy > *.bb-scroll-revealed,
          .bb-modules-section .bb-modules-heading > *.bb-scroll-revealed,
          .bb-module-card.bb-scroll-revealed,
          .bb-team-section .bb-team-heading > *.bb-scroll-revealed,
          .bb-team-card.bb-scroll-revealed {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }

          .bb-module-card:nth-child(2n),
          .bb-team-card:nth-child(2n) { transition-delay: 100ms; }
          .bb-module-card:nth-child(3n),
          .bb-team-card:nth-child(3n) { transition-delay: 180ms; }

          /* One or two slow ships per scroll page, independent of the hero canvas. */
          .bb-next-section,
          .bb-modules-section,
          .bb-team-section { position: relative; }

          .bb-scroll-ships {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 1;
            contain: layout paint;
          }

          .bb-scroll-ship {
            position: absolute;
            display: block;
            width: clamp(42px, 5vw, 72px);
            aspect-ratio: 2.5 / 1;
            background-image: var(--bb-jet-url);
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            opacity: .42;
            filter: drop-shadow(0 0 8px rgba(0, 234, 255, .28));
            will-change: transform;
          }

          .bb-scroll-ship-one {
            top: 23%;
            left: -10%;
            animation: bb-scroll-ship-forward 34s linear infinite;
          }

          .bb-scroll-ship-two {
            top: 69%;
            right: -10%;
            width: clamp(34px, 4vw, 58px);
            opacity: .28;
            transform: scaleX(-1);
            animation: bb-scroll-ship-backward 43s linear infinite;
            animation-delay: -17s;
          }

          @keyframes bb-scroll-ship-forward {
            0% { transform: translate3d(0, 0, 0); }
            45% { transform: translate3d(55vw, 12px, 0); }
            100% { transform: translate3d(120vw, -8px, 0); }
          }

          @keyframes bb-scroll-ship-backward {
            0% { transform: translate3d(0, 0, 0) scaleX(-1); }
            50% { transform: translate3d(-55vw, -14px, 0) scaleX(-1); }
            100% { transform: translate3d(-120vw, 8px, 0) scaleX(-1); }
          }

          .bb-scroll-ships > span { z-index: 1; }
          @media (prefers-reduced-motion: reduce) {
            .bb-next-section .bb-overview-copy > *,
            .bb-modules-section .bb-modules-heading > *,
            .bb-module-card,
            .bb-team-section .bb-team-heading > *,
            .bb-team-card {
              opacity: 1;
              transform: none;
              transition: none;
            }
            .bb-scroll-ship { animation-duration: 90s !important; }
          }

          /* Mobile hero refinement: make the Battleblaze heading and featured logos readable. */
          @media (max-width: 700px) and (orientation: portrait) {
            .bb-hero-logo-box {
              width: 100%;
              top: 43%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            .bb-logo-link { width: 100%; max-width: 96vw; }
            .bb-event-logo {
              width: min(94vw, 520px);
              max-width: 94vw;
              max-height: 37svh;
              object-fit: contain;
            }
            .bb-fe-art {
              top: 69%;
              width: clamp(285px, 76vw, 430px);
              max-width: 88vw;
              max-height: 25svh;
            }
            .bb-ss-art {
              width: clamp(165px, 42vw, 245px);
              max-width: 48vw;
            }
          }
          @media (max-width: 420px) and (orientation: portrait) {
            .bb-hero-logo-box { top: 43%; }
            .bb-event-logo {
              width: 96vw;
              max-width: 96vw;
              max-height: 39svh;
            }
            .bb-fe-art {
              top: 69%;
              width: 82vw;
              max-width: 330px;
              max-height: 24svh;
            }
          }
          /* Preserve gentle ship drift while making the scroll zoom more noticeable on mobile. */
          @media (max-width: 700px) {
            .bb-scroll-ship-one { animation-duration: 27s; }
            .bb-scroll-ship-two { animation-duration: 33s; }
          }

          /* Final mobile overrides: make the event mark and featured art readable,
             and give the foreground spacecraft a clearly visible float. */
          @media (max-width: 700px) {
            .bb-ss-art {
              animation: bb-ss-float 3.8s ease-in-out infinite alternate !important;
              top: 96px;
              width: clamp(190px, 48vw, 300px);
              max-width: 54vw;
              max-height: 34svh;
            }
            .bb-event-logo {
              width: 96vw !important;
              max-width: 560px !important;
              max-height: 39svh !important;
            }
            .bb-logo-link {
              width: 98vw;
              max-width: 98vw !important;
            }
            .bb-fe-art {
              top: 72% !important;
              width: clamp(270px, 76vw, 390px) !important;
              max-width: 82vw !important;
              max-height: 25svh !important;
            }
          }
          @media (max-width: 420px) {
            .bb-ss-art {
              top: 94px;
              left: -18px;
              width: 58vw;
              max-width: 250px;
              max-height: 32svh;
            }
            .bb-event-logo {
              width: 94vw !important;
              max-width: 430px !important;
              max-height: 36svh !important;
            }
            .bb-fe-art {
              top: 72% !important;
              width: 72vw !important;
              max-width: 310px !important;
              max-height: 23svh !important;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .bb-ss-art { animation: none !important; }
          }

          /* VISIBLE PURPLE + ELECTRIC BLUE GRADIENT — PAGES 2, 3 & 4 ONLY */
          .bb-next-section,
          .bb-modules-section,
          .bb-team-section {
            position: relative;
            isolation: isolate;
            background-color: #07051b !important;
            background-image:
              radial-gradient(ellipse at 12% 18%, rgba(133, 56, 255, 0.62) 0%, rgba(104, 48, 245, 0.28) 24%, transparent 52%),
              radial-gradient(ellipse at 88% 22%, rgba(0, 153, 255, 0.54) 0%, rgba(0, 112, 255, 0.24) 28%, transparent 55%),
              radial-gradient(ellipse at 52% 100%, rgba(81, 44, 210, 0.42) 0%, transparent 48%),
              linear-gradient(118deg, #100626 0%, #171044 28%, #101c4a 58%, #07172d 78%, #08051b 100%) !important;
            background-size: 100% 100% !important;
            animation: none !important;
          }

          /* Remove background photos, stars, grids and decorative image layers. */
          .bb-next-section::before,
          .bb-next-section::after,
          .bb-modules-section::before,
          .bb-modules-section::after,
          .bb-team-section::before,
          .bb-team-section::after {
            content: none !important;
            display: none !important;
            background: none !important;
            background-image: none !important;
            animation: none !important;
          }

          /* Keep content cards dark so the brighter gradient stays visible around them. */
          .bb-module-card,
          .bb-team-card,
          .bb-overview-event-card {
            background-color: rgba(7, 8, 29, 0.78) !important;
            background-image: none !important;
            border-color: rgba(129, 113, 255, 0.36) !important;
            box-shadow: 0 12px 36px rgba(1, 5, 24, 0.22), 0 0 22px rgba(88, 85, 255, 0.08);
            backdrop-filter: blur(8px);
          }

          /* ───── PURPLE / WHITE PALETTE: OVERVIEW, MODULES & TEAM ───── */
          .bb-next-section,
          .bb-modules-section,
          .bb-team-section {
            --bb-violet: #a78bfa;
            --bb-violet-bright: #c4b5fd;
            --bb-violet-soft: rgba(139, 92, 246, .24);
            --bb-white: #ffffff;
            color: #fff !important;
            background-color: #080411 !important;
          }

          .bb-next-section {
            background-image:
              radial-gradient(ellipse at 12% 18%, rgba(124, 58, 237, .26), transparent 38%),
              radial-gradient(ellipse at 82% 76%, rgba(65, 75, 160, .12), transparent 38%),
              linear-gradient(135deg, #050308 0%, #120820 48%, #080411 100%) !important;
          }
          .bb-next-section::before {
            background:
              radial-gradient(ellipse at 14% 22%, rgba(139, 92, 246, .28) 0%, transparent 36%),
              radial-gradient(ellipse at 78% 28%, rgba(91, 88, 180, .12) 0%, transparent 32%),
              radial-gradient(ellipse at 68% 82%, rgba(139, 92, 246, .18) 0%, transparent 36%),
              radial-gradient(ellipse at 35% 72%, rgba(71, 38, 174, .18) 0%, transparent 38%),
              linear-gradient(135deg, #050308 0%, #10071c 48%, #080411 100%) !important;
          }
          .bb-next-section::after {
            background:
              radial-gradient(2px 2px at 7% 22%, rgba(255,255,255,.9) 45%, transparent 75%),
              radial-gradient(1px 1px at 15% 78%, rgba(196,181,253,.75) 45%, transparent 75%),
              radial-gradient(1.5px 1.5px at 23% 16%, rgba(255,255,255,.8) 45%, transparent 75%),
              radial-gradient(2px 2px at 31% 64%, rgba(196,181,253,.72) 45%, transparent 75%),
              radial-gradient(1px 1px at 38% 34%, rgba(255,255,255,.8) 45%, transparent 75%),
              radial-gradient(1.5px 1.5px at 47% 87%, rgba(255,255,255,.75) 45%, transparent 75%),
              radial-gradient(2px 2px at 57% 19%, rgba(196,181,253,.75) 45%, transparent 75%),
              radial-gradient(1px 1px at 64% 52%, rgba(255,255,255,.8) 45%, transparent 75%),
              radial-gradient(1.5px 1.5px at 73% 72%, rgba(167,139,250,.8) 45%, transparent 75%),
              radial-gradient(2px 2px at 82% 13%, rgba(255,255,255,.85) 45%, transparent 75%),
              radial-gradient(1px 1px at 91% 43%, rgba(196,181,253,.7) 45%, transparent 75%),
              radial-gradient(ellipse at 50% 50%, transparent 34%, rgba(0,0,0,.34) 100%) !important;
          }
          .bb-overview-kicker { color: #c4b5fd !important; }
          .bb-overview-kicker::before,
          .bb-overview-rule,
          .bb-overview-card::before {
            background: linear-gradient(90deg, #8b5cf6, #c4b5fd, rgba(196,181,253,0)) !important;
            box-shadow: 0 0 14px rgba(167,139,250,.36) !important;
          }
          .bb-overview-title {
            background: linear-gradient(100deg, #fff 8%, #f5f3ff 42%, #c4b5fd 75%, #fff 100%) !important;
            -webkit-background-clip: text !important;
            background-clip: text !important;
            filter: drop-shadow(0 0 18px rgba(139,92,246,.22)) !important;
          }
          .bb-overview-card,
          .bb-overview-event-card {
            border-color: rgba(167,139,250,.28) !important;
            background: linear-gradient(130deg, rgba(139,92,246,.13), rgba(10,6,20,.94) 62%, rgba(67,56,120,.10)) !important;
            box-shadow: 0 18px 48px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.07), 0 0 22px rgba(139,92,246,.06) !important;
          }
          .bb-overview-card-label,
          .bb-overview-event-card .event-kicker,
          .bb-overview-event-card .event-date { color: #c4b5fd !important; }
          .bb-overview-description,
          .bb-overview-event-card p { color: rgba(255,255,255,.84) !important; }
          .bb-overview-tag {
            color: #f5f3ff !important;
            border-color: rgba(196,181,253,.28) !important;
            background: rgba(139,92,246,.10) !important;
          }

          .bb-modules-section {
            background:
              radial-gradient(ellipse at 8% 18%, rgba(124,58,237,.25), transparent 38%),
              radial-gradient(ellipse at 92% 35%, rgba(67,75,150,.12), transparent 40%),
              radial-gradient(ellipse at 50% 100%, rgba(105,57,255,.17), transparent 48%),
              linear-gradient(135deg, #050308 0%, #10071c 48%, #080411 100%) !important;
          }
          .bb-modules-section::before {
            background-image:
              radial-gradient(1px 1px at 7% 15%, #fff 55%, transparent 75%),
              radial-gradient(1.5px 1.5px at 18% 73%, #c4b5fd 55%, transparent 75%),
              radial-gradient(1px 1px at 34% 31%, #fff 55%, transparent 75%),
              radial-gradient(2px 2px at 55% 14%, #a78bfa 55%, transparent 75%),
              radial-gradient(1px 1px at 71% 65%, #fff 55%, transparent 75%),
              radial-gradient(1.5px 1.5px at 88% 27%, #c4b5fd 55%, transparent 75%),
              radial-gradient(1px 1px at 94% 83%, #fff 55%, transparent 75%) !important;
          }
          .bb-modules-heading,
          .bb-team-heading { color: #fff !important; }
          .bb-modules-kicker,
          .bb-team-kicker,
          .bb-module-number,
          .bb-module-label,
          .bb-team-role,
          .bb-team-name-hint { color: #c4b5fd !important; }
          .bb-modules-title,
          .bb-team-title {
            color: #fff !important;
            background: linear-gradient(100deg, #fff 12%, #f5f3ff 55%, #c4b5fd 100%) !important;
            -webkit-background-clip: text !important;
            background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            filter: drop-shadow(0 0 18px rgba(139,92,246,.2)) !important;
          }
          .bb-modules-section .bb-module-card,
          .bb-team-section .bb-team-card {
            color: #fff !important;
            border-color: rgba(167,139,250,.26) !important;
            background: linear-gradient(145deg, rgba(139,92,246,.12), rgba(8,4,17,.94) 65%, rgba(75,61,130,.10)) !important;
            box-shadow: 0 18px 42px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06), 0 0 20px rgba(139,92,246,.05) !important;
          }
          .bb-modules-section .bb-module-card:hover,
          .bb-team-section .bb-team-card:hover {
            border-color: rgba(196,181,253,.65) !important;
            box-shadow: 0 20px 48px rgba(0,0,0,.36), 0 0 28px rgba(139,92,246,.18) !important;
          }
          .bb-module-card h3,
          .bb-module-card h4,
          .bb-team-name { color: #fff !important; }
          .bb-module-card p,
          .bb-team-subtitle { color: rgba(255,255,255,.78) !important; }
          .bb-module-card svg,
          .bb-module-icon,
          .bb-team-avatar-mark { color: #c4b5fd !important; }
          .bb-module-card::before,
          .bb-team-card::before {
            background: linear-gradient(90deg, transparent, #a78bfa, #fff, #a78bfa, transparent) !important;
          }
          .bb-team-photo {
            border-color: rgba(167,139,250,.3) !important;
            background: radial-gradient(circle at 50% 30%, rgba(139,92,246,.2), transparent 55%), linear-gradient(145deg, #120a20, #07040e) !important;
          }
          .bb-team-photo-hint { color: rgba(255,255,255,.58) !important; }

          /* Overview is page two: remove every pink/original event accent */
          .bb-next-section,
          .bb-modules-section,
          .bb-team-section {
            color: #fff !important;
            background:
              radial-gradient(ellipse at 12% 18%, rgba(109,40,217,.28), transparent 40%),
              radial-gradient(ellipse at 88% 30%, rgba(37,99,235,.16), transparent 42%),
              radial-gradient(ellipse at 52% 100%, rgba(79,70,229,.16), transparent 50%),
              linear-gradient(135deg, #05030d 0%, #100821 48%, #050914 100%) !important;
          }
          .bb-next-section::before,
          .bb-modules-section::before,
          .bb-team-section::before {
            background-image:
              radial-gradient(1px 1px at 7% 15%, #fff 55%, transparent 75%),
              radial-gradient(1.5px 1.5px at 18% 73%, #c4b5fd 55%, transparent 75%),
              radial-gradient(1px 1px at 34% 31%, #fff 55%, transparent 75%),
              radial-gradient(2px 2px at 55% 14%, #a78bfa 55%, transparent 75%),
              radial-gradient(1px 1px at 71% 65%, #fff 55%, transparent 75%),
              radial-gradient(1.5px 1.5px at 88% 27%, #93c5fd 55%, transparent 75%),
              radial-gradient(1px 1px at 94% 83%, #fff 55%, transparent 75%) !important;
          }
          .bb-next-section .bb-overview-event-card {
            --event-accent: #a78bfa !important;
            border-color: rgba(167,139,250,.3) !important;
            background: linear-gradient(145deg, rgba(139,92,246,.12), rgba(8,4,17,.95) 64%, rgba(59,130,246,.08)) !important;
            box-shadow: 0 18px 42px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.06), 0 0 18px rgba(139,92,246,.06) !important;
          }
          .bb-next-section .bb-overview-event-card *,
          .bb-next-section .bb-overview-event-card h3,
          .bb-next-section .bb-overview-event-card span,
          .bb-next-section .bb-overview-event-card strong {
            --event-accent: #a78bfa !important;
          }
          .bb-overview-event-card h3,
          .bb-overview-event-icon,
          .bb-overview-event-code,
          .bb-overview-event-card [style*="color"] {
            color: #f5f3ff !important;
          }
          .bb-overview-title,
          .bb-modules-title,
          .bb-team-title {
            color: #fff !important;
            background: linear-gradient(100deg, #fff 8%, #ddd6fe 48%, #bfdbfe 100%) !important;
            -webkit-background-clip: text !important;
            background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            filter: drop-shadow(0 0 18px rgba(139,92,246,.22)) !important;
          }
          .bb-overview-kicker,
          .bb-overview-card-label,
          .bb-overview-tag,
          .bb-overview-event-code,
          .bb-modules-kicker,
          .bb-team-kicker,
          .bb-module-number,
          .bb-module-label,
          .bb-team-role,
          .bb-team-name-hint {
            color: #c4b5fd !important;
          }
          .bb-overview-rule {
            background: linear-gradient(90deg, #8b5cf6, #c4b5fd, #93c5fd, transparent) !important;
            box-shadow: 0 0 16px rgba(139,92,246,.3) !important;
          }
          .bb-overview-card,
          .bb-overview-event-card,
          .bb-modules-section .bb-module-card,
          .bb-team-section .bb-team-card {
            border-color: rgba(167,139,250,.28) !important;
            background: linear-gradient(145deg, rgba(139,92,246,.12), rgba(8,4,17,.95) 65%, rgba(59,130,246,.07)) !important;
            box-shadow: 0 18px 42px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06), 0 0 20px rgba(139,92,246,.05) !important;
          }
          .bb-overview-card:hover,
          .bb-overview-event-card:hover,
          .bb-modules-section .bb-module-card:hover,
          .bb-team-section .bb-team-card:hover {
            border-color: rgba(196,181,253,.68) !important;
            box-shadow: 0 20px 48px rgba(0,0,0,.36), 0 0 28px rgba(139,92,246,.18) !important;
          }
          .bb-overview-tag {
            color: #f5f3ff !important;
            border-color: rgba(196,181,253,.28) !important;
            background: rgba(139,92,246,.10) !important;
          }
          .bb-team-photo {
            border-color: rgba(167,139,250,.3) !important;
            background: radial-gradient(circle at 50% 30%, rgba(139,92,246,.2), transparent 55%), linear-gradient(145deg, #120a20, #07040e) !important;
          }

          /* FINAL FIX: remove the remaining pink neon bars/accents; use violet + blue only */
          .bb-next-section,
          .bb-modules-section,
          .bb-team-section,
          .bb-next-section *,
          .bb-modules-section *,
          .bb-team-section * {
            --bb-pink: #8b5cf6 !important;
            --bb-cyan: #60a5fa !important;
            --bb-violet: #a78bfa !important;
            --event-accent: #8b5cf6 !important;
          }
          .bb-next-section [style*="#ff4fa8"],
          .bb-next-section [style*="#ff63bd"],
          .bb-next-section [style*="255, 79, 168"],
          .bb-next-section [style*="255, 99, 189"],
          .bb-modules-section [style*="#ff4fa8"],
          .bb-modules-section [style*="#ff63bd"],
          .bb-team-section [style*="#ff4fa8"],
          .bb-team-section [style*="#ff63bd"] {
            color: #c4b5fd !important;
            border-color: rgba(139,92,246,.65) !important;
            background-color: #8b5cf6 !important;
            box-shadow: 0 0 14px rgba(139,92,246,.45) !important;
          }
          .bb-overview-rule,
          .bb-overview-card::before,
          .bb-overview-card::after,
          .bb-overview-event-card::before,
          .bb-overview-event-card::after,
          .bb-module-card::before,
          .bb-module-card::after,
          .bb-team-card::before,
          .bb-team-card::after {
            background-image: linear-gradient(90deg, #6d28d9 0%, #8b5cf6 48%, #60a5fa 100%) !important;
            border-color: rgba(139,92,246,.55) !important;
            box-shadow: 0 0 14px rgba(96,165,250,.22) !important;
          }
          .bb-overview-event-card,
          .bb-overview-card,
          .bb-module-card,
          .bb-team-card {
            --event-accent: #8b5cf6 !important;
            accent-color: #8b5cf6 !important;
          }


          /* FINAL PINK-ACCENT OVERRIDE — purple/blue only across all three scroll sections */
          .bb-page {
            --bb-pink: #8b5cf6 !important;
            --bb-cyan: #60a5fa !important;
            --bb-violet: #a78bfa !important;
            --event-accent: #8b5cf6 !important;
          }
          .bb-next-section,
          .bb-modules-section,
          .bb-team-section,
          .bb-next-section *,
          .bb-modules-section *,
          .bb-team-section * {
            --bb-pink: #8b5cf6 !important;
            --bb-cyan: #60a5fa !important;
            --bb-violet: #a78bfa !important;
            --event-accent: #8b5cf6 !important;
            accent-color: #8b5cf6 !important;
          }
          .bb-overview-rule,
          .bb-overview-card::before,
          .bb-overview-card::after,
          .bb-overview-event-card::before,
          .bb-overview-event-card::after,
          .bb-module-card::before,
          .bb-module-card::after,
          .bb-team-card::before,
          .bb-team-card::after,
          .bb-modules-logo-shell::before,
          .bb-modules-logo-shell::after,
          .bb-team-photo::before,
          .bb-team-photo::after {
            background-image: linear-gradient(90deg, #6d28d9 0%, #8b5cf6 48%, #60a5fa 100%) !important;
            border-color: rgba(139, 92, 246, .7) !important;
            box-shadow: 0 0 12px rgba(96, 165, 250, .2) !important;
          }
          .bb-overview-card,
          .bb-overview-event-card,
          .bb-module-card,
          .bb-team-card,
          .bb-modules-logo-shell,
          .bb-team-photo {
            --event-accent: #8b5cf6 !important;
            border-color: rgba(139, 92, 246, .55) !important;
          }
          .bb-next-section [style*="#ff"],
          .bb-modules-section [style*="#ff"],
          .bb-team-section [style*="#ff"] {
            --event-accent: #8b5cf6 !important;
          }
          .bb-overview-rule {
            background: linear-gradient(90deg, #6d28d9, #8b5cf6, #60a5fa, transparent) !important;
          }

          /* FIX: remove the oversized violet/blue pseudo-element covering team photos */
          .bb-team-section .bb-team-photo::before,
          .bb-team-section .bb-team-photo::after {
            content: none !important;
            display: none !important;
            background: none !important;
            background-image: none !important;
            box-shadow: none !important;
            border: 0 !important;
          }
          .bb-team-section .bb-team-member-photo {
            position: absolute !important;
            z-index: 1 !important;
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center top !important;
          }


          /* FINAL PINK-LINE FIX: use violet-to-blue on all three pages */
          .bb-overview-kicker::before,
          .bb-overview-rule,
          .bb-poster-index::before,
          .bb-modules-section .bb-poster-index::before,
          .bb-team-section .bb-poster-index::before {
            background: linear-gradient(90deg, #8b5cf6 0%, #60a5fa 100%) !important;
            background-image: linear-gradient(90deg, #8b5cf6 0%, #60a5fa 100%) !important;
            box-shadow: 0 0 10px rgba(139, 92, 246, .65), 0 0 22px rgba(96, 165, 250, .32) !important;
          }

        `}</style>

      </main>

      <section className="bb-next-section" aria-label="Event overview">
        <div className="bb-scroll-ships bb-scroll-ships-overview" style={{ "--bb-jet-url": `url(${jetUrl})` }} aria-hidden="true">
          <span className="bb-scroll-ship bb-scroll-ship-one" />
          <span className="bb-scroll-ship bb-scroll-ship-two" />
        </div>
        <img className="bb-overview-poster" src={overviewPosterUrl} alt="Battleblaze event poster" draggable="false" />

        <div className="bb-next-layout">
          <div className="bb-overview-copy">
            <div className="bb-overview-kicker">BATTLEBLAZE // 2026</div>
            <h2 className="bb-overview-title">EVENT OVERVIEW</h2>
            <div className="bb-overview-rule" />
            <div className="bb-overview-card">
              <p className="bb-overview-card-label">ENTER THE ARENA</p>
              <p className="bb-overview-description">
                Seven arenas. Seven ways to compete. Pick your game, bring your squad,
                and make your mark at Battleblaze 2026.
              </p>
              <div className="bb-overview-tags" aria-label="Event highlights">
                <span className="bb-overview-tag">COMPETE</span>
                <span className="bb-overview-tag">CONNECT</span>
                <span className="bb-overview-tag">CONQUER</span>
              </div>
            </div>

            <div className="bb-overview-events" aria-label="Battleblaze events">
              {[
                { name: "FIFA", code: "ARENA 01 // FOOTBALL", color: "#45ffb0", icon: "⚽", prize: "₹5,000" },
                { name: "VALORANT", code: "ARENA 02 // TACTICAL FPS", color: "#8b5cf6", icon: "◈", prize: "₹8,000" },
                { name: "BGMI", code: "ARENA 03 // BATTLE ROYALE", color: "#ffb347", icon: "⌖", prize: "₹10,000" },
                { name: "FF", code: "ARENA 04 // SURVIVAL", color: "#ff6b35", icon: "✦", prize: "₹6,000" },
                { name: "PS5 RUSH", code: "ARENA 05 // CONSOLE", color: "#5c8dff", icon: "△", prize: "₹3,000" },
                { name: "VRXPERIENCE", code: "ARENA 06 // IMMERSIVE", color: "#bf7bff", icon: "◎", prize: "₹2,500" },
                { name: "RC", code: "ARENA 07 // RC RACING", color: "#00eaff", icon: "↗", prize: "₹2,000" },
              ].map((event) => (
                <article className="bb-overview-event-card" key={event.name} style={{ "--event-accent": event.color }}>
                  <div className="bb-overview-event-top">
                    <span className="bb-overview-event-icon" aria-hidden="true">{event.icon}</span>
                    <span className="bb-overview-event-code">{event.code}</span>
                  </div>
                  <h3>{event.name}</h3>
                  <div className="bb-overview-event-prize">
                    <span>PRIZE POOL</span>
                    <strong>{event.prize}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bb-modules-section" aria-label="Battleblaze modules">
        <div className="bb-scroll-ships bb-scroll-ships-modules" style={{ "--bb-jet-url": `url(${jetUrl})` }} aria-hidden="true">
          <span className="bb-scroll-ship bb-scroll-ship-one" />
          <span className="bb-scroll-ship bb-scroll-ship-two" />
        </div>
        <div className="bb-modules-inner">
          <header className="bb-modules-heading">
            <div className="bb-modules-logo-shell">
              <img className="bb-modules-logo" src={logoUrl} alt="Battleblaze logo" draggable="false" />
            </div>
            <p className="bb-modules-kicker">Choose your arena // 2026</p>
            <h2 className="bb-modules-title">MODULES</h2>
            <p className="bb-modules-subtitle">
              Choose your game. Build your squad. Own the arena.
            </p>
          </header>

          <div className="bb-modules-grid">
            {[
              { name: "BGMI", game: "BGMI", code: "01 // BATTLE ROYALE", icon: "⌖", description: "Squad up and fight for the final zone." },
              { name: "FREE FIRE", game: "FREE_FIRE", code: "02 // SURVIVAL", icon: "✦", description: "Move fast. Aim sharp. Claim the win." },
              { name: "VALORANT", game: "VALORANT", code: "03 // TACTICAL FPS", icon: "◈", description: "Teamwork and precision win every round." },
              { name: "FIFA", game: "FIFA", code: "04 // FOOTBALL", icon: "⚽", description: "Control the pitch and score the win." },
              { name: "MOBILE LEGENDS", game: "MOBILE_LEGENDS", code: "05 // MOBA", icon: "⬡", description: "Pick your hero. Team up. Push to win." },
              { name: "VR EXPERIENCE", game: "VR_EXPERIENCE", code: "06 // IMMERSIVE", icon: "◎", description: "Enter an immersive virtual world." },
              { name: "PS5 RUSH", game: "PS5_RUSH", code: "07 // CONSOLE", icon: "△", description: "Grab a controller and challenge rivals." },
              { name: "RC", game: "RC", code: "08 // REAL CRICKET", icon: "🏏", description: "Represent your side and compete for the win." },
            ].map((module, index) => (
              <article className="bb-module-card" key={module.name}>
                <div className="bb-module-poster">
                  <div className="bb-poster-top">
                    <span className="bb-poster-index">BATTLEBLAZE / {String(index + 1).padStart(2, "0")}</span>
                    <div className="bb-poster-icon" aria-hidden="true">{module.icon}</div>
                    <h3 className="bb-poster-title">{module.name}</h3>
                    <p className="bb-poster-code">{module.code}</p>
                  </div>
                  <div className="bb-poster-bottom">
                    <span className="bb-poster-index">NITS ESPORTS · 2026</span>
                  </div>
                </div>
                <div className="bb-module-card-copy">
                  <p className="bb-module-description">{module.description}</p>
                  <a
                    className="bb-register-button"
                    href={`/register?game=${encodeURIComponent(module.game)}`}
                    onClick={(event) => {
                      event.preventDefault();
                      const registrationUrl = `/register?game=${encodeURIComponent(module.game)}`;
                      // Use same-origin navigation so the selected event query reaches Registerbb.jsx.
                      window.location.assign(registrationUrl);
                    }}
                    role="link"
                    aria-label={`Register for ${module.name}`}
                  >
                    <span>Register Now</span><span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bb-team-section" aria-label="Battleblaze team">
        <div className="bb-scroll-ships bb-scroll-ships-team" style={{ "--bb-jet-url": `url(${jetUrl})` }} aria-hidden="true">
          <span className="bb-scroll-ship bb-scroll-ship-one" />
          <span className="bb-scroll-ship bb-scroll-ship-two" />
        </div>
        <div className="bb-team-inner">
          <header className="bb-team-heading">
            <div className="bb-modules-logo-shell bb-team-logo-shell">
              <img className="bb-modules-logo" src={logoUrl} alt="Battleblaze logo" draggable="false" />
            </div>
            <p className="bb-team-kicker">The people behind the arena // 2026</p>
            <h2 className="bb-team-title">MEET THE TEAM</h2>
            <p className="bb-team-subtitle">
              Meet the crew behind Battleblaze.
            </p>
          </header>
          <div className="bb-team-grid">
            {[
              {
                role: "Module Head",
                label: "Harendra Nagar",
                phone: "9079359513",
                photo: moduleHeadPhoto,
                icon: "⌖",
              },
              {
                role: "Module Co-Head",
                label: "Chirag Khandelwal",
                phone: "6003757252",
                photo: moduleCoHeadPhoto,
                icon: "⬡",
              },
              {
                role: "Coordinator 01",
                label: "Satyam Kumar Jha",
                phone: "9829305027",
                photo: coordinator1Photo,
                icon: "✦",
              },
              {
                role: "Coordinator 02",
                label: "Praveen Goyal",
                phone: "8209311875",
                photo: coordinator2Photo,
                icon: "◈",
              },
            ].map((member, index) => (
              <article className="bb-team-card" key={member.role}>
                <div className="bb-team-photo" aria-label={`${member.label} photo`}>
                  <img
                    className="bb-team-member-photo"
                    src={member.photo}
                    alt={member.label}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="bb-team-card-meta">
                  <p className="bb-team-role">{`TEAM MEMBER / 0${index + 1}`}</p>
                  <h3 className="bb-team-name">{member.label}</h3>
                  <p className="bb-team-name-hint">{member.role} · BattleBlaze</p>
                  <a className="bb-team-phone" href={`tel:${member.phone}`}>
                    <span aria-hidden="true">☎</span> {member.phone}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>

  );

}