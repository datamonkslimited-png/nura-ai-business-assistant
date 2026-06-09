"use client";

import { MessageSquare, TrendingUp, Clock, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CHART_DATA = [
  { date: "Jun 1", messages: 38, ai: 32 },
  { date: "Jun 2", messages: 52, ai: 44 },
  { date: "Jun 3", messages: 45, ai: 38 },
  { date: "Jun 4", messages: 61, ai: 55 },
  { date: "Jun 5", messages: 74, ai: 67 },
  { date: "Jun 6", messages: 58, ai: 50 },
  { date: "Jun 7", messages: 90, ai: 82 },
  { date: "Jun 8", messages: 47, ai: 41 },
];

const STATS = [
  { label: "Total Messages", value: "465", change: "+18%", positive: true, icon: MessageSquare, color: "text-brand-600", bg: "bg-brand-50" },
  { label: "Response Rate", value: "94%", change: "+2%", positive: true, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg. Response Time", value: "1.8 min", change: "-12%", positive: true, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Unread Messages", value: "12", change: "+3", positive: false, icon: Eye, color: "text-red-600", bg: "bg-red-50" },
];

const CHANNEL_DATA = [
  { channel: "WhatsApp", messages: 382, rate: 95, color: "bg-[#25D366]" },
  { channel: "Facebook Messenger", messages: 56, rate: 91, color: "bg-[#1877F2]" },
  { channel: "Instagram DMs", messages: 27, rate: 88, color: "bg-pink-500" },
];

export default function InboxOverviewPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Inbox Overview</h1>
        <p className="text-sm text-slate-500">Messages and response analytics for this week</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.bg}`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${stat.positive ? "text-emerald-600" : "text-red-500"}`}>
              {stat.positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {stat.change} vs last week
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800">Messages Over Time</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-500 inline-block" />Total Messages</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />AI Handled</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="messages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
            <Area type="monotone" dataKey="messages" stroke="#6366f1" strokeWidth={2} fill="url(#messages)" name="Total Messages" />
            <Area type="monotone" dataKey="ai" stroke="#34d399" strokeWidth={2} fill="url(#ai)" name="AI Handled" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CHANNEL_DATA.map((ch) => (
          <div key={ch.channel} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${ch.color}`} />
              <p className="text-sm font-semibold text-slate-800">{ch.channel}</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{ch.messages}</p>
            <p className="text-xs text-slate-500">messages this week</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Response rate</span>
                <span className="font-semibold text-emerald-600">{ch.rate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${ch.rate}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
