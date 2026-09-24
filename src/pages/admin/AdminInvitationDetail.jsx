import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { AdminAPI } from "../../api/api";
import Loader from "../../components/Loader";
import InteractiveCard3D from "../../components/InteractiveCard3D";
import { useToast } from "../../context/ToastContext";
export default function AdminInvitationDetail() {
  const { batchId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(null);
  const toast = useToast();
  const load = () => {
    if (!batchId) return;
    AdminAPI.getInvitationDetail(batchId)
      .then(setData)
      .catch((e) => setError(e.message));
  };
  useEffect(() => {
    load();
  }, [batchId]);
  const handleResend = async (inviteeId) => {
    if (!batchId) return;
    setResending(inviteeId || "all");
    try {
      const res = await AdminAPI.resendInvitations(batchId, inviteeId);
      toast.success(res.message);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setResending(null);
    }
  };
  if (error) return <p className="text-red-500 py-24 text-center">{error}</p>;
  if (!data) return <Loader label="Loading invitation details…" full />;
  const s = data.stats;
  return (
    <div>
      <Link
        to="/admin/invitations"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/60 hover:text-ink mb-6"
      >
        <ArrowLeft size={14} /> Back to All Invitations
      </Link>

      {/* Header Info */}
      <InteractiveCard3D className="p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <span className="font-mono text-xs font-bold text-ink/40 tracking-wider">
              {data.reference}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              {data.eventName}
            </h1>
            <p className="text-xs text-ink/50 mt-0.5">
              {data.templateName} · {data.bundleName}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sand-200">
            {data.status}
          </span>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 text-xs pt-4 border-t border-ink/8">
          <div className="bg-sand-100/90 rounded-xl p-3">
            <span className="text-[10px] text-ink/50 uppercase font-bold block mb-0.5">
              Host Phone
            </span>
            <p className="font-semibold">{data.ownerPhone}</p>
          </div>
          <div className="bg-sand-100/90 rounded-xl p-3">
            <span className="text-[10px] text-ink/50 uppercase font-bold block mb-0.5">
              Payer Phone
            </span>
            <p className="font-semibold">{data.payerPhone || "—"}</p>
          </div>
          <div className="bg-sand-100/90 rounded-xl p-3">
            <span className="text-[10px] text-ink/50 uppercase font-bold block mb-0.5">
              Total Revenue
            </span>
            <p className="font-bold text-marigold-700">
              {Number(data.totalAmount).toLocaleString()} {data.currency}
            </p>
          </div>
          <div className="bg-sand-100/90 rounded-xl p-3">
            <span className="text-[10px] text-ink/50 uppercase font-bold block mb-0.5">
              Scheduled For
            </span>
            <p className="font-semibold">
              {data.sendAt
                ? new Date(data.sendAt).toLocaleString()
                : "Immediate"}
            </p>
          </div>
        </div>
      </InteractiveCard3D>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        <StatWidget label="Guests" value={s.guests} />
        <StatWidget label="WhatsApp" value={s.whatsAppSent} />
        <StatWidget
          label="WA Delivered"
          value={s.whatsAppDelivered}
          tone="text-sage-700"
        />
        <StatWidget
          label="SMS Delivered"
          value={s.smsDelivered}
          tone="text-sage-700"
        />
        <StatWidget label="Failed" value={s.failed} tone="text-red-500" />
        <StatWidget
          label="Checked In"
          value={s.checkedIn}
          tone="text-marigold"
        />
      </div>

      {/* Guest Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-sand-100/90 text-ink/60 font-bold uppercase tracking-wider border-b border-ink/8">
              <tr>
                <th className="p-4">Guest</th>
                <th className="p-4">Phone</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">SMS</th>
                <th className="p-4">Checked In</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {data.guests.map((g) => (
                <tr key={g.id} className="hover:bg-white/50 transition-colors">
                  <td className="p-4 font-bold text-ink">{g.name}</td>
                  <td className="p-4 font-mono text-[11px] text-ink/60">
                    {g.phone}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-sage-100 text-sage-800">
                      {g.whatsAppStatus || "DELIVERED"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-sage-100 text-sage-800">
                      {g.smsStatus || "DELIVERED"}
                    </span>
                  </td>
                  <td className="p-4 text-ink/60">
                    {g.scannedAt
                      ? new Date(g.scannedAt).toLocaleTimeString()
                      : "—"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleResend(g.id)}
                      disabled={resending !== null}
                      className="clay-btn-secondary !py-1 !px-2.5 text-[11px] font-bold"
                    >
                      <RefreshCw
                        size={11}
                        className={resending === g.id ? "animate-spin" : ""}
                      />{" "}
                      Resend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function StatWidget({ label, value, tone = "text-ink" }) {
  return (
    <div className="glass-card p-3 text-center">
      <p className={`font-display font-bold text-lg leading-tight ${tone}`}>
        {value}
      </p>
      <p className="text-[10px] text-ink/50 uppercase font-semibold mt-0.5">
        {label}
      </p>
    </div>
  );
}
