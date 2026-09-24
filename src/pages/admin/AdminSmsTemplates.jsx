import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { AdminAPI } from "../../api/api";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import InteractiveCard3D from "../../components/InteractiveCard3D";
import { useToast } from "../../context/ToastContext";
import { playPopSound } from "../../utils/audio";
const PLACEHOLDERS = [
  "{name}",
  "{event}",
  "{host}",
  "{date}",
  "{venue}",
  "{rsvp}",
  "{checkInCode}",
];
export default function AdminSmsTemplates() {
  const [items, setItems] = useState(null);
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    body: "",
    eventTypeId: "",
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const load = () => {
    AdminAPI.listSmsTemplates()
      .then(setItems)
      .catch((e) => toast.error(e.message));
    AdminAPI.listEvents()
      .then(setEvents)
      .catch(() => {});
  };
  useEffect(load, []);
  const openNew = () => {
    setForm({
      name: "",
      body: "",
      eventTypeId: "",
    });
    setEditing({});
  };
  const openEdit = (t) => {
    setForm({
      name: t.name,
      body: t.body,
      eventTypeId: t.eventTypeId ? String(t.eventTypeId) : "",
    });
    setEditing(t);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.body)
      return toast.error("Name and body are required");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        body: form.body,
        eventTypeId: form.eventTypeId ? Number(form.eventTypeId) : null,
      };
      if (editing?.id) await AdminAPI.updateSmsTemplate(editing.id, payload);
      else await AdminAPI.createSmsTemplate(payload);
      playPopSound(540);
      toast.success("SMS template saved successfully!");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  if (!items) return <Loader label="Loading SMS templates…" />;
  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <span className="label-eyebrow text-xs mb-1 block">
            Dispatch Messages
          </span>
          <h1 className="font-display text-3xl font-bold text-ink">
            SMS Templates
          </h1>
        </div>
        <button
          onClick={openNew}
          className="clay-btn-primary text-xs font-bold flex items-center gap-2"
        >
          <Plus size={16} /> New Template
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {items.map((t) => (
          <InteractiveCard3D
            key={t.id}
            tiltIntensity={6}
            className="p-5 flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-display font-bold text-base text-ink">
                  {t.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sand-200 text-ink/70">
                  {events.find((e) => e.id === t.eventTypeId)?.name || "Global"}
                </span>
              </div>
              <p className="text-xs text-ink/75 leading-relaxed font-mono bg-sand-100/70 p-3 rounded-xl border border-white/60 mb-4">
                {t.body}
              </p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-ink/8">
              <button
                onClick={() => openEdit(t)}
                className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold flex-1"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={async () => {
                  if (!confirm(`Delete template "${t.name}"?`)) return;
                  await AdminAPI.deleteSmsTemplate(t.id);
                  toast.success("Template deleted.");
                  load();
                }}
                className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold text-red-500 hover:text-red-700"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </InteractiveCard3D>
        ))}
      </div>

      {editing !== null && (
        <Modal
          title={editing.id ? "Edit SMS Template" : "New SMS Template"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Template Name *
              </label>
              <input
                className="clay-input"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Assign to Occasion (Optional)
              </label>
              <select
                className="clay-input"
                value={form.eventTypeId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    eventTypeId: e.target.value,
                  })
                }
              >
                <option value="">All Occasions (Global)</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Message Content *
              </label>
              <textarea
                className="clay-input min-h-28 text-xs font-mono"
                value={form.body}
                onChange={(e) =>
                  setForm({
                    ...form,
                    body: e.target.value,
                  })
                }
                required
              />

              <div className="flex flex-wrap gap-1.5 mt-2">
                {PLACEHOLDERS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        body: (form.body || "") + " " + p,
                      })
                    }
                    className="text-[10px] font-mono bg-sand-100 hover:bg-sand-200 px-2 py-0.5 rounded-md text-ink/70"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="clay-btn-primary !w-full !py-3 text-xs font-bold mt-2 flex items-center justify-center gap-2"
            >
              <Save size={15} />
              <span>{saving ? "Saving..." : "Save SMS Template"}</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
