import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck, Save } from "lucide-react";
import { AdminAPI } from "../../api/api";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import InteractiveCard3D from "../../components/InteractiveCard3D";
import { useToast } from "../../context/ToastContext";
import { playPopSound } from "../../utils/audio";
const EMPTY = {
  phone: "",
  name: "",
  password: "",
};
export default function AdminAdmins() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    id: 0,
    ...EMPTY,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const load = () => {
    AdminAPI.listAdmins()
      .then(setItems)
      .catch((e) => toast.error(e.message));
  };
  useEffect(load, []);
  const openNew = () => {
    setForm({
      id: 0,
      ...EMPTY,
    });
    setEditing({});
  };
  const openEdit = (e) => {
    setForm({
      ...e,
      password: "",
    });
    setEditing(e);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) await AdminAPI.updateAdmin(form.id, form);
      else await AdminAPI.createAdmin(form);
      playPopSound(540);
      toast.success("Administrator saved successfully!");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (e) => {
    if (!confirm(`Delete admin "${e.name || e.phone}"?`)) return;
    try {
      await AdminAPI.deleteAdmin(e.id);
      toast.success("Admin deleted.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  if (!items) return <Loader label="Loading administrators…" full />;
  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <span className="label-eyebrow text-xs mb-1 block">
            Security &amp; Permissions
          </span>
          <h1 className="font-display text-3xl font-bold text-ink">
            System Admins
          </h1>
        </div>
        <button
          onClick={openNew}
          className="clay-btn-primary text-xs font-bold flex items-center gap-2"
        >
          <Plus size={16} /> New Admin
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((a) => (
          <InteractiveCard3D
            key={a.id}
            tiltIntensity={6}
            className="p-5 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-marigold-100 flex items-center justify-center text-marigold-700">
                <ShieldCheck size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-ink truncate">
                  {a.name || "Administrator"}
                </p>
                <p className="text-xs text-ink/50 font-mono truncate">
                  {a.phone}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-ink/8">
              <button
                onClick={() => openEdit(a)}
                className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold flex-1"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={() => handleDelete(a)}
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
          title={form.id ? "Edit Administrator" : "New Administrator"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Full Name *
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
                Mobile Number *
              </label>
              <input
                className="clay-input"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                {form.id
                  ? "New Password (leave empty to keep current)"
                  : "Password *"}
              </label>
              <input
                type="password"
                className="clay-input"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder="••••••••"
                required={!form.id}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="clay-btn-primary !w-full !py-3 text-xs font-bold mt-2 flex items-center justify-center gap-2"
            >
              <Save size={15} />
              <span>{saving ? "Saving..." : "Save Administrator"}</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
