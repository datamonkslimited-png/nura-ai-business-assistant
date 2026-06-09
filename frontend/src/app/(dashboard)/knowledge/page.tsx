"use client";

import Link from "next/link";
import { Brain, FileText, HelpCircle, Truck, MessageSquare, ChevronRight, Plus, Bot, Upload } from "lucide-react";

const SECTIONS = [
  {
    href: "/knowledge/profile",
    icon: FileText,
    title: "Business Profile",
    desc: "Your business name, description, hours, location and contact info.",
    color: "bg-brand-50 text-brand-600",
    count: "0% complete",
  },
  {
    href: "/knowledge/documents",
    icon: Upload,
    title: "Business Documents",
    desc: "Upload menus, price lists, policies, or any documents your AI should know.",
    color: "bg-purple-50 text-purple-600",
    count: "0 files",
  },
  {
    href: "/knowledge/instructions",
    icon: Bot,
    title: "AI Instructions",
    desc: "Detailed instructions, scripted Q&As, and announcements for your AI.",
    color: "bg-emerald-50 text-emerald-600",
    count: "0 instructions",
  },
  {
    href: "/knowledge/faq",
    icon: HelpCircle,
    title: "FAQs & Q&A",
    desc: "Add word-for-word questions and answers your AI will use.",
    color: "bg-amber-50 text-amber-600",
    count: "0 Q&As",
  },
  {
    href: "/knowledge/delivery",
    icon: Truck,
    title: "Delivery Zones",
    desc: "Set your delivery areas, fees, and timelines.",
    color: "bg-rose-50 text-rose-600",
    count: "0 zones",
  },
];

export default function KnowledgePage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* AI Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shrink-0">
            <Brain size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-slate-900 text-lg mb-1">AI Hybrid Business Settings</h2>
            <p className="text-slate-500 text-sm mb-3">Configure how your AI assistant helps customers with questions about both your products and services.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-sm text-amber-700 font-medium">Your AI needs more information to work effectively</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card-hover flex items-start gap-4"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
              <span className="text-xs text-brand-600 font-medium mt-2 block">{s.count}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Business-specific settings */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Bot size={18} className="text-brand-600" />
          Business-Specific Settings
        </h3>
        <p className="text-sm text-slate-500 mb-4">Configure both retail and service operations.</p>

        <div className="space-y-3">
          {[
            { label: "Auto-follow up on unpaid orders", desc: "Send reminder when order is unpaid after 24h", enabled: false },
            { label: "AI takes orders automatically", desc: "Let AI process and confirm orders without manual review", enabled: true },
            { label: "AI handles delivery queries", desc: "AI responds to delivery time and location questions", enabled: true },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-800">{setting.label}</p>
                <p className="text-xs text-slate-500">{setting.desc}</p>
              </div>
              <button className={`relative w-10 h-5 rounded-full transition-colors ${setting.enabled ? "bg-brand-500" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${setting.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
