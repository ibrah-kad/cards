import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { CatalogAPI, assetUrl } from "../api/api";
import PlayfulBlobs from "../components/PlayfulBlobs";
import Loader from "../components/Loader";
import InteractiveCard3D from "../components/InteractiveCard3D";
import { playPopSound } from "../utils/audio";
export default function Events() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    CatalogAPI.listEvents()
      .then(setEvents)
      .catch((e) => setError(e.message));
  }, []);
  const filteredEvents = events?.filter((ev) => {
    if (filter === "cards") return ev.needsCard !== false;
    if (filter === "sms") return ev.needsCard === false;
    return true;
  });
  return (
    <div className="relative min-h-screen">
      <PlayfulBlobs variant="section" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
        {/* Header */}
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-marigold/10 text-marigold-700 text-xs font-bold mb-3">
            <Sparkles size={13} />
            <span>Select Your Occasion</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink tracking-tight">
            What are you celebrating?
          </h1>
          <p className="text-sm sm:text-base text-ink/70 mt-3 leading-relaxed">
            Choose your occasion to explore custom typography card layouts,
            WhatsApp delivery packages, and door pass check-ins.
          </p>

          {/* Interactive Filter Pills */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => {
                playPopSound(450);
                setFilter("all");
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === "all" ? "bg-marigold text-white shadow-md" : "bg-sand-100 text-ink/65 hover:bg-sand-200"}`}
            >
              All Occasions
            </button>
            <button
              onClick={() => {
                playPopSound(480);
                setFilter("cards");
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === "cards" ? "bg-marigold text-white shadow-md" : "bg-sand-100 text-ink/65 hover:bg-sand-200"}`}
            >
              Digital Cards + Pass
            </button>
            <button
              onClick={() => {
                playPopSound(510);
                setFilter("sms");
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === "sms" ? "bg-marigold text-white shadow-md" : "bg-sand-100 text-ink/65 hover:bg-sand-200"}`}
            >
              SMS Blasts Only
            </button>
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {!events && !error && <Loader label="Loading all occasions…" full />}

        {events && filteredEvents && filteredEvents.length === 0 && (
          <div className="glass-card p-12 text-center max-w-md mx-auto">
            <p className="font-semibold text-ink/60">
              No occasions match this filter.
            </p>
          </div>
        )}

        {filteredEvents && filteredEvents.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => (
              <Link
                key={ev.id}
                to={`/events/${ev.id}`}
                onClick={() => playPopSound(500)}
              >
                <InteractiveCard3D
                  tiltIntensity={8}
                  className="group flex flex-col h-full overflow-hidden hover:shadow-2xl"
                >
                  <div className="h-48 bg-gradient-to-br from-sand-200 to-blush/30 relative overflow-hidden">
                    {ev.coverImageUrl && (
                      <img
                        src={assetUrl(ev.coverImageUrl)}
                        alt={ev.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-ink shadow-sm">
                      {ev.needsCard === false
                        ? "SMS Notification"
                        : "WhatsApp + QR"}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-xl text-ink group-hover:text-marigold transition-colors mb-2">
                        {ev.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-ink/65 line-clamp-3 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-ink/6 flex items-center justify-between text-xs font-bold text-marigold">
                      <span>
                        {ev.needsCard === false
                          ? "Start SMS Blast"
                          : "Browse Card Designs"}
                      </span>
                      <ArrowRight
                        size={15}
                        className="group-hover:translate-x-1.5 transition-transform"
                      />
                    </div>
                  </div>
                </InteractiveCard3D>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
