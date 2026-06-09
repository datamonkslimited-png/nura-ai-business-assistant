"use client";

import { useState } from "react";
import { Plus, Megaphone, AlertCircle, Send, Clock, CheckCircle, XCircle, PauseCircle } from "lucide-react";

const FILTERS = ["All", "Draft", "Scheduled", "Sending", "Paused", "Completed", "Failed"];

const STATUS_ICON: Record<string, any> = {
  draft: { icon: Clock, class: "badge-gray", label: "Draft" },
  scheduled: { icon: Clock, class: "badge-blue", label: "Scheduled" },
  sending: { icon: Send, class: "badge-yellow", label: "Sending" },
  paused: { icon: PauseCircle, class: "badge-yellow", label: "Paused" },
  completed: { icon: CheckCircle, class: "badge-green", label: "Completed" },
  failed: { icon: XCircle, class: "badge-red", label: "Failed" },
};

const CAMPAIGNS = [
  {
    id: "1", name: "June Promotion Sale", status: "completed",
    sent: 320, delivered: 310, read: 201, replied: 45,
    scheduledAt: "Jun 1, 2026 9:00 AM",
  },
  {
    id: "2", name: "New Arrivals — Winter Collection", status: "scheduled",
    sent: 0, delivered: 0, read: 0, replied: 0,
    scheduledAt: "Jun 7, 2026 10:00 AM",
  },
];

export default function CampaignsPage() {
  const [filter, setFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = CAMPAIGNS.filter(c =>
    filter === "All" || STATUS_ICON[c.status]?.label === filter
  );

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Billing warning */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Bulk Messaging Credit Required</p>
          <p className="text-xs text-amber-600">Billing not initialized. Set up billing to send campaigns.</p>
          <button className="text-xs text-amber-700 font-semibold underline mt-1">Set up billing →</button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <Megaphone size={22} className="text-brand-600" />
            Bulk Messages
          </h2>
          <p className="section-sub">Send template messages to multiple customers at once</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              filter === f ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Megaphone size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No campaigns</h3>
          <p className="text-slate-500 text-sm mb-6">Get started by creating your first bulk messaging campaign.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={16} /> Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => {
            const cfg = STATUS_ICON[c.status];
            return (
              <div key={c.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{c.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Scheduled: {c.scheduledAt}</p>
                  </div>
                  <span className={`${cfg.class} text-xs`}>{cfg.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Sent", val: c.sent },
                    { label: "Delivered", val: c.delivered },
                    { label: "Read", val: c.read },
                    { label: "Replied", val: c.replied },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-lg font-bold text-slate-900">{s.val}</p>
                      <p className="text-xs text-slate-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-brand-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">New Campaign</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Campaign Name *</label>
                <input type="text" placeholder="e.g. June Sale Promotion" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message Template *</label>
                <textarea rows={4} placeholder="Type your message... You can use {{name}} for customer name" className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Recipient List</label>
                <select className="input-field">
                  <option>All Customers (320)</option>
                  <option>Customers from last 30 days (120)</option>
                  <option>Customers who haven't ordered (45)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Schedule</label>
                <input type="datetime-local" className="input-field" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button className="btn-primary flex-1 py-3">Schedule Campaign</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
