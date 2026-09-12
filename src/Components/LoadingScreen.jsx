import { useEffect, useState } from "react";
import loadingVideo from "../assets/logobg.mp4";

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let progressTimer = null;
    let readyTimer = null;

    /*
      FAST CRITICAL-READY LOADER
      --------------------------
      The old loader waited for every image/video + 90 Three.js frames +
      extra delays. That made the website feel unnecessarily slow.

      This version waits only for the important first-paint pieces:
      - DOM/window ready
      - critical above-the-fold images
      - fonts are allowed to settle in the background (never blocking)
      - a few real browser frames so the hero/layout can paint

      Non-critical assets continue loading after the website is revealed.
    */

    const nextFrame = () =>
      new Promise((resolve) => requestAnimationFrame(resolve));

    const waitForImage = (img) =>
      new Promise((resolve) => {
        if (img.complete) {
          if (typeof img.decode === "function") {
            img.decode().catch(() => {}).finally(resolve);
          } else {
            resolve();
          }
          return;
        }

        const done = () => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        };

        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });

        // Never let one slow/broken image hold the whole website.
        setTimeout(done, 1800);
      });

    const waitForCriticalAssets = async () => {
      // Do not block on document load forever.
      if (document.readyState !== "complete") {
        await Promise.race([
          new Promise((resolve) =>
            window.addEventListener("load", resolve, { once: true })
          ),
          new Promise((resolve) => setTimeout(resolve, 1800)),
        ]);
      }

      if (cancelled) return;

      setProgress(35);

      // Only wait for images that are actually relevant to the first viewport.
      const viewportImages = Array.from(document.images || []).filter((img) => {
        const rect = img.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.top < window.innerHeight * 1.15 &&
          rect.bottom > -100
        );
      });

      // Cap the number of blocking images so a large gallery never blocks startup.
      const criticalImages = viewportImages.slice(0, 8);

      await Promise.all(criticalImages.map(waitForImage));

      if (cancelled) return;
      setProgress(68);

      // Fonts should not hold the loader hostage.
      // Let the browser finish them naturally after reveal.
      if (document.fonts?.ready) {
        document.fonts.ready.catch(() => {});
      }

      // Give React + Three.js a little more time to settle.
      await nextFrame();
      await nextFrame();
      await nextFrame();
      await nextFrame();
      await nextFrame();
      await nextFrame();
      await nextFrame();
      await nextFrame();

      if (cancelled) return;

      setProgress(94);

      // Small final paint window for a smoother reveal.
      await new Promise((resolve) => setTimeout(resolve, 220));
      await nextFrame();

      if (cancelled) return;

      setProgress(100);

      // Very short ready-state pause instead of the old 500ms delay.
      readyTimer = setTimeout(() => {
        if (!cancelled) onLoadingComplete();
      }, 260);
    };

    // Fast visual progress; real readiness controls the final 100%.
    progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 91) return prev;

        const step =
          prev < 35 ? 4 :
          prev < 65 ? 3 :
          prev < 85 ? 2 :
          1;

        return Math.min(91, prev + step);
      });
    }, 40);

    waitForCriticalAssets();

    return () => {
      cancelled = true;

      if (progressTimer) clearInterval(progressTimer);
      if (readyTimer) clearTimeout(readyTimer);
    };
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 z-9990 h-screen w-full overflow-hidden bg-black text-white">

      {/* =====================================================
          BACKGROUND VIDEO
      ====================================================== */}

      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={loadingVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* =====================================================
          SCREEN SCANLINES
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div
          className="
            absolute inset-0
            bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.08)_50%)]
            bg-size-[100%_4px]
          "
        />
      </div>

      {/* =====================================================
          TOP HUD
      ====================================================== */}

      <div className="absolute left-8 right-8 top-7 flex items-center justify-between">

        {/* Left system indicator */}
        <div className="flex items-center gap-3">

          <div
            className="
              h-2 w-2 rounded-full
              bg-fuchsia-400
              shadow-[0_0_12px_#e879f9]
              animate-pulse
            "
          />

          <span className="text-[10px] font-medium tracking-[0.35em] text-white/60">
            SYSTEM ONLINE
          </span>

        </div>

        {/* Right status */}
        <div className="text-[10px] tracking-[0.3em] text-white/40">
          SECURE CONNECTION
        </div>

      </div>

      {/* =====================================================
          MAIN HUD
      ====================================================== */}

      <div className="relative z-10 flex h-full items-center justify-center">

        <div className="relative flex h-90 w-90 items-center justify-center">

          {/* =================================================
              OUTER GLOW
          ================================================== */}

          <div
            className="
              absolute inset-8.75
              rounded-full
              border
              border-fuchsia-500/20
              shadow-[0_0_60px_rgba(217,70,239,0.12)]
            "
          />

          {/* =================================================
              OUTER ROTATING RING
          ================================================== */}

          <div
            className="
              absolute inset-5
              rounded-full
              border
              border-fuchsia-400/30
              border-t-fuchsia-400
              border-r-purple-500
              animate-[spin_8s_linear_infinite]
              shadow-[0_0_20px_rgba(217,70,239,0.35)]
            "
          />

          {/* =================================================
              SECOND ROTATING RING
          ================================================== */}

          <div
            className="
              absolute inset-9.5
              rounded-full
              border
              border-blue-400/20
              border-l-cyan-400
              border-b-fuchsia-500
              animate-[spin_5s_linear_infinite_reverse]
            "
          />

          {/* =================================================
              PROGRESS RING
          ================================================== */}

          <div
            className="
              absolute inset-14.5
              rounded-full
              border-10
              border-white/5
            "
          />

          {/* Actual progress */}
          <div
            className="
              absolute inset-14.5
              rounded-full
              border-10
              border-transparent
              border-t-fuchsia-400
              border-r-purple-500
              border-b-cyan-400
              transition-transform
              duration-200
              shadow-[0_0_25px_rgba(217,70,239,0.55)]
            "
            style={{
              transform: `rotate(${progress * 3.6 - 45}deg)`,
            }}
          />

          {/* =================================================
              INNER TECH RING
          ================================================== */}

          <div
            className="
              absolute inset-22
              rounded-full
              border
              border-fuchsia-400/40
              animate-[spin_10s_linear_infinite]
            "
          >

            {/* Tick marks */}

            <div
              className="
                absolute left-1/2 top-0
                h-3 w-px
                -translate-x-1/2
                bg-fuchsia-300
              "
            />

            <div
              className="
                absolute bottom-0 left-1/2
                h-3 w-px
                -translate-x-1/2
                bg-fuchsia-300
              "
            />

            <div
              className="
                absolute left-0 top-1/2
                h-px w-3
                -translate-y-1/2
                bg-fuchsia-300
              "
            />

            <div
              className="
                absolute right-0 top-1/2
                h-px w-3
                -translate-y-1/2
                bg-fuchsia-300
              "
            />

          </div>

          {/* =================================================
              INNER CORE
          ================================================== */}

          <div
            className="
              absolute inset-26.25
              rounded-full
              border
              border-fuchsia-400/30
              bg-black/10
              shadow-[inset_0_0_30px_rgba(217,70,239,0.08)]
            "
          />

          {/* =================================================
              CROSSHAIR
          ================================================== */}

          <div className="absolute h-28.75 w-28.75">

            {/* Vertical */}
            <div
              className="
                absolute left-1/2 top-0
                h-full w-px
                -translate-x-1/2
                bg-linear-to-b
                from-transparent
                via-fuchsia-400/40
                to-transparent
              "
            />

            {/* Horizontal */}
            <div
              className="
                absolute left-0 top-1/2
                h-px w-full
                -translate-y-1/2
                bg-linear-to-r
                from-transparent
                via-fuchsia-400/40
                to-transparent
              "
            />

          </div>

          {/* =================================================
              CENTER CONTENT
          ================================================== */}

          <div className="absolute z-20 flex flex-col items-center">

            {/* Loading */}
            <div
              className="
                text-[20px]
                font-light
                tracking-[0.55em]
                text-white
                drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]
              "
            >
              LOADING
            </div>

            {/* Percentage */}
            <div
              className="
                mt-3
                text-[13px]
                font-medium
                tracking-[0.35em]
                text-fuchsia-400
                drop-shadow-[0_0_8px_rgba(217,70,239,0.7)]
              "
            >
              {String(progress).padStart(3, "0")}%
            </div>

            {/* Status */}
            <div
              className="
                mt-3
                text-[7px]
                tracking-[0.4em]
                text-white/40
              "
            >
              {progress >= 100
                ? "SYSTEM READY"
                : "INITIALIZING SYSTEM"}
            </div>

          </div>

          {/* =================================================
              CORNER BRACKETS
          ================================================== */}

          {/* Top Left */}
          <div
            className="
              absolute left-0 top-12
              h-6 w-6
              border-l-2 border-t-2
              border-fuchsia-300
              shadow-[-4px_-4px_15px_rgba(217,70,239,0.25)]
            "
          />

          {/* Top Right */}
          <div
            className="
              absolute right-0 top-12
              h-6 w-6
              border-r-2 border-t-2
              border-fuchsia-300
            "
          />

          {/* Bottom Left */}
          <div
            className="
              absolute bottom-12 left-0
              h-6 w-6
              border-b-2 border-l-2
              border-fuchsia-300
            "
          />

          {/* Bottom Right */}
          <div
            className="
              absolute bottom-12 right-0
              h-6 w-6
              border-b-2 border-r-2
              border-fuchsia-300
            "
          />

        </div>

      </div>

      {/* =====================================================
          LEFT HUD DATA
      ====================================================== */}

      <div
        className="
          absolute bottom-12 left-8
          hidden md:block
          text-[8px]
          leading-5
          tracking-[0.25em]
          text-white/35
        "
      >
        <div>CORE STATUS : ACTIVE</div>
        <div>ENCRYPTION : AES-256</div>
        <div>NETWORK : SECURE</div>
      </div>

      {/* =====================================================
          RIGHT HUD DATA
      ====================================================== */}

      <div
        className="
          absolute bottom-12 right-8
          hidden md:block
          text-right
          text-[8px]
          leading-5
          tracking-[0.25em]
          text-white/35
        "
      >
        <div>BUILD 2.0.26</div>
        <div>SECTOR 07</div>
        <div>ACCESS GRANTED</div>
      </div>

      {/* =====================================================
          HORIZONTAL HUD LINES
      ====================================================== */}

      <div className="absolute left-0 top-[44%] h-px w-full bg-fuchsia-300/10" />

      <div className="absolute bottom-8 left-0 h-px w-full bg-white/10" />

      {/* Center line marker */}
      <div className="absolute left-1/2 top-[44%] h-3 w-px bg-fuchsia-300/50" />

      {/* Bottom center marker */}
      <div className="absolute bottom-7 left-1/2 h-3 w-px bg-fuchsia-300/40" />

    </div>
  );
};

export default LoadingScreen;