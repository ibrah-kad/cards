import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  LayoutTemplate,
  Check,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import { CatalogAPI, assetUrl } from "../api/api";
import Loader from "../components/Loader";
import InteractiveCard3D from "../components/InteractiveCard3D";
import { playPopSound } from "../utils/audio";
import { fireCelebrationConfetti } from "../utils/confetti";
export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [templates, setTemplates] = useState(null);
  const [previewName, setPreviewName] = useState("Baraka & Neema");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!eventId) return;
    CatalogAPI.listEvents()
      .then((all) => {
        const found = all.find((e) => String(e.id) === eventId);
        setEvent(found || null);
      })
      .catch((e) => setError(e.message));
    CatalogAPI.listCardTemplates(eventId)
      .then(setTemplates)
      .catch((e) => setError(e.message));
  }, [eventId]);
  const handleSelectTemplate = (tplId) => {
    fireCelebrationConfetti(0.5, 0.4);
    navigate(`/build/${eventId}/${tplId}`);
  };
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
      {/* Back button */}
      <Link
        to="/events"
        onClick={() => playPopSound(420)}
        className="inline-flex items-center gap-2 text-xs font-bold text-ink/60 hover:text-ink mb-6"
      >
        <ArrowLeft size={15} /> All Occasions
      </Link>

      {error && <p className="text-red-500 mb-6">{error}</p>}

      {event && (
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-marigold-700 bg-marigold/10 px-3 py-1 rounded-full mb-2">
              <Sparkles size={12} />
              <span>{event.name}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-ink tracking-tight">
              Pick a Card Layout
            </h1>
            <p className="text-sm text-ink/65 mt-2 max-w-xl">
              {event.description}
            </p>
          </div>

          {/* Interactive Live Sample Text Customizer */}
          <div className="glass-card p-3.5 rounded-2xl flex items-center gap-3 border border-white/80 shadow-sm max-w-sm">
            <Wand2 size={16} className="text-marigold shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold text-ink/50 uppercase tracking-wider block">
                Live Sample Name
              </label>
              <input
                value={previewName}
                onChange={(e) => setPreviewName(e.target.value)}
                placeholder="e.g. Baraka & Neema"
                className="bg-transparent border-none text-xs font-bold text-ink focus:outline-none w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* SMS Only Notice */}
      {event && event.needsCard === false && (
        <div className="glass-card p-8 text-center max-w-xl mx-auto">
          <p className="font-display font-bold text-2xl text-ink mb-2">
            This occasion is SMS-Only
          </p>
          <p className="text-sm text-ink/65 mb-6">
            No card design is needed for this occasion. Cards are skipped and
            messages are sent directly via SMS.
          </p>
          <Link to={`/build/${eventId}/0`}>
            <button className="clay-btn-primary text-sm font-bold">
              Continue to Guest List
            </button>
          </Link>
        </div>
      )}

      {!templates && !error && <Loader label="Loading card designs…" full />}

      {templates && templates.length === 0 && (
        <div className="glass-card p-12 text-center max-w-lg mx-auto">
          <LayoutTemplate size={36} className="mx-auto mb-3 text-ink/30" />
          <p className="font-display font-bold text-lg text-ink">
            No templates published yet
          </p>
          <p className="text-xs text-ink/50 mt-1">
            Please select another occasion or check back soon.
          </p>
        </div>
      )}

      {/* Templates Grid */}
      {templates && templates.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((tpl) => (
            <InteractiveCard3D
              key={tpl.id}
              tiltIntensity={9}
              className="flex flex-col h-full overflow-hidden hover:shadow-2xl"
            >
              {/* Card Canvas Visual Preview */}
              <div className="aspect-[3/4] relative bg-gradient-to-br from-sand-100 via-blush/20 to-marigold/10 flex flex-col items-center justify-between p-6 text-center border-b border-ink/8 overflow-hidden group">
                {tpl.previewImageUrl && (
                  <img
                    src={assetUrl(tpl.previewImageUrl)}
                    alt={tpl.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent" />

                {/* Overlaid sample text */}
                <div className="relative z-10 w-full pt-4">
                  <span className="label-eyebrow text-[9px] mb-1 block">
                    Official Pass
                  </span>
                  <p className="font-display font-bold text-2xl text-marigold-700 leading-tight">
                    {previewName || "Celebration Names"}
                  </p>
                  <p className="text-xs text-ink/65 mt-1 font-medium">
                    Saturday, 28th October
                  </p>
                </div>

                <div className="relative z-10 w-full pb-2">
                  <div className="inline-block px-3 py-1 rounded-full bg-sand-100/90 border border-ink/10 text-[10px] font-bold text-ink/70">
                    Admits Two · QR Pass Included
                  </div>
                </div>
              </div>

              {/* Card Footer & Action */}
              <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-ink mb-1">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-ink/55">
                    High-res mobile export with gold typographic hierarchy.
                  </p>
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className="clay-btn-primary !w-full !py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Use This Design</span>
                </motion.button>
              </div>
            </InteractiveCard3D>
          ))}
        </div>
      )}
    </div>
  );
}
