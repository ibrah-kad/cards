import { useEffect, useState } from "react";
import { Users, Calendar, DollarSign, CheckCircle2, Crown } from "lucide-react";
import { AdminAPI } from "../../api/api";
import Loader from "../../components/Loader";
import InteractiveCard3D from "../../components/InteractiveCard3D";
export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    AdminAPI.getAnalyticsDashboard()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <Loader label="Crunching celebration analytics…" full />;
  if (!data) return null;
  const { overview, revenueSeries, eventsByCategory, topClients } = data;
  return (
    <div className="space-y-8">
      <div>
        <span className="label-eyebrow text-xs mb-1 block">
          Business Intelligence
        </span>
        <h1 className="font-display text-3xl font-bold text-ink">
          Analytics &amp; Performance
        </h1>
        <p className="text-xs text-ink/50 mt-1">
          Real-time revenue, delivery, and check-in rates
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InteractiveCard3D
          tiltIntensity={6}
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-ink/50 uppercase">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-marigold-100 flex items-center justify-center text-marigold-700">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="font-display font-bold text-2xl text-marigold-700">
            {Number(overview.totalRevenue).toLocaleString()} {overview.currency}
          </p>
          <p className="text-[11px] text-ink/50 mt-1">
            {Number(overview.revenueThisMonth).toLocaleString()} this month
          </p>
        </InteractiveCard3D>

        <InteractiveCard3D
          tiltIntensity={6}
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-ink/50 uppercase">
              Total Events
            </span>
            <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
              <Calendar size={16} />
            </div>
          </div>
          <p className="font-display font-bold text-2xl text-ink">
            {overview.totalEvents}
          </p>
          <p className="text-[11px] text-ink/50 mt-1">
            {overview.eventsThisMonth} active this month
          </p>
        </InteractiveCard3D>

        <InteractiveCard3D
          tiltIntensity={6}
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-ink/50 uppercase">
              Gate Check-In Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="font-display font-bold text-2xl text-sage-700">
            {overview.checkInRate}%
          </p>
          <p className="text-[11px] text-ink/50 mt-1">
            {overview.totalCheckedIn.toLocaleString()} of{" "}
            {overview.totalGuests.toLocaleString()} checked in
          </p>
        </InteractiveCard3D>

        <InteractiveCard3D
          tiltIntensity={6}
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-ink/50 uppercase">
              Active Clients
            </span>
            <div className="w-8 h-8 rounded-xl bg-blush/30 flex items-center justify-center text-rose-700">
              <Users size={16} />
            </div>
          </div>
          <p className="font-display font-bold text-2xl text-ink">
            {overview.activeClients}
          </p>
          <p className="text-[11px] text-ink/50 mt-1">
            98.2% payment conversion
          </p>
        </InteractiveCard3D>
      </div>

      {/* Visual Chart Bars */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-lg text-ink mb-4">
            Weekly Revenue Trend
          </h3>
          <div className="flex items-end gap-3 h-44 pt-6 px-2">
            {revenueSeries.map((r, i) => {
              const max = 1300000;
              const h = Math.round((r.revenue / max) * 100);
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full bg-sand-100 rounded-t-xl overflow-hidden h-32 flex items-end">
                    <div
                      style={{
                        height: `${h}%`,
                      }}
                      className="w-full bg-gradient-to-t from-marigold to-marigold-500 rounded-t-xl transition-all duration-700"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-ink/60">
                    {r.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-lg text-ink mb-4">
            Popular Occasions
          </h3>
          <div className="space-y-3">
            {eventsByCategory.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-ink/80">{c.name}</span>
                  <span className="font-bold text-marigold-700">
                    {c.count} celebrations
                  </span>
                </div>
                <div className="h-2.5 bg-sand-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${(c.count / 24) * 100}%`,
                    }}
                    className="h-full bg-sage-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Clients Table */}
      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2">
          <Crown size={18} className="text-marigold" />
          <span>Top Client Accounts</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-sand-100/90 text-ink/60 font-bold uppercase tracking-wider border-b border-ink/8">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Events</th>
                <th className="p-3">Total Guests</th>
                <th className="p-3">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {topClients.map((c, idx) => (
                <tr key={c.id} className="hover:bg-white/50">
                  <td className="p-3 font-bold text-marigold-700">
                    #{idx + 1}
                  </td>
                  <td className="p-3 font-semibold">{c.phone}</td>
                  <td className="p-3">{c.totalEvents}</td>
                  <td className="p-3 font-bold">{c.totalGuests}</td>
                  <td className="p-3 font-bold text-ink">
                    {Number(c.totalSpent).toLocaleString()} {overview.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
