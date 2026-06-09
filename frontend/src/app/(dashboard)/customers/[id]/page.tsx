"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, MessageSquare, ShoppingCart, Calendar,
  StickyNote, Star, Clock, Package, CheckCircle, XCircle, Edit3, Plus
} from "lucide-react";

const CUSTOMERS: Record<string, {
  id: string; name: string; phone: string; email: string; location: string;
  totalOrders: number; totalSpent: number; lastSeen: string; status: string; tag: string | null;
  joinedDate: string; notes: string;
}> = {
  "1": { id: "1", name: "Joyce Kamau", phone: "+254 712 345 678", email: "joyce.kamau@gmail.com", location: "Westlands, Nairobi", totalOrders: 12, totalSpent: 45200, lastSeen: "2m ago", status: "active", tag: "VIP", joinedDate: "Jan 15, 2024", notes: "Prefers delivery on weekday evenings. VIP customer, give priority support." },
  "2": { id: "2", name: "Peter Mwangi", phone: "+254 723 456 789", email: "p.mwangi@outlook.com", location: "Kilimani, Nairobi", totalOrders: 7, totalSpent: 28600, lastSeen: "1h ago", status: "active", tag: null, joinedDate: "Mar 3, 2024", notes: "" },
  "3": { id: "3", name: "Sarah Wanjiru", phone: "+254 734 567 890", email: "sarah.w@gmail.com", location: "South B, Nairobi", totalOrders: 3, totalSpent: 9400, lastSeen: "3h ago", status: "active", tag: null, joinedDate: "May 10, 2024", notes: "" },
};

const ORDERS = [
  { id: "ORD-001", date: "Jun 5, 2026", items: "Blue Linen Dress, White Sneakers", amount: 8500, status: "delivered" },
  { id: "ORD-002", date: "May 28, 2026", items: "Summer Blouse (x2)", amount: 3200, status: "delivered" },
  { id: "ORD-003", date: "May 15, 2026", items: "Black Trousers, Belt", amount: 5600, status: "delivered" },
  { id: "ORD-004", date: "Apr 22, 2026", items: "Floral Maxi Dress", amount: 4200, status: "returned" },
];

const BOOKINGS = [
  { id: "BK-001", date: "Jun 10, 2026 at 2:00 PM", service: "Personal Styling Session", staff: "Amina Hassan", status: "confirmed" },
  { id: "BK-002", date: "May 3, 2026 at 11:00 AM", service: "Fitting Appointment", staff: "David Otieno", status: "completed" },
];

const CONVERSATIONS = [
  { id: "1", date: "Jun 6, 2026", preview: "Hi! Is the blue linen dress available in size 12?", channel: "WhatsApp", messages: 8 },
  { id: "2", date: "May 27, 2026", preview: "I'd like to make a bulk order for our company event...", channel: "WhatsApp", messages: 15 },
  { id: "3", date: "Apr 20, 2026", preview: "Can I return the floral dress? It doesn't fit well.", channel: "WhatsApp", messages: 6 },
];

const STATUS_COLORS: Record<string, string> = {
  delivered: "bg-emerald-100 text-emerald-700",
  returned: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-brand-100 text-brand-700",
  completed: "bg-emerald-100 text-emerald-700",
};

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const customer = CUSTOMERS[id] ?? CUSTOMERS["1"];
  const [tab, setTab] = useState<"orders" | "bookings" | "conversations" | "notes">("orders");
  const [notes, setNotes] = useState(customer.notes);
  const [editingNotes, setEditingNotes] = useState(false);

  const TABS = [
    { key: "orders", label: "Orders", icon: ShoppingCart, count: ORDERS.length },
    { key: "bookings", label: "Bookings", icon: Calendar, count: BOOKINGS.length },
    { key: "conversations", label: "Conversations", icon: MessageSquare, count: CONVERSATIONS.length },
    { key: "notes", label: "Notes", icon: StickyNote, count: null },
  ] as const;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Back */}
      <Link href="/customers" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 font-medium">
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center shrink-0">
            <span className="text-white text-2xl font-bold">{customer.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
              {customer.tag && (
                <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={10} /> {customer.tag}
                </span>
              )}
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${customer.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {customer.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Phone size={13} />{customer.phone}</span>
              <span className="flex items-center gap-1.5"><MessageSquare size={13} />{customer.email}</span>
              <span className="flex items-center gap-1.5"><Clock size={13} />Last seen {customer.lastSeen}</span>
              <span className="text-slate-400">Joined {customer.joinedDate}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="btn-primary text-sm gap-1.5">
              <MessageSquare size={15} /> Message
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
          <div>
            <p className="text-2xl font-bold text-slate-900">{customer.totalOrders}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total Orders</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">KSh {customer.totalSpent.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total Spent</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">KSh {Math.round(customer.totalSpent / customer.totalOrders).toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-0.5">Avg. Order Value</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <t.icon size={15} />
              {t.label}
              {t.count !== null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${tab === t.key ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "orders" && (
            <div className="space-y-3">
              {ORDERS.map((order) => (
                <div key={order.id} className="flex items-start justify-between gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Package size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{order.id}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{order.items}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{order.date}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="text-sm font-bold text-slate-900">KSh {order.amount.toLocaleString()}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "bookings" && (
            <div className="space-y-3">
              {BOOKINGS.map((bk) => (
                <div key={bk.id} className="flex items-start justify-between gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{bk.service}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{bk.date}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Staff: {bk.staff}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[bk.status]}`}>
                    {bk.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === "conversations" && (
            <div className="space-y-3">
              {CONVERSATIONS.map((conv) => (
                <div key={conv.id} className="flex items-start justify-between gap-4 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-brand-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-emerald-600">{conv.channel}</p>
                        <p className="text-xs text-slate-400">{conv.date}</p>
                      </div>
                      <p className="text-sm text-slate-700 mt-0.5 line-clamp-1">{conv.preview}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                    {conv.messages} msgs
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === "notes" && (
            <div>
              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    className="input-field h-36 resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this customer..."
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingNotes(false)} className="btn-primary text-sm gap-1.5">
                      <CheckCircle size={14} /> Save Notes
                    </button>
                    <button onClick={() => setEditingNotes(false)} className="btn-secondary text-sm gap-1.5">
                      <XCircle size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {notes ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                      {notes}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <StickyNote size={32} className="text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No notes yet</p>
                    </div>
                  )}
                  <button onClick={() => setEditingNotes(true)} className="btn-secondary text-sm gap-1.5 mt-3">
                    {notes ? <><Edit3 size={14} /> Edit Notes</> : <><Plus size={14} /> Add Note</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
