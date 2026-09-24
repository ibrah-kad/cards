import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Sparkles,
  LogOut,
  LayoutDashboard,
  BellRing,
  ShieldCheck,
  ScanLine,
  CalendarDays,
  Volume2,
  VolumeX,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { toggleMute, getMuteState, playPopSound } from "../utils/audio";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { isAuthenticated, isAdmin, logout, session } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    setIsMuted(getMuteState());
  }, []);
  const handleSoundToggle = () => {
    const next = toggleMute();
    setIsMuted(next);
    if (!next) playPopSound(620);
  };
  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };
  return (
    <header className="sticky top-0 z-50 bg-[#FAF5EB]/80 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_20px_-4px_rgba(38,32,26,0.06)] transition-all">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-18 flex items-center justify-between">
        {/* Playful Brand Logo */}
        <Link
          to={isAdmin ? "/admin" : "/"}
          className="flex items-center gap-2.5 group shrink-0"
          onClick={() => {
            playPopSound(520);
            setOpen(false);
          }}
        >
          <motion.div
            whileHover={{
              rotate: [0, -10, 10, -5, 0],
              scale: 1.1,
            }}
            whileTap={{
              scale: 0.9,
            }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-marigold to-blush flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(232,145,45,0.45)] border border-white/60 text-white"
          >
            <Sparkles size={19} className="text-white" />
          </motion.div>
          <div className="leading-tight">
            <span className="font-display font-bold text-xl tracking-tight text-ink group-hover:text-marigold transition-colors">
              Jipate
              <span className="text-marigold font-normal italic">Events</span>
            </span>
            <span className="block text-[10px] font-semibold text-ink/45 tracking-wider uppercase">
              Digital Invites &amp; RSVP
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-sand-100/80 rounded-full border border-white/80 shadow-inner">
          {/* GUEST: Home & Occasions */}
          {!isAuthenticated && !isAdmin && (
            <>
              <NavItem to="/" label="Home" icon={Home} />
              <NavItem to="/events" label="Occasions" icon={CalendarDays} />
            </>
          )}

          {/* CLIENT: Occasions, My events, Reminders, Check-in */}
          {isAuthenticated && !isAdmin && (
            <>
              <NavItem to="/events" label="Occasions" icon={CalendarDays} />
              <NavItem
                to="/dashboard"
                label="My Events"
                icon={LayoutDashboard}
              />
              <NavItem to="/reminders" label="Reminders" icon={BellRing} />
              <NavItem to="/scan" label="Door Check-in" icon={ScanLine} />
            </>
          )}

          {/* ADMIN: Admin Dashboard */}
          {isAdmin && (
            <NavItem to="/admin" label="Admin Console" icon={ShieldCheck} />
          )}
        </nav>

        {/* Action Controls & Sound Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {/* Sound Synthesizer Toggle Button */}
          <motion.button
            whileHover={{
              scale: 1.08,
            }}
            whileTap={{
              scale: 0.92,
            }}
            onClick={handleSoundToggle}
            className="w-9 h-9 rounded-full bg-sand-100/90 border border-white flex items-center justify-center text-ink/70 hover:text-marigold transition-colors shadow-sm"
            title={
              isMuted ? "Unmute playful sound effects" : "Mute sound effects"
            }
          >
            {isMuted ? (
              <VolumeX size={16} />
            ) : (
              <Volume2 size={16} className="text-marigold" />
            )}
          </motion.button>

          {isAuthenticated ? (
            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={handleLogout}
              className="clay-btn-secondary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <LogOut size={15} /> Log out
            </motion.button>
          ) : (
            <Link to="/login">
              <motion.button
                whileHover={{
                  scale: 1.04,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                onClick={() => playPopSound(540)}
                className="clay-btn-primary !py-2 !px-5 text-xs font-bold"
              >
                Log in
              </motion.button>
            </Link>
          )}
        </div>

        {/* Mobile Menu & Sound Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={handleSoundToggle}
            className="w-9 h-9 rounded-full bg-sand-100 flex items-center justify-center text-ink/70"
            aria-label="Toggle Sound"
          >
            {isMuted ? (
              <VolumeX size={16} />
            ) : (
              <Volume2 size={16} className="text-marigold" />
            )}
          </button>
          <button
            onClick={() => {
              playPopSound(440);
              setOpen((v) => !v);
            }}
            className="p-2 -mr-2 text-ink rounded-xl hover:bg-sand-100/80 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="md:hidden border-t border-white/60 bg-[#FAF5EB]/95 backdrop-blur-2xl px-6 py-5 flex flex-col gap-3 shadow-xl overflow-hidden"
          >
            {!isAuthenticated && !isAdmin && (
              <>
                <MobileNavItem
                  to="/"
                  label="Home"
                  onClick={() => setOpen(false)}
                  icon={Home}
                />
                <MobileNavItem
                  to="/events"
                  label="Occasions"
                  onClick={() => setOpen(false)}
                  icon={CalendarDays}
                />
              </>
            )}

            {isAuthenticated && !isAdmin && (
              <>
                <MobileNavItem
                  to="/events"
                  label="Occasions"
                  onClick={() => setOpen(false)}
                  icon={CalendarDays}
                />
                <MobileNavItem
                  to="/dashboard"
                  label="My Events"
                  onClick={() => setOpen(false)}
                  icon={LayoutDashboard}
                />
                <MobileNavItem
                  to="/reminders"
                  label="Reminders"
                  onClick={() => setOpen(false)}
                  icon={BellRing}
                />
                <MobileNavItem
                  to="/scan"
                  label="Door Check-in"
                  onClick={() => setOpen(false)}
                  icon={ScanLine}
                />
              </>
            )}

            {isAdmin && (
              <MobileNavItem
                to="/admin"
                label="Admin Dashboard"
                onClick={() => setOpen(false)}
                icon={ShieldCheck}
              />
            )}

            <div className="pt-3 mt-1 border-t border-ink/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="clay-btn-secondary !w-full justify-center text-sm font-semibold flex items-center gap-2"
                >
                  <LogOut size={16} /> Log out ({session?.phone || "User"})
                </button>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)}>
                  <button className="clay-btn-primary !w-full justify-center text-sm font-bold">
                    Log in
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      onClick={() => playPopSound(480)}
      className={({ isActive }) =>
        `relative px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${isActive ? "text-white shadow-[0_4px_12px_rgba(232,145,45,0.4)]" : "text-ink/65 hover:text-ink hover:bg-white/50"}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="navPill"
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 30,
              }}
              className="absolute inset-0 bg-gradient-to-r from-marigold to-marigold-600 rounded-full -z-10"
            />
          )}
          <Icon size={14} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
function MobileNavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={() => {
        playPopSound(480);
        onClick();
      }}
      className={({ isActive }) =>
        `flex items-center gap-2.5 p-3 rounded-2xl text-sm font-bold transition-colors ${isActive ? "bg-marigold text-white shadow-md" : "text-ink/75 hover:bg-sand-100"}`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}
