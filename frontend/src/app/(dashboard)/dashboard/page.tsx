"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MessageSquare, ShoppingBag, Calendar, Brain,
  ArrowRight, Check, ChevronDown, TrendingUp, TrendingDown,
  Users, ShoppingCart, Zap, Package, CreditCard, Bot, Loader2
} from "lucide-react";
import { agentApi } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const CHART_DATA = [
  { name: "Mon", messages: 45, orders: 8, revenue: 12400 },
  { name: "Tue", messages: 62, orders: 12, revenue: 18600 },
  { name: "Wed", messages: 38, orders: 6, revenue: 9200 },
  { name: "Thu", messages: 91, orders: 19, revenue: 32500 },
  { name: "Fri", messages: 78, orders: 15, revenue: 27800 },
  { name: "Sat", messages: 105, orders: 23, revenue: 41200 },
  { name: "Sun", messages: 88, orders: 17, revenue: 31000 },
];

const QUICK_LINKS = [
  { label: "Messages", href: "/inbox", icon: MessageSquare, color: "bg-brand-50 text-brand-600" },
  { label: "Orders", href: "/orders", icon: ShoppingCart, color: "bg-emerald-50 text-emerald-600" },
  { label: "Products", href: "/products", icon: ShoppingBag, color: "bg-purple-50 text-purple-600" },
  { label: "Bookings", href: "/bookings", icon: Calendar, color: "bg-amber-50 text-amber-600" },
  { label: "AI Knowledge", href: "/knowledge", icon: Brain, color: "bg-rose-50 text-rose-600" },
  { label: "Customers", href: "/customers", icon: Users, color: "bg-blue-50 text-blue-600" },
];

const SETUP_STEPS = [
  { label: "Complete your business profile", href: "/knowledge/profile", done: false, sub: "Tell customers (and your AI) who you are." },
  { label: "Add your products or services", href: "/products", done: false, sub: "Add products so customers — and your AI — can sell them." },
  { label: "Connect WhatsApp", href: "/settings", done: false, sub: "Reply to customers and let your AI chat & sell on WhatsApp." },
  { label: "Connect Facebook & Instagram", href: "/settings", done: false, sub: "Manage Messenger & Instagram DMs in the same inbox." },
  { label: "Build your AI knowledge base", href: "/knowledge", done: false, sub: "Teach your AI about your business, FAQs & delivery so it answers like you." },
];

const STATS = [
  { label: "Messages Today", val: "127", change: "+18%", up: true, icon: MessageSquare, color: "text-brand-600 bg-brand-50" },
  { label: "Orders Today", val: "23", change: "+12%", up: true, icon: Package, color: "text-emerald-600 bg-emerald-50" },
  { label: "Revenue (KSh)", val: "45,200", change: "+8%", up: true, icon: CreditCard, color: "text-purple-600 bg-purple-50" },
  { label: "Active Customers", val: "89", change: "-3%", up: false, icon: Users, color: "text-amber-600 bg-amber-50" },
];

const RECENT_ACTIVITY = [
  { name: "Joyce Kamau", action: "Placed an order — 2x Black Dress", time: "2m ago", amount: "KSh 3,200", status: "new" },
  { name: "Peter Mwangi", action: "Paid via M-Pesa", time: "5m ago", amount: "KSh 5,800", status: "paid" },
  { name: "Sarah Wanjiru", action: "Asked about delivery to Westlands", time: "12m ago", amount: null, status: "chat" },
  { name: "James Ochieng", action: "Cancelled order #1045", time: "28m ago", amount: "KSh 1,500", status: "cancelled" },
  { name: "Faith Njeri", action: "Booked appointment — Friday 2pm", time: "1h ago", amount: null, status: "booked" },
];

export default function DashboardPage() {
  const completedSteps = SETUP_STEPS.filter((s) => s.done).length;
  const progressPct = Math.round((completedSteps / SETUP_STEPS.length) * 100);

  const [agentEnabled, setAgentEnabled] = useState<boolean | null>(null);
  const [togglingAgent, setTogglingAgent] = useState(false);

  useEffect(() => {
    agentApi.getStatus().then((r) => setAgentEnabled(r.enabled)).catch(() => setAgentEnabled(true));
  }, []);

  const handleAgentToggle = async () => {
    setTogglingAgent(true);
    try {
      const result = await agentApi.toggle();
      setAgentEnabled(result.enabled);
    } catch {
      // ignore
    } finally {
      setTogglingAgent(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Setup banner */}
      {completedSteps < SETUP_STEPS.length && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Let's get your workspace ready 🚀
                </h2>
                <p className="text-sm text-slate-500">
                  Welcome! Finish these steps so customers can find you and your AI agent can start selling.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">{progressPct}% done</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full mt-3 mb-4">
              <div
                className="h-2 bg-gradient-brand rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="divide-y divide-slate-50 px-5">
            {SETUP_STEPS.map((step, i) => (
              <details key={step.label} className="group py-3">
                <summary className="flex items-center gap-3 cursor-pointer list-none">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-xs ${
                    step.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 text-slate-400"
                  }`}>
                    {step.done ? <Check size={12} /> : i + 1}
                  </div>
                  <span className={`flex-1 text-sm font-medium ${step.done ? "text-slate-400 line-through" : "text-slate-800"}`}>
                    {step.label}
                  </span>
                  <ChevronDown size={16} className="text-slate-300 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-2 ml-9 text-sm text-slate-500">
                  <p className="mb-2">{step.sub}</p>
                  <Link href={step.href} className="inline-flex items-center gap-1 btn-primary text-xs px-3 py-1.5">
                    Edit profile <ArrowRight size={12} />
                  </Link>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? "text-emerald-600" : "text-red-500"}`}>
                {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}

        {/* AI Agent Status card */}
        <div className="card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${agentEnabled ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100"}`}>
              <Bot size={18} />
            </div>
            {agentEnabled !== null && (
              <span className={`text-xs font-medium flex items-center gap-1 ${agentEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${agentEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                {agentEnabled ? "Online" : "Offline"}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 mt-0.5 mb-2">AI Agent Status</p>
            <button
              onClick={handleAgentToggle}
              disabled={togglingAgent || agentEnabled === null}
              className={`w-full text-xs font-medium py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                agentEnabled
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
            >
              {togglingAgent ? (
                <Loader2 size={12} className="animate-spin" />
              ) : null}
              {agentEnabled === null ? "Loading..." : agentEnabled ? "Pause Agent" : "Resume Agent"}
            </button>
          </div>
        </div>
      </div>

      {/* Charts + Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Revenue this week</h3>
            <span className="text-xs text-slate-400">KSh</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }}
                formatter={(v: number) => [`KSh ${v.toLocaleString()}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick links */}
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl ${link.color} hover:scale-[1.03] transition-all duration-150`}
              >
                <link.icon size={20} />
                <span className="text-xs font-medium text-center">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Messages chart + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4">Messages vs Orders</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="messages" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-brand-500" />Messages</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500" />Orders</div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            <Link href="/inbox" className="text-xs text-brand-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item) => (
              <div key={item.name + item.time} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {item.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500 truncate">{item.action}</p>
                </div>
                <div className="text-right shrink-0">
                  {item.amount && <p className="text-sm font-semibold text-slate-900">{item.amount}</p>}
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  item.status === "new" ? "bg-brand-50 text-brand-700" :
                  item.status === "paid" ? "bg-emerald-50 text-emerald-700" :
                  item.status === "cancelled" ? "bg-red-50 text-red-600" :
                  item.status === "booked" ? "bg-amber-50 text-amber-700" :
                  "bg-slate-100 text-slate-500"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
