import { useEffect, useId, useRef, useState } from "react";
import * as THREE from "three";

import f1 from "../assets/f1.png";
import f2 from "../assets/f2.png";
import f3 from "../assets/f3.png";
import f4 from "../assets/f4.png";
import f5 from "../assets/f5.png";
import liw from "../assets/liw.png";
import insw from "../assets/insw.png";
import ytw from "../assets/ytw.png";
import fbw from "../assets/fbw.png";

function CyberWeaponBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ============================================================
    // SCENE
    // ============================================================

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      34,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    camera.position.set(0.25, 0.15, 9);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setClearColor(0x000000, 1);

    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";

    container.appendChild(renderer.domElement);

    scene.fog = new THREE.FogExp2(0x000000, 0.025);

    // ============================================================
    // WEAPON MAIN GROUP
    // ============================================================

    const weapon = new THREE.Group();

    // Keep the weapon behind the UI and visually restrained.
    // The geometry itself is unchanged.
    // Larger hero weapon, positioned lower so the heading remains clean.
    weapon.position.set(0.10, -0.48, -1.15);
    weapon.scale.setScalar(1.15);

    weapon.rotation.set(-0.025, -0.1, -0.015);

    scene.add(weapon);

    // ============================================================
    // WEAPON STATE
    // ============================================================

    weapon.userData.recoil = 0;

    // ============================================================
    // MATERIALS
    // ============================================================

    const black = new THREE.MeshStandardMaterial({
      color: 0x020202,
      roughness: 0.72,
      metalness: 0.72,
    });

    const blackMetal = new THREE.MeshStandardMaterial({
      color: 0x080808,
      roughness: 0.48,
      metalness: 0.88,
    });

    const graphite = new THREE.MeshStandardMaterial({
      color: 0x242424,
      roughness: 0.42,
      metalness: 0.92,
    });

    const steel = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.35,
      metalness: 0.95,
    });

    const darkSteel = new THREE.MeshStandardMaterial({
      color: 0x5a5a5a,
      roughness: 0.3,
      metalness: 1,
    });

    const highlight = new THREE.MeshStandardMaterial({
      color: 0xb8b8b8,
      roughness: 0.28,
      metalness: 1,
    });

    const white = new THREE.MeshBasicMaterial({
      color: 0xe5e5e5,
    });

    const energy = new THREE.MeshBasicMaterial({
      color: 0xdadada,
      transparent: true,
      opacity: 0.92,
    });

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x777777,
      transparent: true,
      opacity: 0.46,
    });

    const dimLineMaterial = new THREE.LineBasicMaterial({
      color: 0x4a4a4a,
      transparent: true,
      opacity: 0.24,
    });

    const brightLineMaterial = new THREE.LineBasicMaterial({
      color: 0xd0d0d0,
      transparent: true,
      opacity: 0.78,
    });

    // ============================================================
    // LIGHTING
    // ============================================================

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);

    keyLight.position.set(4, 5, 7);

    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);

    rimLight.position.set(-5, 1, 4);

    scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.25);

    topLight.position.set(0, 7, 2);

    scene.add(topLight);

    // ============================================================
    // HELPERS
    // ============================================================

    function meshBox(w, h, d, x, y, z, material, parent = weapon) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);

      mesh.position.set(x, y, z);

      parent.add(mesh);

      return mesh;
    }

    function meshCylinder(
      radiusTop,
      radiusBottom,
      depth,
      x,
      y,
      z,
      material,
      radial = 32,
      parent = weapon
    ) {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radiusTop, radiusBottom, depth, radial),
        material
      );

      mesh.position.set(x, y, z);

      parent.add(mesh);

      return mesh;
    }

    function createPanel(points, depth, material, z, parent = weapon) {
      const shape = new THREE.Shape();

      shape.moveTo(points[0][0], points[0][1]);

      for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i][0], points[i][1]);
      }

      shape.closePath();

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.025,
        bevelThickness: 0.025,
      });

      geometry.center();

      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.z = z;

      parent.add(mesh);

      return mesh;
    }

    function addLine(points, material = lineMaterial, parent = weapon) {
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(([x, y, z = 0]) => new THREE.Vector3(x, y, z))
      );

      const line = new THREE.Line(geometry, material);

      parent.add(line);

      return line;
    }

    function addRing(
      radius,
      tube,
      x,
      y,
      z,
      material,
      rotation = "y",
      parent = weapon
    ) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 10, 48),
        material
      );

      ring.position.set(x, y, z);

      if (rotation === "x") ring.rotation.x = Math.PI / 2;

      if (rotation === "y") ring.rotation.y = Math.PI / 2;

      if (rotation === "z") ring.rotation.z = Math.PI / 2;

      parent.add(ring);

      return ring;
    }

    // ============================================================
    // MAIN CHASSIS
    // ============================================================

    meshBox(4.65, 1.05, 0.92, 0, 0.15, 0, blackMetal);

    createPanel(
      [
        [-2.1, 0.55],
        [-1.72, 0.88],
        [-0.65, 0.98],
        [0.72, 0.9],
        [1.7, 0.67],
        [2.12, 0.4],
        [1.55, 0.18],
        [-1.7, 0.25],
      ],
      0.2,
      graphite,
      0.48
    );

    createPanel(
      [
        [-1.88, -0.24],
        [-0.85, -0.48],
        [0.65, -0.45],
        [1.65, -0.22],
        [1.34, -0.58],
        [-1.35, -0.68],
      ],
      0.2,
      black,
      0.45
    );

    // ============================================================
    // CENTER ARMOR SPINE
    // ============================================================

    createPanel(
      [
        [-1.1, 0.48],
        [-0.72, 0.72],
        [0.48, 0.7],
        [1.1, 0.45],
        [0.82, 0.2],
        [-0.88, 0.2],
      ],
      0.18,
      steel,
      0.62
    );

    for (let i = 0; i < 9; i++) {
      const x = -1.02 + i * 0.255;

      meshBox(
        0.14,
        0.1,
        0.1,
        x,
        0.78,
        0.52,
        i % 3 === 0 ? darkSteel : steel
      );
    }

    // ============================================================
    // TOP RAIL
    // ============================================================

    meshBox(2.45, 0.16, 0.36, -0.05, 1.0, 0, black);

    for (let i = 0; i < 13; i++) {
      meshBox(
        0.105,
        0.07,
        0.4,
        -1.15 + i * 0.19,
        1.12,
        0,
        i % 4 === 0 ? darkSteel : steel
      );
    }

    // ============================================================
    // FRONT RECEIVER
    // ============================================================

    createPanel(
      [
        [1.25, 0.62],
        [1.9, 0.78],
        [2.42, 0.5],
        [2.58, 0.22],
        [2.32, -0.05],
        [1.52, 0.12],
      ],
      0.24,
      graphite,
      0.44
    );

    createPanel(
      [
        [1.4, 0.42],
        [2.05, 0.55],
        [2.35, 0.28],
        [2.2, 0.05],
        [1.46, 0.12],
      ],
      0.12,
      steel,
      0.62
    );

    for (let i = 0; i < 5; i++) {
      meshBox(
        0.16,
        0.38 - i * 0.025,
        0.68,
        1.5 + i * 0.18,
        0.2,
        0,
        i % 2 === 0 ? steel : black
      );
    }

    // ============================================================
    // BARREL SYSTEM
    // ============================================================

    const barrelGroup = new THREE.Group();

    weapon.add(barrelGroup);

    const barrel = meshCylinder(
      0.17,
      0.17,
      2.3,
      3.18,
      0.15,
      0,
      black,
      48,
      barrelGroup
    );

    barrel.rotation.z = Math.PI / 2;

    const barrelInner = meshCylinder(
      0.085,
      0.085,
      2.4,
      3.2,
      0.15,
      0,
      darkSteel,
      32,
      barrelGroup
    );

    barrelInner.rotation.z = Math.PI / 2;

    // Individual mechanical barrel segments

    const barrelSegments = [];

    for (let i = 0; i < 7; i++) {
      const x = 2.15 + i * 0.3;

      const segment = addRing(
        0.225,
        0.028,
        x,
        0.15,
        0,
        i % 3 === 0 ? highlight : steel,
        "y",
        barrelGroup
      );

      segment.rotation.y = Math.PI / 2;

      barrelSegments.push(segment);
    }

    // Barrel armor fins

    for (let i = 0; i < 12; i++) {
      const x = 2.18 + i * 0.17;

      meshBox(
        0.09,
        0.055,
        0.36,
        x,
        0.34,
        0,
        i % 3 === 0 ? darkSteel : steel,
        barrelGroup
      );
    }

    // ============================================================
    // MUZZLE
    // ============================================================

    const muzzle = new THREE.Group();

    weapon.add(muzzle);

    const muzzleBody = meshCylinder(
      0.34,
      0.28,
      0.42,
      4.25,
      0.15,
      0,
      graphite,
      48,
      muzzle
    );

    muzzleBody.rotation.z = Math.PI / 2;

    const muzzleCore = meshCylinder(
      0.19,
      0.19,
      0.46,
      4.48,
      0.15,
      0,
      black,
      40,
      muzzle
    );

    muzzleCore.rotation.z = Math.PI / 2;

    for (let i = 0; i < 4; i++) {
      const band = addRing(
        0.31 - i * 0.018,
        0.025,
        4.05 + i * 0.14,
        0.15,
        0,
        i === 0 ? darkSteel : steel,
        "y",
        muzzle
      );

      band.rotation.y = Math.PI / 2;
    }

    // Muzzle vents

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;

      const vent = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.035, 0.05),
        i % 3 === 0 ? highlight : steel
      );

      vent.position.set(
        4.25,
        0.15 + Math.cos(angle) * 0.28,
        Math.sin(angle) * 0.28
      );

      vent.rotation.z = angle;

      muzzle.add(vent);
    }

    // ============================================================
    // REAR ENGINE
    // ============================================================

    const engine = new THREE.Group();

    engine.position.set(-2.2, 0.05, 0);

    weapon.add(engine);

    const engineBody = meshCylinder(
      0.43,
      0.43,
      0.72,
      0,
      0,
      0,
      blackMetal,
      48,
      engine
    );

    engineBody.rotation.z = Math.PI / 2;

    const engineRings = [];

    for (let i = 0; i < 5; i++) {
      const r = 0.42 - i * 0.065;

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.022, 8, 48),
        i === 0 ? darkSteel : steel
      );

      ring.rotation.y = Math.PI / 2;

      ring.position.x = -0.28 + i * 0.14;

      engine.add(ring);

      engineRings.push(ring);
    }

    // ============================================================
    // ROTATING ENERGY CORE
    // ============================================================

    const energyCore = new THREE.Group();

    energyCore.position.set(-0.25, 0.34, 0.52);

    weapon.add(energyCore);

    const coreOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.18, 48),
      steel
    );

    coreOuter.rotation.x = Math.PI / 2;

    energyCore.add(coreOuter);

    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.2, 48),
      energy
    );

    core.rotation.x = Math.PI / 2;

    core.position.z = 0.05;

    energyCore.add(core);

    for (let i = 0; i < 4; i++) {
      const r = 0.27 - i * 0.055;

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.012, 8, 48),
        highlight
      );

      ring.position.z = 0.14;

      energyCore.add(ring);
    }

    // ============================================================
    // POWER CELLS
    // ============================================================

    for (let i = 0; i < 7; i++) {
      const cell = meshBox(
        0.22,
        0.075,
        0.1,
        -1.18 + i * 0.28,
        -0.02,
        0.49,
        i % 2 === 0 ? darkSteel : steel
      );

      cell.rotation.z = i % 2 === 0 ? 0.04 : -0.04;
    }

    const weaponDetailBright = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      toneMapped: false,
    });

    const weaponDetailMedium = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      toneMapped: false,
    });

    const weaponDetailFine = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.085,
      depthWrite: false,
      toneMapped: false,
    });

    // ============================================================
    // CLEAN UNDERBODY ARMOR — NO HANDLE
    // ============================================================
    // The old oversized hanging grip/trigger assembly is intentionally
    // removed. A shallow integrated underbody keeps the silhouette
    // balanced without creating a distracting vertical handle.

    createPanel(
      [
        [-1.72, -0.30],
        [-1.28, -0.58],
        [-0.42, -0.64],
        [0.42, -0.56],
        [0.86, -0.38],
        [0.52, -0.28],
        [-0.52, -0.34],
      ],
      0.14,
      graphite,
      0.54
    );

    createPanel(
      [
        [-1.46, -0.42],
        [-0.98, -0.62],
        [-0.36, -0.66],
        [0.24, -0.57],
        [0.48, -0.43],
        [-0.42, -0.47],
      ],
      0.08,
      blackMetal,
      0.67
    );

    // Clean segmented vent cuts beneath the receiver.
    for (let i = 0; i < 7; i++) {
      const x = -1.42 + i * 0.29;
      addLine(
        [
          [x, -0.45, 0.72],
          [x + 0.10, -0.54, 0.72],
          [x + 0.20, -0.48, 0.72],
        ],
        i % 3 === 0 ? weaponDetailBright : weaponDetailFine
      );
    }

    // ============================================================
    // HOLOGRAPHIC SCOPE
    // ============================================================

    const scope = new THREE.Group();

    scope.position.set(0.65, 1.32, 0);

    weapon.add(scope);

    const scopeBody = meshCylinder(
      0.18,
      0.18,
      1.15,
      0,
      0,
      0,
      blackMetal,
      32,
      scope
    );

    scopeBody.rotation.z = Math.PI / 2;

    const scopeRings = [];

    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.21, 0.028, 8, 32),
        i === 0 ? highlight : steel
      );

      ring.rotation.y = Math.PI / 2;

      ring.position.x = -0.42 + i * 0.28;

      scope.add(ring);

      scopeRings.push(ring);
    }

    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), energy);

    lens.rotation.y = Math.PI / 2;

    lens.position.x = 0.61;

    scope.add(lens);

    // Scope support

    for (let i = 0; i < 3; i++) {
      meshBox(0.12, 0.3, 0.2, 0.18 + i * 0.28, 1.1, 0, steel);
    }

    // ============================================================
    // SENSOR
    // ============================================================

    const sensor = new THREE.Group();

    sensor.position.set(-0.95, 1.32, 0);

    weapon.add(sensor);

    meshBox(0.16, 0.38, 0.18, 0, 0, 0, blackMetal, sensor);

    const sensorRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.018, 8, 32),
      highlight
    );

    sensorRing.rotation.x = Math.PI / 2;

    sensorRing.position.y = 0.2;

    sensor.add(sensorRing);

    // ============================================================
    // SIDE EXOSKELETON
    // ============================================================

    for (let side of [-1, 1]) {
      createPanel(
        [
          [-1.78, 0.3],
          [-1.28, 0.55],
          [-0.52, 0.46],
          [0.08, 0.25],
          [-0.55, 0.02],
          [-1.58, 0.1],
        ],
        0.1,
        side === 1 ? steel : black,
        side * 0.5
      );
    }

    // ============================================================
    // SIDE VENTS
    // ============================================================

    for (let side of [-1, 1]) {
      for (let i = 0; i < 10; i++) {
        addLine(
          [
            [-1.65 + i * 0.17, 0.02, side * 0.56],
            [-1.54 + i * 0.17, 0.16, side * 0.56],
          ],
          i % 3 === 0 ? lineMaterial : dimLineMaterial
        );
      }
    }

    // ============================================================
    // BOLTS
    // ============================================================

    const boltPositions = [
      [-1.72, 0.44],
      [-1.28, 0.58],
      [-0.76, 0.42],
      [-0.18, 0.58],
      [0.42, 0.48],
      [1.02, 0.4],
      [1.55, 0.28],
      [1.92, 0.1],
      [1.12, -0.28],
      [0.5, -0.35],
      [-0.18, -0.3],
      [-0.85, -0.34],
    ];

    boltPositions.forEach(([x, y], index) => {
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(
          index % 3 === 0 ? 0.045 : 0.03,
          index % 3 === 0 ? 0.045 : 0.03,
          0.07,
          12
        ),
        index % 3 === 0 ? highlight : darkSteel
      );

      bolt.rotation.x = Math.PI / 2;

      bolt.position.set(x, y, 0.6);

      weapon.add(bolt);
    });

    // ============================================================
    // CIRCUIT NETWORK
    // ============================================================

    const circuitGroup = new THREE.Group();

    weapon.add(circuitGroup);

    for (let i = 0; i < 45; i++) {
      const x = -1.6 + Math.random() * 3.15;

      const y = -0.28 + Math.random() * 0.85;

      addLine(
        [
          [x, y, 0.64],
          [x + 0.1 + Math.random() * 0.3, y, 0.64],
          [
            x + 0.1 + Math.random() * 0.3,
            y + (Math.random() > 0.5 ? 0.08 : -0.08),
            0.64,
          ],
        ],
        i % 7 === 0 ? lineMaterial : dimLineMaterial,
        circuitGroup
      );
    }

    for (let i = 0; i < 65; i++) {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.014 + Math.random() * 0.018, 8, 8),
        i % 8 === 0 ? white : darkSteel
      );

      node.position.set(
        -1.65 + Math.random() * 3.25,
        -0.3 + Math.random() * 0.95,
        0.66
      );

      circuitGroup.add(node);
    }

    // ============================================================
    // FLOATING HUD
    // ============================================================

    const hud = new THREE.Group();

    hud.position.z = -1.5;

    scene.add(hud);

    function hudRing(radius, opacity) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(radius - 0.008, radius, 180),
        new THREE.MeshBasicMaterial({
          color: 0x606060,
          transparent: true,
          opacity,
        })
      );

      ring.scale.y = 0.55;

      hud.add(ring);

      return ring;
    }

    const hud1 = hudRing(3.0, 0.08);

    const hud2 = hudRing(3.35, 0.045);

    const hud3 = hudRing(3.75, 0.025);

    for (let i = 0; i < 96; i++) {
      const angle = (i / 96) * Math.PI * 2;

      const r1 = 3.05;

      const r2 = r1 + (i % 8 === 0 ? 0.17 : 0.045);

      addLine(
        [
          [Math.cos(angle) * r1, Math.sin(angle) * r1 * 0.55, 0],
          [Math.cos(angle) * r2, Math.sin(angle) * r2 * 0.55, 0],
        ],
        i % 8 === 0 ? lineMaterial : dimLineMaterial,
        hud
      );
    }

    // ============================================================
    // PARTICLES
    // ============================================================

    const particleCount = 1500;

    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;

      const radius = 3 + Math.random() * 6;

      positions[i * 3] = Math.cos(angle) * radius;

      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.55;

      positions[i * 3 + 2] = -2 + Math.random() * 5;
    }

    const particleGeometry = new THREE.BufferGeometry();

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x707070,
        size: 0.014,
        transparent: true,
        opacity: 0.25,
      })
    );

    scene.add(particles);

    // ============================================================
    // MUZZLE FLASH
    // ============================================================

    const muzzleFlash = new THREE.Group();

    muzzleFlash.position.set(4.58, 0.15, 0);

    muzzleFlash.visible = false;

    weapon.add(muzzleFlash);

    const flashCore = new THREE.Mesh(
      new THREE.CircleGeometry(0.34, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
      })
    );

    muzzleFlash.add(flashCore);

    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;

      const length = 0.25 + Math.random() * 0.6;

      addLine(
        [
          [0, 0, 0],
          [Math.cos(angle) * length, Math.sin(angle) * length, 0],
        ],
        brightLineMaterial,
        muzzleFlash
      );
    }

    // ============================================================
    // PROJECTILES
    // ============================================================

    const projectiles = [];

    function fire() {
      weapon.userData.recoil = 1;

      const muzzleWorld = new THREE.Vector3();
      muzzleFlash.getWorldPosition(muzzleWorld);

      const weaponWorldQuaternion = new THREE.Quaternion();
      weapon.getWorldQuaternion(weaponWorldQuaternion);

      const fireDirection = new THREE.Vector3(1, 0, 0)
        .applyQuaternion(weaponWorldQuaternion)
        .normalize();

      muzzleFlash.visible = true;

      muzzleFlash.scale.setScalar(0.8 + Math.random() * 0.55);

      muzzleFlash.rotation.z = Math.random() * Math.PI * 2;

      setTimeout(() => {
        muzzleFlash.visible = false;
      }, 70);

      const projectile = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 16, 16),
        white
      );

      projectile.position.copy(muzzleWorld);

      scene.add(projectile);

      projectiles.push({
        mesh: projectile,
        velocity: fireDirection
          .clone()
          .multiplyScalar(0.34 + Math.random() * 0.08),
        life: 80,
      });

      const tracer = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.018, 0.018),
        energy
      );

      tracer.position.copy(muzzleWorld);

      tracer.position.add(fireDirection.clone().multiplyScalar(-0.2));

      tracer.quaternion.setFromUnitVectors(
        new THREE.Vector3(1, 0, 0),
        fireDirection
      );

      scene.add(tracer);

      projectiles.push({
        mesh: tracer,
        velocity: fireDirection.clone().multiplyScalar(0.31),
        life: 20,
      });

      for (let i = 0; i < 14; i++) {
        const spark = new THREE.Mesh(
          new THREE.BoxGeometry(0.025, 0.025, 0.025),
          i % 3 === 0 ? white : darkSteel
        );

        spark.position.copy(muzzleWorld);

        const spread = new THREE.Vector3(
          (Math.random() - 0.5) * 0.42,
          (Math.random() - 0.5) * 0.42,
          (Math.random() - 0.5) * 0.28
        );

        const sparkVelocity = fireDirection
          .clone()
          .multiplyScalar(0.06 + Math.random() * 0.11);

        sparkVelocity.add(spread);

        scene.add(spark);

        projectiles.push({
          mesh: spark,
          velocity: sparkVelocity,
          life: 20 + Math.random() * 12,
        });
      }
    }

    // ============================================================
    // WEAPON OUTLINE CONVERSION
    // ============================================================
    // Preserve the EXACT existing weapon geometry, proportions,
    // components and animation hierarchy — remove all solid fills
    // and render every mesh as a highly detailed white technical
    // outline instead.
    //
    // The outline is attached as a child of each original mesh, so
    // barrel recoil, rotating rings, engine, scope, energy core,
    // muzzle flash and every existing movement continue to work.

    const weaponOutlineBright = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      toneMapped: false,
    });

    const weaponOutlineMedium = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.115,
      depthWrite: false,
      toneMapped: false,
    });

    const weaponOutlineFine = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.040,
      depthWrite: false,
      toneMapped: false,
    });

    const weaponOutlineMeshes = [];

    weapon.traverse((object) => {
      if (!object.isMesh || !object.geometry) return;

      weaponOutlineMeshes.push(object);

      // Make the original surface completely transparent.
      // Clone first because many original parts share materials.
      if (Array.isArray(object.material)) {
        object.material = object.material.map((material) => {
          const transparentMaterial = material.clone();
          transparentMaterial.transparent = true;
          transparentMaterial.opacity = 0;
          transparentMaterial.depthWrite = false;
          return transparentMaterial;
        });
      } else if (object.material) {
        const transparentMaterial =
          object.material.clone();

        transparentMaterial.transparent = true;
        transparentMaterial.opacity = 0;
        transparentMaterial.depthWrite = false;

        object.material = transparentMaterial;
      }

      // Primary structural border — sharp geometry edges.
      const edgesGeometry =
        new THREE.EdgesGeometry(
          object.geometry,
          28
        );

      const edgeLine =
        new THREE.LineSegments(
          edgesGeometry,
          weaponOutlineBright
        );

      edgeLine.position.set(0, 0, 0);
      edgeLine.rotation.set(0, 0, 0);
      edgeLine.scale.set(1, 1, 1);

      object.add(edgeLine);

      // Secondary fine edge pass. This gives panels, bevels,
      // cylindrical rings and mechanical parts more definition
      // without introducing any filled surface.
      const fineEdgesGeometry =
        new THREE.EdgesGeometry(
          object.geometry,
          46
        );

      const fineEdgeLine =
        new THREE.LineSegments(
          fineEdgesGeometry,
          weaponOutlineFine
        );

      fineEdgeLine.position.set(
        0,
        0,
        0.001
      );

      object.add(fineEdgeLine);

      // Keep line rendering independent of the original material.
      edgeLine.renderOrder = 20;
      fineEdgeLine.renderOrder = 21;
    });

    // Explicitly keep the two animated emissive surfaces outline-only.
    // Their existing animation still runs, but their original fills
    // never become visible.
    const forceOutlineOnly = () => {
      weaponOutlineMeshes.forEach((object) => {
        if (!object.material) return;

        if (Array.isArray(object.material)) {
          object.material.forEach((material) => {
            material.opacity = 0;
            material.transparent = true;
            material.depthWrite = false;
          });
        } else {
          object.material.opacity = 0;
          object.material.transparent = true;
          object.material.depthWrite = false;
        }
      });
    };

    forceOutlineOnly();

    // ============================================================
    // PREMIUM TECHNICAL DETAIL PASS
    // ============================================================
    // Extra white micro-linework is layered over the existing outline.
    // No solid weapon surfaces are introduced.

    // Main chassis segmented armor seams.
    const chassisSeams = [
      [[-1.92, 0.46, 0.69], [-1.62, 0.69, 0.69], [-1.05, 0.73, 0.69]],
      [[-0.82, 0.73, 0.69], [-0.18, 0.68, 0.69], [0.48, 0.62, 0.69]],
      [[0.70, 0.60, 0.69], [1.18, 0.48, 0.69], [1.62, 0.34, 0.69]],
      [[-1.78, -0.31, 0.69], [-1.22, -0.48, 0.69], [-0.55, -0.52, 0.69]],
      [[-0.38, -0.50, 0.69], [0.42, -0.44, 0.69], [1.22, -0.25, 0.69]],
    ];

    chassisSeams.forEach((points, i) => {
      addLine(points, i % 2 === 0 ? weaponDetailMedium : weaponDetailFine);
    });

    // Angular armor-panel cuts.
    const armorCuts = [
      [[-1.72, 0.30, 0.70], [-1.48, 0.48, 0.70], [-1.12, 0.52, 0.70]],
      [[-0.96, 0.30, 0.70], [-0.72, 0.52, 0.70], [-0.38, 0.54, 0.70]],
      [[-0.25, 0.27, 0.70], [0.08, 0.48, 0.70], [0.40, 0.50, 0.70]],
      [[0.62, 0.25, 0.70], [0.88, 0.42, 0.70], [1.18, 0.43, 0.70]],
    ];

    armorCuts.forEach((points) => addLine(points, weaponDetailFine));

    // High-detail central spine slots.
    for (let i = 0; i < 8; i++) {
      const x = -0.88 + i * 0.23;
      addLine(
        [
          [x, 0.55, 0.72],
          [x + 0.11, 0.61, 0.72],
          [x + 0.18, 0.55, 0.72],
        ],
        i % 2 === 0 ? weaponDetailBright : weaponDetailMedium
      );
    }

    // Top rail micro-locks and side braces.
    for (let i = 0; i < 12; i++) {
      const x = -1.10 + i * 0.19;

      addLine(
        [
          [x - 0.035, 0.99, 0.45],
          [x, 1.08, 0.45],
          [x + 0.035, 0.99, 0.45],
        ],
        i % 3 === 0 ? weaponDetailBright : weaponDetailFine
      );
    }

    // Receiver technical paneling.
    addLine(
      [[1.34, 0.52, 0.71], [1.68, 0.66, 0.71], [2.12, 0.48, 0.71], [2.36, 0.30, 0.71]],
      weaponDetailBright
    );
    addLine(
      [[1.46, 0.29, 0.72], [1.82, 0.36, 0.72], [2.17, 0.23, 0.72]],
      weaponDetailMedium
    );
    addLine(
      [[1.58, 0.15, 0.72], [1.96, 0.11, 0.72], [2.24, 0.04, 0.72]],
      weaponDetailFine
    );

    // Barrel cooling channels.
    for (let i = 0; i < 8; i++) {
      const x = 2.18 + i * 0.24;
      addLine(
        [
          [x, 0.28, 0.20],
          [x + 0.10, 0.34, 0.20],
          [x + 0.17, 0.28, 0.20],
        ],
        i % 3 === 0 ? weaponDetailBright : weaponDetailMedium
      );
    }

    // Muzzle crown radial detailing.
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r1 = 0.20;
      const r2 = 0.285;

      addLine(
        [
          [4.47, 0.15 + Math.cos(angle) * r1, Math.sin(angle) * r1],
          [4.47, 0.15 + Math.cos(angle) * r2, Math.sin(angle) * r2],
        ],
        i % 3 === 0 ? weaponDetailBright : weaponDetailFine
      );
    }

    // Clean lower-receiver contour — restrained technical detailing.
    addLine(
      [[-1.62, -0.34, 0.73], [-1.24, -0.55, 0.73], [-0.55, -0.59, 0.73]],
      weaponDetailMedium
    );
    addLine(
      [[-0.42, -0.59, 0.73], [0.12, -0.53, 0.73], [0.52, -0.40, 0.73]],
      weaponDetailFine
    );

    // Scope: segmented housing and lens reticle.
    addLine(
      [[0.12, 1.32, 0.48], [0.35, 1.47, 0.48], [0.78, 1.47, 0.48], [1.10, 1.32, 0.48]],
      weaponDetailBright
    );
    addLine(
      [[0.18, 1.20, 0.49], [0.52, 1.16, 0.49], [0.86, 1.20, 0.49]],
      weaponDetailMedium
    );

    // Scope lens reticle.
    addLine(
      [[1.19, 1.32, 0.49], [1.31, 1.32, 0.49]],
      weaponDetailBright
    );
    addLine(
      [[1.25, 1.26, 0.49], [1.25, 1.38, 0.49]],
      weaponDetailBright
    );

    // Sensor crosshair.
    addLine(
      [[-1.05, 1.32, 0.50], [-0.85, 1.32, 0.50]],
      weaponDetailBright
    );
    addLine(
      [[-0.95, 1.22, 0.50], [-0.95, 1.42, 0.50]],
      weaponDetailMedium
    );

    // Repeated side exoskeleton ribs.
    for (let side of [-1, 1]) {
      for (let i = 0; i < 9; i++) {
        const x = -1.60 + i * 0.18;

        addLine(
          [
            [x, 0.12, side * 0.59],
            [x + 0.08, 0.23, side * 0.59],
            [x + 0.15, 0.16, side * 0.59],
          ],
          i % 3 === 0 ? weaponDetailMedium : weaponDetailFine
        );
      }
    }

    // Extra technical bolt rings.
    const detailBolts = [
      [-1.72, 0.44],
      [-1.28, 0.58],
      [-0.76, 0.42],
      [-0.18, 0.58],
      [0.42, 0.48],
      [1.02, 0.40],
      [1.55, 0.28],
      [1.92, 0.10],
      [1.12, -0.28],
      [0.50, -0.35],
      [-0.18, -0.30],
      [-0.85, -0.34],
    ];

    detailBolts.forEach(([x, y], i) => {
      const r = i % 3 === 0 ? 0.065 : 0.048;
      addLine(
        [
          [x - r, y, 0.71],
          [x, y + r, 0.71],
          [x + r, y, 0.71],
          [x, y - r, 0.71],
          [x - r, y, 0.71],
        ],
        i % 3 === 0 ? weaponDetailBright : weaponDetailFine
      );
    });

    // Fine circuit traces across the chassis.
    for (let i = 0; i < 24; i++) {
      const x = -1.55 + (i % 8) * 0.43;
      const y = -0.12 + Math.floor(i / 8) * 0.23;

      addLine(
        [
          [x, y, 0.73],
          [x + 0.10, y, 0.73],
          [x + 0.15, y + (i % 2 ? 0.06 : -0.06), 0.73],
          [x + 0.25, y + (i % 2 ? 0.06 : -0.06), 0.73],
        ],
        i % 5 === 0 ? weaponDetailMedium : weaponDetailFine
      );
    }

    // ============================================================
    // CLEAN SILHOUETTE ACCENTS
    // ============================================================
    // A few deliberate long-form contours replace visual clutter and
    // keep the weapon looking premium, technical and readable.

    addLine(
      [[-2.05, 0.12, 0.74], [-1.48, 0.02, 0.74], [-0.86, 0.00, 0.74], [-0.28, 0.05, 0.74]],
      weaponDetailMedium
    );

    addLine(
      [[0.62, -0.08, 0.74], [1.12, -0.04, 0.74], [1.58, 0.06, 0.74]],
      weaponDetailFine
    );

    for (let i = 0; i < 5; i++) {
      const x = -1.32 + i * 0.30;
      addLine(
        [
          [x, -0.18, 0.75],
          [x + 0.12, -0.25, 0.75],
          [x + 0.24, -0.18, 0.75],
        ],
        i === 0 || i === 3 ? weaponDetailMedium : weaponDetailFine
      );
    }

    // ============================================================
    // HOLD + DRAG 3D ROTATION
    // ============================================================

    const pointer = {
      down: false,
      x: 0,
      y: 0,
      lastX: 0,
      lastY: 0,
      active: false,
    };

    const section = container.parentElement;

    let targetRotationX = weapon.rotation.x;

    let targetRotationY = weapon.rotation.y;

    let currentRotationX = weapon.rotation.x;

    let currentRotationY = weapon.rotation.y;

    let dragDistance = 0;

    function onPointerDown(event) {
      if (!section || !section.contains(event.target)) return;

      if (
        event.target.closest?.(
          'a, button, input, textarea, select, [role="button"]'
        )
      ) {
        return;
      }

      pointer.down = true;
      pointer.active = true;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      dragDistance = 0;

      document.body.style.cursor = "grabbing";
    }

    function onPointerMove(event) {
      if (!pointer.down || !pointer.active) return;

      const dx = event.clientX - pointer.lastX;
      const dy = event.clientY - pointer.lastY;

      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;

      dragDistance += Math.abs(dx) + Math.abs(dy);

      targetRotationY += dx * 0.01;
      targetRotationX += dy * 0.008;

      targetRotationX = THREE.MathUtils.clamp(targetRotationX, -1.25, 1.25);
    }

    function onPointerUp() {
      if (!pointer.down) return;

      if (dragDistance < 8) {
        fire();
      }

      pointer.down = false;
      pointer.active = false;
      document.body.style.cursor = "";
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // ============================================================
    // ANIMATION
    // ============================================================

    const clock = new THREE.Clock();

    let animationFrame;

    function animate() {
      animationFrame = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      currentRotationX += (targetRotationX - currentRotationX) * 0.14;

      currentRotationY += (targetRotationY - currentRotationY) * 0.14;

      weapon.rotation.x = currentRotationX;

      weapon.rotation.y = currentRotationY;

      weapon.position.y =
        -0.48 +
        Math.sin(time * 0.72) * 0.022;

      if (!pointer.down) {
        weapon.rotation.z = Math.sin(time * 0.55) * 0.008;
      }

      if (weapon.userData.recoil > 0) {
        weapon.position.z =
          -1.15 - weapon.userData.recoil * 0.16;

        weapon.rotation.z += weapon.userData.recoil * 0.018;

        weapon.userData.recoil *= 0.74;

        if (weapon.userData.recoil < 0.01) {
          weapon.userData.recoil = 0;
        }
      } else {
        weapon.position.z += (-1.15 - weapon.position.z) * 0.16;
      }

      barrelSegments.forEach((segment, i) => {
        segment.rotation.z = Math.sin(time * 3 + i * 0.35) * 0.035;
      });

      energyCore.rotation.z = time * 1.7;

      core.rotation.z = -time * 2.5;

      core.material.opacity = 0;

      engine.rotation.x = time * 0.35;

      engineRings.forEach((ring, i) => {
        ring.rotation.z = time * (0.4 + i * 0.08);
      });

      scope.rotation.z = Math.sin(time * 0.8) * 0.008;

      lens.material.opacity = 0;

      // Hard guarantee: no weapon surface is ever filled.
      forceOutlineOnly();

      hud1.rotation.z = time * 0.035;

      hud2.rotation.z = -time * 0.021;

      hud3.rotation.z = time * 0.012;

      particles.rotation.z = time * 0.005;

      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];

        if (p.velocity) {
          p.mesh.position.add(p.velocity);
        } else if (p.speed) {
          p.mesh.position.x += p.speed;

          if (p.drift) {
            p.mesh.position.y += p.drift;
          }
        }

        p.life--;

        if (p.life <= 0 || p.mesh.position.length() > 18) {
          scene.remove(p.mesh);

          if (p.mesh.geometry) {
            p.mesh.geometry.dispose();
          }

          projectiles.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    // ============================================================
    // RESIZE
    // ============================================================

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", onResize);

    // ============================================================
    // CLEANUP
    // ============================================================

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("pointerdown", onPointerDown);

      window.removeEventListener("pointermove", onPointerMove);

      window.removeEventListener("pointerup", onPointerUp);

      document.body.style.cursor = "";

      window.removeEventListener("resize", onResize);

      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "transparent",
        cursor: "grab",
        userSelect: "none",
        touchAction: "none",
      }}
    />
  );
}

