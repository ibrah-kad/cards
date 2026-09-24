import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminAPI } from "../../api/api";
import Loader from "../../components/Loader";
const FILTERS = ["ALL", "DRAFT", "PAID", "SCHEDULED", "SENT", "CANCELLED"];
const STATUS_STYLES = {
  DRAFT: "bg-ink/10 text-ink/60",
  PAID: "bg-sage/20 text-sage-700",
  SCHEDULED: "bg-marigold/20 text-marigold-700",
  SENT: "bg-marigold/20 text-marigold-700",
  FAILED: "bg-red-100 text-red-600",
  CANCELLED: "bg-ink/10 text-ink/40",
};
export default function AdminAllInvitations() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");
  useEffect(() => {
    AdminAPI.listAllInvitations()
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);
  const sorted = useMemo(
    () =>
      (items || [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [items],
  );
  const filtered =
    filter === "ALL" ? sorted : sorted.filter((i) => i.status === filter);
  return (
    <div>
      <span className="label-eyebrow text-xs mb-1 block">Live Operations</span>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-6">
        All Invitations
      </h1>

      {error && <p className="text-red-500 mb-6">{error}</p>}
      {!items && !error && <Loader label="Loading all invitations…" full />}

      {items && (
        <>
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === f ? "bg-marigold text-white shadow-md" : "bg-white/80 text-ink/65 hover:bg-white"}`}
              >
                {f}
                {f !== "ALL" && (
                  <span className="ml-1 opacity-70">
                    ({sorted.filter((i) => i.status === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-sand-100/90 text-ink/60 font-bold uppercase tracking-wider border-b border-ink/8">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Client Phone</th>
                    <th className="p-4">Occasion</th>
                    <th className="p-4">Guests</th>
                    <th className="p-4">Cards Sent</th>
                    <th className="p-4">Checked In</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Send Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-white/50 transition-colors"
                    >
                      <td className="p-4">
                        <Link
                          to={`/admin/invitations/${inv.id}`}
                          className="font-mono font-bold text-marigold-700 hover:underline"
                        >
                          {inv.reference}
                        </Link>
                      </td>
                      <td className="p-4 font-semibold">{inv.ownerPhone}</td>
                      <td className="p-4 text-ink/75 font-medium">
                        {inv.eventName}
                      </td>
                      <td className="p-4 font-bold">{inv.guests}</td>
                      <td className="p-4 text-sage-700 font-bold">
                        {inv.sent}
                      </td>
                      <td className="p-4 text-marigold font-bold">
                        {inv.checkedIn}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${STATUS_STYLES[inv.status] || "bg-ink/10"}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-ink/60">
                        {inv.sendAt
                          ? new Date(inv.sendAt).toLocaleString()
                          : "Immediate"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
