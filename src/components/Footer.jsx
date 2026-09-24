import { Link } from "react-router-dom";
import {
  Sparkles,
  Heart,
  QrCode,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { playPopSound } from "../utils/audio";
import { fireCelebrationConfetti } from "../utils/confetti";
export default function Footer() {
  const triggerCelebration = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    fireCelebrationConfetti(x, y);
  };
  return (
    <footer className="mt-28 border-t border-white/60 bg-gradient-to-b from-transparent to-sand-200/60 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand & Mission */}
        <div className="flex flex-col gap-3 max-w-sm">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{
                rotate: 180,
              }}
              onClick={triggerCelebration}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-marigold to-blush flex items-center justify-center cursor-pointer shadow-md"
              title="Click for surprise!"
            >
              <Sparkles size={16} className="text-white" />
            </motion.div>
            <span className="font-display font-bold text-lg text-ink">
              Jipate
              <span className="text-marigold font-normal italic">Events</span>
            </span>
          </div>
          <p className="text-sm text-ink/65 leading-relaxed">
            Beautiful WhatsApp digital cards, automated SMS reminders, and live
            QR code door check-in for celebrations across Tanzania and beyond.
          </p>
        </div>

        {/* Quick Links with Playful Bounce */}
        <div className="flex flex-wrap gap-6 sm:gap-10 text-sm font-semibold text-ink/75">
          <Link
            to="/events"
            onClick={() => playPopSound(480)}
            className="flex items-center gap-1.5 hover:text-marigold transition-colors"
          >
            <CalendarDays size={15} className="text-marigold" /> Occasions
          </Link>
          <Link
            to="/scan"
            onClick={() => playPopSound(500)}
            className="flex items-center gap-1.5 hover:text-marigold transition-colors"
          >
            <QrCode size={15} className="text-sage" /> Door Check-in
          </Link>
          <Link
            to="/admin/login"
            onClick={() => playPopSound(520)}
            className="flex items-center gap-1.5 hover:text-marigold transition-colors"
          >
            <ShieldCheck size={15} className="text-dusk" /> Admin
          </Link>
        </div>

        {/* Playful Interactive Easter Egg Button */}
        <div>
          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.94,
            }}
            onClick={triggerCelebration}
            className="clay-btn-secondary !py-2.5 !px-4 text-xs font-bold flex items-center gap-2"
          >
            <Sparkles size={14} className="text-marigold" />
            <span>Celebrate with Confetti!</span>
          </motion.button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 border-t border-ink/8 flex flex-col sm:flex-row items-center justify-between text-xs text-ink/50 gap-2">
        <p>
          © {new Date().getFullYear()} Jipate Connect. Dar es Salaam, Tanzania.
        </p>
        <p className="flex items-center gap-1">
          Crafted with{" "}
          <Heart
            size={12}
            className="text-red-500 fill-red-500 animate-pulse"
          />{" "}
          for memorable moments
        </p>
      </div>
    </footer>
  );
}
