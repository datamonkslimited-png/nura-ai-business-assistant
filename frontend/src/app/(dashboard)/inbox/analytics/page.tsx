"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const FUNNEL_DATA = [
  { name: "Initiated Chat", value: 1240, fill: "#6366f1" },
  { name: "Engaged with AI", value: 980, fill: "#818cf8" },
  { name: "Showed Interest", value: 620, fill: "#a5b4fc" },
  { name: "Added to Cart", value: 340, fill: "#c7d2fe" },
  { name: "Completed Order", value: 218, fill: "#e0e7ff" },
];

const KEYWORDS = [
  { keyword: "price", count: 342, intent: "pricing" },
  { keyword: "delivery", count: 287, intent: "logistics" },
  { keyword: "available", count: 241, intent: "product" },
  { keyword: "size", count: 198, intent: "product" },
  { keyword: "pay", count: 156, intent: "payment" },
  { keyword: "discount", count: 134, intent: "pricing" },
  { keyword: "return", count: 89, intent: "support" },
  { keyword: "track", count: 67, intent: "logistics" },
];

const RESPONSE_TIME_DATA = [
  { range: "< 1min", count: 512 },
  { range: "1-3min", count: 234 },
  { range: "3-5min", count: 98 },
  { range: "5-10min", count: 45 },
  { range: "> 10min", count: 22 },
];

const INTENT_COLORS: Record<string, string> = {
  pricing: "bg-amber-100 text-amber-700",
  logistics: "bg-blue-100 text-blue-700",
  product: "bg-brand-100 text-brand-700",
  payment: "bg-emerald-100 text-emerald-700",
  support: "bg-red-100 text-red-700",
};

const PIE_DATA = [
  { name: "Resolved by AI", value: 76, color: "#6366f1" },
  { name: "Escalated", value: 14, color: "#f59e0b" },
  { name: "No response", value: 10, color: "#e2e8f0" },
];

export default function InboxAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Lead Analytics</h1>
        <p className="text-sm text-slate-500">Conversion funnel, keywords, and response performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Conversion Funnel</h2>
          <div className="space-y-2">
            {FUNNEL_DATA.map((stage, idx) => {
              const pct = Math.round((stage.value / FUNNEL_DATA[0].value) * 100);
              return (
                <div key={stage.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{stage.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{stage.value.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: stage.fill }} />
                  </div>
                  {idx < FUNNEL_DATA.length - 1 && (
                    <p className="text-xs text-slate-400 text-right mt-0.5">
                      {Math.round(((FUNNEL_DATA[idx + 1].value - stage.value) / stage.value) * 100)}% drop-off
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm">
            <span className="text-slate-500">Overall conversion</span>
            <span className="font-bold text-brand-700">{Math.round((FUNNEL_DATA[4].value / FUNNEL_DATA[0].value) * 100)}%</span>
          </div>
        </div>

        {/* Resolution Pie */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Conversation Resolution</h2>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {PIE_DATA.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{entry.value}%</p>
                    <p className="text-xs text-slate-500">{entry.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Keywords */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Top Keywords</h2>
        <div className="flex flex-wrap gap-2">
          {KEYWORDS.map((kw) => (
            <div key={kw.keyword} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <span className="text-sm font-semibold text-slate-800">&quot;{kw.keyword}&quot;</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${INTENT_COLORS[kw.intent]}`}>{kw.intent}</span>
              <span className="text-xs text-slate-400 font-medium">{kw.count}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* Response Time Distribution */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Response Time Distribution</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={RESPONSE_TIME_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Conversations" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 text-center mt-2">84% of conversations responded within 3 minutes</p>
      </div>
    </div>
  );
}
