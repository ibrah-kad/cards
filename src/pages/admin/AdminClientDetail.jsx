import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  CalendarHeart,
  Users,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { AdminAPI } from "../../api/api";
import Loader from "../../components/Loader";
import InteractiveCard3D from "../../components/InteractiveCard3D";
export default function AdminClientDetail() {
  const { clientId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!clientId) return;
    AdminAPI.getClientDetail(clientId)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [clientId]);
  if (error) return <p className="text-red-500 py-24 text-center">{error}</p>;
  if (!data) return <Loader label="Loading client details…" full />;
  const { client, invitations } = data;
  return (
    <div>
      <Link
        to="/admin/clients"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/60 hover:text-ink mb-6"
      >
        <ArrowLeft size={14} /> Back to Clients
      </Link>

      {/* Overview Card */}
      <InteractiveCard3D className="p-6 mb-8 flex flex-wrap items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-marigold-100 flex items-center justify-center text-marigold-700 shrink-0">
          <Users size={26} />
        </div>
        <div className="flex-1 min-w-[180px]">
          <p className="font-display text-2xl font-bold text-ink flex items-center gap-2">
            <Phone size={18} className="text-ink/40" /> {client.phone}
          </p>
          <p className="text-xs text-ink/50 mt-1">
            {client.role} ·{" "}
            {client.activated ? "Activated account" : "Not activated"}
          </p>
        </div>

        <div className="flex gap-3 text-center text-xs">
          <div className="bg-sand-100/90 rounded-2xl px-4 py-2 border border-white">
            <p className="font-bold text-base text-ink">{client.totalEvents}</p>
            <p className="text-[10px] text-ink/50 uppercase">Events</p>
          </div>
          <div className="bg-sand-100/90 rounded-2xl px-4 py-2 border border-white">
            <p className="font-bold text-base text-ink">{client.totalGuests}</p>
            <p className="text-[10px] text-ink/50 uppercase">Guests</p>
          </div>
          <div className="bg-sand-100/90 rounded-2xl px-4 py-2 border border-white">
            <p className="font-bold text-base text-sage-700">
              {client.totalCheckedIn}
            </p>
            <p className="text-[10px] text-ink/50 uppercase">Checked In</p>
          </div>
        </div>
      </InteractiveCard3D>

      <h2 className="font-display text-xl font-bold text-ink mb-4">
        Client's Invitations ({invitations.length})
      </h2>

      <div className="flex flex-col gap-3">
        {invitations.map((inv) => (
          <Link key={inv.id} to={`/admin/invitations/${inv.id}`}>
            <InteractiveCard3D
              tiltIntensity={4}
              className="p-4 sm:p-5 flex flex-wrap items-center gap-4 hover:shadow-lg"
            >
              <div className="w-10 h-10 rounded-2xl bg-sand-100 flex items-center justify-center text-marigold-700 shrink-0">
                <CalendarHeart size={18} />
              </div>
              <div className="flex-1 min-w-[160px]">
                <p className="font-display font-bold text-sm text-ink">
                  {inv.eventName}
                </p>
                <p className="text-[11px] text-ink/50">
                  {inv.reference} · {inv.templateName}
                </p>
              </div>
              <div className="text-xs text-ink/60 flex items-center gap-1">
                <Users size={13} /> {inv.guests} guests
              </div>
              <div className="text-xs text-sage-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> {inv.delivered} delivered
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sand-200">
                {inv.status}
              </span>
              <ChevronRight size={15} className="text-ink/30" />
            </InteractiveCard3D>
          </Link>
        ))}
      </div>
    </div>
  );
}
