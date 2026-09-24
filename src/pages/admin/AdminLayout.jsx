import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  CalendarDays,
  LayoutTemplate,
  MessageSquareText,
  Package,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  CalendarClock,
  Users2,
  Send,
  LogIn,
  BarChart3,
  ScanLine,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { playPopSound } from "../../utils/audio";
const NAV = [
  {
    to: "/admin",
    label: "Overview",
    icon: LayoutGrid,
    end: true,
  },
  {
    to: "/admin/clients",
    label: "Clients",
    icon: Users2,
  },
  {
    to: "/admin/invitations",
    label: "All Invitations",
    icon: Send,
  },
  {
    to: "/admin/scheduled",
    label: "Scheduled Queue",
    icon: CalendarClock,
  },
  {
    to: "/admin/events",
    label: "Occasions",
    icon: CalendarDays,
  },
  {
    to: "/admin/card-templates",
    label: "Card Designs",
    icon: LayoutTemplate,
  },
  {
    to: "/admin/paragraphs",
    label: "Paragraphs",
    icon: FileText,
  },
  {
    to: "/admin/sms-templates",
    label: "SMS Templates",
    icon: MessageSquareText,
  },
  {
    to: "/admin/bundles",
    label: "Bundles & Pricing",
    icon: Package,
  },
  {
    to: "/admin/scanners",
    label: "Gate Scanners",
    icon: ScanLine,
  },
  {
    to: "/admin/admins",
    label: "System Admins",
    icon: ShieldCheck,
  },
  {
    to: "/admin/analytics",
    label: "Business Analytics",
    icon: BarChart3,
  },
];
export default function AdminLayout() {
  const { logout, session, isImpersonating, stopImpersonating } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };
  return (
    <div className="min-h-screen flex bg-[#FAF5EB]">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-marigold text-white px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-3 fixed top-0 inset-x-0 z-[60] shadow-md">
          <LogIn size={15} />
          <span>Impersonating client: {session?.phone}</span>
          <button
            onClick={stopImpersonating}
            className="underline ml-2 bg-white/20 px-2 py-0.5 rounded-full hover:bg-white/30"
          >
            Return to Admin
          </button>
        </div>
      )}

      {/* Desktop Sidebar with Frosted Dark Glass look */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-ink text-white flex-col p-6 shadow-2xl relative">
        <SidebarContent
          session={session}
          onLogout={handleLogout}
          onNavigate={() => {}}
        />
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-ink text-white flex items-center justify-between px-5 h-16 shadow-md">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-marigold" />
          <span className="font-display font-bold text-sm">Admin Console</span>
        </div>
        <button
          onClick={() => {
            playPopSound(440);
            setMobileOpen((v) => !v);
          }}
          className="p-1"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
              x: -280,
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: -280,
            }}
            className="lg:hidden fixed inset-0 z-50 bg-ink/98 text-white p-6 flex flex-col max-w-xs shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-display font-bold">Admin Navigation</span>
              <button onClick={() => setMobileOpen(false)} className="p-1">
                <X size={20} />
              </button>
            </div>
            <SidebarContent
              session={session}
              onLogout={handleLogout}
              onNavigate={() => setMobileOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main
        className={`flex-1 min-w-0 pt-16 lg:pt-0 ${isImpersonating ? "mt-8" : ""}`}
      >
        <div className="p-5 sm:p-8 lg:p-10 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
function SidebarContent({ session, onLogout, onNavigate }) {
  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-marigold/20 flex items-center justify-center text-marigold">
          <ShieldCheck size={20} />
        </div>
        <div className="leading-tight">
          <p className="font-display font-bold text-base text-white">
            Jipate Admin
          </p>
          <p className="text-[10px] text-white/50">Catalog &amp; Operations</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => {
              playPopSound(460);
              onNavigate();
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${isActive ? "bg-marigold text-white shadow-[0_4px_12px_rgba(232,145,45,0.35)]" : "text-white/65 hover:bg-white/10 hover:text-white"}`
            }
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 mt-6 border-t border-white/10">
        <p className="text-[11px] text-white/40 mb-2 truncate">
          Logged in: {session?.phone || "Admin"}
        </p>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={15} /> Log out
        </button>
      </div>
    </>
  );
}
