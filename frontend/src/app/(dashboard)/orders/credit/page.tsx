"use client";

import { useState } from "react";
import { CreditCard, AlertCircle, CheckCircle, Clock, MessageSquare } from "lucide-react";

const CREDIT_ORDERS = [
  { id: "ORD-2844", customer: "James Ochieng", phone: "+254 745 678 901", amount: 12800, paid: 0, dueDate: "Jun 15, 2026", status: "overdue", items: "Formal Suit", daysPending: 4 },
  { id: "ORD-2839", customer: "Mary Wangari", phone: "+254 712 111 999", amount: 18500, paid: 9250, dueDate: "Jun 20, 2026", status: "partial", items: "Bridesmaid Dresses (x4)", daysPending: 9 },
  { id: "ORD-2831", customer: "John Kamau", phone: "+254 723 888 777", amount: 6200, paid: 0, dueDate: "Jun 22, 2026", status: "pending", items: "Corporate Shirts (x8)", daysPending: 12 },
  { id: "ORD-2825", customer: "Ann Njoroge", phone: "+254 734 777 666", amount: 3500, paid: 3500, dueDate: "Jun 8, 2026", status: "paid", items: "Casual Dress, Accessories", daysPending: 0 },
  { id: "ORD-2820", customer: "Kevin Oduya", phone: "+254 756 666 555", amount: 9800, paid: 4900, dueDate: "Jun 25, 2026", status: "partial", items: "Event Outfits (x3)", daysPending: 16 },
];

const STATUS_CONFIG = {
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
  partial: { label: "Partial Payment", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  pending: { label: "Pending", color: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
};

export default function CreditOrdersPage() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? CREDIT_ORDERS : CREDIT_ORDERS.filter(o => o.status === filter);

  const totalOutstanding = CREDIT_ORDERS.filter(o => o.status !== "paid").reduce((s, o) => s + (o.amount - o.paid), 0);
  const overdue = CREDIT_ORDERS.filter(o => o.status === "overdue").length;
  const partialCount = CREDIT_ORDERS.filter(o => o.status === "partial").length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Credit Orders</h1>
        <p className="text-sm text-slate-500">Orders with pending or partial payment</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card border-amber-200">
          <p className="text-2xl font-bold text-amber-600">KSh {totalOutstanding.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">Outstanding Balance</p>
        </div>
        <div className="card border-red-200">
          <p className="text-2xl font-bold text-red-600">{overdue}</p>
          <p className="text-xs text-slate-500 mt-0.5">Overdue</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-amber-500">{partialCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Partial Payments</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-emerald-600">{CREDIT_ORDERS.filter(o => o.status === "paid").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Cleared</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "overdue", "partial", "pending", "paid"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${filter === s ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {s === "all" ? "All" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((order) => {
          const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
          const remaining = order.amount - order.paid;
          const payPercent = Math.round((order.paid / order.amount) * 100);

          return (
            <div key={order.id} className={`card border ${order.status === "overdue" ? "border-red-200 bg-red-50/30" : order.status === "paid" ? "border-emerald-200" : ""}`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-800">{order.id}</p>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                          <cfg.icon size={11} /> {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5">{order.customer} · {order.items}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Due: {order.dueDate} · {order.daysPending > 0 ? `${order.daysPending} days pending` : "On time"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-slate-900">KSh {order.amount.toLocaleString()}</p>
                      {remaining > 0 && (
                        <p className="text-xs text-amber-600 font-medium">KSh {remaining.toLocaleString()} outstanding</p>
                      )}
                    </div>
                  </div>

                  {order.status !== "paid" && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Payment progress</span>
                        <span>{payPercent}% paid</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${payPercent === 100 ? "bg-emerald-500" : payPercent > 0 ? "bg-amber-400" : "bg-slate-200"}`} style={{ width: `${payPercent}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button className="flex items-center gap-1.5 text-xs bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition-colors">
                    <CreditCard size={12} /> Record Payment
                  </button>
                  <button className="flex items-center gap-1.5 text-xs border border-slate-200 text-slate-600 font-medium px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <MessageSquare size={12} /> Send Reminder
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
