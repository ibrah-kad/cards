import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { AdminAPI } from "../../api/api";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import InteractiveCard3D from "../../components/InteractiveCard3D";
import { useToast } from "../../context/ToastContext";
import { playPopSound } from "../../utils/audio";
export default function AdminBundles() {
  const [items, setItems] = useState(null);
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: 15000,
    pricePerInvitee: 1500,
    currency: "TZS",
    includesCard: true,
    includesSms: true,
    includesWhatsapp: true,
    includesQrScan: true,
    minimumQuantity: 15,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const load = () => {
    AdminAPI.listBundles()
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
      description: "",
      basePrice: 15000,
      pricePerInvitee: 1500,
      currency: "TZS",
      includesCard: true,
      includesSms: true,
      includesWhatsapp: true,
      includesQrScan: true,
      minimumQuantity: 15,
    });
    setEditing({});
  };
  const openEdit = (b) => {
    setForm(b);
    setEditing(b);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Bundle name is required");
    setSaving(true);
    try {
      if (editing?.id) await AdminAPI.updateBundle(editing.id, form);
      else await AdminAPI.createBundle(form);
      playPopSound(540);
      toast.success("Delivery bundle saved successfully!");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  if (!items) return <Loader label="Loading bundles…" />;
  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <span className="label-eyebrow text-xs mb-1 block">
            Pricing &amp; Packaging
          </span>
          <h1 className="font-display text-3xl font-bold text-ink">
            Delivery Bundles
          </h1>
        </div>
        <button
          onClick={openNew}
          className="clay-btn-primary text-xs font-bold flex items-center gap-2"
        >
          <Plus size={16} /> New Bundle
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((b) => (
          <InteractiveCard3D
            key={b.id}
            tiltIntensity={6}
            className="p-6 flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-display font-bold text-lg text-ink">
                  {b.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sand-200 text-ink/70">
                  Min {b.minimumQuantity}
                </span>
              </div>
              <p className="text-xs text-ink/60 mb-4 leading-relaxed">
                {b.description}
              </p>

              <div className="mb-4">
                <p className="font-display font-bold text-2xl text-marigold-700">
                  {Number(b.pricePerInvitee).toLocaleString()}{" "}
                  <span className="text-xs font-semibold text-ink/50">
                    {b.currency} / guest
                  </span>
                </p>
                <p className="text-[11px] text-ink/45">
                  Base: {Number(b.basePrice).toLocaleString()} {b.currency}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4 text-[10px] font-bold">
                {b.includesCard && (
                  <span className="px-2 py-0.5 rounded bg-sage-100 text-sage-800">
                    Card
                  </span>
                )}
                {b.includesWhatsapp && (
                  <span className="px-2 py-0.5 rounded bg-sage-100 text-sage-800">
                    WhatsApp
                  </span>
                )}
                {b.includesSms && (
                  <span className="px-2 py-0.5 rounded bg-sage-100 text-sage-800">
                    SMS
                  </span>
                )}
                {b.includesQrScan && (
                  <span className="px-2 py-0.5 rounded bg-sage-100 text-sage-800">
                    QR Gate
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-ink/8">
              <button
                onClick={() => openEdit(b)}
                className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold flex-1"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={async () => {
                  if (!confirm(`Delete bundle "${b.name}"?`)) return;
                  await AdminAPI.deleteBundle(b.id);
                  toast.success("Bundle deleted.");
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
          title={editing.id ? "Edit Bundle" : "New Bundle"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Bundle Name *
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

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                  Price Per Guest (TZS) *
                </label>
                <input
                  type="number"
                  className="clay-input"
                  value={form.pricePerInvitee || 0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pricePerInvitee: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                  Base Setup Price (TZS)
                </label>
                <input
                  type="number"
                  className="clay-input"
                  value={form.basePrice || 0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      basePrice: Number(e.target.value),
                    })
                  }
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

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-ink/75 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.includesWhatsapp}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      includesWhatsapp: e.target.checked,
                    })
                  }
                  className="accent-marigold w-4 h-4 rounded"
                />
                <span>Includes WhatsApp</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-ink/75 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.includesSms}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      includesSms: e.target.checked,
                    })
                  }
                  className="accent-marigold w-4 h-4 rounded"
                />
                <span>Includes SMS Reminder</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-ink/75 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.includesQrScan}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      includesQrScan: e.target.checked,
                    })
                  }
                  className="accent-marigold w-4 h-4 rounded"
                />
                <span>Includes Gate QR Scanner</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="clay-btn-primary !w-full !py-3 text-xs font-bold mt-2 flex items-center justify-center gap-2"
            >
              <Save size={15} />
              <span>{saving ? "Saving..." : "Save Bundle"}</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
