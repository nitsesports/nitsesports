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
import coordinator1Photo from "../assets/bb3.png";
import moduleCoHeadPhoto from "../assets/bb1.png";
import moduleHeadPhoto from "../assets/bb2.png";
import coordinator2Photo from "../assets/Members/member4.png";
import valoPosterUrl from "../assets/bbv.png";
import fifaPosterUrl from "../assets/bbfc.png";
import mlbbPosterUrl from "../assets/bbmlbb.png";
import ps5PosterUrl from "../assets/bbps5.png";
import vrPosterUrl from "../assets/bbvrx.png";
import bgmiPosterUrl from "../assets/bbbgmi.png";
import rcPosterUrl from "../assets/bbrc.png";

const EVENTS = [
  { id: "FIFA", color: "#45ffb0", x: 10 },
  { id: "VALORANT", color: "#8b5cf6", x: 26 },
  { id: "BGMI", color: "#ffb347", x: 42 },
  { id: "PS5 RUSH", color: "#5c8dff", x: 58 },
  { id: "VRXPERIENCE", color: "#bf7bff", x: 74 },
  { id: "RC", color: "#00eaff", x: 90 },
];

const randomBetween = (min, max) => min + Math.random() * (max - min);

// Shared launch time for both registrations: 19 October 2026, 5:00 PM IST.
// This keeps the countdown consistent for every visitor and survives refreshes.
const REGISTRATION_OPENS_AT = new Date("2026-10-19T17:00:00+05:30").getTime();
const formatCountdown = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return days > 0 ? `${days}D ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
};

export default function BattleblazeHero({ onSelectEvent }) {
  const sceneMount = useRef(null);
  const islandFrontMount = useRef(null);
  const audioRef = useRef(null);
  const rootRef = useRef(null);
  const cursorRef = useRef(null);
  const ringRef = useRef(null);

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const heroBoundsRef = useRef({ left: 0, top: 0, width: 1, height: 1 });

  const [activeEvent, setActiveEvent] = useState("FIFA");
  const [now, setNow] = useState(() => Date.now());
  const registrationsOpen = now >= REGISTRATION_OPENS_AT;
  const registrationCountdown = formatCountdown(REGISTRATION_OPENS_AT - now);
  const [hoverColor, setHoverColor] = useState("#9b7bff");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const updateClock = () => setNow(Date.now());
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("bb-bgm-muted") === "true";
    } catch {
      return false;
    }
  });

  // ─────────────── BACKGROUND AUDIO ───────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    let disposed = false;
    let playbackStarted = false;

    const removeUnlockListeners = () => {
      document.removeEventListener("pointerdown", tryPlay, true);
      document.removeEventListener("touchstart", tryPlay, true);
      document.removeEventListener("touchend", tryPlay, true);
      document.removeEventListener("click", tryPlay, true);
      document.removeEventListener("keydown", tryPlay, true);
      window.removeEventListener("pageshow", tryPlay);
    };

    const tryPlay = () => {
      const currentAudio = audioRef.current;
      if (!currentAudio || muted || disposed || playbackStarted) return;

      currentAudio.loop = true;
      currentAudio.volume = 1;
      currentAudio.muted = false;
      const playback = currentAudio.play();

      if (playback && typeof playback.then === "function") {
        playback.then(() => {
          playbackStarted = true;
          removeUnlockListeners();
        }).catch(() => {});
      } else {
        playbackStarted = true;
        removeUnlockListeners();
      }
    };

    audio.loop = true;
    audio.volume = 1;
    audio.muted = muted;

    try {
      window.localStorage.setItem("bb-bgm-muted", String(muted));
    } catch {}

    if (muted) {
      audio.pause();
      removeUnlockListeners();
      return () => {
        disposed = true;
        removeUnlockListeners();
      };
    }

    tryPlay();

    document.addEventListener("pointerdown", tryPlay, true);
    document.addEventListener("touchstart", tryPlay, { capture: true, passive: true });
    document.addEventListener("touchend", tryPlay, { capture: true, passive: true });
    document.addEventListener("click", tryPlay, true);
    document.addEventListener("keydown", tryPlay, true);
    window.addEventListener("pageshow", tryPlay);

    return () => {
      disposed = true;
      removeUnlockListeners();
    };
  }, [muted]);

  const toggleAudio = () => {
    const nextMuted = !muted;
    const audio = audioRef.current;
    setMuted(nextMuted);

    try {
      window.localStorage.setItem("bb-bgm-muted", String(nextMuted));
    } catch {}

    if (!audio) return;
    audio.loop = true;
    audio.volume = 1;
    audio.muted = nextMuted;

    if (nextMuted) {
      audio.pause();
    } else {
      const playback = audio.play();
      if (playback && typeof playback.catch === "function") playback.catch(() => {});
    }
  };

  // ─────────────── THREE.JS HERO SCENE ───────────────
  useEffect(() => {
    const host = sceneMount.current;
    const foregroundHost = islandFrontMount.current;
    const hero = rootRef.current;
    if (!host || !foregroundHost || !hero) return undefined;

    let disposed = false;
    let raf = 0;
    let isHeroVisible = true;
    let previousTime = 0;
    let shipTexture = null;

    const spaceshipFleet = [];
    const floatingIslands = [];
    const shootingStars = [];
    const disposableTextures = [];

    const scene = new THREE.Scene();
    const foregroundScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1200);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const foregroundRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    foregroundRenderer.setPixelRatio(pixelRatio);
    foregroundRenderer.setClearColor(0x000000, 0);
    foregroundHost.appendChild(foregroundRenderer.domElement);

    const getVisibleWidth = () =>
      2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;

    const getVisibleHeight = () =>
      2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

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
      const speed = randomBetween(140, 230);

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
          const direction = i === 0 ? 1 : -1;
          const width = randomBetween(10, 16);
          const height = width / Math.max(aspect, 0.1);

          const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: randomBetween(0.8, 0.96),
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
            speed: randomBetween(5.5, 9.0),
            baseY: randomBetween(-halfHeight * 0.6, halfHeight * 0.6),
            baseWidth: width,
            width,
            aspect: Math.max(aspect, 0.1),
            opacity: material.opacity,
            depth: i === 0 ? randomBetween(10, 14) : randomBetween(22, 26),
          };

          sprite.position.set(randomBetween(-halfWidth, halfWidth), ship.baseY, ship.depth);
          scene.add(sprite);
          spaceshipFleet.push(ship);
        }
      },
      undefined,
      (error) => console.error("Unable to load jet.png:", error)
    );

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
        return null;
      }
    };

    const islandLayout = [
      {
        asset: 2,
        x: -0.28,
        y: -0.20,
        widthFrac: 0.72,
        z: 32,
        renderOrder: 10,
        phase: 0.4,
        drift: 1.15,
        speed: 0.42,
        isStatic: false,
      },
      {
        asset: 5,
        x: 0.31,
        y: -0.28,
        widthFrac: 0.74,
        z: 30,
        renderOrder: 8,
        phase: Math.random() * Math.PI * 2,
        drift: 2.8,
        speed: 0.55,
        isStatic: false,
      },
    ];

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
    const sharedShadowGeo = new THREE.PlaneGeometry(1, 1);

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

      const islandScene = assetIndex === 2 ? foregroundScene : scene;

      islandLayout
        .filter((config) => config.asset === assetIndex)
        .forEach((config) => {
          const width = visibleWidth * config.widthFrac;
          const height = width / Math.max(aspect, 0.1);
          const islandX = config.x * visibleWidth;
          const islandY = config.y * visibleHeight;

          const shadow = new THREE.Mesh(
            sharedShadowGeo,
            new THREE.MeshBasicMaterial({
              map: islandShadowTexture,
              transparent: true,
              opacity: assetIndex === 2 ? 0.18 : 0.28,
              depthWrite: false,
              depthTest: true,
              toneMapped: false,
            })
          );
          shadow.scale.set(width * 0.82, Math.max(height * 0.19, 1.2), 1);
          shadow.position.set(islandX, islandY - height * 0.28, config.z - 0.35);
          shadow.renderOrder = config.renderOrder ? config.renderOrder - 1 : 0;
          islandScene.add(shadow);

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
          islandScene.add(sprite);

          floatingIslands.push({
            sprite,
            shadow,
            islandScene,
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
            isStatic: config.isStatic,
          });
        });
    };

    textureLoader.load(island3Url, (tex) => addIslandTexture(tex, 2), undefined, (e) => console.error("island3:", e));
    textureLoader.load(island6Url, (tex) => addIslandTexture(tex, 5), undefined, (e) => console.error("island6:", e));

    const updateHeroBounds = () => {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      heroBoundsRef.current = {
        left: rect.left,
        top: rect.top,
        width: Math.max(rect.width, 1),
        height: Math.max(rect.height, 1),
      };
    };

    const resize = () => {
      if (disposed) return;
      updateHeroBounds();

      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      const aspect = width / height;

      camera.aspect = aspect;
      const baseFov = 60;
      camera.fov = aspect < 1 ? baseFov * Math.max(1.1, 1 / Math.pow(aspect, 0.5)) : baseFov;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height, false);
      foregroundRenderer.setSize(width, height, false);

      const visibleWidth = getVisibleWidth();
      const visibleHeight = getVisibleHeight();
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
          island.shadow.scale.set(islandWidth * 0.82, Math.max(islandHeight * 0.19, 1.2), 1);
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
      if (disposed || !hero) return;
      const rect = hero.getBoundingClientRect();
      heroBoundsRef.current.left = rect.left;
      heroBoundsRef.current.top = rect.top;

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

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isHeroVisible = entry.isIntersecting;
        if (isHeroVisible && !raf && !disposed) {
          previousTime = 0;
          raf = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.01 }
    );
    visibilityObserver.observe(hero);

    const animate = (timestamp) => {
      if (disposed || !isHeroVisible) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(animate);

      const delta = previousTime ? Math.min((timestamp - previousTime) / 1000, 0.04) : 0;
      previousTime = timestamp;
      const time = timestamp * 0.001;

      current.current.x += (target.current.x - current.current.x) * 0.05;
      current.current.y += (target.current.y - current.current.y) * 0.05;

      scene.position.x = -current.current.x * 4.5;
      scene.position.y = current.current.y * 2.6;
      foregroundScene.position.x = scene.position.x;
      foregroundScene.position.y = scene.position.y;

      shootingStars.forEach((meteor) => {
        if (meteor.active) {
          meteor.life += delta;
          meteor.mesh.position.x += meteor.vx * delta;
          meteor.mesh.position.y += meteor.vy * delta;

          const progress = meteor.life / meteor.maxLife;
          meteor.material.opacity =
            progress < 0.2 ? progress / 0.2 : Math.max(0, 1 - (progress - 0.2) / 0.8);

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
        const { sprite, direction, speed, width } = ship;
        sprite.position.x += direction * speed * delta;
        sprite.position.y = ship.baseY;

        const distanceToEdge =
          direction > 0 ? halfWidth - sprite.position.x : halfWidth + sprite.position.x;
        const fade = THREE.MathUtils.clamp(
          (distanceToEdge + width * 0.35) / Math.max(width * 0.7, 1),
          0,
          1
        );

        sprite.material.opacity = ship.opacity * fade;

        if (direction > 0 && sprite.position.x > halfWidth + width) {
          sprite.position.x = -halfWidth - width;
          ship.baseY = randomBetween(-40, 40);
          sprite.position.y = ship.baseY;
        } else if (direction < 0 && sprite.position.x < -halfWidth - width) {
          sprite.position.x = halfWidth + width;
          ship.baseY = randomBetween(-40, 40);
          sprite.position.y = ship.baseY;
        }
      });

      floatingIslands.forEach((island) => {
        if (island.isStatic) {
          island.sprite.position.x = island.baseX;
          island.sprite.position.y = island.baseY;
          return;
        }

        const vFloat = Math.sin(time * island.speed + island.phase) * island.drift;
        const secondaryFloat =
          Math.sin(time * island.speed * 0.47 + island.phase * 1.8) * island.drift * 0.2;
        const hDrift =
          Math.cos(time * (island.speed * 0.7) + island.phase) * (island.drift * 0.55);
        const slowDrift = Math.sin(time * 0.23 + island.phase) * island.drift * 0.15;

        island.sprite.position.y = island.baseY + vFloat + secondaryFloat;
        island.sprite.position.x = island.baseX + hDrift + slowDrift;

        if (island.shadow) {
          island.shadow.position.x = island.sprite.position.x;
          island.shadow.position.y = island.sprite.position.y - island.shadowOffsetY;
          const lift = THREE.MathUtils.clamp(
            (vFloat + island.drift) / Math.max(2 * island.drift, 0.01),
            0,
            1
          );
          island.shadow.material.opacity =
            (island.assetIndex === 2 ? 0.18 : 0.28) * (0.78 + lift * 0.22);
        }
      });

      renderer.render(scene, camera);
      foregroundRenderer.render(foregroundScene, camera);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("scroll", handleScrollZoom);

      spaceshipFleet.forEach(({ sprite }) => {
        scene.remove(sprite);
        sprite.material.dispose();
      });

      floatingIslands.forEach(({ sprite, shadow, islandScene }) => {
        islandScene.remove(sprite);
        sprite.material.dispose();
        if (shadow) {
          islandScene.remove(shadow);
          shadow.material.dispose();
        }
      });

      sharedShadowGeo.dispose();

      shootingStars.forEach(({ mesh, material }) => {
        scene.remove(mesh);
        material.dispose();
      });

      meteorGeo.dispose();
      if (shipTexture) shipTexture.dispose();
      disposableTextures.forEach((texture) => texture.dispose());
      renderer.dispose();
      foregroundRenderer.dispose();

      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
      if (foregroundRenderer.domElement.parentNode === foregroundHost) {
        foregroundHost.removeChild(foregroundRenderer.domElement);
      }
    };
  }, []);

  const moveCursor = (event) => {
    const bounds = heroBoundsRef.current;
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    target.current.x = (x / bounds.width) * 2 - 1;
    target.current.y = (y / bounds.height) * 2 - 1;

    rootRef.current?.style.setProperty("--bb-parallax-x", `${-target.current.x * 10}px`);
    rootRef.current?.style.setProperty("--bb-parallax-y", `${target.current.y * 6}px`);

    const transform = `translate3d(${x}px, ${y}px, 0)`;
    if (cursorRef.current) cursorRef.current.style.transform = transform;
    if (ringRef.current) ringRef.current.style.transform = transform;
  };

  // Support direct links such as /battleblaze#modules, including navigation from another page.
  useEffect(() => {
    const scrollToCurrentHash = () => {
      const rawHash = window.location.hash;
      if (!rawHash) return;

      let targetId = rawHash.slice(1);
      try {
        targetId = decodeURIComponent(targetId);
      } catch {
        // Keep the raw hash if it is not valid URI encoding.
      }

      window.requestAnimationFrame(() => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    };

    scrollToCurrentHash();
    window.addEventListener("hashchange", scrollToCurrentHash);
    window.addEventListener("pageshow", scrollToCurrentHash);

    return () => {
      window.removeEventListener("hashchange", scrollToCurrentHash);
      window.removeEventListener("pageshow", scrollToCurrentHash);
    };
  }, []);

  useEffect(() => {
    const revealTargets = document.querySelectorAll(
      ".bb-next-section .bb-overview-copy > *, .bb-modules-section .bb-modules-heading > *, .bb-module-card, .bb-results-section .bb-results-heading > *, .bb-results-card, .bb-team-section .bb-team-heading > *, .bb-team-card"
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

    // PS5 RUSH and VRXPERIENCE hero hotspots open their public registration forms.
    const normalizedId = String(id).trim().toUpperCase().replace(/[\s-]+/g, "_");
    if (normalizedId === "PS5_RUSH") {
      if (!registrationsOpen) return;
      goToRegistration("PS5_RUSH");
    } else if (normalizedId === "VRXPERIENCE" || normalizedId === "VR_EXPERIENCE") {
      goToRegistration("VR_EXPERIENCE");
    }
  };

  // One shared destination for Register Now, overview cards, and module cards.
  // PS5 RUSH must use Registerbb.jsx, just like the other Battleblaze games.
  // Keep /admin/ps5-rush exclusively for the separate Admin Panel shortcut.
  const goToRegistration = (game) => {
    if (!game) return;

    const normalizedGame = String(game).trim().toUpperCase().replace(/[\s-]+/g, "_");
    const registrationUrl =
      normalizedGame === "PS5_RUSH"
        ? "/register?game=PS5_RUSH"
        : `/register?game=${encodeURIComponent(game)}`;

    window.location.assign(registrationUrl);
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
        autoPlay
        loop
        preload="auto"
        playsInline
        muted={muted}
        aria-label="Battleblaze background music"
      />

      <main
        id="home"
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
          "--bb-heading-zoom": "1",
          "--bb-scroll-darkness": "0",
        }}
      >
        <div
          className="bb-match-art"
          aria-hidden="true"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />

        <img
          className="bb-ss-art"
          src={ssUrl}
          alt=""
          aria-hidden="true"
          draggable="false"
        />

        <div className="bb-match-stars" ref={sceneMount} aria-hidden="true" />
        <div className="bb-match-island-front" ref={islandFrontMount} aria-hidden="true" />
        <div className="bb-match-vignette" aria-hidden="true" />
        <div className="bb-scroll-darken" aria-hidden="true" />
        <div className="bb-load-black-fade" aria-hidden="true" />

        <a className="bb-hotspot bb-hotspot-brand" href="#home" aria-label="Battleblaze home" />

        <div className="bb-hero-logo-box">
          <div className="bb-fire-backdrop" aria-hidden="true">
            <div className="bb-fire-glow-base" />
            <div className="bb-fire-glow-flare" />
            <div className="bb-fire-glow-ring" />
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

        <img
          className="bb-fe-art"
          src={feUrl}
          alt=""
          aria-hidden="true"
          draggable="false"
        />

        {/* Bottom Center View Modules Button */}
        <a
          className="bb-hero-view-modules-btn"
          href="#modules"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector(".bb-modules-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          onMouseEnter={() => hover("#8b5cf6")}
          onMouseLeave={resetHover}
          aria-label="View Modules"
        >
          <span>VIEW MODULES</span>
          <span aria-hidden="true">↗</span>
        </a>

        {/* Admin Panel shortcut — opens the PS5 Rush admin route */}
        <a
          className="bb-hero-view-modules-btn bb-admin-panel-btn"
          href="/admin"
          aria-label="Open Admin Panel"
          onMouseEnter={() => hover("#00eaff")}
          onMouseLeave={resetHover}
        >
          <span>ADMIN PANEL</span>
          <span aria-hidden="true">↗</span>
        </a>

        <a className="bb-hotspot bb-hotspot-contact" href="#contact" aria-label="Contact" />

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
          onClick={toggleAudio}
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
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Rajdhani:wght@400;500;600;700&display=swap');

          .bb-load-black-fade {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: #000;
            pointer-events: none;
            opacity: 1;
            animation: bb-initial-black-reveal 2s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards;
          }
          @keyframes bb-initial-black-reveal {
            0% { opacity: 1; visibility: visible; }
            75% { opacity: 0.12; }
            100% { opacity: 0; visibility: hidden; }
          }

          html, body {
            scrollbar-width: thin;
            scrollbar-color: #7656e8 #100a2a;
          }
          html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          html::-webkit-scrollbar-track, body::-webkit-scrollbar-track, *::-webkit-scrollbar-track {
            background: linear-gradient(180deg, #100a2a 0%, #1b0c36 55%, #100a2a 100%);
            border-left: 1px solid rgba(0, 234, 255, 0.12);
          }
          html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb, *::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #a78bfa 0%, #7656e8 48%, #7d2bd4 100%);
            border: 2px solid #100a2a;
            border-radius: 999px;
          }
          html::-webkit-scrollbar-thumb:hover, body::-webkit-scrollbar-thumb:hover, *::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #c4b5fd 0%, #8b5cf6 48%, #00cfe8 100%);
          }

          .bb-page, .bb-page *, .bb-page *::before, .bb-page *::after {
            box-sizing: border-box;
            font-family: 'Orbitron', sans-serif !important;
          }
          .bb-page {
            width: 100%;
            background: #07051b;
            color: #fff;
            overflow-x: hidden;
          }

          .bb-match {
            --bb-cursor: #00f0ff;
            --bb-scroll-scale: 1;
            position: relative;
            isolation: isolate;
            width: 100%;
            height: 100vh;
            height: 100svh;
            min-height: 520px;
            overflow: hidden;
            background: #090725;
            color: #fff;
            cursor: none;
          }

          .bb-match-art {
            position: absolute;
            inset: 0;
            z-index: 1;
            display: block;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center center;
            background-repeat: no-repeat;
            filter: blur(0.6px) saturate(1.5) contrast(1.15) brightness(0.8) hue-rotate(-12deg);
            transform: translate3d(var(--bb-parallax-x, 0px), var(--bb-parallax-y, 0px), 0)
              scale(calc(1.05 * var(--bb-scroll-scale, 1)));
            transition: transform 80ms linear;
            pointer-events: none;
            user-select: none;
            will-change: transform;
          }

          .bb-ss-art {
            position: absolute;
            top: clamp(108px, 13vh, 144px);
            left: clamp(-76px, -4.5vw, -34px);
            z-index: 3;
            display: block;
            width: clamp(190px, 22vw, 320px);
            height: auto;
            max-width: 36vw;
            max-height: 42vh;
            object-fit: contain;
            object-position: left top;
            pointer-events: none;
            user-select: none;
            opacity: calc(1 - var(--bb-scroll-darkness, 0) * 0.78);
            transform: translate3d(0, 0, 0)
              scale(calc(var(--bb-scroll-scale, 1) * var(--bb-ship-zoom, 1)));
            transform-origin: left top;
            animation: bb-ss-float-glide 12s ease-in-out infinite alternate;
            will-change: transform, translate, opacity;
            filter: drop-shadow(0 6px 8px rgba(5, 3, 24, 0.22));
          }

          @keyframes bb-ss-float-glide {
            0% { translate: 0px 0px; }
            25% { translate: 7px -10px; }
            50% { translate: 14px 0px; }
            75% { translate: 21px 10px; }
            100% { translate: 28px 0px; }
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

          .bb-match-island-front {
            position: absolute;
            inset: 0;
            z-index: 4;
            overflow: hidden;
            pointer-events: none;
          }
          .bb-match-island-front canvas {
            display: block;
            width: 100%;
            height: 100%;
          }

          .bb-match-vignette {
            position: absolute;
            inset: 0;
            z-index: 5;
            pointer-events: none;
            background:
              linear-gradient(115deg, rgba(91, 70, 190, 0.28), transparent 50%, rgba(48, 83, 190, 0.22)),
              linear-gradient(180deg, rgba(20, 10, 50, 0.5) 0%, transparent 30%, rgba(91, 70, 190, 0.15) 70%, rgba(15, 5, 35, 0.6) 100%);
            mix-blend-mode: screen;
            opacity: 0.95;
          }

          .bb-scroll-darken {
            position: absolute;
            inset: 0;
            z-index: 8;
            pointer-events: none;
            background: #000;
            opacity: var(--bb-scroll-darkness, 0);
            will-change: opacity;
          }

          .bb-hero-logo-box {
            position: absolute;
            left: 50%;
            top: 46%;
            transform: translate(-50%, -50%)
              translate3d(calc(var(--bb-parallax-x, 0px) * 0.4), calc(var(--bb-parallax-y, 0px) * 0.4), 0);
            z-index: 6;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            animation: bb-logo-float 6s ease-in-out infinite alternate;
          }

          @keyframes bb-logo-float {
            0% {
              transform: translate(-50%, -50%)
                translate3d(calc(var(--bb-parallax-x, 0px) * 0.4), calc(var(--bb-parallax-y, 0px) * 0.4), 0)
                translateY(0px);
            }
            100% {
              transform: translate(-50%, -50%)
                translate3d(calc(var(--bb-parallax-x, 0px) * 0.4), calc(var(--bb-parallax-y, 0px) * 0.4), 0)
                translateY(-10px);
            }
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

          .bb-fire-glow-base {
            position: absolute;
            width: 94%;
            height: 86%;
            background: radial-gradient(ellipse at 48% 48%,
              rgba(139, 92, 246, 0.14) 0%,
              rgba(59, 130, 246, 0.08) 45%,
              transparent 78%);
            filter: blur(22px);
            opacity: 0.75;
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
            filter:
              drop-shadow(0 5px 4px rgba(5, 0, 20, 0.42))
              drop-shadow(0 13px 13px rgba(5, 0, 20, 0.30))
              drop-shadow(0 1px 1px rgba(235, 232, 255, 0.22))
              drop-shadow(0 0 10px rgba(139, 92, 246, 0.16));
            transition: filter 260ms ease;
          }

          .bb-fe-art {
            position: absolute;
            left: 50%;
            top: 70%;
            transform: translateX(-50%);
            z-index: 7;
            display: block;
            width: clamp(300px, 32vw, 460px);
            max-width: 58vw;
            max-height: 23vh;
            height: auto;
            object-fit: contain;
            pointer-events: none;
            user-select: none;
            filter:
              drop-shadow(0 8px 12px rgba(0, 0, 0, 0.72))
              drop-shadow(0 0 18px rgba(0, 225, 255, 0.34))
              drop-shadow(0 0 26px rgba(139, 92, 246, 0.28));
          }

          .bb-hero-view-modules-btn {
            position: absolute;
            left: 50%;
            bottom: max(12px, calc(env(safe-area-inset-bottom) + 8px));
            transform: translateX(-50%);
            z-index: 15;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 8px 20px;
            color: #fff;
            text-decoration: none;
            text-transform: uppercase;
            font-family: 'Orbitron', sans-serif;
            font-size: clamp(9px, 0.9vw, 11px);
            line-height: 1.2;
            font-weight: 800;
            letter-spacing: 0.14em;
            white-space: nowrap;
            background: linear-gradient(135deg, rgba(20, 8, 42, 0.94) 0%, rgba(35, 12, 68, 0.94) 100%);
            border: 1px solid #a855f7;
            border-radius: 4px;
            box-shadow: 0 0 16px rgba(168, 85, 247, 0.28), inset 0 0 10px rgba(168, 85, 247, 0.12);
            cursor: pointer;
            pointer-events: auto;
            clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
            transition: background 250ms ease, border-color 250ms ease, box-shadow 250ms ease, transform 250ms ease;
          }
          .bb-hero-view-modules-btn:hover {
            background: linear-gradient(135deg, rgba(35, 12, 68, 0.98) 0%, rgba(55, 18, 104, 0.98) 100%);
            border-color: #00eaff;
            box-shadow: 0 0 32px rgba(0, 234, 255, 0.5), inset 0 0 20px rgba(0, 234, 255, 0.25);
            transform: translateX(-50%) translateY(-2px);
          }

          /* Admin shortcut uses the same visual language as the existing hero button. */
          .bb-admin-panel-btn {
            left: 22px;
            right: auto;
            bottom: max(12px, calc(env(safe-area-inset-bottom) + 8px));
            transform: none;
            z-index: 16;
            border-color: rgba(0, 234, 255, 0.8);
            box-shadow: 0 0 16px rgba(0, 234, 255, 0.2), inset 0 0 10px rgba(0, 234, 255, 0.08);
          }
          .bb-admin-panel-btn:hover {
            transform: translateY(-2px);
          }
          @media (max-width: 600px) {
            .bb-admin-panel-btn {
              left: 10px;
              bottom: max(12px, calc(env(safe-area-inset-bottom) + 8px));
              padding: 8px 12px;
              font-size: 8px;
              letter-spacing: 0.08em;
            }
          }

          .bb-hotspot {
            position: absolute;
            z-index: 5;
            display: block;
            margin: 0;
            padding: 0;
            border: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            outline: none !important;
            color: inherit;
            cursor: none;
            -webkit-tap-highlight-color: transparent;
          }
          .bb-hotspot-brand { left: 3%; top: 3%; width: 20%; height: 12%; }
          .bb-hotspot-contact { right: 2%; top: 3%; width: 10%; height: 10%; }
          .bb-hotspot-event {
            top: 65%;
            width: 14%;
            height: 22%;
            transform: translateX(-50%);
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
          }
          .bb-hotspot-event.is-active {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
          }

          .bb-hotspot-sound {
            right: 2.5%;
            bottom: 4%;
            z-index: 12;
            width: 54px;
            height: 54px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(139, 92, 246, 0.8) !important;
            border-radius: 50%;
            background: rgba(13, 7, 30, 0.72) !important;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.2), inset 0 0 18px rgba(139, 92, 246, 0.08) !important;
            cursor: pointer;
            transition: background 180ms ease, transform 180ms ease;
          }
          .bb-hotspot-sound:hover {
            background: rgba(139, 92, 246, 0.22) !important;
            transform: scale(1.06);
          }
          .bb-hotspot-sound svg {
            width: 22px;
            height: 22px;
            fill: none;
            stroke: #fff;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .bb-match-sound-state {
            position: absolute;
            right: 3%;
            bottom: 2%;
            z-index: 6;
            color: #fff;
            font-size: 9px;
            letter-spacing: 2px;
            opacity: 0.75;
            pointer-events: none;
          }

          .bb-match-cursor {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 10;
            width: 7px;
            height: 7px;
            margin: -3.5px 0 0 -3.5px;
            border-radius: 50%;
            background: var(--bb-cursor);
            box-shadow: 0 0 8px var(--bb-cursor), 0 0 20px var(--bb-cursor);
            pointer-events: none;
            will-change: transform;
          }
          .bb-match-cursor span {
            position: absolute;
            inset: -5px;
            border: 1px solid var(--bb-cursor);
            border-radius: 50%;
            opacity: 0.55;
          }
          .bb-match-ring {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 9;
            width: 32px;
            height: 32px;
            margin: -16px 0 0 -16px;
            border: 1px solid color-mix(in srgb, var(--bb-cursor) 50%, transparent);
            border-radius: 50%;
            pointer-events: none;
            will-change: transform;
            transition: width 180ms ease, height 180ms ease, margin 180ms ease, border-color 180ms ease;
          }
          .bb-match-ring i {
            position: absolute;
            width: 5px;
            height: 5px;
            border: 1px solid var(--bb-cursor);
          }
          .bb-match-ring i:nth-child(1) { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }
          .bb-match-ring i:nth-child(2) { top: -2px; right: -2px; border-left: 0; border-bottom: 0; }
          .bb-match-ring i:nth-child(3) { bottom: -2px; left: -2px; border-right: 0; border-top: 0; }
          .bb-match-ring i:nth-child(4) { right: -2px; bottom: -2px; border-left: 0; border-top: 0; }
          .bb-match-ring.is-hovered {
            width: 45px;
            height: 45px;
            margin: -22.5px 0 0 -22.5px;
            border-color: var(--bb-cursor);
          }

          #home,
          #overview,
          #modules,
          #results-schedule,
          #team {
            scroll-margin-top: 12px;
          }

          /* Results & Schedule section — shares the Modules card language and artwork. */
          .bb-results-section {
            padding: clamp(70px, 8vw, 118px) clamp(20px, 5vw, 76px);
          }
          .bb-results-inner {
            position: relative;
            z-index: 2;
            width: min(1500px, 100%);
            margin: 0 auto;
          }
          .bb-results-heading {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin: 0 auto clamp(38px, 5vw, 64px);
          }
          .bb-results-kicker {
            margin: 0 0 12px;
            color: #c4b5fd;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.22em;
            text-transform: uppercase;
          }
          .bb-results-title {
            margin: 0;
            font-size: clamp(2rem, 4vw, 3.2rem);
            line-height: 1.12;
            font-weight: 800;
            letter-spacing: 0.025em;
            color: #fff;
            background: linear-gradient(100deg, #fff 8%, #ddd6fe 48%, #bfdbfe 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 18px rgba(139, 92, 246, 0.22));
          }
          .bb-results-subtitle {
            max-width: 620px;
            margin: 16px auto 0;
            color: rgba(255, 255, 255, 0.78);
            font-size: clamp(11px, 0.95vw, 13px);
            line-height: 1.5;
          }
          .bb-results-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            align-items: stretch;
            gap: clamp(14px, 1.7vw, 24px);
          }
          .bb-results-card {
            display: flex;
            flex-direction: column;
            min-width: 0;
            overflow: hidden;
            border: 1.5px solid #a855f7;
            border-radius: 4px;
            background: linear-gradient(135deg, rgba(20, 8, 42, 0.94) 0%, rgba(35, 12, 68, 0.94) 100%);
            box-shadow: 0 18px 42px rgba(0, 0, 0, 0.3), 0 0 20px rgba(168, 85, 247, 0.2);
            transition: transform 240ms ease, border-color 240ms ease, box-shadow 240ms ease;
          }
          .bb-results-card:hover,
          .bb-results-card:focus-within {
            transform: translateY(-6px);
            border-color: #00eaff;
            box-shadow: 0 22px 48px rgba(0, 0, 0, 0.38), 0 0 32px rgba(0, 234, 255, 0.4);
          }
          .bb-results-poster {
            display: block;
            width: 100%;
            aspect-ratio: 4 / 5;
            object-fit: contain;
            object-position: center;
            background: rgba(5, 3, 13, 0.45);
          }
          .bb-results-card-content {
            display: flex;
            flex: 1 1 auto;
            flex-direction: column;
            gap: 13px;
            padding: 14px 12px 13px;
          }
          .bb-results-game-name {
            margin: 0;
            min-height: 2.5em;
            color: #f5f3ff;
            font-size: clamp(11px, 1vw, 14px);
            font-weight: 800;
            letter-spacing: 0.045em;
            line-height: 1.35;
            text-align: center;
          }
          .bb-results-actions {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            margin-top: auto;
          }
          .bb-results-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 100%;
            min-height: 38px;
            padding: 10px 8px;
            border: 1px solid #a855f7;
            border-radius: 3px;
            color: #fff;
            background: linear-gradient(135deg, rgba(109, 40, 217, 0.25), rgba(35, 12, 68, 0.96));
            font-size: clamp(8px, 0.72vw, 10px);
            font-weight: 800;
            letter-spacing: 0.06em;
            line-height: 1.25;
            text-align: center;
            text-decoration: none;
            cursor: pointer;
            transition: border-color 200ms ease, background 200ms ease, box-shadow 200ms ease, transform 200ms ease;
          }
          .bb-results-button:hover,
          .bb-results-button:focus-visible {
            border-color: #00eaff;
            background: linear-gradient(135deg, rgba(0, 234, 255, 0.18), rgba(109, 40, 217, 0.35));
            box-shadow: 0 0 18px rgba(0, 234, 255, 0.2);
            transform: translateY(-1px);
            outline: none;
          }
          .bb-results-button.is-result {
            border-color: rgba(96, 165, 250, 0.8);
          }
          @media (max-width: 1100px) {
            .bb-results-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          }
          @media (max-width: 720px) {
            .bb-results-section { padding: 70px 20px; }
            .bb-results-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
            .bb-results-card-content { padding: 9px 8px 10px; gap: 9px; }
            .bb-results-button { min-height: 35px; padding: 9px 5px; font-size: 8px; }
          }
          @media (max-width: 380px) {
            .bb-results-grid { grid-template-columns: 1fr; max-width: 330px; margin: 0 auto; }
          }

          .bb-team-section {
            position: relative;
            isolation: isolate;
            width: 100%;
            min-height: 100vh;
            color: #fff;
            background:
              radial-gradient(ellipse at 12% 18%, rgba(109, 40, 217, 0.28), transparent 40%),
              radial-gradient(ellipse at 88% 30%, rgba(37, 99, 235, 0.16), transparent 42%),
              radial-gradient(ellipse at 52% 100%, rgba(79, 70, 229, 0.16), transparent 50%),
              linear-gradient(135deg, #05030d 0%, #100821 48%, #050914 100%);
            border-top: 1px solid rgba(139, 92, 246, 0.2);
            overflow: hidden;
          }

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
            opacity: 0.4;
            filter: drop-shadow(0 0 8px rgba(0, 234, 255, 0.28));
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
            opacity: 0.28;
            animation: bb-scroll-ship-backward 43s linear infinite;
            animation-delay: -17s;
          }
          @keyframes bb-scroll-ship-forward {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(120vw, 0, 0); }
          }
          @keyframes bb-scroll-ship-backward {
            0% { transform: translate3d(0, 0, 0) scaleX(-1); }
            100% { transform: translate3d(-120vw, 0, 0) scaleX(-1); }
          }

          .bb-overview-title,
          .bb-modules-title,
          .bb-team-title {
            margin: 0;
            font-weight: 800;
            font-size: clamp(2rem, 4.6vw, 4rem);
            line-height: 1.08;
            text-transform: uppercase;
            background: linear-gradient(100deg, #fff 8%, #ddd6fe 48%, #bfdbfe 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 18px rgba(139, 92, 246, 0.22));
          }

          .bb-overview-kicker,
          .bb-modules-kicker,
          .bb-team-kicker {
            margin: 0 0 12px;
            color: #c4b5fd;
            font-weight: 800;
            font-size: 11px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
          }

          .bb-next-section {
            /* Keep the Event Overview poster positioned inside this section,
               never relative to the hero/main landing section. */
            position: relative;
            isolation: isolate;
            overflow: hidden;
            min-height: 620px;
            padding: clamp(42px, 4.5vw, 68px) clamp(22px, 3.5vw, 54px) 72px;
          }

          .bb-overview-poster {
            position: absolute;
            top: 50%;
            right: 2.5%;
            transform: translateY(-50%);
            width: auto;
            height: auto;
            max-width: min(34vw, 500px);
            max-height: 82%;
            object-fit: contain;
            z-index: 2;
            padding: 10px;
            border: 1.5px solid #a855f7;
            border-radius: 4px;
            background: linear-gradient(135deg, rgba(20, 8, 42, 0.94) 0%, rgba(35, 12, 68, 0.94) 100%);
            box-shadow:
              0 0 24px rgba(168, 85, 247, 0.35),
              0 24px 60px rgba(0, 0, 0, 0.55);
            pointer-events: none;
            user-select: none;
            clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
          }

          .bb-next-layout {
            position: relative;
            z-index: 2;
            width: calc(100% - min(37vw, 530px));
            max-width: 900px;
            margin: 0;
          }

          .bb-overview-copy {
            width: 100%;
            text-align: left;
          }

          .bb-overview-kicker {
            display: inline-flex;
            align-items: center;
            gap: 10px;
          }
          .bb-overview-kicker::before {
            content: "";
            width: 30px;
            height: 2px;
            background: linear-gradient(90deg, #8b5cf6, #60a5fa);
            box-shadow: 0 0 10px rgba(139, 92, 246, 0.65);
          }

          .bb-overview-rule {
            width: min(340px, 70%);
            height: 2px;
            margin: 18px 0;
            background: linear-gradient(90deg, #8b5cf6, #60a5fa, transparent);
            box-shadow: 0 0 12px rgba(139, 92, 246, 0.45);
          }

          /* Unified Sci-Fi Card Styles matching View Modules button UI */
          .bb-overview-card {
            position: relative;
            padding: 20px 24px;
            border: 1.5px solid #a855f7;
            border-radius: 4px;
            background: linear-gradient(135deg, rgba(20, 8, 42, 0.94) 0%, rgba(35, 12, 68, 0.94) 100%);
            box-shadow: 0 16px 38px rgba(0, 0, 0, 0.32), 0 0 20px rgba(168, 85, 247, 0.2);
            overflow: hidden;
            clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          }
          .bb-overview-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 24px;
            width: 86px;
            height: 2px;
            background: linear-gradient(90deg, #6d28d9, #8b5cf6, #60a5fa);
          }

          .bb-overview-card-label {
            margin: 0 0 8px;
            color: #c4b5fd;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.2em;
            text-transform: uppercase;
          }

          .bb-overview-description {
            margin: 0;
            color: rgba(255, 255, 255, 0.86);
            font-size: clamp(11px, 0.95vw, 13px);
            line-height: 1.55;
          }

          .bb-overview-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 14px;
          }
          .bb-overview-tag {
            padding: 7px 10px;
            border: 1px solid rgba(196, 181, 253, 0.35);
            border-radius: 3px;
            color: #f5f3ff;
            background: rgba(139, 92, 246, 0.16);
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.09em;
            text-transform: uppercase;
          }

          .bb-overview-events {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
            margin-top: 22px;
            width: 100%;
          }

          .bb-overview-event-card {
            position: relative;
            display: block;
            color: inherit;
            text-decoration: none;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            min-height: 128px;
            padding: 14px 16px 13px;
            border: 1.5px solid #a855f7;
            border-radius: 4px;
            background: linear-gradient(135deg, rgba(20, 8, 42, 0.94) 0%, rgba(35, 12, 68, 0.94) 100%);
            box-shadow: 0 14px 32px rgba(0, 0, 0, 0.3), 0 0 16px rgba(168, 85, 247, 0.15);
            clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
            transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
          }
          .bb-overview-event-card::after {
            content: "";
            position: absolute;
            top: 0;
            left: 16px;
            width: 54px;
            height: 2px;
            background: linear-gradient(90deg, #6d28d9, #8b5cf6, #60a5fa);
          }
          .bb-overview-event-card:hover,
          .bb-overview-event-card:focus-visible {
            transform: translateY(-3px);
            border-color: #00eaff;
            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.38), 0 0 28px rgba(0, 234, 255, 0.35);
            outline: none;
          }
          .bb-overview-event-card.is-coming-soon {
            cursor: default;
            border-color: rgba(139, 92, 246, 0.72);
          }
          .bb-overview-event-card.is-coming-soon:hover,
          .bb-overview-event-card.is-coming-soon:focus-visible {
            transform: none;
            border-color: rgba(139, 92, 246, 0.72);
            box-shadow: 0 14px 32px rgba(0, 0, 0, 0.3), 0 0 16px rgba(168, 85, 247, 0.15);
          }
          .bb-overview-event-card.is-coming-soon .bb-overview-event-prize strong {
            color: #c4b5fd;
            font-size: 9px;
            letter-spacing: 0.04em;
          }
          .bb-overview-event-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }
          .bb-overview-event-icon {
            color: #f5f3ff;
            font-size: 20px;
          }
          .bb-overview-event-code {
            color: #c4b5fd;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.16em;
          }
          .bb-overview-event-card h3 {
            margin: 7px 0 12px;
            color: #fff;
            font-size: clamp(13px, 1.15vw, 17px);
            font-weight: 800;
            letter-spacing: 0.045em;
          }
          .bb-overview-event-prize {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px 10px;
            padding-top: 9px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
          }
          .bb-overview-event-prize span {
            color: rgba(255, 255, 255, 0.75);
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.13em;
          }
          .bb-overview-event-prize strong {
            color: #fff;
            font-size: 10px;
            font-weight: 800;
          }

          .bb-overview-booking-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 7px;
            padding-top: 9px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
          }
          .bb-overview-booking-cta {
            color: var(--event-accent, #c4b5fd);
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.12em;
            line-height: 1.3;
            text-shadow: 0 0 12px color-mix(in srgb, var(--event-accent, #a855f7) 45%, transparent);
          }
          .bb-overview-starting-price {
            color: #fff;
            font-size: clamp(10px, 0.9vw, 12px);
            font-weight: 800;
            letter-spacing: 0.045em;
            line-height: 1.35;
          }

          .bb-modules-section {
            padding: clamp(70px, 8vw, 118px) clamp(20px, 5vw, 76px);
          }
          .bb-modules-inner {
            position: relative;
            z-index: 2;
            width: min(1500px, 100%);
            margin: 0 auto;
          }
          .bb-modules-heading {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin: 0 auto clamp(38px, 5vw, 64px);
          }
          .bb-modules-logo-shell {
            display: grid;
            place-items: center;
            width: clamp(100px, 13vw, 152px);
            aspect-ratio: 1;
            margin-bottom: 14px;
            border: 1.5px solid #a855f7;
            border-radius: 4px;
            background: linear-gradient(135deg, rgba(20, 8, 42, 0.94) 0%, rgba(35, 12, 68, 0.94) 100%);
            box-shadow: 0 0 32px rgba(168, 85, 247, 0.25);
            clip-path: polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%);
          }
          .bb-modules-logo {
            display: block;
            width: 82%;
            max-height: 82%;
            object-fit: contain;
          }
          .bb-modules-subtitle,
          .bb-team-subtitle {
            max-width: 620px;
            margin: 16px auto 0;
            color: rgba(255, 255, 255, 0.78);
            font-size: clamp(11px, 0.95vw, 13px);
            line-height: 1.5;
          }
          .bb-modules-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: clamp(18px, 2vw, 28px);
          }

          .bb-module-card {
            display: flex;
            flex-direction: column;
            aspect-ratio: 4 / 5;
            min-height: 0;
            overflow: hidden;
            color: inherit;
            text-decoration: none;
            min-width: 0;
            padding: 10px;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            border: 1.5px solid #a855f7;
            border-radius: 4px;
            background: linear-gradient(135deg, rgba(20, 8, 42, 0.94) 0%, rgba(35, 12, 68, 0.94) 100%);
            box-shadow: 0 18px 42px rgba(0, 0, 0, 0.3), 0 0 20px rgba(168, 85, 247, 0.2);
            clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
            transition: transform 240ms ease, border-color 240ms ease, box-shadow 240ms ease;
          }
          .bb-module-card:hover,
          .bb-module-card:focus-visible {
            transform: translateY(-6px);
            border-color: #00eaff;
            box-shadow: 0 22px 48px rgba(0, 0, 0, 0.38), 0 0 32px rgba(0, 234, 255, 0.4);
            outline: none;
          }
          .bb-module-card.is-coming-soon {
            cursor: default;
            border-color: rgba(139, 92, 246, 0.72);
          }
          .bb-module-card.is-coming-soon:hover,
          .bb-module-card.is-coming-soon:focus-visible {
            transform: none;
            border-color: rgba(139, 92, 246, 0.72);
            box-shadow: 0 18px 42px rgba(0, 0, 0, 0.3), 0 0 20px rgba(168, 85, 247, 0.2);
          }
          .bb-module-poster {
            position: relative;
            display: flex;
            flex: 1 1 auto;
            flex-direction: column;
            justify-content: space-between;
            min-height: 0;
            overflow: hidden;
            aspect-ratio: auto;
            padding: clamp(15px, 1.5vw, 22px);
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            background:
              radial-gradient(ellipse at 15% 10%, rgba(139, 92, 246, 0.28), transparent 48%),
              radial-gradient(ellipse at 90% 85%, rgba(0, 234, 255, 0.2), transparent 48%),
              linear-gradient(150deg, rgba(21, 12, 48, 0.98), rgba(5, 13, 32, 0.98));
          }
          .bb-module-poster.has-poster-image {
            padding: 0;
            gap: 0;
            background: transparent;
            border: 0;
            border-radius: 0;
            aspect-ratio: 4 / 5;
            flex: 1 1 0;
            min-height: 0;
          }
          .bb-module-poster.has-poster-image::before {
            display: none;
          }
          .bb-module-poster-image {
            display: block;
            width: 100%;
            height: auto;
            min-height: 0;
            flex: none;
            align-self: stretch;
            aspect-ratio: 4 / 5;
            object-fit: contain;
            object-position: center;
            background: transparent;
          }
          /* Image cards: preserve the complete Instagram portrait without cropping. */
          .bb-module-card:has(.bb-module-poster-image) {
            padding: 0;
            aspect-ratio: auto;
            height: auto;
            align-self: start;
            clip-path: none;
          }
          .bb-module-card:has(.bb-module-poster-image) .bb-module-poster {
            display: block;
            flex: 0 0 auto;
            width: 100%;
            height: auto;
            aspect-ratio: 4 / 5;
            min-height: 0;
            margin: 0;
            padding: 0;
            overflow: hidden;
            line-height: 0;
          }
          .bb-module-card:has(.bb-module-poster-image) .bb-module-poster-image {
            display: block;
            width: 100%;
            height: auto;
            aspect-ratio: 4 / 5;
            min-height: 0;
            flex: none;
            object-fit: contain;
            object-position: center;
            background: transparent;
          }
          .bb-module-card:has(.bb-module-poster-image) .bb-module-card-copy {
            flex: 0 0 auto;
            padding: 10px 12px 12px;
          }
          .bb-module-poster::before {
            content: "";
            position: absolute;
            inset: 10px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 4px;
            pointer-events: none;
          }
          .bb-poster-top, .bb-poster-bottom { position: relative; z-index: 1; }
          .bb-poster-index {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: #fff;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.16em;
          }
          .bb-poster-index::before {
            content: "";
            width: 18px;
            height: 2px;
            background: linear-gradient(90deg, #8b5cf6, #60a5fa);
          }
          .bb-poster-icon {
            display: grid;
            place-items: center;
            width: 56px;
            height: 56px;
            margin: 18px 0 16px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            color: #dffaff;
            font-size: 26px;
            background: linear-gradient(110deg, rgba(139, 92, 246, 0.15), rgba(0, 234, 255, 0.12));
          }
          .bb-poster-title {
            margin: 0;
            color: #fff;
            font-size: clamp(13px, 1.6vw, 18px);
            font-weight: 800;
            line-height: 1.15;
            text-transform: uppercase;
          }
          .bb-poster-code {
            margin: 10px 0 0;
            color: #fff;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.2em;
            text-transform: uppercase;
          }
          .bb-module-card-copy { flex: 0 0 auto; padding: 10px 5px 2px; }
          .bb-module-card-copy .bb-module-description { min-height: 0; margin-bottom: 8px; }
          .bb-module-description {
            min-height: 54px;
            margin: 0 0 14px;
            color: rgba(255, 255, 255, 0.8);
            font-size: clamp(11px, 0.95vw, 13px);
            line-height: 1.5;
          }
          .bb-module-prize {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin: 0 0 10px;
            padding: 8px 9px;
            border: 1px solid rgba(0, 234, 255, 0.24);
            border-radius: 3px;
            background: linear-gradient(90deg, rgba(0, 234, 255, 0.08), rgba(139, 92, 246, 0.10));
          }
          .bb-module-prize span {
            color: rgba(226, 232, 255, 0.72);
            font-size: 9px;
            letter-spacing: 0.08em;
          }
          .bb-module-prize strong {
            color: #fff;
            font-size: clamp(12px, 1vw, 15px);
            white-space: nowrap;
            text-shadow: 0 0 12px rgba(0, 234, 255, 0.25);
          }
          .bb-limited-slots-tagline {
            margin: 10px 0 8px;
            color: #f5d0fe;
            font-family: 'Orbitron', sans-serif;
            font-size: clamp(8px, 0.78vw, 10px);
            font-weight: 800;
            line-height: 1.5;
            letter-spacing: 0.075em;
            text-align: center;
            text-transform: uppercase;
            text-shadow: 0 0 10px rgba(192, 132, 252, 0.42);
          }
          .bb-register-button {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            width: 100%;
            padding: 12px 13px;
            border: 1px solid rgba(196, 181, 253, 0.45);
            border-radius: 4px;
            color: #fff;
            text-decoration: none;
            text-transform: uppercase;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.12em;
            background: rgba(139, 92, 246, 0.2);
            transition: border-color 200ms ease, background 200ms ease, box-shadow 200ms ease;
          }
          .bb-register-button:hover {
            border-color: #00eaff;
            background: rgba(0, 234, 255, 0.25);
            box-shadow: 0 0 16px rgba(0, 234, 255, 0.3);
          }
          .bb-register-button.is-coming-soon {
            justify-content: center;
            min-height: 42px;
            padding: 10px 8px;
            border-style: dashed;
            border-color: rgba(96, 165, 250, 0.65);
            color: #ddd6fe;
            text-align: center;
            background: linear-gradient(100deg, rgba(109, 40, 217, 0.18), rgba(59, 130, 246, 0.13));
            cursor: default;
          }
          .bb-register-button.is-coming-soon:hover {
            border-color: rgba(96, 165, 250, 0.65);
            background: linear-gradient(100deg, rgba(109, 40, 217, 0.18), rgba(59, 130, 246, 0.13));
            box-shadow: none;
          }
          .bb-coming-soon-label {
            display: block;
            width: 100%;
            font-size: clamp(8px, 0.72vw, 10px);
            line-height: 1.45;
            letter-spacing: 0.07em;
            white-space: normal;
          }
          .bb-coming-soon-countdown {
            display: block;
            margin-top: 5px;
            color: #67e8f9;
            font-size: clamp(9px, 0.78vw, 11px);
            font-weight: 800;
            letter-spacing: 0.1em;
            font-variant-numeric: tabular-nums;
            text-shadow: 0 0 10px rgba(0, 234, 255, 0.3);
          }
          .bb-overview-event-prize .bb-coming-soon-countdown {
            margin-top: 7px;
          }

          .bb-team-section {
            padding: clamp(76px, 8vw, 124px) clamp(20px, 5vw, 76px);
          }
          .bb-team-inner {
            position: relative;
            z-index: 2;
            width: min(1380px, 100%);
            margin: 0 auto;
          }
          .bb-team-heading {
            text-align: center;
            margin: 0 auto clamp(36px, 5vw, 64px);
          }
          .bb-team-logo-shell { margin-left: auto; margin-right: auto; }
          .bb-team-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: clamp(14px, 2vw, 26px);
          }

          .bb-team-card {
            min-width: 0;
            padding: 12px;
            border: 1.5px solid #a855f7;
            border-radius: 4px;
            background: linear-gradient(135deg, rgba(20, 8, 42, 0.94) 0%, rgba(35, 12, 68, 0.94) 100%);
            box-shadow: 0 18px 42px rgba(0, 0, 0, 0.3), 0 0 20px rgba(168, 85, 247, 0.2);
            clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
            transition: transform 240ms ease, border-color 240ms ease, box-shadow 240ms ease;
          }
          .bb-team-card:hover {
            transform: translateY(-6px);
            border-color: #00eaff;
            box-shadow: 0 22px 48px rgba(0, 0, 0, 0.38), 0 0 32px rgba(0, 234, 255, 0.4);
          }
          .bb-team-photo {
            position: relative;
            overflow: hidden;
            aspect-ratio: 4 / 5;
            border-radius: 4px;
            border: 1px solid rgba(167, 139, 250, 0.35);
            background: linear-gradient(145deg, #120a20, #07040e);
          }
          .bb-team-member-photo {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
          }
          .bb-team-card-meta { padding: 18px 7px 8px; }
          .bb-team-role {
            margin: 0 0 7px;
            color: #c4b5fd;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }
          .bb-team-name {
            margin: 0;
            color: #fff;
            font-size: clamp(13px, 1.3vw, 16px);
            font-weight: 800;
            text-transform: uppercase;
          }
          .bb-team-name-hint {
            margin: 8px 0 0;
            color: #c4b5fd;
            font-size: 11px;
            font-weight: 600;
          }
          .bb-team-phone {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            margin-top: 10px;
            color: #91edff;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-decoration: none;
          }
          .bb-team-phone:hover { color: #c4b5fd; }

          .bb-next-section .bb-overview-copy > *,
          .bb-modules-section .bb-modules-heading > *,
          .bb-module-card,
          .bb-results-section .bb-results-heading > *,
          .bb-results-card,
          .bb-team-section .bb-team-heading > *,
          .bb-team-card {
            opacity: 0;
            transform: translate3d(0, 34px, 0);
            transition: opacity 720ms ease, transform 780ms cubic-bezier(0.2, 0.75, 0.25, 1);
          }
          .bb-next-section .bb-overview-copy > *.bb-scroll-revealed,
          .bb-modules-section .bb-modules-heading > *.bb-scroll-revealed,
          .bb-module-card.bb-scroll-revealed,
          .bb-results-section .bb-results-heading > *.bb-scroll-revealed,
          .bb-results-card.bb-scroll-revealed,
          .bb-team-section .bb-team-heading > *.bb-scroll-revealed,
          .bb-team-card.bb-scroll-revealed {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }

          @media (hover: none), (pointer: coarse) {
            .bb-match { cursor: auto; }
            .bb-match-cursor, .bb-match-ring { display: none; }
            .bb-hotspot { cursor: pointer; }
          }

          @media (max-width: 1100px) {
            .bb-modules-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          }

          @media (max-width: 1000px) {
            .bb-team-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              max-width: 760px;
              margin: 0 auto;
            }
          }

          @media (max-width: 850px) {
            .bb-overview-poster {
              max-width: 30vw;
              max-height: 65%;
              right: 1.5%;
            }
            .bb-next-layout {
              width: calc(100% - 32vw);
              max-width: none;
            }
          }

          @media (max-width: 720px) {
            .bb-modules-section { padding: 70px 20px; }
            .bb-modules-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
            .bb-module-card { padding: 7px; border-radius: 4px; aspect-ratio: 4 / 5; }
            .bb-module-poster { padding: 14px; }
            .bb-poster-icon { width: 45px; height: 45px; font-size: 22px; margin: 15px 0 12px; }
            .bb-register-button { padding: 11px 9px; font-size: 9px; }
          }

          @media (max-width: 700px) {
            .bb-ss-art {
              top: 96px;
              left: -36px;
              width: clamp(165px, 42vw, 260px);
              max-width: 48vw;
              max-height: 30svh;
            }
            .bb-hero-logo-box {
              top: 43%;
              width: 100%;
            }
            .bb-logo-link {
              width: 96vw;
              max-width: 96vw;
            }
            .bb-event-logo {
              width: 94vw;
              max-width: 520px;
              max-height: 38svh;
              margin: 0 auto;
            }
            .bb-fe-art {
              top: 68%;
              width: clamp(250px, 72vw, 370px);
              max-width: 80vw;
              max-height: 20svh;
            }
            .bb-hero-view-modules-btn {
              bottom: max(12px, calc(env(safe-area-inset-bottom) + 8px));
              padding: 7px 15px;
              gap: 6px;
              font-size: 9px;
              letter-spacing: 0.12em;
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
            }
          }

          @media (max-width: 600px) {
            .bb-next-section {
              display: flex;
              flex-direction: column;
              align-items: stretch;
              gap: 20px;
              padding: 32px 16px 48px;
            }
            .bb-overview-poster {
              position: relative;
              top: auto;
              right: auto;
              transform: none;
              width: min(82%, 340px);
              max-width: 340px;
              max-height: none;
              margin: 0 auto;
            }
            .bb-next-layout {
              width: 100%;
              max-width: 100%;
            }
            .bb-overview-events {
              grid-template-columns: 1fr;
              gap: 11px;
            }
          }

          @media (max-width: 520px) {
            .bb-team-section { padding: 72px 17px; }
            .bb-team-grid { gap: 12px; }
            .bb-team-card { padding: 8px; border-radius: 4px; }
          }

          @media (max-width: 420px) {
            .bb-ss-art {
              top: 94px;
              left: -20px;
              width: 49vw;
              max-width: 210px;
            }
            .bb-event-logo {
              width: 92vw;
              max-width: 420px;
              max-height: 35svh;
            }
            .bb-fe-art {
              top: 68%;
              width: 70vw;
              max-width: 290px;
              max-height: 19svh;
            }
          }

          @media (max-width: 380px) {
            .bb-modules-grid {
              grid-template-columns: 1fr;
              max-width: 330px;
              margin: 0 auto;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .bb-ss-art,
            .bb-hero-logo-box,
            .bb-scroll-ship {
              animation: none !important;
            }
            .bb-next-section .bb-overview-copy > *,
            .bb-modules-section .bb-modules-heading > *,
            .bb-module-card,
            .bb-results-section .bb-results-heading > *,
            .bb-results-card,
            .bb-team-section .bb-team-heading > *,
            .bb-team-card {
              opacity: 1;
              transform: none;
              transition: none;
            }
          }
          /* Uniform module cards: same width and total height for BGMI, RC and poster modules. */
          .bb-modules-grid {
            align-items: stretch;
          }
          .bb-module-card,
          .bb-module-card:has(.bb-module-poster-image) {
            display: flex;
            flex-direction: column;
            align-self: stretch;
            width: 100%;
            height: auto;
            min-height: 0;
            aspect-ratio: auto;
            padding: 0;
            clip-path: none;
            overflow: hidden;
          }
          .bb-module-poster,
          .bb-module-poster.has-poster-image,
          .bb-module-card:has(.bb-module-poster-image) .bb-module-poster {
            display: flex;
            flex: 0 0 auto;
            width: 100%;
            height: auto;
            min-height: 0;
            aspect-ratio: 4 / 5;
            margin: 0;
            overflow: hidden;
            border: 0;
            border-radius: 0;
          }
          .bb-module-poster.has-poster-image,
          .bb-module-card:has(.bb-module-poster-image) .bb-module-poster {
            padding: 0;
            background: transparent;
            line-height: 0;
          }
          .bb-module-poster-image,
          .bb-module-card:has(.bb-module-poster-image) .bb-module-poster-image {
            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            flex: 1 1 auto;
            align-self: stretch;
            aspect-ratio: auto;
            object-fit: contain;
            object-position: center;
            background: transparent;
          }
          .bb-module-card-copy,
          .bb-module-card:has(.bb-module-poster-image) .bb-module-card-copy {
            flex: 1 1 auto;
            min-width: 0;
            padding: 10px 12px 12px;
          }
          .bb-module-card-copy .bb-module-description {
            min-height: 0;
            margin-bottom: 8px;
          }
          @media (max-width: 720px) {
            .bb-module-card,
            .bb-module-card:has(.bb-module-poster-image) {
              padding: 0;
              aspect-ratio: auto;
            }
            .bb-module-card-copy,
            .bb-module-card:has(.bb-module-poster-image) .bb-module-card-copy {
              padding: 8px 9px 10px;
            }
          }
        `}</style>
      </main>

      <section id="overview" className="bb-next-section" aria-label="Event overview">
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
                Pick your arena, bring your squad, and make your mark at Battleblaze 2026.
              </p>
              <div className="bb-overview-tags" aria-label="Event highlights">
                <span className="bb-overview-tag">COMPETE</span>
                <span className="bb-overview-tag">CONNECT</span>
                <span className="bb-overview-tag">CONQUER</span>
              </div>
            </div>

            <div className="bb-overview-events" aria-label="Battleblaze events">
              {[
                { name: "FIFA", game: "FIFA", code: "ARENA 01 // FOOTBALL", color: "#45ffb0", icon: "⚽", prize: "₹5,000" },
                { name: "VALORANT", game: "VALORANT", code: "ARENA 02 // TACTICAL FPS", color: "#8b5cf6", icon: "◈", prize: "₹5,000" },
                { name: "BGMI", game: "BGMI", code: "ARENA 03 // BATTLE ROYALE", color: "#ffb347", icon: "⌖", prize: "₹20,000" },
                { name: "MOBILE LEGENDS", game: "MOBILE_LEGENDS", code: "ARENA 04 // MOBA", color: "#ff4fa3", icon: "⬡", prize: "₹5,000" },
                { name: "RC", game: "RC", code: "ARENA 05 // REAL CRICKET", color: "#00eaff", icon: "↗", prize: "₹5,000" },
                { name: "PS5 RUSH", game: "PS5_RUSH", code: "ARENA 06 // CONSOLE", color: "#5c8dff", icon: "△" },
                { name: "VRXPERIENCE", game: "VR_EXPERIENCE", code: "ARENA 07 // IMMERSIVE", color: "#bf7bff", icon: "◎" },
              ].map((event) => (
                <a
                  className={`bb-overview-event-card ${event.comingSoon ? "is-coming-soon" : ""}`}
                  key={event.name}
                  href={event.comingSoon ? undefined : `/register?game=${encodeURIComponent(event.game)}`}
                  style={{ "--event-accent": event.color }}
                  aria-label={event.comingSoon ? `${event.name} registration coming soon` : `Register for ${event.name}`}
                  aria-disabled={event.comingSoon ? "true" : undefined}
                  onClick={(e) => {
                    if (event.comingSoon) {
                      e.preventDefault();
                      return;
                    }
                    e.preventDefault();
                    goToRegistration(event.game);
                  }}
                >
                  <div className="bb-overview-event-top">
                    <span className="bb-overview-event-icon" aria-hidden="true">{event.icon}</span>
                    <span className="bb-overview-event-code">{event.code}</span>
                  </div>
                  <h3>{event.name}</h3>
                  {(event.game === "PS5_RUSH" || event.game === "VR_EXPERIENCE") ? (
                    <div className="bb-overview-booking-info">
                      <span className="bb-overview-booking-cta">BOOK YOUR SLOTS</span>
                      <strong className="bb-overview-starting-price">
                        STARTING FROM {event.game === "PS5_RUSH" ? "₹100" : "₹150"}
                      </strong>
                    </div>
                  ) : (
                    <div className="bb-overview-event-prize">
                      <span>{event.comingSoon ? "REGISTRATION" : "PRIZE POOL"}</span>
                      <strong>{event.comingSoon ? "COMING SOON" : event.prize}</strong>
                      {event.comingSoon && (
                        <small className="bb-coming-soon-countdown">OPENS IN {registrationCountdown}</small>
                      )}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="bb-modules-section" aria-label="Battleblaze modules">
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
              { name: "BGMI", game: "BGMI", code: "01 // BATTLE ROYALE", icon: "⌖", description: "Squad up and fight for the final zone.", prize: "₹20,000", posterImage: bgmiPosterUrl },
              { name: "VALORANT", game: "VALORANT", code: "02 // TACTICAL FPS", icon: "◈", description: "Teamwork win every round.", prize: "₹5,000", posterImage: valoPosterUrl },
              { name: "FIFA", game: "FIFA", code: "03 // FOOTBALL", icon: "⚽", description: "Control the pitch and score the win.", prize: "₹5,000", posterImage: fifaPosterUrl },
              { name: "MOBILE LEGENDS", game: "MOBILE_LEGENDS", code: "04 // MOBA", icon: "⬡", description: "Pick your hero. Team up. Push to win.", prize: "₹5,000", posterImage: mlbbPosterUrl },
              { name: "RC", game: "RC", code: "05 // REAL CRICKET", icon: "🏏", description: "Represent your side and compete for the win.", prize: "₹5,000", posterImage: rcPosterUrl },
              { name: "VR EXPERIENCE", game: "VR_EXPERIENCE", code: "06 // IMMERSIVE", icon: "◎", description: "Enter an immersive virtual world.", posterImage: vrPosterUrl },
              { name: "PS5 RUSH", game: "PS5_RUSH", code: "07 // CONSOLE", icon: "△", description: "Grab a controller and challenge rivals.", posterImage: ps5PosterUrl },
            ].map((module, index) => (
              <a
                className={`bb-module-card ${module.comingSoon ? "is-coming-soon" : ""}`}
                key={module.name}
                href={module.comingSoon ? undefined : `/register?game=${encodeURIComponent(module.game)}`}
                aria-label={module.comingSoon ? `${module.name} registration coming soon` : `Register for ${module.name}`}
                aria-disabled={module.comingSoon ? "true" : undefined}
                onClick={(event) => {
                  if (module.comingSoon) {
                    event.preventDefault();
                    return;
                  }
                  event.preventDefault();
                  goToRegistration(module.game);
                }}
              >
                <div className={`bb-module-poster ${module.posterImage ? "has-poster-image" : ""}`}>
                  {module.posterImage ? (
                    <img
                      className="bb-module-poster-image"
                      src={module.posterImage}
                      alt={`${module.name} Instagram tournament poster`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <>
                      <div className="bb-poster-top">
                        <span className="bb-poster-index">BATTLEBLAZE / {String(index + 1).padStart(2, "0")}</span>
                        <div className="bb-poster-icon" aria-hidden="true">{module.icon}</div>
                        <h3 className="bb-poster-title">{module.name}</h3>
                        <p className="bb-poster-code">{module.code}</p>
                      </div>
                      <div className="bb-poster-bottom">
                        <span className="bb-poster-index">NITS ESPORTS · 2026</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="bb-module-card-copy">
                  <p className="bb-module-description">{module.description}</p>
                  {!module.comingSoon && module.prize && (
                    <div className="bb-module-prize">
                      <span>PRIZE POOL</span>
                      <strong>{module.prize}</strong>
                    </div>
                  )}
                  {(module.game === "PS5_RUSH" || module.game === "VR_EXPERIENCE") && !module.comingSoon && (
                    <p className="bb-limited-slots-tagline">
                      LIMITED SLOTS AVAILABLE — BOOK YOUR SLOTS NOW!
                    </p>
                  )}
                  <span className={`bb-register-button ${module.comingSoon ? "is-coming-soon" : ""}`} aria-hidden="true">
                    {module.comingSoon ? (
                      <span className="bb-coming-soon-label">
                        REGISTRATION COMING SOON
                        <small className="bb-coming-soon-countdown">OPENS IN {registrationCountdown}</small>
                      </span>
                    ) : (
                      <><span>Register Now</span><span aria-hidden="true">↗</span></>
                    )}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="results-schedule" className="bb-results-section" aria-label="Game schedules and results">
        <div className="bb-scroll-ships bb-scroll-ships-team" style={{ "--bb-jet-url": `url(${jetUrl})` }} aria-hidden="true">
          <span className="bb-scroll-ship bb-scroll-ship-one" />
          <span className="bb-scroll-ship bb-scroll-ship-two" />
        </div>
        <div className="bb-results-inner">
          <header className="bb-results-heading">
            <div className="bb-modules-logo-shell">
              <img className="bb-modules-logo" src={logoUrl} alt="Battleblaze logo" draggable="false" />
            </div>
            <p className="bb-results-kicker">Battleblaze // 2026</p>
            <h2 className="bb-results-title">RESULTS &amp; SCHEDULE</h2>
            <p className="bb-results-subtitle">
              Check fixtures, match timings, and tournament results for your game.
            </p>
          </header>

          <div className="bb-results-grid">
            {[
              { name: "BGMI", game: "BGMI", posterImage: bgmiPosterUrl },
              { name: "VALORANT", game: "VALORANT", posterImage: valoPosterUrl },
              { name: "FIFA", game: "FIFA", posterImage: fifaPosterUrl },
              { name: "MOBILE LEGENDS", game: "MOBILE_LEGENDS", posterImage: mlbbPosterUrl },
              { name: "RC", game: "RC", posterImage: rcPosterUrl },
            ].map((item) => (
              <article className="bb-results-card" key={item.game}>
                <img
                  className="bb-results-poster"
                  src={item.posterImage}
                  alt={`${item.name} Battleblaze module poster`}
                  loading="lazy"
                  decoding="async"
                />
                <div className="bb-results-card-content">
                  <h3 className="bb-results-game-name">{item.name}</h3>
                  <div className="bb-results-actions">
                    <a
                      className="bb-results-button"
                      href={`/bbschedule?game=${encodeURIComponent(item.game)}`}
                      aria-label={`View ${item.name} schedule`}
                    >
                      VIEW SCHEDULE <span aria-hidden="true">↗</span>
                    </a>
                    <a
                      className="bb-results-button is-result"
                      href={`/results?game=${encodeURIComponent(item.game)}`}
                      aria-label={`View ${item.name} results`}
                      onClick={(event) => {
                        event.preventDefault();
                        // Open BBResult.jsx and pass the selected game's key.
                        window.location.assign(
                          `/results?game=${encodeURIComponent(item.game)}`
                        );
                      }}
                    >
                      RESULTS <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="bb-team-section" aria-label="Battleblaze team">
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