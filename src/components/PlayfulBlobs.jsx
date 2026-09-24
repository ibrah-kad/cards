import { motion } from "motion/react";
export default function PlayfulBlobs({ variant = "hero" }) {
  if (variant === "hero") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 select-none">
        {/* Warm Golden Marigold Floating Blob */}
        <motion.div
          animate={{
            x: [0, 25, -15, 0],
            y: [0, -35, 15, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-28 -right-20 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-marigold-200/50 via-blush/40 to-transparent blur-3xl opacity-80"
        />

        {/* Emerald Sage Organic Blob */}
        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 30, -20, 0],
            scale: [0.95, 1.05, 1, 0.95],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/4 -left-36 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-sage-200/50 via-sage-100/40 to-transparent blur-3xl opacity-75"
        />

        {/* Dusky Lavender Accent Blob */}
        <motion.div
          animate={{
            x: [0, 20, -25, 0],
            y: [0, -20, 25, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-blush/40 to-marigold-100/30 blur-3xl opacity-60"
        />
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 select-none">
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-marigold-100/45 to-sage-100/40 blur-3xl opacity-60"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        className="absolute -bottom-24 -left-24 w-88 h-88 rounded-full bg-gradient-to-tr from-blush/35 to-sand-200/50 blur-3xl opacity-60"
      />
    </div>
  );
}
