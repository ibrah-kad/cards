import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { AdminAPI } from "../../api/api";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import InteractiveCard3D from "../../components/InteractiveCard3D";
import { useToast } from "../../context/ToastContext";
import { playPopSound } from "../../utils/audio";
export default function AdminParagraphTemplates() {
  const [items, setItems] = useState(null);
  const [events, setEvents] = useState([]);
  const [cards, setCards] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    content: "",
    eventTypeId: "",
    cardTemplateId: "",
    isDefault: false,
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const load = () => {
    AdminAPI.listParagraphTemplates()
      .then(setItems)
      .catch(() => setItems([]));
    AdminAPI.listEvents()
      .then(setEvents)
      .catch(() => {});
    AdminAPI.listCardTemplates()
      .then(setCards)
      .catch(() => {});
  };
  useEffect(load, []);
  const openNew = () => {
    setForm({
      name: "",
      content: "",
      eventTypeId: "",
      cardTemplateId: "",
      isDefault: false,
      active: true,
    });
    setEditing({});
  };
  const openEdit = (p) => {
    setForm({
      name: p.name,
      content: p.content,
      eventTypeId: p.eventType?.id ? String(p.eventType.id) : "",
      cardTemplateId: p.cardTemplate?.id ? String(p.cardTemplate.id) : "",
      isDefault: !!p.isDefault,
      active: p.active !== false,
    });
    setEditing(p);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) {
      return toast.error("Template name and message content are required");
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        content: form.content,
        eventType: form.eventTypeId
          ? {
              id: Number(form.eventTypeId),
              name:
                events.find((ev) => ev.id === Number(form.eventTypeId))?.name ||
                "",
            }
          : null,
        cardTemplate: form.cardTemplateId
          ? {
              id: Number(form.cardTemplateId),
              name:
                cards.find((c) => c.id === Number(form.cardTemplateId))?.name ||
                "",
            }
          : null,
        isDefault: form.isDefault,
        active: form.active,
      };
      if (editing?.id)
        await AdminAPI.updateParagraphTemplate(editing.id, payload);
      else await AdminAPI.createParagraphTemplate(payload);
      playPopSound(540);
      toast.success("Paragraph template saved successfully!");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await AdminAPI.deleteParagraphTemplate(p.id);
      toast.success("Deleted.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  if (!items) return <Loader label="Loading paragraph templates…" />;
  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <span className="label-eyebrow text-xs mb-1 block">
            Dynamic Content
          </span>
          <h1 className="font-display text-3xl font-bold text-ink">
            Paragraph Templates
          </h1>
          <p className="text-xs text-ink/50 mt-1">
            Create customizable celebration paragraphs with variable
            placeholders like {"{name}"}.
          </p>
        </div>
        <button
          onClick={openNew}
          className="clay-btn-primary text-xs font-bold flex items-center gap-2"
        >
          <Plus size={16} /> New Paragraph
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <InteractiveCard3D
            key={p.id}
            tiltIntensity={6}
            className="p-5 flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-display font-bold text-base text-ink">
                  {p.name}
                </h3>
                {p.isDefault && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-marigold-100 text-marigold-800">
                    DEFAULT
                  </span>
                )}
              </div>

              <div className="bg-sand-100/80 rounded-xl p-3 border border-white/80 mb-3 text-xs text-ink/75 font-mono whitespace-pre-wrap leading-relaxed line-clamp-4">
                {p.content}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-ink/8">
              <button
                onClick={() => openEdit(p)}
                className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold flex-1"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={() => handleDelete(p)}
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
          title={
            editing.id ? "Edit Paragraph Template" : "New Paragraph Template"
          }
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Template Title *
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
                placeholder="e.g. Warm Wedding Blessing"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Paragraph Content * (Use {"{name}"}, {"{tableNumber}"})
              </label>
              <textarea
                className="clay-input min-h-28 text-xs font-mono"
                value={form.content}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content: e.target.value,
                  })
                }
                placeholder="Mpendwa {name}, Tunayo furaha kukualika..."
                required
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-ink/75 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isDefault: e.target.checked,
                  })
                }
                className="accent-marigold w-4 h-4 rounded"
              />
              <span>Set as default paragraph template</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="clay-btn-primary !w-full !py-3 text-xs font-bold mt-2 flex items-center justify-center gap-2"
            >
              <Save size={15} />
              <span>{saving ? "Saving..." : "Save Paragraph Template"}</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
