"use client";

import {
  Users, CreditCard, Activity, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Clock, Zap, Database, Server
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";

const KPI = [
  { label: "Total Tenants", value: "247", change: "+12", up: true, icon: Users, color: "bg-brand-900 text-brand-400" },
  { label: "MRR (KSh)", value: "1.82M", change: "+18%", up: true, icon: CreditCard, color: "bg-emerald-900/50 text-emerald-400" },
  { label: "Active AI Sessions", value: "3,847", change: "+24%", up: true, icon: Activity, color: "bg-purple-900/50 text-purple-400" },
  { label: "Token Usage (today)", value: "2.3M", change: "+5%", up: true, icon: Zap, color: "bg-amber-900/50 text-amber-400" },
];

const REVENUE_DATA = [
  { month: "Jan", mrr: 820000 }, { month: "Feb", mrr: 940000 },
  { month: "Mar", mrr: 1100000 }, { month: "Apr", mrr: 1350000 },
  { month: "May", mrr: 1620000 }, { month: "Jun", mrr: 1820000 },
];

const AI_DATA = [
  { day: "Mon", haiku: 8200, sonnet: 1200, cost: 4200 },
  { day: "Tue", haiku: 9400, sonnet: 1800, cost: 5100 },
  { day: "Wed", haiku: 7800, sonnet: 980, cost: 3800 },
  { day: "Thu", haiku: 11200, sonnet: 2100, cost: 6200 },
  { day: "Fri", haiku: 10600, sonnet: 1900, cost: 5800 },
  { day: "Sat", haiku: 8900, sonnet: 1400, cost: 4600 },
  { day: "Sun", haiku: 7200, sonnet: 890, cost: 3500 },
];

const RECENT_TENANTS = [
  { name: "Nairobi Bakers Co.", type: "Bakery", plan: "Growth", status: "active", joined: "2h ago", conversations: 234 },
  { name: "Luxe Salon Karen", type: "Salon", plan: "Starter", status: "active", joined: "5h ago", conversations: 89 },
  { name: "Safari Connections", type: "Travel", plan: "Business", status: "trial", joined: "1d ago", conversations: 12 },
  { name: "Mama's Kitchen", type: "Restaurant", plan: "Starter", status: "active", joined: "2d ago", conversations: 567 },
  { name: "HealthPoint Clinic", type: "Clinic", plan: "Growth", status: "suspended", joined: "3d ago", conversations: 0 },
];

const SYSTEM_STATUS = [
  { service: "API Server", status: "operational", latency: "42ms" },
  { service: "WhatsApp Webhook", status: "operational", latency: "89ms" },
  { service: "M-Pesa Gateway", status: "operational", latency: "156ms" },
  { service: "AI Router", status: "operational", latency: "320ms" },
  { service: "PostgreSQL", status: "operational", latency: "8ms" },
  { service: "Redis Cache", status: "operational", latency: "2ms" },
];

export default function AdminOverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Admin Overview</h1>
        <p className="text-sm text-slate-500">Monday, June 8, 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map((k) => (
          <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.color}`}>
                <k.icon size={18} />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${k.up ? "text-emerald-400" : "text-red-400"}`}>
                {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {k.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{k.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4">MRR Growth (KSh)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "12px", color: "#e2e8f0" }} formatter={(v: number) => [`KSh ${v.toLocaleString()}`, "MRR"]} />
              <Area type="monotone" dataKey="mrr" stroke="#6366f1" strokeWidth={2} fill="url(#mrrGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4">AI Token Usage (this week)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={AI_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "12px", color: "#e2e8f0" }} />
              <Bar dataKey="haiku" fill="#6366f1" radius={[4,4,0,0]} name="Claude Haiku" />
              <Bar dataKey="sonnet" fill="#8b5cf6" radius={[4,4,0,0]} name="Claude Sonnet" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-brand-500" />Haiku</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-purple-500" />Sonnet</div>
          </div>
        </div>
      </div>

      {/* Recent tenants + System status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-200">Recent Tenants</h3>
            <a href="/admin/tenants" className="text-xs text-brand-400 hover:text-brand-300">View all →</a>
          </div>
          <div className="space-y-3">
            {RECENT_TENANTS.map((t) => (
              <div key={t.name} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">{t.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.type} · {t.conversations} conversations</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.plan === "Business" ? "bg-purple-900/50 text-purple-400" :
                    t.plan === "Growth" ? "bg-brand-900/50 text-brand-400" :
                    "bg-slate-700 text-slate-400"
                  }`}>{t.plan}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{t.joined}</p>
                </div>
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  t.status === "active" ? "bg-emerald-400" :
                  t.status === "trial" ? "bg-amber-400" :
                  "bg-red-500"
                }`} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4">System Status</h3>
          <div className="space-y-3">
            {SYSTEM_STATUS.map((s) => (
              <div key={s.service} className="flex items-center gap-3">
                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300">{s.service}</p>
                </div>
                <span className="text-xs text-slate-500 font-mono">{s.latency}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-800/40 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              <p className="text-xs text-emerald-400 font-medium">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
