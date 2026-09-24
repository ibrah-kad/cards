import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageCircleHeart,
  QrCode,
  Send,
  Sparkles,
  PartyPopper,
  Heart,
  Check,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { CatalogAPI } from "../api/api";
import PlayfulBlobs from "../components/PlayfulBlobs";
import Loader from "../components/Loader";
import PhonePreview from "../components/PhonePreview";
import InteractiveCard3D from "../components/InteractiveCard3D";
import { fireCelebrationConfetti } from "../utils/confetti";
import { playPopSound } from "../utils/audio";
const STEPS = [
  {
    icon: Sparkles,
    number: "01",
    title: "Pick your design",
    body: "Choose an occasion: wedding, send-off, kitchen party, or birthday. Select an exquisite gold or floral layout.",
    color: "from-marigold/20 to-blush/20",
    iconColor: "text-marigold",
  },
  {
    icon: Send,
    number: "02",
    title: "Add your guests",
    body: "Paste names and phone numbers or upload a CSV. Our smart parser sorts out couples and singles instantly.",
    color: "from-sage/20 to-sand-200/40",
    iconColor: "text-sage-700",
  },
  {
    icon: MessageCircleHeart,
    number: "03",
    title: "Direct to WhatsApp",
    body: "Each guest receives a personalised, high-res invitation with their name engraved, plus SMS backup.",
    color: "from-blush/30 to-marigold/15",
    iconColor: "text-rose-600",
  },
  {
    icon: QrCode,
    number: "04",
    title: "Fast Door Check-in",
    body: "Every card includes a unique QR code. Your gate ushers scan guests in 1 second and watch attendance live.",
    color: "from-dusk/20 to-sage/20",
    iconColor: "text-dusk",
  },
];
const REVIEWS = [
  {
    name: "Baraka & Neema Mushi",
    event: "Wedding Gala · Msasani",
    text: "Our 320 guests were blown away by receiving personalized cards right on WhatsApp! The live QR door check-in eliminated wedding crashers completely.",
    rating: 5,
  },
  {
    name: "Zawadi Kweka",
    event: "Send-Off Night · Arusha",
    text: "Super easy to set up. Uploaded my guest list in 2 minutes, and the automated SMS reminders meant almost 100% attendance on time.",
    rating: 5,
  },
  {
    name: "Amina & Faraji",
    event: "Kitchen Party · Zanzibar",
    text: "The designs are stunning and festive. Guests kept screenshotting and sharing on Instagram stories. Highly recommended!",
    rating: 5,
  },
];
export default function Home() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");
  const [guestCount, setGuestCount] = useState(150);
  useEffect(() => {
    CatalogAPI.listEvents()
      .then(setEvents)
      .catch((e) => setError(e.message));
  }, []);
  const estimatedCost = 25000 + guestCount * 2200;
  return (
    <div className="relative overflow-hidden">
      <PlayfulBlobs variant="hero" />

      {/* Floating interactive party icons */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [-6, 6, -6],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="hidden lg:block absolute top-28 right-[14%] text-marigold-500/70 pointer-events-none"
      >
        <PartyPopper size={36} />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 14, 0],
          rotate: [8, -8, 8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="hidden lg:block absolute bottom-44 left-[6%] text-blush-600/70 pointer-events-none"
      >
        <Heart size={30} className="fill-blush/30" />
      </motion.div>

      {/* ========================================================
          HERO SECTION
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-20 sm:pb-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center">
        <div>
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand-100/90 border border-white/80 shadow-sm text-xs font-bold text-marigold-700 mb-6"
          >
            <Sparkles size={14} className="text-marigold animate-spin" />
            <span>Direct to WhatsApp · No Spam · Live QR Check-in</span>
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="font-display text-4xl sm:text-6xl lg:text-[4rem] leading-[1.08] font-bold text-ink tracking-tight"
          >
            Turn your guest list into{" "}
            <span className="italic font-medium text-marigold block">
              unforgettable cards.
            </span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="mt-6 text-base sm:text-lg text-ink/70 max-w-xl leading-relaxed"
          >
            Delight your loved ones with personalized WhatsApp invitations,
            automated SMS reminders, and seamless QR check-in for weddings,
            send-offs, birthdays, and celebrations.
          </motion.p>

          {/* Interactive CTAs with tactile press */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link to="/events">
              <motion.button
                whileHover={{
                  scale: 1.04,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                onClick={() => {
                  playPopSound(580);
                  fireCelebrationConfetti(0.4, 0.4);
                }}
                className="clay-btn-primary text-base font-bold flex items-center gap-2 !px-7 !py-3.5"
              >
                <span>Create an Invitation</span>
                <ArrowRight size={18} />
              </motion.button>
            </Link>

            <Link to="/events/1">
              <motion.button
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={() => playPopSound(460)}
                className="clay-btn-secondary text-sm font-semibold !px-5 !py-3.5"
              >
                Browse Designs
              </motion.button>
            </Link>
          </motion.div>

          {/* Live Trust Metrics */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.4,
            }}
            className="mt-10 pt-8 border-t border-ink/8 grid grid-cols-3 gap-4 text-left"
          >
            <div>
              <p className="font-display font-bold text-2xl sm:text-3xl text-ink">
                98.8%
              </p>
              <p className="text-xs text-ink/55 font-medium mt-0.5">
                Delivery Rate
              </p>
            </div>
            <div>
              <p className="font-display font-bold text-2xl sm:text-3xl text-marigold">
                1 sec
              </p>
              <p className="text-xs text-ink/55 font-medium mt-0.5">
                QR Gate Scan
              </p>
            </div>
            <div>
              <p className="font-display font-bold text-2xl sm:text-3xl text-sage">
                50K+
              </p>
              <p className="text-xs text-ink/55 font-medium mt-0.5">
                Happy Guests
              </p>
            </div>
          </motion.div>
        </div>

        {/* Live Interactive Phone Simulator (Touch responsive!) */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.92,
            rotate: 2,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="flex justify-center"
        >
          <PhonePreview
            coupleNames="Baraka & Neema"
            eventName="Send-Off & Wedding Gala"
            eventDate="Saturday, 28th October · 18:00"
            venue="Msasani Beach Club, Dar es Salaam"
            guestName="Amina Juma"
          />
        </motion.div>
      </section>

      {/* ========================================================
          HOW IT WORKS (PLAYFUL 3D MORPHIC CARDS)
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="label-eyebrow mb-2">Simple &amp; Delightful</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
            Four simple steps, zero hassle
          </h2>
          <p className="mt-2 text-sm text-ink/65">
            Everything is handled automatically from your guest list to the
            final dance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <InteractiveCard3D
              key={s.title}
              tiltIntensity={10}
              className="p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-ink/30 tracking-wider">
                    {s.number}
                  </span>
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center ${s.iconColor} shadow-sm`}
                  >
                    <s.icon size={20} />
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg text-ink mb-2">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink/65 leading-relaxed">
                  {s.body}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-ink/6 flex items-center gap-1 text-[11px] font-bold text-marigold">
                <span>Step {i + 1}</span>
                <Check size={12} />
              </div>
            </InteractiveCard3D>
          ))}
        </div>
      </section>

      {/* ========================================================
          INTERACTIVE GUEST CALCULATOR (TACTILE PLAYFUL WIDGET)
          ======================================================== */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
        <InteractiveCard3D className="p-8 sm:p-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <span className="label-eyebrow mb-1 block">
                Live Cost Calculator
              </span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink mb-2">
                Estimate your package
              </h3>
              <p className="text-sm text-ink/65 mb-6">
                Slide to select your guest count. Includes personalized WhatsApp
                cards, SMS reminder blasts, and QR scan passes.
              </p>

              {/* Interactive Range Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-ink/60">Invited Guests:</span>
                  <span className="text-marigold text-lg font-display">
                    {guestCount} guests
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="600"
                  step="10"
                  value={guestCount}
                  onChange={(e) => {
                    playPopSound(300 + Number(e.target.value));
                    setGuestCount(Number(e.target.value));
                  }}
                  className="w-full accent-marigold cursor-pointer h-2 bg-sand-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-ink/40 font-mono">
                  <span>20 guests</span>
                  <span>300</span>
                  <span>600 guests</span>
                </div>
              </div>
            </div>

            {/* Price badge with clay extrusions */}
            <div className="w-full md:w-64 bg-sand-100/90 rounded-3xl p-6 border border-white flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-xs font-bold text-ink/50 uppercase tracking-wide mb-1">
                Estimated Total
              </span>
              <motion.span
                key={estimatedCost}
                initial={{
                  scale: 0.9,
                  opacity: 0.7,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                className="font-display font-bold text-3xl sm:text-4xl text-marigold-700"
              >
                {estimatedCost.toLocaleString()}
              </motion.span>
              <span className="text-xs text-ink/50 mt-0.5">
                TZS · Mobile Money
              </span>

              <Link to="/events" className="w-full mt-5">
                <button
                  onClick={() => playPopSound(540)}
                  className="clay-btn-primary !w-full !py-2.5 text-xs font-bold"
                >
                  Start Now
                </button>
              </Link>
            </div>
          </div>
        </InteractiveCard3D>
      </section>

      {/* ========================================================
          OCCASIONS PREVIEW
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <p className="label-eyebrow mb-2">Celebration Types</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              Occasions we dress up
            </h2>
          </div>
          <Link
            to="/events"
            onClick={() => playPopSound(480)}
            className="clay-btn-secondary text-xs font-bold flex items-center gap-1.5"
          >
            <span>View All Occasions</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {!events && !error && <Loader label="Loading occasions…" />}

        {events && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((ev) => (
              <Link
                key={ev.id}
                to={`/events/${ev.id}`}
                onClick={() => playPopSound(500)}
              >
                <InteractiveCard3D
                  tiltIntensity={8}
                  className="group flex flex-col h-full overflow-hidden hover:shadow-2xl"
                >
                  <div className="h-44 bg-gradient-to-br from-sand-200 to-blush/30 relative overflow-hidden">
                    {ev.coverImageUrl && (
                      <img
                        src={ev.coverImageUrl}
                        alt={ev.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-md">
                        {ev.needsCard === false
                          ? "SMS Blast"
                          : "WhatsApp Card + Pass"}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-xl text-ink group-hover:text-marigold transition-colors mb-1.5">
                        {ev.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-ink/65 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-ink/6 flex items-center justify-between text-xs font-bold text-marigold">
                      <span>Explore Designs</span>
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </InteractiveCard3D>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================
          USER REVIEWS & TESTIMONIALS
          ======================================================== */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="text-center max-w-md mx-auto mb-10">
          <p className="label-eyebrow mb-1">Social Proof</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Loved by hosts across Tanzania
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <InteractiveCard3D
              key={i}
              tiltIntensity={6}
              className="p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-marigold mb-3">
                  {[...Array(r.rating)].map((_, idx) => (
                    <Star key={idx} size={14} className="fill-marigold" />
                  ))}
                </div>
                <p className="text-sm text-ink/75 italic leading-relaxed mb-4">
                  "{r.text}"
                </p>
              </div>
              <div className="pt-3 border-t border-ink/8">
                <p className="font-display font-bold text-sm text-ink">
                  {r.name}
                </p>
                <p className="text-[11px] text-ink/50">{r.event}</p>
              </div>
            </InteractiveCard3D>
          ))}
        </div>
      </section>
    </div>
  );
}
