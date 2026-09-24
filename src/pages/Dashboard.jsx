import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarHeart,
  Users,
  ScanLine,
  Plus,
  Filter,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { DashboardAPI } from "../api/api";
import Loader from "../components/Loader";
import InteractiveCard3D from "../components/InteractiveCard3D";
import { useAuth } from "../context/AuthContext";
import { playPopSound } from "../utils/audio";
const STATUS_STYLES = {
  DRAFT: "bg-ink/10 text-ink/60",
  PAID: "bg-sage/20 text-sage-700",
  SENT: "bg-marigold/20 text-marigold-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-ink/10 text-ink/40",
};
export default function Dashboard() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { session } = useAuth();
  useEffect(() => {
    DashboardAPI.myEvents()
      .then(setEvents)
      .catch((e) => setError(e.message));
  }, []);
  const categories = useMemo(() => {
    if (!events) return [];
    const cats = new Set(events.map((ev) => ev.eventName));
    return ["All", ...Array.from(cats)];
  }, [events]);
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (selectedCategory === "All") return events;
    return events.filter((ev) => ev.eventName === selectedCategory);
  }, [events, selectedCategory]);
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="label-eyebrow mb-1.5 block">Host Portal</span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
            My Celebrations
          </h1>
          <p className="text-xs sm:text-sm text-ink/60 mt-1">
            Managing events for{" "}
            <strong>{session?.phone || "Guest Host"}</strong>
          </p>
        </div>

        <Link to="/events" onClick={() => playPopSound(520)}>
          <motion.button
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.96,
            }}
            className="clay-btn-primary !py-2.5 !px-5 text-xs font-bold flex items-center gap-2"
          >
            <Plus size={16} />
            <span>New Invitation</span>
          </motion.button>
        </Link>
      </div>

      {error && <p className="text-red-500 mb-6">{error}</p>}
      {!events && !error && <Loader label="Loading your celebrations…" full />}

      {events && events.length === 0 && (
        <div className="glass-card p-12 text-center max-w-lg mx-auto">
          <CalendarHeart className="mx-auto mb-4 text-ink/30" size={38} />
          <h3 className="font-display font-bold text-xl text-ink mb-1">
            No events found
          </h3>
          <p className="text-xs text-ink/60 mb-6">
            You haven't created any celebrations yet. Start your first digital
            invitation in minutes!
          </p>
          <Link to="/events">
            <button className="clay-btn-primary text-xs font-bold">
              Explore Occasions
            </button>
          </Link>
        </div>
      )}

      {events && events.length > 0 && (
        <>
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <Filter size={15} className="text-ink/40 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playPopSound(460);
                  setSelectedCategory(cat);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? "bg-marigold text-white shadow-md" : "bg-sand-100 text-ink/65 hover:bg-sand-200"}`}
              >
                {cat}
                {cat !== "All" && (
                  <span className="ml-1.5 opacity-75">
                    ({events.filter((e) => e.eventName === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Event Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => (
              <Link
                key={ev.id}
                to={`/dashboard/events/${ev.id}`}
                onClick={() => playPopSound(490)}
              >
                <InteractiveCard3D
                  tiltIntensity={7}
                  className="p-6 flex flex-col justify-between h-full hover:shadow-2xl"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-ink/40 tracking-wider">
                          {ev.reference}
                        </span>
                        <h3 className="font-display font-bold text-xl text-ink leading-snug mt-0.5">
                          {ev.eventName}
                        </h3>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[ev.status] || "bg-ink/10"}`}
                      >
                        {ev.status}
                      </span>
                    </div>

                    {/* Credit or Debt notifications */}
                    {ev.creditBalance && ev.creditBalance > 0 ? (
                      <div className="bg-sage-100 text-sage-800 px-3 py-1.5 rounded-xl text-xs font-semibold mb-3 flex items-center gap-1.5">
                        <Sparkles size={13} />
                        <span>{ev.creditBalance} card credit available</span>
                      </div>
                    ) : null}

                    {/* Metrics row */}
                    <div className="grid grid-cols-2 gap-2.5 my-3">
                      <div className="bg-sand-100/80 rounded-2xl p-3 flex items-center gap-2 border border-white">
                        <Users
                          size={16}
                          className="text-marigold-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-sm text-ink leading-tight">
                            {ev.totalCardsSent || ev.guests?.length || 0}
                          </p>
                          <p className="text-[10px] text-ink/50">cards sent</p>
                        </div>
                      </div>

                      <div className="bg-sand-100/80 rounded-2xl p-3 flex items-center gap-2 border border-white">
                        <ScanLine
                          size={16}
                          className="text-sage-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-sm text-ink leading-tight">
                            {ev.checkedInAttendees || 0}/
                            {ev.expectedAttendees || 0}
                          </p>
                          <p className="text-[10px] text-ink/50">checked in</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink/8 text-xs">
                    <span className="font-bold text-ink/75">
                      {Number(ev.totalAmount || 0).toLocaleString()}{" "}
                      {ev.currency}
                    </span>
                    <span className="font-bold text-marigold-700 flex items-center gap-1 hover:underline">
                      <span>Guest Report</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </InteractiveCard3D>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
