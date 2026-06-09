"use client";

import { useState } from "react";
import { Search, Plus, HelpCircle, Clock, CheckCircle, AlertCircle, MoreHorizontal, User } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  customer: string;
  phone: string;
  status: "open" | "pending" | "resolved";
  priority: "high" | "medium" | "low";
  created: string;
  lastUpdate: string;
  assignee: string;
}

const TICKETS: Ticket[] = [
  { id: "TKT-001", subject: "Received wrong size item", customer: "Joyce Kamau", phone: "+254 712 345 678", status: "open", priority: "high", created: "Jun 8, 2026", lastUpdate: "2 hours ago", assignee: "Amina Hassan" },
  { id: "TKT-002", subject: "M-Pesa payment not confirmed", customer: "Peter Mwangi", phone: "+254 723 456 789", status: "open", priority: "high", created: "Jun 8, 2026", lastUpdate: "5 hours ago", assignee: "David Otieno" },
  { id: "TKT-003", subject: "Delivery delayed for 3 days", customer: "Sarah Wanjiru", phone: "+254 734 567 890", status: "pending", priority: "medium", created: "Jun 7, 2026", lastUpdate: "1 day ago", assignee: "David Otieno" },
  { id: "TKT-004", subject: "Request for bulk order quotation", customer: "Faith Njeri", phone: "+254 756 789 012", status: "pending", priority: "low", created: "Jun 6, 2026", lastUpdate: "2 days ago", assignee: "Amina Hassan" },
  { id: "TKT-005", subject: "Product doesn't match description", customer: "James Ochieng", phone: "+254 745 678 901", status: "resolved", priority: "medium", created: "Jun 4, 2026", lastUpdate: "3 days ago", assignee: "Grace Akinyi" },
  { id: "TKT-006", subject: "Asking about exchange policy", customer: "Grace Akinyi", phone: "+254 778 901 234", status: "resolved", priority: "low", created: "Jun 2, 2026", lastUpdate: "5 days ago", assignee: "Amina Hassan" },
];

const STATUS_CONFIG = {
  open: { label: "Open", color: "bg-red-100 text-red-700", icon: AlertCircle },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
};

const PRIORITY_COLORS = {
  high: "bg-red-50 text-red-600 border-red-100",
  medium: "bg-amber-50 text-amber-600 border-amber-100",
  low: "bg-slate-50 text-slate-500 border-slate-100",
};

export default function SupportTicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "pending" | "resolved">("all");

  const filtered = TICKETS.filter(t =>
    (statusFilter === "all" || t.status === statusFilter) &&
    (t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.customer.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Support Tickets</h1>
          <p className="text-sm text-slate-500">Track and resolve customer support issues</p>
        </div>
        <button className="btn-primary text-sm gap-1.5">
          <Plus size={15} /> New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(["open", "pending", "resolved"] as const).map((status) => {
          const count = TICKETS.filter(t => t.status === status).length;
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={status} className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(status)}>
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full mb-2 ${cfg.color}`}>
                <cfg.icon size={12} /> {cfg.label}
              </div>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-xs text-slate-400">tickets</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input-field pl-9 py-2 text-sm w-full" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1">
            {(["all", "open", "pending", "resolved"] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Ticket</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Last Update</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((ticket) => {
                const cfg = STATUS_CONFIG[ticket.status];
                return (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <HelpCircle size={15} className="text-slate-300 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-800 line-clamp-1">{ticket.subject}</p>
                          <p className="text-xs text-slate-400">{ticket.id} · {ticket.created}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center">
                          <User size={13} className="text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-700">{ticket.customer}</p>
                          <p className="text-xs text-slate-400">{ticket.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                        <cfg.icon size={11} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-600">{ticket.assignee}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-400">{ticket.lastUpdate}</td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg">
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
