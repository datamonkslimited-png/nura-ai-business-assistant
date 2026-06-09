"use client";

import { useState } from "react";
import { Search, Filter, Package, ChevronDown, Eye } from "lucide-react";

const ORDERS = [
  { id: "ORD-2847", customer: "Joyce Kamau", phone: "+254 712 345 678", items: "Blue Linen Dress, White Sneakers", amount: 8500, status: "delivered", date: "Jun 5, 2026", channel: "WhatsApp" },
  { id: "ORD-2846", customer: "Peter Mwangi", phone: "+254 723 456 789", items: "Summer Blouse (x2)", amount: 3200, status: "in-transit", date: "Jun 5, 2026", channel: "WhatsApp" },
  { id: "ORD-2845", customer: "Sarah Wanjiru", phone: "+254 734 567 890", items: "Black Trousers, Belt", amount: 5600, status: "processing", date: "Jun 4, 2026", channel: "Facebook" },
  { id: "ORD-2844", customer: "James Ochieng", phone: "+254 745 678 901", items: "Formal Suit", amount: 12800, status: "pending-payment", date: "Jun 4, 2026", channel: "WhatsApp" },
  { id: "ORD-2843", customer: "Faith Njeri", phone: "+254 756 789 012", items: "Floral Maxi Dress (x3)", amount: 12600, status: "delivered", date: "Jun 3, 2026", channel: "WhatsApp" },
  { id: "ORD-2842", customer: "David Otieno", phone: "+254 767 890 123", items: "Denim Jacket, Jeans", amount: 7200, status: "delivered", date: "Jun 2, 2026", channel: "WhatsApp" },
  { id: "ORD-2841", customer: "Grace Akinyi", phone: "+254 778 901 234", items: "Evening Gown", amount: 15000, status: "cancelled", date: "Jun 1, 2026", channel: "Instagram" },
  { id: "ORD-2840", customer: "Samuel Kiprop", phone: "+254 789 012 345", items: "T-Shirt (x5), Shorts", amount: 4500, status: "returned", date: "May 31, 2026", channel: "WhatsApp" },
];

const STATUS_COLORS: Record<string, string> = {
  delivered: "bg-emerald-100 text-emerald-700",
  "in-transit": "bg-blue-100 text-blue-700",
  processing: "bg-brand-100 text-brand-700",
  "pending-payment": "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  delivered: "Delivered",
  "in-transit": "In Transit",
  processing: "Processing",
  "pending-payment": "Pending Payment",
  cancelled: "Cancelled",
  returned: "Returned",
};

const ALL_STATUSES = ["all", ...Object.keys(STATUS_LABELS)];

export default function OrdersListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = ORDERS.filter(o =>
    (statusFilter === "all" || o.status === statusFilter) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: ORDERS.length,
    delivered: ORDERS.filter(o => o.status === "delivered").length,
    pending: ORDERS.filter(o => o.status === "processing" || o.status === "in-transit").length,
    revenue: ORDERS.filter(o => o.status !== "cancelled" && o.status !== "returned").reduce((s, o) => s + o.amount, 0),
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Orders List</h1>
        <p className="text-sm text-slate-500">Detailed view of all orders with filters</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Orders</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-emerald-600">{stats.delivered}</p>
          <p className="text-xs text-slate-500 mt-0.5">Delivered</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-brand-600">{stats.pending}</p>
          <p className="text-xs text-slate-500 mt-0.5">In Progress</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">KSh {stats.revenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">Revenue</p>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input-field pl-9 py-2 text-sm" placeholder="Search by order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-slate-400" />
            <select className="input-field py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{s === "all" ? "All Statuses" : STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Channel</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{order.id}</p>
                        <p className="text-xs text-slate-400">{order.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm text-slate-700">{order.customer}</p>
                    <p className="text-xs text-slate-400">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-slate-600 max-w-[200px]">
                    <p className="truncate">{order.items}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">KSh {order.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500">{order.channel}</td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg">
                      <Eye size={14} className="text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
          Showing {filtered.length} of {ORDERS.length} orders
        </div>
      </div>
    </div>
  );
}
