import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import loginVideo from "../assets/v8.mp4";

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  /* =====================================================
     PAGE ANIMATION
  ===================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 120);

    return () => clearTimeout(timer);
  }, []);

  /* =====================================================
     CHECK EXISTING SESSION
     
     If user is already logged in, don't show
     login page again.
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error(
          "Session check error:",
          err
        );
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /* =====================================================
     EMAIL + PASSWORD LOGIN
  ===================================================== */

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (loginError) {
        throw loginError;
      }

      if (!data?.user) {
        throw new Error(
          "Login failed. Please try again."
        );
      }

      /*
        Supabase has now created the session.

        Your Navbar is listening to:
        supabase.auth.onAuthStateChange()

        So Navbar will automatically change:
        LOGIN -> LOGGED IN
      */

      setMessage("Login successful!");

      /*
        Give Navbar a moment to receive the
        auth state update.
      */

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      let errorMessage =
        "Unable to login. Please check your email and password.";

      if (
        err?.message?.toLowerCase().includes(
          "invalid login credentials"
        )
      ) {
        errorMessage =
          "Invalid email or password.";
      }

      if (
        err?.message?.toLowerCase().includes(
          "email not confirmed"
        )
      ) {
        errorMessage =
          "Please verify your email before logging in.";
      }

      setError(
        err?.message &&
        !err.message.toLowerCase().includes(
          "invalid login credentials"
        ) &&
        !err.message.toLowerCase().includes(
          "email not confirmed"
        )
          ? err.message
          : errorMessage
      );

    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     GOOGLE LOGIN
  ===================================================== */

  const handleGoogleLogin = async () => {
    setError("");
    setMessage("");
    setGoogleLoading(true);

    try {
      const {
        error: googleError,
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (googleError) {
        throw googleError;
      }

    } catch (err) {
      console.error(
        "Google login error:",
        err
      );

      setGoogleLoading(false);

      setError(
        err?.message ||
          "Google login could not be started."
      );
    }
  };

  /* =====================================================
     FORGOT PASSWORD
  ===================================================== */

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        "Enter your email first to reset your password."
      );
      return;
    }

    try {
      const {
        error: resetError,
      } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo:
              `${window.location.origin}/login`,
          }
        );

      if (resetError) {
        throw resetError;
      }

      setMessage(
        "Password reset email sent. Check your inbox."
      );

    } catch (err) {
      console.error(
        "Password reset error:",
        err
      );

      setError(
        err?.message ||
          "Unable to send password reset email."
      );
    }
  };

  return (
    <div
      className="
        login-page
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        overflow-y-auto
        bg-black
        text-white
      "
    >

      {/* =====================================================
          DARK SAMURAI THEME
      ===================================================== */}

      <style>{`
        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');

        .login-page,
        .login-page *,
        .login-page h1,
        .login-page h2,
        .login-page h3,
        .login-page p,
        .login-page span,
        .login-page button,
        .login-page a,
        .login-page input {
          font-family: "The Last Shuriken", sans-serif !important;
          box-sizing: border-box;
        }

        .login-page {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.30) rgba(0,0,0,.65);
        }

        .login-page::-webkit-scrollbar {
          width: 7px;
        }

        .login-page::-webkit-scrollbar-track {
          background: rgba(0,0,0,.65);
        }

        .login-page::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.30);
          border-radius: 999px;
        }

        .login-page::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,.55);
        }

        .samurai-login-card {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.075),
              rgba(255,255,255,.025) 48%,
              rgba(255,255,255,.045)
            );
          border: 1px solid rgba(255,255,255,.105);
          box-shadow:
            0 28px 80px rgba(0,0,0,.58),
            inset 0 1px 0 rgba(255,255,255,.09),
            inset 0 -1px 0 rgba(255,255,255,.02);
          backdrop-filter: blur(18px) saturate(120%);
          -webkit-backdrop-filter: blur(18px) saturate(120%);
        }

        .samurai-login-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(255,255,255,.075),
              transparent 34%
            ),
            linear-gradient(
              135deg,
              transparent 60%,
              rgba(255,255,255,.025)
            );
        }

        .samurai-login-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.52),
              rgba(255,255,255,.16),
              transparent
            );
          opacity: .7;
          pointer-events: none;
        }

        .samurai-login-title {
          font-family: "The Last Shuriken", sans-serif !important;
          font-weight: 700;
          letter-spacing: .025em;
          color: rgba(255,255,255,.92);
          text-shadow:
            0 4px 0 rgba(0,0,0,.72),
            0 7px 18px rgba(0,0,0,.72),
            0 0 12px rgba(255,255,255,.10);
        }

        .samurai-login-field {
          border: 1px solid rgba(255,255,255,.105) !important;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.045),
              rgba(0,0,0,.27)
            ) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.045),
            0 12px 35px rgba(0,0,0,.20);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .samurai-login-field:focus {
          border-color: rgba(255,255,255,.28) !important;
          background: rgba(255,255,255,.045) !important;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.06),
            0 12px 35px rgba(0,0,0,.28),
            inset 0 1px 0 rgba(255,255,255,.08);
        }

        .samurai-login-button {
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.16),
              rgba(255,255,255,.055) 48%,
              rgba(0,0,0,.20)
            ) !important;
          border: 1px solid rgba(255,255,255,.18) !important;
          box-shadow:
            0 18px 50px rgba(0,0,0,.48),
            inset 0 1px 0 rgba(255,255,255,.12);
          text-shadow: 0 2px 7px rgba(0,0,0,.8);
        }

        .samurai-login-button:hover {
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.22),
              rgba(255,255,255,.07) 48%,
              rgba(0,0,0,.24)
            ) !important;
          border-color: rgba(255,255,255,.34) !important;
          box-shadow:
            0 22px 60px rgba(0,0,0,.60),
            0 0 35px rgba(255,255,255,.055),
            inset 0 1px 0 rgba(255,255,255,.16);
        }

        .samurai-login-tab-active {
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.16),
              rgba(255,255,255,.045)
            ) !important;
          border: 1px solid rgba(255,255,255,.16);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.12),
            0 10px 30px rgba(0,0,0,.32);
          color: white !important;
        }

        .samurai-login-google {
          background: rgba(0,0,0,.27) !important;
          border: 1px solid rgba(255,255,255,.075) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.05),
            0 15px 40px rgba(0,0,0,.25);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .samurai-login-google:hover {
          background: rgba(255,255,255,.045) !important;
          border-color: rgba(255,255,255,.18) !important;
        }

        html { overflow-y: auto; }
        body {
          margin: 0;
          overflow-y: auto;
          background: #000;
        }
      `}</style>

      {/* =====================================================
          BACKGROUND VIDEO
      ===================================================== */}

      <video
        className="
          fixed
          inset-0
          z-0
          h-full
          w-full
          object-cover
        "
        src={loginVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      {/* =====================================================
          DARK OVERLAY
      ===================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-[1]
          bg-black/60
        "
      />

      {/* =====================================================
          DARK SAMURAI CINEMATIC VEIL
      ===================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-[1]
          bg-black/55
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-[2]
          bg-gradient-to-b
          from-black/30
          via-black/10
          to-black/85
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-[2]
          bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,.075),transparent_40%)]
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-[2]
          bg-[linear-gradient(90deg,rgba(0,0,0,.25),transparent_25%,transparent_75%,rgba(0,0,0,.25))]
        "
      />

            {/* =====================================================
          MAIN CONTENT

          Navbar ke liye top space maintained.
      ===================================================== */}

      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[20] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-[20] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden="true"
      />

      <main
        className="
          relative
          z-10
          min-h-screen
          px-4
          pb-12
          pt-[125px]
          sm:px-6
          sm:pt-[135px]
          lg:pt-[145px]
        "
      >

        <div
          className="
            flex
            min-h-[calc(100vh-175px)]
            items-center
            justify-center
          "
        >

          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div
            className={`
              relative
              mb-8
              w-full
              max-w-[510px]
              overflow-hidden
              rounded-[22px]
              samurai-login-card
              p-6
              transition-all
              duration-700
              ease-out
              sm:p-8
              md:p-9

              ${
                isVisible
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-8 scale-[0.96] opacity-0"
              }
            `}
          >



            {/* =================================================
                HEADING
            ================================================= */}

            <div className="relative mb-8 text-center">

              <h1
                className="
                  samurai-login-title
                  text-[46px]
                  leading-none
                  sm:text-[54px]
                "
              >
                LOGIN
              </h1>

              <div
                className="
                  mx-auto
                  mt-4
                  h-px
                  w-20
                  bg-gradient-to-r
                  from-transparent
                  via-white/70
                  to-transparent
                  shadow-[0_0_12px_rgba(255,255,255,.18)]
                "
              />

              <p
                className="
                  mt-4
                  text-sm
                  text-white/55
                  sm:text-[15px]
                "
              >
                Welcome back. Sign in to continue.
              </p>

            </div>

            {/* =================================================
                USER / ADMIN
            ================================================= */}

            <div
              className="
                mb-6
                rounded-xl
                border
                border-white/[0.075]
                bg-black/[0.27]
                p-1
                backdrop-blur-xl
              "
            >

              <div className="grid grid-cols-2 gap-1">

                {/* USER */}

                <button
                  type="button"
                  onClick={() => {
                    setRole("user");
                    setError("");
                    setMessage("");
                  }}
                  className={`
                    rounded-xl
                    py-3
                    text-sm
                    font-semibold
                    transition-all
                    duration-300

                    ${
                      role === "user"
                        ? `
                          samurai-login-tab-active
                        `
                        : `
                          text-white/45
                          hover:bg-white/[0.05]
                          hover:text-white
                        `
                    }
                  `}
                >
                  USER
                </button>

                {/* ADMIN */}

                <button
                  type="button"
                  onClick={() => {
                    setRole("admin");
                    setError("");
                    setMessage("");
                  }}
                  className={`
                    rounded-xl
                    py-3
                    text-sm
                    font-semibold
                    transition-all
                    duration-300

                    ${
                      role === "admin"
                        ? `
                          samurai-login-tab-active
                        `
                        : `
                          text-white/45
                          hover:bg-white/[0.05]
                          hover:text-white
                        `
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

            <form onSubmit={handleLogin}>

              {/* EMAIL */}

              <div className="mb-5">

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

                <div className="relative">

                  <span
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-white/35
                    "
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 16.5v-9z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 7l8 6 8-6"
                      />
                    </svg>
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="
                      w-full
                      rounded-xl
                      samurai-login-field
                      py-4
                      pl-12
                      pr-4
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-white/25
                      backdrop-blur-xl
                      transition-all
                      duration-300

                    "
                  />

                </div>
              </div>

              {/* PASSWORD */}

              <div className="mb-5">

                <div
                  className="
                    mb-2
                    flex
                    items-center
                    justify-between
                  "
                >

                  <label
                    htmlFor="password"
                    className="
                      text-xs
                      font-semibold
                      tracking-[0.12em]
                      text-white/65
                    "
                  >
                    PASSWORD
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="
                      text-[11px]
                      font-medium
                      text-white/35
                      transition
                      hover:text-white
                    "
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <span
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-white/35
                    "
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10V7a4 4 0 018 0v3"
                      />
                    </svg>
                  </span>

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
                    autoComplete="current-password"
                    className="
                      w-full
                      rounded-xl
                      samurai-login-field
                      py-4
                      pl-12
                      pr-12
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-white/20
                      backdrop-blur-xl
                      transition-all
                      duration-300

                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-white/30
                      transition
                      hover:text-white
                    "
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.6 10.6a2 2 0 102.8 2.8"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                        />
                      </svg>
                    )}
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
                    border-white/[0.10]
                    bg-black/[0.25]
                    px-4
                    py-3
                    text-sm
                    text-white/70
                  "
                >
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {message && (
                <div
                  className="
                    mb-4
                    rounded-xl
                    border
                    border-white/[0.10]
                    bg-white/[0.035]
                    px-4
                    py-3
                    text-sm
                    text-white/70
                  "
                >
                  {message}
                </div>
              )}

              {/* =================================================
                  LOGIN BUTTON
              ================================================= */}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="
                  group
                  relative
                  w-full
                  overflow-hidden
                  samurai-login-button
                  rounded-xl
                  py-4
                  text-sm
                  font-bold
                  tracking-[0.16em]
                  text-white
                  transition-all
                  duration-300
                  hover:scale-[1.01]

                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                <span className="relative z-10">

                  {loading ? (
                    <span
                      className="
                        flex
                        items-center
                        justify-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          h-5
                          w-5
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      LOGGING IN...
                    </span>
                  ) : (
                    "LOGIN"
                  )}

                </span>

                <span
                  className="
                    absolute
                    inset-0
                    -translate-x-full
                    bg-white/20
                    transition-transform
                    duration-700
                    group-hover:translate-x-full
                  "
                />

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

              <div
                className="
                  h-px
                  flex-1
                  bg-white/[0.10]
                "
              />

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

              <div
                className="
                  h-px
                  flex-1
                  bg-white/[0.10]
                "
              />

            </div>

            {/* =================================================
                GOOGLE LOGIN
            ================================================= */}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-3
                samurai-login-google
                rounded-xl
                py-4
                text-sm
                font-semibold
                text-white/75
                backdrop-blur-xl
                transition-all
                duration-300
                hover:border-white/[0.22]
                hover:bg-white/[0.07]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-60
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

              {googleLoading
                ? "CONNECTING..."
                : "CONTINUE WITH GOOGLE"}

            </button>

            {/* =================================================
                SIGN UP
            ================================================= */}

            <div className="mt-7 text-center">

              <p
                className="
                  text-sm
                  text-white/40
                "
              >
                Don't have an account?

                <Link
                  to="/register"
                  className="
                    ml-2
                    font-semibold
                    text-white/75
                    transition-colors
                    hover:text-white
                  "
                >
                  Sign Up
                </Link>

              </p>

            </div>

            {/* =================================================
                BOTTOM GRADIENT
            ================================================= */}

            <div
              className="
                mx-auto
                mt-7
                h-px
                w-24
                bg-gradient-to-r
                from-transparent
                via-white/55
                to-transparent
                shadow-[0_0_12px_rgba(255,255,255,.18)]
              "
            />

          </div>

        </div>

      </main>

    </div>
  );
};

export default Login;