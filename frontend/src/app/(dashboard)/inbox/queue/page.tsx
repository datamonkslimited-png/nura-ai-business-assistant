"use client";

import { useState } from "react";
import { AlertCircle, Clock, User, MessageSquare, CheckCircle, ArrowRight, Filter } from "lucide-react";

interface QueueItem {
  id: string;
  customer: string;
  phone: string;
  reason: string;
  priority: "high" | "medium" | "low";
  waitTime: string;
  preview: string;
  channel: string;
  status: "pending" | "in-progress" | "resolved";
}

const QUEUE_ITEMS: QueueItem[] = [
  { id: "Q-001", customer: "Joyce Kamau", phone: "+254 712 345 678", reason: "Escalated: complaint", priority: "high", waitTime: "8 min", preview: "I received a damaged item and I'm very upset. I need this resolved immediately.", channel: "WhatsApp", status: "pending" },
  { id: "Q-002", customer: "Peter Mwangi", phone: "+254 723 456 789", reason: "Refund request", priority: "high", waitTime: "15 min", preview: "I'd like to request a refund for order ORD-2847. The product doesn't match the description.", channel: "WhatsApp", status: "pending" },
  { id: "Q-003", customer: "Sarah Wanjiru", phone: "+254 734 567 890", reason: "AI couldn't answer", priority: "medium", waitTime: "3 min", preview: "Can you do custom embroidery on the dress? I have a specific design in mind.", channel: "WhatsApp", status: "in-progress" },
  { id: "Q-004", customer: "James Ochieng", phone: "+254 745 678 901", reason: "Payment issue", priority: "high", waitTime: "22 min", preview: "I sent KSh 4,500 via M-Pesa but my order is still showing as unpaid.", channel: "WhatsApp", status: "pending" },
  { id: "Q-005", customer: "Faith Njeri", phone: "+254 756 789 012", reason: "Bulk order inquiry", priority: "medium", waitTime: "11 min", preview: "We need 50 pieces of the corporate uniform for our team. What's the best price?", channel: "Facebook", status: "pending" },
  { id: "Q-006", customer: "Grace Akinyi", phone: "+254 778 901 234", reason: "Delivery delay", priority: "low", waitTime: "1h 2min", preview: "My order was supposed to arrive yesterday. Can you check the status?", channel: "WhatsApp", status: "resolved" },
];

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_COLORS = {
  pending: "bg-red-50 border-red-200",
  "in-progress": "bg-amber-50 border-amber-200",
  resolved: "bg-emerald-50 border-emerald-200",
};

export default function ActionQueuePage() {
  const [filter, setFilter] = useState<"all" | "pending" | "in-progress" | "resolved">("all");
  const [items, setItems] = useState<QueueItem[]>(QUEUE_ITEMS);

  const filtered = filter === "all" ? items : items.filter(i => i.status === filter);
  const pending = items.filter(i => i.status === "pending").length;
  const inProgress = items.filter(i => i.status === "in-progress").length;

  const markResolved = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "resolved" } : i));
  };

  const takeAction = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "in-progress" } : i));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Action Queue</h1>
          <p className="text-sm text-slate-500">Conversations requiring human intervention</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {pending > 0 && (
            <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-xl font-semibold">
              <AlertCircle size={14} />
              {pending} pending
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card border-red-200">
          <p className="text-2xl font-bold text-red-600">{pending}</p>
          <p className="text-xs text-slate-500 mt-0.5">Pending</p>
        </div>
        <div className="card border-amber-200">
          <p className="text-2xl font-bold text-amber-600">{inProgress}</p>
          <p className="text-xs text-slate-500 mt-0.5">In Progress</p>
        </div>
        <div className="card border-emerald-200">
          <p className="text-2xl font-bold text-emerald-600">{items.filter(i => i.status === "resolved").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Resolved Today</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={15} className="text-slate-400" />
        {(["all", "pending", "in-progress", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${filter === f ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Queue Items */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className={`card border ${STATUS_COLORS[item.status]}`}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center shrink-0">
                <User size={18} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">{item.customer}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[item.priority]}`}>
                        {item.priority} priority
                      </span>
                      <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{item.channel}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.reason} · {item.phone}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                    <Clock size={12} />
                    Waiting {item.waitTime}
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2 bg-white/60 rounded-lg p-2 border border-slate-100 line-clamp-2">
                  &ldquo;{item.preview}&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {item.status === "pending" && (
                    <button onClick={() => takeAction(item.id)} className="btn-primary text-xs gap-1.5 py-1.5 px-3">
                      <MessageSquare size={12} /> Take Over
                    </button>
                  )}
                  {item.status === "in-progress" && (
                    <button onClick={() => markResolved(item.id)} className="text-xs bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-emerald-600 transition-colors">
                      <CheckCircle size={12} /> Mark Resolved
                    </button>
                  )}
                  {item.status === "resolved" && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <CheckCircle size={12} /> Resolved
                    </span>
                  )}
                  <button className="text-xs text-brand-600 hover:underline flex items-center gap-0.5 font-medium">
                    View Chat <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle size={40} className="text-emerald-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">All caught up!</p>
            <p className="text-slate-400 text-sm">No items in this queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
