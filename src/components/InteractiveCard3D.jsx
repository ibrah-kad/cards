import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { playClickSound } from "../utils/audio";
export default function InteractiveCard3D({
  children,
  className = "",
  onClick,
  tiltIntensity = 12,
  enableHoverGlow = true,
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Normalized mouse/touch position (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for liquid, playful feel
  const springConfig = {
    damping: 20,
    stiffness: 300,
  };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // 3D rotations based on touch/cursor
  const rotateX = useTransform(
    smoothY,
    [-0.5, 0.5],
    [tiltIntensity, -tiltIntensity],
  );
  const rotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    [-tiltIntensity, tiltIntensity],
  );

  // Dynamic light sheen reflection
  const sheenX = useTransform(smoothX, [-0.5, 0.5], ["0%", "100%"]);
  const sheenY = useTransform(smoothY, [-0.5, 0.5], ["0%", "100%"]);
  const handlePointerMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const normX = clientX / rect.width - 0.5;
    const normY = clientY / rect.height - 0.5;
    x.set(normX);
    y.set(normY);
  };
  const handlePointerEnter = () => {
    setIsHovered(true);
  };
  const handlePointerLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };
  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={(e) => {
        playClickSound();
        if (onClick) onClick(e);
      }}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileTap={{
        scale: 0.98,
      }}
      className={`glass-card relative overflow-hidden transition-shadow duration-300 ${className}`}
    >
      {/* Dynamic Specular Sheen across morphism surface */}
      {enableHoverGlow && isHovered && (
        <motion.div
          className="pointer-events-none absolute -inset-full opacity-40 z-10 transition-opacity"
          style={{
            background: `radial-gradient(circle 320px at ${sheenX.get()} ${sheenY.get()}, rgba(255, 255, 255, 0.7), transparent 70%)`,
          }}
        />
      )}
      <div
        style={{
          transform: "translateZ(12px)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
