"use client";

import { useState } from "react";
import { Search, Filter, Download, Plus, MoreHorizontal, Phone, MessageSquare, ShoppingCart, Clock } from "lucide-react";

const CUSTOMERS = [
  { id: "1", name: "Joyce Kamau", phone: "+254 712 345 678", totalOrders: 12, totalSpent: 45200, lastSeen: "2m ago", status: "active", tag: "VIP" },
  { id: "2", name: "Peter Mwangi", phone: "+254 723 456 789", totalOrders: 7, totalSpent: 28600, lastSeen: "1h ago", status: "active", tag: null },
  { id: "3", name: "Sarah Wanjiru", phone: "+254 734 567 890", totalOrders: 3, totalSpent: 9400, lastSeen: "3h ago", status: "active", tag: null },
  { id: "4", name: "James Ochieng", phone: "+254 745 678 901", totalOrders: 1, totalSpent: 1500, lastSeen: "2d ago", status: "inactive", tag: null },
  { id: "5", name: "Faith Njeri", phone: "+254 756 789 012", totalOrders: 9, totalSpent: 31800, lastSeen: "5m ago", status: "active", tag: "Regular" },
  { id: "6", name: "David Otieno", phone: "+254 767 890 123", totalOrders: 4, totalSpent: 14200, lastSeen: "1d ago", status: "active", tag: null },
  { id: "7", name: "Grace Akinyi", phone: "+254 778 901 234", totalOrders: 15, totalSpent: 67500, lastSeen: "30m ago", status: "active", tag: "VIP" },
  { id: "8", name: "Samuel Kiprop", phone: "+254 789 012 345", totalOrders: 2, totalSpent: 5600, lastSeen: "1w ago", status: "inactive", tag: null },
];

const STATS = [
  { label: "Total Customers", value: "1,247", change: "+12% this month" },
  { label: "Active This Week", value: "389", change: "+8% vs last week" },
  { label: "Avg. Order Value", value: "KSh 3,200", change: "+5% this month" },
  { label: "Repeat Customers", value: "68%", change: "+3% this month" },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const filtered = CUSTOMERS.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage your customer relationships</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="card">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">{s.change}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 focus:bg-white transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
            <Download size={16} /> Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Orders</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spent</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Last Seen</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-brand rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {customer.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                        {customer.tag && (
                          <span className="text-xs px-1.5 py-0.5 bg-brand-50 text-brand-700 rounded font-medium">{customer.tag}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-slate-600">{customer.phone}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="text-sm font-medium text-slate-700">{customer.totalOrders}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-slate-900">KSh {customer.totalSpent.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-1 text-slate-500 text-xs">
                      <Clock size={12} />
                      {customer.lastSeen}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      customer.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition-colors" title="Message">
                        <MessageSquare size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors" title="Call">
                        <Phone size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="View orders">
                        <ShoppingCart size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {filtered.length} of {CUSTOMERS.length} customers</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
