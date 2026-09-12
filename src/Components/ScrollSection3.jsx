import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import klogo from "../assets/klogo.png";

const ScrollSection3 = () => {
  const sectionRef = useRef(null);
  const eyeMountRef = useRef(null);
  const [visible, setVisible] = useState(false);

  // ============================================================
  // INTERSECTION OBSERVER
  // ============================================================
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.05,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // ============================================================
  // THREE.JS CYBER EYE
  // ============================================================
  useEffect(() => {
    const container = eyeMountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      38,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    // ============================================================
    // MASTER GROUP
    // ============================================================

    const master = new THREE.Group();
    scene.add(master);

    // ============================================================
    // HIGH DETAIL OUTLINE-ONLY CYBER EYE
    // ============================================================
    // The eye itself is NOT a circle/ellipse and has NO fill.
    // Everything here is linework only: sharp almond silhouette,
    // layered eyelid contours, technical breaks and corner details.
    // Existing HUD / scan / mouse movement remains untouched.

    const eyeGroup = new THREE.Group();
    master.add(eyeGroup);

    const eyeLineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });

    const eyeFineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    });

    const eyeAccentMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    });

    const makeLine = (points, material, closed = false) => {
      const geometry =
        new THREE.BufferGeometry().setFromPoints(points);

      const line = closed
        ? new THREE.LineLoop(geometry, material)
        : new THREE.Line(geometry, material);

      eyeGroup.add(line);
      return line;
    };

    const makeCurve = (
      points,
      material,
      closed = false
    ) => {
      const curve =
        new THREE.CatmullRomCurve3(
          points,
          closed,
          "centripetal",
          0.35
        );

      const geometry =
        new THREE.BufferGeometry().setFromPoints(
          curve.getPoints(180)
        );

      const line = closed
        ? new THREE.LineLoop(
            geometry,
            material
          )
        : new THREE.Line(
            geometry,
            material
          );

      eyeGroup.add(line);
      return line;
    };

    // ------------------------------------------------------------
    // MAIN ALMOND / EYE SILHOUETTE
    // ------------------------------------------------------------

    const eyeShape = [
      new THREE.Vector3(-4.25, 0, 0.08),
      new THREE.Vector3(-3.55, 0.34, 0.08),
      new THREE.Vector3(-2.65, 0.78, 0.08),
      new THREE.Vector3(-1.55, 1.16, 0.08),
      new THREE.Vector3(-0.55, 1.38, 0.08),
      new THREE.Vector3(0.0, 1.43, 0.08),
      new THREE.Vector3(0.55, 1.38, 0.08),
      new THREE.Vector3(1.55, 1.16, 0.08),
      new THREE.Vector3(2.65, 0.78, 0.08),
      new THREE.Vector3(3.55, 0.34, 0.08),
      new THREE.Vector3(4.25, 0, 0.08),
      new THREE.Vector3(3.55, -0.34, 0.08),
      new THREE.Vector3(2.65, -0.78, 0.08),
      new THREE.Vector3(1.55, -1.16, 0.08),
      new THREE.Vector3(0.55, -1.38, 0.08),
      new THREE.Vector3(0.0, -1.43, 0.08),
      new THREE.Vector3(-0.55, -1.38, 0.08),
      new THREE.Vector3(-1.55, -1.16, 0.08),
      new THREE.Vector3(-2.65, -0.78, 0.08),
      new THREE.Vector3(-3.55, -0.34, 0.08),
    ];

    const eye = makeCurve(
      eyeShape,
      eyeLineMaterial,
      true
    );

    // ------------------------------------------------------------
    // ULTRA-DETAILED IRIS + MOVING PUPIL — LINEWORK ONLY
    // ------------------------------------------------------------
    // Nothing is filled. The iris is constructed from multiple
    // technical rings, broken arcs, radial fibers, ticks and
    // targeting geometry. The pupil has its own group so it can
    // visibly track the mouse independently.

    const irisGroup = new THREE.Group();
    master.add(irisGroup);

    const pupilGroup = new THREE.Group();
    irisGroup.add(pupilGroup);

    const irisRingMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.76,
      depthWrite: false,
    });

    const irisFineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    });

    const irisAccentMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
    });

    const pupilMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });

    const makeEllipseLine = (
      radiusX,
      radiusY,
      material,
      segments = 160,
      z = 0.14,
      target = irisGroup
    ) => {
      const curve = new THREE.EllipseCurve(
        0,
        0,
        radiusX,
        radiusY,
        0,
        Math.PI * 2,
        false,
        0
      );

      const geometry =
        new THREE.BufferGeometry().setFromPoints(
          curve.getPoints(segments).map(
            (p) =>
              new THREE.Vector3(
                p.x,
                p.y,
                z
              )
          )
        );

      const line = new THREE.LineLoop(
        geometry,
        material
      );

      target.add(line);
      return line;
    };

    const makeIrisLine = (
      points,
      material,
      target = irisGroup
    ) => {
      const geometry =
        new THREE.BufferGeometry().setFromPoints(
          points
        );

      const line = new THREE.Line(
        geometry,
        material
      );

      target.add(line);
      return line;
    };

    // ------------------------------------------------------------
    // IRIS CORE RINGS
    // ------------------------------------------------------------

    makeEllipseLine(
      1.10,
      1.03,
      irisRingMaterial
    );

    makeEllipseLine(
      0.99,
      0.93,
      irisAccentMaterial
    );

    makeEllipseLine(
      0.86,
      0.81,
      irisRingMaterial
    );

    makeEllipseLine(
      0.70,
      0.66,
      irisFineMaterial
    );

    makeEllipseLine(
      0.54,
      0.51,
      irisFineMaterial
    );

    // ------------------------------------------------------------
    // BROKEN ORBITAL IRIS ARCS
    // ------------------------------------------------------------

    const irisArcs = new THREE.Group();
    irisGroup.add(irisArcs);

    for (let i = 0; i < 18; i++) {
      const start =
        (i / 18) * Math.PI * 2 +
        (i % 2) * 0.045;

      const arcLength =
        0.20 +
        (i % 4) * 0.075;

      const arc =
        new THREE.EllipseCurve(
          0,
          0,
          0.91,
          0.85,
          start,
          start + arcLength,
          false,
          0
        );

      const geometry =
        new THREE.BufferGeometry().setFromPoints(
          arc.getPoints(34).map(
            (p) =>
              new THREE.Vector3(
                p.x,
                p.y,
                0.17
              )
          )
        );

      irisArcs.add(
        new THREE.Line(
          geometry,
          i % 5 === 0
            ? irisAccentMaterial
            : irisFineMaterial
        )
      );
    }

    // ------------------------------------------------------------
    // DENSE RADIAL IRIS FIBERS
    // ------------------------------------------------------------

    const radialIris = new THREE.Group();
    irisGroup.add(radialIris);

    for (let i = 0; i < 64; i++) {
      const angle =
        (i / 64) * Math.PI * 2;

      const innerR =
        0.34 +
        (i % 4) * 0.018;

      const outerR =
        0.70 +
        (i % 7) * 0.042;

      const bend =
        Math.sin(i * 2.17) * 0.045;

      const x1 =
        Math.cos(angle) * innerR;

      const y1 =
        Math.sin(angle) *
        innerR *
        0.94;

      const x2 =
        Math.cos(angle + bend) *
        outerR;

      const y2 =
        Math.sin(angle + bend) *
        outerR *
        0.94;

      radialIris.add(
        makeIrisLine(
          [
            new THREE.Vector3(
              x1,
              y1,
              0.16
            ),
            new THREE.Vector3(
              (x1 + x2) * 0.5,
              (y1 + y2) * 0.5 +
                Math.sin(i * 1.73) * 0.035,
              0.16
            ),
            new THREE.Vector3(
              x2,
              y2,
              0.16
            ),
          ],
          i % 8 === 0
            ? irisAccentMaterial
            : irisFineMaterial,
          radialIris
        )
      );
    }

    // ------------------------------------------------------------
    // IRIS PERIMETER TICKS + MAJOR TARGET MARKERS
    // ------------------------------------------------------------

    const irisTicks = new THREE.Group();
    irisGroup.add(irisTicks);

    for (let i = 0; i < 72; i++) {
      const angle =
        (i / 72) *
        Math.PI *
        2;

      const major =
        i % 6 === 0;

      const r1 =
        major ? 0.99 : 1.035;

      const r2 =
        major ? 1.15 : 1.085;

      irisTicks.add(
        makeIrisLine(
          [
            new THREE.Vector3(
              Math.cos(angle) * r1,
              Math.sin(angle) *
                r1 *
                0.94,
              0.18
            ),
            new THREE.Vector3(
              Math.cos(angle) * r2,
              Math.sin(angle) *
                r2 *
                0.94,
              0.18
            ),
          ],
          major
            ? irisAccentMaterial
            : irisFineMaterial,
          irisTicks
        )
      );
    }

    // ------------------------------------------------------------
    // INNER RADIAL TARGETING CROSS + CARDINAL MARKERS
    // ------------------------------------------------------------

    const irisCross = new THREE.Group();
    irisGroup.add(irisCross);

    makeIrisLine(
      [
        new THREE.Vector3(
          -1.22,
          0,
          0.185
        ),
        new THREE.Vector3(
          1.22,
          0,
          0.185
        ),
      ],
      irisFineMaterial,
      irisCross
    );

    makeIrisLine(
      [
        new THREE.Vector3(
          0,
          -1.08,
          0.185
        ),
        new THREE.Vector3(
          0,
          1.08,
          0.185
        ),
      ],
      irisFineMaterial,
      irisCross
    );

    for (let i = 0; i < 8; i++) {
      const angle =
        (i / 8) *
        Math.PI *
        2;

      const r = 1.23;

      const x =
        Math.cos(angle) * r;

      const y =
        Math.sin(angle) * r * 0.94;

      const size =
        i % 2 === 0
          ? 0.105
          : 0.07;

      makeIrisLine(
        [
          new THREE.Vector3(
            x - Math.sin(angle) * size,
            y + Math.cos(angle) * size,
            0.19
          ),
          new THREE.Vector3(
            x + Math.sin(angle) * size,
            y - Math.cos(angle) * size,
            0.19
          ),
        ],
        irisAccentMaterial,
        irisCross
      );
    }

    // ------------------------------------------------------------
    // PUPIL / IRIS CORE — FIXED, CENTERED + HIGH DETAIL
    // ------------------------------------------------------------
    // The pupil stays locked to the exact iris center. No independent
    // mouse travel, so the white core can never drift away from the eye.
    // A white filled core + dark inner pupil gives the eye a much cleaner
    // and more readable cyber-eye appearance.

    const pupilCoreGeometry =
      new THREE.CircleGeometry(
        0.205,
        128
      );

    const pupilCoreMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

    const pupilCore =
      new THREE.Mesh(
        pupilCoreGeometry,
        pupilCoreMaterial
      );

    pupilCore.scale.y = 0.90;
    pupilCore.position.set(0, 0, 0.255);

    pupilGroup.add(pupilCore);

    // Clean dark separation ring around the white center.
    const pupilBorderGeometry =
      new THREE.RingGeometry(
        0.215,
        0.255,
        128
      );

    const pupilBorderMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x050505,
        transparent: true,
        opacity: 0.96,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

    const pupilBorder =
      new THREE.Mesh(
        pupilBorderGeometry,
        pupilBorderMaterial
      );

    pupilBorder.scale.y = 0.90;
    pupilBorder.position.set(0, 0, 0.245);

    pupilGroup.add(pupilBorder);

    // Small black inner pupil — fixed exactly at center.
    const innerPupilGeometry =
      new THREE.CircleGeometry(
        0.072,
        96
      );

    const innerPupilMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

    const innerPupil =
      new THREE.Mesh(
        innerPupilGeometry,
        innerPupilMaterial
      );

    innerPupil.scale.y = 0.88;
    innerPupil.position.set(0, 0, 0.275);

    pupilGroup.add(innerPupil);

    // Fine concentric targeting rings.
    makeEllipseLine(
      0.31,
      0.278,
      pupilMaterial,
      160,
      0.285,
      pupilGroup
    );

    makeEllipseLine(
      0.405,
      0.365,
      irisFineMaterial,
      160,
      0.265,
      pupilGroup
    );

    // Eight tiny fixed radial locator marks around the core.
    for (let i = 0; i < 8; i++) {
      const angle =
        (i / 8) * Math.PI * 2;

      const r1 = 0.335;
      const r2 = i % 2 === 0 ? 0.405 : 0.385;

      makeIrisLine(
        [
          new THREE.Vector3(
            Math.cos(angle) * r1,
            Math.sin(angle) * r1 * 0.90,
            0.29
          ),
          new THREE.Vector3(
            Math.cos(angle) * r2,
            Math.sin(angle) * r2 * 0.90,
            0.29
          ),
        ],
        i % 2 === 0
          ? irisAccentMaterial
          : irisFineMaterial,
        pupilGroup
      );
    }

    // Four crisp cardinal brackets make the center read as a
    // deliberate optical sensor instead of a floating circle.
    const centerBrackets = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    centerBrackets.forEach(([dx, dy]) => {
      const horizontal = dx !== 0;

      const x1 =
        dx * (horizontal ? 0.43 : 0.0);
      const y1 =
        dy * (horizontal ? 0.0 : 0.43);

      const x2 =
        dx * (horizontal ? 0.52 : 0.0);
      const y2 =
        dy * (horizontal ? 0.0 : 0.52);

      makeIrisLine(
        [
          new THREE.Vector3(x1, y1, 0.29),
          new THREE.Vector3(x2, y2, 0.29),
        ],
        irisAccentMaterial,
        pupilGroup
      );
    });

    // ------------------------------------------------------------
    // IRIS / PUPIL ANIMATION GROUPS
    // ------------------------------------------------------------

    const irisSpinGroup =
      new THREE.Group();

    master.add(irisSpinGroup);
    irisSpinGroup.add(irisGroup);


    // ------------------------------------------------------------
    // SECONDARY PARALLEL EYELID CONTOURS
    // ------------------------------------------------------------

    const upperContour = [
      new THREE.Vector3(-3.95, 0.08, 0.075),
      new THREE.Vector3(-3.20, 0.43, 0.075),
      new THREE.Vector3(-2.25, 0.86, 0.075),
      new THREE.Vector3(-1.30, 1.12, 0.075),
      new THREE.Vector3(-0.42, 1.27, 0.075),
      new THREE.Vector3(0.42, 1.27, 0.075),
      new THREE.Vector3(1.30, 1.12, 0.075),
      new THREE.Vector3(2.25, 0.86, 0.075),
      new THREE.Vector3(3.20, 0.43, 0.075),
      new THREE.Vector3(3.95, 0.08, 0.075),
    ];

    makeCurve(
      upperContour,
      eyeAccentMaterial,
      false
    );

    const lowerContour = [
      new THREE.Vector3(-3.95, -0.08, 0.075),
      new THREE.Vector3(-3.20, -0.43, 0.075),
      new THREE.Vector3(-2.25, -0.86, 0.075),
      new THREE.Vector3(-1.30, -1.12, 0.075),
      new THREE.Vector3(-0.42, -1.27, 0.075),
      new THREE.Vector3(0.42, -1.27, 0.075),
      new THREE.Vector3(1.30, -1.12, 0.075),
      new THREE.Vector3(2.25, -0.86, 0.075),
      new THREE.Vector3(3.20, -0.43, 0.075),
      new THREE.Vector3(3.95, -0.08, 0.075),
    ];

    makeCurve(
      lowerContour,
      eyeAccentMaterial,
      false
    );

    // ------------------------------------------------------------
    // OUTER LID TECHNICAL CONTOURS
    // ------------------------------------------------------------

    const upperTech = [
      new THREE.Vector3(-4.45, 0.08, 0.06),
      new THREE.Vector3(-3.75, 0.58, 0.06),
      new THREE.Vector3(-2.70, 1.02, 0.06),
      new THREE.Vector3(-1.55, 1.38, 0.06),
      new THREE.Vector3(-0.55, 1.58, 0.06),
      new THREE.Vector3(0.55, 1.58, 0.06),
      new THREE.Vector3(1.55, 1.38, 0.06),
      new THREE.Vector3(2.70, 1.02, 0.06),
      new THREE.Vector3(3.75, 0.58, 0.06),
      new THREE.Vector3(4.45, 0.08, 0.06),
    ];

    makeCurve(
      upperTech,
      eyeFineMaterial,
      false
    );

    const lowerTech = [
      new THREE.Vector3(-4.45, -0.08, 0.06),
      new THREE.Vector3(-3.75, -0.58, 0.06),
      new THREE.Vector3(-2.70, -1.02, 0.06),
      new THREE.Vector3(-1.55, -1.38, 0.06),
      new THREE.Vector3(-0.55, -1.58, 0.06),
      new THREE.Vector3(0.55, -1.58, 0.06),
      new THREE.Vector3(1.55, -1.38, 0.06),
      new THREE.Vector3(2.70, -1.02, 0.06),
      new THREE.Vector3(3.75, -0.58, 0.06),
      new THREE.Vector3(4.45, -0.08, 0.06),
    ];

    makeCurve(
      lowerTech,
      eyeFineMaterial,
      false
    );

    // ------------------------------------------------------------
    // SHARP CORNER / CANthus GEOMETRY
    // ------------------------------------------------------------

    const cornerPairs = [
      {
        side: -1,
        x: -4.25,
      },
      {
        side: 1,
        x: 4.25,
      },
    ];

    cornerPairs.forEach(({ side, x }) => {
      const innerX = x - side * 0.38;
      const outerX = x + side * 0.68;

      makeLine(
        [
          new THREE.Vector3(
            x,
            0,
            0.10
          ),
          new THREE.Vector3(
            innerX,
            0.26,
            0.10
          ),
          new THREE.Vector3(
            outerX,
            0.40,
            0.10
          ),
        ],
        eyeAccentMaterial
      );

      makeLine(
        [
          new THREE.Vector3(
            x,
            0,
            0.10
          ),
          new THREE.Vector3(
            innerX,
            -0.26,
            0.10
          ),
          new THREE.Vector3(
            outerX,
            -0.40,
            0.10
          ),
        ],
        eyeAccentMaterial
      );

      makeLine(
        [
          new THREE.Vector3(
            outerX,
            0.40,
            0.10
          ),
          new THREE.Vector3(
            outerX + side * 0.28,
            0.40,
            0.10
          ),
        ],
        eyeFineMaterial
      );

      makeLine(
        [
          new THREE.Vector3(
            outerX,
            -0.40,
            0.10
          ),
          new THREE.Vector3(
            outerX + side * 0.28,
            -0.40,
            0.10
          ),
        ],
        eyeFineMaterial
      );
    });

    // ------------------------------------------------------------
    // BROKEN / SEGMENTED TECHNICAL BORDER DETAILS
    // ------------------------------------------------------------

    const techSegments = [
      [-3.82, 0.47, -3.38, 0.69],
      [-3.12, 0.82, -2.65, 1.00],
      [-2.15, 1.12, -1.65, 1.27],
      [-1.12, 1.38, -0.66, 1.47],
      [0.66, 1.47, 1.12, 1.38],
      [1.65, 1.27, 2.15, 1.12],
      [2.65, 1.00, 3.12, 0.82],
      [3.38, 0.69, 3.82, 0.47],

      [-3.82, -0.47, -3.38, -0.69],
      [-3.12, -0.82, -2.65, -1.00],
      [-2.15, -1.12, -1.65, -1.27],
      [-1.12, -1.38, -0.66, -1.47],
      [0.66, -1.47, 1.12, -1.38],
      [1.65, -1.27, 2.15, -1.12],
      [2.65, -1.00, 3.12, -0.82],
      [3.38, -0.69, 3.82, -0.47],
    ];

    techSegments.forEach(
      ([x1, y1, x2, y2], index) => {
        const lift =
          index % 2 === 0
            ? 0.035
            : -0.035;

        makeLine(
          [
            new THREE.Vector3(
              x1,
              y1 + lift,
              0.12
            ),
            new THREE.Vector3(
              x2,
              y2 + lift,
              0.12
            ),
          ],
          eyeFineMaterial
        );
      }
    );

    // ============================================================
    // OUTER HUD
    // ============================================================

    const hud = new THREE.Group();

    master.add(hud);

    function hudRing(
      radius,
      opacity,
      scaleY = 1
    ) {
      const mesh =
        new THREE.Mesh(
          new THREE.RingGeometry(
            radius - 0.009,
            radius,
            256
          ),
          new THREE.MeshBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity,
            side: THREE.DoubleSide,
          })
        );

      mesh.scale.y = scaleY;

      hud.add(mesh);

      return mesh;
    }

    const hud1 =
      hudRing(
        2.72,
        0.11
      );

    const hud2 =
      hudRing(
        2.90,
        0.065
      );

    const hud3 =
      hudRing(
        3.12,
        0.038,
        0.56
      );

    // ============================================================
    // OUTER TECHNICAL TICKS
    // ============================================================

    const ticks = new THREE.Group();

    hud.add(ticks);

    for (let i = 0; i < 96; i++) {
      const angle =
        (i / 96) *
        Math.PI *
        2;

      const major =
        i % 8 === 0;

      const r1 = 2.75;

      const r2 =
        r1 +
        (major ? 0.20 : 0.06);

      const geometry =
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(
            Math.cos(angle) * r1,
            Math.sin(angle) * r1,
            0.04
          ),
          new THREE.Vector3(
            Math.cos(angle) * r2,
            Math.sin(angle) * r2,
            0.04
          ),
        ]);

      ticks.add(
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color:
              major
                ? 0xaaaaaa
                : 0x4d4d4d,
            transparent: true,
            opacity:
              major
                ? 0.42
                : 0.10,
          })
        )
      );
    }

    // ============================================================
    // SCANNING ARCS
    // ============================================================

    const scanArcs =
      new THREE.Group();

    master.add(scanArcs);

    for (let i = 0; i < 14; i++) {
      const radiusX =
        2.75 +
        i * 0.05;

      const radiusY =
        1.25 +
        i * 0.018;

      const start =
        Math.random() *
        Math.PI *
        2;

      const curve =
        new THREE.EllipseCurve(
          0,
          0,
          radiusX,
          radiusY,
          start,
          start +
            0.25 +
            Math.random() * 0.55,
          false,
          0
        );

      const geometry =
        new THREE.BufferGeometry().setFromPoints(
          curve.getPoints(80)
        );

      scanArcs.add(
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: 0x777777,
            transparent: true,
            opacity:
              0.035 +
              Math.random() * 0.10,
          })
        )
      );
    }

    // ============================================================
    // DARK PARTICLE FIELD
    // ============================================================

    const particleCount = 1600;

    const positions =
      new Float32Array(
        particleCount * 3
      );

    for (
      let i = 0;
      i < particleCount;
      i++
    ) {
      const angle =
        Math.random() *
        Math.PI *
        2;

      const radius =
        3.0 +
        Math.random() * 5.5;

      positions[i * 3] =
        Math.cos(angle) *
        radius;

      positions[
        i * 3 + 1
      ] =
        Math.sin(angle) *
        radius *
        0.5;

      positions[
        i * 3 + 2
      ] =
        (Math.random() - 0.5) *
        4;
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

    const particles =
      new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
          color: 0x666666,
          size: 0.014,
          transparent: true,
          opacity: 0.23,
        })
      );

    master.add(particles);

    // ============================================================
    // SCAN LINE
    // ============================================================

    const scanLine =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          6,
          0.008
        ),
        new THREE.MeshBasicMaterial({
          color: 0xaaaaaa,
          transparent: true,
          opacity: 0.15,
        })
      );

    scanLine.position.z = 2.1;

    master.add(scanLine);

    // ============================================================
    // EXTRA HORIZONTAL TECH LINES
    // ============================================================

    const techLines = new THREE.Group();

    master.add(techLines);

    for (let i = 0; i < 9; i++) {
      const width =
        3.2 +
        Math.random() * 2.8;

      const y =
        (Math.random() - 0.5) *
        3.0;

      const geometry =
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(
            -width,
            y,
            -0.02
          ),
          new THREE.Vector3(
            width,
            y,
            -0.02
          ),
        ]);

      const line =
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: 0x555555,
            transparent: true,
            opacity:
              0.025 +
              Math.random() * 0.045,
          })
        );

      techLines.add(line);
    }

    // ============================================================
    // MOUSE TRACKING
    // ============================================================

    const mouse =
      new THREE.Vector2();

    function onMouseMove(event) {
      mouse.x =
        (event.clientX /
          window.innerWidth) *
          2 -
        1;

      mouse.y =
        -(event.clientY /
          window.innerHeight) *
          2 +
        1;
    }

    window.addEventListener(
      "mousemove",
      onMouseMove
    );

    // ============================================================
    // ANIMATION
    // ============================================================

    const clock =
      new THREE.Clock();

    let animationFrame;

    function animate() {
      animationFrame =
        requestAnimationFrame(
          animate
        );

      const time =
        clock.getElapsedTime();

      // ----------------------------------------------------------
      // EYE FOLLOW
      // ----------------------------------------------------------

      // STRONG, VISIBLE EYE FOLLOW
      // The whole eye reacts clearly to cursor movement.
      const targetEyeY =
        mouse.x * 0.42;

      const targetEyeX =
        mouse.y * -0.28;

      master.rotation.y +=
        (
          targetEyeY -
          master.rotation.y
        ) * 0.075;

      master.rotation.x +=
        (
          targetEyeX -
          master.rotation.x
        ) * 0.075;

      // Small Z tilt makes the tracking feel alive rather than
      // looking like a static rotating graphic.
      const targetEyeZ =
        mouse.x * mouse.y * -0.12;

      master.rotation.z +=
        (
          targetEyeZ -
          master.rotation.z
        ) * 0.055;

      // ----------------------------------------------------------
      // PUPIL LOCK — CENTERED
      // ----------------------------------------------------------
      // The core is intentionally locked to the iris center. The eye
      // itself still follows the cursor, while the optical center stays
      // visually attached to the iris.

      pupilGroup.position.x +=
        (0 - pupilGroup.position.x) * 0.16;

      pupilGroup.position.y +=
        (0 - pupilGroup.position.y) * 0.16;

      const pupilPulse =
        1 +
        Math.sin(time * 2.4) *
        0.006;

      pupilGroup.scale.x +=
        (pupilPulse - pupilGroup.scale.x) * 0.08;

      pupilGroup.scale.y +=
        (pupilPulse - pupilGroup.scale.y) * 0.08;

      // ----------------------------------------------------------
      // HUD
      // ----------------------------------------------------------

      hud1.rotation.z =
        time * 0.06;

      hud2.rotation.z =
        -time * 0.10;

      hud3.rotation.z =
        time * 0.15;

      ticks.rotation.z =
        -time * 0.025;

      scanArcs.rotation.z =
        time * 0.028;

      particles.rotation.z =
        time * 0.012;

      // ----------------------------------------------------------
      // SCAN
      // ----------------------------------------------------------

      scanLine.position.y =
        Math.sin(
          time * 1.8
        ) * 1.15;

      scanLine.material.opacity =
        0.04 +
        Math.abs(
          Math.sin(
            time * 2
          )
        ) * 0.12;

      // ----------------------------------------------------------
      // PULSE
      // ----------------------------------------------------------

      const pulse =
        1 +
        Math.sin(
          time * 2.2
        ) * 0.018;

      eyeGroup.scale.set(
        pulse,
        pulse,
        1
      );

      // Clearly visible iris rotation.
      irisSpinGroup.rotation.z =
        time * 0.095;

      // Independent counter-rotation adds depth to the iris linework.
      irisArcs.rotation.z =
        -time * 0.18;

      radialIris.rotation.z =
        time * 0.055;

      // ----------------------------------------------------------
      // VERY SUBTLE EYE BREATHING
      // ----------------------------------------------------------

      eyeGroup.scale.x =
        1 +
        Math.sin(time * 0.8) *
          0.018;

      eyeGroup.scale.y =
        1 +
        Math.sin(time * 0.8) *
          0.010;

      irisSpinGroup.rotation.x =
        Math.sin(time * 0.55) *
        0.012;

      renderer.render(
        scene,
        camera
      );
    }

    animate();

    // ============================================================
    // RESIZE
    // ============================================================

    function onResize() {
      camera.aspect =
        window.innerWidth /
        window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    }

    window.addEventListener(
      "resize",
      onResize
    );

    // ============================================================
    // CLEANUP
    // ============================================================

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "mousemove",
        onMouseMove
      );

      window.removeEventListener(
        "resize",
        onResize
      );

      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(
              (material) =>
                material.dispose()
            );
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();

      if (
        container.contains(
          renderer.domElement
        )
      ) {
        container.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

        /* =========================================================
           BASE
        ========================================================= */

        /* HARD EDGE RESET — NO PAGE DIVIDERS */
        html,
        body,
        #root {
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          outline: 0 !important;
          box-shadow: none !important;
          width: 100%;
          min-height: 100%;
          background: #000 !important;
        }

        html,
        body {
          overflow-x: hidden;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        .samurai-section {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          background: #000;
          border: 0 !important;
          border-top: 0 !important;
          border-bottom: 0 !important;
          outline: 0 !important;
          box-shadow: none !important;
          isolation: isolate;
          font-family:
            "The Last Shuriken",
            Arial,
            sans-serif;
        }

        /* PAGE EDGE DIVIDER KILL — keeps internal decorative lines intact */
        .samurai-section,
        .samurai-section::before,
        .samurai-section::after {
          border-top: 0 !important;
          border-bottom: 0 !important;
          outline: 0 !important;
          box-shadow: none !important;
        }


        /* =========================================================
           SECTION CONNECTOR — REMOVED
           No full-width connector/divider at section edges.
        ========================================================= */
        .samurai-section::before,
        .samurai-section::after {
          content: none !important;
          display: none !important;
          border: 0 !important;
          background: none !important;
          box-shadow: none !important;
        }

        .samurai-section > .section-connector,
        .samurai-section > [data-section-connector],
        .samurai-section > .section-divider,
        .samurai-section > [data-section-divider] {
          display: none !important;
        }

        /* =========================================================
           THREE.JS EYE BACKGROUND
        ========================================================= */

        .cyber-eye-background {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
          background: #000000;
        }

        .cyber-eye-background canvas {
          width: 100% !important;
          height: 100% !important;
        }

        /* =========================================================
           SUBTLE TECH GRID
        ========================================================= */

        .samurai-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 8;
          opacity: 0.035;
          background-image:
            linear-gradient(
              rgba(255,255,255,0.12) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.08) 1px,
              transparent 1px
            );
          background-size: 90px 90px;
        }

        /* =========================================================
           ATMOSPHERE
        ========================================================= */

        .samurai-atmosphere {
          position: absolute;
          left: 50%;
          top: 48%;
          width: min(900px, 100vw);
          height: 620px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 11;
          background:
            radial-gradient(
              ellipse,
              rgba(255,255,255,0.018) 0%,
              rgba(255,255,255,0.008) 35%,
              transparent 72%
            );
          filter: blur(80px);
        }

        /* =========================================================
           VIGNETTES
        ========================================================= */

        .samurai-vignette {
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          background:
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.18),
              transparent 35%,
              rgba(0,0,0,0.42)
            );
        }

        .samurai-side-vignette {
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          background:
            linear-gradient(
              90deg,
              rgba(0,0,0,0.25),
              transparent 25%,
              transparent 75%,
              rgba(0,0,0,0.24)
            );
        }

        /* =========================================================
           CONTENT
        ========================================================= */

        .samurai-content {
          position: relative;
          z-index: 30;
          display: flex;
          width: 100%;
          max-width: 1050px;
          flex-direction: column;
          align-items: center;
          padding: 70px 20px;
        }

        /* =========================================================
           HEADINGS
        ========================================================= */

        .samurai-heading-svg {
          display: block;
          width: 100%;
          height: auto;
          overflow: visible;
          pointer-events: none;
        }

        .samurai-heading-text {
          font-family:
            "The Last Shuriken",
            Arial,
            sans-serif;
          font-weight: 700;
          letter-spacing: 0.015em;
        }

        .samurai-base-text {
          fill: url(#samuraiMetalGradient);
          filter: url(#samuraiTextShadow);
        }

        .samurai-inner-text {
          fill: url(#samuraiInnerGradient);
          opacity: 0.30;
        }

        .samurai-shine {
          fill: url(#samuraiShineGradient);
          opacity: 0.82;
          mix-blend-mode: screen;
        }

        .samurai-shine-journey {
          fill: url(#journeyShineGradient);
          opacity: 0.82;
          mix-blend-mode: screen;
        }

        /* =========================================================
           SUBTITLE
        ========================================================= */

        .samurai-subtitle {
          color: rgba(255,255,255,0.62);
          letter-spacing: 0.11em;
          text-shadow:
            0 2px 9px rgba(0,0,0,0.95);
        }

        /* =========================================================
           DIVIDER
        ========================================================= */

        .samurai-divider {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .samurai-divider-line {
          height: 1px;
          width: 90px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.55),
              rgba(120,120,120,0.70)
            );
          box-shadow:
            0 0 7px rgba(255,255,255,0.18);
        }

        .samurai-divider-line.right {
          background:
            linear-gradient(
              90deg,
              rgba(120,120,120,0.70),
              rgba(255,255,255,0.55),
              transparent
            );
        }

        .samurai-divider-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 999px;
          background: #d5d5d5;
          box-shadow:
            0 0 7px rgba(255,255,255,0.65),
            0 0 15px rgba(255,255,255,0.25);
        }

        /* =========================================================
           PARTNER CARD
        ========================================================= */

        .samurai-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              rgba(0,0,0,0.76),
              rgba(20,20,20,0.48)
            );

          box-shadow:
            0 15px 50px rgba(0,0,0,0.78),
            inset 0 1px 0 rgba(255,255,255,0.10),
            inset 0 0 30px rgba(255,255,255,0.018);

          backdrop-filter: blur(12px);

          transition:
            transform 500ms cubic-bezier(.16,1,.3,1),
            border-color 500ms ease,
            box-shadow 500ms ease;
        }

        .samurai-card:hover {
          transform:
            translateY(-4px)
            scale(1.025);

          border-color:
            rgba(255,255,255,0.32);

          box-shadow:
            0 0 35px rgba(255,255,255,0.08),
            0 20px 60px rgba(0,0,0,0.90),
            inset 0 1px 0 rgba(255,255,255,0.18);
        }

        .samurai-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 72%;
          height: 1px;
          transform: translateX(-50%);
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.65),
              transparent
            );
          box-shadow:
            0 0 11px rgba(255,255,255,0.20);
        }

        .samurai-card-shine {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;

          background:
            linear-gradient(
              115deg,
              transparent 25%,
              rgba(255,255,255,0.07) 48%,
              transparent 70%
            );

          transform: translateX(-100%);

          transition:
            opacity 500ms ease,
            transform 900ms ease;
        }

        .samurai-card:hover
        .samurai-card-shine {
          opacity: 1;
          transform: translateX(100%);
        }

        /* =========================================================
           LOGO
        ========================================================= */

        .samurai-logo {
          width: 140px;
          height: auto;
          object-fit: contain;

          filter:
            contrast(1.08)
            brightness(1.04)
            drop-shadow(
              0 3px 8px rgba(0,0,0,0.70)
            );

          transition:
            transform 400ms ease,
            filter 400ms ease;
        }

        .samurai-card:hover
        .samurai-logo {
          transform: scale(1.055);

          filter:
            contrast(1.15)
            brightness(1.12)
            drop-shadow(
              0 4px 12px rgba(255,255,255,0.10)
            );
        }

        /* =========================================================
           DESCRIPTION
        ========================================================= */

        .samurai-description {
          color: rgba(255,255,255,0.58);
          letter-spacing: 0.055em;
          line-height: 1.85;
          text-shadow:
            0 3px 12px rgba(0,0,0,0.95);
        }

        /* =========================================================
           BUTTON
        ========================================================= */

        .samurai-button {
          position: relative;
          overflow: hidden;

          font-family:
            "The Last Shuriken",
            Arial,
            sans-serif;

          font-weight: 700;
          letter-spacing: 0.08em;

          border: 1px solid
            rgba(255,255,255,0.15);

          border-radius: 12px;

          color:
            rgba(255,255,255,0.86);

          background:
            linear-gradient(
              135deg,
              rgba(0,0,0,0.72),
              rgba(35,35,35,0.42)
            );

          box-shadow:
            0 8px 30px rgba(0,0,0,0.70),
            inset 0 1px 0
              rgba(255,255,255,0.10);

          transition:
            transform 450ms
              cubic-bezier(.16,1,.3,1),
            border-color 450ms ease,
            box-shadow 450ms ease;
        }

        .samurai-button:hover {
          transform:
            translateY(-3px)
            scale(1.035);

          border-color:
            rgba(255,255,255,0.36);

          box-shadow:
            0 0 30px rgba(255,255,255,0.10),
            0 14px 42px rgba(0,0,0,0.85),
            inset 0 1px 0
              rgba(255,255,255,0.18);
        }

        .samurai-button-shine {
          position: absolute;
          inset: 0;
          transform: translateX(-110%);

          background:
            linear-gradient(
              100deg,
              transparent,
              rgba(255,255,255,0.13),
              transparent
            );

          transition:
            transform 750ms
              cubic-bezier(.16,1,.3,1);
        }

        .samurai-button:hover
        .samurai-button-shine {
          transform: translateX(110%);
        }

        /* =========================================================
           ENTRANCE
        ========================================================= */

        .samurai-enter {
          transform:
            translateY(70px)
            scale(0.82);
          opacity: 0;

          transition:
            transform 1000ms
              cubic-bezier(.16,1,.3,1),
            opacity 1000ms
              cubic-bezier(.16,1,.3,1);
        }

        .samurai-enter.visible {
          transform:
            translateY(0)
            scale(1);
          opacity: 1;
        }

        .samurai-card-enter {
          transform:
            translateY(80px)
            scale(0.72);
          opacity: 0;

          transition:
            transform 1000ms
              cubic-bezier(.16,1,.3,1),
            opacity 1000ms
              cubic-bezier(.16,1,.3,1);
        }

        .samurai-card-enter.visible {
          transform:
            translateY(0)
            scale(1);
          opacity: 1;
        }

        .samurai-journey-enter {
          transform:
            translateY(90px)
            scale(0.78);
          opacity: 0;

          transition:
            transform 1000ms
              cubic-bezier(.16,1,.3,1),
            opacity 1000ms
              cubic-bezier(.16,1,.3,1);
        }

        .samurai-journey-enter.visible {
          transform:
            translateY(0)
            scale(1);
          opacity: 1;
        }

        /* =========================================================
           MOBILE
        ========================================================= */

        @media (max-width: 640px) {
          .samurai-content {
            padding:
              55px 16px;
          }

          .samurai-heading-text {
            letter-spacing: 0;
          }

          .samurai-divider-line {
            width: 58px;
          }

          .samurai-logo {
            width: 120px;
          }

          .samurai-description {
            font-size: 13px;
            line-height: 1.8;
            letter-spacing: 0.045em;
          }

          .samurai-grid {
            background-size:
              60px 60px;
          }
        }

        /* =========================================================
           REDUCED MOTION
        ========================================================= */

        @media (prefers-reduced-motion: reduce) {
          .samurai-enter,
          .samurai-card-enter,
          .samurai-journey-enter {
            transition: none;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="
          samurai-section
          m-0
          p-0
          border-0
          flex
          min-h-[100vh]
          w-full
          border-t-0
          border-b-0
          border-t-0
          items-center
          justify-center
          bg-black
        "
      >

        {/* =======================================================
            FULL SCREEN THREE.JS CYBER EYE
        ======================================================= */}

        <div
          ref={eyeMountRef}
          className="cyber-eye-background"
          aria-hidden="true"
        />

        <div
          className="samurai-grid"
          aria-hidden="true"
        />

        <div
          className="samurai-vignette"
          aria-hidden="true"
        />

        <div
          className="samurai-side-vignette"
          aria-hidden="true"
        />

        <div
          className="samurai-atmosphere"
          aria-hidden="true"
        />

        {/* =======================================================
            CONTENT
        ======================================================= */}

        <div
          className="
            samurai-content
            px-5
          "
        >

          {/* =====================================================
              OUR PARTNERS
          ===================================================== */}

          <div
            className={`
              samurai-enter
              w-full
              text-center
              ${visible ? "visible" : ""}
            `}
            style={{
              transitionDelay:
                visible
                  ? "100ms"
                  : "0ms",
            }}
          >

            <svg
              className="
                samurai-heading-svg
                mx-auto
                max-w-[720px]
              "
              viewBox="0 0 720 100"
              preserveAspectRatio="xMidYMid meet"
              role="heading"
              aria-level="2"
              aria-label="OUR PARTNERS"
            >

              <defs>

                <linearGradient
                  id="samuraiMetalGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#f2f2f2"
                  />

                  <stop
                    offset="15%"
                    stopColor="#d9d9d9"
                  />

                  <stop
                    offset="32%"
                    stopColor="#a7a7a7"
                  />

                  <stop
                    offset="48%"
                    stopColor="#4d4d4d"
                  />

                  <stop
                    offset="62%"
                    stopColor="#303030"
                  />

                  <stop
                    offset="74%"
                    stopColor="#777777"
                  />

                  <stop
                    offset="88%"
                    stopColor="#c3c3c3"
                  />

                  <stop
                    offset="100%"
                    stopColor="#eeeeee"
                  />
                </linearGradient>

                <linearGradient
                  id="samuraiInnerGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#eeeeee"
                  />

                  <stop
                    offset="38%"
                    stopColor="#c8c8c8"
                  />

                  <stop
                    offset="58%"
                    stopColor="#555555"
                  />

                  <stop
                    offset="78%"
                    stopColor="#a0a0a0"
                  />

                  <stop
                    offset="100%"
                    stopColor="#e5e5e5"
                  />
                </linearGradient>

                <linearGradient
                  id="samuraiShineGradient"
                  gradientUnits="userSpaceOnUse"
                  x1="-300"
                  y1="0"
                  x2="-60"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stopColor="#ffffff"
                    stopOpacity="0"
                  />

                  <stop
                    offset="38%"
                    stopColor="#ffffff"
                    stopOpacity="0"
                  />

                  <stop
                    offset="50%"
                    stopColor="#ffffff"
                    stopOpacity=".82"
                  />

                  <stop
                    offset="62%"
                    stopColor="#ffffff"
                    stopOpacity="0"
                  />

                  <stop
                    offset="100%"
                    stopColor="#ffffff"
                    stopOpacity="0"
                  />

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
                  id="samuraiTextShadow"
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

              <text
                x="360"
                y="72"
                textAnchor="middle"
                className="
                  samurai-heading-text
                  samurai-base-text
                "
                fontSize="62"
              >
                OUR PARTNERS
              </text>

              <text
                x="360"
                y="72"
                textAnchor="middle"
                className="
                  samurai-heading-text
                  samurai-inner-text
                "
                fontSize="62"
              >
                OUR PARTNERS
              </text>

              <text
                x="360"
                y="72"
                textAnchor="middle"
                className="
                  samurai-heading-text
                  samurai-shine
                "
                fontSize="62"
              >
                OUR PARTNERS
              </text>

            </svg>

            <p
              className={`
                samurai-subtitle
                mt-2
                text-[9px]
                uppercase
                sm:text-[10px]
                md:text-xs
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
                transitionDelay:
                  visible
                    ? "450ms"
                    : "0ms",
              }}
            >
              POWERING THE NEXT GENERATION
              OF ESPORTS ATHLETES
            </p>

            <div
              className={`
                samurai-divider
                mt-5
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
                transitionDelay:
                  visible
                    ? "650ms"
                    : "0ms",
              }}
            >
              <div className="samurai-divider-line" />

              <div className="samurai-divider-dot" />

              <div
                className="
                  samurai-divider-line
                  right
                "
              />
            </div>

          </div>

          {/* =====================================================
              PARTNER CARD
          ===================================================== */}

          <div
            className={`
              samurai-card-enter
              relative
              z-40
              mt-7
              w-full
              max-w-[300px]
              ${visible ? "visible" : ""}
            `}
            style={{
              transitionDelay:
                visible
                  ? "300ms"
                  : "0ms",
            }}
          >

            <div
              className="
                samurai-card
                px-5
                py-5
              "
            >

              <div
                className="
                  samurai-card-shine
                "
              />

              <div
                className="
                  relative
                  z-10
                  flex
                  h-[76px]
                  items-center
                  justify-center
                "
              >

                <img
                  src={klogo}
                  alt="Partner Logo"
                  className="samurai-logo"
                />

              </div>

            </div>

          </div>

          {/* =====================================================
              LOWER DECORATIVE LINE
          ===================================================== */}

          <div
            className={`
              mt-6
              flex
              items-center
              gap-3
              transform-gpu
              transition-all
              duration-700
              ${
                visible
                  ? "translate-y-0 opacity-60"
                  : "translate-y-5 opacity-0"
              }
            `}
            style={{
              transitionDelay:
                visible
                  ? "850ms"
                  : "0ms",
            }}
          >

            <div
              className="
                h-px
                w-10
                bg-gradient-to-r
                from-transparent
                to-white/60
              "
            />

            <div
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-white/80
                shadow-[0_0_9px_rgba(255,255,255,0.55)]
              "
            />

            <div
              className="
                h-px
                w-10
                bg-gradient-to-l
                from-transparent
                to-white/60
              "
            />

          </div>

          {/* =====================================================
              READY TO START
          ===================================================== */}

          <div
            className={`
              samurai-journey-enter
              mt-14
              flex
              w-full
              flex-col
              items-center
              text-center
              ${visible ? "visible" : ""}
            `}
            style={{
              transitionDelay:
                visible
                  ? "1000ms"
                  : "0ms",
            }}
          >

            <svg
              className="
                samurai-heading-svg
                mx-auto
                w-full
                max-w-[780px]
              "
              viewBox="0 0 780 100"
              preserveAspectRatio="xMidYMid meet"
              role="heading"
              aria-level="2"
              aria-label="Ready to Start Your Journey?"
            >

              <defs>

                <linearGradient
                  id="journeyMetalGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#eeeeee"
                  />

                  <stop
                    offset="16%"
                    stopColor="#d8d8d8"
                  />

                  <stop
                    offset="34%"
                    stopColor="#a5a5a5"
                  />

                  <stop
                    offset="50%"
                    stopColor="#4d4d4d"
                  />

                  <stop
                    offset="64%"
                    stopColor="#303030"
                  />

                  <stop
                    offset="78%"
                    stopColor="#888888"
                  />

                  <stop
                    offset="90%"
                    stopColor="#cccccc"
                  />

                  <stop
                    offset="100%"
                    stopColor="#eeeeee"
                  />
                </linearGradient>

                <linearGradient
                  id="journeyInnerGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#eeeeee"
                  />

                  <stop
                    offset="38%"
                    stopColor="#cccccc"
                  />

                  <stop
                    offset="58%"
                    stopColor="#555555"
                  />

                  <stop
                    offset="80%"
                    stopColor="#aaaaaa"
                  />

                  <stop
                    offset="100%"
                    stopColor="#eeeeee"
                  />
                </linearGradient>

                <linearGradient
                  id="journeyShineGradient"
                  gradientUnits="userSpaceOnUse"
                  x1="-300"
                  y1="0"
                  x2="-60"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stopColor="#ffffff"
                    stopOpacity="0"
                  />

                  <stop
                    offset="38%"
                    stopColor="#ffffff"
                    stopOpacity="0"
                  />

                  <stop
                    offset="50%"
                    stopColor="#ffffff"
                    stopOpacity=".82"
                  />

                  <stop
                    offset="62%"
                    stopColor="#ffffff"
                    stopOpacity="0"
                  />

                  <stop
                    offset="100%"
                    stopColor="#ffffff"
                    stopOpacity="0"
                  />

                  <animateTransform
                    attributeName="gradientTransform"
                    type="translate"
                    from="0 0"
                    to="1500 0"
                    dur="3.8s"
                    repeatCount="indefinite"
                  />
                </linearGradient>

              </defs>

              <text
                x="390"
                y="72"
                textAnchor="middle"
                className="
                  samurai-heading-text
                  samurai-base-text
                "
                fill="url(#journeyMetalGradient)"
                fontSize="49"
              >
                READY TO START YOUR JOURNEY?
              </text>

              <text
                x="390"
                y="72"
                textAnchor="middle"
                className="
                  samurai-heading-text
                  samurai-inner-text
                "
                fontSize="49"
              >
                READY TO START YOUR JOURNEY?
              </text>

              <text
                x="390"
                y="72"
                textAnchor="middle"
                className="
                  samurai-heading-text
                  samurai-shine
                "
                fontSize="49"
              >
                READY TO START YOUR JOURNEY?
              </text>

            </svg>

            {/* DESCRIPTION */}

            <p
              className={`
                samurai-description
                mt-3
                max-w-3xl
                px-3
                text-sm
                sm:text-base
                md:text-lg
                transform-gpu
                transition-all
                duration-700
                ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-7 opacity-0"
                }
              `}
              style={{
                transitionDelay:
                  visible
                    ? "1200ms"
                    : "0ms",
              }}
            >
              Join our community today and be part
              of the most exciting esports events
              in NIT Silchar.
            </p>

            {/* BUTTON */}

            <div
              className={`
                mt-8
                transform-gpu
                transition-all
                duration-[900ms]
                ${
                  visible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-8 scale-75 opacity-0"
                }
              `}
              style={{
                transitionDelay:
                  visible
                    ? "1400ms"
                    : "0ms",
              }}
            >

              <button
                type="button"
                className="
                  samurai-button
                  group
                  relative
                  px-8
                  py-4
                  text-sm
                  sm:px-10
                  sm:text-base
                "
              >

                <span
                  className="
                    samurai-button-shine
                  "
                />

                <span
                  className="
                    relative
                    z-10
                  "
                >
                  LEARN MORE ABOUT US
                </span>

              </button>

            </div>

          </div>

        </div>
      </section>
    </>
  );
};

export default ScrollSection3;