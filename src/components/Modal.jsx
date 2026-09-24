import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { playPopSound } from "../utils/audio";
export default function Modal({
  title,
  onClose,
  children,
  wide = false,
  isOpen = true,
  size,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  if (!isOpen) return null;
  const widthClass =
    size === "2xl" ? "max-w-4xl" : wide ? "max-w-3xl" : "max-w-lg";
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Frosted Backdrop */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          onClick={() => {
            playPopSound(350);
            onClose();
          }}
          className="fixed inset-0 bg-ink/40 backdrop-blur-md transition-opacity"
        />

        {/* Morphic Modal Card with Spring Entry */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.92,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 15,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 28,
          }}
          className={`relative z-10 w-full ${widthClass} bg-white/95 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(38,32,26,0.3)] border border-white/80 backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-ink/8">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-ink">
              {title}
            </h3>
            <button
              onClick={() => {
                playPopSound(420);
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center text-ink/60 hover:text-ink hover:bg-sand-200 transition-colors"
              aria-label="Close modal"
            >
              <X size={17} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
