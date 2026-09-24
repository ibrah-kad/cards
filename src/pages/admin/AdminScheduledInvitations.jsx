import { useEffect, useState } from "react";
import { AdminAPI } from "../../api/api";
import Loader from "../../components/Loader";
import { CalendarClock } from "lucide-react";
const STATUS_STYLES = {
  DRAFT: "bg-ink/10 text-ink/60",
  SCHEDULED: "bg-marigold/20 text-marigold-700",
  PAID: "bg-sage/20 text-sage-700",
};
export default function AdminScheduledInvitations() {
  const [groupedData, setGroupedData] = useState({});
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    AdminAPI.listScheduledInvitations()
      .then((data) => {
        setGroupedData(data || {});
        const events = Object.keys(data || {});
        if (events.length > 0) setSelectedEvent(events[0]);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);
  const events = Object.keys(groupedData);
  const invitations = selectedEvent ? groupedData[selectedEvent] || [] : [];
  if (loading) return <Loader label="Loading scheduled queue..." full />;
  return (
    <div>
      <span className="label-eyebrow text-xs mb-1 block">Queue Management</span>
      <h1 className="font-display text-3xl font-bold text-ink mb-6">
        Scheduled Dispatch Queue
      </h1>

      {events.length === 0 ? (
        <div className="glass-card p-10 text-center max-w-lg mx-auto">
          <CalendarClock size={36} className="mx-auto mb-3 text-ink/30" />
          <h3 className="font-display font-bold text-lg text-ink mb-1">
            Queue is empty
          </h3>
          <p className="text-xs text-ink/50">
            No invitations are currently waiting in the dispatch pipeline.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {events.map((ev) => (
              <button
                key={ev}
                onClick={() => setSelectedEvent(ev)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedEvent === ev ? "bg-marigold text-white shadow-md" : "bg-sand-100 text-ink/70 hover:bg-sand-200"}`}
              >
                {ev} ({groupedData[ev].length})
              </button>
            ))}
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-sand-100/90 text-ink/60 font-bold uppercase tracking-wider border-b border-ink/8">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Host Phone</th>
                  <th className="p-4">Design</th>
                  <th className="p-4">Guests</th>
                  <th className="p-4">Send Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {invitations.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-white/50 transition-colors"
                  >
                    <td className="p-4 font-mono font-bold text-marigold-700">
                      {inv.reference}
                    </td>
                    <td className="p-4 font-semibold text-ink">
                      {inv.ownerPhone}
                    </td>
                    <td className="p-4 text-ink/70">
                      {inv.cardTemplateName || "Standard"}
                    </td>
                    <td className="p-4 font-bold">{inv.guests?.length || 0}</td>
                    <td className="p-4 text-ink/80">
                      {inv.sendAt ? new Date(inv.sendAt).toLocaleString() : "—"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${STATUS_STYLES[inv.status] || "bg-ink/10"}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
