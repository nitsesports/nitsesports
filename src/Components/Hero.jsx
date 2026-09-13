import { useEffect, useState } from "react";
import * as THREE from "three";

const Hero = () => {
  const [showSponsors, setShowSponsors] = useState(false);

  // =========================================================
  // THREE.JS CYBER PORTAL BACKGROUND
  //
  // OPTIMIZED FOR 60 FPS — draw calls collapsed via geometry merging.
  // Visual design exactly preserved (same colors, opacity, positions).
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

    // =======================================================
    // GEOMETRY-MERGE HELPER (the core perf fix)
    //
    // Instead of creating dozens of individual THREE.Mesh /
    // THREE.Line objects that each cost a separate WebGL draw
    // call, we bake each instance's position+rotation into a
    // clone of its geometry's vertices and merge everything
    // that shares a material into ONE static geometry. Since
    // these ornamental parts never move independently (only
    // their parent group rotates as a whole), this is visually
    // identical but costs a fraction of the draw calls.
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
      return isLine
        ? new THREE.LineSegments(mergedGeo, material)
        : new THREE.Mesh(mergedGeo, material);
    };

    // =======================================================
    // SCENE & CAMERA
    // =======================================================
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.018);

    let cachedInnerWidth = window.innerWidth;
    let cachedInnerHeight = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(
      45,
      cachedInnerWidth / cachedInnerHeight,
      0.1,
      100
    );
    camera.position.z = 9;

    // =======================================================
    // RENDERER
    // =======================================================
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const getPixelRatio = () => isMobile ? Math.min(window.devicePixelRatio || 1, 1.0) : Math.min(window.devicePixelRatio || 1, 1.15);

    renderer.setPixelRatio(getPixelRatio());
    renderer.setSize(cachedInnerWidth, cachedInnerHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMappingExposure = 1.15;

    // =======================================================
    // PORTAL GROUP
    // =======================================================
    const portal = new THREE.Group();
    portal.position.set(0, 0, 0);
    portal.scale.setScalar(1.95);
    scene.add(portal);

    const uniqueFadeMaterials = new Set();
    const registerFadeMaterial = (material) => {
      if (material && material.userData && material.userData.portalBaseOpacity !== undefined) {
        uniqueFadeMaterials.add(material);
      }
    };

    // =======================================================
    // OUTER RINGS (kept individual — each needs its own speed)
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
      const material = trackM(new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: baseOpacity,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: i % 2 === 0 ? THREE.AdditiveBlending : THREE.NormalBlending,
      }));
      const geo = trackG(new THREE.RingGeometry(d[0], d[0] + d[1], 48));
      const mesh = new THREE.Mesh(geo, material);
      mesh.rotation.x = Math.PI / 2;
      portal.add(mesh);
      rings.push({ mesh, speed: d[3], baseOpacity });
    });

    // =======================================================
    // SEGMENTED MECHANICAL RING
    // 48 boxes -> merged into 2 draw calls (one per material)
    // =======================================================
    const segmented = new THREE.Group();
    portal.add(segmented);
    const segGeo = trackG(new THREE.BoxGeometry(0.26, 0.035, 0.025));
    const segMat1 = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0, depthWrite: false }));
    const segMat2 = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42, depthWrite: false }));
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
    // 36 lines -> merged into 2 draw calls
    // =======================================================
    const radial = new THREE.Group();
    portal.add(radial);
    const radGeo = trackG(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(1.45, 0, 0),
      new THREE.Vector3(3.2, 0, 0),
    ]));
    const radMat1 = trackM(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.62, blending: THREE.AdditiveBlending, depthWrite: false }));
    const radMat2 = trackM(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
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
    // INNER RINGS (kept individual — independent z + speed)
    // =======================================================
    const innerRings = [];
    for (let i = 0; i < 9; i++) {
      const r = 2.18 - i * 0.19;
      const baseOpacity = 0.58 - i * 0.025;
      const material = trackM(new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: baseOpacity, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      material.userData.portalBaseOpacity = baseOpacity;
      registerFadeMaterial(material);

      const mesh = new THREE.Mesh(trackG(new THREE.RingGeometry(r, r + 0.012, 48)), material);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.z = -i * 0.11;
      portal.add(mesh);
      innerRings.push(mesh);
    }

    // =======================================================
    // PREMIUM REACTOR CORE
    // =======================================================
    const reactor = new THREE.Group();
    reactor.position.z = -1.18;
    portal.add(reactor);

    const reactorRings = [];
    [
      [1.58, 0.014, 0.13], [1.46, 0.028, 0.22], [1.30, 0.010, 0.34], [1.14, 0.022, 0.20],
      [0.98, 0.012, 0.42], [0.82, 0.024, 0.24], [0.66, 0.014, 0.48], [0.52, 0.022, 0.34],
    ].forEach(([r, width, opacity], i) => {
      const material = trackM(new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      material.userData.portalBaseOpacity = opacity;
      registerFadeMaterial(material);

      const mesh = new THREE.Mesh(trackG(new THREE.RingGeometry(r, r + width, 48)), material);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.z = i * -0.032;
      reactor.add(mesh);
      reactorRings.push({ mesh, speed: (i % 2 ? -1 : 1) * (0.022 + i * 0.005) });
    });

    // =======================================================
    // REACTOR ARMOR
    // 24 boxes (4 geometry variants) -> merged into 2 draw calls
    // =======================================================
    const reactorArmor = new THREE.Group();
    reactor.add(reactorArmor);

    const armorGeos = [
      trackG(new THREE.BoxGeometry(0.19, 0.055, 0.028)), trackG(new THREE.BoxGeometry(0.19, 0.032, 0.028)),
      trackG(new THREE.BoxGeometry(0.11, 0.055, 0.028)), trackG(new THREE.BoxGeometry(0.11, 0.032, 0.028))
    ];
    const armMat1 = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.46, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    const armMat2 = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    armMat1.userData.portalBaseOpacity = 0.46;
    armMat2.userData.portalBaseOpacity = 0.16;
    registerFadeMaterial(armMat1); registerFadeMaterial(armMat2);

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
    // 20 boxes -> merged into 2 draw calls
    // =======================================================
    const lockRing = new THREE.Group();
    reactor.add(lockRing);
    const lockGeo = trackG(new THREE.BoxGeometry(0.16, 0.026, 0.022));
    const lockMat1 = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.58, blending: THREE.AdditiveBlending, depthWrite: false }));
    const lockMat2 = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false }));
    lockMat1.userData.portalBaseOpacity = 0.58; lockMat2.userData.portalBaseOpacity = 0.14;
    registerFadeMaterial(lockMat1); registerFadeMaterial(lockMat2);

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
    // 40 lines -> merged into 2 draw calls
    // =======================================================
    const reactorSpokes = new THREE.Group();
    reactor.add(reactorSpokes);
    const spokeGeo1 = trackG(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.56, 0, -0.04), new THREE.Vector3(1.10, 0, -0.04)]));
    const spokeGeo2 = trackG(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.70, 0, -0.04), new THREE.Vector3(1.25, 0, -0.04)]));
    const spokeMat1 = trackM(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.52, blending: THREE.AdditiveBlending, depthWrite: false }));
    const spokeMat2 = trackM(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.10, blending: THREE.AdditiveBlending, depthWrite: false }));
    spokeMat1.userData.portalBaseOpacity = 0.52; spokeMat2.userData.portalBaseOpacity = 0.10;
    registerFadeMaterial(spokeMat1); registerFadeMaterial(spokeMat2);

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
    // 4 lines -> merged into 2 draw calls
    // =======================================================
    const crosshair = new THREE.Group();
    reactor.add(crosshair);
    const crGeo1 = trackG(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.78, 0, -0.10), new THREE.Vector3(0.78, 0, -0.10)]));
    const crGeo2 = trackG(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.58, 0, -0.10), new THREE.Vector3(0.58, 0, -0.10)]));
    const crMat1 = trackM(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false }));
    const crMat2 = trackM(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false }));
    crMat1.userData.portalBaseOpacity = 0.13; crMat2.userData.portalBaseOpacity = 0.08;
    registerFadeMaterial(crMat1); registerFadeMaterial(crMat2);

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

    const irisMat = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    irisMat.userData.portalBaseOpacity = 0.08; registerFadeMaterial(irisMat);
    const iris = new THREE.Mesh(trackG(new THREE.CircleGeometry(0.49, 48)), irisMat);
    iris.rotation.x = Math.PI / 2; iris.position.z = -0.32; reactor.add(iris);

    const irisRingMat = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.48, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    irisRingMat.userData.portalBaseOpacity = 0.48; registerFadeMaterial(irisRingMat);
    const irisRing = new THREE.Mesh(trackG(new THREE.RingGeometry(0.49, 0.525, 48)), irisRingMat);
    irisRing.rotation.x = Math.PI / 2; irisRing.position.z = -0.26; reactor.add(irisRing);

    const inIrisMat = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.34, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    inIrisMat.userData.portalBaseOpacity = 0.34; registerFadeMaterial(inIrisMat);
    const innerIris = new THREE.Mesh(trackG(new THREE.RingGeometry(0.31, 0.34, 48)), inIrisMat);
    innerIris.rotation.x = Math.PI / 2; innerIris.position.z = -0.38; reactor.add(innerIris);

    // =======================================================
    // IRIS SHUTTERS
    // =======================================================
    const shutters = new THREE.Group();
    reactor.add(shutters);
    const shutGeo = trackG(new THREE.RingGeometry(0.38, 0.405, 24, 1, 0.12, 0.34));
    const shutMat = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.20, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    shutMat.userData.portalBaseOpacity = 0.48; registerFadeMaterial(shutMat);

    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(shutGeo, shutMat);
      mesh.rotation.x = Math.PI / 2; mesh.rotation.z = (i / 8) * Math.PI * 2; mesh.position.z = -0.20;
      shutters.add(mesh);
    }

    // =======================================================
    // MICRO CORE & GLOW
    // =======================================================
    const coreDotMat = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
    coreDotMat.userData.portalBaseOpacity = 1; registerFadeMaterial(coreDotMat);
    const coreDot = new THREE.Mesh(trackG(new THREE.CircleGeometry(0.085, 40)), coreDotMat);
    coreDot.rotation.x = Math.PI / 2; coreDot.position.z = -0.52; reactor.add(coreDot);

    const coreGlowMat = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    coreGlowMat.userData.portalBaseOpacity = 0.07; registerFadeMaterial(coreGlowMat);
    const coreGlow = new THREE.Mesh(trackG(new THREE.RingGeometry(0.10, 0.20, 48)), coreGlowMat);
    coreGlow.rotation.x = Math.PI / 2; coreGlow.position.z = -0.49; reactor.add(coreGlow);

    const reactDepthMat = trackM(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.58, side: THREE.DoubleSide, depthWrite: false }));
    const reactorDepth = new THREE.Mesh(trackG(new THREE.CircleGeometry(1.72, 48)), reactDepthMat);
    reactorDepth.rotation.x = Math.PI / 2; reactorDepth.position.z = -0.88; reactorDepth.renderOrder = -2; reactor.add(reactorDepth);

    // =======================================================
    // SHOCKWAVE
    // =======================================================
    const shockMaterial = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    const shock = new THREE.Mesh(trackG(new THREE.RingGeometry(0.05, 0.09, 48)), shockMaterial);
    shock.rotation.x = Math.PI / 2;
    portal.add(shock);

    let shockLife = 0;
    const handleClick = () => {
      shock.scale.setScalar(0.1);
      shockLife = 1;
      shockMaterial.opacity = 0.95;
    };
    window.addEventListener("click", handleClick);

    // =======================================================
    // PARTICLE TUNNEL
    // =======================================================
    const particleCount = isMobile ? 360 : 600;
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0, index = 0; i < particleCount; i++, index += 3) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.2 + Math.pow(Math.random(), 0.52) * 11.5;
      positions[index] = Math.cos(a) * r;
      positions[index + 1] = Math.sin(a) * r;
      positions[index + 2] = -10 + Math.random() * 12;
      particleSpeeds[i] = 0.008 + Math.random() * 0.035;
    }

    const particleGeometry = trackG(new THREE.BufferGeometry());
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particlePositionAttribute = particleGeometry.attributes.position;

    const particlesMaterial = trackM(new THREE.PointsMaterial({
      color: 0xffffff, size: 0.055, transparent: true, opacity: 0.92, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    const particles = new THREE.Points(particleGeometry, particlesMaterial);
    scene.add(particles);

    // =======================================================
    // MOUSE / CURSOR
    // =======================================================
    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;
    let pendingMouseX = 0;
    let pendingMouseY = 0;

    const handleMouseMove = (event) => {
      pendingMouseX = (event.clientX / cachedInnerWidth - 0.5) * 2;
      pendingMouseY = -((event.clientY / cachedInnerHeight - 0.5) * 2);
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    // =======================================================
    // SCROLL — throttled to one update per animation frame so
    // rapid scroll events (esp. on mobile) never pile up work.
    // =======================================================
    let scrollTarget = 0;
    let scrollCurrent = 0;
    let lastScroll = window.scrollY;
    let pendingScrollY = window.scrollY;
    let portalVisibility = 1;
    let portalFadeTarget = 1;

    const updatePortalFade = () => {
      const y = Math.max(window.scrollY || 0, 0);
      const fadeStart = cachedInnerHeight * 0.05;
      const fadeEnd = cachedInnerHeight * 1.0;
      const progress = THREE.MathUtils.clamp((y - fadeStart) / (fadeEnd - fadeStart), 0, 1);
      portalFadeTarget = 1 - Math.pow(progress, 0.85);
    };

    const applyPortalFade = (visibility) => {
      const v = THREE.MathUtils.clamp(visibility, 0, 1);
      for (const material of uniqueFadeMaterials) {
        material.opacity = material.userData.portalBaseOpacity * v;
      }
      for (let i = 0; i < rings.length; i++) {
        rings[i].mesh.material.opacity = rings[i].baseOpacity * v;
      }
      shockMaterial.opacity = shockLife * 0.85 * v;
    };

    const handleScroll = () => {
      // Do not schedule another RAF from the scroll handler.
      // The main render loop samples this latest value exactly once/frame.
      pendingScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updatePortalFade();

    // =======================================================
    // RESIZE
    // =======================================================
    let resizeFrame = 0;
    const handleResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        cachedInnerWidth = window.innerWidth;
        cachedInnerHeight = window.innerHeight;
        camera.aspect = cachedInnerWidth / cachedInnerHeight;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(getPixelRatio());
        renderer.setSize(cachedInnerWidth, cachedInnerHeight, false);
        updatePortalFade();
      });
    };
    window.addEventListener("resize", handleResize, { passive: true });
    handleResize();

    // =======================================================
    // ANIMATION CLOCK
    // =======================================================
    const clock = new THREE.Clock();
    let pageVisible = !document.hidden;
    const handleVisibility = () => {
      pageVisible = !document.hidden;
      clock.getDelta();
      if (pageVisible) {
        pendingScrollY = lastScroll = window.scrollY;
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    let animationFrame;
    let time = 0;

    // =======================================================
    // RENDER LOOP
    // =======================================================
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      if (!pageVisible) return;

      const dt = Math.min(clock.getDelta(), 0.033);
      time += dt;

      const d10 = 1 - Math.exp(-10 * dt);
      const d10_5 = 1 - Math.exp(-10.5 * dt);
      const d8 = 1 - Math.exp(-8 * dt);
      const d7 = 1 - Math.exp(-7 * dt);
      const d7_5 = 1 - Math.exp(-7.5 * dt);

      // Consume the latest mouse/scroll state once per rendered frame.
      mouseX += (pendingMouseX - mouseX) * d10_5;
      mouseY += (pendingMouseY - mouseY) * d10_5;

      const currentScroll = pendingScrollY;
      const scrollDelta = currentScroll - lastScroll;
      if (scrollDelta !== 0) {
        scrollTarget = THREE.MathUtils.clamp(
          scrollTarget + scrollDelta * 0.02,
          -3.5,
          9
        );
        lastScroll = currentScroll;
        updatePortalFade();
      }

      const previousVisibility = portalVisibility;
      portalVisibility += (portalFadeTarget - portalVisibility) * d10;
      if (portalFadeTarget === 0 && portalVisibility < 0.006) {
        portalVisibility = 0;
      }
      if (Math.abs(portalVisibility - previousVisibility) > 0.0008) {
        applyPortalFade(portalVisibility);
      }

      smoothX += (mouseX - smoothX) * d10_5;
      smoothY += (mouseY - smoothY) * d10_5;

      const targetRotY = smoothX * 0.44;
      const targetRotX = smoothY * 0.29;
      const targetPosX = smoothX * 0.44;
      const targetPosY = smoothY * 0.34;

      portal.rotation.y += (targetRotY - portal.rotation.y) * d8;
      portal.rotation.x += (targetRotX - portal.rotation.x) * d8;
      portal.position.x += (targetPosX - portal.position.x) * d7;
      portal.position.y += (targetPosY - portal.position.y) * d7;

      scrollCurrent += (scrollTarget - scrollCurrent) * d7;
      const targetCameraZ = 9 - scrollCurrent * 1.35;
      camera.position.z +=
        (targetCameraZ - camera.position.z) * d7_5;

      for (let i = 0; i < rings.length; i++) {
        rings[i].mesh.rotation.z += rings[i].speed * 0.01;
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

      const irisPulse = Math.sin(time * 1.8);
      const innerIrisPulse = Math.sin(time * 2.2);
      const corePulse = Math.sin(time * 2.8);

      iris.scale.setScalar(1 + irisPulse * 0.035);
      innerIris.scale.setScalar(1 + innerIrisPulse * 0.025);
      coreDot.scale.setScalar(1 + corePulse * 0.12);
      coreGlow.scale.setScalar(1 + corePulse * 0.22);

      for (let i = 0, index = 0; i < particleCount; i++, index += 3) {
        let z = positions[index + 2] + particleSpeeds[i];
        if (z > 3) z = -10;
        positions[index + 2] = z;
      }

      particles.rotation.z = time * 0.025;
      particlePositionAttribute.needsUpdate = true;

      if (shockLife > 0) {
        shockLife = Math.max(0, shockLife - 0.035);
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
    <section className="hero-section relative z-10 h-screen min-h-screen w-full overflow-hidden text-white isolate">
      <style>{`
        html {
          scroll-behavior: auto;
        }

        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

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
            0 0 14px rgba(255, 255, 255, 0.07);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.55));
        }

        .ticker-premium-symbol {
          color: rgba(255, 255, 255, 0.88);
          text-shadow:
            0 0 5px rgba(255, 255, 255, 0.35),
            0 0 12px rgba(255, 255, 255, 0.14);
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.65));
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
          filter: grayscale(1) contrast(1.08) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.55));
          transition: opacity 300ms ease, transform 300ms ease, filter 300ms ease;
        }

        .sponsor-logo:hover {
          opacity: 1;
          transform: scale(1.05);
          filter: grayscale(1) contrast(1.15) drop-shadow(0 3px 7px rgba(255, 255, 255, 0.14));
        }

        .ticker-switch {
          transition: opacity 450ms ease, transform 450ms ease;
        }

        .ticker-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .ticker-hidden {
          opacity: 0;
          transform: translateY(5px);
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

        .neon-title-border { display: none; }

        .neon-title-shine {
          fill: url(#titleShineGradient);
          stroke: none;
          paint-order: normal;
          pointer-events: none;
          opacity: 0.88;
          mix-blend-mode: screen;
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.20)) drop-shadow(0 0 11px rgba(255, 255, 255, 0.08));
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

        .hero-description-main strong {
          color: #ffffff;
          font-weight: 600;
          text-shadow:
            0 2px 8px rgba(0, 0, 0, 0.95),
            0 0 8px rgba(255, 255, 255, 0.08);
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
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(0, 0, 0, 0.34);
          padding: 9px 17px;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(6px);
          color: rgba(255, 255, 255, 0.52);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.20em;
          text-transform: uppercase;
          text-shadow: 0 2px 7px rgba(0, 0, 0, 0.8);
        }

        .hero-scroll-button {
          position: fixed !important;
          left: 50% !important;
          bottom: 28px !important;
          top: auto !important;
          transform: translateX(-50%) !important;
          z-index: 1000 !important;
          pointer-events: auto;
          isolation: isolate;
          transition: opacity 400ms ease, transform 300ms ease;
        }

        .hero-scroll-button:hover {
          transform: translateX(-50%) translateY(-4px) !important;
        }

        .hero-cyber-portal {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          min-width: 100vw;
          min-height: 100vh;
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
          min-width: 100vw !important;
          min-height: 100vh !important;
          z-index: 0 !important;
          pointer-events: none !important;
          contain: strict;
          transform: translateZ(0);
        }

        .hero-cyber-portal::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          opacity: 0.035;
          background: repeating-linear-gradient(to bottom, transparent 0, transparent 3px, rgba(255, 255, 255, 0.22) 4px);
          mix-blend-mode: screen;
        }

        .hero-cyber-portal::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 3;
          background: radial-gradient(circle at center, transparent 25%, rgba(0, 0, 0, 0.08) 52%, rgba(0, 0, 0, 0.42) 100%);
        }

        .hero-section {
          position: relative;
          isolation: isolate;
          overflow: hidden;
        }

        @media (max-width: 640px) {
          .hero-scroll-button {
            left: 50% !important;
            bottom: 22px !important;
            transform: translateX(-50%) !important;
            z-index: 1000 !important;
          }

          .hero-scroll-button:hover {
            transform: translateX(-50%) translateY(-4px) !important;
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

          .neon-title-svg { width: min(98vw, 760px); }
          .title-text { font-size: clamp(86px, 22vw, 124px); }

          .hero-description {
            max-width: 95vw;
            font-size: clamp(15px, 4.4vw, 18px);
            line-height: 1.72;
            letter-spacing: 0.055em;
          }

          .hero-tagline { font-size: clamp(14px, 4vw, 17px); letter-spacing: 0.09em; }

          .hero-status {
            margin-top: 22px;
            font-size: 9px;
            letter-spacing: 0.15em;
            padding: 9px 14px;
          }
        }

        @media (max-width: 390px) {
          .neon-title-svg { width: 98vw; }
          .title-text { font-size: clamp(78px, 22.5vw, 98px); }
          .hero-description { max-width: 96vw; font-size: 14.5px; line-height: 1.68; }
          .hero-tagline { font-size: 13px; }
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
      <div className="pointer-events-none absolute left-1/2 top-[48%] h-[520px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-[90px]" />
      <div className="pointer-events-none absolute left-1/2 top-[52%] h-[560px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/25 blur-[90px]" />

      {/* GRID */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:80px_80px]" />

      {/* TICKER */}
      <div className="hero-font absolute left-0 right-0 top-[112px] z-40 h-9 overflow-hidden border-y border-white/10 bg-black/20 backdrop-blur-[2px]">
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

        <div className={`ticker-switch absolute inset-0 flex items-center overflow-hidden ${showSponsors ? "ticker-hidden pointer-events-none" : "ticker-visible"}`}>
          <div className="event-ticker">
            <div className="ticker-group">
              <span className="ticker-premium-text text-[9px] font-semibold uppercase tracking-[0.22em]">
                NITS ESPORTS CHAMPIONSHIP 2026
              </span>
              <span className="ticker-premium-symbol">◆</span>
              <span className="ticker-premium-text text-[9px] font-semibold uppercase tracking-[0.22em]">
                REGISTRATIONS ARE NOW OPEN
              </span>
              <span className="ticker-premium-symbol">◆</span>
              <span className="ticker-premium-text text-[9px] font-semibold uppercase tracking-[0.22em]">
                BATTLE FOR THE CROWN
              </span>
              <span className="ticker-premium-symbol">◆</span>
            </div>
          </div>
        </div>

        <div className={`ticker-switch absolute inset-0 flex items-center overflow-hidden ${showSponsors ? "ticker-visible" : "ticker-hidden pointer-events-none"}`}>
          <div className="sponsor-ticker">
            <div className="ticker-group">
              {sponsorLogos.map((logo, index) => (
                <div key={`${logo}-${index}`} className="flex h-7 min-w-[80px] items-center justify-center px-2">
                  <img src={logo} alt={`Sponsor ${index + 1}`} className="sponsor-logo" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-16 bg-gradient-to-l from-black/25 to-transparent" />
      </div>

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
        <div className="relative flex h-12 w-8 items-start justify-center rounded-full border border-white/25 bg-black/60 pt-2 shadow-[0_0_20px_rgba(0,0,0,.65)] backdrop-blur-sm transition-all duration-300 group-hover:border-white/55 group-hover:bg-black/75 group-hover:shadow-[0_0_28px_rgba(255,255,255,.12)]">
          <span className="h-2 w-1 animate-bounce rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,.35)]" />
        </div>
        <div className="mt-2 h-px w-10 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-70" />
      </button>
    </section>
  );
};

export default Hero;