import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { AdminAPI } from "../../api/api";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import InteractiveCard3D from "../../components/InteractiveCard3D";
import { useToast } from "../../context/ToastContext";
import { playPopSound } from "../../utils/audio";
const EMPTY = {
  name: "",
  slug: "",
  description: "",
  coverImageUrl: "",
  shortcode: "",
  active: true,
  displayOrder: 0,
  needsCard: true,
};
export default function AdminEvents() {
  const [items, setItems] = useState(null);
  const [smsTemplates, setSmsTemplates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const load = () => {
    AdminAPI.listEvents()
      .then(setItems)
      .catch((e) => toast.error(e.message));
    AdminAPI.listSmsTemplates()
      .then(setSmsTemplates)
      .catch(() => {});
  };
  useEffect(load, []);
  const openNew = () => {
    setForm(EMPTY);
    setEditing({});
  };
  const openEdit = (e) => {
    setForm({
      ...e,
      needsCard: e.needsCard !== false,
    });
    setEditing(e);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug)
      return toast.error("Name and slug are required");
    setSaving(true);
    try {
      if (form.id) await AdminAPI.updateEvent(form.id, form);
      else await AdminAPI.createEvent(form);
      playPopSound(560);
      toast.success("Occasion saved successfully!");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (e) => {
    if (!confirm(`Delete "${e.name}"?`)) return;
    try {
      await AdminAPI.deleteEvent(e.id);
      toast.success("Occasion deleted.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  if (!items) return <Loader label="Loading events…" />;
  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <span className="label-eyebrow text-xs mb-1 block">Catalog</span>
          <h1 className="font-display text-3xl font-bold text-ink">
            Celebration Occasions
          </h1>
        </div>
        <button
          onClick={openNew}
          className="clay-btn-primary text-xs font-bold flex items-center gap-2"
        >
          <Plus size={16} /> New Occasion
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((e) => (
          <InteractiveCard3D
            key={e.id}
            tiltIntensity={6}
            className="p-5 flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-display font-bold text-lg text-ink">
                  {e.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sand-200 text-ink/70">
                  {e.needsCard === false ? "SMS-Only" : "Card + Pass"}
                </span>
              </div>
              <p className="text-xs text-ink/60 line-clamp-2 mb-4 leading-relaxed">
                {e.description}
              </p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-ink/8">
              <button
                onClick={() => openEdit(e)}
                className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold flex-1"
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                onClick={() => handleDelete(e)}
                className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold text-red-500 hover:text-red-700"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </InteractiveCard3D>
        ))}
      </div>

      {editing !== null && (
        <Modal
          title={form.id ? "Edit Occasion" : "New Occasion"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                  Event Name *
                </label>
                <input
                  className="clay-input"
                  value={form.name || ""}
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
                  Slug (URL) *
                </label>
                <input
                  className="clay-input"
                  value={form.slug || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <textarea
                className="clay-input min-h-20 text-xs"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-ink/75 cursor-pointer">
              <input
                type="checkbox"
                checked={form.needsCard}
                onChange={(e) =>
                  setForm({
                    ...form,
                    needsCard: e.target.checked,
                  })
                }
                className="accent-marigold w-4 h-4 rounded"
              />
              <span>Requires Card Design (uncheck for SMS blasts only)</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="clay-btn-primary !w-full !py-3 text-xs font-bold mt-2 flex items-center justify-center gap-2"
            >
              <Save size={15} />
              <span>{saving ? "Saving..." : "Save Occasion"}</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
