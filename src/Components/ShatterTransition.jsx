import { useEffect, useState } from "react";

const ShatterTransition = ({ onComplete }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Start shattering
    const startTimer = setTimeout(() => {
      setActive(true);
    }, 50);

    // Finish animation
    const finishTimer = setTimeout(() => {
      onComplete();
    }, 1200);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  const [pieces] = useState(() =>
    Array.from({ length: 48 }, (_, index) => ({
      index,
      rotation:
        (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 600 + 180),
      delay: Math.random() * 120,
    })),
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-9999 overflow-hidden">

      {pieces.map(({ index, rotation, delay }) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const x = (col - 3.5) * 220;
        const y = (row - 2.5) * 220;

        return (
          <div
            key={index}
            className={`
              absolute
              border
              border-fuchsia-400/30
              bg-black
              shadow-[0_0_20px_rgba(217,70,239,0.25)]
              transition-all
              duration-1100
              ease-[cubic-bezier(0.2,0.8,0.2,1)]
              ${active
                ? "opacity-0 scale-[0.15]"
                : "opacity-100 scale-100"
              }
            `}
            style={{
              left: `${col * 12.5}%`,
              top: `${row * 20}%`,
              width: "12.5%",
              height: "20%",

              transform: active
                ? `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(0.15)`
                : "translate(0, 0) rotate(0deg) scale(1)",

              transitionDelay: `${delay}ms`,
            }}
          />
        );
      })}

    </div>
  );
};

export default ShatterTransition;