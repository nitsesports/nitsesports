import React, { useEffect, useRef, useState } from "react";



import { Link, useLocation } from "react-router-dom";



import {



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



    location.pathname.replace(/\/+$/, "").toLowerCase() || "/";







  /* =====================================================



     ACTIVE ROUTES



  ===================================================== */



  const isHome = currentPath === "/";



  const isBattleblaze = currentPath === "/battleblaze";



  const isTeam = currentPath === "/team";



  const isEvents = currentPath === "/events";



  const isAbout = currentPath === "/about";



  const isMerchandise = currentPath === "/merchandise";



  const isSchedule = currentPath === "/schedule";



  const isLogin = currentPath === "/login";







  const isRegister =



    currentPath === "/register" ||



    currentPath === "/register-test" ||



    currentPath === "/registerbb" ||



    currentPath.startsWith("/register/") ||



    currentPath.startsWith("/battleblaze/");







  /* Use the exact BattleBlaze navbar style on both BattleBlaze and Registerbb pages */



  const isAdminPanel =
    currentPath === "/admin" ||
    currentPath === "/adminpanel" ||
    currentPath === "/admin-panel" ||
    currentPath === "/admin/panel" ||
    currentPath.endsWith("/adminpanel") ||
    currentPath.endsWith("/admin-panel");

  // Apply the same special BattleBlaze navbar on the tournament schedule hub too.
  const isBBSchedule =
    currentPath === "/bbschedule" ||
    currentPath === "/bb-schedule" ||
    currentPath === "/battleblaze-schedule" ||
    currentPath === "/battleblaze/schedule" ||
    currentPath.startsWith("/battleblaze/schedule/");

  const isBattleblazeTheme =
    isBattleblaze ||
    isRegister ||
    isAdminPanel ||
    isBBSchedule ||
    currentPath === "/admin/ps5-rush" ||
    currentPath === "/results" ||
    currentPath.startsWith("/results/");







  /* =====================================================



     GET CURRENT SESSION



  ===================================================== */



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







    /* ===================================================



       AUTH STATE LISTENER



    =================================================== */



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







  /* =====================================================



     LOAD PROFILE PHOTO



  ===================================================== */



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







  /* =====================================================



     CLOSE MOBILE MENU



  ===================================================== */



  const closeMenu = () => {



    setMenuOpen(false);



  };







  /* =====================================================



     LOGOUT



  ===================================================== */



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







  /* =====================================================



     PROFILE PHOTO UPLOAD



  ===================================================== */



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



      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";



      const filePath = `${userId}/avatar-${Date.now()}-${crypto.randomUUID()}.${fileExt}`;







      const { error: uploadError } = await supabase.storage



        .from("avatars")



        .upload(filePath, file, {



          cacheControl: "3600",



          upsert: true,



          contentType: file.type,



        });







      if (uploadError) {



        throw uploadError;



      }







      const { data: publicUrlData } = supabase.storage



        .from("avatars")



        .getPublicUrl(filePath);







      const publicUrl = publicUrlData?.publicUrl;



      if (!publicUrl) {



        throw new Error("Unable to get profile photo URL.");



      }







      const finalUrl = `${publicUrl}?t=${Date.now()}`;



      setProfilePhoto(finalUrl);







      const { error: metadataError } = await supabase.auth.updateUser({



        data: {



          avatar_url: publicUrl,



        },



      });







      if (metadataError) {



        console.error("Metadata update error:", metadataError);



      }



    } catch (error) {



      console.error("Profile upload error:", error);



      alert(error?.message || "Unable to upload profile photo.");



    } finally {



      setUploading(false);



      if (fileInputRef.current) {



        fileInputRef.current.value = "";



      }



    }



  };







  /* =====================================================



     USER INITIAL



  ===================================================== */



  const getUserInitial = () => {



    const fullName = session?.user?.user_metadata?.full_name;



    if (fullName) {



      return fullName.charAt(0).toUpperCase();



    }



    const email = session?.user?.email || "";



    return email ? email.charAt(0).toUpperCase() : "U";



  };







  return (



    <>



      <style>{`



        @import url('https://fonts.cdnfonts.com/css/the-last-shuriken');



        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');



        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap');







        .gaming-navbar {



          font-family: 'The Last Shuriken', sans-serif;



          font-variant-numeric: tabular-nums;



          letter-spacing: .035em;



        }







        /* Same display typeface as the NITS ESPORTS hero heading. */



        .gaming-navbar .navbar-link,



        .gaming-navbar .login-link,



        .gaming-navbar .mobile-navbar a,



        .gaming-navbar .profile-action,



        .gaming-navbar .profile-email {



          font-family: 'The Last Shuriken', sans-serif;



        }







        /* Subtle forged-metal / samurai edge treatment; layout unchanged. */



        .navbar-link,



        .login-link,



        .mobile-navbar a {



          text-shadow:



            0 1px 0 rgba(255,255,255,.10),



            0 3px 8px rgba(0,0,0,.65);



        }







        /* BattleBlaze exclusive CTA — intentionally distinct from standard nav links. */



        .battleblaze-nav-wrap {



          position: relative;



          display: inline-flex;



          align-items: center;



          margin-left: 2px;



          padding-top: 5px;



        }







        .battleblaze-exclusive {



          position: absolute;



          top: -8px;



          right: -8px;



          z-index: 2;



          padding: 3px 6px 2px;



          border: 1px solid rgba(255, 63, 133, .8);



          border-radius: 3px;



          color: #fff;



          background: linear-gradient(120deg, #ff2e78, #9d174d);



          box-shadow: 0 0 12px rgba(255, 46, 120, .45);



          font-family: 'The Last Shuriken', sans-serif;



          font-size: 7px;



          line-height: 1;



          letter-spacing: .13em;



          white-space: nowrap;



          pointer-events: none;



        }







        .battleblaze-link {



          position: relative;



          display: inline-flex;



          align-items: center;



          justify-content: center;



          min-height: 38px;



          padding: 0 15px;



          overflow: hidden;



          border: 1px solid rgba(255, 54, 126, .82);



          border-radius: 5px;



          color: #fff;



          background:



            linear-gradient(110deg, rgba(255, 39, 111, .2), rgba(13, 17, 42, .92) 48%, rgba(22, 100, 130, .22)),



            rgba(5, 7, 20, .82);



          box-shadow: 0 0 15px rgba(255, 46, 120, .14), inset 0 0 14px rgba(255, 46, 120, .08);



          font-family: 'The Last Shuriken', sans-serif;



          font-size: 10px;



          font-weight: 800;



          letter-spacing: .1em;



          line-height: 1;



          text-decoration: none;



          white-space: nowrap;



          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease, background .25s ease;



        }







        .battleblaze-link::before {



          content: "";



          position: absolute;



          inset: 0;



          background: linear-gradient(105deg, transparent 15%, rgba(255,255,255,.18) 48%, transparent 78%);



          transform: translateX(-130%);



          transition: transform .5s ease;



          pointer-events: none;



        }







        .battleblaze-link::after {



          content: "";



          position: absolute;



          left: 8px;



          right: 8px;



          bottom: 4px;



          height: 1px;



          background: linear-gradient(90deg, transparent, #ff3d83, #36dfff, transparent);



          opacity: .8;



        }







        .battleblaze-link:hover {



          transform: translateY(-2px);



          border-color: rgba(50, 218, 255, .9);



          background: linear-gradient(110deg, rgba(255, 39, 111, .25), rgba(12, 18, 44, .96) 50%, rgba(23, 137, 160, .24));



          box-shadow: 0 0 22px rgba(255, 46, 120, .25), 0 0 18px rgba(40, 215, 244, .12), inset 0 0 16px rgba(255,255,255,.04);



        }







        .battleblaze-link:hover::before {



          transform: translateX(130%);



        }







        .mobile-battleblaze {



          display: flex;



          align-items: center;



          justify-content: space-between;



          gap: 12px;



          width: 100%;



          margin: 8px 0;



          padding: 14px 16px;



          border: 1px solid rgba(255, 54, 126, .65);



          border-radius: 8px;



          color: #fff !important;



          background: linear-gradient(105deg, rgba(255, 39, 111, .17), rgba(9, 11, 30, .95) 55%, rgba(31, 157, 183, .14));



          box-shadow: inset 0 0 18px rgba(255, 46, 120, .06), 0 0 14px rgba(255, 46, 120, .08);



          text-decoration: none;



          font-size: 12px;



          font-weight: 800;



          letter-spacing: .14em;



        }







        .mobile-battleblaze .mobile-exclusive {



          padding: 4px 7px;



          border-radius: 3px;



          color: #fff;



          background: linear-gradient(120deg, #ff2e78, #9d174d);



          font-size: 8px;



          letter-spacing: .12em;



          box-shadow: 0 0 10px rgba(255, 46, 120, .25);



        }







        .navbar-link.active,



        .navbar-link:hover,



        .login-link {



          background-image: linear-gradient(



            180deg,



            #ffffff 0%,



            #d8d8d8 42%,



            #777777 100%



          );



          -webkit-background-clip: text;



          background-clip: text;



          color: transparent;



        }







        .navbar-link::before {



          content: "";



          position: absolute;



          left: 0;



          right: 0;



          top: 5px;



          height: 1px;



          background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent);



          opacity: 0;



          transform: scaleX(.55);



          transition: opacity .25s ease, transform .35s cubic-bezier(.22,1,.36,1);



        }







        .navbar-link:hover::before,



        .navbar-link.active::before {



          opacity: 1;



          transform: scaleX(1);



        }







        .navbar-body::after {



          content: "";



          position: absolute;



          left: 2.5%;



          right: 2.5%;



          bottom: 1px;



          height: 1px;



          pointer-events: none;



          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.08) 20%, rgba(255,255,255,.42) 50%, rgba(255,255,255,.08) 80%, transparent 100%);



          box-shadow: 0 0 10px rgba(255,255,255,.08);



        }







        /* =============================================



           NAVBAR ENTRY



        ============================================= */



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



          animation: navbarEnter .8s cubic-bezier(.16,1,.3,1);



        }







        /* =============================================



           NAV LINK



        ============================================= */



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



          transition: color .25s ease, transform .25s ease;



        }







        .navbar-link::after {



          content: "";



          position: absolute;



          left: 50%;



          bottom: 3px;



          width: 0;



          height: 2px;



          transform: translateX(-50%);



          border-radius: 999px;



          background: linear-gradient(90deg, #666666, #ffffff, #777777);



          box-shadow:



            0 0 6px rgba(255,255,255,.18),



            0 0 10px rgba(255,255,255,.08);



          opacity: 0;



          transition: width .35s cubic-bezier(.22,1,.36,1), opacity .25s ease;



        }







        .navbar-link.active::after,



        .navbar-link:hover::after {



          width: 100%;



          opacity: 1;



        }







        .navbar-link:hover {



          transform: translateY(-1px);



        }







        /* =============================================



           LOGIN / LOGGED IN BUTTON



        ============================================= */



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



          border: 1px solid rgba(255,255,255,.18);



          border-radius: 7px;



          background: linear-gradient(



            135deg,



            rgba(255,255,255,.10),



            rgba(110,110,110,.08),



            rgba(0,0,0,.28)



          );



          box-shadow:



            0 0 18px rgba(255,255,255,.06),



            inset 0 1px 0 rgba(255,255,255,.10);



          backdrop-filter: blur(10px);



          -webkit-backdrop-filter: blur(10px);



          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease, background .25s ease;



        }







        .login-link::before {



          content: "";



          position: absolute;



          inset: -1px;



          border-radius: 7px;



          padding: 1px;



          background: linear-gradient(



            90deg,



            rgba(110,110,110,.85),



            rgba(255,255,255,.75),



            rgba(85,85,85,.85)



          );



          -webkit-mask:



            linear-gradient(#fff 0 0) content-box,



            linear-gradient(#fff 0 0);



          -webkit-mask-composite: xor;



          mask-composite: exclude;



          opacity: .48;



          pointer-events: none;



        }







        .login-link:hover {



          transform: translateY(-1px);



          border-color: rgba(255,255,255,.30);



          background: linear-gradient(



            135deg,



            rgba(255,255,255,.15),



            rgba(120,120,120,.12),



            rgba(0,0,0,.32)



          );



          box-shadow:



            0 0 20px rgba(255,255,255,.08),



            0 0 30px rgba(255,255,255,.035),



            inset 0 1px 0 rgba(255,255,255,.12);



        }







        /* =============================================



           PROFILE



        ============================================= */



        .social-logo {



          width: 15px;



          height: 15px;



          object-fit: contain;



          display: block;



          opacity: .78;



          transition: opacity .25s ease, transform .25s ease;



        }







        .social-logo:hover {



          opacity: 1;



          transform: scale(1.08);



        }







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



          border: 1px solid rgba(255,255,255,.25);



          background: linear-gradient(



            135deg,



            rgba(255,255,255,.12),



            rgba(95,95,95,.10),



            rgba(0,0,0,.30)



          );



          box-shadow: 0 0 18px rgba(255,255,255,.07);



          cursor: pointer;



          transition: transform .25s ease, box-shadow .25s ease;



        }







        .profile-button:hover {



          transform: scale(1.06);



          box-shadow:



            0 0 25px rgba(255,255,255,.12),



            0 0 35px rgba(255,255,255,.05);



        }







        .profile-image {



          width: 100%;



          height: 100%;



          object-fit: cover;



        }







        .profile-initial {



          font-size: 14px;



          font-weight: 700;



          background: linear-gradient(90deg, #bdbdbd, #ffffff, #8a8a8a);



          -webkit-background-clip: text;



          background-clip: text;



          color: transparent;



        }







        /* =============================================



           PROFILE DROPDOWN



        ============================================= */



        .profile-dropdown {



          position: absolute;



          right: 0;



          top: calc(100% + 12px);



          width: 245px;



          padding: 12px;



          border: 1px solid rgba(255,255,255,.14);



          border-radius: 18px;



          background: linear-gradient(



            135deg,



            rgba(8,8,8,.97),



            rgba(28,28,28,.94),



            rgba(5,5,5,.98)



          );



          backdrop-filter: blur(24px);



          -webkit-backdrop-filter: blur(24px);



          box-shadow:



            0 25px 70px rgba(0,0,0,.62),



            0 0 30px rgba(255,255,255,.045);



          z-index: 2147483647 !important;



          pointer-events: auto;



        }







        .profile-info {



          padding: 10px;



          border-bottom: 1px solid rgba(255,255,255,.08);



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



          border-radius: 11px;



          color: rgba(255,255,255,.70);



          font-size: 12px;



          font-weight: 600;



          background: transparent;



          cursor: pointer;



          transition: background .2s ease, color .2s ease;



        }







        .profile-action:hover {



          background: rgba(255,255,255,.06);



          color: #fff;



        }







        /* =============================================



           NAVBAR BODY



        ============================================= */



        .navbar-body {



          position: relative;



          overflow: visible !important;



          background: linear-gradient(



            110deg,



            rgba(3,3,3,.91),



            rgba(30,30,30,.70),



            rgba(4,4,4,.91)



          );



          border: 1px solid rgba(255,255,255,.13);



          backdrop-filter: blur(22px) saturate(85%);



          -webkit-backdrop-filter: blur(22px) saturate(85%);



          box-shadow:



            0 18px 55px rgba(0,0,0,.34),



            inset 0 1px 0 rgba(255,255,255,.07);



          border-radius: 0 0 18px 18px;



        }







        /* =============================================



           CENTER LOGO



        ============================================= */



        .center-logo {



          position: absolute;



          left: 50%;



          top: 0;



          width: 160px;



          height: 108px;



          transform: translateX(-50%);



          z-index: 80;



          clip-path: polygon(17% 0%, 83% 0%, 100% 100%, 0% 100%);



        }







        .center-logo-frame {



          position: absolute;



          inset: -2px;



          background: linear-gradient(



            135deg,



            rgba(75,75,75,.92),



            rgba(225,225,225,.78),



            rgba(55,55,55,.92)



          );



          clip-path: polygon(17% 0%, 83% 0%, 100% 100%, 0% 100%);



        }







        .center-logo-inner {



          position: absolute;



          inset: 2px;



          background: linear-gradient(



            145deg,



            rgba(5,5,5,.98),



            rgba(24,24,24,.92),



            rgba(3,3,3,.98)



          );



          clip-path: polygon(17% 0%, 83% 0%, 100% 100%, 0% 100%);



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



          transform: rotate(-7deg);



          transform-origin: center;



          background: linear-gradient(90deg, transparent, rgba(255,255,255,.62), transparent);



          box-shadow: 0 0 7px rgba(255,255,255,.16);



        }







        .center-logo-glow {



          position: absolute;



          left: 50%;



          top: 50%;



          width: 70px;



          height: 70px;



          transform: translate(-50%,-50%);



          border-radius: 50%;



          background: radial-gradient(



            circle,



            rgba(255,255,255,.075),



            rgba(160,160,160,.025) 45%,



            transparent 72%



          );



          filter: blur(10px);



        }







        /* =============================================



           MOBILE NAVBAR



        ============================================= */



        .mobile-navbar {



          background: linear-gradient(



            120deg,



            rgba(4,4,4,.97),



            rgba(27,27,27,.92),



            rgba(5,5,5,.97)



          );



          backdrop-filter: blur(22px) saturate(85%);



          -webkit-backdrop-filter: blur(22px) saturate(85%);



          clip-path: polygon(



            0 0,



            100% 0,



            100% 96%,



            97% 100%,



            3% 100%,



            0 96%



          );



        }







        /* =============================================



           RESPONSIVE



        ============================================= */



        .mobile-navbar a {



          text-shadow: 0 2px 7px rgba(0,0,0,.65);



        }







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







        /* =============================================



           BATTLEBLAZE & REGISTERBB NAVBAR SKIN



        ============================================= */



        .gaming-navbar[data-battleblaze="true"] {



          padding: 0 !important;



          background: transparent !important;



          font-family: 'Orbitron', sans-serif;



          letter-spacing: .12em;



        }



        .gaming-navbar[data-battleblaze="true"] > .navbar-enter {



          max-width: none !important;



          width: 100% !important;



        }



        .gaming-navbar[data-battleblaze="true"] .navbar-body {



          height: 84px !important;



          border: 0 !important;



          border-radius: 0 !important;



          background: transparent !important;



          box-shadow: none !important;



          backdrop-filter: none !important;



          -webkit-backdrop-filter: none !important;



        }



        .gaming-navbar[data-battleblaze="true"] .navbar-body::after {



          display: none !important;



        }



        .gaming-navbar[data-battleblaze="true"] .navbar-body > div.pointer-events-none {



          opacity: 0 !important;



        }



        .gaming-navbar[data-battleblaze="true"] .navbar-link,



        .gaming-navbar[data-battleblaze="true"] .login-link,



        .gaming-navbar[data-battleblaze="true"] .mobile-navbar a {



          font-family: 'Orbitron', sans-serif !important;



          font-size: 11px;



          font-weight: 700;



          letter-spacing: .13em;



          text-shadow: 0 1px 8px rgba(7, 6, 26, .8);



        }



        .gaming-navbar[data-battleblaze="true"] .navbar-link {



          height: 42px;



          color: rgba(237, 235, 255, .78);



        }



        .gaming-navbar[data-battleblaze="true"] .navbar-link:hover,



        .gaming-navbar[data-battleblaze="true"] .navbar-link.active {



          color: #fff;



          text-shadow: 0 0 12px rgba(168, 130, 255, .28);



        }



        .gaming-navbar[data-battleblaze="true"] .navbar-link::after {



          height: 2px;



          background: linear-gradient(90deg, #45d9ff, #bd65ff, #ff4b9b);



          box-shadow: 0 0 10px rgba(190, 86, 255, .36);



        }



        .gaming-navbar[data-battleblaze="true"] .navbar-link::before {



          background: linear-gradient(90deg, transparent, rgba(110, 159, 255, .45), transparent);



        }







        /* BattleBlaze & Registerbb desktop layout: reserve equal space around the centered logo. */



        @media (min-width: 1280px) {



          .gaming-navbar[data-battleblaze="true"] .navbar-body > div.relative.z-20 {



            display: grid !important;



            grid-template-columns: minmax(0, 1fr) 160px minmax(0, 1fr);



            column-gap: 0;



            justify-content: initial !important;



          }







          .gaming-navbar[data-battleblaze="true"] .navbar-body > div.relative.z-20 > div:first-child {



            grid-column: 1;



            min-width: 0;



            justify-self: stretch;



          }







          .gaming-navbar[data-battleblaze="true"] .navbar-body > div.relative.z-20 > .center-logo {



            left: 50%;



            width: 160px;



          }







          .gaming-navbar[data-battleblaze="true"] .navbar-body > div.relative.z-20 > div:last-child {



            grid-column: 3;



            min-width: 0;



            justify-self: stretch;



            justify-content: flex-end;



            transform: translateX(clamp(14px, 1.8vw, 32px));



          }







          .gaming-navbar[data-battleblaze="true"] .desktop-nav {



            gap: clamp(10px, 1vw, 17px) !important;



          }







          .gaming-navbar[data-battleblaze="true"] .desktop-nav:first-of-type {



            margin-left: clamp(12px, 1.2vw, 22px) !important;



          }







          .gaming-navbar[data-battleblaze="true"] .desktop-nav:last-of-type {



            margin-right: clamp(8px, .8vw, 14px) !important;



          }







          .gaming-navbar[data-battleblaze="true"] .desktop-nav .navbar-link {



            flex-shrink: 0;



          }







          .gaming-navbar[data-battleblaze="true"] .battleblaze-link {



            padding-left: 10px;



            padding-right: 10px;



          }



        }







        /* Normal navbar alignment */



        @media (min-width: 1280px) {



          .gaming-navbar:not([data-battleblaze="true"]) .navbar-body > div.relative.z-20 {



            display: grid !important;



            grid-template-columns: minmax(0, 1fr) 160px minmax(0, 1fr);



            column-gap: 0;



            justify-content: initial !important;



          }







          .gaming-navbar:not([data-battleblaze="true"]) .navbar-body > div.relative.z-20 > div:first-child {



            grid-column: 1;



            min-width: 0;



            width: 100%;



            justify-self: stretch;



          }







          .gaming-navbar:not([data-battleblaze="true"]) .navbar-body > div.relative.z-20 > .center-logo {



            left: 50%;



            width: 160px;



            z-index: 80;



          }







          .gaming-navbar:not([data-battleblaze="true"]) .navbar-body > div.relative.z-20 > div:last-child {



            grid-column: 3;



            min-width: 0;



            width: 100%;



            justify-self: stretch;



            justify-content: flex-end;



            transform: translateX(clamp(14px, 1.8vw, 32px));



          }







          .gaming-navbar:not([data-battleblaze="true"]) .desktop-nav {



            gap: clamp(10px, 1vw, 17px) !important;



          }







          .gaming-navbar:not([data-battleblaze="true"]) .desktop-nav .navbar-link,



          .gaming-navbar:not([data-battleblaze="true"]) .battleblaze-nav-wrap,



          .gaming-navbar:not([data-battleblaze="true"]) .login-link {



            flex-shrink: 0;



          }







          .gaming-navbar:not([data-battleblaze="true"]) .desktop-nav:first-of-type {



            justify-content: flex-end;



            margin-left: clamp(12px, 1.2vw, 22px) !important;



          }







          .gaming-navbar:not([data-battleblaze="true"]) .desktop-nav:last-of-type {



            margin-right: clamp(8px, .8vw, 14px) !important;



          }



        }







        /* Keep the center logo and its placement; blend only its frame into the BattleBlaze theme. */



        .gaming-navbar[data-battleblaze="true"] .center-logo {



          filter: drop-shadow(0 8px 20px rgba(4, 4, 20, .4));



        }



        .gaming-navbar[data-battleblaze="true"] .center-logo-frame {



          background: linear-gradient(135deg, rgba(91, 104, 170, .8), rgba(228, 186, 255, .62), rgba(72, 79, 145, .8));



        }



        .gaming-navbar[data-battleblaze="true"] .center-logo-inner {



          background: linear-gradient(145deg, rgba(8, 9, 30, .98), rgba(20, 20, 56, .96), rgba(8, 7, 26, .98));



        }



        .gaming-navbar[data-battleblaze="true"] .center-logo-glow {



          background: radial-gradient(circle, rgba(90, 130, 255, .12), rgba(205, 80, 255, .06) 45%, transparent 72%);



        }



        .gaming-navbar[data-battleblaze="true"] .login-link {



          border-color: rgba(151, 148, 221, .35);



          border-radius: 7px;



          background: transparent !important;



          box-shadow: none !important;



          backdrop-filter: none !important;



          -webkit-backdrop-filter: none !important;



        }



        .gaming-navbar[data-battleblaze="true"] .login-link::before {



          background: linear-gradient(90deg, rgba(80, 211, 255, .8), rgba(212, 117, 255, .8), rgba(255, 86, 170, .8));



          opacity: .35;



        }



        .gaming-navbar[data-battleblaze="true"] .battleblaze-link {



          border-color: rgba(255, 72, 159, .82);



          background: transparent !important;



          box-shadow: none !important;



        }



        .gaming-navbar[data-battleblaze="true"] .mobile-navbar {



          border-color: rgba(139, 92, 246, .28) !important;



          background: linear-gradient(135deg, rgba(8, 6, 22, .96), rgba(16, 10, 38, .96)) !important;



          box-shadow: 0 20px 50px rgba(0, 0, 0, .55) !important;



          backdrop-filter: blur(18px) !important;



          -webkit-backdrop-filter: blur(18px) !important;



        }



        @media (max-width: 640px) {



          .gaming-navbar[data-battleblaze="true"] .navbar-body {



            height: 76px !important;



          }



        }



      `}</style>







      {/* =====================================================



          NAVBAR



      ===================================================== */}



      <nav



        data-battleblaze={isBattleblazeTheme ? "true" : "false"}



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







            {/* =================================================



                MAIN CONTENT



            ================================================= */}



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



              {/* =================================================



                  LEFT



              ================================================= */}



              <div



                className="



                  flex



                  h-full



                  min-w-0



                  items-center



                "



              >



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



                  <SocialIcon href="https://www.instagram.com/nits.esports?stkn=MWs1aGNoNm8wbWc2cQ==">



                    <img



                      src={instagramLogo}



                      alt="Instagram"



                      className="social-logo"



                    />



                  </SocialIcon>







                  <SocialIcon href="#">



                    <img



                      src={facebookLogo}



                      alt="Facebook"



                      className="social-logo"



                    />



                  </SocialIcon>







                  <SocialIcon href="https://www.linkedin.com/company/nits-esports/">



                    <img



                      src={linkedinLogo}



                      alt="LinkedIn"



                      className="social-logo"



                    />



                  </SocialIcon>







                  <SocialIcon href="https://youtube.com/@nitsesports?si=pQr4nw-dBh5wsrJ7">



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







              {/* =================================================



                  CENTER LOGO



              ================================================= */}



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



                      drop-shadow-[0_0_12px_rgba(255,255,255,.10)]



                    "



                  />



                </div>



              </Link>







              {/* =================================================



                  RIGHT



              ================================================= */}



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







                  <div className="battleblaze-nav-wrap">



                    <span className="battleblaze-exclusive">EXCLUSIVE</span>



                    <Link



                      to="/battleblaze"



                      onClick={closeMenu}



                      className="battleblaze-link"



                      aria-label="BattleBlaze 2026 — Exclusive event"



                    >



                      BATTLEBLAZE <span className="ml-1 text-[#ff4a8b]">/26</span>



                    </Link>



                  </div>







                  {/* LOGIN / LOGGED IN */}



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



                        onClick={() => setProfileOpen((value) => !value)}



                      >



                        LOGGED IN



                      </button>







                      {/* PROFILE CIRCLE */}



                      <div className="profile-wrapper">



                        <button



                          type="button"



                          aria-label="Profile"



                          className="profile-button"



                          onClick={() => setProfileOpen((value) => !value)}



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







                        {/* PROFILE DROPDOWN */}



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



                                    {session.user?.user_metadata?.full_name || "User"}



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



                              onClick={() => fileInputRef.current?.click()}



                            >



                              <Upload size={15} />



                              {uploading ? "UPLOADING..." : "CHANGE PROFILE PHOTO"}



                            </button>







                            <input



                              ref={fileInputRef}



                              type="file"



                              accept="image/png,image/jpeg,image/jpg,image/webp"



                              className="hidden"



                              onChange={handleProfileUpload}



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



                  aria-label={menuOpen ? "Close menu" : "Open menu"}



                  onClick={() => setMenuOpen((value) => !value)}



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



                    <X size={24} strokeWidth={1.5} />



                  ) : (



                    <Menu size={24} strokeWidth={1.5} />



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







          {/* =====================================================



              MOBILE MENU



          ===================================================== */}



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



              shadow-[0_20px_50px_rgba(0,0,0,.45)]



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



              <MobileNavItem to="/" active={isHome} onClick={closeMenu}>



                HOME



              </MobileNavItem>







              <MobileNavItem to="/team" active={isTeam} onClick={closeMenu}>



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







              <MobileNavItem to="/about" active={isAbout} onClick={closeMenu}>



                ABOUT US



              </MobileNavItem>







              <MobileNavItem to="/events" active={isEvents} onClick={closeMenu}>



                EVENTS



              </MobileNavItem>







              <Link



                to="/battleblaze"



                onClick={closeMenu}



                className="mobile-battleblaze"



                aria-label="BattleBlaze 2026 — Exclusive event"



              >



                <span>BATTLEBLAZE /26</span>



                <span className="mobile-exclusive">EXCLUSIVE</span>



              </Link>







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



                      onClick={() => setProfileOpen((value) => !value)}



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







                  {/* MOBILE PROFILE ACTIONS */}



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



                        onClick={() => fileInputRef.current?.click()}



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



                        {uploading ? "UPLOADING..." : "CHANGE PROFILE PHOTO"}



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



const SocialIcon = ({ children, href = "#" }) => {



  return (



    <a



      href={href}



      target={href !== "#" ? "_blank" : undefined}



      rel={href !== "#" ? "noopener noreferrer" : undefined}



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



    </a>



  );



};







/* =====================================================



   DESKTOP NAV ITEM



===================================================== */



const NavItem = ({ children, active = false, to, onClick }) => {



  const className = `



    navbar-link



    ${active ? "active text-white" : "text-white/60"}



    text-[11px]



    font-semibold



    tracking-[0.14em]



  `;







  return (



    <Link to={to} className={className} onClick={onClick}>



      {children}



    </Link>



  );



};







/* =====================================================



   LOGIN NAV ITEM



===================================================== */



const LoginNavItem = ({ children, active = false, to = "/login", onClick }) => {



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



const MobileNavItem = ({ children, active = false, to, onClick }) => {



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



          ${active ? "text-white" : "text-white/50"}



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