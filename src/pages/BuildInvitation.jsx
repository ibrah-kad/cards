import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MessageSquareText,
  Send,
  QrCode,
  Trash2,
  Plus,
  Wand2,
  CalendarClock,
  Clock3,
  Eye,
  Upload,
  Table,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { CatalogAPI, InvitationAPI, toIsoInstant } from "../api/api";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { playPopSound, playClickSound } from "../utils/audio";
import { fireCelebrationConfetti } from "../utils/confetti";
export default function BuildInvitation() {
  const { eventId, templateId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [template, setTemplate] = useState(null);
  const [bundles, setBundles] = useState(null);
  const [paragraphs, setParagraphs] = useState([]);
  const [placeholders, setPlaceholders] = useState({
    custom: [],
    needsCard: true,
    hasThankYouSms: false,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ownerPhone, setOwnerPhone] = useState("");
  const [details, setDetails] = useState({
    coupleNames: "",
    eventDate: "",
    venue: "",
    host: "",
  });
  const [bundleId, setBundleId] = useState(null);
  const [paragraphTemplateId, setParagraphTemplateId] = useState("");
  const [rawText, setRawText] = useState("");
  const [guests, setGuests] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [sendLater, setSendLater] = useState(false);
  const [sendAtLocal, setSendAtLocal] = useState("");
  const [showBundleComparison, setShowBundleComparison] = useState(false);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  useEffect(() => {
    if (session?.phone && !ownerPhone) setOwnerPhone(session.phone);
  }, [session, ownerPhone]);
  useEffect(() => {
    if (!eventId) return;

    // Load templates
    CatalogAPI.listCardTemplates(eventId)
      .then((list) => {
        const t = list.find((x) => String(x.id) === templateId);
        setTemplate(t || list[0] || null);
      })
      .catch((e) => setError(e.message));

    // Load bundles
    CatalogAPI.listBundles()
      .then((b) => {
        setBundles(b);
        if (b.length > 0 && !bundleId) setBundleId(b[0].id);
      })
      .catch((e) => setError(e.message));

    // Load event placeholders
    CatalogAPI.getEventPlaceholders(eventId)
      .then(setPlaceholders)
      .catch(() =>
        setPlaceholders({
          custom: [],
          needsCard: true,
          hasThankYouSms: false,
        }),
      );

    // Load paragraphs
    CatalogAPI.listParagraphTemplates(eventId, templateId)
      .then(setParagraphs)
      .catch(() => setParagraphs([]));
  }, [eventId, templateId]);
  const STEP_LABELS = useMemo(() => {
    const steps = [];
    if (placeholders.needsCard) steps.push("Card Details");
    steps.push("Choose Bundle", "Guest List", "Schedule", "Review & Confirm");
    return steps;
  }, [placeholders.needsCard]);
  const selectedBundle = bundles?.find((b) => b.id === bundleId);
  const estimatedTotal = useMemo(() => {
    if (!selectedBundle) return 0;
    const minQty = selectedBundle.minimumQuantity || 15;
    const guestCount = guests.filter((g) => g.phone?.trim()).length;
    const paidQty = Math.max(minQty, guestCount);
    return (
      Number(selectedBundle.basePrice || 0) +
      Number(selectedBundle.pricePerInvitee || 0) * paidQty
    );
  }, [selectedBundle, guests]);
  const handleDetectGuests = async () => {
    if (!rawText.trim()) return;
    setParsing(true);
    try {
      const res = await CatalogAPI.parseInvitees(rawText);
      const mapped = res.invitees.map((i) => ({
        name: i.name,
        phone: i.phone,
        email: i.email || "",
        doubleInvitation: i.isDouble,
        note: i.note,
      }));
      setGuests((prev) => [...prev, ...mapped]);
      setRawText("");
      playPopSound(580);
      toast.success(`Detected ${res.detectedCount} guest(s)!`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setParsing(false);
    }
  };
  const handleCsvUpload = async (file) => {
    setCsvUploading(true);
    try {
      const result = await CatalogAPI.importCsvGuests(file);
      const mapped = result.guests.map((g) => ({
        name: g.name,
        phone: g.phone,
        email: g.email || "",
        doubleInvitation: g.doubleInvitation,
      }));
      setGuests((prev) => [...prev, ...mapped]);
      playPopSound(620);
      toast.success(`Imported ${result.count} guests from CSV!`);
    } catch (e) {
      toast.error("CSV import error: " + e.message);
    } finally {
      setCsvUploading(false);
    }
  };
  const addBlankGuest = () => {
    playClickSound();
    setGuests((g) => [
      ...g,
      {
        name: "",
        phone: "",
        email: "",
        doubleInvitation: false,
      },
    ]);
  };
  const updateGuest = (idx, patch) => {
    setGuests((g) =>
      g.map((row, i) =>
        i === idx
          ? {
              ...row,
              ...patch,
            }
          : row,
      ),
    );
  };
  const removeGuest = (idx) => {
    playPopSound(340);
    setGuests((g) => g.filter((_, i) => i !== idx));
  };
  const canProceed = () => {
    const current = STEP_LABELS[step];
    if (current === "Card Details") {
      return ownerPhone.trim().length >= 8 && !!details.coupleNames?.trim();
    }
    if (current === "Choose Bundle") return !!bundleId;
    if (current === "Guest List")
      return guests.filter((g) => g.phone?.trim()).length > 0;
    if (current === "Schedule")
      return (
        !sendLater ||
        (sendAtLocal && new Date(sendAtLocal).getTime() > Date.now())
      );
    return true;
  };
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ownerPhone,
        eventTypeId: Number(eventId),
        cardTemplateId: placeholders.needsCard ? Number(templateId) : null,
        bundleId,
        cardDetailsJson: JSON.stringify(details),
        sendAt: sendLater ? toIsoInstant(sendAtLocal) : null,
        paragraphTemplateId: paragraphTemplateId
          ? Number(paragraphTemplateId)
          : null,
        invitees: guests
          .filter((g) => g.phone?.trim())
          .map((g) => ({
            name: g.name || "Guest",
            phone: g.phone,
            email: g.email,
            doubleInvitation: !!g.doubleInvitation,
          })),
      };
      const batch = await InvitationAPI.createBatch(payload);
      fireCelebrationConfetti(0.5, 0.4);
      toast.success("Invitation created! Proceeding to checkout...");
      setTimeout(() => {
        navigate(`/checkout/${batch.id}`);
      }, 700);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };
  if (error) {
    return (
      <div className="max-w-xl mx-auto px-5 py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/events" className="clay-btn-secondary">
          Back to Occasions
        </Link>
      </div>
    );
  }
  if (!bundles)
    return <Loader label="Preparing your celebration canvas…" full />;
  const currentStepLabel = STEP_LABELS[step];
  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      {/* Back button */}
      <Link
        to={`/events/${eventId}`}
        onClick={() => playPopSound(420)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/60 hover:text-ink mb-6"
      >
        <ArrowLeft size={15} /> Change Occasion or Design
      </Link>

      {/* Animated Step Progress Bar */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 shrink-0">
            <motion.div
              whileHover={{
                scale: 1.1,
              }}
              onClick={() => {
                if (i < step) setStep(i);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${i < step ? "bg-sage text-white cursor-pointer shadow-sm" : i === step ? "bg-marigold text-white shadow-md ring-4 ring-marigold/20" : "bg-white text-ink/40 border border-ink/10"}`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </motion.div>
            <span
              className={`text-xs font-bold ${i === step ? "text-ink" : "text-ink/40"}`}
            >
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div className="w-6 sm:w-10 h-0.5 bg-ink/10 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Morphic Card Form */}
      <div className="glass-card p-6 sm:p-10">
        {/* ========================================================
            STEP 1: CARD DETAILS
            ======================================================== */}
        {currentStepLabel === "Card Details" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1">
                Tell us about the celebration
              </h2>
              <p className="text-xs sm:text-sm text-ink/60">
                Design:{" "}
                <strong className="text-marigold">
                  {template?.name || "Standard Layout"}
                </strong>
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-ink/75 mb-1.5 block uppercase tracking-wider">
                  Host Mobile Phone (for login &amp; alerts) *
                </label>
                <input
                  className="clay-input"
                  placeholder="0712 345 678"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink/75 mb-1.5 block uppercase tracking-wider">
                  Couple / Celebrant Names *
                </label>
                <input
                  className="clay-input"
                  placeholder="e.g. Baraka & Neema"
                  value={details.coupleNames || ""}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      coupleNames: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink/75 mb-1.5 block uppercase tracking-wider">
                  Event Date &amp; Time
                </label>
                <input
                  type="date"
                  className="clay-input"
                  value={details.eventDate || ""}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      eventDate: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink/75 mb-1.5 block uppercase tracking-wider">
                  Reception Venue
                </label>
                <input
                  className="clay-input"
                  placeholder="e.g. Msasani Beach Club, Dar es Salaam"
                  value={details.venue || ""}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      venue: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Live Preview Button */}
            <div className="mt-2 pt-4 border-t border-ink/8 flex items-center justify-between">
              <span className="text-xs text-ink/50">
                You can preview how these details look on your card at any time.
              </span>
              <button
                type="button"
                onClick={() => setShowCardPreview(true)}
                className="clay-btn-secondary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <Eye size={14} className="text-marigold" />
                <span>Live Card Preview</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: CHOOSE BUNDLE
            ======================================================== */}
        {currentStepLabel === "Choose Bundle" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1">
                  Choose a Delivery Bundle
                </h2>
                <p className="text-xs sm:text-sm text-ink/60">
                  Select how your invitations and reminders are dispatched.
                </p>
              </div>
              <button
                onClick={() => setShowBundleComparison(true)}
                className="clay-btn-secondary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <Table size={14} /> Compare All Features
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {bundles.map((b) => (
                <motion.div
                  key={b.id}
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={() => {
                    playPopSound(520);
                    setBundleId(b.id);
                  }}
                  className={`p-6 rounded-3xl cursor-pointer border-2 transition-all flex flex-col justify-between ${bundleId === b.id ? "border-marigold bg-marigold-50/70 shadow-[0_12px_28px_-6px_rgba(232,145,45,0.3)] ring-2 ring-marigold/20" : "border-white/80 bg-white/60 hover:bg-white hover:border-marigold/40"}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display font-bold text-lg text-ink">
                        {b.name}
                      </h3>
                      {bundleId === b.id && (
                        <span className="w-6 h-6 rounded-full bg-marigold text-white flex items-center justify-center text-xs">
                          <Check size={14} />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink/60 mb-4 leading-relaxed">
                      {b.description}
                    </p>
                    <div className="mb-4">
                      <span className="font-display font-bold text-2xl text-marigold-700">
                        {Number(b.pricePerInvitee).toLocaleString()}
                      </span>
                      <span className="text-xs text-ink/50 font-semibold ml-1">
                        {b.currency} / guest
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs font-semibold text-ink/75">
                      <li className="flex items-center gap-2">
                        <Send
                          size={13}
                          className={
                            b.includesWhatsapp ? "text-sage-700" : "text-ink/20"
                          }
                        />
                        <span>WhatsApp Personalized Card</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <MessageSquareText
                          size={13}
                          className={
                            b.includesSms ? "text-sage-700" : "text-ink/20"
                          }
                        />
                        <span>SMS Notification &amp; Reminder</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <QrCode
                          size={13}
                          className={
                            b.includesQrScan ? "text-sage-700" : "text-ink/20"
                          }
                        />
                        <span>Live Gate QR Code Scanner</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: GUEST LIST
            ======================================================== */}
        {currentStepLabel === "Guest List" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1">
                  Who's Invited? ({guests.length})
                </h2>
                <p className="text-xs sm:text-sm text-ink/60">
                  Quick paste from WhatsApp or drag &amp; drop a CSV
                  spreadsheet.
                </p>
              </div>

              <label className="clay-btn-secondary !py-2 !px-4 text-xs font-bold cursor-pointer flex items-center gap-2 shrink-0">
                <Upload size={14} />
                <span>{csvUploading ? "Importing..." : "Upload CSV"}</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleCsvUpload(e.target.files[0])
                  }
                />
              </label>
            </div>

            {/* Smart Paste Box */}
            <div className="bg-sand-100/80 rounded-2xl p-4 border border-white/80 mb-6 shadow-inner">
              <label className="text-xs font-bold text-ink/70 block mb-1.5 uppercase tracking-wider">
                Paste names &amp; numbers (e.g. from WhatsApp group)
              </label>
              <textarea
                className="clay-input font-mono text-xs min-h-24 resize-y mb-2.5"
                placeholder="Amina Juma 0755123456 amina@example.com (couple)&#10;Dr. Kelvin Mwamba 0712987654"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              <button
                type="button"
                onClick={handleDetectGuests}
                disabled={parsing || !rawText.trim()}
                className="clay-btn-secondary !py-2 !px-4 text-xs font-bold flex items-center gap-2"
              >
                <Wand2 size={14} className="text-marigold" />
                <span>{parsing ? "Parsing..." : "Auto-Detect Guests"}</span>
              </button>
            </div>

            {/* Live Guest List Grid */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-ink/60 uppercase tracking-wider">
                  Guest Name &amp; Phone
                </span>
                <button
                  type="button"
                  onClick={addBlankGuest}
                  className="text-xs font-bold text-marigold-700 hover:text-marigold flex items-center gap-1"
                >
                  <Plus size={14} /> Add Guest
                </button>
              </div>

              {guests.length === 0 && (
                <div className="text-center py-8 px-4 bg-sand-50/50 rounded-2xl border border-dashed border-ink/15">
                  <p className="text-xs text-ink/50 mb-2">
                    No guests added yet.
                  </p>
                  <button
                    type="button"
                    onClick={addBlankGuest}
                    className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus size={13} /> Add First Guest
                  </button>
                </div>
              )}

              {guests.map((g, i) => (
                <div
                  key={i}
                  className="p-3 bg-white/80 rounded-2xl border border-ink/5 shadow-sm flex flex-wrap items-center gap-3"
                >
                  <input
                    className="clay-input !py-1.5 flex-1 min-w-[130px] text-xs font-semibold"
                    placeholder="Guest Name"
                    value={g.name}
                    onChange={(e) =>
                      updateGuest(i, {
                        name: e.target.value,
                      })
                    }
                  />
                  <input
                    className="clay-input !py-1.5 flex-1 min-w-[130px] text-xs font-mono"
                    placeholder="Phone (07...)"
                    value={g.phone}
                    onChange={(e) =>
                      updateGuest(i, {
                        phone: e.target.value,
                      })
                    }
                  />
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-ink/70 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!g.doubleInvitation}
                      onChange={(e) =>
                        updateGuest(i, {
                          doubleInvitation: e.target.checked,
                        })
                      }
                      className="accent-marigold w-4 h-4 rounded"
                    />
                    <span>Admits 2</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeGuest(i)}
                    className="text-ink/30 hover:text-red-500 p-1 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: SCHEDULE
            ======================================================== */}
        {currentStepLabel === "Schedule" && (
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1">
              When should we send cards?
            </h2>
            <p className="text-xs sm:text-sm text-ink/60 mb-6">
              Choose between immediate delivery after payment or automatic
              scheduling.
            </p>

            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              <motion.div
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => {
                  playPopSound(500);
                  setSendLater(false);
                }}
                className={`p-6 rounded-3xl cursor-pointer border-2 transition-all flex items-start gap-4 ${!sendLater ? "border-marigold bg-marigold-50/70 shadow-md ring-2 ring-marigold/20" : "border-white/80 bg-white/60 hover:bg-white"}`}
              >
                <div className="w-10 h-10 rounded-2xl bg-marigold-100 flex items-center justify-center text-marigold-700 shrink-0">
                  <Send size={19} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-ink mb-1">
                    Send Immediately
                  </h3>
                  <p className="text-xs text-ink/60 leading-relaxed">
                    Cards go out to WhatsApp and SMS right after payment is
                    approved.
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => {
                  playPopSound(540);
                  setSendLater(true);
                  if (!sendAtLocal) {
                    const d = new Date(Date.now() + 86400000);
                    setSendAtLocal(d.toISOString().slice(0, 16));
                  }
                }}
                className={`p-6 rounded-3xl cursor-pointer border-2 transition-all flex items-start gap-4 ${sendLater ? "border-marigold bg-marigold-50/70 shadow-md ring-2 ring-marigold/20" : "border-white/80 bg-white/60 hover:bg-white"}`}
              >
                <div className="w-10 h-10 rounded-2xl bg-sage-100 flex items-center justify-center text-sage-700 shrink-0">
                  <CalendarClock size={19} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-ink mb-1">
                    Schedule For Later
                  </h3>
                  <p className="text-xs text-ink/60 leading-relaxed">
                    Set a future date and time. Our system dispatches
                    automatically.
                  </p>
                </div>
              </motion.div>
            </div>

            {sendLater && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                className="bg-sand-100/90 rounded-2xl p-5 border border-white"
              >
                <label className="text-xs font-bold text-ink/75 block mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock3 size={14} className="text-marigold" />
                  <span>Choose Send Date &amp; Time</span>
                </label>
                <input
                  type="datetime-local"
                  className="clay-input"
                  value={sendAtLocal}
                  onChange={(e) => setSendAtLocal(e.target.value)}
                  required
                />
              </motion.div>
            )}
          </div>
        )}

        {/* ========================================================
            STEP 5: REVIEW & CONFIRM
            ======================================================== */}
        {currentStepLabel === "Review & Confirm" && selectedBundle && (
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1">
              Review your celebration
            </h2>
            <p className="text-xs sm:text-sm text-ink/60 mb-6">
              Confirm details before moving to secure Mobile Money payment.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm">
                <ReviewRow label="Occasion" value={details.coupleNames} />
                <ReviewRow label="Host Phone" value={ownerPhone} />
                <ReviewRow label="Bundle" value={selectedBundle.name} />
                <ReviewRow
                  label="Guests Count"
                  value={`${guests.filter((g) => g.phone).length} guests`}
                />
                <ReviewRow
                  label="Dispatch Time"
                  value={
                    sendLater
                      ? new Date(sendAtLocal).toLocaleString()
                      : "Immediate after payment"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowCardPreview(true)}
                  className="clay-btn-secondary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 mt-2"
                >
                  <Eye size={14} className="text-marigold" /> Live Card Preview
                </button>
              </div>

              {/* Total Card */}
              <div className="bg-sand-100/90 rounded-3xl p-6 border border-white flex flex-col justify-between shadow-inner">
                <div>
                  <span className="label-eyebrow text-[10px] block mb-1">
                    Estimated Total
                  </span>
                  <p className="font-display font-bold text-3xl sm:text-4xl text-marigold-700">
                    {estimatedTotal.toLocaleString()}{" "}
                    <span className="text-sm font-medium text-ink/50">
                      {selectedBundle.currency}
                    </span>
                  </p>
                  <p className="text-xs text-ink/55 mt-1">
                    Includes {guests.filter((g) => g.phone).length} cards, SMS
                    reminders &amp; live QR gate check-in.
                  </p>
                </div>

                <div className="pt-4 border-t border-ink/10 text-[11px] text-ink/50">
                  Instant mobile money push to M-Pesa / Tigo Pesa / Airtel Money
                  / Halopesa.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footers */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-ink/8">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setStep((s) => Math.max(0, s - 1));
            }}
            disabled={step === 0}
            className="clay-btn-secondary !py-2 !px-5 text-xs font-bold disabled:opacity-0"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {step < STEP_LABELS.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                playPopSound(500);
                setStep((s) => s + 1);
              }}
              disabled={!canProceed()}
              className="clay-btn-primary !py-2.5 !px-6 text-xs font-bold flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="clay-btn-primary !py-3 !px-7 text-xs font-bold flex items-center gap-2"
            >
              <Sparkles size={16} />
              <span>{submitting ? "Initiating..." : "Proceed to Payment"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          CARD PREVIEW MODAL
          ======================================================== */}
      {showCardPreview && (
        <Modal
          title="Interactive Card Preview"
          onClose={() => setShowCardPreview(false)}
        >
          <div className="space-y-4 text-center">
            <p className="text-xs text-ink/60">
              This is how your card will be rendered for each guest on WhatsApp:
            </p>
            <div className="max-w-xs mx-auto aspect-[3/4] bg-gradient-to-br from-sand-100 to-blush/20 rounded-3xl p-6 border-2 border-white/80 shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <span className="label-eyebrow text-[9px] block mb-1">
                  Official Invitation
                </span>
                <p className="font-display font-bold text-2xl text-marigold-700 leading-tight">
                  {details.coupleNames || "Baraka & Neema"}
                </p>
                <p className="text-xs text-ink/70 font-semibold mt-1">
                  {details.eventDate
                    ? new Date(details.eventDate).toLocaleDateString()
                    : "Saturday, 28th October"}
                </p>
                <p className="text-[11px] text-ink/60 mt-0.5">
                  {details.venue || "Msasani Beach Club"}
                </p>
              </div>

              <div className="w-24 h-24 mx-auto bg-white p-2 rounded-2xl shadow-inner border border-ink/10 flex flex-col items-center justify-center">
                <QrCode size={64} className="text-ink" />
              </div>

              <div className="relative z-10 text-[10px] font-bold text-ink/70 bg-sand-200/80 py-1.5 px-3 rounded-full">
                Admits Two · Gate Entry Pass
              </div>
            </div>

            <button
              onClick={() => setShowCardPreview(false)}
              className="clay-btn-primary !w-full !py-2.5 text-xs font-bold mt-2"
            >
              Looks Great!
            </button>
          </div>
        </Modal>
      )}

      {/* ========================================================
          BUNDLE COMPARISON MODAL
          ======================================================== */}
      {showBundleComparison && (
        <Modal
          title="Compare All Bundles"
          onClose={() => setShowBundleComparison(false)}
          wide={true}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-ink/10">
                  <th className="py-3 font-bold text-ink/70">Feature</th>
                  {bundles.map((b) => (
                    <th key={b.id} className="py-3 px-3 text-center">
                      <p className="font-bold text-ink text-sm">{b.name}</p>
                      <p className="text-marigold-700 font-bold">
                        {Number(b.pricePerInvitee).toLocaleString()} TZS
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <tr>
                  <td className="py-3 text-ink/70 font-semibold">
                    WhatsApp Digital Card
                  </td>
                  {bundles.map((b) => (
                    <td key={b.id} className="py-3 text-center">
                      {b.includesWhatsapp ? (
                        <Check size={16} className="text-sage mx-auto" />
                      ) : (
                        "—"
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 text-ink/70 font-semibold">
                    SMS Reminder Blast
                  </td>
                  {bundles.map((b) => (
                    <td key={b.id} className="py-3 text-center">
                      {b.includesSms ? (
                        <Check size={16} className="text-sage mx-auto" />
                      ) : (
                        "—"
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 text-ink/70 font-semibold">
                    Live QR Gate Check-in
                  </td>
                  {bundles.map((b) => (
                    <td key={b.id} className="py-3 text-center">
                      {b.includesQrScan ? (
                        <Check size={16} className="text-sage mx-auto" />
                      ) : (
                        "—"
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-ink/6 text-xs sm:text-sm">
      <span className="text-ink/55 font-medium">{label}</span>
      <span className="font-bold text-ink text-right">{value || "—"}</span>
    </div>
  );
}
