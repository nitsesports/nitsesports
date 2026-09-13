
import { useEffect, useState } from "react";
import * as THREE from "three";

const Hero = () => {
  const [showSponsors, setShowSponsors] = useState(false);

  // =========================================================
  // THREE.JS CYBER PORTAL BACKGROUND
  //
  // PERFORMANCE OPTIMIZED
  // Visual design intentionally preserved.
  // =========================================================

  useEffect(() => {
    const container = document.getElementById("hero-cyber-portal");
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.className = "hero-cyber-portal-canvas";
    document.body.appendChild(canvas);

    // =======================================================
    // SCENE
    // =======================================================

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.018);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
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
      powerPreference: "high-performance",
    });

    // MOBILE-ONLY GPU optimization.
    // Desktop rendering is kept exactly as before.
    const isMobile =
      window.matchMedia("(max-width: 767px)").matches;

    const getPixelRatio = () =>
      isMobile
        ? Math.min(window.devicePixelRatio || 1, 1.0)
        : Math.min(window.devicePixelRatio || 1, 1.15);

    renderer.setPixelRatio(getPixelRatio());
    renderer.setSize(
      window.innerWidth,
      window.innerHeight,
      false
    );

    renderer.setClearColor(0x000000, 0);
    renderer.toneMappingExposure = 1.15;

    // =======================================================
    // PORTAL GROUP
    // =======================================================

    const portal = new THREE.Group();

    portal.position.set(0, 0, 0);
    portal.scale.setScalar(1.95);

    scene.add(portal);

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

      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: baseOpacity,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending:
          i % 2 === 0
            ? THREE.AdditiveBlending
            : THREE.NormalBlending,
      });

      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(
          d[0],
          d[0] + d[1],
          64
        ),
        material
      );

      mesh.rotation.x = Math.PI / 2;

      portal.add(mesh);

      rings.push({
        mesh,
        speed: d[3],
        baseOpacity,
      });
    });

    // =======================================================
    // SEGMENTED MECHANICAL RING
    // =======================================================

    const segmented = new THREE.Group();
    portal.add(segmented);

    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const r = 2.72;

      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: i % 3 === 0 ? 1.0 : 0.42,
        depthWrite: false,
      });

      material.userData.portalBaseOpacity =
        material.opacity;

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.26,
          0.035,
          0.025
        ),
        material
      );

      mesh.position.set(
        Math.cos(a) * r,
        Math.sin(a) * r,
        0
      );

      mesh.rotation.z = a;

      segmented.add(mesh);
    }

    // =======================================================
    // RADIAL ENERGY WIRES
    // =======================================================

    const radial = new THREE.Group();
    portal.add(radial);

    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;

      const geometry =
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(
            Math.cos(a) * 1.45,
            Math.sin(a) * 1.45,
            0
          ),
          new THREE.Vector3(
            Math.cos(a) * 3.2,
            Math.sin(a) * 3.2,
            0
          ),
        ]);

      const material =
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity:
            i % 4 === 0 ? 0.62 : 0.16,
          blending:
            THREE.AdditiveBlending,
          depthWrite: false,
        });

      material.userData.portalBaseOpacity =
        material.opacity;

      radial.add(
        new THREE.Line(
          geometry,
          material
        )
      );
    }

    // =======================================================
    // INNER RINGS
    // =======================================================

    const innerRings = [];

    for (let i = 0; i < 9; i++) {
      const r = 2.18 - i * 0.19;
      const baseOpacity =
        0.58 - i * 0.025;

      const material =
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: baseOpacity,
          side: THREE.DoubleSide,
          blending:
            THREE.AdditiveBlending,
          depthWrite: false,
        });

      material.userData.portalBaseOpacity =
        baseOpacity;

      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(
          r,
          r + 0.012,
          48
        ),
        material
      );

      mesh.rotation.x = Math.PI / 2;
      mesh.position.z = -i * 0.11;

      portal.add(mesh);

      innerRings.push(mesh);
    }

    // =======================================================
    // OLD FLAT CORE — DISABLED
    // =======================================================

    const coreMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
      });

    const core = new THREE.Mesh(
      new THREE.CircleGeometry(
        1.25,
        48
      ),
      coreMaterial
    );

    core.position.z = -1.1;
    core.visible = false;

    portal.add(core);

    // =======================================================
    // PREMIUM REACTOR CORE
    // =======================================================

    const reactor = new THREE.Group();

    reactor.position.z = -1.18;

    portal.add(reactor);

    const reactorRings = [];

    [
      [1.58, 0.014, 0.13],
      [1.46, 0.028, 0.22],
      [1.30, 0.010, 0.34],
      [1.14, 0.022, 0.20],
      [0.98, 0.012, 0.42],
      [0.82, 0.024, 0.24],
      [0.66, 0.014, 0.48],
      [0.52, 0.022, 0.34],
    ].forEach(
      ([r, width, opacity], i) => {
        const material =
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity,
            side: THREE.DoubleSide,
            blending:
              THREE.AdditiveBlending,
            depthWrite: false,
          });

        material.userData.portalBaseOpacity =
          opacity;

        const mesh = new THREE.Mesh(
          new THREE.RingGeometry(
            r,
            r + width,
            48
          ),
          material
        );

        mesh.rotation.x =
          Math.PI / 2;

        mesh.position.z =
          i * -0.032;

        reactor.add(mesh);

        reactorRings.push({
          mesh,
          speed:
            (i % 2 ? -1 : 1) *
            (0.022 + i * 0.005),
        });
      }
    );

    // =======================================================
    // REACTOR ARMOR
    // =======================================================

    const reactorArmor =
      new THREE.Group();

    reactor.add(reactorArmor);

    for (let i = 0; i < 24; i++) {
      const a =
        (i / 24) * Math.PI * 2;

      const r = 1.38;

      const w =
        i % 2 === 0
          ? 0.19
          : 0.11;

      const h =
        i % 3 === 0
          ? 0.055
          : 0.032;

      const material =
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity:
            i % 4 === 0
              ? 0.46
              : 0.16,
          side: THREE.DoubleSide,
          blending:
            THREE.AdditiveBlending,
          depthWrite: false,
        });

      material.userData.portalBaseOpacity =
        material.opacity;

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          w,
          h,
          0.028
        ),
        material
      );

      mesh.position.set(
        Math.cos(a) * r,
        Math.sin(a) * r,
        0.02
      );

      mesh.rotation.z =
        a + Math.PI / 2;

      reactorArmor.add(mesh);
    }

    // =======================================================
    // INNER LOCK RING
    // =======================================================

    const lockRing =
      new THREE.Group();

    reactor.add(lockRing);

    for (let i = 0; i < 20; i++) {
      const a =
        (i / 20) *
        Math.PI *
        2;

      const material =
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity:
            i % 5 === 0
              ? 0.58
              : 0.14,
          blending:
            THREE.AdditiveBlending,
          depthWrite: false,
        });

      material.userData.portalBaseOpacity =
        material.opacity;

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.16,
          0.026,
          0.022
        ),
        material
      );

      mesh.position.set(
        Math.cos(a) * 0.91,
        Math.sin(a) * 0.91,
        0.035
      );

      mesh.rotation.z = a;

      lockRing.add(mesh);
    }

    // =======================================================
    // REACTOR SPOKES
    // =======================================================

    const reactorSpokes =
      new THREE.Group();

    reactor.add(reactorSpokes);

    for (let i = 0; i < 40; i++) {
      const a =
        (i / 40) *
        Math.PI *
        2;

      const inner =
        i % 2 === 0
          ? 0.56
          : 0.70;

      const outer =
        i % 2 === 0
          ? 1.10
          : 1.25;

      const geometry =
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(
            Math.cos(a) * inner,
            Math.sin(a) * inner,
            -0.04
          ),
          new THREE.Vector3(
            Math.cos(a) * outer,
            Math.sin(a) * outer,
            -0.04
          ),
        ]);

      const material =
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity:
            i % 5 === 0
              ? 0.52
              : 0.10,
          blending:
            THREE.AdditiveBlending,
          depthWrite: false,
        });

      material.userData.portalBaseOpacity =
        material.opacity;

      reactorSpokes.add(
        new THREE.Line(
          geometry,
          material
        )
      );
    }

    // =======================================================
    // CROSSHAIR ENERGY CHANNELS
    // =======================================================

    const crosshair =
      new THREE.Group();

    reactor.add(crosshair);

    [
      0,
      Math.PI / 2,
      Math.PI / 4,
      -Math.PI / 4,
    ].forEach((a, i) => {
      const length =
        i < 2 ? 0.78 : 0.58;

      const geometry =
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(
            -Math.cos(a) * length,
            -Math.sin(a) * length,
            -0.10
          ),
          new THREE.Vector3(
            Math.cos(a) * length,
            Math.sin(a) * length,
            -0.10
          ),
        ]);

      const material =
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity:
            i < 2
              ? 0.13
              : 0.08,
          blending:
            THREE.AdditiveBlending,
          depthWrite: false,
        });

      material.userData.portalBaseOpacity =
        material.opacity;

      crosshair.add(
        new THREE.Line(
          geometry,
          material
        )
      );
    });

    // =======================================================
    // CENTRAL IRIS
    // =======================================================

    const irisMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
      });

    irisMaterial.userData.portalBaseOpacity =
      0.08;

    const iris = new THREE.Mesh(
      new THREE.CircleGeometry(
        0.49,
        48
      ),
      irisMaterial
    );

    iris.rotation.x =
      Math.PI / 2;

    iris.position.z = -0.32;

    reactor.add(iris);

    // =======================================================
    // IRIS RING
    // =======================================================

    const irisRingMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.48,
        side: THREE.DoubleSide,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
      });

    irisRingMaterial.userData.portalBaseOpacity =
      0.48;

    const irisRing = new THREE.Mesh(
      new THREE.RingGeometry(
        0.49,
        0.525,
        48
      ),
      irisRingMaterial
    );

    irisRing.rotation.x =
      Math.PI / 2;

    irisRing.position.z = -0.26;

    reactor.add(irisRing);

    // =======================================================
    // INNER IRIS
    // =======================================================

    const innerIrisMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
      });

    innerIrisMaterial.userData.portalBaseOpacity =
      0.34;

    const innerIris = new THREE.Mesh(
      new THREE.RingGeometry(
        0.31,
        0.34,
        56
      ),
      innerIrisMaterial
    );

    innerIris.rotation.x =
      Math.PI / 2;

    innerIris.position.z = -0.38;

    reactor.add(innerIris);

    // =======================================================
    // IRIS SHUTTERS
    // =======================================================

    const shutters =
      new THREE.Group();

    reactor.add(shutters);

    for (let i = 0; i < 8; i++) {
      const a =
        (i / 8) *
        Math.PI *
        2;

      const material =
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.20,
          side: THREE.DoubleSide,
          blending:
            THREE.AdditiveBlending,
          depthWrite: false,
        });

      material.userData.portalBaseOpacity =
        0.48;

      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(
          0.38,
          0.405,
          24,
          1,
          0.12,
          0.34
        ),
        material
      );

      mesh.rotation.x =
        Math.PI / 2;

      mesh.rotation.z = a;

      mesh.position.z = -0.20;

      shutters.add(mesh);
    }

    // =======================================================
    // MICRO CORE
    // =======================================================

    const coreDotMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.72,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
      });

    coreDotMaterial.userData.portalBaseOpacity =
      1;

    const coreDot = new THREE.Mesh(
      new THREE.CircleGeometry(
        0.085,
        40
      ),
      coreDotMaterial
    );

    coreDot.rotation.x =
      Math.PI / 2;

    coreDot.position.z = -0.52;

    reactor.add(coreDot);

    // =======================================================
    // CORE GLOW
    // =======================================================

    const coreGlowMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
      });

    coreGlowMaterial.userData.portalBaseOpacity =
      0.07;

    const coreGlow = new THREE.Mesh(
      new THREE.RingGeometry(
        0.10,
        0.20,
        48
      ),
      coreGlowMaterial
    );

    coreGlow.rotation.x =
      Math.PI / 2;

    coreGlow.position.z = -0.49;

    reactor.add(coreGlow);

    // =======================================================
    // DEEP OCCLUSION LAYER
    // =======================================================

    const reactorDepthMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.58,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

    const reactorDepth = new THREE.Mesh(
      new THREE.CircleGeometry(
        1.72,
        48
      ),
      reactorDepthMaterial
    );

    reactorDepth.rotation.x =
      Math.PI / 2;

    reactorDepth.position.z =
      -0.88;

    reactorDepth.renderOrder = -2;

    reactor.add(reactorDepth);

    // =======================================================
    // SHOCKWAVE
    // =======================================================

    const shockMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
      });

    const shock = new THREE.Mesh(
      new THREE.RingGeometry(
        0.05,
        0.09,
        64
      ),
      shockMaterial
    );

    shock.rotation.x =
      Math.PI / 2;

    portal.add(shock);

    let shockLife = 0;

    const handleClick = () => {
      shock.scale.setScalar(0.1);
      shockLife = 1;
      shockMaterial.opacity = 0.95;
    };

    window.addEventListener(
      "click",
      handleClick
    );

    // =======================================================
    // PARTICLE TUNNEL
    //
    // Desktop: 600 particles (unchanged).
    // Mobile: 360 particles for smoother GPU/CPU performance.
    // Same tunnel concept and visual direction.
    // =======================================================

    const particleCount = isMobile ? 360 : 600;

    const positions =
      new Float32Array(
        particleCount * 3
      );

    const particleSpeeds =
      new Float32Array(
        particleCount
      );

    for (
      let i = 0, index = 0;
      i < particleCount;
      i++, index += 3
    ) {
      const a =
        Math.random() *
        Math.PI *
        2;

      const r =
        0.2 +
        Math.pow(
          Math.random(),
          0.52
        ) * 11.5;

      positions[index] =
        Math.cos(a) * r;

      positions[index + 1] =
        Math.sin(a) * r;

      positions[index + 2] =
        -10 +
        Math.random() * 12;

      particleSpeeds[i] =
        0.008 +
        Math.random() * 0.035;
    }

    const particleGeometry =
      new THREE.BufferGeometry();

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    const particlePositionAttribute =
      particleGeometry.attributes.position;

    const particlesMaterial =
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.055,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        blending:
          THREE.AdditiveBlending,
      });

    const particles =
      new THREE.Points(
        particleGeometry,
        particlesMaterial
      );

    scene.add(particles);

    // =======================================================
    // CACHE ALL FADE MATERIALS
    //
    // IMPORTANT PERFORMANCE OPTIMIZATION:
    // No scene traversal inside animation loop.
    // =======================================================

    const fadeMaterials = [];

    const registerFadeMaterial =
      (material) => {
        if (
          material &&
          material.userData &&
          material.userData
            .portalBaseOpacity !==
            undefined
        ) {
          fadeMaterials.push(
            material
          );
        }
      };

    segmented.traverse(
      (object) => {
        if (object.material) {
          registerFadeMaterial(
            object.material
          );
        }
      }
    );

    radial.traverse(
      (object) => {
        if (object.material) {
          registerFadeMaterial(
            object.material
          );
        }
      }
    );

    reactor.traverse(
      (object) => {
        if (object.material) {
          registerFadeMaterial(
            object.material
          );
        }
      }
    );

    innerRings.forEach(
      (ring) => {
        registerFadeMaterial(
          ring.material
        );
      }
    );

    // =======================================================
    // MOUSE / CURSOR
    // =======================================================

    let mouseX = 0;
    let mouseY = 0;

    let smoothX = 0;
    let smoothY = 0;

    const handleMouseMove =
      (event) => {
        mouseX =
          (event.clientX /
            window.innerWidth -
            0.5) *
          2;

        mouseY =
          -(
            (event.clientY /
              window.innerHeight -
              0.5) *
            2
          );
      };

    if (!isMobile) {
      window.addEventListener(
        "mousemove",
        handleMouseMove,
        {
          passive: true,
        }
      );
    }

    // =======================================================
    // SCROLL
    // =======================================================

    let scrollTarget = 0;
    let scrollCurrent = 0;

    let lastScroll =
      window.scrollY;

    let portalVisibility = 1;
    let portalFadeTarget = 1;

    const updatePortalFade =
      () => {
        const y = Math.max(
          window.scrollY || 0,
          0
        );

        const vh = Math.max(
          window.innerHeight || 1,
          1
        );

        const fadeStart =
          vh * 0.05;

        const fadeEnd =
          vh * 1.0;

        const progress =
          THREE.MathUtils.clamp(
            (y - fadeStart) /
              (fadeEnd -
                fadeStart),
            0,
            1
          );

        portalFadeTarget =
          1 -
          Math.pow(
            progress,
            0.85
          );
      };

    const applyPortalFade =
      (visibility) => {
        const v =
          THREE.MathUtils.clamp(
            visibility,
            0,
            1
          );

        // Cached materials.
        for (
          let i = 0;
          i < fadeMaterials.length;
          i++
        ) {
          const material =
            fadeMaterials[i];

          material.opacity =
            material.userData
              .portalBaseOpacity *
            v;
        }

        // Outer rings.
        for (
          let i = 0;
          i < rings.length;
          i++
        ) {
          const ring =
            rings[i];

          ring.mesh.material.opacity =
            ring.baseOpacity * v;
        }

        shockMaterial.opacity =
          shockLife *
          0.85 *
          v;
      };

    const handleScroll =
      () => {
        const current =
          window.scrollY;

        const delta =
          current -
          lastScroll;

        scrollTarget =
          THREE.MathUtils.clamp(
            scrollTarget +
              delta * 0.02,
            -3.5,
            9
          );

        updatePortalFade();

        lastScroll =
          current;
      };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    updatePortalFade();

    // =======================================================
    // RESIZE
    // =======================================================

    let resizeFrame = 0;

    const handleResize =
      () => {
        if (resizeFrame) {
          cancelAnimationFrame(
            resizeFrame
          );
        }

        resizeFrame =
          requestAnimationFrame(
            () => {
              const width =
                window.innerWidth;

              const height =
                window.innerHeight;

              camera.aspect =
                width / height;

              camera.updateProjectionMatrix();

              renderer.setPixelRatio(
                getPixelRatio()
              );

              renderer.setSize(
                width,
                height,
                false
              );
            }
          );
      };

    window.addEventListener(
      "resize",
      handleResize,
      {
        passive: true,
      }
    );

    handleResize();

    // =======================================================
    // ANIMATION CLOCK
    // =======================================================

    const clock =
      new THREE.Clock();

    // =======================================================
    // VISIBILITY
    // =======================================================

    let pageVisible =
      !document.hidden;

    const handleVisibility =
      () => {
        pageVisible =
          !document.hidden;

        // Prevent a huge delta after returning
        // from another browser tab.
        clock.getDelta();
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    let animationFrame;
    let time = 0;

    const damping = (
      speed,
      dt
    ) =>
      1 -
      Math.exp(
        -speed * dt
      );

    const animate = () => {
      animationFrame =
        requestAnimationFrame(
          animate
        );

      // Do not spend CPU/GPU on animation
      // when browser tab is hidden.
      if (!pageVisible) {
        return;
      }

      const dt =
        Math.min(
          clock.getDelta(),
          0.033
        );

      time += dt;

      // =====================================================
      // PORTAL FADE
      // =====================================================

      portalVisibility +=
        (
          portalFadeTarget -
          portalVisibility
        ) *
        damping(10, dt);

      if (
        portalFadeTarget === 0 &&
        portalVisibility <
          0.006
      ) {
        portalVisibility = 0;
      }

      applyPortalFade(
        portalVisibility
      );

      // =====================================================
      // ULTRA SMOOTH CURSOR
      // =====================================================

      smoothX +=
        (mouseX - smoothX) *
        damping(10.5, dt);

      smoothY +=
        (mouseY - smoothY) *
        damping(10.5, dt);

      const targetRotationY =
        smoothX * 0.44;

      const targetRotationX =
        smoothY * 0.29;

      const targetPositionX =
        smoothX * 0.44;

      const targetPositionY =
        smoothY * 0.34;

      portal.rotation.y +=
        (
          targetRotationY -
          portal.rotation.y
        ) *
        damping(8, dt);

      portal.rotation.x +=
        (
          targetRotationX -
          portal.rotation.x
        ) *
        damping(8, dt);

      portal.position.x +=
        (
          targetPositionX -
          portal.position.x
        ) *
        damping(7, dt);

      portal.position.y +=
        (
          targetPositionY -
          portal.position.y
        ) *
        damping(7, dt);

      // =====================================================
      // SMOOTH SCROLL CAMERA
      // =====================================================

      scrollCurrent +=
        (
          scrollTarget -
          scrollCurrent
        ) *
        damping(7, dt);

      const cameraZ =
        9 -
        scrollCurrent * 1.35;

      camera.position.z +=
        (
          cameraZ -
          camera.position.z
        ) *
        damping(7.5, dt);

      // =====================================================
      // OUTER RINGS
      // =====================================================

      for (
        let i = 0;
        i < rings.length;
        i++
      ) {
        const ring =
          rings[i];

        ring.mesh.rotation.z +=
          ring.speed * 0.01;
      }

      // =====================================================
      // SEGMENTED RING
      // =====================================================

      segmented.rotation.z =
        time * 0.045;

      segmented.rotation.x =
        0.018;

      // =====================================================
      // RADIAL WIRES
      // =====================================================

      radial.rotation.z =
        -time * 0.018;

      // =====================================================
      // INNER RINGS
      // =====================================================

      for (
        let i = 0;
        i < innerRings.length;
        i++
      ) {
        const ring =
          innerRings[i];

        ring.rotation.z =
          time *
          (0.018 +
            i * 0.006) *
          (i % 2 === 0
            ? 1
            : -1);
      }

      // =====================================================
      // REACTOR RINGS
      // =====================================================

      for (
        let i = 0;
        i < reactorRings.length;
        i++
      ) {
        const reactorRing =
          reactorRings[i];

        reactorRing.mesh.rotation.z =
          time *
          reactorRing.speed;
      }

      reactorSpokes.rotation.z =
        -time * 0.020;

      reactorArmor.rotation.z =
        time * 0.030;

      lockRing.rotation.z =
        -time * 0.050;

      crosshair.rotation.z =
        time * 0.014;

      iris.rotation.z =
        time * 0.060;

      irisRing.rotation.z =
        -time * 0.085;

      innerIris.rotation.z =
        time * 0.11;

      shutters.rotation.z =
        -time * 0.075;

      // =====================================================
      // CORE PULSE
      // =====================================================

      const irisPulse =
        Math.sin(
          time * 1.8
        );

      const innerIrisPulse =
        Math.sin(
          time * 2.2
        );

      const corePulse =
        Math.sin(
          time * 2.8
        );

      iris.scale.setScalar(
        1 +
          irisPulse * 0.035
      );

      innerIris.scale.setScalar(
        1 +
          innerIrisPulse *
            0.025
      );

      coreDot.scale.setScalar(
        1 +
          corePulse * 0.12
      );

      coreGlow.scale.setScalar(
        1 +
          corePulse * 0.22
      );

      // =====================================================
      // PARTICLE TUNNEL
      // =====================================================

      // Tight typed-array loop.
      // No allocations.
      for (
        let i = 0, index = 0;
        i < particleCount;
        i++, index += 3
      ) {
        let z =
          positions[index + 2] +
          particleSpeeds[i];

        if (z > 3) {
          z = -10;
        }

        positions[index + 2] =
          z;
      }

      particles.rotation.z =
        time * 0.025;

      particlePositionAttribute.needsUpdate =
        true;

      // =====================================================
      // SHOCKWAVE
      // =====================================================

      if (shockLife > 0) {
        shockLife -= 0.035;

        if (shockLife < 0) {
          shockLife = 0;
        }

        shock.scale.setScalar(
          0.15 +
            (1 - shockLife) *
              4.8
        );

        shockMaterial.opacity =
          shockLife *
          0.85 *
          portalVisibility;
      }

      // =====================================================
      // RENDER
      // =====================================================

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    // =======================================================
    // CLEANUP
    // =======================================================

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      cancelAnimationFrame(
        resizeFrame
      );

      if (!isMobile) {
        window.removeEventListener(
          "mousemove",
          handleMouseMove
        );
      }

      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "click",
        handleClick
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      particleGeometry.dispose();
      particlesMaterial.dispose();

      rings.forEach(
        ({ mesh }) => {
          mesh.geometry.dispose();
          mesh.material.dispose();
        }
      );

      segmented.traverse(
        (object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }

          if (object.material) {
            object.material.dispose();
          }
        }
      );

      radial.traverse(
        (object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }

          if (object.material) {
            object.material.dispose();
          }
        }
      );

      innerRings.forEach(
        (ring) => {
          ring.geometry.dispose();
          ring.material.dispose();
        }
      );

      core.geometry.dispose();
      core.material.dispose();

      reactor.traverse(
        (object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }

          if (object.material) {
            object.material.dispose();
          }
        }
      );

      shock.geometry.dispose();
      shock.material.dispose();

      renderer.dispose();

      if (
        canvas.parentNode ===
        document.body
      ) {
        document.body.removeChild(
          canvas
        );
      }
    };
  }, []);

  // =========================================================
  // SCROLL DOWN
  // =========================================================

  const scrollDown = () => {
    document
      .getElementById("about")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  // =========================================================
  // SPONSORS
  // =========================================================

  const sponsorLogos = [
    "/brand1.png",
    "/brand2.png",
    "/brand3.png",
    "/brand4.png",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setShowSponsors(
        (prev) => !prev
      );
    }, 6500);

    return () =>
      clearInterval(interval);
  }, []);

  // =========================================================
  // UI
  // =========================================================

  return (
    <section className="hero-section relative z-10 h-screen min-h-screen w-full overflow-hidden text-white isolate">
      <style>{`
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
          filter:
            drop-shadow(
              0 2px 4px rgba(0, 0, 0, 0.55)
            );
        }

        .ticker-premium-symbol {
          color: rgba(255, 255, 255, 0.88);
          text-shadow:
            0 0 5px rgba(255, 255, 255, 0.35),
            0 0 12px rgba(255, 255, 255, 0.14);
          filter:
            drop-shadow(
              0 2px 3px rgba(0, 0, 0, 0.65)
            );
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
          filter:
            grayscale(1)
            contrast(1.08)
            drop-shadow(
              0 2px 4px rgba(0, 0, 0, 0.55)
            );
          transition:
            opacity 300ms ease,
            transform 300ms ease,
            filter 300ms ease;
        }

        .sponsor-logo:hover {
          opacity: 1;
          transform: scale(1.05);
          filter:
            grayscale(1)
            contrast(1.15)
            drop-shadow(
              0 3px 7px rgba(255, 255, 255, 0.14)
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

        .neon-title-svg {
          display: block;
          width: min(92vw, 1000px);
          height: auto;
          overflow: visible;
          pointer-events: none;
        }

        .title-text {
          font-size: 60px;
        }

        @media (min-width: 640px) {
          .title-text {
            font-size: 72px;
          }
        }

        @media (min-width: 768px) {
          .title-text {
            font-size: 84px;
          }
        }

        @media (min-width: 1024px) {
          .title-text {
            font-size: 92px;
          }
        }

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

        .neon-title-border {
          display: none;
        }

        .neon-title-shine {
          fill: url(#titleShineGradient);
          stroke: none;
          paint-order: normal;
          pointer-events: none;
          opacity: 0.88;
          mix-blend-mode: screen;
          filter:
            drop-shadow(
              0 0 4px rgba(255, 255, 255, 0.20)
            )
            drop-shadow(
              0 0 11px rgba(255, 255, 255, 0.08)
            );
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

        .hero-tagline .word-one {
          color: rgba(255, 255, 255, 0.54);
        }

        .hero-tagline .word-two {
          color: rgba(255, 255, 255, 0.72);
        }

        .hero-tagline .word-three {
          color: rgba(255, 255, 255, 0.90);
        }

        .hero-status {
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 9px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(0, 0, 0, 0.34);
          padding: 9px 17px;
          box-shadow:
            0 0 20px rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(6px);
          color: rgba(255, 255, 255, 0.52);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.20em;
          text-transform: uppercase;
          text-shadow:
            0 2px 7px rgba(0, 0, 0, 0.8);
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
          transition:
            opacity 400ms ease,
            transform 300ms ease;
        }

        .hero-scroll-button:hover {
          transform:
            translateX(-50%)
            translateY(-4px) !important;
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
        }

        .hero-cyber-portal::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          opacity: 0.035;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 3px,
            rgba(255, 255, 255, 0.22) 4px
          );
          mix-blend-mode: screen;
        }

        .hero-cyber-portal::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 3;
          background: radial-gradient(
            circle at center,
            transparent 25%,
            rgba(0, 0, 0, 0.08) 52%,
            rgba(0, 0, 0, 0.42) 100%
          );
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
            transform:
              translateX(-50%)
              translateY(-4px) !important;
          }

          .sponsor-logo {
            height: 17px;
            max-width: 65px;
          }

          .event-ticker,
          .sponsor-ticker {
            animation-duration: 18s;
          }

          .ticker-group {
            flex: 0 0 auto;
            min-width: max-content;
            gap: 1.75rem;
            padding-left: 125px;
            padding-right: 30px;
          }

          /* MOBILE ONLY — larger, stronger hero typography.
             Desktop/tablet rules above remain unchanged. */
          .neon-title-svg {
            width: min(98vw, 760px);
          }

          .title-text {
            font-size: clamp(86px, 22vw, 124px);
          }

          .hero-description {
            max-width: 95vw;
            font-size: clamp(15px, 4.4vw, 18px);
            line-height: 1.72;
            letter-spacing: 0.055em;
          }

          .hero-tagline {
            font-size: clamp(14px, 4vw, 17px);
            letter-spacing: 0.09em;
          }

          .hero-status {
            margin-top: 22px;
            font-size: 9px;
            letter-spacing: 0.15em;
            padding: 9px 14px;
          }
        }

        @media (max-width: 390px) {
          .neon-title-svg {
            width: 98vw;
          }

          .title-text {
            font-size: clamp(78px, 22.5vw, 98px);
          }

          .hero-description {
            max-width: 96vw;
            font-size: 14.5px;
            line-height: 1.68;
          }

          .hero-tagline {
            font-size: 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .event-ticker,
          .sponsor-ticker {
            animation: none;
          }

          .neon-title-shine {
            opacity: 0;
          }
        }
      `}</style>

      {/* THREE.JS BACKGROUND MOUNT ANCHOR */}
      <div
        id="hero-cyber-portal"
        className="hero-cyber-portal"
        aria-hidden="true"
      />

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
            showSponsors
              ? "border-white/15 bg-black/20"
              : "border-white/15 bg-black/25"
          }`}
        >
          <span
            className={`mr-2 h-1.5 w-1.5 rounded-full ${
              showSponsors
                ? "bg-white/70 shadow-[0_0_8px_rgba(255,255,255,.28)]"
                : "bg-white/75 shadow-[0_0_8px_rgba(255,255,255,.30)]"
            }`}
          />

          <span className="whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.22em] text-white/50">
            {showSponsors
              ? "Sponsors"
              : "Latest Event"}
          </span>
        </div>

        <div
          className={`ticker-switch absolute inset-0 flex items-center overflow-hidden ${
            showSponsors
              ? "ticker-hidden pointer-events-none"
              : "ticker-visible"
          }`}
        >
          <div className="event-ticker">
            <div className="ticker-group">
              <span className="ticker-premium-text text-[9px] font-semibold uppercase tracking-[0.22em]">
                NITS ESPORTS CHAMPIONSHIP 2026
              </span>

              <span className="ticker-premium-symbol">
                ◆
              </span>

              <span className="ticker-premium-text text-[9px] font-semibold uppercase tracking-[0.22em]">
                REGISTRATIONS ARE NOW OPEN
              </span>

              <span className="ticker-premium-symbol">
                ◆
              </span>

              <span className="ticker-premium-text text-[9px] font-semibold uppercase tracking-[0.22em]">
                BATTLE FOR THE CROWN
              </span>

              <span className="ticker-premium-symbol">
                ◆
              </span>
            </div>
          </div>
        </div>

        <div
          className={`ticker-switch absolute inset-0 flex items-center overflow-hidden ${
            showSponsors
              ? "ticker-visible"
              : "ticker-hidden pointer-events-none"
          }`}
        >
          <div className="sponsor-ticker">
            <div className="ticker-group">
              {sponsorLogos.map(
                (logo, index) => (
                  <div
                    key={`${logo}-${index}`}
                    className="flex h-7 min-w-[80px] items-center justify-center px-2"
                  >
                    <img
                      src={logo}
                      alt={`Sponsor ${index + 1}`}
                      className="sponsor-logo"
                    />
                  </div>
                )
              )}
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
          <svg
            className="neon-title-svg"
            viewBox="0 0 1000 120"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="titleFillGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="14%" stopColor="#f1f1f1" />
                <stop offset="30%" stopColor="#c8c8c8" />
                <stop offset="46%" stopColor="#7d7d7d" />
                <stop offset="60%" stopColor="#555555" />
                <stop offset="72%" stopColor="#8f8f8f" />
                <stop offset="86%" stopColor="#d9d9d9" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>

              <linearGradient
                id="titleInnerGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="38%" stopColor="#dddddd" />
                <stop offset="58%" stopColor="#666666" />
                <stop offset="78%" stopColor="#bdbdbd" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>

              <linearGradient
                id="titleShineGradient"
                gradientUnits="userSpaceOnUse"
                x1="-260"
                y1="0"
                x2="-80"
                y2="0"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="38%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.92" />
                <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />

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
                id="premiumTitleShadow"
                x="-30%"
                y="-30%"
                width="160%"
                height="180%"
              >
                <feDropShadow
                  dx="0"
                  dy="7"
                  stdDeviation="4"
                  floodColor="#000000"
                  floodOpacity="0.95"
                />

                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="2"
                  floodColor="#000000"
                  floodOpacity="0.70"
                />

                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="1"
                  floodColor="#ffffff"
                  floodOpacity="0.10"
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
              className="title-text neon-title-base"
            >
              NITS ESPORTS
            </text>

            <text
              x="50%"
              y="86"
              textAnchor="middle"
              fontFamily="The Last Shuriken, sans-serif"
              fontSize="92"
              fontWeight="700"
              letterSpacing="-4"
              className="title-text neon-title-inner"
            >
              NITS ESPORTS
            </text>

            <text
              x="50%"
              y="86"
              textAnchor="middle"
              fontFamily="The Last Shuriken, sans-serif"
              fontSize="92"
              fontWeight="700"
              letterSpacing="-4"
              className="title-text neon-title-shine"
            >
              NITS ESPORTS
            </text>
          </svg>
        </div>

        <div className="hero-description">
          <div className="hero-description-main">
            <strong />
          </div>

          <div className="hero-tagline">
            <span className="word-one">
              Compete.
            </span>{" "}
            <span className="word-two">
              Connect.
            </span>{" "}
            <span className="word-three">
              Conquer.
            </span>
          </div>
        </div>

        <div className="hero-status">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-60" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,.25)]" />
          </span>

          <span>
            Official Esports Club
          </span>
        </div>
      </div>

      {/* SCROLL DOWN */}
      <button
        onClick={scrollDown}
        className="hero-font hero-scroll-button group flex flex-col items-center"
      >
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

