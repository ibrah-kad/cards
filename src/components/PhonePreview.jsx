import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  QrCode,
  Sparkles,
  MapPin,
  Calendar,
  Share2,
} from "lucide-react";
import { fireCelebrationConfetti } from "../utils/confetti";
import { playPopSound } from "../utils/audio";
export default function PhonePreview({
  coupleNames = "Baraka & Neema",
  eventName = "Send-Off & Wedding Gala",
  eventDate = "Sat, 28th October · 18:00 EAT",
  venue = "Msasani Beach Club, Dar es Salaam",
  guestName = "Amina Juma",
  cardImage,
}) {
  const [rsvpd, setRsvpd] = useState(false);
  const [activeTab, setActiveTab] = useState("card");
  const handleRsvp = () => {
    setRsvpd(true);
    setActiveTab("qr");
    fireCelebrationConfetti(0.5, 0.5);
  };
  return (
    <div className="relative mx-auto w-full max-w-[340px] select-none">
      {/* Decorative ambient glowing backplate */}
      <div className="absolute -inset-2 bg-gradient-to-tr from-marigold-500/30 via-blush/30 to-sage/30 rounded-[3rem] blur-xl opacity-70 -z-10" />

      {/* Smartphone Frame with Clay/Glass Sheen */}
      <div className="relative rounded-[2.75rem] p-3 bg-gradient-to-b from-white/90 via-sand-100/90 to-white/70 border-2 border-white/80 shadow-[0_24px_50px_-12px_rgba(38,32,26,0.22)] backdrop-blur-xl">
        {/* Dynamic Island / Speaker notch */}
        <div className="w-24 h-4 bg-ink/90 rounded-full mx-auto mb-3.5 flex items-center justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-ink/60" />
          <div className="w-2 h-2 rounded-full bg-blue-900/80" />
        </div>

        {/* Screen Bezel */}
        <div className="rounded-[2.1rem] overflow-hidden bg-[#EFEAE2] border border-ink/10 flex flex-col min-h-[500px] relative">
          {/* WhatsApp Style Top Header */}
          <div className="bg-[#075E54] text-white px-3.5 py-2.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white">
                JP
              </div>
              <div className="leading-tight">
                <p className="font-semibold text-xs text-white flex items-center gap-1">
                  Jipate Connect
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </p>
                <p className="text-[10px] text-white/80">
                  Official Invitation Bot
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Share2 size={13} />
            </div>
          </div>

          {/* Chat Canvas with Wallpaper pattern */}
          <div className="p-3 flex-1 flex flex-col justify-end gap-2.5">
            {/* WhatsApp Speech Bubble */}
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-md border border-black/5 text-ink text-xs"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5 text-[10px] text-marigold-700 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Sparkles size={11} /> You're Invited!
                </span>
                <span className="text-ink/40 font-normal">14:02</span>
              </div>

              <p className="font-display font-semibold text-sm text-ink mb-1">
                Habari {guestName}! 🎉
              </p>
              <p className="text-ink/75 leading-relaxed text-[11px] mb-2.5">
                Join us as we celebrate <strong>{coupleNames}</strong> for the{" "}
                <strong>{eventName}</strong>.
              </p>

              {/* Event Quick Pill Tags */}
              <div className="bg-sand-100/90 rounded-xl p-2 mb-2.5 flex flex-col gap-1 text-[10px] text-ink/70">
                <div className="flex items-center gap-1.5">
                  <Calendar size={11} className="text-marigold-700" />
                  <span>{eventDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={11} className="text-sage-700" />
                  <span className="truncate">{venue}</span>
                </div>
              </div>

              {/* Interactive Card / QR View Area */}
              <div className="relative rounded-xl overflow-hidden border border-ink/10 bg-sand-200/50 mb-2.5 aspect-[4/3] flex items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  {activeTab === "card" ? (
                    <motion.div
                      key="card"
                      initial={{
                        opacity: 0,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.95,
                      }}
                      className="w-full h-full relative flex flex-col items-center justify-center p-3 text-ink bg-gradient-to-br from-white/95 to-sand-100/95"
                    >
                      {cardImage ? (
                        <img
                          src={cardImage}
                          alt="Card"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <p className="label-eyebrow text-[9px] mb-1">
                            Official Invitation
                          </p>
                          <p className="font-display font-bold text-base text-marigold-700 leading-tight mb-1">
                            {coupleNames}
                          </p>
                          <p className="text-[10px] text-ink/60">{eventName}</p>
                          <div className="mt-2 text-[9px] bg-marigold-50 text-marigold-700 border border-marigold-200 px-2 py-0.5 rounded-full font-semibold">
                            Admits Two (VIP)
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="qr"
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                      }}
                      className="w-full h-full flex flex-col items-center justify-center p-3 bg-white"
                    >
                      {/* Interactive Simulated QR Code */}
                      <div className="w-24 h-24 p-1.5 bg-white border-2 border-dashed border-ink/30 rounded-xl flex items-center justify-center relative">
                        <QrCode size={76} className="text-ink" />
                        <div className="absolute inset-0 bg-marigold-500/10 rounded-lg flex items-center justify-center pointer-events-none" />
                      </div>
                      <p className="font-mono font-bold text-xs text-marigold-700 tracking-wider mt-1.5">
                        PASS #JP-7A9K
                      </p>
                      <p className="text-[9px] text-ink/50">
                        Show at gate for scan
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tappable Interactive Action Buttons */}
              <div className="flex gap-1.5">
                {!rsvpd ? (
                  <motion.button
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={handleRsvp}
                    className="clay-btn-primary !w-full !py-2 !text-xs"
                  >
                    <Check size={13} /> Confirm RSVP &amp; Get QR
                  </motion.button>
                ) : (
                  <div className="flex gap-1.5 w-full">
                    <button
                      onClick={() => {
                        playPopSound(500);
                        setActiveTab("card");
                      }}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition-all ${activeTab === "card" ? "bg-marigold text-white shadow-sm" : "bg-sand-100 text-ink/60"}`}
                    >
                      View Card
                    </button>
                    <button
                      onClick={() => {
                        playPopSound(600);
                        setActiveTab("qr");
                      }}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition-all ${activeTab === "qr" ? "bg-sage text-white shadow-sm" : "bg-sand-100 text-ink/60"}`}
                    >
                      Gate QR Pass
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Micro Helper Note */}
            <p className="text-[10px] text-center text-ink/40 font-medium">
              💡 Touch the button above to test the live RSVP flow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
