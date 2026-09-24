import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
export default function Loader({
  label = "Loading delightful moments…",
  full = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-ink/70 ${full ? "min-h-[60vh]" : "py-14"}`}
    >
      <div className="relative w-14 h-14 flex items-center justify-center">
        {/* Playful concentric pulsing morphic rings */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-marigold-200 to-blush/60 blur-sm"
        />
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-12 h-12 rounded-2xl border-3 border-marigold border-t-transparent border-b-transparent shadow-md bg-white/60 backdrop-blur-md flex items-center justify-center text-marigold"
        >
          <Sparkles size={18} />
        </motion.div>
      </div>
      <motion.p
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
        }}
        className="text-sm font-semibold tracking-wide"
      >
        {label}
      </motion.p>
    </div>
  );
}
