import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BellRing,
  CalendarClock,
  Plus,
  Pencil,
  Clock3,
  Send,
  MessageSquareText,
  Ban,
} from "lucide-react";
import { DashboardAPI, toIsoInstant } from "../api/api";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { playPopSound, playClickSound } from "../utils/audio";
const STATUS_STYLES = {
  DRAFT: "bg-ink/10 text-ink/60",
  SCHEDULED: "bg-marigold/20 text-marigold-700",
  PAID: "bg-sage/20 text-sage-700",
  SENT: "bg-sage/20 text-sage-700",
  FAILED: "bg-red-100 text-red-600",
  CANCELLED: "bg-ink/10 text-ink/40",
};
export default function Reminders() {
  const [events, setEvents] = useState(null);
  const [smsReminders, setSmsReminders] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [newSendAt, setNewSendAt] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const load = () => {
    Promise.all([DashboardAPI.myEvents(), DashboardAPI.myReminders()])
      .then(([ev, rem]) => {
        setEvents(ev);
        setSmsReminders(rem);
      })
      .catch((e) => setError(e.message));
  };
  useEffect(load, []);
  const scheduledInvitations = useMemo(
    () => (events || []).filter((e) => e.sendAt),
    [events],
  );
  const upcoming = useMemo(() => {
    const now = Date.now();
    const invites = scheduledInvitations
      .filter(
        (e) =>
          e.status === "DRAFT" ||
          (e.sendAt &&
            new Date(e.sendAt).getTime() > now &&
            e.status !== "SENT" &&
            e.status !== "CANCELLED"),
      )
      .map((e) => ({
        kind: "invitation",
        item: e,
      }));
    const sms = (smsReminders || [])
      .filter(
        (r) =>
          r.status === "DRAFT" ||
          (r.sendAt &&
            new Date(r.sendAt).getTime() > now &&
            r.status === "SCHEDULED"),
      )
      .map((r) => ({
        kind: "sms",
        item: r,
      }));
    return [...invites, ...sms].sort(
      (a, b) =>
        new Date(a.item.sendAt || 0).getTime() -
        new Date(b.item.sendAt || 0).getTime(),
    );
  }, [scheduledInvitations, smsReminders]);
  const past = useMemo(() => {
    const upcomingIds = new Set(upcoming.map((r) => `${r.kind}-${r.item.id}`));
    const invites = scheduledInvitations
      .filter((e) => !upcomingIds.has(`invitation-${e.id}`))
      .map((e) => ({
        kind: "invitation",
        item: e,
      }));
    const sms = (smsReminders || [])
      .filter((r) => !upcomingIds.has(`sms-${r.id}`))
      .map((r) => ({
        kind: "sms",
        item: r,
      }));
    return [...invites, ...sms].sort(
      (a, b) =>
        new Date(b.item.sendAt || b.item.createdAt || 0).getTime() -
        new Date(a.item.sendAt || a.item.createdAt || 0).getTime(),
    );
  }, [scheduledInvitations, smsReminders, upcoming]);
  const openEdit = (row) => {
    playClickSound();
    setEditing(row);
    setNewSendAt(
      row.item.sendAt
        ? new Date(row.item.sendAt).toISOString().slice(0, 16)
        : "",
    );
    setNewMessage("message" in row.item ? row.item.message || "" : "");
  };
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    const iso = toIsoInstant(newSendAt);
    if (!iso) {
      toast.error("Please pick a valid send date and time.");
      return;
    }
    setSaving(true);
    try {
      if (editing.kind === "invitation") {
        await DashboardAPI.rescheduleBatch(editing.item.id, iso);
      } else {
        await DashboardAPI.updateSmsReminder(editing.item.id, {
          message: newMessage,
          sendAt: iso,
        });
      }
      playPopSound(540);
      toast.success("Schedule updated successfully!");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = async (row) => {
    const title = "eventName" in row.item ? row.item.eventName : row.item.title;
    if (!confirm(`Cancel "${title}"? It will not be dispatched.`)) return;
    try {
      if (row.kind === "invitation") {
        await DashboardAPI.cancelBatchSchedule(row.item.id);
      } else {
        await DashboardAPI.cancelReminder(row.item.id);
      }
      toast.success("Schedule deactivated.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  if (error) return <p className="text-center text-red-500 py-24">{error}</p>;
  if (!events || !smsReminders)
    return <Loader label="Loading your reminder schedules…" full />;
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="label-eyebrow text-[10px] block mb-1">
            Automated Dispatch
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
            Reminders &amp; Schedules
          </h1>
          <p className="text-xs sm:text-sm text-ink/60 mt-1">
            Track queued WhatsApp cards and SMS reminder notifications.
          </p>
        </div>

        <Link to="/events" onClick={() => playPopSound(520)}>
          <button className="clay-btn-primary !py-2.5 !px-5 text-xs font-bold flex items-center gap-2">
            <Plus size={15} />
            <span>New Schedule</span>
          </button>
        </Link>
      </div>

      {/* Upcoming Section */}
      <section className="mb-12">
        <h2 className="font-display text-lg sm:text-xl font-bold text-ink mb-4 flex items-center gap-2">
          <CalendarClock size={18} className="text-marigold" />
          <span>Upcoming Queued Sends</span>
        </h2>

        {upcoming.length === 0 ? (
          <div className="glass-card p-10 text-center max-w-lg mx-auto">
            <BellRing className="mx-auto mb-3 text-ink/25" size={32} />
            <p className="font-display font-bold text-base text-ink mb-1">
              No upcoming reminders
            </p>
            <p className="text-xs text-ink/55 mb-5">
              When you schedule an invitation or SMS blast for a future date, it
              appears here.
            </p>
            <Link to="/events">
              <button className="clay-btn-secondary text-xs font-bold">
                Schedule an Invitation
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((row) => (
              <ReminderRow
                key={`${row.kind}-${row.item.id}`}
                row={row}
                onEdit={() => openEdit(row)}
                onCancel={() => handleCancel(row)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past History */}
      <section>
        <h2 className="font-display text-lg sm:text-xl font-bold text-ink mb-4 flex items-center gap-2">
          <Clock3 size={18} className="text-ink/40" />
          <span>Completed Sends</span>
        </h2>

        {past.length === 0 ? (
          <p className="text-xs text-ink/40 italic py-6 text-center border border-dashed border-ink/15 rounded-2xl">
            No completed history yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {past.map((row) => (
              <ReminderRow
                key={`${row.kind}-${row.item.id}`}
                row={row}
                readOnly
              />
            ))}
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {editing && (
        <Modal title="Reschedule Send Time" onClose={() => setEditing(null)}>
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
            <p className="text-xs text-ink/65">
              {"eventName" in editing.item
                ? editing.item.eventName
                : editing.item.title}
            </p>

            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                New Send Date &amp; Time
              </label>
              <input
                type="datetime-local"
                className="clay-input"
                value={newSendAt}
                onChange={(e) => setNewSendAt(e.target.value)}
                required
              />
            </div>

            {editing.kind === "sms" && (
              <div>
                <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                  SMS Message Body
                </label>
                <textarea
                  className="clay-input min-h-24 font-mono text-xs"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="clay-btn-primary justify-center text-xs font-bold mt-2"
            >
              {saving ? "Updating..." : "Save New Schedule"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
function ReminderRow({ row, onEdit, onCancel, readOnly }) {
  const { kind, item } = row;
  const isInvitation = kind === "invitation";
  const title = "eventName" in item ? item.eventName : item.title;
  const subtitle =
    "reference" in item
      ? `#${item.reference} · WhatsApp Card`
      : "SMS Blast Notification";
  const status = item.status || "DRAFT";
  return (
    <div className="glass-card p-4 sm:p-5 flex flex-wrap items-center gap-4 hover:shadow-lg transition-shadow">
      <div className="w-10 h-10 rounded-2xl bg-sand-100 flex items-center justify-center shrink-0 text-marigold-700">
        {isInvitation ? <Send size={17} /> : <MessageSquareText size={17} />}
      </div>

      <div className="flex-1 min-w-[160px]">
        <p className="font-display font-bold text-sm text-ink">{title}</p>
        <p className="text-[11px] text-ink/50">{subtitle}</p>
      </div>

      <div className="text-xs text-ink/65 flex items-center gap-1.5 font-medium">
        <Clock3 size={13} className="text-marigold" />
        <span>
          {item.sendAt ? new Date(item.sendAt).toLocaleString() : "Immediate"}
        </span>
      </div>

      <span
        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[status] || "bg-ink/10"}`}
      >
        {status}
      </span>

      {!readOnly && (
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold"
            >
              <Pencil size={12} /> Edit
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold text-red-500 hover:text-red-700"
            >
              <Ban size={12} /> Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
