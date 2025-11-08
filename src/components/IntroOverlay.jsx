import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "nits:introSeen:v1";
const DEFAULT_LOGO = "https://res.cloudinary.com/dboqkwvhv/image/upload/v1761372655/logo_bt7mzd.png";

const overlayVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.5 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function IntroOverlay({ onClose, persist = true, logoSrc = DEFAULT_LOGO, tagLine = "Igniting the Arena" }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [visible]);

  useEffect(() => {
  let raf = null;
  let start = null;
  const duration = 3000;

  function step(timestamp) {
    if (!start) start = timestamp;
    const t = Math.min(1, (timestamp - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    setProgress(Math.floor(eased * 100));

    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      setTimeout(() => {
        if (persist) {
          localStorage.setItem(STORAGE_KEY, "1"); // ✅ save intro-seen flag
        }
        setVisible(false);
        onClose?.(); // ✅ triggers parent state update
      }, 500);
    }
  }

  raf = requestAnimationFrame(step);
  return () => {
    if (raf) cancelAnimationFrame(raf);
  };
}, [persist, onClose]);


  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center text-center backdrop-blur-sm px-6"
        >
          <motion.div
            key="intro-content"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="relative max-w-2xl w-full"
          >
            <div className="flex flex-col items-center gap-10">
              
              <motion.div 
                initial={{ scale: 0.8, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="relative"
              >
                <motion.div 
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-[-40px] rounded-full bg-green-400/10 shadow-[0_0_50px_rgba(52,211,163,0.4)]"
                />
                <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    className="absolute inset-[-10px] rounded-full bg-blue-400/10 shadow-[0_0_40px_rgba(96,165,250,0.5)]"
                />
                
                <img 
                    src={logoSrc} 
                    alt="NITS Logo" 
                    className="w-48 h-64 rounded-full object-cover mx-auto border-4 border-cyan-400/60 " 
                />
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.5, duration: 1 }} 
                className="font-orbitron text-4xl font-bold text-cyan-200 tracking-widest"
              >
                {tagLine}
              </motion.h2>

              <div className="w-full max-w-sm mx-auto mt-4">
                <div className="h-4 bg-gray-800 border-2 border-cyan-500/50 rounded-lg overflow-hidden relative shadow-inner shadow-cyan-900/50">
                    <motion.div 
                        className="h-full bg-cyan-400/80 rounded-sm shadow-[0_0_15px_rgba(34,211,238,0.7)]"
                        style={{ width: `${progress}%` }} 
                        transition={{ duration: 0.1 }}
                    />
                    <motion.div
                        animate={{ x: [0, 5, -5, 0], opacity: [0, 0.5, 0.5, 0] }}
                        transition={{ duration: 0.2, repeat: Infinity, times: [0, 0.3, 0.6, 1], repeatDelay: 1 }}
                        className="absolute inset-0 bg-white/20 mix-blend-overlay"
                    />
                </div>
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-3 text-sm text-cyan-300/90 font-mono tracking-wider"
                >
                    INITIATING SEQUENCE — {progress}%
                </motion.div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function hasSeenIntro() {
  try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
}