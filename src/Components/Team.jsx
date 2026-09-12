
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as THREE from "three";
import Navbar from "./Navbar";

import instagramLogo from "../assets/insw.png";
import linkedinLogo from "../assets/liw.png";
import facebookLogo from "../assets/fbw.png";
import member1Image from "../assets/Members/member1.png";
import member2Image from "../assets/Members/member2.png";
import member4Image from "../assets/Members/member4.png";
import member5Image from "../assets/Members/member5.png";
import member6Image from "../assets/Members/member6.png";
import member7Image from "../assets/Members/member7.png";
import member8Image from "../assets/Members/member8.png";
import member9Image from "../assets/Members/member9.png";
import member3Image from "../assets/Members/member3.png";

const Team = () => {
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  const [shattering, setShattering] = useState(false);
  const [activeYear, setActiveYear] = useState(0);

  /* =====================================================
     PAGE ANIMATION
  ===================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.className = "merch-starfield-canvas";
    document.body.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.018);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });

    // Same render quality as Hero — intentionally capped for smoothness.
    const getPixelRatio = () =>
      Math.min(window.devicePixelRatio || 1, 1.25);

    renderer.setPixelRatio(getPixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMappingExposure = 1.15;

    // ---------------------------------------------------------
    // PARTICLE TUNNEL — EXACT HERO STAR PROPERTIES
    // ---------------------------------------------------------

    const particleCount = 1400;
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.2 + Math.pow(Math.random(), 0.52) * 11.5;
      const z = -10 + Math.random() * 12;

      particleSpeeds[i] = 0.008 + Math.random() * 0.035;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.sin(a) * r;
      positions[i * 3 + 2] = z;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particlePositionAttribute = particleGeometry.attributes.position;

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.085,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );

    scene.add(particles);

    // ---------------------------------------------------------
    // MOUSE PARALLAX — SAME AS HERO
    // ---------------------------------------------------------

    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -((event.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let scrollTarget = 0;
    let scrollCurrent = 0;
    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScroll;

      scrollTarget = THREE.MathUtils.clamp(
        scrollTarget + delta * 0.02,
        -3.5,
        9
      );

      lastScroll = current;
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(getPixelRatio());
      renderer.setSize(width, height, false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    handleResize();

    const clock = new THREE.Clock();
    let animationFrame;
    let time = 0;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.033);
      time += dt;

      const damping = (speed) => 1 - Math.exp(-speed * dt);

      // Same smooth mouse interpolation as Hero.
      smoothX += (mouseX - smoothX) * damping(9);
      smoothY += (mouseY - smoothY) * damping(9);

      scrollCurrent +=
        (scrollTarget - scrollCurrent) * damping(5.5);

      const cameraZ = 9 - scrollCurrent * 1.35;
      camera.position.z +=
        (cameraZ - camera.position.z) * damping(6);

      // Exact Hero forward star movement.
      for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        let z = positions[index + 2] + particleSpeeds[i];

        if (z > 3) z = -10;

        positions[index + 2] = z;
      }

      // Exact Hero star-field rotation/parallax.
      particles.rotation.z = time * 0.025;

      particlePositionAttribute.needsUpdate = true;

      if (!document.hidden) {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      particleGeometry.dispose();
      particles.material.dispose();
      renderer.dispose();

      if (canvas.parentNode === document.body) {
        document.body.removeChild(canvas);
      }
    };
  }, []);

  /* =====================================================
     TEAM MEMBERS
  ===================================================== */

  const teamSections = [
    {
      title: "4TH YEAR MEMBERS",
      subtitle: "SENIOR LEADERSHIP",
      members: [],
    },

    {
      title: "3RD YEAR MEMBERS",
      subtitle: "CORE TEAM",
      members: [
        {
          name: "Satyam kumar jha",
          role: "Vice President",
          image: member1Image,
          instagram: "#",
          linkedin: "#",
          facebook: "#",
        },
        {
          name: "chirag khandelwal",
          role: "Technical Head & Design Head",
          image: member2Image,
          instagram: "#",
          linkedin: "#",
          facebook: "#",
        },
        {
          name: "harendra nagar",
          role: "PR & Marketing Head",
          image: member3Image,
          instagram: "#",
          linkedin: "#",
          facebook: "#",
        },
        {
          name: "praveen goyal",
          role: "Social Media Head",
          image: member4Image,
          instagram: "#",
          linkedin: "#",
          facebook: "#",
        },
        {
          name: "tanmay raj",
          role: "Video Editing & Marketing Head",
          image: member5Image,
          instagram: "#",
          linkedin: "#",
          facebook: "#",
        },
        {
          name: "sanjay bhargav",
          role: "Content Head",
          image: member6Image,
          instagram: "#",
          linkedin: "#",
          facebook: "#",
        },
        {
          name: "abhinay kumar",
          role: "Event Management Head",
          image: member7Image,
          instagram: "#",
          linkedin: "#",
          facebook: "#",
        },
        {
          name: "banoth ganesh",
          role: "Design Head",
          image: member8Image,
          instagram: "#",
          linkedin: "#",
          facebook: "#",
        },
        {
          name: "sahil bharti",
          role: "Event Management Head",
          image: member9Image,
          instagram: "#",
          linkedin: "#",
          facebook: "#",
        },
      ],
    },

    {
      title: "2ND YEAR MEMBERS",
      subtitle: "RISING FORCE",
      members: [
        {
          name: "Yashraj Narzary",
          role: "Event Management & Content",
          image: "/team/member14.jpg",
          instagram:
            "https://www.instagram.com/yashraj_nzy?stkn=MXNncm85Z2U0eXc0NQ==",
          linkedin:
            "https://www.linkedin.com/in/yashraj-narzary-66870b433?utm_source=share_via&utm_content=profile&utm_medium=member_android",
          facebook: "https://www.facebook.com/share/1F6cYDkez6/",
        },
        {
          name: "Affan Parwez",
          role: "Design",
          image: "/team/member15.jpg",
          instagram:
            "https://www.instagram.com/__afp______?stkn=MW03MTJ1M3Bxc2pvZw==",
          linkedin:
            "https://www.linkedin.com/in/affan-parwez-127-phoenix?utm_source=share_via&utm_content=profile&utm_medium=member_android",
          facebook: "#",
        },
        {
          name: "Kunal",
          role: "Event Management",
          image: "/team/member16.jpg",
          instagram:
            "https://www.instagram.com/_kun_bamniya?stkn=cXV5NzhmeTk3azUx",
          linkedin: "#",
          facebook: "#",
        },
        {
          name: "Raunak Kumar",
          role: "Event Management",
          image: "/team/member17.jpg",
          instagram:
            "https://www.instagram.com/raunakshxh?stkn=MXkyYnk3NmJ4ZHVoaA==",
          linkedin:
            "https://www.linkedin.com/in/raunak-kumar-74aba239b?utm_source=share_via&utm_content=profile&utm_medium=member_android",
          facebook: "#",
        },
        {
          name: "Kunal Saha",
          role: "Event Management",
          image: "/team/member18.jpg",
          instagram:
            "https://www.instagram.com/krspmelon?stkn=ZzUyY2sya214ZWh0",
          linkedin:
            "https://www.linkedin.com/in/kunal-saha-110399230?utm_source=share_via&utm_content=profile&utm_medium=member_android",
          facebook: "https://www.facebook.com/share/19LSb3t989/",
        },
        {
          name: "Bhaskar Damachya",
          role: "Event Management & Content",
          image: "/team/member19.jpg",
          instagram:
            "https://www.instagram.com/_bhaskar_666?stkn=OGY0eXY1Z3U4em85",
          linkedin:
            "https://www.linkedin.com/in/bhaskar-damachya-359620383?utm_source=share_via&utm_content=profile&utm_medium=member_android",
          facebook: "#",
        },
        {
          name: "Subham Kishore Baishya",
          role: "Event Management",
          image: "/team/member20.jpg",
          instagram:
            "https://www.instagram.com/subham_altered33?stkn=aTdpMjF2NWhmdTJ2",
          linkedin:
            "https://linkedin.com/in/subham-kishore-baishya-100520383",
          facebook: "https://www.facebook.com/share/18HqnDRUFK/",
        },
        {
          name: "Tonmoy Kakati",
          role: "Event Management",
          image: "/team/member21.jpg",
          instagram:
            "https://www.instagram.com/t__k2507?stkn=MTZqNThxNWUzbDZ1OQ==",
          linkedin:
            "https://www.linkedin.com/in/tonmoy-kakati-344006434?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
          facebook: "https://www.facebook.com/share/19Mt5qHPzz/",
        },
        {
          name: "Abhilesh Barman",
          role: "Technical & PR Team",
          image: "/team/member22.jpg",
          instagram:
            "https://www.instagram.com/____abhilesh____?stkn=MWZjZ3ZhbTRvaDRwMA==",
          linkedin:
            "https://www.linkedin.com/in/abhilesh-barman-b11760381?utm_source=share_via&utm_content=profile&utm_medium=member_android",
          facebook: "#",
        },
        {
          name: "Dilbag Singh",
          role: "Design",
          image: "/team/member23.jpg",
          instagram:
            "https://www.instagram.com/im_life_editor?stkn=dGVmcWE2MW5iNHpo",
          linkedin:
            "https://www.linkedin.com/in/dilbag-singh-9ba777414?utm_source=share_via&utm_content=profile&utm_medium=member_android",
          facebook: "https://www.facebook.com/share/1MBUin8XPr/",
        },
        {
          name: "Luvya Trehan",
          role: "Event Management & Content",
          image: "/team/member24.jpg",
          instagram: "https://www.instagram.com/micku_ln",
          linkedin:
            "https://www.linkedin.com/in/luvya-trehan-99b72936b?utm_source=share_via&utm_content=profile&utm_medium=member_android",
          facebook: "#",
        },
        {
          name: "Nishan Das",
          role: "Event Management & PR",
          image: "/team/member25.jpg",
          instagram:
            "https://www.instagram.com/_nishan_.das?stkn=ZHc0Z2NxMHZhZnkz",
          linkedin: "https://www.linkedin.com/in/nishan-das-470386315/",
          facebook: "#",
        },
        {
          name: "Rezowan Hussain",
          role: "Design",
          image: "/team/member26.jpg",
          instagram:
            "https://www.instagram.com/rezowan_02?stkn=aDJjZWVwODNrMWY3",
          linkedin:
            "https://www.linkedin.com/in/rezowan-hussain-a7a7a8397?utm_source=share_via&utm_content=profile&utm_medium=member_android",
          facebook: "https://www.facebook.com/share/1BedMvQsgU/",
        },
        {
          name: "Abdur Rajjak Mustafa",
          role: "Event Management",
          image: "/team/member27.jpg",
          instagram:
            "https://www.instagram.com/_i_rajjak_?stkn=cmt4eTBnNWVlb2Jw",
          linkedin:
            "https://www.linkedin.com/in/abdur-rajjak-mustafa-976232390?utm_source=share_via&utm_content=profile&utm_medium=member_android",
          facebook: "https://www.facebook.com/share/1Br6C79FWe/",
        },
        {
          name: "Aditya Prajapati",
          role: "Event Management & PR",
          image: "/team/member28.jpg",
          instagram:
            "https://www.instagram.com/_aditya_prajapati_1314?stkn=YnE2aHFvazkzMTdz",
          linkedin: "#",
          facebook: "#",
        },
      ],
    },
  ];
  /* =====================================================
     BACK TO HOME
  ===================================================== */

  const goHome = () => {
    if (shattering) return;

    setShattering(true);

    setTimeout(() => {
      navigate("/");

      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }, 650);
  };

  /* =====================================================
     SHATTER ANIMATION
  ===================================================== */

  const shatterStyles = `
    @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

    .team-samurai-font,
    .team-samurai-title,
    .team-samurai-label,
    .team-description,
    .team-year-button,
    .team-member-role,
    .team-member-name {
      font-family: 'The Last Shuriken', sans-serif;
    }

    .team-root {
      font-family: 'The Last Shuriken', sans-serif;
    }

    .merch-starfield-canvas {
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

    .team-root button,
    .team-root a,
    .team-root p,
    .team-root span,
    .team-root h1,
    .team-root h2,
    .team-root h3 {
      font-family: 'The Last Shuriken', sans-serif;
    }

    .team-samurai-title {
      font-family: 'The Last Shuriken', sans-serif;
      font-weight: 700;
      letter-spacing: 0.025em;
      text-shadow:
        0 4px 0 rgba(0, 0, 0, .72),
        0 7px 18px rgba(0, 0, 0, .72),
        0 0 12px rgba(255, 255, 255, .10);
    }

    .team-title-svg {
      display: block;
      width: min(94vw, 1000px);
      height: auto;
      overflow: visible;
      pointer-events: none;
    }

    .team-title-text {
      font-family: 'The Last Shuriken', sans-serif;
      font-weight: 700;
      letter-spacing: -2px;
    }

    .team-title-base {
      fill: url(#teamTitleFillGradient);
      stroke: none;
      paint-order: normal;
      filter: url(#teamPremiumTitleShadow);
    }

    .team-title-inner {
      fill: url(#teamTitleInnerGradient);
      stroke: none;
      opacity: .34;
      pointer-events: none;
    }

    .team-title-shine-svg {
      fill: url(#teamTitleShineGradient);
      stroke: none;
      paint-order: normal;
      pointer-events: none;
      opacity: .88;
      mix-blend-mode: screen;
      filter:
        drop-shadow(0 0 4px rgba(255,255,255,.20))
        drop-shadow(0 0 11px rgba(255,255,255,.08));
    }

    .team-title-animated {
      animation: teamTitleReveal 1100ms cubic-bezier(.16,1,.3,1) both;
    }

    @media (max-width: 640px) {
      .team-title-svg {
        width: min(96vw, 1000px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .team-title-animated {
        animation: none;
      }
    }

    .team-year-button {
      letter-spacing: .16em;
      text-shadow: 0 2px 7px rgba(0,0,0,.7);
    }

    .team-year-button-active {
      background:
        linear-gradient(
          180deg,
          rgba(255,255,255,.96),
          rgba(255,255,255,.82)
        );
      color: #050505;
      box-shadow:
        0 8px 28px rgba(255,255,255,.10),
        inset 0 1px 0 rgba(255,255,255,.95);
    }

    .team-year-button-active::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 42px;
      height: 2px;
      transform: translateX(-50%);
      background: #050505;
      box-shadow: 0 0 10px rgba(0,0,0,.55);
    }

    .team-samurai-accent {
      box-shadow:
        0 0 10px rgba(255,255,255,.10),
        0 0 22px rgba(255,255,255,.04);
    }

    @media (prefers-reduced-motion: reduce) {
      .team-title-animated,
      .team-title-shine {
        animation: none;
      }

      .team-title-shine {
        background-image: none;
        color: white;
      }
    }

    @keyframes teamShatterOut {
      0% {
        opacity: 1;
        transform: scale(1);
        clip-path: polygon(
          0 0,
          100% 0,
          100% 100%,
          0 100%
        );
      }

      25% {
        transform: scale(1.015);
        clip-path: polygon(
          0 0,
          18% 7%,
          39% 0,
          61% 8%,
          82% 2%,
          100% 0,
          96% 31%,
          100% 67%,
          82% 100%,
          59% 92%,
          38% 100%,
          16% 93%,
          0 100%,
          4% 65%,
          0 33%
        );
      }

      100% {
        opacity: 0;
        transform: scale(1.06) rotate(1deg);
        clip-path: polygon(
          0 12%,
          18% 2%,
          33% 19%,
          49% 0,
          67% 18%,
          85% 4%,
          100% 20%,
          92% 43%,
          100% 63%,
          81% 78%,
          92% 100%,
          64% 87%,
          47% 100%,
          28% 82%,
          8% 100%,
          16% 72%,
          0 57%,
          9% 35%
        );
      }
    }

    @keyframes shardFlash {
      0% {
        opacity: 0;
        transform: translateX(-120%);
      }

      30% {
        opacity: .75;
      }

      65% {
        opacity: .15;
      }

      100% {
        opacity: 0;
        transform: translateX(120%);
      }
    }

    .team-shatter-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
      overflow: hidden;
      background:
        linear-gradient(
          135deg,
          rgba(255,79,216,.25),
          transparent 28%
        ),
        linear-gradient(
          315deg,
          rgba(40,215,255,.22),
          transparent 32%
        ),
        rgba(0,0,0,.94);
      animation:
        teamShatterOut .65s
        cubic-bezier(.76,0,.24,1)
        forwards;
    }

    .team-shatter-flash {
      position: absolute;
      inset: -20%;
      background:
        linear-gradient(
          115deg,
          transparent 0%,
          rgba(255,255,255,.85) 48%,
          transparent 52%
        );
      animation:
        shardFlash .65s ease-out
        forwards;
    }

    .team-shatter-piece {
      position: absolute;
      background:
        linear-gradient(
          135deg,
          rgba(255,79,216,.85),
          rgba(155,108,255,.75),
          rgba(40,215,255,.85)
        );
      box-shadow:
        0 0 14px rgba(155,108,255,.35);
      transform-origin: center;
    }

    .team-shatter-piece.one {
      width: 42vw;
      height: 3px;
      left: -5vw;
      top: 31%;
      transform: rotate(22deg);
    }

    .team-shatter-piece.two {
      width: 34vw;
      height: 2px;
      right: -3vw;
      top: 61%;
      transform: rotate(-28deg);
    }

    .team-shatter-piece.three {
      width: 28vw;
      height: 2px;
      left: 34%;
      top: -4vw;
      transform: rotate(74deg);
    }

    @keyframes samuraiPulse {
      0%,
      100% {
        opacity: .45;
      }

      50% {
        opacity: .85;
      }
    }

    .team-section-line {
      animation:
        samuraiPulse 3s ease-in-out
        infinite;
    }

    @keyframes teamTitleReveal {
      0% {
        opacity: 0;
        transform: translateY(22px) scale(.96);
      }

      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes teamTabIn {
      0% {
        opacity: 0;
        transform: translateY(18px);
      }

      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .team-social-row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      width: 100%;
      min-width: 0;
    }

    .team-social-link {
      min-width: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      white-space: nowrap;
    }

    .team-social-link-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;

  /* =====================================================
     MEMBER CARD
  ===================================================== */

  const MemberCard = ({ member, globalIndex }) => {
    return (
      <article
        className="
          group
          relative
          overflow-hidden
          rounded-[2px]
          border
          border-white/[0.09]
          bg-black/55
          backdrop-blur-xl
          transition-all
          duration-500
          ease-out
          hover:-translate-y-2
          hover:border-white/25
          hover:bg-black/70
          hover:shadow-[0_25px_70px_rgba(0,0,0,.65)]
        "
      >
        <div
          className="
            absolute
            left-0
            top-0
            z-30
            h-[2px]
            w-0
            bg-gradient-to-r
            from-transparent
            via-white
            to-transparent
            transition-all
            duration-700
            group-hover:w-full
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-0
            z-0
            h-40
            w-40
            -translate-x-1/2
            rounded-full
            bg-white/[0.04]
            blur-3xl
            transition-all
            duration-700
            group-hover:bg-white/[0.08]
            group-hover:scale-150
          "
        />

        <div
          className="
            relative
            h-[330px]
            w-full
            overflow-hidden
            bg-black
          "
        >
          {member.image && (
            <img
              src={member.image}
              alt={member.name}
              loading="lazy"
              className="
                relative
                z-10
                block
                h-full
                w-full
                object-cover
                grayscale-[20%]
                transition-all
                duration-700
                ease-out
                group-hover:scale-[1.06]
                group-hover:grayscale-0
              "
            />
          )}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black
              via-black/15
              to-transparent
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-black/25
              via-transparent
              to-black/25
            "
          />

          <div
            className="
              absolute
              right-4
              top-4
              z-20
              border
              border-white/15
              bg-black/60
              px-3
              py-2
              text-[9px]
              font-bold
              tracking-[0.22em]
              text-white/60
              backdrop-blur-md
            "
          >
            {String(globalIndex + 1).padStart(2, "0")}
          </div>

          <div
            className="
              absolute
              bottom-4
              left-4
              z-20
              flex
              gap-2
              opacity-100
              transition-all
              duration-500
            "
          >
            <a
              href={member.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} Instagram`}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                border
                border-white/15
                bg-black/65
                text-white/70
                backdrop-blur-md
                transition-all
                duration-300
                hover:border-white/50
                hover:bg-black/80
                hover:text-white
              "
            >
              <img
                src={instagramLogo}
                alt="Instagram"
                className="h-4 w-4 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </a>

            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} LinkedIn`}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                border
                border-white/15
                bg-black/65
                text-white/70
                backdrop-blur-md
                transition-all
                duration-300
                hover:border-white/50
                hover:bg-black/80
                hover:text-white
              "
            >
              <img
                src={linkedinLogo}
                alt="LinkedIn"
                className="h-4 w-4 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </a>

            <a
              href={member.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} Facebook`}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                border
                border-white/15
                bg-black/65
                text-white/70
                backdrop-blur-md
                transition-all
                duration-300
                hover:border-white/50
                hover:bg-black/80
                hover:text-white
              "
            >
              <img
                src={facebookLogo}
                alt="Facebook"
                className="h-4 w-4 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </a>
          </div>
        </div>

        <div
          className="
            relative
            z-10
            border-t
            border-white/[0.07]
            p-5
          "
        >
          <div className="mb-3 flex items-center gap-2">
            <span
              className="
                h-[1px]
                w-6
                bg-white/30
                transition-all
                duration-500
                group-hover:w-10
                group-hover:bg-white
              "
            />

            <p
              className="
                team-member-role
                m-0
                text-[9px]
                font-bold
                uppercase
                tracking-[0.28em]
                text-white/45
              "
            >
              {member.role}
            </p>
          </div>

          <h3
            className="
              team-member-name
              m-0
              text-xl
              font-bold
              uppercase
              tracking-[0.02em]
              text-white
            "
          >
            {member.name}
          </h3>

          <div
            className="
              team-social-row
              mt-5
              items-center
              gap-1
              border-t
              border-white/[0.07]
              pt-4
              sm:gap-2
            "
          >
            <a
              href={member.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} Instagram`}
              className="
                team-social-link
                text-[8px]
                font-bold
                uppercase
                tracking-[0.04em]
                text-white/40
                transition-colors
                duration-300
                hover:text-white
                sm:text-[9px]
                sm:tracking-[0.07em]
              "
            >
              <img
                src={instagramLogo}
                alt=""
                className="h-3.5 w-3.5 shrink-0 object-contain"
              />
              <span className="team-social-link-label">
                Instagram
              </span>
            </a>

            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} LinkedIn`}
              className="
                team-social-link
                text-[8px]
                font-bold
                uppercase
                tracking-[0.04em]
                text-white/40
                transition-colors
                duration-300
                hover:text-white
                sm:text-[9px]
                sm:tracking-[0.07em]
              "
            >
              <img
                src={linkedinLogo}
                alt=""
                className="h-3.5 w-3.5 shrink-0 object-contain"
              />
              <span className="team-social-link-label">
                LinkedIn
              </span>
            </a>

            <a
              href={member.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} Facebook`}
              className="
                team-social-link
                text-[8px]
                font-bold
                uppercase
                tracking-[0.04em]
                text-white/40
                transition-colors
                duration-300
                hover:text-white
                sm:text-[9px]
                sm:tracking-[0.07em]
              "
            >
              <img
                src={facebookLogo}
                alt=""
                className="h-3.5 w-3.5 shrink-0 object-contain"
              />
              <span className="team-social-link-label">
                Facebook
              </span>
            </a>
          </div>
        </div>

        <div
          className="
            absolute
            bottom-0
            left-0
            h-[2px]
            w-0
            bg-white
            transition-all
            duration-500
            group-hover:w-full
          "
        />
      </article>
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="
        team-root
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        bg-black
        text-white
      "
    >
      <style>{shatterStyles}</style>

      {shattering && (
        <div className="team-shatter-overlay">
          <div className="team-shatter-flash" />
          <div className="team-shatter-piece one" />
          <div className="team-shatter-piece two" />
          <div className="team-shatter-piece three" />
        </div>
      )}

      {/* MERCHENDISE.JSX BACKGROUND — EXACT STARFIELD */}

      {/* CINEMATIC GRID */}
      <div
        className="pointer-events-none fixed inset-0 z-[2] opacity-[.055]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* AMBIENT LIGHT */}
      <div className="ambient-glow pointer-events-none fixed left-[8%] top-[18%] z-[2] h-[320px] w-[420px] rounded-full bg-white/[.075] blur-[120px]" />
      <div className="ambient-glow pointer-events-none fixed bottom-[5%] right-[7%] z-[2] h-[340px] w-[430px] rounded-full bg-white/[.055] blur-[130px]" />

      <Navbar />

      <main
        className="
          relative
          z-20
          mx-auto
          flex
          min-h-screen
          w-[92%]
          max-w-7xl
          flex-col
          items-center
          px-2
          pb-28
          pt-36
          sm:pt-40
        "
      >
        {/* MAIN HEADING */}

        <section
          className={`
            flex
            flex-col
            items-center
            text-center
            transition-all
            duration-1000
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              visible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-16 scale-95 opacity-0"
            }
          `}
        >
          <div className="mb-5 flex items-center gap-3">
            <span
              className="
                h-[1px]
                w-10
                bg-gradient-to-r
                from-transparent
                to-white/60
              "
            />

            <p
              className="
                m-0
                text-[9px]
                font-bold
                uppercase
                tracking-[0.42em]
                text-white/45
              "
            >
              <span className="team-samurai-label">
                NITS ESPORTS
              </span>
            </p>

            <span
              className="
                h-[1px]
                w-10
                bg-gradient-to-l
                from-transparent
                to-white/60
              "
            />
          </div>

          <div className="team-title-animated relative inline-block">
            <svg
              className="team-title-svg"
              viewBox="0 0 1000 250"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="teamTitleFillGradient"
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
                  id="teamTitleInnerGradient"
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
                  id="teamTitleShineGradient"
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
                  id="teamPremiumTitleShadow"
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
                    floodOpacity=".95"
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
                y="88"
                textAnchor="middle"
                fontFamily="The Last Shuriken, sans-serif"
                fontSize="92"
                fontWeight="700"
                className="team-title-text team-title-base"
              >
                MEET OUR
              </text>

              <text
                x="50%"
                y="88"
                textAnchor="middle"
                fontFamily="The Last Shuriken, sans-serif"
                fontSize="92"
                fontWeight="700"
                className="team-title-text team-title-inner"
              >
                MEET OUR
              </text>

              <text
                x="50%"
                y="88"
                textAnchor="middle"
                fontFamily="The Last Shuriken, sans-serif"
                fontSize="92"
                fontWeight="700"
                className="team-title-text team-title-shine-svg"
              >
                MEET OUR
              </text>

              <text
                x="50%"
                y="190"
                textAnchor="middle"
                fontFamily="The Last Shuriken, sans-serif"
                fontSize="92"
                fontWeight="700"
                className="team-title-text team-title-base"
              >
                CORE TEAM
              </text>

              <text
                x="50%"
                y="190"
                textAnchor="middle"
                fontFamily="The Last Shuriken, sans-serif"
                fontSize="92"
                fontWeight="700"
                className="team-title-text team-title-inner"
              >
                CORE TEAM
              </text>

              <text
                x="50%"
                y="190"
                textAnchor="middle"
                fontFamily="The Last Shuriken, sans-serif"
                fontSize="92"
                fontWeight="700"
                className="team-title-text team-title-shine-svg"
              >
                CORE TEAM
              </text>
            </svg>
          </div>

          <div
            className="
              mt-8
              flex
              w-[240px]
              items-center
              gap-3
              sm:w-[360px]
            "
          >
            <div
              className="
                team-section-line
                h-[1px]
                flex-1
                bg-gradient-to-r
                from-transparent
                to-white/60
              "
            />

            <div
              className="
                h-2
                w-2
                rotate-45
                border
                border-white/70
                bg-black
              "
            />

            <div
              className="
                team-section-line
                h-[1px]
                flex-1
                bg-gradient-to-l
                from-transparent
                to-white/60
              "
            />
          </div>

          <p
            className="
              mt-6
              max-w-xl
              text-xs
              leading-6
              tracking-wide
              text-white/40
              sm:text-sm
            "
          >
            The minds behind NITS Esports — building,
            competing and shaping the future of campus
            esports.
          </p>
        </section>

        {/* YEAR SELECTOR */}

        <div
          className={`
            mt-16
            flex
            w-full
            max-w-4xl
            flex-col
            items-center
            transition-all
            delay-200
            duration-1000
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              visible
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }
          `}
        >
          <div
            className="
              relative
              flex
              w-full
              flex-col
              overflow-hidden
              rounded-[3px]
              border
              border-white/[0.10]
              bg-black/45
              p-1
              backdrop-blur-xl
              sm:flex-row
            "
          >
            {teamSections.map((section, index) => (
              <button
                key={section.title}
                type="button"
                onClick={() => setActiveYear(index)}
                className={`
                  relative
                  flex-1
                  overflow-hidden
                  px-5
                  py-4
                  team-year-button
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.20em]
                  transition-all
                  duration-500
                  ${
                    activeYear === index
                      ? "team-year-button-active"
                      : "border-transparent text-white/45 hover:bg-white/[0.06] hover:text-white"
                  }
                `}
              >
                <span className="relative z-10">
                  {section.title.replace(" MEMBERS", "")}
                </span>

                <span
                  className={`
                    absolute
                    bottom-0
                    left-1/2
                    h-[2px]
                    -translate-x-1/2
                    transition-all
                    duration-500
                    ${
                      activeYear === index
                        ? "w-12 bg-black"
                        : "w-0 bg-white"
                    }
                  `}
                />
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="h-[1px] w-8 bg-white/20" />

            <span
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.35em]
                text-white/25
              "
            >
              SELECT YOUR YEAR
            </span>

            <span className="h-[1px] w-8 bg-white/20" />
          </div>
        </div>

        {/* ACTIVE TEAM */}

        <section
          key={teamSections[activeYear].title}
          className="
            mt-14
            w-full
            animate-[teamTabIn_.65s_cubic-bezier(.22,1,.36,1)]
          "
        >
          <div
            className="
              mb-8
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <div
                className="
                  mb-3
                  flex
                  items-center
                  gap-3
                "
              >
                <span className="h-[1px] w-8 bg-white/50" />

                <span
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.35em]
                    text-white/35
                  "
                >
                  {teamSections[activeYear].subtitle}
                </span>
              </div>

              <h2
                className="
                  team-samurai-title
                  m-0
                  text-3xl
                  font-bold
                  uppercase
                  tracking-[-0.035em]
                  text-white
                  sm:text-4xl
                  md:text-5xl
                "
              >
                {teamSections[activeYear].title}
              </h2>
            </div>

            <div
              className="
                flex
                items-center
                gap-3
                text-[9px]
                font-bold
                uppercase
                tracking-[0.3em]
                text-white/25
              "
            >
              <span>
                SECTION {String(activeYear + 1).padStart(2, "0")}
              </span>

              <span className="h-[1px] w-12 bg-white/15" />
            </div>
          </div>

          <div
            className="
              mb-8
              h-[1px]
              w-full
              bg-gradient-to-r
              from-white/30
              via-white/10
              to-transparent
            "
          />

          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              lg:grid-cols-4
              xl:grid-cols-4
            "
          >
            {teamSections[activeYear].members.map(
              (member, index) => (
                <MemberCard
                  key={`${teamSections[activeYear].title}-${index}`}
                  member={member}
                  globalIndex={
                    teamSections
                      .slice(0, activeYear)
                      .reduce(
                        (total, item) =>
                          total + item.members.length,
                        0
                      ) + index
                  }
                />
              )
            )}
          </div>
        </section>

        {/* BOTTOM MESSAGE */}

        <section
          className="
            mt-28
            flex
            flex-col
            items-center
            text-center
          "
        >
          <div
            className="
              mb-7
              h-[1px]
              w-20
              bg-gradient-to-r
              from-transparent
              via-white
              to-transparent
            "
          />

          <h2
            className="
              team-samurai-title
              m-0
              text-3xl
              font-bold
              uppercase
              tracking-[-0.04em]
              text-white
              sm:text-5xl
            "
          >
            ONE TEAM.
            <span className="text-white/35">
              {" "}ONE VISION.
            </span>
          </h2>

          <p
            className="
              mt-4
              text-[10px]
              uppercase
              tracking-[0.3em]
              text-white/30
            "
          >
            Built to compete. Built to last.
          </p>
        </section>

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={goHome}
          className="
            group
            mt-12
            flex
            items-center
            gap-3
            border
            border-white/10
            bg-black/50
            px-7
            py-3
            text-[10px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-white/55
            backdrop-blur-md
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-white/35
            hover:bg-white
            hover:text-black
          "
        >
          <ArrowLeft
            size={16}
            strokeWidth={1.8}
            className="
              transition-transform
              duration-300
              group-hover:-translate-x-1
            "
          />

          BACK TO HOME
        </button>
      </main>

      {/* BOTTOM STEEL LINE */}

      <div
        className="
          fixed
          bottom-0
          left-0
          z-50
          h-[1px]
          w-full
          bg-white/40
          shadow-[0_0_12px_rgba(255,255,255,.25)]
        "
      />
    </div>
  );
};

export default Team;

