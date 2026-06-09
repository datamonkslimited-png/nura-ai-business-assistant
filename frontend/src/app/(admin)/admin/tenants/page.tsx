"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Building2, MoreHorizontal } from "lucide-react";

interface Tenant {
  id: string;
  businessName: string;
  owner: string;
  email: string;
  plan: "Free" | "Starter" | "Growth" | "Enterprise";
  status: "active" | "inactive" | "suspended";
  mrr: number;
  created: string;
  city: string;
  messageCount: number;
}

const TENANTS: Tenant[] = [
  { id: "1", businessName: "Zawadi Boutique", owner: "Joyce Kamau", email: "joyce@zawadi.co.ke", plan: "Growth", status: "active", mrr: 9999, created: "Jan 12, 2025", city: "Nairobi", messageCount: 8420 },
  { id: "2", businessName: "Mama Mboga Express", owner: "Peter Mwangi", email: "peter@mamamboga.co.ke", plan: "Starter", status: "active", mrr: 4999, created: "Feb 3, 2025", city: "Nairobi", messageCount: 2310 },
  { id: "3", businessName: "Tech Hub Kenya", owner: "Sarah Wanjiru", email: "sarah@techhub.co.ke", plan: "Enterprise", status: "active", mrr: 25000, created: "Nov 8, 2024", city: "Nairobi", messageCount: 15600 },
  { id: "4", businessName: "Duka la Samaki", owner: "James Ochieng", email: "james@dukasamaki.co.ke", plan: "Free", status: "active", mrr: 0, created: "Jun 1, 2026", city: "Mombasa", messageCount: 120 },
  { id: "5", businessName: "Kisumu Fashions", owner: "Faith Njeri", email: "faith@kisumufashions.co.ke", plan: "Starter", status: "inactive", mrr: 4999, created: "Mar 22, 2025", city: "Kisumu", messageCount: 1840 },
  { id: "6", businessName: "Nairobi Supermart", owner: "David Otieno", email: "david@nairobisupermart.co.ke", plan: "Growth", status: "active", mrr: 9999, created: "Apr 5, 2025", city: "Nairobi", messageCount: 7230 },
  { id: "7", businessName: "Afya Plus Pharmacy", owner: "Grace Akinyi", email: "grace@afyaplus.co.ke", plan: "Starter", status: "active", mrr: 4999, created: "May 17, 2025", city: "Nairobi", messageCount: 3100 },
  { id: "8", businessName: "Mombasa Spice Co.", owner: "Samuel Kiprop", email: "samuel@mombspice.co.ke", plan: "Free", status: "suspended", mrr: 0, created: "Jan 30, 2025", city: "Mombasa", messageCount: 0 },
];

const PLAN_COLORS: Record<string, string> = {
  Free: "bg-slate-100 text-slate-600",
  Starter: "bg-brand-100 text-brand-700",
  Growth: "bg-emerald-100 text-emerald-700",
  Enterprise: "bg-purple-100 text-purple-700",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
  suspended: "bg-red-100 text-red-700",
};

export default function AdminTenantsPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");

  const filtered = TENANTS.filter(t =>
    (planFilter === "All" || t.plan === planFilter) &&
    (t.businessName.toLowerCase().includes(search.toLowerCase()) ||
      t.owner.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalMRR = TENANTS.reduce((s, t) => s + t.mrr, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Tenants</h1>
          <p className="text-sm text-slate-400">All businesses using NURA</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-2xl font-bold text-slate-100">{TENANTS.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Tenants</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-2xl font-bold text-emerald-400">{TENANTS.filter(t => t.status === "active").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-2xl font-bold text-slate-100">KSh {totalMRR.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total MRR</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-2xl font-bold text-amber-400">{TENANTS.filter(t => t.plan !== "Free").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Paying Customers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Search tenants..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {["All", "Free", "Starter", "Growth", "Enterprise"].map(p => (
            <button key={p} onClick={() => setPlanFilter(p)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${planFilter === p ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {p}
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">MRR</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Messages</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 size={14} className="text-slate-400" />
                      </div>
                      <div>
                        <Link href={`/admin/tenants/${tenant.id}`} className="text-sm font-semibold text-slate-100 hover:text-brand-400">{tenant.businessName}</Link>
                        <p className="text-xs text-slate-500">{tenant.owner} · {tenant.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[tenant.plan]}`}>{tenant.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[tenant.status]}`}>{tenant.status}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm font-semibold text-slate-300">
                    {tenant.mrr > 0 ? `KSh ${tenant.mrr.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-400">{tenant.messageCount.toLocaleString()}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-500">{tenant.created}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/tenants/${tenant.id}`} className="p-1.5 hover:bg-slate-700 rounded-lg inline-flex">
                      <MoreHorizontal size={15} className="text-slate-400" />
                    </Link>
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
