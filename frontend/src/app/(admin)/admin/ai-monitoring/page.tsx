"use client";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Bot, Zap, AlertTriangle, DollarSign, Clock, TrendingUp } from "lucide-react";

const DAILY_USAGE = [
  { date: "Jun 2", calls: 1842, errors: 12, cost: 2210 },
  { date: "Jun 3", calls: 2103, errors: 8, cost: 2524 },
  { date: "Jun 4", calls: 1756, errors: 15, cost: 2107 },
  { date: "Jun 5", calls: 2450, errors: 5, cost: 2940 },
  { date: "Jun 6", calls: 2891, errors: 9, cost: 3469 },
  { date: "Jun 7", calls: 3102, errors: 11, cost: 3722 },
  { date: "Jun 8", calls: 1560, errors: 3, cost: 1872 },
];

const TOP_TENANTS = [
  { name: "Tech Hub Kenya", calls: 15600, cost: 18720, errorRate: "0.3%" },
  { name: "Zawadi Boutique", calls: 8420, cost: 10104, errorRate: "0.5%" },
  { name: "Nairobi Supermart", calls: 7230, cost: 8676, errorRate: "0.4%" },
  { name: "Afya Plus Pharmacy", calls: 3100, cost: 3720, errorRate: "0.8%" },
  { name: "Mama Mboga Express", calls: 2310, cost: 2772, errorRate: "0.6%" },
];

const ERROR_TYPES = [
  { type: "Rate limit exceeded", count: 28, trend: "down" },
  { type: "Context length exceeded", count: 14, trend: "stable" },
  { type: "Model unavailable", count: 7, trend: "down" },
  { type: "Invalid request", count: 4, trend: "down" },
];

export default function AdminAIMonitoringPage() {
  const totalCalls = DAILY_USAGE.reduce((s, d) => s + d.calls, 0);
  const totalCost = DAILY_USAGE.reduce((s, d) => s + d.cost, 0);
  const totalErrors = DAILY_USAGE.reduce((s, d) => s + d.errors, 0);
  const errorRate = ((totalErrors / totalCalls) * 100).toFixed(2);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">AI Monitoring</h1>
        <p className="text-sm text-slate-400">API usage, costs, and error tracking across all tenants</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total AI Calls", value: totalCalls.toLocaleString(), icon: Bot, color: "text-brand-400" },
          { label: "API Cost (KSh)", value: totalCost.toLocaleString(), icon: DollarSign, color: "text-emerald-400" },
          { label: "Total Errors", value: String(totalErrors), icon: AlertTriangle, color: "text-red-400" },
          { label: "Error Rate", value: `${errorRate}%`, icon: TrendingUp, color: "text-amber-400" },
          { label: "Avg Response", value: "1.2s", icon: Clock, color: "text-purple-400" },
          { label: "Active Models", value: "2", icon: Zap, color: "text-cyan-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <stat.icon size={16} className={`${stat.color} mb-2`} />
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Usage Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Daily AI Calls (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={DAILY_USAGE} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #1e293b", background: "#0f172a", color: "#cbd5e1", fontSize: 12 }} />
            <Area type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2} fill="url(#callsGrad)" name="AI Calls" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Tenants by Usage */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-300">Top Tenants by AI Usage</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {TOP_TENANTS.map((tenant, idx) => (
              <div key={tenant.name} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-4">{idx + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{tenant.name}</p>
                    <p className="text-xs text-slate-500">{tenant.calls.toLocaleString()} calls</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-400">KSh {tenant.cost.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Err: {tenant.errorRate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Types */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-300">Error Breakdown</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {ERROR_TYPES.map((err) => (
                <div key={err.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={13} className="text-red-400 shrink-0" />
                    <span className="text-sm text-slate-300">{err.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-400">{err.count}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${err.trend === "down" ? "bg-emerald-900 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                      {err.trend === "down" ? "↓" : "→"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 pb-4">
            <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Cost Per Day</h3>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={DAILY_USAGE} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#475569" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#475569" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #1e293b", background: "#0f172a", color: "#cbd5e1", fontSize: 11 }} formatter={(v: number) => `KSh ${v}`} />
                <Bar dataKey="cost" fill="#10b981" radius={[3, 3, 0, 0]} name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
