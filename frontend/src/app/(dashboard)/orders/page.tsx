"use client";

import { useState } from "react";
import { Search, Download, Copy, Package, TrendingUp, CreditCard, Truck } from "lucide-react";

const ORDERS = [
  {
    id: "#ORD-1048", customer: "Joyce Kamau", phone: "+254712345678",
    product: "Black Elegance Dress x1", amount: 3200, status: "needs_calling",
    date: "Today, 10:25 AM", channel: "whatsapp"
  },
  {
    id: "#ORD-1047", customer: "Peter Mwangi", phone: "+254723456789",
    product: "Gold Necklace Set x1", amount: 4500, status: "confirmed",
    date: "Today, 09:50 AM", channel: "whatsapp"
  },
  {
    id: "#ORD-1046", customer: "Sarah Wanjiru", phone: "+254734567890",
    product: "Red Evening Gown x1", amount: 5800, status: "dispatched",
    date: "Yesterday, 3:20 PM", channel: "facebook"
  },
  {
    id: "#ORD-1045", customer: "James Ochieng", phone: "+254745678901",
    product: "Blue Denim Jeans x2", amount: 5000, status: "cancelled",
    date: "Yesterday, 11:05 AM", channel: "whatsapp"
  },
  {
    id: "#ORD-1044", customer: "Faith Njeri", phone: "+254756789012",
    product: "White Casual Blouse x1", amount: 1800, status: "completed",
    date: "Jun 3, 2026, 4:30 PM", channel: "instagram"
  },
  {
    id: "#ORD-1043", customer: "David Kimani", phone: "+254767890123",
    product: "Black Elegance Dress x2", amount: 6400, status: "awaiting_payment",
    date: "Jun 3, 2026, 2:15 PM", channel: "whatsapp"
  },
];

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  needs_calling: { label: "Needs Calling", class: "badge-yellow" },
  confirmed: { label: "Confirmed", class: "badge-blue" },
  dispatched: { label: "Dispatched", class: "badge-purple" },
  awaiting_payment: { label: "Awaiting Payment", class: "badge-yellow" },
  completed: { label: "Completed", class: "badge-green" },
  cancelled: { label: "Cancelled", class: "badge-red" },
};

const FILTERS = ["All Orders", "Needs Calling", "Confirmed", "Dispatched", "Awaiting Payment", "Completed", "Cancelled"];

export default function OrdersPage() {
  const [filter, setFilter] = useState("All Orders");
  const [search, setSearch] = useState("");

  const filtered = ORDERS.filter((o) => {
    const matchFilter = filter === "All Orders" ||
      STATUS_CONFIG[o.status]?.label === filter;
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search);
    return matchFilter && matchSearch;
  });

  const stats = [
    { label: "Total", val: ORDERS.length, icon: Package, color: "text-brand-600 bg-brand-50" },
    { label: "Confirmed", val: ORDERS.filter(o => o.status === "confirmed").length, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
    { label: "Revenue (KSh)", val: ORDERS.filter(o => o.status === "completed").reduce((a,o) => a+o.amount, 0).toLocaleString(), icon: CreditCard, color: "text-purple-600 bg-purple-50" },
    { label: "Delivered", val: ORDERS.filter(o => o.status === "completed").length, icon: Truck, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
              <s.icon size={16} />
            </div>
            <p className="text-xl font-bold text-slate-900">{s.val}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              filter === f ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone or order number..."
              className="input-field pl-9 py-2 text-sm"
            />
          </div>
          <button className="btn-secondary py-2 text-sm gap-1.5">
            <Copy size={14} /> Copy All
          </button>
          <button className="btn-secondary py-2 text-sm gap-1.5">
            <Download size={14} /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Order", "Customer", "Product", "Amount", "Channel", "Date", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-brand-600">{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{order.customer}</p>
                    <p className="text-xs text-slate-400">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-[160px] truncate">{order.product}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">KSh {order.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium capitalize">
                      {order.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{order.date}</td>
                  <td className="px-4 py-3">
                    <span className={`${STATUS_CONFIG[order.status]?.class} text-xs`}>
                      {STATUS_CONFIG[order.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-brand-600 hover:underline font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <Package size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
