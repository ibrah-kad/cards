import { useEffect, useState } from "react";
import { Plus, Trash2, ScanLine, Save } from "lucide-react";
import { ScannerAdminAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import InteractiveCard3D from "../../components/InteractiveCard3D";
export default function AdminScanners() {
  const [scanners, setScanners] = useState(null);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    password: "",
    name: "",
    batchId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const loadData = async () => {
    try {
      const [scannersData, eventsData] = await Promise.all([
        ScannerAdminAPI.listScanners(),
        ScannerAdminAPI.getAvailableEvents(),
      ]);
      setScanners(scannersData);
      setEvents(eventsData);
    } catch (e) {
      toast.error(e.message);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const openCreateModal = () => {
    setForm({
      phone: "",
      password: "",
      name: "",
      batchId: events[0] ? String(events[0].id) : "",
    });
    setShowModal(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ScannerAdminAPI.createScanner({
        phone: form.phone,
        password: form.password,
        name: form.name,
        batchId: Number(form.batchId),
      });
      toast.success("Gate scanner account created!");
      setShowModal(false);
      loadData();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (s) => {
    if (!confirm(`Delete scanner ${s.name || s.phone}?`)) return;
    try {
      await ScannerAdminAPI.deleteScanner(s.id);
      toast.success("Scanner account deleted.");
      loadData();
    } catch (e) {
      toast.error(e.message);
    }
  };
  if (!scanners)
    return <Loader label="Loading scanner usher accounts..." full />;
  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <span className="label-eyebrow text-xs mb-1 block">
            Gate Management
          </span>
          <h1 className="font-display text-3xl font-bold text-ink">
            Gate Scanner Accounts
          </h1>
          <p className="text-xs text-ink/60 mt-1">
            Create usher accounts scoped to specific celebrations for check-in
            scanning.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="clay-btn-primary text-xs font-bold flex items-center gap-2"
        >
          <Plus size={16} /> New Scanner Account
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {scanners.map((s) => (
          <InteractiveCard3D
            key={s.id}
            tiltIntensity={6}
            className="p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-sand-100 flex items-center justify-center text-marigold-700">
                  <ScanLine size={18} />
                </div>
                <button
                  onClick={() => handleDelete(s)}
                  className="text-ink/30 hover:text-red-500 p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <h3 className="font-display font-bold text-base text-ink mb-0.5">
                {s.name || "Usher"}
              </h3>
              <p className="font-mono text-xs text-ink/60 mb-3">{s.phone}</p>

              <div className="bg-sand-100/90 rounded-xl p-2.5 text-xs text-ink/75 border border-white">
                <span className="text-[10px] text-ink/40 uppercase font-bold block mb-0.5">
                  Assigned Event
                </span>
                <p className="font-semibold text-ink truncate">{s.eventName}</p>
                <p className="text-[10px] text-marigold-700 font-mono font-bold">
                  {s.eventReference}
                </p>
              </div>
            </div>

            <p className="text-[10px] text-ink/40 mt-4 pt-2 border-t border-ink/8">
              Active Scanner Account
            </p>
          </InteractiveCard3D>
        ))}
      </div>

      {showModal && (
        <Modal
          title="Create Gate Scanner Account"
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Usher Name *
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
                placeholder="e.g. Juma (Gate A)"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Usher Mobile Phone *
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
                placeholder="0712 345 678"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Login Password *
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
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Assign to Celebration *
              </label>
              <select
                className="clay-input"
                value={form.batchId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    batchId: e.target.value,
                  })
                }
                required
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.eventName} ({ev.reference})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="clay-btn-primary !w-full !py-3 text-xs font-bold mt-2 flex items-center justify-center gap-2"
            >
              <Save size={15} />
              <span>{submitting ? "Creating..." : "Save Scanner Usher"}</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
