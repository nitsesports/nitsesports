import { useEffect, useRef, useState } from "react";

export default function GamingCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const addedBodyClass = useRef(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    setEnabled(!isTouch);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add("has-custom-cursor");
    addedBodyClass.current = true;

    function onMove(e) {
      const x = e.clientX;
      const y = e.clientY;
      dot.style.transform = `translate3d(${x - 6}px, ${y - 6}px, 0)`;
      ring.style.transform = `translate3d(${x - 36}px, ${y - 36}px, 0)`;
    }

    function onDown() { ring.classList.add("cursor--pressed"); }
    function onUp() { ring.classList.remove("cursor--pressed"); }

    function isInteractive(el) {
      if (!el) return false;
      return !!el.closest("a, button, input, textarea, select, [role='button'], [data-cursor='interactive']");
    }

    function onOver(e) {
      if (isInteractive(e.target)) {
        dot.classList.add("cursor--hidden-dot");
        ring.classList.add("cursor--interactive");
      }
    }

    function onOut(e) {
      if (isInteractive(e.target)) {
        dot.classList.remove("cursor--hidden-dot");
        ring.classList.remove("cursor--interactive");
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      if (addedBodyClass.current) document.body.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={ringRef} className="gaming-cursor-ring" aria-hidden>
        <svg viewBox="0 0 72 72" width="72" height="72" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#glow)">
            <circle className="cursor-svg-circle" cx="36" cy="36" r="18" strokeWidth="2.4" fill="none" />
            <circle className="cursor-svg-dot" cx="36" cy="36" r="3" />
            <line className="cursor-svg-tick" x1="52" y1="8" x2="60" y2="8" strokeWidth="2" strokeLinecap="round" />
            <line className="cursor-svg-tick" x1="60" y1="8" x2="60" y2="16" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      </div>
      <div ref={dotRef} className="gaming-cursor-dot" aria-hidden />
    </>
  );
}
