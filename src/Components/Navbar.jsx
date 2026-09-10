import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  UserCircle,
  LogOut,
  Upload,
} from "lucide-react";

import { supabase } from "../supabaseClient";
import clubLogo from "../assets/logoo.png";
import instagramLogo from "../assets/insw.png";
import facebookLogo from "../assets/fbw.png";
import linkedinLogo from "../assets/liw.png";
import youtubeLogo from "../assets/ytw.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const location = useLocation();

  const currentPath =
    location.pathname.replace(/\/+$/, "") || "/";

  const isHome = currentPath === "/";
  const isTeam = currentPath === "/team";
  const isEvents = currentPath === "/events";
  const isAbout = currentPath === "/about";
  const isMerchandise = currentPath === "/merchandise";
  const isSchedule = currentPath === "/schedule";
  const isLogin = currentPath === "/login";
  const isRegister =
    currentPath === "/register" ||
    currentPath === "/register-test";

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(session);

        if (session?.user) {
          loadProfilePhoto(session.user);
        }
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (newSession?.user) {
          await loadProfilePhoto(newSession.user);
        } else {
          setProfilePhoto(null);
          setProfileOpen(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfilePhoto = async (user) => {
    if (!user) return;

    try {
      const metadataPhoto =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null;

      if (metadataPhoto) {
        setProfilePhoto(metadataPhoto);
        return;
      }

      const fileName = `${user.id}/avatar`;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      if (data?.publicUrl) {
        setProfilePhoto(data.publicUrl);
      }
    } catch (error) {
      console.error("Profile photo load error:", error);
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      setSession(null);
      setProfilePhoto(null);
      setProfileOpen(false);
      closeMenu();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !session?.user) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Profile photo must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const userId = session.user.id;
      const fileExt =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath =
        `${userId}/avatar-${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Unable to get profile photo URL."
        );
      }

      const finalUrl =
        `${publicUrl}?t=${Date.now()}`;

      setProfilePhoto(finalUrl);

      const {
        error: metadataError,
      } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        },
      });

      if (metadataError) {
        console.error(
          "Metadata update error:",
          metadataError
        );
      }
    } catch (error) {
      console.error(
        "Profile upload error:",
        error
      );

      alert(
        error?.message ||
          "Unable to upload profile photo."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getUserInitial = () => {
    const fullName =
      session?.user?.user_metadata?.full_name;

    if (fullName) {
      return fullName
        .charAt(0)
        .toUpperCase();
    }

    const email =
      session?.user?.email || "";

    return email
      ? email.charAt(0).toUpperCase()
      : "U";
  };

  return (
    <>
      <style>{`

        @import url(
          'https://fonts.cdnfonts.com/css/the-last-shuriken'
        );

        @import url(
          'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap'
        );

        /* =====================================================
           SAMURAI NAVBAR BASE
        ===================================================== */

        .gaming-navbar {
          font-family: 'The Last Shuriken', sans-serif;
          font-variant-numeric: tabular-nums;
          letter-spacing: .035em;
        }

        .gaming-navbar .navbar-link,
        .gaming-navbar .login-link,
        .gaming-navbar .mobile-navbar a,
        .gaming-navbar .profile-action,
        .gaming-navbar .profile-email {
          font-family: 'The Last Shuriken', sans-serif;
        }

        /* =====================================================
           NAV TEXT
        ===================================================== */

        .navbar-link,
        .login-link,
        .mobile-navbar a {
          text-shadow:
            0 1px 0 rgba(255,255,255,.12),
            0 3px 10px rgba(0,0,0,.90);

          transition:
            color .25s ease,
            transform .25s ease,
            text-shadow .25s ease;
        }

        .navbar-link.active,
        .navbar-link:hover,
        .login-link {
          background-image:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #e4e4e4 38%,
              #a1a1a1 65%,
              #555555 100%
            );

          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;

          text-shadow:
            0 0 12px rgba(255,255,255,.10);
        }

        /* =====================================================
           SAMURAI BLADE LINE ABOVE NAV TEXT
        ===================================================== */

        .navbar-link::before {
          content: "";

          position: absolute;
          left: 0;
          right: 0;
          top: 5px;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.05) 10%,
              rgba(255,255,255,.65) 50%,
              rgba(255,255,255,.05) 90%,
              transparent
            );

          opacity: 0;
          transform: scaleX(.45);

          transition:
            opacity .25s ease,
            transform .35s cubic-bezier(.22,1,.36,1);
        }

        .navbar-link:hover::before,
        .navbar-link.active::before {
          opacity: 1;
          transform: scaleX(1);
        }

        /* =====================================================
           MAIN NAVBAR BODY
        ===================================================== */

        .navbar-body {
          position: relative;
          overflow: visible !important;

          background:
            linear-gradient(
              115deg,
              rgba(0,0,0,.985) 0%,
              rgba(8,8,8,.98) 24%,
              rgba(20,20,20,.96) 50%,
              rgba(7,7,7,.985) 76%,
              rgba(0,0,0,.99) 100%
            );

          border:
            1px solid rgba(255,255,255,.13);

          backdrop-filter:
            blur(24px)
            saturate(70%);

          -webkit-backdrop-filter:
            blur(24px)
            saturate(70%);

          box-shadow:
            0 22px 65px rgba(0,0,0,.72),
            0 5px 20px rgba(0,0,0,.65),
            inset 0 1px 0 rgba(255,255,255,.09),
            inset 0 -1px 0 rgba(255,255,255,.035);

          border-radius: 0 0 18px 18px;
        }

        /* Forged steel texture */

        .navbar-body::before {
          content: "";

          position: absolute;
          inset: 0;

          pointer-events: none;

          border-radius: inherit;

          background:
            repeating-linear-gradient(
              115deg,
              transparent 0px,
              transparent 7px,
              rgba(255,255,255,.018) 8px,
              transparent 9px,
              transparent 17px
            );

          opacity: .65;

          mix-blend-mode: screen;
        }

        /* Outer samurai edge */

        .navbar-body::after {
          content: "";

          position: absolute;

          left: 2.5%;
          right: 2.5%;
          bottom: 1px;

          height: 1px;

          pointer-events: none;

          background:
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,255,255,.04) 12%,
              rgba(255,255,255,.18) 30%,
              rgba(255,255,255,.60) 50%,
              rgba(255,255,255,.18) 70%,
              rgba(255,255,255,.04) 88%,
              transparent 100%
            );

          box-shadow:
            0 0 12px rgba(255,255,255,.10);
        }

        /* =====================================================
           TOP LINE
        ===================================================== */

        .navbar-body > div:first-child {
          opacity: .8;
        }

        /* =====================================================
           NAVBAR ENTRY
        ===================================================== */

        @keyframes navbarEnter {
          from {
            opacity: 0;
            transform: translateY(-45px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .navbar-enter {
          animation:
            navbarEnter
            .8s
            cubic-bezier(.16,1,.3,1);
        }

        /* =====================================================
           NAV LINK
        ===================================================== */

        .navbar-link {
          position: relative;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          height: 42px;
          padding: 0 2px;

          text-decoration: none;
          line-height: 1;
          white-space: nowrap;
          cursor: pointer;

          transition:
            color .25s ease,
            transform .25s ease,
            filter .25s ease;
        }

        /* Blade underline */

        .navbar-link::after {
          content: "";

          position: absolute;
          left: 50%;
          bottom: 3px;

          width: 0;
          height: 2px;

          transform: translateX(-50%);

          border-radius: 999px;

          background:
            linear-gradient(
              90deg,
              #4b4b4b,
              #bcbcbc,
              #ffffff,
              #bcbcbc,
              #4b4b4b
            );

          box-shadow:
            0 0 5px rgba(255,255,255,.22),
            0 0 12px rgba(255,255,255,.10);

          opacity: 0;

          transition:
            width .35s cubic-bezier(.22,1,.36,1),
            opacity .25s ease;
        }

        .navbar-link.active::after,
        .navbar-link:hover::after {
          width: 100%;
          opacity: 1;
        }

        .navbar-link:hover {
          transform: translateY(-1px);
          filter: brightness(1.12);
        }

        /* =====================================================
           SEARCH BUTTON
        ===================================================== */

        .gaming-navbar button[aria-label="Search"] {
          position: relative;

          border-radius: 8px;

          transition:
            color .25s ease,
            transform .25s ease,
            background .25s ease;
        }

        .gaming-navbar button[aria-label="Search"]::before {
          content: "";

          position: absolute;
          inset: 4px;

          border: 1px solid rgba(255,255,255,.045);
          border-radius: 7px;

          opacity: 0;
          transition: opacity .25s ease;
        }

        .gaming-navbar button[aria-label="Search"]:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,.025);
        }

        .gaming-navbar button[aria-label="Search"]:hover::before {
          opacity: 1;
        }

        /* =====================================================
           SOCIAL ICONS
        ===================================================== */

        .social-logo {
          width: 15px;
          height: 15px;

          object-fit: contain;
          display: block;

          opacity: .65;

          filter:
            grayscale(1)
            brightness(1.35);

          transition:
            opacity .25s ease,
            transform .25s ease,
            filter .25s ease;
        }

        .social-logo:hover {
          opacity: 1;

          transform:
            translateY(-1px)
            scale(1.08);

          filter:
            grayscale(1)
            brightness(1.8)
            drop-shadow(0 0 5px rgba(255,255,255,.18));
        }

        /* =====================================================
           LOGIN BUTTON
        ===================================================== */

        .login-link {
          position: relative;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          height: 36px;
          padding: 0 18px;

          margin-left: 4px;

          text-decoration: none;
          line-height: 1;
          white-space: nowrap;
          cursor: pointer;

          color: #fff;

          font-size: 11px;
          font-weight: 700;
          letter-spacing: .14em;

          border:
            1px solid rgba(255,255,255,.16);

          border-radius: 6px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.055),
              rgba(30,30,30,.92),
              rgba(0,0,0,.98)
            );

          box-shadow:
            0 8px 22px rgba(0,0,0,.42),
            inset 0 1px 0 rgba(255,255,255,.08),
            inset 0 -1px 0 rgba(0,0,0,.8);

          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease,
            background .25s ease;
        }

        .login-link::before {
          content: "";

          position: absolute;
          inset: -1px;

          border-radius: 6px;
          padding: 1px;

          background:
            linear-gradient(
              105deg,
              rgba(60,60,60,.85),
              rgba(255,255,255,.62),
              rgba(70,70,70,.90),
              rgba(20,20,20,.95)
            );

          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);

          -webkit-mask-composite: xor;
          mask-composite: exclude;

          opacity: .42;

          pointer-events: none;
        }

        .login-link::after {
          content: "";

          position: absolute;

          left: 15%;
          right: 15%;
          bottom: 3px;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.55),
              transparent
            );

          opacity: .45;
        }

        .login-link:hover {
          transform: translateY(-1px);

          border-color:
            rgba(255,255,255,.30);

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.10),
              rgba(35,35,35,.94),
              rgba(0,0,0,.98)
            );

          box-shadow:
            0 10px 28px rgba(0,0,0,.55),
            0 0 20px rgba(255,255,255,.06),
            inset 0 1px 0 rgba(255,255,255,.12);
        }

        /* =====================================================
           PROFILE
        ===================================================== */

        .profile-wrapper {
          position: relative;

          display: flex;
          align-items: center;

          margin-left: 9px;
          padding-bottom: 14px;
          margin-bottom: -14px;
        }

        .profile-wrapper::after {
          content: "";

          position: absolute;

          left: -18px;
          right: -18px;
          top: 100%;

          height: 22px;

          pointer-events: auto;
        }

        .profile-button {
          position: relative;

          width: 39px;
          height: 39px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 50%;

          border:
            1px solid rgba(255,255,255,.25);

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.08),
              rgba(45,45,45,.50),
              rgba(0,0,0,.98)
            );

          box-shadow:
            0 8px 22px rgba(0,0,0,.55),
            0 0 16px rgba(255,255,255,.045),
            inset 0 1px 0 rgba(255,255,255,.12);

          cursor: pointer;

          transition:
            transform .25s ease,
            box-shadow .25s ease,
            border-color .25s ease;
        }

        .profile-button::before {
          content: "";

          position: absolute;
          inset: 2px;

          border-radius: 50%;

          border:
            1px solid rgba(255,255,255,.08);

          pointer-events: none;
        }

        .profile-button:hover {
          transform: scale(1.06);

          border-color:
            rgba(255,255,255,.38);

          box-shadow:
            0 10px 28px rgba(0,0,0,.65),
            0 0 25px rgba(255,255,255,.11),
            inset 0 1px 0 rgba(255,255,255,.16);
        }

        .profile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-initial {
          font-size: 14px;
          font-weight: 700;

          background:
            linear-gradient(
              135deg,
              #5b5b5b,
              #ffffff,
              #8b8b8b,
              #363636
            );

          -webkit-background-clip: text;
          background-clip: text;

          color: transparent;
        }

        /* =====================================================
           PROFILE DROPDOWN
        ===================================================== */

        .profile-dropdown {
          position: absolute;

          right: 0;
          top: calc(100% + 12px);

          width: 245px;

          padding: 12px;

          border:
            1px solid rgba(255,255,255,.14);

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              rgba(0,0,0,.985),
              rgba(17,17,17,.98),
              rgba(3,3,3,.995)
            );

          backdrop-filter: blur(26px);
          -webkit-backdrop-filter: blur(26px);

          box-shadow:
            0 28px 75px rgba(0,0,0,.78),
            0 0 35px rgba(255,255,255,.035),
            inset 0 1px 0 rgba(255,255,255,.08);

          z-index: 2147483647 !important;
          pointer-events: auto;
        }

        .profile-dropdown::before {
          content: "";

          position: absolute;

          top: -1px;
          left: 18%;
          right: 18%;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.45),
              transparent
            );
        }

        .profile-info {
          padding: 10px;

          border-bottom:
            1px solid rgba(255,255,255,.08);
        }

        .profile-email {
          margin-top: 3px;

          overflow: hidden;

          color: rgba(255,255,255,.42);

          font-size: 11px;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .profile-action {
          display: flex;
          width: 100%;

          align-items: center;
          gap: 10px;

          padding: 11px;

          margin-top: 5px;

          border-radius: 9px;

          color: rgba(255,255,255,.70);

          font-size: 12px;
          font-weight: 600;

          background: transparent;

          cursor: pointer;

          transition:
            background .2s ease,
            color .2s ease,
            transform .2s ease;
        }

        .profile-action:hover {
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,.055),
              rgba(255,255,255,.015)
            );

          color: #fff;

          transform: translateX(2px);
        }

        /* =====================================================
           CENTER LOGO
        ===================================================== */

        .center-logo {
          position: absolute;

          left: 50%;
          top: 0;

          width: 160px;
          height: 108px;

          transform:
            translateX(-50%);

          z-index: 80;

          clip-path:
            polygon(
              17% 0%,
              83% 0%,
              100% 100%,
              0% 100%
            );

          filter:
            drop-shadow(0 15px 25px rgba(0,0,0,.60));
        }

        .center-logo-frame {
          position: absolute;
          inset: -2px;

          background:
            linear-gradient(
              135deg,
              #202020,
              #9b9b9b,
              #303030,
              #080808,
              #777777,
              #171717
            );

          clip-path:
            polygon(
              17% 0%,
              83% 0%,
              100% 100%,
              0% 100%
            );
        }

        .center-logo-inner {
          position: absolute;
          inset: 2px;

          background:
            linear-gradient(
              145deg,
              rgba(0,0,0,.99),
              rgba(18,18,18,.98),
              rgba(2,2,2,.99)
            );

          clip-path:
            polygon(
              17% 0%,
              83% 0%,
              100% 100%,
              0% 100%
            );
        }

        .center-logo::after {
          content: "";

          position: absolute;

          left: 22%;
          right: 22%;
          bottom: 14px;

          height: 1px;

          z-index: 20;

          pointer-events: none;

          transform:
            rotate(-7deg);

          transform-origin: center;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.72),
              rgba(255,255,255,.18),
              transparent
            );

          box-shadow:
            0 0 9px rgba(255,255,255,.18);
        }

        .center-logo-glow {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 72px;
          height: 72px;

          transform:
            translate(-50%,-50%);

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(255,255,255,.075),
              rgba(150,150,150,.025) 45%,
              transparent 72%
            );

          filter: blur(11px);
        }

        /* =====================================================
           MOBILE NAVBAR
        ===================================================== */

        .mobile-navbar {
          position: relative;

          background:
            linear-gradient(
              120deg,
              rgba(0,0,0,.995),
              rgba(14,14,14,.985),
              rgba(2,2,2,.995)
            );

          backdrop-filter:
            blur(24px)
            saturate(70%);

          -webkit-backdrop-filter:
            blur(24px)
            saturate(70%);

          clip-path:
            polygon(
              0 0,
              100% 0,
              100% 96%,
              97% 100%,
              3% 100%,
              0 96%
            );

          box-shadow:
            0 25px 70px rgba(0,0,0,.78),
            inset 0 1px 0 rgba(255,255,255,.07);
        }

        .mobile-navbar::before {
          content: "";

          position: absolute;
          inset: 0;

          pointer-events: none;

          background:
            repeating-linear-gradient(
              115deg,
              transparent 0,
              transparent 8px,
              rgba(255,255,255,.018) 9px,
              transparent 10px,
              transparent 18px
            );
        }

        .mobile-navbar a {
          text-shadow:
            0 2px 8px rgba(0,0,0,.85);

          transition:
            background .25s ease,
            color .25s ease,
            padding-left .25s ease;
        }

        .mobile-navbar a:hover {
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,.045),
              transparent
            );

          padding-left: 18px;
        }

        /* =====================================================
           MOBILE TRIGGER
        ===================================================== */

        .mobile-trigger {
          border-radius: 8px;

          transition:
            background .25s ease,
            color .25s ease,
            transform .25s ease;
        }

        .mobile-trigger:hover {
          background: rgba(255,255,255,.045);
          transform: scale(1.03);
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1279px) {
          .desktop-nav {
            display: none !important;
          }

          .mobile-trigger {
            display: flex !important;
          }
        }

        @media (min-width: 1280px) {
          .desktop-nav {
            display: flex !important;
          }

          .mobile-trigger {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .navbar-body {
            height: 76px;
            overflow: visible !important;
          }

          .center-logo {
            width: 112px;
            height: 82px;
          }

          .profile-button {
            width: 35px;
            height: 35px;
          }

          .login-link {
            padding: 0 12px;
            font-size: 9px;
          }
        }

        @media (max-width: 480px) {
          .gaming-navbar {
            padding-left: 6px;
            padding-right: 6px;
          }

          .navbar-body {
            height: 70px;
            overflow: visible !important;
          }

          .center-logo {
            width: 100px;
            height: 76px;
          }

          .profile-wrapper {
            margin-left: 5px;
          }
        }

      `}</style>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav
        className="
          gaming-navbar
          absolute
          left-0
          top-0
          z-[9999]
          w-full
          px-2
          pt-2
          sm:px-3
          sm:pt-3
          lg:px-4
        "
      >
        <div
          className="
            navbar-enter
            relative
            z-[999999]
            mx-auto
            w-full
            max-w-[1750px]
          "
          style={{ isolation: "isolate" }}
        >
          <div
            className="
              navbar-body
              relative
              h-[94px]
              overflow-visible
            "
          >

            {/* TOP LINE */}

            <div
              className="
                pointer-events-none
                absolute
                left-0
                top-0
                h-px
                w-full
                bg-gradient-to-r
                from-transparent
                via-white/35
                to-transparent
              "
            />

            {/* MAIN CONTENT */}

            <div
              className="
                relative
                z-20
                flex
                h-full
                items-center
                justify-between
                px-3
                sm:px-6
                lg:px-8
                xl:px-12
              "
            >

              {/* LEFT */}

              <div
                className="
                  flex
                  h-full
                  min-w-0
                  items-center
                "
              >

                {/* SEARCH */}

                <button
                  type="button"
                  aria-label="Search"
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    text-white/65
                    transition
                    hover:text-white
                  "
                >
                  <Search
                    size={19}
                    strokeWidth={1.8}
                  />
                </button>

                {/* SOCIAL */}

                <div
                  className="
                    ml-3
                    hidden
                    items-center
                    gap-2
                    md:flex
                    xl:ml-6
                  "
                >
                  <SocialIcon>
                    <img
                      src={instagramLogo}
                      alt="Instagram"
                      className="social-logo"
                    />
                  </SocialIcon>

                  <SocialIcon>
                    <img
                      src={facebookLogo}
                      alt="Facebook"
                      className="social-logo"
                    />
                  </SocialIcon>

                  <SocialIcon>
                    <img
                      src={linkedinLogo}
                      alt="LinkedIn"
                      className="social-logo"
                    />
                  </SocialIcon>

                  <SocialIcon>
                    <img
                      src={youtubeLogo}
                      alt="YouTube"
                      className="social-logo"
                    />
                  </SocialIcon>
                </div>

                {/* LEFT NAV */}

                <div
                  className="
                    desktop-nav
                    ml-8
                    hidden
                    h-full
                    items-center
                    gap-7
                    xl:ml-14
                    xl:gap-10
                  "
                >
                  <NavItem
                    to="/"
                    active={isHome}
                    onClick={closeMenu}
                  >
                    HOME
                  </NavItem>

                  <NavItem
                    to="/merchandise"
                    active={isMerchandise}
                    onClick={closeMenu}
                  >
                    MERCHENDISE
                  </NavItem>

                  <NavItem
                    to="/schedule"
                    active={isSchedule}
                    onClick={closeMenu}
                  >
                    SCHEDULE
                  </NavItem>
                </div>

              </div>

              {/* CENTER LOGO */}

              <Link
                to="/"
                className="center-logo"
                onClick={closeMenu}
              >
                <div className="center-logo-frame" />
                <div className="center-logo-inner" />
                <div className="center-logo-glow" />

                <div
                  className="
                    relative
                    z-10
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    overflow-hidden
                  "
                >
                  <img
                    src={clubLogo}
                    alt="Club Logo"
                    className="
                      h-[92%]
                      w-[92%]
                      object-contain
                      drop-shadow-[0_0_14px_rgba(255,255,255,.12)]
                    "
                  />
                </div>
              </Link>

              {/* RIGHT */}

              <div
                className="
                  flex
                  h-full
                  min-w-0
                  items-center
                "
              >

                {/* RIGHT NAV */}

                <div
                  className="
                    desktop-nav
                    mr-5
                    hidden
                    h-full
                    items-center
                    gap-7
                    xl:mr-10
                    xl:gap-10
                  "
                >

                  <NavItem
                    to="/team"
                    active={isTeam}
                    onClick={closeMenu}
                  >
                    TEAM
                  </NavItem>

                  <NavItem
                    to="/about"
                    active={isAbout}
                    onClick={closeMenu}
                  >
                    ABOUT US
                  </NavItem>

                  <NavItem
                    to="/events"
                    active={isEvents}
                    onClick={closeMenu}
                  >
                    EVENTS
                  </NavItem>

                  {!session ? (
                    <LoginNavItem
                      to="/login"
                      active={isLogin}
                      onClick={closeMenu}
                    >
                      LOGIN
                    </LoginNavItem>
                  ) : (
                    <div className="flex items-center">

                      <button
                        type="button"
                        className="login-link"
                        onClick={() =>
                          setProfileOpen(
                            (value) => !value
                          )
                        }
                      >
                        LOGGED IN
                      </button>

                      <div className="profile-wrapper">

                        <button
                          type="button"
                          aria-label="Profile"
                          className="profile-button"
                          onClick={() =>
                            setProfileOpen(
                              (value) => !value
                            )
                          }
                        >
                          {profilePhoto ? (
                            <img
                              src={profilePhoto}
                              alt="Profile"
                              className="profile-image"
                            />
                          ) : (
                            <span className="profile-initial">
                              {getUserInitial()}
                            </span>
                          )}
                        </button>

                        {profileOpen && (
                          <div className="profile-dropdown">

                            <div className="profile-info">

                              <div className="flex items-center gap-3">

                                <div
                                  className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    rounded-full
                                    border
                                    border-white/20
                                    bg-white/5
                                  "
                                >
                                  {profilePhoto ? (
                                    <img
                                      src={profilePhoto}
                                      alt="Profile"
                                      className="
                                        h-full
                                        w-full
                                        object-cover
                                      "
                                    />
                                  ) : (
                                    <UserCircle
                                      size={24}
                                      className="text-white/50"
                                    />
                                  )}
                                </div>

                                <div className="min-w-0">

                                  <div className="truncate text-sm font-semibold text-white">
                                    {session.user
                                      ?.user_metadata
                                      ?.full_name ||
                                      "User"}
                                  </div>

                                  <div className="profile-email">
                                    {session.user?.email}
                                  </div>

                                </div>

                              </div>

                            </div>

                            {/* UPLOAD */}

                            <button
                              type="button"
                              className="profile-action"
                              onClick={() =>
                                fileInputRef.current?.click()
                              }
                            >
                              <Upload size={15} />

                              {uploading
                                ? "UPLOADING..."
                                : "CHANGE PROFILE PHOTO"}
                            </button>

                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              className="hidden"
                              onChange={
                                handleProfileUpload
                              }
                            />

                            {/* LOGOUT */}

                            <button
                              type="button"
                              className="profile-action"
                              onClick={handleLogout}
                            >
                              <LogOut size={15} />
                              LOGOUT
                            </button>

                          </div>
                        )}

                      </div>

                    </div>
                  )}

                </div>

                {/* MOBILE MENU */}

                <button
                  type="button"
                  aria-label={
                    menuOpen
                      ? "Close menu"
                      : "Open menu"
                  }
                  onClick={() =>
                    setMenuOpen(
                      (value) => !value
                    )
                  }
                  className="
                    mobile-trigger
                    ml-1
                    hidden
                    h-10
                    w-10
                    items-center
                    justify-center
                    text-white/70
                    transition
                    hover:text-white
                  "
                >
                  {menuOpen ? (
                    <X
                      size={24}
                      strokeWidth={1.5}
                    />
                  ) : (
                    <Menu
                      size={24}
                      strokeWidth={1.5}
                    />
                  )}
                </button>

              </div>

            </div>

            {/* BOTTOM LINE */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-[5px]
                left-[7%]
                right-[7%]
                h-px
                bg-gradient-to-r
                from-transparent
                via-white/[0.12]
                to-transparent
              "
            />

          </div>

          {/* MOBILE MENU */}

          <div
            className={`
              mobile-navbar
              mx-auto
              mt-2
              w-full
              max-w-[1750px]
              overflow-hidden
              border
              border-white/[0.12]
              shadow-[0_24px_65px_rgba(0,0,0,.72)]
              transition-all
              duration-300
              xl:hidden

              ${
                menuOpen
                  ? "max-h-[800px] opacity-100"
                  : "pointer-events-none max-h-0 opacity-0"
              }
            `}
          >

            {/* TOP LINE */}

            <div
              className="
                h-px
                w-full
                bg-gradient-to-r
                from-[#555]/80
                via-white/55
                to-[#555]/80
              "
            />

            <div className="p-3">

              <MobileNavItem
                to="/"
                active={isHome}
                onClick={closeMenu}
              >
                HOME
              </MobileNavItem>

              <MobileNavItem
                to="/team"
                active={isTeam}
                onClick={closeMenu}
              >
                TEAM
              </MobileNavItem>

              <MobileNavItem
                to="/merchandise"
                active={isMerchandise}
                onClick={closeMenu}
              >
                MERCHENDISE
              </MobileNavItem>

              <MobileNavItem
                to="/schedule"
                active={isSchedule}
                onClick={closeMenu}
              >
                SCHEDULE
              </MobileNavItem>

              <MobileNavItem
                to="/about"
                active={isAbout}
                onClick={closeMenu}
              >
                ABOUT US
              </MobileNavItem>

              <MobileNavItem
                to="/events"
                active={isEvents}
                onClick={closeMenu}
              >
                EVENTS
              </MobileNavItem>

              {!session ? (
                <MobileNavItem
                  to="/login"
                  active={isLogin}
                  onClick={closeMenu}
                >
                  LOGIN
                </MobileNavItem>
              ) : (
                <>
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      border-b
                      border-white/[0.07]
                      px-4
                      py-4
                    "
                  >
                    <span
                      className="
                        text-[12px]
                        font-semibold
                        tracking-[0.18em]
                        text-white
                      "
                    >
                      LOGGED IN
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setProfileOpen(
                          (value) => !value
                        )
                      }
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        border
                        border-white/20
                        bg-white/5
                      "
                    >
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt="Profile"
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      ) : (
                        <span className="profile-initial">
                          {getUserInitial()}
                        </span>
                      )}
                    </button>
                  </div>

                  {profileOpen && (
                    <div
                      className="
                        border-b
                        border-white/[0.07]
                        px-4
                        py-3
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          text-white/65
                          hover:bg-white/[0.05]
                          hover:text-white
                        "
                      >
                        <Upload size={15} />

                        {uploading
                          ? "UPLOADING..."
                          : "CHANGE PROFILE PHOTO"}
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          text-white/65
                          hover:bg-white/[0.05]
                          hover:text-white
                        "
                      >
                        <LogOut size={15} />
                        LOGOUT
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>

        </div>
      </nav>
    </>
  );
};


/* =====================================================
   SOCIAL ICON
===================================================== */

const SocialIcon = ({ children }) => {
  return (
    <button
      type="button"
      aria-label="Social media"
      className="
        flex
        h-6
        w-6
        items-center
        justify-center
        text-white/40
        transition
        hover:-translate-y-0.5
        hover:text-white
      "
    >
      {children}
    </button>
  );
};


/* =====================================================
   DESKTOP NAV ITEM
===================================================== */

const NavItem = ({
  children,
  active = false,
  to,
  onClick,
}) => {
  const className = `
    navbar-link
    ${
      active
        ? "active text-white"
        : "text-white/60"
    }
    text-[11px]
    font-semibold
    tracking-[0.14em]
  `;

  return (
    <Link
      to={to}
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};


/* =====================================================
   LOGIN NAV ITEM
===================================================== */

const LoginNavItem = ({
  children,
  active = false,
  to = "/login",
  onClick,
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        login-link
        ${active ? "login-active" : ""}
      `}
    >
      {children}
    </Link>
  );
};


/* =====================================================
   MOBILE NAV ITEM
===================================================== */

const MobileNavItem = ({
  children,
  active = false,
  to,
  onClick,
}) => {
  return (
    <Link
      to={to}
      className="
        flex
        w-full
        items-center
        justify-between
        border-b
        border-white/[0.07]
        px-4
        py-4
        text-left
        last:border-none
        transition
        hover:bg-white/[0.03]
      "
      onClick={onClick}
    >
      <span
        className={`
          text-[12px]
          font-semibold
          tracking-[0.18em]

          ${
            active
              ? "text-white"
              : "text-white/50"
          }
        `}
      >
        {children}
      </span>

      {active && (
        <span
          className="
            h-[2px]
            w-8
            rounded-full
            bg-gradient-to-r
            from-[#777]
            via-white
            to-[#777]
            shadow-[0_0_8px_rgba(255,255,255,.14)]
          "
        />
      )}
    </Link>
  );
};

export default Navbar;