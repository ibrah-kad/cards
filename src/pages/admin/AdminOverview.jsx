import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  LayoutTemplate,
  MessageSquareText,
  Package,
  ArrowRight,
  Users,
  Send,
  BarChart3,
  ScanLine,
} from "lucide-react";
import { AdminAPI } from "../../api/api";
import InteractiveCard3D from "../../components/InteractiveCard3D";
const CARDS = [
  {
    key: "events",
    label: "Celebration Occasions",
    icon: CalendarDays,
    to: "/admin/events",
    color: "from-marigold/20 to-blush/20",
    iconColor: "text-marigold",
  },
  {
    key: "cardTemplates",
    label: "Card Layout Designs",
    icon: LayoutTemplate,
    to: "/admin/card-templates",
    color: "from-sage/20 to-sand-200/40",
    iconColor: "text-sage-700",
  },
  {
    key: "smsTemplates",
    label: "SMS Blasts & Alerts",
    icon: MessageSquareText,
    to: "/admin/sms-templates",
    color: "from-blue-100 to-sky-50",
    iconColor: "text-sky-700",
  },
  {
    key: "bundles",
    label: "Delivery Bundles",
    icon: Package,
    to: "/admin/bundles",
    color: "from-blush/30 to-sand-100",
    iconColor: "text-rose-600",
  },
  {
    key: "clients",
    label: "Registered Clients",
    icon: Users,
    to: "/admin/clients",
    color: "from-sage/20 to-emerald-100",
    iconColor: "text-emerald-700",
  },
  {
    key: "invitations",
    label: "Active Invitations",
    icon: Send,
    to: "/admin/invitations",
    color: "from-marigold/20 to-amber-100",
    iconColor: "text-amber-700",
  },
  {
    key: "scanners",
    label: "Gate Scanner Accounts",
    icon: ScanLine,
    to: "/admin/scanners",
    color: "from-dusk/20 to-slate-100",
    iconColor: "text-dusk",
  },
  {
    key: "analytics",
    label: "Revenue & Check-in",
    icon: BarChart3,
    to: "/admin/analytics",
    color: "from-purple-100 to-blush/20",
    iconColor: "text-purple-700",
  },
];
export default function AdminOverview() {
  const [counts, setCounts] = useState({
    events: 0,
    cardTemplates: 0,
    smsTemplates: 0,
    bundles: 0,
    clients: 0,
    invitations: 0,
    scanners: 0,
    analytics: 0,
  });
  useEffect(() => {
    Promise.allSettled([
      AdminAPI.listEvents(),
      AdminAPI.listCardTemplates(),
      AdminAPI.listSmsTemplates(),
      AdminAPI.listBundles(),
      AdminAPI.listClients(),
      AdminAPI.listAllInvitations(),
    ]).then(([events, cards, sms, bundles, clients, invites]) => {
      setCounts((prev) => ({
        ...prev,
        events:
          events.status === "fulfilled" ? events.value.length : prev.events,
        cardTemplates:
          cards.status === "fulfilled"
            ? cards.value.length
            : prev.cardTemplates,
        smsTemplates:
          sms.status === "fulfilled" ? sms.value.length : prev.smsTemplates,
        bundles:
          bundles.status === "fulfilled" ? bundles.value.length : prev.bundles,
        clients:
          clients.status === "fulfilled" ? clients.value.length : prev.clients,
        invitations:
          invites.status === "fulfilled"
            ? invites.value.length
            : prev.invitations,
      }));
    });
  }, []);
  return (
    <div>
      <span className="label-eyebrow text-xs mb-1 block">
        Catalog &amp; Operations
      </span>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-2">
        Platform Overview
      </h1>
      <p className="text-xs sm:text-sm text-ink/60 mb-8">
        Manage designs, delivery pricing, guest queues, and live scanners across
        Tanzania.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CARDS.map((c) => (
          <Link key={c.key} to={c.to}>
            <InteractiveCard3D
              tiltIntensity={8}
              className="p-5 flex flex-col justify-between h-full group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center ${c.iconColor} shadow-sm`}
                  >
                    <c.icon size={20} />
                  </div>
                  <span className="font-display font-bold text-2xl text-ink">
                    {counts[c.key] ?? "—"}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-ink mb-1">
                  {c.label}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-ink/8 flex items-center justify-between text-xs font-bold text-marigold-700">
                <span>Manage</span>
                <ArrowRight
                  size={13}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </InteractiveCard3D>
          </Link>
        ))}
      </div>
    </div>
  );
}