// =========================================================
// HERO-STYLE SHINING SAMURAI HEADING — WHERE WE ARE ONLY
// =========================================================
const ShiningHeading = ({
  children,
  size = 76,
  maxWidth = 760,
  className = "",
}) => {
  const uid = useId().replace(/:/g, "");
  const fillId = `shineFill-${uid}`;
  const innerId = `shineInner-${uid}`;
  const shineId = `shineTravel-${uid}`;
  const shadowId = `shineShadow-${uid}`;

  return (
    <div className={`shining-heading-wrap ${className}`}>
      <svg
        className="shining-heading-svg"
        style={{ width: `min(${maxWidth}px, 92vw)` }}
        viewBox={`0 0 ${maxWidth} 105`}
        preserveAspectRatio="xMidYMid meet"
        role="heading"
        aria-level="2"
      >
        <defs>
          <linearGradient id={fillId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="14%" stopColor="#f1f1f1" />
            <stop offset="30%" stopColor="#c8c8c8" />
            <stop offset="46%" stopColor="#7d7d7d" />
            <stop offset="60%" stopColor="#555555" />
            <stop offset="72%" stopColor="#8f8f8f" />
            <stop offset="86%" stopColor="#d9d9d9" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          <linearGradient id={innerId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".20" />
            <stop offset="45%" stopColor="#000000" stopOpacity=".28" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity=".12" />
          </linearGradient>

          <linearGradient
            id={shineId}
            gradientUnits="userSpaceOnUse"
            x1="-300"
            y1="0"
            x2="-60"
            y2="0"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="38%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity=".92" />
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

          <filter
            id={shadowId}
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
          fontSize={size}
          fontWeight="700"
          letterSpacing="-4"
          fill={`url(#${fillId})`}
          filter={`url(#${shadowId})`}
        >
          {children}
        </text>

        <text
          x="50%"
          y="76"
          textAnchor="middle"
          fontFamily="The Last Shuriken, sans-serif"
          fontSize={size}
          fontWeight="700"
          letterSpacing="-4"
          fill={`url(#${innerId})`}
          opacity=".34"
          pointerEvents="none"
          aria-hidden="true"
        >
          {children}
        </text>

        <text
          x="50%"
          y="76"
          textAnchor="middle"
          fontFamily="The Last Shuriken, sans-serif"
          fontSize={size}
          fontWeight="700"
          letterSpacing="-4"
          fill={`url(#${shineId})`}
          opacity=".88"
          style={{ mixBlendMode: "screen" }}
          pointerEvents="none"
          aria-hidden="true"
        >
          {children}
        </text>
      </svg>
    </div>
  );
};

const ScrollSection5 = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // =========================================================
  // ===================== BACK TO TOP =======================
  // =========================================================

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // ======================= SOCIALS =========================
  // =========================================================

  const socials = [
    {
      name: "Instagram",
      logo: insw,
      description: "Follow our journey",
      href: "#",
    },
    {
      name: "Facebook",
      logo: fbw,
      description: "Join our community",
      href: "#",
    },
    {
      name: "LinkedIn",
      logo: liw,
      description: "Connect with us",
      href: "#",
    },
    {
      name: "YouTube",
      logo: ytw,
      description: "Watch our content",
      href: "#",
    },
  ];

  // =========================================================
  // ======================= APP LOGOS ========================
  // =========================================================

  const appLogos = [
    {
      image: f1,
      name: "App",
    },
    {
      image: f2,
      name: "Esports",
    },
    {
      image: f3,
      name: "Community",
    },
    {
      image: f4,
      name: "Events",
    },
    {
      image: f5,
      name: "Gaming",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="where- we-are"
      className="
        samurai-display
        relative
        min-h-[100vh]
        w-full
        overflow-hidden
        bg-[#050509]
        py-16
        sm:py-20
        md:py-24
      "
      style={{
        fontFamily: '"The Last Shuriken", sans-serif',
        borderTop: "0",
        borderBottom: "0",
      }}
    >
      {/* ========================================================= */}
      {/* ================= THREE.JS WEAPON BACKGROUND ============ */}
      {/* ========================================================= */}

      <CyberWeaponBackground />

      {/* Soft central contrast shield: keeps the weapon visible around the
          composition while giving all foreground typography a clean black
          reading zone. */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[43%]
          z-10
          h-[430px]
          w-[min(920px,94vw)]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-black/48
          blur-3xl
        "
      />

      {/* ========================================================= */}
      {/* ================= MAIN CONTENT ========================== */}
      {/* ========================================================= */}

      <div
        className="
          relative
          z-30
          mx-auto
          flex
          w-full
          max-w-6xl
          flex-col
          items-center
          px-5
        "
      >
        {/* ======================================================= */}
        {/* ===================== HEADING ========================= */}
        {/* ======================================================= */}

        <div
          className={`
            flex
            flex-col
            items-center
            text-center
            transform-gpu
            transition-all
            duration-[1000ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              visible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-20 scale-75 opacity-0"
            }
          `}
          style={{
            transitionDelay: visible ? "100ms" : "0ms",
          }}
        >
          <ShiningHeading maxWidth={760} size={76}>
          CONNECT WITH US
          </ShiningHeading>

          <p
            className="
              mt-4
              max-w-xl
              text-xs
              font-medium
              uppercase
              tracking-[0.12em]
              text-white/90
              drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]
              sm:text-sm
            "
          >
            CONNECT WITH NIT SILCHAR ESPORTS CLUB
          </p>

          {/* ================= HEADING DIVIDER ================= */}

          <div
            className={`
              mt-6
              flex
              items-center
              justify-center
              gap-3
              transform-gpu
              transition-all
              duration-700
              ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }
            `}
            style={{
              transitionDelay: visible ? "450ms" : "0ms",
            }}
          >
            <div
              className="
                h-[1px]
                w-14
                bg-gradient-to-r
                from-transparent
                via-[#ffffff]
                to-[#bdbdbd]
                shadow-[0_0_8px_rgba(255,255,255,0.45)]
                sm:w-24
                md:w-32
              "
            />

            <div
              className="
                h-[7px]
                w-[7px]
                shrink-0
                rounded-full
                bg-white
                shadow-[0_0_8px_rgba(255,255,255,1),0_0_16px_rgba(255,255,255,0.6)]
              "
            />

            <div
              className="
                h-[1px]
                w-14
                bg-gradient-to-l
                from-transparent
                via-[#9a9a9a]
                to-[#ffffff]
                shadow-[0_0_8px_rgba(255,255,255,0.45)]
                sm:w-24
                md:w-32
              "
            />
          </div>
        </div>

        {/* ======================================================= */}
        {/* =================== SOCIAL SECTION =================== */}
        {/* ======================================================= */}

        <div
          className="
            mt-12
            grid
            w-full
            grid-cols-2
            gap-3
            sm:mt-14
            sm:grid-cols-4
            sm:gap-4
            md:max-w-5xl
          "
        >
          {socials.map((social, index) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className={`
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.16]
                bg-white/[0.075]
                px-4
                py-5
                shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_rgba(0,0,0,0.18)]
                transform-gpu
                transition-all
                duration-[900ms]
                ease-[cubic-bezier(0.16,1,0.3,1)]
                hover:-translate-y-2
                hover:border-[#bdbdbd]/70
                hover:bg-[#0c0c0c]/90
                hover:shadow-[0_0_30px_rgba(255,255,255,0.10)]
                ${
                  visible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-20 scale-75 opacity-0"
                }
              `}
              style={{
                transitionDelay: visible
                  ? `${600 + index * 120}ms`
                  : "0ms",
              }}
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  rounded-2xl
                  bg-gradient-to-br
                  from-white/[0.10]
                  via-transparent
                  to-white/[0.04]
                  opacity-80
                "
              />

              <div
                className="
                  absolute
                  -right-10
                  -top-10
                  h-24
                  w-24
                  rounded-full
                  bg-white/10
                  transition-all
                  duration-500
                  group-hover:bg-white/20
                "
              />

              <div
                className="
                  relative
                  z-10
                  mx-auto
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.16]
                  bg-white/[0.055]
                  p-2.5
                  shadow-[0_0_15px_rgba(255,255,255,0.10)]
                  transition-all
                  duration-500
                  group-hover:scale-110
                  group-hover:border-white/50
                  group-hover:bg-white/[0.08]
                  group-hover:shadow-[0_0_20px_rgba(255,255,255,0.16)]
                "
              >
                <img
                  src={social.logo}
                  alt={`${social.name} logo`}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="relative z-10 mt-3 text-center">
                <h3 className="text-sm font-bold text-white">
                  {social.name}
                </h3>

                <p
                  className="
                    mt-1
                    text-[9px]
                    uppercase
                    tracking-[0.08em]
                    text-white/45
                  "
                >
                  {social.description}
                </p>
              </div>

              <div
                className="
                  absolute
                  bottom-0
                  left-1/2
                  h-[1px]
                  w-0
                  -translate-x-1/2
                  bg-gradient-to-r
                  from-[#777777]
                  via-[#ffffff]
                  to-[#d0d0d0]
                  shadow-[0_0_8px_#ffffff]
                  transition-all
                  duration-500
                  group-hover:w-3/4
                "
              />
            </a>
          ))}
        </div>

        {/* ======================================================= */}
        {/* ===================== APP SECTION ==================== */}
        {/* ======================================================= */}

        <div
          className={`
            mt-16
            w-full
            transform-gpu
            transition-all
            duration-[1000ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              visible
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }
          `}
          style={{
            transitionDelay: visible ? "1050ms" : "0ms",
          }}
        >
          <div className="flex flex-col items-center text-center">
            <span
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-[#bdbdbd]
              "
            >
              EVERYTHING IN ONE PLACE
            </span>

            <div className="app-heading-wrap mt-2">
              <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white sm:text-3xl">
                Our App
              </h2>
            </div>

            <p
              className="
                relative
                z-20
                mt-2
                max-w-lg
                text-xs
                leading-relaxed
                text-white/50
                sm:text-sm
              "
            >
              Stay connected with tournaments, events, teams and
              everything happening at NIT Silchar Esports Club.
            </p>
          </div>

          <div
            className="
              mx-auto
              mt-7
              flex
              max-w-3xl
              flex-wrap
              items-center
              justify-center
              gap-3
              sm:gap-5
            "
          >
            {appLogos.map((app, index) => (
              <div
                key={index}
                className="
                  group
                  relative
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.16]
                  bg-white/[0.075]
                  p-3
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_35px_rgba(0,0,0,0.20)]
                  transform-gpu
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:scale-105
                  hover:border-[#ffffff]/60
                  hover:shadow-[0_0_25px_rgba(255,255,255,0.12)]
                  sm:h-20
                  sm:w-20
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-[1px]
                    rounded-2xl
                    border
                    border-white/[0.06]
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.16),rgba(255,255,255,0.06)_35%,transparent_70%)]
                    opacity-0
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                  "
                />

                <img
                  src={app.image}
                  alt={app.name}
                  className="
                    relative
                    z-10
                    h-full
                    w-full
                    object-contain
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                />
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================= */}
        {/* ================= QUICK ACCESS FOOTER ================= */}
        {/* ======================================================= */}

        <footer
          className={`
            mt-28
            w-full
            border-t-0
            border-white/[0]
            pt-10
            pb-6
            transform-gpu
            transition-all
            duration-[1000ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              visible
                ? "translate-y-0 opacity-100"
                : "translate-y-16 opacity-0"
            }
          `}
          style={{
            transitionDelay: visible ? "1350ms" : "0ms",
          }}
        >
          <div className="w-full">
            <div
              className="
                grid
                grid-cols-1
                gap-10
                sm:grid-cols-2
                lg:grid-cols-4
                lg:gap-12
              "
            >
              {/* ================= NIT SILCHAR ================= */}

              <div className="lg:pr-8">
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-white/[0.16]
                      bg-white/[0.07]
                      shadow-[0_0_25px_rgba(255,255,255,0.06)]
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-7 w-7 text-[#d0d0d0]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 8h10a4 4 0 0 1 3.8 5.2l-1.2 4A2.5 2.5 0 0 1 17.2 19h-.4a2.5 2.5 0 0 1-2-1l-1.3-1.7h-3L9.2 18a2.5 2.5 0 0 1-2 1h-.4a2.5 2.5 0 0 1-2.4-1.8l-1.2-4A4 4 0 0 1 7 8Z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12v3M6.5 13.5h3"
                      />

                      <circle cx="16.5" cy="12.5" r=".8" />

                      <circle cx="18.5" cy="14.5" r=".8" />
                    </svg>
                  </div>

                  <div className="footer-brand-heading flex min-h-[52px] items-start">
                    <h2 className="m-0 text-xl font-bold uppercase leading-none tracking-[0.06em] text-white sm:text-2xl">
                      NIT SILCHAR
                    </h2>
                  </div>
                </div>

                <p
                  className="
                    max-w-[330px]
                    text-sm
                    leading-6
                    text-white/50
                    sm:text-[15px]
                  "
                >
                  Official Esports Club of NIT Silchar.
                  Join the competition.
                </p>
              </div>

              {/* ================= QUICK LINKS ================= */}

              <div>
                <div className="footer-column-heading flex min-h-[36px] items-start">
                  <h3 className="m-0 text-lg font-bold uppercase leading-none tracking-[0.06em] text-white">
                    Quick Links
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  <a
                    href="#home"
                    className="
                      group
                      w-fit
                      text-sm
                      text-white/50
                      transition-all
                      duration-300
                      hover:translate-x-1
                      hover:text-white
                      sm:text-[15px]
                    "
                  >
                    <span className="transition-colors duration-300 group-hover:text-[#ffffff]">
                      Home
                    </span>
                  </a>

                  <a
                    href="#events"
                    className="
                      group
                      w-fit
                      text-sm
                      text-white/50
                      transition-all
                      duration-300
                      hover:translate-x-1
                      hover:text-white
                      sm:text-[15px]
                    "
                  >
                    <span className="transition-colors duration-300 group-hover:text-[#ffffff]">
                      Events
                    </span>
                  </a>
                </div>
              </div>

              {/* ================= COMMUNITY =================== */}

              <div>
                <div className="footer-column-heading flex min-h-[36px] items-start">
                  <h3 className="m-0 text-lg font-bold uppercase leading-none tracking-[0.06em] text-white">
                    Community
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  <a
                    href="#team"
                    className="
                      group
                      w-fit
                      text-sm
                      text-white/50
                      transition-all
                      duration-300
                      hover:translate-x-1
                      hover:text-white
                      sm:text-[15px]
                    "
                  >
                    <span className="transition-colors duration-300 group-hover:text-[#c8c8c8]">
                      Team
                    </span>
                  </a>

                  <a
                    href="#about"
                    className="
                      group
                      w-fit
                      text-sm
                      text-white/50
                      transition-all
                      duration-300
                      hover:translate-x-1
                      hover:text-white
                      sm:text-[15px]
                    "
                  >
                    <span className="transition-colors duration-300 group-hover:text-[#c8c8c8]">
                      About Us
                    </span>
                  </a>
                </div>
              </div>

              {/* ================= CONTACT ===================== */}

              <div>
                <div className="footer-column-heading flex min-h-[36px] items-start">
                  <h3 className="m-0 text-lg font-bold uppercase leading-none tracking-[0.06em] text-white">
                    Contact
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  {/* LOCATION */}

                  <div className="flex items-start gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="
                        mt-0.5
                        h-5
                        w-5
                        shrink-0
                        text-[#d0d0d0]
                      "
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"
                      />

                      <circle cx="12" cy="9" r="2.3" />
                    </svg>

                    <span
                      className="
                        text-sm
                        leading-6
                        text-white/50
                        sm:text-[15px]
                      "
                    >
                      NIT Silchar, Assam
                    </span>
                  </div>

                  {/* EMAIL */}

                  <a
                    href="mailto:esports.nits@gmail.com"
                    className="
                      group
                      flex
                      items-center
                      gap-3
                      text-sm
                      text-white/50
                      transition-colors
                      duration-300
                      hover:text-white
                      sm:text-[15px]
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="
                        h-5
                        w-5
                        shrink-0
                        text-[#d0d0d0]
                        transition-colors
                        duration-300
                        group-hover:text-[#c8c8c8]
                      "
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4 7 8 6 8-6"
                      />
                    </svg>

                    esports.nits@gmail.com
                  </a>

                  {/* PHONE NUMBERS */}

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-x-5
                      gap-y-3
                    "
                  >
                    <a
                      href="tel:+918434307257"
                      className="
                        group
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-white/50
                        transition-colors
                        duration-300
                        hover:text-white
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="
                          h-5
                          w-5
                          shrink-0
                          text-[#d0d0d0]
                        "
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 4h3l2 5-2 2a15 15 0 0 0 5 5l2-2 5 2v3a2 2 0 0 1-2 2C10.8 21 3 13.2 3 6a2 2 0 0 1 2-2Z"
                        />
                      </svg>

                      +91 84343 07257
                    </a>

                    <a
                      href="tel:+918252445506"
                      className="
                        group
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-white/50
                        transition-colors
                        duration-300
                        hover:text-white
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="
                          h-5
                          w-5
                          shrink-0
                          text-[#d0d0d0]
                        "
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 4h3l2 5-2 2a15 15 0 0 0 5 5l2-2 5 2v3a2 2 0 0 1-2 2C10.8 21 3 13.2 3 6a2 2 0 0 1 2-2Z"
                        />
                      </svg>

                      +91 82524 45506
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================== */}
            {/* ================= FOOTER BOTTOM ================== */}
            {/* =================================================== */}

            <div
              className="
                mt-12
                flex
                flex-col
                items-center
                justify-between
                gap-4
                border-t-0
                border-white/[0]
                pt-6
                text-center
                sm:flex-row
                sm:text-left
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.12em]
                  text-white/35
                  sm:text-xs
                "
              >
                © {new Date().getFullYear()} NIT Silchar Esports Club
              </p>

              <button
                type="button"
                onClick={scrollToTop}
                className="
                  group
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-white/45
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:text-white
                  sm:text-xs
                "
              >
                Back to top
                <span
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/[0.14]
                    bg-white/[0.05]
                    transition-all
                    duration-300
                    group-hover:border-white/40
                    group-hover:bg-white/[0.10]
                  "
                >
                  ↑
                </span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default ScrollSection5;
