import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Eye,
  RefreshCw,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import { DashboardAPI, InvitationAPI } from "../api/api";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { playPopSound, playClickSound } from "../utils/audio";
const CHANNEL_STATUS_STYLE = {
  PENDING: "bg-ink/10 text-ink/60",
  SENT: "bg-marigold/20 text-marigold-700",
  DELIVERED: "bg-sage/20 text-sage-700",
  FAILED: "bg-red-100 text-red-700",
  NOT_INCLUDED: "bg-ink/5 text-ink/30",
};
export default function EventGuests() {
  const { batchId } = useParams();
  const toast = useToast();
  const [guests, setGuests] = useState(null);
  const [batch, setBatch] = useState(null);
  const [error, setError] = useState("");
  const [viewingGuest, setViewingGuest] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  useEffect(() => {
    if (!batchId) return;
    DashboardAPI.myGuests(batchId)
      .then(setGuests)
      .catch((e) => setError(e.message));
    InvitationAPI.getBatch(batchId)
      .then(setBatch)
      .catch(() => {});
  }, [batchId]);
  const handleDownload = async (guest) => {
    playClickSound();
    if (!guest.cardImageUrl) {
      toast.error("No card image rendered yet.");
      return;
    }
    try {
      const res = await fetch(guest.cardImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invitation-${guest.name.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Card downloaded successfully!");
    } catch {
      window.open(guest.cardImageUrl, "_blank");
    }
  };
  const handleResend = async (guest) => {
    if (!batchId || !guest.id) return;
    setResendingId(guest.id);
    try {
      await DashboardAPI.resendInvitee(batchId, guest.id);
      playPopSound(540);
      toast.success(`Resent invitation to ${guest.name}!`);
      const updated = await DashboardAPI.myGuests(batchId);
      setGuests(updated);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setResendingId(null);
    }
  };
  if (error) {
    return (
      <div className="max-w-xl mx-auto px-5 py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/dashboard" className="clay-btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    );
  }
  if (!guests || !batch)
    return <Loader label="Loading guest delivery report…" full />;
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
      {/* Header */}
      <Link
        to="/dashboard"
        onClick={() => playPopSound(420)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/60 hover:text-ink mb-6"
      >
        <ArrowLeft size={15} /> Back to My Events
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="label-eyebrow text-[10px] block mb-1">
            Reference #{batch.reference}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
            {batch.eventName}
          </h1>
          <p className="text-xs sm:text-sm text-ink/60 mt-1">
            {guests.length} invited guest{guests.length === 1 ? "" : "s"} · Live
            WhatsApp &amp; SMS delivery tracking
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="bg-sand-100/90 rounded-2xl px-4 py-2 border border-white text-center">
            <p className="font-bold text-base text-marigold-700">
              {guests.filter((g) => g.whatsAppStatus === "DELIVERED").length}
            </p>
            <p className="text-[10px] text-ink/50 uppercase font-semibold">
              Delivered
            </p>
          </div>
          <div className="bg-sand-100/90 rounded-2xl px-4 py-2 border border-white text-center">
            <p className="font-bold text-base text-sage-700">
              {guests.filter((g) => g.scannedAt).length}
            </p>
            <p className="text-[10px] text-ink/50 uppercase font-semibold">
              Checked In
            </p>
          </div>
        </div>
      </div>

      {/* Guest Table Card */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[650px]">
            <thead className="bg-sand-100/90 text-ink/60 font-bold uppercase tracking-wider border-b border-ink/8">
              <tr>
                <th className="p-4">Guest</th>
                <th className="p-4">WhatsApp Status</th>
                <th className="p-4">SMS Status</th>
                <th className="p-4">Door Check-In</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {guests.map((g, i) => {
                const isFailed =
                  g.whatsAppStatus === "FAILED" || g.smsStatus === "FAILED";
                return (
                  <tr
                    key={g.id || i}
                    className="hover:bg-white/50 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-bold text-ink text-sm">{g.name}</p>
                      <p className="text-[11px] text-ink/50 font-mono">
                        {g.phone}
                      </p>
                      {g.doubleInvitation && (
                        <span className="inline-block mt-0.5 text-[9px] font-bold bg-marigold-100 text-marigold-800 px-1.5 py-0.5 rounded">
                          Admits 2
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${CHANNEL_STATUS_STYLE[g.whatsAppStatus || "PENDING"]}`}
                      >
                        {g.whatsAppStatus || "PENDING"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${CHANNEL_STATUS_STYLE[g.smsStatus || "PENDING"]}`}
                      >
                        {g.smsStatus || "PENDING"}
                      </span>
                    </td>

                    <td className="p-4">
                      {g.scannedAt ? (
                        <span className="inline-flex items-center gap-1 text-sage-700 font-bold">
                          <CheckCircle2 size={13} /> In (
                          {new Date(g.scannedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          )
                        </span>
                      ) : (
                        <span className="text-ink/40 font-medium">
                          Waiting at door
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isFailed && (
                          <button
                            onClick={() => handleResend(g)}
                            disabled={resendingId === g.id}
                            className="clay-btn-secondary !py-1 !px-2.5 text-xs text-red-600 hover:bg-red-50"
                            title="Resend invitation"
                          >
                            <RefreshCw
                              size={12}
                              className={
                                resendingId === g.id ? "animate-spin" : ""
                              }
                            />
                            <span>Resend</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            playPopSound(500);
                            setViewingGuest(g);
                          }}
                          className="clay-btn-secondary !py-1 !px-2.5 text-xs font-bold"
                          title="View invitation card"
                        >
                          <Eye size={12} /> View
                        </button>

                        <button
                          onClick={() => handleDownload(g)}
                          className="clay-btn-secondary !py-1 !px-2.5 text-xs font-bold"
                          title="Download high-res card"
                        >
                          <Download size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Card Modal */}
      {viewingGuest && (
        <Modal
          title={`Invitation for ${viewingGuest.name}`}
          onClose={() => setViewingGuest(null)}
        >
          <div className="space-y-4 text-center">
            <div className="max-w-xs mx-auto aspect-[3/4] bg-gradient-to-br from-sand-100 to-blush/20 rounded-3xl p-6 border border-white shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <span className="label-eyebrow text-[9px] block mb-1">
                  Pass #{viewingGuest.customData?.checkInCode || "JP-PASS"}
                </span>
                <p className="font-display font-bold text-2xl text-marigold-700 leading-tight">
                  {batch.eventName}
                </p>
                <p className="text-xs text-ink/70 font-semibold mt-2">
                  Invited:{" "}
                  <strong className="text-ink">{viewingGuest.name}</strong>
                </p>
              </div>

              <div className="w-24 h-24 mx-auto bg-white p-2 rounded-2xl shadow-inner border border-ink/10 flex flex-col items-center justify-center">
                <QrCode size={64} className="text-ink" />
              </div>

              <div className="relative z-10 text-[10px] font-bold text-ink/70 bg-sand-200/80 py-1.5 px-3 rounded-full">
                {viewingGuest.doubleInvitation
                  ? "Admits Two (VIP)"
                  : "Single Entry Pass"}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(viewingGuest)}
                className="clay-btn-primary flex-1 !py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download size={14} /> Download Card
              </button>
              <button
                onClick={() => setViewingGuest(null)}
                className="clay-btn-secondary flex-1 !py-2.5 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
