"use client";

import { useState } from "react";
import { Search, GitBranch, DollarSign, Users, MoreHorizontal, TrendingUp } from "lucide-react";

interface ReferralAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  referrals: number;
  activeReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  commissionRate: number;
  joined: string;
  lastReferral: string;
}

const AGENTS: ReferralAgent[] = [
  { id: "1", name: "Michael Kamau", email: "michael@affil.co.ke", phone: "+254 712 100 001", status: "active", referrals: 24, activeReferrals: 18, totalCommission: 87500, pendingCommission: 12500, commissionRate: 15, joined: "Jan 2025", lastReferral: "3 days ago" },
  { id: "2", name: "Caroline Wanjiku", email: "caroline@biz.co.ke", phone: "+254 723 200 002", status: "active", referrals: 15, activeReferrals: 11, totalCommission: 54200, pendingCommission: 8700, commissionRate: 15, joined: "Mar 2025", lastReferral: "1 week ago" },
  { id: "3", name: "John Odhiambo", email: "john.o@partner.co.ke", phone: "+254 734 300 003", status: "active", referrals: 31, activeReferrals: 22, totalCommission: 112000, pendingCommission: 18500, commissionRate: 20, joined: "Oct 2024", lastReferral: "Yesterday" },
  { id: "4", name: "Agnes Muthoni", email: "agnes@sales.co.ke", phone: "+254 745 400 004", status: "inactive", referrals: 7, activeReferrals: 4, totalCommission: 22400, pendingCommission: 0, commissionRate: 15, joined: "Jun 2025", lastReferral: "2 months ago" },
  { id: "5", name: "Dennis Kipchirchir", email: "dennis@partner.co.ke", phone: "+254 756 500 005", status: "active", referrals: 19, activeReferrals: 14, totalCommission: 68700, pendingCommission: 9400, commissionRate: 15, joined: "Feb 2025", lastReferral: "5 days ago" },
];

export default function AdminReferralsPage() {
  const [search, setSearch] = useState("");
  const filtered = AGENTS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = AGENTS.reduce((s, a) => s + a.totalCommission, 0);
  const totalPending = AGENTS.reduce((s, a) => s + a.pendingCommission, 0);
  const totalReferrals = AGENTS.reduce((s, a) => s + a.referrals, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Referral Agents</h1>
        <p className="text-sm text-slate-400">Manage referral partners and commission payouts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Agents", value: String(AGENTS.length), icon: Users, color: "text-brand-400" },
          { label: "Total Referrals", value: String(totalReferrals), icon: GitBranch, color: "text-emerald-400" },
          { label: "Total Commissions Paid", value: `KSh ${totalPaid.toLocaleString()}`, icon: DollarSign, color: "text-amber-400" },
          { label: "Pending Payouts", value: `KSh ${totalPending.toLocaleString()}`, icon: TrendingUp, color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <stat.icon size={16} className={`${stat.color} mb-2`} />
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Search agents..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Agent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Referrals</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Commission Rate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Total Earned</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Pending</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden xl:table-cell">Last Referral</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-800 rounded-full flex items-center justify-center text-brand-300 text-xs font-bold shrink-0">
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{agent.name}</p>
                        <p className="text-xs text-slate-500">{agent.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${agent.status === "active" ? "bg-emerald-900 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{agent.referrals}</p>
                      <p className="text-xs text-slate-500">{agent.activeReferrals} active</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm font-bold text-amber-400">{agent.commissionRate}%</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm font-semibold text-emerald-400">
                    KSh {agent.totalCommission.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {agent.pendingCommission > 0 ? (
                      <div>
                        <p className="text-sm font-semibold text-amber-400">KSh {agent.pendingCommission.toLocaleString()}</p>
                        <button className="text-xs text-brand-400 hover:underline mt-0.5">Pay Out</button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">Paid out</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-xs text-slate-400">{agent.lastReferral}</td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 hover:bg-slate-700 rounded-lg">
                      <MoreHorizontal size={15} className="text-slate-400" />
                    </button>
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
