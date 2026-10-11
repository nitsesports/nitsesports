import React, { useEffect, useRef, useState } from "react";

import * as THREE from "three";

import bgmUrl from "../assets/bgm.mp4";

import artworkUrl from "../assets/BattleblazeHeroArtwork.png";

import jetUrl from "../assets/jet.png";

import astronautUrl from "../assets/astro.png";

import islandUrl from "../assets/island.png";

import island2Url from "../assets/island2.png";

import island3Url from "../assets/island3.png";

import island4Url from "../assets/island4.png";

import island5Url from "../assets/island5.png";

import island6Url from "../assets/island6.png";

import logoUrl from "../assets/logoo2.png";

import comingSoonUrl from "../assets/cs.png";

const EVENTS = [

  { id: "ROBOWAR", color: "#ff3b45", x: 15.5 },

  { id: "ROBOSOCCER", color: "#ffd60a", x: 32.5 },

  { id: "ROBOSUMO", color: "#00aaff", x: 49.5 },

  { id: "ROBODRIFT", color: "#bf5af2", x: 67.5 },

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

  const [activeEvent, setActiveEvent] = useState("ROBOWAR");

  const [hoverColor, setHoverColor] = useState("#ff3f9f");

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

    const astronautFleet = [];

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

      new THREE.Color("#ff2a85"),

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

      grad.addColorStop(0.85, "rgba(255, 42, 133, 0.9)");

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

        const shipCount = 4;

        const halfWidth = getVisibleWidth() / 2;

        const halfHeight = getVisibleHeight() / 2;

        for (let i = 0; i < shipCount; i += 1) {

          const direction = Math.random() < 0.5 ? 1 : -1;

          const width = randomBetween(7, 12);

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

            speed: randomBetween(13, 27),

            baseY: randomBetween(-halfHeight * 0.7, halfHeight * 0.7),

            amplitude: randomBetween(1.5, 4),

            frequency: randomBetween(0.45, 1),

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

        asset: 0, // Lower-Left Island

        x: randomBetween(-0.20, -0.12),

        y: randomBetween(-0.16, -0.06),

        widthFrac: randomBetween(0.14, 0.18),

        z: 16,

        phase: Math.random() * Math.PI * 2,

        drift: randomBetween(2.2, 3.4),

        speed: randomBetween(0.40, 0.58),

        isStatic: false,

      },

      {

        asset: 0, // Lower-Right Island

        x: randomBetween(0.16, 0.24),

        y: randomBetween(-0.28, -0.20),

        widthFrac: randomBetween(0.14, 0.18),

        z: 17,

        phase: Math.random() * Math.PI * 2,

        drift: randomBetween(2.4, 3.6),

        speed: randomBetween(0.38, 0.55),

        isStatic: false,

      },

      {

        asset: 0, // Upper-Left Island

        x: randomBetween(-0.34, -0.16),

        y: randomBetween(0.12, 0.24),

        widthFrac: randomBetween(0.14, 0.18),

        z: 18,

        phase: Math.random() * Math.PI * 2,

        drift: randomBetween(2.0, 3.2),

        speed: randomBetween(0.42, 0.60),

        isStatic: false,

      },

      {

        asset: 0, // Upper-Right Island

        x: randomBetween(0.16, 0.24),

        y: randomBetween(0.24, 0.32),

        widthFrac: randomBetween(0.14, 0.18),

        z: 19,

        phase: Math.random() * Math.PI * 2,

        drift: randomBetween(2.2, 3.4),

        speed: randomBetween(0.39, 0.56),

        isStatic: false,

      },

      {

        asset: 1, // Central Island

        x: randomBetween(-0.05, 0.05),

        y: randomBetween(-0.08, 0.02),

        widthFrac: 0.48,

        z: 12,

        phase: Math.random() * Math.PI * 2,

        drift: randomBetween(2.5, 3.8),

        speed: randomBetween(0.35, 0.50),

        isStatic: false,

      },

      {

        asset: 2, // Large Island 3 (with astronaut) - FRONT LAYER: STATIC

        x: -0.28,

        y: -0.06,

        widthFrac: 0.72,

        z: 32, // Front layer

        renderOrder: 10,

        phase: 0,

        drift: 0, // NO DRIFT

        speed: 0, // NO SPEED

        isStatic: true,

      },

      {

        asset: 3, // Island 4 (Far-Right & Middle height)

        x: randomBetween(0.32, 0.40),

        y: randomBetween(-0.02, 0.08),

        widthFrac: randomBetween(0.24, 0.30),

        z: 16,

        phase: Math.random() * Math.PI * 2,

        drift: randomBetween(2.2, 3.5),

        speed: randomBetween(0.37, 0.54),

        isStatic: false,

      },

      {

        asset: 4, // Island 5 - Nestled in the Mid-Right open sky

        x: randomBetween(0.12, 0.18),

        y: randomBetween(0.04, 0.12),

        widthFrac: randomBetween(0.18, 0.23),

        z: 14,

        phase: Math.random() * Math.PI * 2,

        drift: randomBetween(2.0, 3.3),

        speed: randomBetween(0.39, 0.56),

        isStatic: false,

      },

      {

        asset: 5, // Large Island 6 - Sticking to Bottom-Right Corner & Out of Screen at Bottom

        x: 0.31,

        y: -0.28,

        widthFrac: 0.74,

        z: 30,

        renderOrder: 8,

        phase: Math.random() * Math.PI * 2,

        drift: randomBetween(1.8, 2.8),

        speed: randomBetween(0.34, 0.48),

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

    textureLoader.load(islandUrl, (tex) => addIslandTexture(tex, 0), undefined, (e) => console.error("island:", e));

    textureLoader.load(island2Url, (tex) => addIslandTexture(tex, 1), undefined, (e) => console.error("island2:", e));

    textureLoader.load(island3Url, (tex) => addIslandTexture(tex, 2), undefined, (e) => console.error("island3:", e));

    textureLoader.load(island4Url, (tex) => addIslandTexture(tex, 3), undefined, (e) => console.error("island4:", e));

    textureLoader.load(island5Url, (tex) => addIslandTexture(tex, 4), undefined, (e) => console.error("island5:", e));

    textureLoader.load(island6Url, (tex) => addIslandTexture(tex, 5), undefined, (e) => console.error("island6:", e));

    // ─────────────── FLYING ASTRONAUT FIGHTERS ───────────────

    textureLoader.load(

      astronautUrl,

      (texture) => {

        if (disposed) {

          texture.dispose();

          return;

        }

        texture.colorSpace = THREE.SRGBColorSpace;

        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);

        const displayTexture = texture;

        disposableTextures.push(texture);

        const leftFacingTexture = displayTexture.clone();

        leftFacingTexture.wrapS = THREE.RepeatWrapping;

        leftFacingTexture.repeat.x = -1;

        leftFacingTexture.offset.x = 1;

        leftFacingTexture.colorSpace = THREE.SRGBColorSpace;

        leftFacingTexture.needsUpdate = true;

        disposableTextures.push(leftFacingTexture);

        const image = displayTexture.image;

        const aspect = image?.width && image?.height ? image.width / image.height : 0.8;

        const fighterConfigs = Array.from({ length: 3 }, () => ({

          y: randomBetween(0.18, 0.78),

          direction: -1,

          size: randomBetween(5.5, 6.5),

          speed: randomBetween(5.5, 9.5),

          phase: Math.random() * Math.PI * 2,

          amplitude: randomBetween(1.2, 3.8),

          curve: randomBetween(1.0, 3.5),

          frequency: randomBetween(0.35, 0.85),

          z: randomBetween(8, 14),

          startX: randomBetween(-0.95, 0.98),

        }));

        fighterConfigs.forEach((config) => {

          const material = new THREE.SpriteMaterial({

            map: leftFacingTexture,

            transparent: true,

            opacity: 1.0,

            depthWrite: false,

            depthTest: true,

            alphaTest: 0.05,

            toneMapped: false,

          });

          const sprite = new THREE.Sprite(material);

          const height = config.size;

          const width = height * Math.max(aspect, 0.45);

          sprite.scale.set(width, height, 1);

          sprite.position.set(

            (config.startX * getVisibleWidth()) / 2,

            (config.y * getVisibleHeight()) / 2,

            config.z

          );

          sprite.renderOrder = 1;

          scene.add(sprite);

          astronautFleet.push({

            sprite,

            direction: -1,

            speed: config.speed,

            baseY: sprite.position.y,

            phase: config.phase,

            amplitude: config.amplitude,

            curve: config.curve,

            frequency: config.frequency,

            baseWidth: width,

            width,

            aspect: Math.max(aspect, 0.45),

            z: config.z,

          });

        });

      },

      undefined,

      (error) => console.error("Unable to load astro.png:", error)

    );

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

      astronautFleet.forEach((fighter) => {

        fighter.width = fighter.baseWidth * scaleMultiplier;

        fighter.sprite.scale.set(fighter.width, fighter.width / fighter.aspect, 1);

      });

    };

    const handleScrollZoom = () => {

      if (disposed) return;

      const hero = rootRef.current;

      if (!hero) return;

      const rect = hero.getBoundingClientRect();

      const travel = Math.max(window.innerHeight * 1.65, 1);

      const progress = THREE.MathUtils.clamp(-rect.top / travel, 0, 1);

      const zoomWave = Math.sin(progress * Math.PI);

      camera.position.z = 100 + zoomWave * 24;

      camera.updateProjectionMatrix();

      hero.style.setProperty("--bb-scroll-scale", String(1 + zoomWave * 0.035));

      const headingZoom = 1 + zoomWave * 0.16;

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

      const astronautHalfWidth = getVisibleWidth() / 2;

      const astronautHalfHeight = getVisibleHeight() / 2;

      astronautFleet.forEach((fighter) => {

        const { sprite, speed, phase, amplitude, frequency, width, curve } = fighter;

        sprite.position.x -= speed * delta;

        sprite.position.y =

          fighter.baseY +

          Math.sin(time * frequency + phase) * amplitude +

          Math.sin(time * 0.22 + phase * 1.7) * curve;

        sprite.material.rotation = Math.sin(time * frequency + phase) * 0.06;

        if (sprite.position.x < -astronautHalfWidth - width) {

          sprite.position.x = astronautHalfWidth + width + randomBetween(0, 24);

          fighter.baseY = randomBetween(

            astronautHalfHeight * 0.12,

            astronautHalfHeight * 0.78

          );

          fighter.phase = Math.random() * Math.PI * 2;

          fighter.amplitude = randomBetween(1.2, 3.8);

          fighter.curve = randomBetween(1.0, 3.5);

          fighter.speed = randomBetween(5.5, 9.5);

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

      astronautFleet.forEach(({ sprite }) => {

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

    <div className="bb-page">

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

        }}

      >

        <img

          className="bb-match-art"

          src={artworkUrl}

          alt=""

          draggable="false"

        />

        <div className="bb-match-stars" ref={sceneMount} aria-hidden="true" />

        <div className="bb-match-vignette" aria-hidden="true" />

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

            onMouseEnter={() => hover("#ff3b45")}

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

          onMouseEnter={() => hover("#ff2a85")}

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

        <div className="bb-coming-soon-wrap" aria-label="Coming soon">

          <span className="bb-coming-soon-aura" aria-hidden="true" />

          <img className="bb-coming-soon-art" src={comingSoonUrl} alt="Coming soon" draggable="false" />

        </div>

        <span className="bb-match-sound-state" aria-live="polite">

          {muted ? "AUDIO MUTED" : "AUDIO ON"}

        </span>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Rajdhani:wght@400;500;600;700&display=swap');

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

              linear-gradient(115deg, rgba(180, 20, 120, 0.3), transparent 50%, rgba(255, 50, 140, 0.2)),

              linear-gradient(180deg, rgba(20, 10, 50, 0.5) 0%, transparent 30%, rgba(255, 40, 120, 0.15) 70%, rgba(15, 5, 35, 0.6) 100%);

            mix-blend-mode: screen;

            opacity: 0.95;

          }

          /* ─────────────── CENTER LOGO & FIRE EFFECT ─────────────── */

          .bb-hero-logo-box {

            position: absolute;

            left: 50%;

            top: 48%;

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

                rgba(255, 43, 143, .11) 112deg,

                transparent 145deg,

                rgba(145, 90, 255, .035) 183deg,

                transparent 220deg,

                rgba(255, 43, 143, .09) 272deg,

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

              rgba(255, 45, 155, 0.035) 0%,

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

              rgba(255, 70, 175, 0.025) 0%,

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

              rgba(255, 65, 165, 0.025) 55deg,

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

            background: #ff8bc9;

            box-shadow: 0 0 3px rgba(255, 105, 190, 0.35), 0 0 6px rgba(65, 155, 255, 0.25);

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

            width: clamp(450px, 54vw, 830px);

            max-width: 94vw;

            height: auto;

            object-fit: contain;

            filter: drop-shadow(0 0 14px rgba(255, 59, 69, 0.30))

                    drop-shadow(0 0 35px rgba(255, 42, 133, 0.16))

                    drop-shadow(0 0 28px rgba(145, 90, 255, 0.05));

            transition: filter 260ms ease;

          }

          .bb-logo-link:hover .bb-event-logo {

            filter: drop-shadow(0 0 20px rgba(255, 59, 69, 0.42))

                    drop-shadow(0 0 50px rgba(255, 42, 133, 0.24))

                    drop-shadow(0 0 34px rgba(145, 90, 255, 0.12));

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

          .bb-hotspot:focus-visible {

            outline: 2px solid var(--bb-cursor);

            outline-offset: 4px;

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

            display: grid; place-items: center; border: 1px solid rgba(255,42,133,.8);

            border-radius: 50%; background: rgba(13,7,30,.72);

            box-shadow: 0 0 20px rgba(255,42,133,.2), inset 0 0 18px rgba(255,42,133,.08);

            cursor: pointer; transition: background 180ms ease,transform 180ms ease;

          }

          .bb-hotspot-sound:hover { background:rgba(255,42,133,.22); transform:scale(1.06); }

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

              radial-gradient(ellipse at 50% 70%, rgba(255, 38, 143, .16) 0%, rgba(255, 38, 143, .06) 34%, transparent 66%),

              radial-gradient(ellipse at 28% 55%, rgba(0, 224, 255, .12) 0%, transparent 55%),

              radial-gradient(ellipse at 75% 48%, rgba(255, 184, 74, .08) 0%, transparent 48%);

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

              rgba(255, 43, 143, .20) 126deg, transparent 151deg,

              rgba(255, 187, 75, .08) 193deg, transparent 220deg,

              rgba(255, 43, 143, .18) 274deg, transparent 310deg);

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

            filter: drop-shadow(0 0 5px rgba(255, 42, 133, .28))

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

            .bb-hero-logo-box { top: 43%; max-width: 96vw; }

            .bb-event-logo {

              width: clamp(320px, 62vw, 520px);

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

              object-position: center center;

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

            .bb-logo-link { max-width: 94vw; }

            .bb-event-logo {

              display: block;

              width: 88vw;

              max-width: 410px;

              max-height: 29svh;

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

            .bb-next-title { font-size: clamp(3.5rem, 14vw, 7rem); }

          }

          /* Narrow phones */

          @media (max-width: 420px) {

            .bb-match { min-height: 540px; }

            .bb-hero-logo-box { top: 42%; }

            .bb-logo-link { max-width: 92vw; }

            .bb-event-logo {

              width: 86vw;

              max-width: 370px;

              max-height: 28svh;

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

            .bb-event-logo { width: 78vw; }

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

            .bb-event-logo { width: min(56vw, 420px); max-height: 38svh; }

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
            inset: 0;
            pointer-events: none;
            z-index: -2;
            background:
              radial-gradient(ellipse at 12% 35%, rgba(255, 35, 145, .25), transparent 42%),
              radial-gradient(ellipse at 88% 62%, rgba(0, 190, 255, .22), transparent 43%),
              linear-gradient(125deg, #10051e 0%, #080a25 48%, #10051b 100%);
          }

          .bb-next-section::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: -1;
            opacity: .42;
            background:
              radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,.8) 50%, transparent 70%),
              radial-gradient(1.5px 1.5px at 78% 23%, rgba(0,234,255,.8) 50%, transparent 70%),
              radial-gradient(1px 1px at 64% 76%, rgba(255,255,255,.7) 50%, transparent 70%),
              radial-gradient(2px 2px at 25% 82%, rgba(255,42,145,.8) 50%, transparent 70%),
              linear-gradient(115deg, transparent 0 32%, rgba(255,255,255,.035) 32.1%, transparent 32.5% 68%, rgba(0,225,255,.04) 68.1%, transparent 68.5%),
              radial-gradient(1px 1px at 42% 12%, rgba(255,255,255,.8) 50%, transparent 75%),
              radial-gradient(1px 1px at 91% 54%, rgba(255,115,198,.8) 50%, transparent 75%),
              radial-gradient(1.5px 1.5px at 36% 61%, rgba(130,239,255,.75) 50%, transparent 75%),
              radial-gradient(circle at 50% 50%, transparent 0 45%, rgba(0,0,0,.38) 100%);
            animation: bb-overview-space-drift 14s ease-in-out infinite alternate;
          }
          @keyframes bb-overview-space-drift {
            from { opacity: .28; transform: translate3d(0, 0, 0); }
            to { opacity: .62; transform: translate3d(0, -8px, 0); }
          }

          .bb-next-layout {
            width: min(1380px, 100%);
            margin: 0 auto;
            display: grid;
            grid-template-columns: minmax(0, .92fr) minmax(320px, .78fr);
            align-items: center;
            gap: clamp(38px, 7vw, 110px);
            position: relative;
            z-index: 1;
          }

          .bb-overview-copy { max-width: 650px; text-align: left; }

          .bb-overview-kicker {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin: 0 0 20px;
            color: #8deeff;
            font: 700 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .28em;
            text-transform: uppercase;
          }

          .bb-overview-kicker::before {
            content: "";
            width: 30px;
            height: 2px;
            background: linear-gradient(90deg, #ff2a91, #00eaff);
            box-shadow: 0 0 12px rgba(0,234,255,.55);
          }

          .bb-overview-title {
            margin: 0;
            font-family: Impact, "Arial Black", "Franklin Gothic Heavy", sans-serif;
            font-size: clamp(3.8rem, 7.2vw, 7.4rem);
            line-height: .88;
            letter-spacing: -.035em;
            text-transform: uppercase;
            background: linear-gradient(100deg, #fff 8%, #ffd8ed 42%, #ff3b9d 70%, #8beeff 112%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 10px 35px rgba(255, 42, 145, .14));
          }

          .bb-overview-rule {
            width: min(340px, 70%);
            height: 2px;
            margin: 28px 0;
            background: linear-gradient(90deg, #ff2a91, #8a5cff 52%, #00eaff, transparent);
            box-shadow: 0 0 18px rgba(0,234,255,.18);
          }

          .bb-overview-card {
            position: relative;
            max-width: 590px;
            padding: clamp(22px, 3vw, 34px);
            border: 1px solid rgba(159, 150, 255, .27);
            border-radius: 18px;
            background: linear-gradient(135deg, rgba(255, 35, 145, .12), rgba(13, 19, 53, .82) 48%, rgba(0, 210, 255, .09));
            box-shadow: 0 24px 70px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08);
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
            background: linear-gradient(90deg, #ff2a91, #00eaff);
            box-shadow: 0 0 18px rgba(255,42,145,.6);
          }

          .bb-overview-card-label {
            margin: 0 0 12px;
            color: #ff8bc7;
            font: 800 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .2em;
            text-transform: uppercase;
          }

          .bb-overview-description {
            margin: 0;
            color: rgba(244, 245, 255, .83);
            font: 400 clamp(15px, 1.15vw, 18px)/1.85 Inter, "Segoe UI", sans-serif;
          }

          .bb-overview-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 9px;
            margin-top: 24px;
          }

          .bb-overview-tag {
            padding: 8px 11px;
            border: 1px solid rgba(137, 222, 255, .22);
            border-radius: 999px;
            color: #dffaff;
            background: rgba(0, 205, 255, .06);
            font: 700 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .09em;
            text-transform: uppercase;
          }

          .bb-module-frame {
            position: relative;
            width: min(100%, 470px);
            aspect-ratio: 4 / 5;
            justify-self: center;
            padding: 11px;
            border-radius: 24px;
            background: linear-gradient(145deg, rgba(255, 42, 145, .96), rgba(138, 92, 255, .8) 48%, rgba(0, 234, 255, .95));
            box-shadow: 0 0 0 1px rgba(255,255,255,.12), 0 28px 90px rgba(0,0,0,.48), 0 0 48px rgba(255,42,145,.17), 0 0 50px rgba(0,234,255,.12);
          }

          .bb-module-frame::before {
            content: "";
            position: absolute;
            inset: -12px;
            border: 1px solid rgba(126, 215, 255, .22);
            border-radius: 31px;
            pointer-events: none;
          }

          .bb-module-frame-inner {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            border-radius: 16px;
            background: linear-gradient(160deg, #10091e, #090d27 56%, #150820);
            border: 1px solid rgba(255,255,255,.22);
          }

          .bb-module-brand {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 94px;
            padding: 16px 20px 12px;
            background: linear-gradient(100deg, rgba(255, 35, 145, .14), rgba(12, 13, 39, .92) 48%, rgba(0, 220, 255, .12));
            border-bottom: 1px solid rgba(150, 199, 255, .2);
          }

          .bb-module-logo {
            display: block;
            width: min(72%, 230px);
            max-height: 74px;
            object-fit: contain;
            filter: drop-shadow(0 0 16px rgba(255, 42, 145, .2));
          }

          .bb-module-image-slot {
            position: relative;
            flex: 1;
            min-height: 0;
            display: grid;
            place-items: center;
            padding: 22px;
            background:
              radial-gradient(ellipse at 50% 40%, rgba(255, 42, 145, .12), transparent 55%),
              radial-gradient(ellipse at 70% 75%, rgba(0, 220, 255, .11), transparent 52%),
              linear-gradient(145deg, rgba(255,255,255,.025), transparent 55%);
          }

          .bb-module-image-slot::before {
            content: "";
            position: absolute;
            inset: 18px;
            border: 1px dashed rgba(170, 201, 255, .24);
            border-radius: 12px;
            pointer-events: none;
          }

          .bb-module-placeholder {
            position: relative;
            z-index: 1;
            display: grid;
            justify-items: center;
            gap: 12px;
            padding: 22px;
            color: rgba(223, 232, 255, .72);
            text-align: center;
          }

          .bb-module-placeholder-mark {
            display: grid;
            place-items: center;
            width: 56px;
            height: 56px;
            border-radius: 16px;
            border: 1px solid rgba(0,234,255,.32);
            color: #a7f5ff;
            background: linear-gradient(135deg, rgba(255,42,145,.15), rgba(0,234,255,.1));
            box-shadow: 0 0 28px rgba(0,234,255,.1);
            font-size: 26px;
          }

          .bb-module-placeholder strong {
            color: #fff;
            font: 800 13px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .16em;
            text-transform: uppercase;
          }

          .bb-module-placeholder span {
            max-width: 230px;
            color: rgba(224,231,255,.55);
            font: 500 12px/1.7 Inter, "Segoe UI", sans-serif;
          }

          @media (max-width: 850px) {
            .bb-next-section { padding: 80px 6vw; }
            .bb-next-layout {
              grid-template-columns: 1fr;
              gap: 48px;
              max-width: 650px;
            }
            .bb-overview-copy { max-width: 100%; }
            .bb-overview-title { font-size: clamp(3.5rem, 12vw, 6rem); }
            .bb-module-frame { width: min(82%, 430px); }
          }

          @media (max-width: 480px) {
            .bb-next-section { padding: 68px 22px; }
            .bb-next-layout { gap: 38px; }
            .bb-overview-title { font-size: clamp(3.2rem, 15vw, 4.6rem); }
            .bb-overview-card { padding: 22px 20px; border-radius: 15px; }
            .bb-module-frame { width: min(100%, 370px); padding: 8px; border-radius: 19px; }
            .bb-module-frame-inner { border-radius: 12px; }
            .bb-module-brand { min-height: 78px; }
            .bb-module-logo { max-height: 60px; }
            .bb-module-image-slot { padding: 14px; }
            .bb-module-image-slot::before { inset: 12px; }

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
              radial-gradient(ellipse at 8% 18%, rgba(255, 36, 151, .25), transparent 38%),
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
              radial-gradient(2px 2px at 55% 14%, #ff8bc7 55%, transparent 75%),
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
            background: linear-gradient(145deg, rgba(255,42,145,.12), rgba(8,12,37,.62), rgba(0,234,255,.12));
            box-shadow: 0 0 40px rgba(255,42,145,.13), 0 0 55px rgba(0,234,255,.1), inset 0 1px 0 rgba(255,255,255,.08);
            backdrop-filter: blur(10px);
          }
          .bb-modules-logo {
            display: block;
            width: 82%;
            max-height: 82%;
            object-fit: contain;
            filter: drop-shadow(0 0 16px rgba(255,42,145,.25));
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
            font-family: "Oxanium", "Arial Black", sans-serif;
            font-weight: 800;
            font-size: clamp(3.4rem, 7.8vw, 7rem);
            line-height: .9;
            letter-spacing: -.025em;
            text-transform: uppercase;
            background: linear-gradient(100deg, #fff 8%, #ffcce7 38%, #ff3b9d 63%, #82efff 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 8px 26px rgba(255,42,145,.16));
          }
          .bb-modules-subtitle {
            max-width: 620px;
            margin: 18px auto 0;
            color: rgba(232,238,255,.72);
            font: 500 clamp(14px, 1.25vw, 17px)/1.8 "Rajdhani", "Segoe UI", sans-serif;
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
              radial-gradient(ellipse at 15% 10%, rgba(255,42,145,.3), transparent 48%),
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
            background: linear-gradient(90deg, rgba(255,42,145,.23), rgba(105,83,255,.1), rgba(0,234,255,.22));
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
            background: linear-gradient(90deg, #ff2a91, #00eaff);
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
            background: linear-gradient(135deg, rgba(255,42,145,.18), rgba(0,234,255,.12));
            box-shadow: 0 0 25px rgba(0,234,255,.12);
          }
          .bb-poster-title {
            margin: 0;
            color: #fff;
            font: 800 clamp(19px, 2vw, 27px)/.98 "Oxanium", "Arial Black", sans-serif;
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
            font: 600 15px/1.6 "Rajdhani", "Segoe UI", sans-serif;
          }
          .bb-register-button {
            font-family: "Oxanium", "Rajdhani", sans-serif;
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
            background: linear-gradient(100deg, rgba(255,42,145,.24), rgba(104,70,255,.16), rgba(0,234,255,.2));
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
            .bb-poster-title { font-size: clamp(17px, 4.7vw, 24px); }
            .bb-module-card-copy { padding: 13px 4px 4px; }
            .bb-module-description { min-height: 88px; font-size: 12px; }
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
              radial-gradient(ellipse at 10% 16%, rgba(255, 36, 151, .24), transparent 38%),
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
              radial-gradient(2px 2px at 48% 13%, #ff8bc7 55%, transparent 75%),
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
          .bb-team-kicker {
            margin: 0 0 12px; color: #9cefff;
            font: 800 11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: .32em; text-transform: uppercase;
          }
          .bb-team-title {
            margin: 0; font-family: "Oxanium", "Arial Black", sans-serif; font-weight: 800;
            font-size: clamp(3.2rem, 7.6vw, 6.8rem); line-height: .95; letter-spacing: -.025em;
            text-transform: uppercase;
            background: linear-gradient(100deg, #fff 8%, #ffcce7 38%, #ff3b9d 63%, #82efff 100%);
            -webkit-background-clip: text; background-clip: text; color: transparent;
            filter: drop-shadow(0 0 26px rgba(255,59,157,.15));
          }
          .bb-team-subtitle { max-width: 620px; margin: 18px auto 0; color: rgba(233,241,255,.72); font: 500 clamp(15px, 1.4vw, 18px)/1.65 "Rajdhani", sans-serif; }
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
              radial-gradient(ellipse at 50% 35%, rgba(255,59,157,.25), transparent 38%),
              radial-gradient(ellipse at 80% 80%, rgba(0,205,255,.18), transparent 45%),
              linear-gradient(145deg, rgba(24,15,48,.95), rgba(5,13,32,.98));
          }
          .bb-team-photo::before, .bb-team-photo::after { content: ""; position: absolute; pointer-events: none; }
          .bb-team-photo::before { inset: 12px; border: 1px solid rgba(130,239,255,.18); border-radius: 9px; }
          .bb-team-photo::after { width: 76%; height: 1px; bottom: 17%; background: linear-gradient(90deg, transparent, rgba(130,239,255,.8), rgba(255,59,157,.8), transparent); box-shadow: 0 0 15px rgba(0,205,255,.45); }
          .bb-team-avatar-mark { color: rgba(255,255,255,.9); font-size: clamp(44px, 6vw, 76px); line-height: 1; text-shadow: 0 0 25px rgba(130,239,255,.42); }
          .bb-team-photo-hint { position: absolute; z-index: 1; bottom: 25px; left: 10px; right: 10px; text-align: center; color: rgba(224,241,255,.56); font: 700 9px/1.4 "Rajdhani", sans-serif; letter-spacing: .17em; text-transform: uppercase; }
          .bb-team-card-meta { padding: 18px 7px 8px; }
          .bb-team-role { margin: 0 0 7px; color: #91edff; font: 700 10px/1.4 "Rajdhani", sans-serif; letter-spacing: .19em; text-transform: uppercase; }
          .bb-team-name { margin: 0; color: #fff; font: 800 clamp(17px, 1.8vw, 24px)/1.2 "Oxanium", sans-serif; text-transform: uppercase; }
          .bb-team-name-hint { margin: 8px 0 0; color: rgba(226,236,255,.48); font: 600 12px/1.5 "Rajdhani", sans-serif; }
          @media (max-width: 1000px) { .bb-team-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 760px; margin: 0 auto; } }
          @media (max-width: 520px) {
            .bb-team-section { padding: 72px 17px; }
            .bb-team-grid { gap: 12px; }
            .bb-team-card { padding: 8px; border-radius: 15px; }
            .bb-team-card-meta { padding: 13px 4px 6px; }
            .bb-team-role { font-size: 9px; letter-spacing: .12em; }
            .bb-team-name { font-size: clamp(15px, 4vw, 19px); }
            .bb-team-photo-hint { font-size: 8px; bottom: 20px; }
          }
          @media (prefers-reduced-motion: reduce) {
            .bb-team-card, .bb-team-section::before, .bb-next-section::after, .bb-modules-section::before { animation: none !important; transition: none !important; }
          }

        `}</style>

      </main>

      <section className="bb-next-section" aria-label="Event overview">

        <div className="bb-next-layout">

          <div className="bb-overview-copy">

            <div className="bb-overview-kicker">THE EXPERIENCE // 2026</div>

            <h2 className="bb-overview-title">OVERVIEW</h2>

            <div className="bb-overview-rule" />

            <div className="bb-overview-card">

              <p className="bb-overview-card-label">Enter a new arena</p>

              <p className="bb-overview-description">
                Step into a high-energy world built for competition, creativity, and unforgettable moments.
                Explore the event modules, discover what is happening, and get ready to be part of the action.
                Your next challenge starts here.
              </p>

              <div className="bb-overview-tags" aria-label="Event highlights">

                <span className="bb-overview-tag">Compete</span>

                <span className="bb-overview-tag">Connect</span>

                <span className="bb-overview-tag">Experience</span>

              </div>

            </div>

          </div>

          <div className="bb-module-frame" aria-label="Module image frame">

            <div className="bb-module-frame-inner">

              <div className="bb-module-brand">

                <img className="bb-module-logo" src={logoUrl} alt="Battleblaze logo" draggable="false" />

              </div>

              <div className="bb-module-image-slot" aria-label="Module image placeholder">

                <div className="bb-module-placeholder">

                  <div className="bb-module-placeholder-mark" aria-hidden="true">✦</div>

                  <strong>Module artwork</strong>

                  <span>Your module image will be placed here later.</span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      <section className="bb-modules-section" aria-label="Battleblaze modules">
        <div className="bb-modules-inner">
          <header className="bb-modules-heading">
            <div className="bb-modules-logo-shell">
              <img className="bb-modules-logo" src={logoUrl} alt="Battleblaze logo" draggable="false" />
            </div>
            <p className="bb-modules-kicker">Choose your arena // 2026</p>
            <h2 className="bb-modules-title">MODULES</h2>
            <p className="bb-modules-subtitle">
              Seven ways to compete. Pick your game, bring your squad, and step into the Battleblaze arena.
            </p>
          </header>

          <div className="bb-modules-grid">
            {[
              { name: "BGMI", code: "01 // BATTLE ROYALE", icon: "⌖", description: "Drop in with your squad, outplay the competition, and fight your way to the final zone." },
              { name: "FREE FIRE", code: "02 // SURVIVAL", icon: "✦", description: "Fast rotations, sharp aim, and clutch decisions decide who takes the win." },
              { name: "VALORANT", code: "03 // TACTICAL FPS", icon: "◈", description: "Coordinate your team, master your utility, and execute every round with precision." },
              { name: "FIFA", code: "04 // FOOTBALL", icon: "⚽", description: "Build your attack, control the midfield, and prove your skills on the pitch." },
              { name: "MOBILE LEGENDS", code: "05 // MOBA", icon: "⬡", description: "Choose your hero, work as a team, and push for the decisive victory." },
              { name: "VR EXPERIENCE", code: "06 // IMMERSIVE", icon: "◎", description: "Step beyond the screen and explore an immersive world in virtual reality." },
              { name: "PS5 RUSH", code: "07 // CONSOLE", icon: "△", description: "Grab the controller, challenge your rivals, and own the console arena." },
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
                  <a className="bb-register-button" href={`/register?module=${encodeURIComponent(module.name.toLowerCase().replaceAll(" ", "-"))}`}>
                    <span>Register Now</span><span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bb-team-section" aria-label="Battleblaze team">
        <div className="bb-team-inner">
          <header className="bb-team-heading">
            <p className="bb-team-kicker">The people behind the arena // 2026</p>
            <h2 className="bb-team-title">MEET THE TEAM</h2>
            <p className="bb-team-subtitle">
              The crew bringing Battleblaze to life. Team photos and names can be added to each slot when ready.
            </p>
          </header>
          <div className="bb-team-grid">
            {[
              { role: "Coordinator", label: "Coordinator 01", icon: "✦" },
              { role: "Coordinator", label: "Coordinator 02", icon: "◈" },
              { role: "Module Head", label: "Module Head", icon: "⌖" },
              { role: "Module Co-Head", label: "Module Co-Head", icon: "⬡" },
            ].map((member, index) => (
              <article className="bb-team-card" key={member.label}>
                <div className="bb-team-photo" aria-label={`${member.label} image placeholder`}>
                  <span className="bb-team-avatar-mark" aria-hidden="true">{member.icon}</span>
                  <span className="bb-team-photo-hint">Add team photo</span>
                </div>
                <div className="bb-team-card-meta">
                  <p className="bb-team-role">{`TEAM MEMBER / 0${index + 1}`}</p>
                  <h3 className="bb-team-name">{member.label}</h3>
                  <p className="bb-team-name-hint">{member.role} · NITS Esports</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>

  );

}