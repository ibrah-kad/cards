import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, LogIn, Eye } from "lucide-react";
import { AdminAPI } from "../../api/api";
import Loader from "../../components/Loader";
import InteractiveCard3D from "../../components/InteractiveCard3D";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
export default function AdminClients() {
  const [clients, setClients] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const { impersonate } = useAuth();
  useEffect(() => {
    AdminAPI.listClients()
      .then(setClients)
      .catch((e) => toast.error(e.message));
  }, []);
  const handleImpersonate = async (client) => {
    if (
      !confirm(`Impersonate ${client.phone}? You will browse as this client.`)
    )
      return;
    try {
      const data = await AdminAPI.impersonate(client.id);
      impersonate(data);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <span className="label-eyebrow text-xs mb-1 block">
            User Accounts
          </span>
          <h1 className="font-display text-3xl font-bold text-ink">
            Registered Clients
          </h1>
        </div>
      </div>

      {!clients && <Loader label="Loading clients…" full />}

      {clients && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((c) => (
            <InteractiveCard3D
              key={c.id}
              tiltIntensity={6}
              className="p-5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-sage-100 flex items-center justify-center text-sage-700 font-bold">
                  <Users size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-ink truncate">
                    {c.phone}
                  </p>
                  <p className="text-xs text-ink/50">
                    {c.totalEvents} events · {c.totalGuests} guests
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-ink/8">
                <button
                  onClick={() => navigate(`/admin/clients/${c.id}`)}
                  className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold flex-1"
                >
                  <Eye size={12} /> View
                </button>
                <button
                  onClick={() => handleImpersonate(c)}
                  className="clay-btn-secondary !py-1.5 !px-3 text-xs font-bold text-blue-600 hover:text-blue-800 flex-1"
                >
                  <LogIn size={12} /> Impersonate
                </button>
              </div>
            </InteractiveCard3D>
          ))}
        </div>
      )}
    </div>
  );
}
