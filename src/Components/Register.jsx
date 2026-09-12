import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Register = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  /* =====================================================
     MERCHENDISE STARFIELD BACKGROUND + SCROLL EFFECT
  ===================================================== */

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

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.25)
    );
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMappingExposure = 1.15;

    const particleCount = 1400;
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const index = i * 3;

      const radius =
        0.2 + Math.pow(Math.random(), 0.52) * 11.5;

      const angle = Math.random() * Math.PI * 2;

      positions[index] =
        Math.cos(angle) * radius;

      positions[index + 1] =
        Math.sin(angle) * radius;

      positions[index + 2] =
        -10 + Math.random() * 12;

      particleSpeeds[i] =
        0.008 + Math.random() * 0.035;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.085,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(
      geometry,
      material
    );

    scene.add(particles);

    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;

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

    const handleMouseMove = (event) => {
      mouseX =
        (event.clientX / window.innerWidth - 0.5) * 2;

      mouseY =
        -((event.clientY / window.innerHeight - 0.5) * 2);
    };

    const handleResize = () => {
      camera.aspect =
        window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight,
        false
      );

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.25)
      );
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener(
      "mousemove",
      handleMouseMove,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      handleResize
    );

    const clock = new THREE.Clock();
    let time = 0;
    let animationFrame;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      const dt = Math.min(
        clock.getDelta(),
        0.033
      );

      time += dt;

      const damping = (speed) =>
        1 - Math.exp(-speed * dt);

      smoothX +=
        (mouseX - smoothX) * damping(9);

      smoothY +=
        (mouseY - smoothY) * damping(9);

      scrollCurrent +=
        (scrollTarget - scrollCurrent) *
        damping(5.5);

      const cameraZ =
        9 - scrollCurrent * 1.35;

      camera.position.z +=
        (cameraZ - camera.position.z) *
        damping(6);

      camera.position.x +=
        (smoothX * 0.18 - camera.position.x) *
        damping(4);

      camera.position.y +=
        (smoothY * 0.12 - camera.position.y) *
        damping(4);

      for (let i = 0; i < particleCount; i++) {
        const index = i * 3;

        let z =
          positions[index + 2] +
          particleSpeeds[i];

        if (z > 3) z = -10;

        positions[index + 2] = z;
      }

      geometry.attributes.position.needsUpdate = true;

      particles.rotation.z =
        time * 0.025;

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      canvas.remove();
    };
  }, []);


  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* =====================================================
     PAGE ANIMATION
  ===================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  /* =====================================================
     REGISTER
  ===================================================== */

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    /* -----------------------------
       VALIDATION
    ----------------------------- */

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      /* =================================================
         SUPABASE AUTH SIGN UP
      ================================================= */

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password: password,

          options: {
            data: {
              full_name: cleanName,
              role: role,
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      /* =================================================
         SUCCESS
      ================================================= */

      if (data?.session) {
        setMessage(
          "Account created successfully. Redirecting..."
        );

        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setMessage(
          "Account created! Please check your email to verify your account."
        );

        setTimeout(() => {
          navigate("/login");
        }, 2500);
      }
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     GOOGLE SIGN UP
  ===================================================== */

  const handleGoogleSignup = async () => {
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });

      if (googleError) {
        throw googleError;
      }
    } catch (err) {
      console.error("Google signup error:", err);

      setError(
        err?.message ||
          "Google signup failed. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <div
      className="
        register-page
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        overflow-y-scroll
        bg-[#05050a]
        text-white
      "
    >
      {/* =====================================================
          GOOGLE SANS
      ===================================================== */}

      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

        .register-page,
        .register-page *,
        .register-page h1,
        .register-page h2,
        .register-page h3,
        .register-page p,
        .register-page span,
        .register-page button,
        .register-page a,
        .register-page input,
        .register-page label {
          font-family: "The Last Shuriken", sans-serif !important;
          box-sizing: border-box;
        }

        .register-page {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.30) rgba(0,0,0,.65);
        }

        .register-page::-webkit-scrollbar {
          width: 7px;
        }

        .register-page::-webkit-scrollbar-track {
          background: rgba(0,0,0,.65);
        }

        .register-page::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.30);
          border-radius: 999px;
        }

        .register-page::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,.55);
        }

        .samurai-register-card {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          background: rgba(10,10,10,.72);
          border: 1px solid rgba(255,255,255,.105);
          box-shadow:
            0 28px 80px rgba(0,0,0,.58),
            inset 0 1px 0 rgba(255,255,255,.09),
            inset 0 -1px 0 rgba(255,255,255,.02);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .samurai-register-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background: radial-gradient(
            circle at 50% 0%,
            rgba(255,255,255,.075),
            transparent 34%
          );
        }

        .samurai-register-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 1px;
          background: rgba(255,255,255,.36);
          opacity: .75;
          pointer-events: none;
        }

        .samurai-register-title {
          font-family: "The Last Shuriken", sans-serif !important;
          font-weight: 700;
          letter-spacing: .025em;
          color: rgba(255,255,255,.94);
          text-shadow:
            0 4px 0 rgba(0,0,0,.72),
            0 7px 18px rgba(0,0,0,.72),
            0 0 12px rgba(255,255,255,.10);
        }

        .samurai-register-field {
          border: 1px solid rgba(255,255,255,.105) !important;
          background: rgba(0,0,0,.32) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.045),
            0 12px 35px rgba(0,0,0,.20);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .samurai-register-field:focus {
          border-color: rgba(255,255,255,.28) !important;
          background: rgba(255,255,255,.045) !important;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.06),
            0 12px 35px rgba(0,0,0,.28),
            inset 0 1px 0 rgba(255,255,255,.08);
        }

        .samurai-register-button {
          background: rgba(255,255,255,.10) !important;
          border: 1px solid rgba(255,255,255,.18) !important;
          box-shadow:
            0 18px 50px rgba(0,0,0,.48),
            inset 0 1px 0 rgba(255,255,255,.12);
          text-shadow: 0 2px 7px rgba(0,0,0,.8);
        }

        .samurai-register-button:hover {
          background: rgba(255,255,255,.16) !important;
          border-color: rgba(255,255,255,.34) !important;
          box-shadow:
            0 22px 60px rgba(0,0,0,.60),
            0 0 35px rgba(255,255,255,.055),
            inset 0 1px 0 rgba(255,255,255,.16);
        }

        .samurai-register-tab-active {
          background: rgba(255,255,255,.12) !important;
          border: 1px solid rgba(255,255,255,.16);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.12),
            0 10px 30px rgba(0,0,0,.32);
          color: white !important;
        }

        .samurai-register-google {
          background: rgba(0,0,0,.27) !important;
          border: 1px solid rgba(255,255,255,.075) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.05),
            0 15px 40px rgba(0,0,0,.25);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .samurai-register-google:hover {
          background: rgba(255,255,255,.045) !important;
          border-color: rgba(255,255,255,.18) !important;
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

        html { overflow-y: auto; }

        body {
          margin: 0;
          overflow-y: auto;
          background: #000;
        }
      `}</style>

      {/* =====================================================
          MERCHENDISE GRID + AMBIENT GLOWS
      ===================================================== */}

      <div
        className="pointer-events-none fixed inset-0 z-[2] opacity-[.055]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="pointer-events-none fixed left-[8%] top-[18%] z-[2] h-[320px] w-[420px] rounded-full bg-white/[.075] blur-[120px]" />

      <div className="pointer-events-none fixed bottom-[5%] right-[7%] z-[2] h-[340px] w-[430px] rounded-full bg-white/[.055] blur-[130px]" />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main
        className="
          relative
          z-10
          min-h-screen
          w-full
          px-4
          pb-16
          pt-[125px]
          sm:px-6
          sm:pt-[135px]
          md:pt-[145px]
        "
      >
        <div
          className="
            flex
            min-h-[calc(100vh-180px)]
            w-full
            items-center
            justify-center
          "
        >
          {/* =================================================
              REGISTER CARD
          ================================================= */}

          <div
            className={`
              relative
              mb-8
              w-full
              max-w-[530px]
              overflow-hidden
              rounded-[22px]
              samurai-register-card
              p-6
              transition-all
              duration-700
              sm:p-8
              md:p-9

              ${
                isVisible
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-8 scale-[0.96] opacity-0"
              }
            `}
          >
            {/* TOP LINE */}

            <div
              className="
                pointer-events-none
                absolute
                left-0
                right-0
                top-0
                h-px
                bg-white/35
              "
            />

            {/* =================================================
                HEADING
            ================================================= */}

            <div className="relative mb-7 text-center">

              <h1
                className="
                  samurai-register-title
                  text-[46px]
                  leading-none
                  sm:text-[54px]
                  sm:text-[50px]
                "
              >
                REGISTER
              </h1>

              <div
                className="
                  mx-auto
                  mt-4
                  h-px
                  w-20
                  bg-white/55
                  shadow-[0_0_12px_rgba(255,255,255,.16)]
                "
              />

              <p className="mt-4 text-sm text-white/55">
                Create your account and get started.
              </p>

            </div>

            {/* =================================================
                ROLE
            ================================================= */}

            <div
              className="
                mb-6
                rounded-2xl
                border
                border-white/[0.10]
                bg-black/[0.27]
                p-1
              "
            >
              <div className="grid grid-cols-2 gap-1">

                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`
                    rounded-xl
                    py-3
                    text-sm
                    font-semibold
                    transition-all

                    ${
                      role === "user"
                        ? "samurai-register-tab-active"
                        : "text-white/45 hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >
                  USER
                </button>

                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`
                    rounded-xl
                    py-3
                    text-sm
                    font-semibold
                    transition-all

                    ${
                      role === "admin"
                        ? "samurai-register-tab-active"
                        : "text-white/45 hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >
                  ADMIN
                </button>

              </div>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleRegister}>

              {/* FULL NAME */}

              <div className="mb-4">

                <label
                  htmlFor="name"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    tracking-[0.12em]
                    text-white/65
                  "
                >
                  FULL NAME
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  className="
                    w-full
                    rounded-2xl
                    samurai-register-field
                    px-4
                    py-4
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/25
                    backdrop-blur-xl
                    transition-all
                    
                    
                    
                  "
                />

              </div>

              {/* EMAIL */}

              <div className="mb-4">

                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    tracking-[0.12em]
                    text-white/65
                  "
                >
                  EMAIL
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="
                    w-full
                    rounded-2xl
                    samurai-register-field
                    px-4
                    py-4
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/25
                    backdrop-blur-xl
                    transition-all
                    
                    
                    
                  "
                />

              </div>

              {/* PASSWORD */}

              <div className="mb-4">

                <label
                  htmlFor="password"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    tracking-[0.12em]
                    text-white/65
                  "
                >
                  PASSWORD
                </label>

                <div className="relative">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="
                      w-full
                      rounded-2xl
                      samurai-register-field
                      px-4
                      py-4
                      pr-14
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-white/20
                      backdrop-blur-xl
                      transition-all
                      
                      
                      
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-white/35
                      hover:text-white
                    "
                  >
                    {showPassword ? "◉" : "○"}
                  </button>

                </div>
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="mb-5">

                <label
                  htmlFor="confirmPassword"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    tracking-[0.12em]
                    text-white/65
                  "
                >
                  CONFIRM PASSWORD
                </label>

                <div className="relative">

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="
                      w-full
                      rounded-2xl
                      samurai-register-field
                      px-4
                      py-4
                      pr-14
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-white/20
                      backdrop-blur-xl
                      transition-all
                      
                      
                      
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-white/35
                      hover:text-white
                    "
                  >
                    {showConfirmPassword
                      ? "◉"
                      : "○"}
                  </button>

                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div
                  className="
                    mb-4
                    rounded-xl
                    border
                    border-red-400/20
                    bg-red-500/[0.08]
                    px-4
                    py-3
                    text-sm
                    text-red-300
                  "
                >
                  {error}
                </div>
              )}

              {/* MESSAGE */}

              {message && (
                <div
                  className="
                    mb-4
                    rounded-xl
                    border
                    border-cyan-400/20
                    bg-cyan-400/[0.07]
                    px-4
                    py-3
                    text-sm
                    text-cyan-300
                  "
                >
                  {message}
                </div>
              )}

              {/* =================================================
                  CREATE ACCOUNT
              ================================================= */}

              <button
                type="submit"
                disabled={loading}
                className="
                  group
                  relative
                  w-full
                  overflow-hidden
                  samurai-register-button
                  rounded-xl
                  py-4
                  text-sm
                  font-bold
                  tracking-[0.14em]
                  text-white
                  shadow-[0_0_30px_rgba(168,85,247,0.28)]
                  transition-all
                  duration-300
                  hover:scale-[1.01]
                  hover:shadow-[0_0_45px_rgba(0,217,255,0.25)]
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "CREATING ACCOUNT..."
                  : "CREATE ACCOUNT"}
              </button>

            </form>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div
              className="
                my-6
                flex
                items-center
                gap-4
              "
            >
              <div className="h-px flex-1 bg-white/[0.10]" />

              <span
                className="
                  text-[10px]
                  font-semibold
                  tracking-[0.2em]
                  text-white/30
                "
              >
                OR
              </span>

              <div className="h-px flex-1 bg-white/[0.10]" />
            </div>

            {/* =================================================
                GOOGLE
            ================================================= */}

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                border
                border-white/[0.12]
                bg-white/[0.035]
                py-4
                text-sm
                font-semibold
                text-white/75
                backdrop-blur-xl
                transition-all
                hover:border-white/[0.22]
                hover:bg-white/[0.07]
                hover:text-white
                disabled:opacity-50
              "
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.23c0-.74-.07-1.45-.21-2.13H12v4.03h5.24a4.48 4.48 0 01-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.28z"
                />

                <path
                  fill="#34A853"
                  d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.75 9.75 0 0012 21.5z"
                />

                <path
                  fill="#FBBC05"
                  d="M6.54 13.59A5.86 5.86 0 016.23 12c0-.55.11-1.09.31-1.59V7.89H3.3A9.5 9.5 0 002.25 12c0 1.53.37 2.98 1.05 4.11l3.24-2.52z"
                />

                <path
                  fill="#EA4335"
                  d="M12 6.38c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.46 14.63 2.5 12 2.5a9.75 9.75 0 00-8.7 5.39l3.24 2.52C7.31 8.1 9.46 6.38 12 6.38z"
                />
              </svg>

              CONTINUE WITH GOOGLE
            </button>

            {/* =================================================
                LOGIN
            ================================================= */}

            <div className="mt-7 text-center">

              <p className="text-sm text-white/40">
                Already have an account?

                <Link
                  to="/login"
                  className="
                    ml-2
                    font-semibold
                    text-white/75
                    transition-colors
                    hover:text-white
                  "
                >
                  Login
                </Link>
              </p>

            </div>

            {/* BOTTOM LINE */}

            <div
              className="
                mx-auto
                mt-7
                h-px
                w-24
                bg-white/55
                shadow-[0_0_12px_rgba(255,255,255,.18)]
              "
            />

          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;