"use client";

import { useState } from "react";
import { Search, CreditCard, Calendar, CheckCircle, XCircle, Clock, MoreHorizontal } from "lucide-react";

const SUBSCRIPTIONS = [
  { id: "SUB-001", business: "Zawadi Boutique", owner: "Joyce Kamau", plan: "Growth", amount: 9999, status: "active", started: "Jan 12, 2025", nextBilling: "Jul 12, 2026", paymentMethod: "Visa •••• 4242" },
  { id: "SUB-002", business: "Mama Mboga Express", owner: "Peter Mwangi", plan: "Starter", amount: 4999, status: "active", started: "Feb 3, 2025", nextBilling: "Jul 3, 2026", paymentMethod: "M-Pesa" },
  { id: "SUB-003", business: "Tech Hub Kenya", owner: "Sarah Wanjiru", plan: "Enterprise", amount: 25000, status: "active", started: "Nov 8, 2024", nextBilling: "Jul 8, 2026", paymentMethod: "Bank Transfer" },
  { id: "SUB-004", business: "Nairobi Supermart", owner: "David Otieno", plan: "Growth", amount: 9999, status: "active", started: "Apr 5, 2025", nextBilling: "Jul 5, 2026", paymentMethod: "Visa •••• 1234" },
  { id: "SUB-005", business: "Kisumu Fashions", owner: "Faith Njeri", plan: "Starter", amount: 4999, status: "past-due", started: "Mar 22, 2025", nextBilling: "Jun 22, 2026", paymentMethod: "M-Pesa" },
  { id: "SUB-006", business: "Afya Plus Pharmacy", owner: "Grace Akinyi", plan: "Starter", amount: 4999, status: "active", started: "May 17, 2025", nextBilling: "Jul 17, 2026", paymentMethod: "Visa •••• 5678" },
  { id: "SUB-007", business: "Mombasa Spice Co.", owner: "Samuel Kiprop", plan: "Free", amount: 0, status: "cancelled", started: "Jan 30, 2025", nextBilling: "—", paymentMethod: "—" },
];

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-emerald-900 text-emerald-400", icon: CheckCircle },
  "past-due": { label: "Past Due", color: "bg-red-900 text-red-400", icon: XCircle },
  cancelled: { label: "Cancelled", color: "bg-slate-800 text-slate-400", icon: XCircle },
  trialing: { label: "Trial", color: "bg-amber-900 text-amber-400", icon: Clock },
};

const PLAN_COLORS: Record<string, string> = {
  Free: "bg-slate-700 text-slate-300",
  Starter: "bg-brand-900 text-brand-300",
  Growth: "bg-emerald-900 text-emerald-300",
  Enterprise: "bg-purple-900 text-purple-300",
};

export default function AdminSubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = SUBSCRIPTIONS.filter(s =>
    (statusFilter === "all" || s.status === statusFilter) &&
    (s.business.toLowerCase().includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase()))
  );

  const totalMRR = SUBSCRIPTIONS.filter(s => s.status === "active").reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Subscription Management</h1>
        <p className="text-sm text-slate-400">All tenant subscriptions and billing status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-2xl font-bold text-slate-100">{SUBSCRIPTIONS.filter(s => s.status === "active").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active Subs</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-2xl font-bold text-emerald-400">KSh {totalMRR.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active MRR</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-2xl font-bold text-red-400">{SUBSCRIPTIONS.filter(s => s.status === "past-due").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Past Due</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-2xl font-bold text-slate-400">{SUBSCRIPTIONS.filter(s => s.status === "cancelled").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Cancelled</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Search subscriptions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {["all", "active", "past-due", "cancelled"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {s === "past-due" ? "Past Due" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Business</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Next Billing</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((sub) => {
                const cfg = STATUS_CONFIG[sub.status as keyof typeof STATUS_CONFIG];
                return (
                  <tr key={sub.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-100">{sub.business}</p>
                      <p className="text-xs text-slate-500">{sub.owner} · {sub.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[sub.plan]}`}>{sub.plan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                        <cfg.icon size={11} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sm font-semibold text-slate-300">
                      {sub.amount > 0 ? `KSh ${sub.amount.toLocaleString()}/mo` : "Free"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <CreditCard size={12} /> {sub.paymentMethod}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar size={12} /> {sub.nextBilling}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 hover:bg-slate-700 rounded-lg">
                        <MoreHorizontal size={15} className="text-slate-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
