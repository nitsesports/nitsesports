import { useEffect, useState } from "react";
import * as THREE from "three";
import appLogo from "../assets/logoo.png";
import thumbnail from "../assets/thumbnail.png";

const Hero = () => {
  const [showSponsors, setShowSponsors] = useState(false);

  // =========================================================
  // THREE.JS CYBER PORTAL (mobile-smooth, desktop unchanged)
  // =========================================================

  useEffect(() => {
    const container = document.getElementById("hero-cyber-portal");
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.className = "hero-cyber-portal-canvas";
    container.appendChild(canvas);

    // Track resources for complete memory leak prevention
    const disposeGeometries = new Set();
    const disposeMaterials = new Set();

    const trackG = (g) => { disposeGeometries.add(g); return g; };
    const trackM = (m) => { disposeMaterials.add(m); return m; };

    const isMobile = window.innerWidth <= 768;

    // -------------------------------------------------------
    // STABLE VIEWPORT MEASUREMENT
    // -------------------------------------------------------
    const measureViewport = () => {
      if (!isMobile) {
        return {
          w: window.innerWidth,
          h: window.innerHeight,
          visibleH: window.innerHeight,
        };
      }
      const mk = (unit) => {
        const p = document.createElement("div");
        p.style.cssText = `position:fixed;left:0;top:0;width:0;height:100${unit};visibility:hidden;pointer-events:none;`;
        document.body.appendChild(p);
        const h = p.offsetHeight;
        document.body.removeChild(p);
        return h;
      };
      const lvh = mk("lvh") || window.innerHeight;
      const svh = mk("svh") || window.innerHeight;
      return {
        w: document.documentElement.clientWidth || window.innerWidth,
        h: Math.max(lvh, svh),
        visibleH: svh,
      };
    };

    let vp = measureViewport();
    let cachedInnerWidth = vp.w;
    let cachedInnerHeight = vp.h;
    let scrollRef = vp.visibleH;

    // -------------------------------------------------------
    // MOBILE WHITE-FLASH FIX
    // -------------------------------------------------------
    const fixBlend = (p) =>
      isMobile && p.blending === THREE.AdditiveBlending
        ? {
            ...p,
            blending: THREE.CustomBlending,
            blendEquation: THREE.AddEquation,
            blendSrc: THREE.SrcAlphaFactor,
            blendDst: THREE.OneFactor,
            blendSrcAlpha: THREE.OneFactor,
            blendDstAlpha: THREE.OneFactor,
          }
        : p;
    const MBM = (p) => new THREE.MeshBasicMaterial(fixBlend(p));
    const LBM = (p) => new THREE.LineBasicMaterial(fixBlend(p));

    // =======================================================
    // GEOMETRY-MERGE HELPER (COLLAPSE DRAW CALLS)
    // =======================================================
    const mergePositions = (items) => {
      let totalVerts = 0;
      const tempGeoms = [];
      const posAttrs = items.map(({ geometry }) => {
        let g = geometry;
        let isTemp = false;
        if (g.index) {
          g = g.toNonIndexed();
          isTemp = true;
        }
        const attr = g.getAttribute("position");
        if (isTemp) tempGeoms.push(g);
        totalVerts += attr.count;
        return attr;
      });

      const merged = new Float32Array(totalVerts * 3);
      let offset = 0;
      const v = new THREE.Vector3();
      items.forEach(({ matrix }, idx) => {
        const attr = posAttrs[idx];
        for (let i = 0; i < attr.count; i++) {
          v.fromBufferAttribute(attr, i);
          v.applyMatrix4(matrix);
          merged[offset++] = v.x;
          merged[offset++] = v.y;
          merged[offset++] = v.z;
        }
      });

      tempGeoms.forEach((g) => g.dispose());

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(merged, 3));
      return geo;
    };

    const buildStaticGroup = (specs, material, isLine) => {
      if (!specs.length) return null;
      const items = specs.map(({ geometry, position, rotation }) => {
        const m = new THREE.Matrix4();
        const quat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(rotation?.[0] || 0, rotation?.[1] || 0, rotation?.[2] || 0)
        );
        m.compose(
          new THREE.Vector3(position?.[0] || 0, position?.[1] || 0, position?.[2] || 0),
          quat,
          new THREE.Vector3(1, 1, 1)
        );
        return { geometry, matrix: m };
      });
      const mergedGeo = trackG(mergePositions(items));
      const obj = isLine
        ? new THREE.LineSegments(mergedGeo, material)
        : new THREE.Mesh(mergedGeo, material);

      obj.matrixAutoUpdate = false;
      obj.updateMatrix();
      return obj;
    };

    // =======================================================
    // SCENE & CAMERA
    // =======================================================
    const scene = new THREE.Scene();
    if (!isMobile) scene.fog = new THREE.FogExp2(0x000000, 0.018);

    // -------------------------------------------------------
    // MOBILE-ONLY STARFIELD (HIGH BRIGHTNESS & GLOW)
    // -------------------------------------------------------
    let mobileStars = null;
    let mobileStarGeometry = null;
    let mobileStarMaterial = null;

    if (isMobile) {
      const STAR_COUNT = 520; // Star count bilkul same hai
      const starPositions = new Float32Array(STAR_COUNT * 3);
      const starDrift = new Float32Array(STAR_COUNT);

      for (let i = 0; i < STAR_COUNT; i++) {
        const a = Math.random() * Math.PI * 2;
        const radius = 2.8 + Math.pow(Math.random(), 0.62) * 8.5;
        const z = -12 + Math.random() * 16;

        starPositions[i * 3] = Math.cos(a) * radius;
        starPositions[i * 3 + 1] = Math.sin(a) * radius;
        starPositions[i * 3 + 2] = z;
        starDrift[i] = 0.0015 + Math.random() * 0.004;
      }

      mobileStarGeometry = trackG(new THREE.BufferGeometry());
      mobileStarGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(starPositions, 3)
      );

      // Brightness, Size aur Additive Glow ko enhance kiya gaya hai
      mobileStarMaterial = trackM(
        new THREE.PointsMaterial(fixBlend({
          color: 0xffffff,
          size: 0.085,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
        }))
      );

      mobileStars = new THREE.Points(mobileStarGeometry, mobileStarMaterial);
      mobileStars.renderOrder = -10;
      scene.add(mobileStars);

      mobileStars.userData.drift = starDrift;
    }

    const CAM_FOV = 45;
    const MOBILE_CAM_Z = 8.4;

    const camera = new THREE.PerspectiveCamera(
      CAM_FOV,
      cachedInnerWidth / cachedInnerHeight,
      0.1,
      100
    );
    camera.position.z = isMobile ? MOBILE_CAM_Z : 9;

    // =======================================================
    // RENDERER
    // =======================================================
    let mobilePR = Math.min(window.devicePixelRatio || 1, 1.5);
    const getPixelRatio = () =>
      isMobile ? mobilePR : Math.min(window.devicePixelRatio || 1, 1.15);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: !isMobile,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      precision: isMobile ? "highp" : "mediump",
    });

    renderer.setPixelRatio(getPixelRatio());
    renderer.setSize(cachedInnerWidth, cachedInnerHeight, false);
    renderer.setClearColor(0x050505, isMobile ? 1 : 0);
    renderer.toneMappingExposure = 1.15;

    // WebGL context loss
    let contextLost = false;
    const onCtxLost = (e) => {
      e.preventDefault();
      contextLost = true;
    };
    const onCtxRestored = () => {
      contextLost = false;
      renderer.setPixelRatio(getPixelRatio());
      renderer.setSize(cachedInnerWidth, cachedInnerHeight, false);
    };
    canvas.addEventListener("webglcontextlost", onCtxLost, false);
    canvas.addEventListener("webglcontextrestored", onCtxRestored, false);

    // =======================================================
    // PORTAL GROUP
    // =======================================================
    const portal = new THREE.Group();
    portal.position.set(0, 0, 0);
    portal.renderOrder = 100;
    portal.scale.setScalar(isMobile ? 0.72 : 1.30);
    scene.add(portal);

    // -------------------------------------------------------
    // MOBILE FRAMING
    // -------------------------------------------------------
    const MOBILE_FIT = 0.96;
    const PORTAL_OUTER_R = 3.3;
    const layoutMobilePortal = () => {
      if (!isMobile) return;
      const halfH = MOBILE_CAM_Z * Math.tan(THREE.MathUtils.degToRad(CAM_FOV / 2));
      const aspect = cachedInnerWidth / cachedInnerHeight;
      const halfW = halfH * aspect;

      const fitScale = THREE.MathUtils.clamp(
        (halfW * MOBILE_FIT) / PORTAL_OUTER_R,
        0.3,
        0.9
      );
      portal.scale.setScalar(fitScale);

      const worldPerPx = (2 * halfH) / cachedInnerHeight;
      const centreShiftPx = (cachedInnerHeight - scrollRef) / 2;
      portal.position.y = -0.08 + centreShiftPx * worldPerPx;
    };

    const uniqueFadeMaterials = new Set();
    const registerFadeMaterial = (material) => {
      if (material && material.userData && material.userData.portalBaseOpacity !== undefined) {
        uniqueFadeMaterials.add(material);
      }
    };

    // =======================================================
    // OUTER RINGS
    // =======================================================
    const rings = [];
    [
      [3.25, 0.035, 0.72, 0.12],
      [3.05, 0.014, 0.32, -0.18],
      [2.82, 0.045, 0.9, 0.22],
      [2.62, 0.018, 0.4, -0.3],
      [2.42, 0.028, 0.58, 0.16],
    ].forEach((d, i) => {
      const baseOpacity = Math.min(1, d[2] * 1.75);
      const material = trackM(MBM({
        color: 0xffffff,
        transparent: true,
        opacity: baseOpacity,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: i % 2 === 0 ? THREE.AdditiveBlending : THREE.NormalBlending,
      }));
      const geo = trackG(new THREE.RingGeometry(d[0], d[0] + d[1], 32));
      const mesh = new THREE.Mesh(geo, material);
      mesh.rotation.x = Math.PI / 2;
      portal.add(mesh);
      rings.push({ mesh, speed: d[3], baseOpacity });
    });

    // =======================================================
    // SEGMENTED MECHANICAL RING
    // =======================================================
    const segmented = new THREE.Group();
    portal.add(segmented);
    const segGeo = trackG(new THREE.BoxGeometry(0.26, 0.035, 0.025));
    const segMat1 = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 1.0, depthWrite: false }));
    const segMat2 = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 0.42, depthWrite: false }));
    segMat1.userData.portalBaseOpacity = 1.0;
    segMat2.userData.portalBaseOpacity = 0.42;
    registerFadeMaterial(segMat1);
    registerFadeMaterial(segMat2);

    {
      const specsA = [];
      const specsB = [];
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const spec = { geometry: segGeo, position: [Math.cos(a) * 2.72, Math.sin(a) * 2.72, 0], rotation: [0, 0, a] };
        (i % 3 === 0 ? specsA : specsB).push(spec);
      }
      const meshA = buildStaticGroup(specsA, segMat1, false);
      const meshB = buildStaticGroup(specsB, segMat2, false);
      if (meshA) segmented.add(meshA);
      if (meshB) segmented.add(meshB);
    }

    // =======================================================
    // RADIAL ENERGY WIRES
    // =======================================================
    const radial = new THREE.Group();
    portal.add(radial);
    const radGeo = trackG(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(1.45, 0, 0),
      new THREE.Vector3(3.2, 0, 0),
    ]));
    const radMat1 = trackM(LBM({ color: 0xffffff, transparent: true, opacity: 0.62, blending: THREE.AdditiveBlending, depthWrite: false }));
    const radMat2 = trackM(LBM({ color: 0xffffff, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
    radMat1.userData.portalBaseOpacity = 0.62;
    radMat2.userData.portalBaseOpacity = 0.16;
    registerFadeMaterial(radMat1);
    registerFadeMaterial(radMat2);

    {
      const specsA = [];
      const specsB = [];
      for (let i = 0; i < 36; i++) {
        const rot = [0, 0, (i / 36) * Math.PI * 2];
        const spec = { geometry: radGeo, position: [0, 0, 0], rotation: rot };
        (i % 4 === 0 ? specsA : specsB).push(spec);
      }
      const meshA = buildStaticGroup(specsA, radMat1, true);
      const meshB = buildStaticGroup(specsB, radMat2, true);
      if (meshA) radial.add(meshA);
      if (meshB) radial.add(meshB);
    }

    // =======================================================
    // INNER RINGS
    // =======================================================
    const innerRings = [];
    const IN_N = 9;
    const IN_F = 1;
    for (let i = 0; i < IN_N; i++) {
      const r = 2.18 - i * 0.19 * IN_F;
      const baseOpacity = 0.58 - i * 0.025 * IN_F;
      const material = trackM(MBM({
        color: 0xffffff, transparent: true, opacity: baseOpacity, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      material.userData.portalBaseOpacity = baseOpacity;
      registerFadeMaterial(material);

      const mesh = new THREE.Mesh(trackG(new THREE.RingGeometry(r, r + 0.012, 32)), material);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.z = -i * 0.11 * IN_F;
      portal.add(mesh);
      innerRings.push(mesh);
    }

    // =======================================================
    // REACTOR CORE
    // =======================================================
    const reactor = new THREE.Group();
    reactor.position.z = -1.18;
    portal.add(reactor);

    const reactorRings = [];
    [
      [1.58, 0.014, 0.13], [1.46, 0.028, 0.22], [1.30, 0.010, 0.34], [1.14, 0.022, 0.20],
      [0.98, 0.012, 0.42], [0.82, 0.024, 0.24], [0.66, 0.014, 0.48], [0.52, 0.022, 0.34],
    ].forEach(([r, width, opacity], i) => {
      const material = trackM(MBM({
        color: 0xffffff, transparent: true, opacity, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      material.userData.portalBaseOpacity = opacity;
      registerFadeMaterial(material);

      const mesh = new THREE.Mesh(trackG(new THREE.RingGeometry(r, r + width, 32)), material);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.z = i * -0.032;
      reactor.add(mesh);
      reactorRings.push({ mesh, speed: (i % 2 ? -1 : 1) * (0.022 + i * 0.005) });
    });

    // =======================================================
    // REACTOR ARMOR
    // =======================================================
    const reactorArmor = new THREE.Group();
    reactor.add(reactorArmor);

    const armorGeos = [
      trackG(new THREE.BoxGeometry(0.19, 0.055, 0.028)), trackG(new THREE.BoxGeometry(0.19, 0.032, 0.028)),
      trackG(new THREE.BoxGeometry(0.11, 0.055, 0.028)), trackG(new THREE.BoxGeometry(0.11, 0.032, 0.028))
    ];
    const armMat1 = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 0.46, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    const armMat2 = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 0.16, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    armMat1.userData.portalBaseOpacity = 0.46;
    armMat2.userData.portalBaseOpacity = 0.16;
    registerFadeMaterial(armMat1);
    registerFadeMaterial(armMat2);

    {
      const specsA = [];
      const specsB = [];
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const wIdx = i % 2 === 0 ? 0 : 2;
        const hIdx = i % 3 === 0 ? 0 : 1;
        const geo = armorGeos[wIdx + hIdx];
        const spec = { geometry: geo, position: [Math.cos(a) * 1.38, Math.sin(a) * 1.38, 0.02], rotation: [0, 0, a + Math.PI / 2] };
        (i % 4 === 0 ? specsA : specsB).push(spec);
      }
      const meshA = buildStaticGroup(specsA, armMat1, false);
      const meshB = buildStaticGroup(specsB, armMat2, false);
      if (meshA) reactorArmor.add(meshA);
      if (meshB) reactorArmor.add(meshB);
    }

    // =======================================================
    // INNER LOCK RING
    // =======================================================
    const lockRing = new THREE.Group();
    reactor.add(lockRing);
    const lockGeo = trackG(new THREE.BoxGeometry(0.16, 0.026, 0.022));
    const lockMat1 = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 0.58, blending: THREE.AdditiveBlending, depthWrite: false }));
    const lockMat2 = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false }));
    lockMat1.userData.portalBaseOpacity = 0.58;
    lockMat2.userData.portalBaseOpacity = 0.14;
    registerFadeMaterial(lockMat1);
    registerFadeMaterial(lockMat2);

    {
      const specsA = [];
      const specsB = [];
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const spec = { geometry: lockGeo, position: [Math.cos(a) * 0.91, Math.sin(a) * 0.91, 0.035], rotation: [0, 0, a] };
        (i % 5 === 0 ? specsA : specsB).push(spec);
      }
      const meshA = buildStaticGroup(specsA, lockMat1, false);
      const meshB = buildStaticGroup(specsB, lockMat2, false);
      if (meshA) lockRing.add(meshA);
      if (meshB) lockRing.add(meshB);
    }

    // =======================================================
    // REACTOR SPOKES
    // =======================================================
    const reactorSpokes = new THREE.Group();
    reactor.add(reactorSpokes);
    const spokeGeo1 = trackG(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.56, 0, -0.04), new THREE.Vector3(1.10, 0, -0.04)]));
    const spokeGeo2 = trackG(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.70, 0, -0.04), new THREE.Vector3(1.25, 0, -0.04)]));
    const spokeMat1 = trackM(LBM({ color: 0xffffff, transparent: true, opacity: 0.52, blending: THREE.AdditiveBlending, depthWrite: false }));
    const spokeMat2 = trackM(LBM({ color: 0xffffff, transparent: true, opacity: 0.10, blending: THREE.AdditiveBlending, depthWrite: false }));
    spokeMat1.userData.portalBaseOpacity = 0.52;
    spokeMat2.userData.portalBaseOpacity = 0.10;
    registerFadeMaterial(spokeMat1);
    registerFadeMaterial(spokeMat2);

    {
      const specsA = [];
      const specsB = [];
      for (let i = 0; i < 40; i++) {
        const geo = i % 2 === 0 ? spokeGeo1 : spokeGeo2;
        const rot = [0, 0, (i / 40) * Math.PI * 2];
        const spec = { geometry: geo, position: [0, 0, 0], rotation: rot };
        (i % 5 === 0 ? specsA : specsB).push(spec);
      }
      const meshA = buildStaticGroup(specsA, spokeMat1, true);
      const meshB = buildStaticGroup(specsB, spokeMat2, true);
      if (meshA) reactorSpokes.add(meshA);
      if (meshB) reactorSpokes.add(meshB);
    }

    // =======================================================
    // CROSSHAIR & IRISES
    // =======================================================
    const crosshair = new THREE.Group();
    reactor.add(crosshair);
    const crGeo1 = trackG(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.78, 0, -0.10), new THREE.Vector3(0.78, 0, -0.10)]));
    const crGeo2 = trackG(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.58, 0, -0.10), new THREE.Vector3(0.58, 0, -0.10)]));
    const crMat1 = trackM(LBM({ color: 0xffffff, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false }));
    const crMat2 = trackM(LBM({ color: 0xffffff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false }));
    crMat1.userData.portalBaseOpacity = 0.13;
    crMat2.userData.portalBaseOpacity = 0.08;
    registerFadeMaterial(crMat1);
    registerFadeMaterial(crMat2);

    {
      const specsA = [
        { geometry: crGeo1, position: [0, 0, 0], rotation: [0, 0, 0] },
        { geometry: crGeo1, position: [0, 0, 0], rotation: [0, 0, Math.PI / 2] },
      ];
      const specsB = [
        { geometry: crGeo2, position: [0, 0, 0], rotation: [0, 0, Math.PI / 4] },
        { geometry: crGeo2, position: [0, 0, 0], rotation: [0, 0, -Math.PI / 4] },
      ];
      const meshA = buildStaticGroup(specsA, crMat1, true);
      const meshB = buildStaticGroup(specsB, crMat2, true);
      if (meshA) crosshair.add(meshA);
      if (meshB) crosshair.add(meshB);
    }

    const irisMat = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 0.08, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    irisMat.userData.portalBaseOpacity = 0.08;
    registerFadeMaterial(irisMat);
    const iris = new THREE.Mesh(trackG(new THREE.CircleGeometry(0.49, 22)), irisMat);
    iris.rotation.x = Math.PI / 2;
    iris.position.z = -0.32;
    reactor.add(iris);

    const irisRingMat = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 0.48, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    irisRingMat.userData.portalBaseOpacity = 0.48;
    registerFadeMaterial(irisRingMat);
    const irisRing = new THREE.Mesh(trackG(new THREE.RingGeometry(0.49, 0.525, 22)), irisRingMat);
    irisRing.rotation.x = Math.PI / 2;
    irisRing.position.z = -0.26;
    reactor.add(irisRing);

    const inIrisMat = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 0.34, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    inIrisMat.userData.portalBaseOpacity = 0.34;
    registerFadeMaterial(inIrisMat);
    const innerIris = new THREE.Mesh(trackG(new THREE.RingGeometry(0.31, 0.34, 22)), inIrisMat);
    innerIris.rotation.x = Math.PI / 2;
    innerIris.position.z = -0.38;
    reactor.add(innerIris);

    // =======================================================
    // IRIS SHUTTERS
    // =======================================================
    const shutters = new THREE.Group();
    reactor.add(shutters);
    const shutGeo = trackG(new THREE.RingGeometry(0.38, 0.405, 16, 1, 0.12, 0.34));
    const shutMat = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 0.20, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    shutMat.userData.portalBaseOpacity = 0.48;
    registerFadeMaterial(shutMat);

    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(shutGeo, shutMat);
      mesh.rotation.x = Math.PI / 2;
      mesh.rotation.z = (i / 8) * Math.PI * 2;
      mesh.position.z = -0.20;
      shutters.add(mesh);
    }

    // =======================================================
    // MICRO CORE, GLOW & DEPTH
    // =======================================================
    const coreDotMat = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
    coreDotMat.userData.portalBaseOpacity = 1;
    registerFadeMaterial(coreDotMat);
    const coreDot = new THREE.Mesh(trackG(new THREE.CircleGeometry(0.085, 18)), coreDotMat);
    coreDot.rotation.x = Math.PI / 2;
    coreDot.position.z = -0.52;
    reactor.add(coreDot);

    const coreGlowMat = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 0.07, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    coreGlowMat.userData.portalBaseOpacity = 0.07;
    registerFadeMaterial(coreGlowMat);
    const coreGlow = new THREE.Mesh(trackG(new THREE.RingGeometry(0.10, 0.20, 22)), coreGlowMat);
    coreGlow.rotation.x = Math.PI / 2;
    coreGlow.position.z = -0.49;
    reactor.add(coreGlow);

    const reactDepthMat = trackM(MBM({ color: 0x000000, transparent: true, opacity: 0.58, side: THREE.DoubleSide, depthWrite: false }));
    reactDepthMat.userData.portalBaseOpacity = 0.58;
    registerFadeMaterial(reactDepthMat);

    const reactorDepth = new THREE.Mesh(trackG(new THREE.CircleGeometry(1.72, 22)), reactDepthMat);
    reactorDepth.rotation.x = Math.PI / 2;
    reactorDepth.position.z = -0.88;
    reactorDepth.renderOrder = -2;
    reactorDepth.matrixAutoUpdate = false;
    reactorDepth.updateMatrix();
    reactor.add(reactorDepth);

    // =======================================================
    // SHOCKWAVE (desktop only)
    // =======================================================
    const shockMaterial = trackM(MBM({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    const shock = new THREE.Mesh(trackG(new THREE.RingGeometry(0.05, 0.09, 22)), shockMaterial);
    shock.rotation.x = Math.PI / 2;
    portal.add(shock);

    let shockLife = 0;
    const handleClick = () => {
      shock.scale.setScalar(0.1);
      shockLife = 1;
      shockMaterial.opacity = 0.95;
    };
    if (!isMobile) window.addEventListener("click", handleClick);

    // =======================================================
    // MOUSE + SCROLL
    // =======================================================
    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / cachedInnerWidth - 0.5) * 2;
      mouseY = -((event.clientY / cachedInnerHeight - 0.5) * 2);
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    // =======================================================
    // SCROLL & FADE ENGINE
    // =======================================================
    let scrollCurrent = 0;
    let portalVisibility = 1;
    let portalFadeTarget = 1;

    const updatePortalFade = (scrollY) => {
      const y = Math.max(scrollY, 0);
      const fadeStart = scrollRef * 0.05;
      const fadeEnd = scrollRef * 0.85;

      const progress = THREE.MathUtils.clamp(
        (y - fadeStart) / (fadeEnd - fadeStart),
        0,
        1
      );

      portalFadeTarget = 1 - (progress * progress * (3 - 2 * progress));
    };

    const applyPortalFade = (visibility) => {
      const v = THREE.MathUtils.clamp(visibility, 0, 1);

      if (isMobile) {
        canvas.style.opacity = String(v);
        return;
      }

      for (const material of uniqueFadeMaterials) {
        material.opacity = material.userData.portalBaseOpacity * v;
      }

      for (let i = 0; i < rings.length; i++) {
        rings[i].mesh.material.opacity = rings[i].baseOpacity * v;
      }

      shockMaterial.opacity = shockLife * 0.85 * v;
    };

    const handleScroll = () => {
      updatePortalFade(window.scrollY || 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updatePortalFade(window.scrollY || 0);

    // =======================================================
    // LAYOUT APPLY
    // =======================================================
    const applyLayout = () => {
      cachedInnerWidth = vp.w;
      cachedInnerHeight = vp.h;
      scrollRef = vp.visibleH;

      if (isMobile) {
        canvas.style.setProperty("--portal-w", `${vp.w}px`);
        canvas.style.setProperty("--portal-h", `${vp.h}px`);
      }

      camera.aspect = cachedInnerWidth / cachedInnerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(getPixelRatio());
      renderer.setSize(cachedInnerWidth, cachedInnerHeight, false);
      layoutMobilePortal();
      updatePortalFade(window.scrollY || 0);
    };

    applyLayout();

    // =======================================================
    // RESIZE
    // =======================================================
    let resizeFrame = 0;
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const newWidth = window.innerWidth;

        if (isMobile && Math.abs(newWidth - lastWidth) < 8) {
          return;
        }

        lastWidth = newWidth;
        vp = measureViewport();
        applyLayout();
      });
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // =======================================================
    // ANIMATION CLOCK & TAB VISIBILITY
    // =======================================================
    const clock = new THREE.Clock();
    let pageVisible = !document.hidden;

    const handleVisibility = () => {
      pageVisible = !document.hidden;
      clock.getDelta();
      if (pageVisible) {
        updatePortalFade(window.scrollY || 0);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    let animationFrame;
    let time = 0;
    let blankDrawn = false;
    let lastAppliedV = -1;
    let slowFrames = 0;
    let emaDt = 1 / 60;

    // =======================================================
    // RENDER LOOP
    // =======================================================
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      if (!pageVisible) return;
      if (contextLost) return;

      const dt = Math.min(clock.getDelta(), 0.033);
      time += dt;

      // Smooth Fade
      const fadeDamp = 1 - Math.exp(-12 * dt);
      portalVisibility += (portalFadeTarget - portalVisibility) * fadeDamp;

      if (portalFadeTarget === 0 && portalVisibility < 0.005) {
        portalVisibility = 0;
      } else if (portalFadeTarget === 1 && portalVisibility > 0.995) {
        portalVisibility = 1;
      }

      if (portalVisibility !== lastAppliedV) {
        applyPortalFade(portalVisibility);
        lastAppliedV = portalVisibility;
      }

      // Portal fully faded: draw one blank frame, then stop using the GPU
      if (portalVisibility === 0 && portalFadeTarget === 0) {
        if (!blankDrawn) {
          renderer.render(scene, camera);
          blankDrawn = true;
        }
        return;
      }
      blankDrawn = false;

      // Mobile adaptive resolution
      if (isMobile) {
        emaDt += (dt - emaDt) * 0.05;
        if (emaDt > 0.0185 && mobilePR > 0.75) {
          if (++slowFrames > 40) {
            slowFrames = 0;
            mobilePR = Math.max(0.75, mobilePR - 0.25);
            renderer.setPixelRatio(mobilePR);
            renderer.setSize(cachedInnerWidth, cachedInnerHeight, false);
            emaDt = 1 / 60;
          }
        } else {
          slowFrames = 0;
        }
      }

      canvas.style.visibility = "visible";

      // =======================================================
      // SCROLL DEPTH & PORTAL DIVE (Desktop + Mobile)
      // =======================================================
      const currentScrollY = Math.max(window.scrollY || 0, 0);
      const maxScroll = 5.5;
      const targetScrollFactor = THREE.MathUtils.clamp(
        (currentScrollY / scrollRef) * maxScroll,
        0,
        maxScroll * 1.2
      );
      const scrollDamp = 1 - Math.exp(-9 * dt);
      scrollCurrent += (targetScrollFactor - scrollCurrent) * scrollDamp;

      if (!isMobile) {
        // Desktop Scroll Zoom
        const portalCameraZ = 9 - scrollCurrent * 1.15;
        camera.position.z +=
          (portalCameraZ - camera.position.z) * (1 - Math.exp(-9 * dt));

        // Desktop Mouse Parallax
        const mouseDamp = 1 - Math.exp(-8 * dt);
        smoothX += (mouseX - smoothX) * mouseDamp;
        smoothY += (mouseY - smoothY) * mouseDamp;

        portal.rotation.y += (smoothX * 0.44 - portal.rotation.y) * mouseDamp;
        portal.rotation.x += (smoothY * 0.29 - portal.rotation.x) * mouseDamp;
        portal.position.x += (smoothX * 0.44 - portal.position.x) * mouseDamp;
        portal.position.y += (smoothY * 0.34 - portal.position.y) * mouseDamp;
      } else {
        // Mobile Scroll Zoom (PC jaisa tunnel dive animation)
        const portalCameraZ = Math.max(MOBILE_CAM_Z - scrollCurrent * 1.15, 0.6);
        camera.position.z +=
          (portalCameraZ - camera.position.z) * (1 - Math.exp(-9 * dt));

        // Vertical drift compensation
        const t = (MOBILE_CAM_Z - camera.position.z) / MOBILE_CAM_Z;
        camera.position.y = portal.position.y * t;
      }

      // Mobile-only stars: slow depth drift
      if (mobileStars) {
        const starPos = mobileStarGeometry.attributes.position.array;
        const drift = mobileStars.userData.drift;

        for (let i = 0; i < drift.length; i++) {
          const idx = i * 3 + 2;
          let z = starPos[idx] + drift[i] * dt * 18;
          if (z > 4) z = -12;
          starPos[idx] = z;
        }

        mobileStarGeometry.attributes.position.needsUpdate = true;
        mobileStars.rotation.z = time * 0.0018;
        mobileStars.position.y = 0;
      }

      // Portal Rotations
      for (let i = 0; i < rings.length; i++) {
        rings[i].mesh.rotation.z += rings[i].speed * 0.6 * dt;
      }

      segmented.rotation.z = time * 0.045;
      segmented.rotation.x = 0.018;
      radial.rotation.z = -time * 0.018;

      for (let i = 0; i < innerRings.length; i++) {
        innerRings[i].rotation.z = time * (0.018 + i * 0.006) * (i % 2 === 0 ? 1 : -1);
      }
      for (let i = 0; i < reactorRings.length; i++) {
        reactorRings[i].mesh.rotation.z = time * reactorRings[i].speed;
      }

      reactorSpokes.rotation.z = -time * 0.020;
      reactorArmor.rotation.z = time * 0.030;
      lockRing.rotation.z = -time * 0.050;
      crosshair.rotation.z = time * 0.014;
      iris.rotation.z = time * 0.060;
      irisRing.rotation.z = -time * 0.085;
      innerIris.rotation.z = time * 0.11;
      shutters.rotation.z = -time * 0.075;

      // Core Pulses
      const corePulse = Math.sin(time * 2.8);
      iris.scale.setScalar(1 + Math.sin(time * 1.8) * 0.035);
      innerIris.scale.setScalar(1 + Math.sin(time * 2.2) * 0.025);
      coreDot.scale.setScalar(1 + corePulse * 0.12);
      coreGlow.scale.setScalar(1 + corePulse * 0.22);

      // Shockwave (desktop)
      if (shockLife > 0) {
        shockLife = Math.max(0, shockLife - 2.1 * dt);
        shock.scale.setScalar(0.15 + (1 - shockLife) * 4.8);
        shockMaterial.opacity = shockLife * 0.85 * portalVisibility;
      }

      renderer.render(scene, camera);
    };

    animate();

    // =======================================================
    // CLEANUP
    // =======================================================
    return () => {
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(resizeFrame);

      if (!isMobile) window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleClick);
      document.removeEventListener("visibilitychange", handleVisibility);
      canvas.removeEventListener("webglcontextlost", onCtxLost, false);
      canvas.removeEventListener("webglcontextrestored", onCtxRestored, false);

      disposeGeometries.forEach((g) => g.dispose());
      disposeMaterials.forEach((m) => m.dispose());
      renderer.dispose();

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  // =========================================================
  // SCROLL DOWN
  // =========================================================
  const scrollDown = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  // =========================================================
  // SPONSORS
  // =========================================================
  const sponsorLogos = ["/brand1.png", "/brand2.png", "/brand3.png", "/brand4.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setShowSponsors((prev) => !prev);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // UI
  // =========================================================
  return (
    <section className="hero-section relative z-0 h-screen min-h-screen w-full overflow-hidden text-white isolate">
      <style>{`
        /* @import rules must be first in a stylesheet or they are ignored */
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        html {
          scroll-behavior: auto;
          -webkit-text-size-adjust: 100%;
        }

        .hero-font {
          font-family: 'Inter', sans-serif;
          font-variant-numeric: tabular-nums;
        }

        .samurai-font,
        .samurai-display,
        .samurai-label,
        .hero-description,
        .hero-status {
          font-family: 'The Last Shuriken', sans-serif;
        }

        .samurai-display {
          font-weight: 700;
          letter-spacing: 0.025em;
          text-shadow:
            0 4px 0 rgba(0, 0, 0, 0.72),
            0 7px 18px rgba(0, 0, 0, 0.72),
            0 0 12px rgba(255, 255, 255, 0.10);
        }

        .samurai-label {
          letter-spacing: 0.22em;
          text-shadow:
            0 2px 7px rgba(0, 0, 0, 0.70),
            0 0 8px rgba(255, 255, 255, 0.08);
        }

        @keyframes synchronizedTicker {
          0% { transform: translate3d(-100%, 0, 0); }
          100% { transform: translate3d(100vw, 0, 0); }
        }

        .event-ticker,
        .sponsor-ticker {
          width: max-content;
          flex: 0 0 auto;
          animation: synchronizedTicker 18s linear infinite;
          will-change: transform;
          -webkit-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
        }

        .ticker-group {
          display: flex;
          flex: 0 0 100vw;
          min-width: 100vw;
          align-items: center;
          gap: 2.5rem;
          padding-left: 145px;
          padding-right: 40px;
          box-sizing: border-box;
        }

        .ticker-premium-text {
          position: relative;
          color: rgba(255, 255, 255, 0.72);
          text-shadow:
            0 1px 0 rgba(255, 255, 255, 0.16),
            0 0 5px rgba(255, 255, 255, 0.10),
            0 2px 4px rgba(0, 0, 0, 0.55);
        }

        .ticker-premium-symbol {
          color: rgba(255, 255, 255, 0.88);
          text-shadow:
            0 0 5px rgba(255, 255, 255, 0.35),
            0 2px 3px rgba(0, 0, 0, 0.65);
        }

        .event-ticker:hover,
        .sponsor-ticker:hover {
          animation-play-state: paused;
        }

        .sponsor-logo {
          height: 20px;
          width: auto;
          max-width: 80px;
          object-fit: contain;
          opacity: 0.65;
          filter: grayscale(1) contrast(1.08);
          transition: opacity 300ms ease, transform 300ms ease;
        }

        .sponsor-logo:hover {
          opacity: 1;
          transform: scale(1.05);
        }

        .ticker-switch {
          transition: opacity 450ms ease, transform 450ms ease;
        }

        .ticker-visible {
          opacity: 1;
          transform: translateY(0);
          visibility: visible;
        }

        .ticker-hidden {
          opacity: 0;
          transform: translateY(5px);
          pointer-events: none;
          visibility: hidden;
        }

        .neon-title-svg {
          display: block;
          width: min(92vw, 1000px);
          height: auto;
          overflow: visible;
          pointer-events: none;
        }

        .title-text { font-size: 60px; }

        @media (min-width: 640px) { .title-text { font-size: 72px; } }
        @media (min-width: 768px) { .title-text { font-size: 84px; } }
        @media (min-width: 1024px) { .title-text { font-size: 92px; } }

        .neon-title-base {
          fill: url(#titleFillGradient);
          stroke: none;
          paint-order: normal;
          filter: url(#premiumTitleShadow);
        }

        .neon-title-inner {
          fill: url(#titleInnerGradient);
          stroke: none;
          opacity: 0.34;
          pointer-events: none;
        }

        .neon-title-shine {
          fill: url(#titleShineGradient);
          stroke: none;
          paint-order: normal;
          pointer-events: none;
          opacity: 0.88;
        }

        .hero-description {
          margin-top: 28px;
          max-width: 680px;
          font-size: clamp(15px, 1.35vw, 19px);
          font-weight: 500;
          line-height: 1.9;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.72);
          text-shadow:
            0 3px 12px rgba(0, 0, 0, 0.90),
            0 0 10px rgba(0, 0, 0, 0.55);
        }

        .hero-description-main {
          color: rgba(255, 255, 255, 0.78);
        }

        .hero-tagline {
          margin-top: 4px;
          color: rgba(255, 255, 255, 0.68);
          letter-spacing: 0.14em;
        }

        .hero-tagline .word-one { color: rgba(255, 255, 255, 0.54); }
        .hero-tagline .word-two { color: rgba(255, 255, 255, 0.72); }
        .hero-tagline .word-three { color: rgba(255, 255, 255, 0.90); }

        .hero-status {
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 9px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(8, 8, 12, 0.75);
          padding: 9px 17px;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.65);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.20em;
          text-transform: uppercase;
          text-shadow: 0 2px 7px rgba(0, 0, 0, 0.8);
        }

        .hero-scroll-button {
          position: absolute !important;
          left: 50% !important;
          bottom: 28px !important;
          top: auto !important;
          transform: translateX(-50%) translateZ(0) !important;
          z-index: 1000 !important;
          pointer-events: auto;
          isolation: isolate;
          will-change: transform, opacity;
          transition: opacity 400ms ease, transform 300ms ease;
        }

        .hero-scroll-button:hover {
          transform: translateX(-50%) translateY(-4px) translateZ(0) !important;
        }

        /* =====================================================
           GLOBAL STARFIELD LAYER FIX
           ===================================================== */
        .hero-section ~ * {
          position: relative;
          z-index: 2 !important;
          isolation: isolate;
        }

        .hero-section ~ * * {
          position: relative;
          z-index: auto;
        }

        .hero-cyber-portal {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          min-width: 100vw;
          min-height: 100vh;
          min-height: 100dvh;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
          background: transparent;
        }

        .hero-cyber-portal-canvas {
          position: fixed !important;
          inset: 0 !important;
          display: block;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          min-width: 100vw !important;
          min-height: 100vh !important;
          min-height: 100dvh !important;
          z-index: 0 !important;
          pointer-events: none !important;
          contain: strict;
          -webkit-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        .hero-section {
          position: relative;
          z-index: 0 !important;
        }

        .hero-cyber-portal::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          opacity: 0.035;
          background: repeating-linear-gradient(to bottom, transparent 0, transparent 3px, rgba(255, 255, 255, 0.22) 4px);
        }

        .hero-cyber-portal::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 3;
          background: radial-gradient(circle at center, transparent 25%, rgba(0, 0, 0, 0.08) 52%, rgba(0, 0, 0, 0.42) 100%);
        }

        .hero-youtube-card {
          position: absolute;
          left: 22px;
          bottom: 22px;
          z-index: 900;
          width: 230px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 10px;
          background: rgba(6, 6, 10, 0.94);
          box-shadow:
            0 10px 35px rgba(0, 0, 0, 0.65),
            0 0 0 1px rgba(255, 255, 255, 0.035) inset,
            0 0 22px rgba(255, 255, 255, 0.045);
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          contain: content;
        }

        .hero-youtube-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 27px;
          padding: 0 9px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.055),
            rgba(255, 255, 255, 0.015)
          );
          font-family: 'The Last Shuriken', sans-serif;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.76);
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.75);
        }

        .hero-youtube-label::after {
          content: "";
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.78);
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.32);
          flex: 0 0 5px;
        }

        .hero-youtube-card iframe {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          height: auto;
          border: 0;
          contain: strict;
        }

        .hero-app-download {
          position: absolute;
          right: 22px;
          top: 164px;
          z-index: 900;
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 48px;
          padding: 6px 14px 6px 7px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          background: rgba(6, 6, 10, 0.85);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
          text-decoration: none;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          transition: transform 220ms ease, border-color 220ms ease, background 220ms ease;
        }

        .hero-app-download:hover {
          transform: translateY(-2px) translateZ(0);
          border-color: rgba(255, 255, 255, 0.35);
          background: rgba(12, 12, 18, 0.95);
        }

        .hero-app-logo {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: block;
          border-radius: 10px;
          object-fit: contain;
          object-position: center;
          padding: 2px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(255, 255, 255, 0.08);
          box-sizing: border-box;
        }

        .hero-app-copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.1;
        }

        .hero-app-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 7px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.48);
        }

        .hero-app-title {
          margin-top: 3px;
          font-family: 'The Last Shuriken', sans-serif;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.88);
        }

        @media (max-width: 768px) {
          .hero-section {
            min-height: 100svh;
            height: 100svh;
            background: #050505;
          }

          .hero-blur-glow { display: none; }

          .hero-section > .pointer-events-none.absolute.inset-0.opacity-\\[0\\.08\\] {
            opacity: 0.035;
          }
          .hero-cyber-portal::before { display: none; }

          .hero-cyber-portal-canvas {
            inset: 0 auto auto 0 !important;
            width: var(--portal-w, 100vw) !important;
            height: var(--portal-h, 100lvh) !important;
            min-width: 0 !important;
            min-height: 0 !important;
            max-width: none !important;
            z-index: 0 !important;
            contain: none;
            -webkit-transform: none;
            transform: none;
            backface-visibility: visible;
            will-change: opacity;
          }

          .neon-title-base {
            filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.9));
          }

          .neon-title-shine {
            display: none;
          }

          .hero-youtube-card {
            position: absolute;
            left: 10px;
            bottom: 16px;
            width: clamp(130px, 34vw, 155px);
            border-radius: 8px;
          }

          .hero-youtube-label {
            min-height: 23px;
            padding: 0 7px;
            font-size: 6.5px;
            letter-spacing: 0.13em;
          }

          .hero-app-download {
            position: absolute;
            right: 10px;
            top: 156px;
            min-height: 40px;
            gap: 8px;
            padding: 5px 10px 5px 6px;
          }

          .hero-app-logo {
            width: 34px;
            height: 34px;
            flex-basis: 34px;
            border-radius: 8px;
          }

          .hero-app-eyebrow {
            font-size: 6px;
          }

          .hero-app-title {
            font-size: 10px;
          }

          .hero-scroll-button {
            position: absolute !important;
            left: 50% !important;
            bottom: 18px !important;
            transform: translateX(-50%) translateZ(0) !important;
            z-index: 1000 !important;
          }

          .hero-scroll-button:hover {
            transform: translateX(-50%) translateY(-3px) translateZ(0) !important;
          }

          .sponsor-logo { height: 17px; max-width: 65px; }
          .event-ticker, .sponsor-ticker { animation-duration: 18s; }

          .ticker-group {
            flex: 0 0 auto;
            min-width: max-content;
            gap: 1.75rem;
            padding-left: 125px;
            padding-right: 30px;
          }

          .neon-title-svg { width: min(96vw, 760px); }
          .title-text { font-size: clamp(82px, 22vw, 118px); }

          .hero-description {
            max-width: 95vw;
            font-size: clamp(14px, 4.2vw, 17px);
            line-height: 1.65;
            letter-spacing: 0.055em;
          }

          .hero-tagline { font-size: clamp(13px, 3.8vw, 16px); letter-spacing: 0.09em; }

          .hero-status {
            margin-top: 20px;
            font-size: 9px;
            letter-spacing: 0.15em;
            padding: 8px 14px;
          }
        }

        @media (max-width: 390px) {
          .neon-title-svg { width: 98vw; }
          .title-text { font-size: clamp(74px, 22vw, 92px); }
          .hero-description { max-width: 96vw; font-size: 13.5px; line-height: 1.62; }
          .hero-tagline { font-size: 12.5px; }
          .hero-youtube-card { width: 125px; bottom: 14px; left: 8px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .event-ticker, .sponsor-ticker { animation: none; }
          .neon-title-shine { opacity: 0; }
        }
      `}</style>

      {/* THREE.JS BACKGROUND MOUNT ANCHOR */}
      <div id="hero-cyber-portal" className="hero-cyber-portal" aria-hidden="true" />

      {/* CINEMATIC ATMOSPHERE */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/22" />
      <div className="hero-blur-glow pointer-events-none absolute left-1/2 top-[48%] h-[520px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-[70px]" />
      <div className="hero-blur-glow pointer-events-none absolute left-1/2 top-[52%] h-[560px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/25 blur-[70px]" />

      {/* GRID */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:80px_80px]" />

      {/* TICKER */}
      <div className="hero-font absolute left-0 right-0 top-[112px] z-40 h-9 overflow-hidden border-y border-white/10 bg-black/20">
        <div
          className={`absolute left-0 top-0 z-30 flex h-full items-center border-r px-4 transition-all duration-500 ${
            showSponsors ? "border-white/15 bg-black/20" : "border-white/15 bg-black/25"
          }`}
        >
          <span
            className={`mr-2 h-1.5 w-1.5 rounded-full ${
              showSponsors ? "bg-white/70 shadow-[0_0_8px_rgba(255,255,255,.28)]" : "bg-white/75 shadow-[0_0_8px_rgba(255,255,255,.30)]"
            }`}
          />
          <span className="whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.22em] text-white/50">
            {showSponsors ? "Sponsors" : "Latest Event"}
          </span>
        </div>

        <div className={`ticker-switch absolute inset-0 flex items-center overflow-hidden ${showSponsors ? "ticker-hidden" : "ticker-visible"}`}>
          <div className="event-ticker">
            <div className="ticker-group">
              <span className="ticker-premium-text text-[9px] font-semibold uppercase tracking-[0.22em]">
                RAMPAGE REGISTRATIONS STARTING SOON
              </span>
              <span className="ticker-premium-symbol">◆</span>
              <span className="ticker-premium-text text-[9px] font-semibold uppercase tracking-[0.22em]">
                SPORTOMANIA REGISTRATIONS ARE NOW OPEN
              </span>
              <span className="ticker-premium-symbol">◆</span>
              <span className="ticker-premium-text text-[9px] font-semibold uppercase tracking-[0.22em]">
                BATTLE BLAZE IS COMING
              </span>
              <span className="ticker-premium-symbol">◆</span>
            </div>
          </div>
        </div>

        <div className={`ticker-switch absolute inset-0 flex items-center overflow-hidden ${showSponsors ? "ticker-visible" : "ticker-hidden"}`}>
          <div className="sponsor-ticker">
            <div className="ticker-group">
              {sponsorLogos.map((logo, index) => (
                <div key={`${logo}-${index}`} className="flex h-7 min-w-[80px] items-center justify-center px-2">
                  <img src={logo} alt={`Sponsor ${index + 1}`} className="sponsor-logo" decoding="async" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-16 bg-gradient-to-l from-black/25 to-transparent" />
      </div>

      {/* YOUTUBE VIDEO PREVIEW */}
      <div className="hero-youtube-card">
        <div className="hero-youtube-label">
          <span>Latest Updates</span>
        </div>
        <div className="relative aspect-video w-full overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/VIDEO_ID"
            title="NITS Esports YouTube Video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
          <img
            src={thumbnail}
            alt="Latest Video Thumbnail"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      {/* APP DOWNLOAD */}
      <a
        className="hero-app-download"
        href="#"
        target="_blank"
        rel="noreferrer"
        aria-label="Download our app on Google Play"
      >
        <img
          src={appLogo}
          alt="App logo"
          className="hero-app-logo"
          loading="lazy"
        />
        <span className="hero-app-copy">
          <span className="hero-app-eyebrow">Download our app</span>
          <span className="hero-app-title">Google Play</span>
        </span>
      </a>

      {/* HERO CONTENT */}
      <div className="hero-font relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="samurai-font mb-6 flex items-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/45" />
          <p className="samurai-label text-[10px] font-semibold uppercase tracking-[0.45em] text-white/70">
            NIT SILCHAR
          </p>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/45" />
        </div>

        <div className="relative inline-block">
          <svg className="neon-title-svg" viewBox="0 0 1000 120" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs>
              <linearGradient id="titleFillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="14%" stopColor="#f1f1f1" />
                <stop offset="30%" stopColor="#c8c8c8" />
                <stop offset="46%" stopColor="#7d7d7d" />
                <stop offset="60%" stopColor="#555555" />
                <stop offset="72%" stopColor="#8f8f8f" />
                <stop offset="86%" stopColor="#d9d9d9" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>

              <linearGradient id="titleInnerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="38%" stopColor="#dddddd" />
                <stop offset="58%" stopColor="#666666" />
                <stop offset="78%" stopColor="#bdbdbd" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>

              <linearGradient id="titleShineGradient" gradientUnits="userSpaceOnUse" x1="-260" y1="0" x2="-80" y2="0">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="38%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.92" />
                <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="1320 0" dur="3.8s" repeatCount="indefinite" />
              </linearGradient>

              <filter id="premiumTitleShadow" x="-30%" y="-30%" width="160%" height="180%">
                <feDropShadow dx="0" dy="7" stdDeviation="4" floodColor="#000000" floodOpacity="0.95" />
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#000000" floodOpacity="0.70" />
                <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#ffffff" floodOpacity="0.10" />
              </filter>
            </defs>

            <text x="50%" y="86" textAnchor="middle" fontFamily="The Last Shuriken, sans-serif" fontSize="92" fontWeight="700" letterSpacing="-4" className="title-text neon-title-base">
              NITS ESPORTS
            </text>
            <text x="50%" y="86" textAnchor="middle" fontFamily="The Last Shuriken, sans-serif" fontSize="92" fontWeight="700" letterSpacing="-4" className="title-text neon-title-inner">
              NITS ESPORTS
            </text>
            <text x="50%" y="86" textAnchor="middle" fontFamily="The Last Shuriken, sans-serif" fontSize="92" fontWeight="700" letterSpacing="-4" className="title-text neon-title-shine">
              NITS ESPORTS
            </text>
          </svg>
        </div>

        <div className="hero-description">
          <div className="hero-description-main">
            <strong />
          </div>
          <div className="hero-tagline">
            <span className="word-one">Compete.</span>{" "}
            <span className="word-two">Connect.</span>{" "}
            <span className="word-three">Conquer.</span>
          </div>
        </div>

        <div className="hero-status">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,.25)]" />
          </span>
          <span>Official Esports Club</span>
        </div>
      </div>

      {/* SCROLL DOWN */}
      <button onClick={scrollDown} className="hero-font hero-scroll-button group flex flex-col items-center">
        <span className="mb-3 text-[9px] font-medium uppercase tracking-[0.45em] text-white/60 transition-colors duration-300 group-hover:text-white/90">
          Scroll Down
        </span>
        <div className="relative flex h-12 w-8 items-start justify-center rounded-full border border-white/25 bg-black/80 pt-2 shadow-[0_0_20px_rgba(0,0,0,.65)] transition-all duration-300 group-hover:border-white/55 group-hover:bg-black/90 group-hover:shadow-[0_0_28px_rgba(255,255,255,.12)]">
          <span className="h-2 w-1 animate-bounce rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,.35)]" />
        </div>
        <div className="mt-2 h-px w-10 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-70" />
      </button>
    </section>
  );
};

export default Hero;