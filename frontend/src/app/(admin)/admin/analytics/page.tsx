"use client";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

const MRR_DATA = [
  { month: "Dec 25", mrr: 42000, customers: 18 },
  { month: "Jan 26", mrr: 58000, customers: 24 },
  { month: "Feb 26", mrr: 71000, customers: 29 },
  { month: "Mar 26", mrr: 85000, customers: 35 },
  { month: "Apr 26", mrr: 98000, customers: 41 },
  { month: "May 26", mrr: 115000, customers: 48 },
  { month: "Jun 26", mrr: 133000, customers: 54 },
];

const PLAN_DATA = [
  { plan: "Free", count: 28, color: "#64748b" },
  { plan: "Starter", count: 18, color: "#6366f1" },
  { plan: "Growth", count: 6, color: "#10b981" },
  { plan: "Enterprise", count: 2, color: "#8b5cf6" },
];

const CHURN_DATA = [
  { month: "Jan", churn: 2.1 },
  { month: "Feb", churn: 1.8 },
  { month: "Mar", churn: 2.4 },
  { month: "Apr", churn: 1.5 },
  { month: "May", churn: 1.2 },
  { month: "Jun", churn: 1.0 },
];

const GROWTH_METRICS = [
  { label: "MRR", value: "KSh 133,000", change: "+15.7%", positive: true },
  { label: "ARR", value: "KSh 1.6M", change: "+15.7%", positive: true },
  { label: "Paying Customers", value: "26", change: "+12.5%", positive: true },
  { label: "Avg. Revenue / User", value: "KSh 5,115", change: "+2.8%", positive: true },
  { label: "Churn Rate", value: "1.0%", change: "-0.2%", positive: true },
  { label: "Customer LTV", value: "KSh 48,200", change: "+8%", positive: true },
];

export default function AdminAnalyticsPage() {
  const currentMRR = MRR_DATA[MRR_DATA.length - 1].mrr;
  const prevMRR = MRR_DATA[MRR_DATA.length - 2].mrr;
  const mrrGrowth = (((currentMRR - prevMRR) / prevMRR) * 100).toFixed(1);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Revenue Analytics</h1>
        <p className="text-sm text-slate-400">MRR, ARR, churn, and growth metrics</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {GROWTH_METRICS.map((m) => (
          <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-500 mb-1">{m.label}</p>
            <p className="text-xl font-bold text-slate-100">{m.value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${m.positive ? "text-emerald-400" : "text-red-400"}`}>
              {m.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {m.change} vs last month
            </div>
          </div>
        ))}
      </div>

      {/* MRR Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-300">Monthly Recurring Revenue</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-100">KSh {currentMRR.toLocaleString()}</span>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                <ArrowUpRight size={12} />+{mrrGrowth}%
              </span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={MRR_DATA} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #1e293b", background: "#0f172a", color: "#cbd5e1", fontSize: 12 }} formatter={(v: number) => `KSh ${v.toLocaleString()}`} />
            <Area type="monotone" dataKey="mrr" stroke="#6366f1" strokeWidth={2.5} fill="url(#mrrGrad)" name="MRR" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Plan Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Customers by Plan</h2>
          <div className="space-y-3">
            {PLAN_DATA.map((p) => {
              const total = PLAN_DATA.reduce((s, x) => s + x.count, 0);
              const pct = Math.round((p.count / total) * 100);
              return (
                <div key={p.plan}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>{p.plan}</span>
                    <span className="font-semibold">{p.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Churn Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Monthly Churn Rate</h2>
            <p className="text-3xl font-bold text-emerald-400 mt-1">1.0%</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingDown size={11} /> Down 0.2% from last month
            </p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={CHURN_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 4]} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #1e293b", background: "#0f172a", color: "#cbd5e1", fontSize: 12 }} formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="churn" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} name="Churn Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
