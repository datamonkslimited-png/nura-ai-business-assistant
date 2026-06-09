"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Users, MessageSquare, Bot, CreditCard, Activity } from "lucide-react";

const TENANT_DATA: Record<string, {
  id: string; businessName: string; owner: string; email: string; phone: string; plan: string;
  status: string; mrr: number; created: string; city: string; messageCount: number; aiCalls: number;
  users: { name: string; email: string; role: string; lastActive: string }[];
}> = {
  "1": {
    id: "1", businessName: "Zawadi Boutique", owner: "Joyce Kamau", email: "joyce@zawadi.co.ke",
    phone: "+254 712 345 678", plan: "Growth", status: "active", mrr: 9999,
    created: "Jan 12, 2025", city: "Nairobi", messageCount: 8420, aiCalls: 6540,
    users: [
      { name: "Joyce Kamau", email: "joyce@zawadi.co.ke", role: "Owner", lastActive: "2h ago" },
      { name: "Amina Hassan", email: "amina@zawadi.co.ke", role: "Manager", lastActive: "1d ago" },
    ],
  },
  "3": {
    id: "3", businessName: "Tech Hub Kenya", owner: "Sarah Wanjiru", email: "sarah@techhub.co.ke",
    phone: "+254 734 567 890", plan: "Enterprise", status: "active", mrr: 25000,
    created: "Nov 8, 2024", city: "Nairobi", messageCount: 15600, aiCalls: 12400,
    users: [
      { name: "Sarah Wanjiru", email: "sarah@techhub.co.ke", role: "Owner", lastActive: "30m ago" },
      { name: "David Otieno", email: "david@techhub.co.ke", role: "Admin", lastActive: "3h ago" },
      { name: "Peter Kamau", email: "peter@techhub.co.ke", role: "Staff", lastActive: "2d ago" },
    ],
  },
};

const FALLBACK = TENANT_DATA["1"];

export default function TenantDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const tenant = TENANT_DATA[id] ?? { ...FALLBACK, id };

  const PLAN_COLORS: Record<string, string> = {
    Free: "bg-slate-700 text-slate-300",
    Starter: "bg-brand-800 text-brand-300",
    Growth: "bg-emerald-800 text-emerald-300",
    Enterprise: "bg-purple-800 text-purple-300",
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Link href="/admin/tenants" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-400 font-medium">
        <ArrowLeft size={16} /> Back to Tenants
      </Link>

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center">
              <Building2 size={24} className="text-slate-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-100">{tenant.businessName}</h1>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${PLAN_COLORS[tenant.plan] ?? "bg-slate-700 text-slate-300"}`}>{tenant.plan}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tenant.status === "active" ? "bg-emerald-900 text-emerald-400" : "bg-red-900 text-red-400"}`}>{tenant.status}</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{tenant.owner} · {tenant.email} · {tenant.phone}</p>
              <p className="text-xs text-slate-500 mt-0.5">{tenant.city} · Joined {tenant.created}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-red-900 text-red-400 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-800 transition-colors">Suspend</button>
            <button className="bg-brand-700 text-brand-200 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-brand-600 transition-colors">Manage Plan</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-800">
          {[
            { label: "Monthly Revenue", value: `KSh ${tenant.mrr.toLocaleString()}`, icon: CreditCard, color: "text-emerald-400" },
            { label: "Total Messages", value: tenant.messageCount.toLocaleString(), icon: MessageSquare, color: "text-brand-400" },
            { label: "AI Calls", value: tenant.aiCalls.toLocaleString(), icon: Bot, color: "text-purple-400" },
            { label: "Team Members", value: String(tenant.users.length), icon: Users, color: "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="flex items-center gap-2">
                <stat.icon size={14} className={stat.color} />
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
              <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-slate-800">
            <Users size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-300">Team Members</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {tenant.users.map((user) => (
              <div key={user.email} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-300">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{user.role}</span>
                  <p className="text-xs text-slate-600 mt-0.5">{user.lastActive}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-300">Subscription Details</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Plan", value: tenant.plan },
              { label: "Monthly Revenue", value: tenant.mrr > 0 ? `KSh ${tenant.mrr.toLocaleString()}` : "Free" },
              { label: "Billing Cycle", value: "Monthly" },
              { label: "Next Billing", value: "Jul 8, 2026" },
              { label: "Payment Method", value: "Visa •••• 4242" },
              { label: "Account Created", value: tenant.created },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-slate-500">{row.label}</span>
                <span className="text-slate-300 font-medium">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Usage This Month</h3>
            {[
              { label: "Messages", used: tenant.messageCount > 10000 ? 9800 : Math.min(tenant.messageCount, 2800), limit: tenant.plan === "Growth" ? 10000 : tenant.plan === "Starter" ? 3000 : 500, color: "bg-brand-500" },
              { label: "AI Calls", used: tenant.aiCalls > 5000 ? 4800 : Math.min(tenant.aiCalls, 980), limit: tenant.plan === "Growth" ? 5000 : tenant.plan === "Starter" ? 1000 : 100, color: "bg-purple-500" },
            ].map((usage) => {
              const pct = Math.min(100, Math.round((usage.used / usage.limit) * 100));
              return (
                <div key={usage.label} className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{usage.label}</span>
                    <span>{usage.used.toLocaleString()} / {usage.limit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${usage.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
