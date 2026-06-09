"use client";

import { useState } from "react";
import { Settings, Save, AlertCircle, ToggleLeft, ToggleRight, Shield, DollarSign, Zap } from "lucide-react";

const FEATURE_FLAGS = [
  { key: "whatsapp", label: "WhatsApp Integration", description: "Allow tenants to connect WhatsApp Business accounts", enabled: true, category: "Channels" },
  { key: "facebook", label: "Facebook Messenger", description: "Enable Facebook Messenger channel for tenants", enabled: true, category: "Channels" },
  { key: "instagram", label: "Instagram DMs", description: "Enable Instagram Direct Messages channel", enabled: false, category: "Channels" },
  { key: "mpesa", label: "M-Pesa Integration", description: "Allow M-Pesa payment confirmation", enabled: true, category: "Payments" },
  { key: "bulk_campaigns", label: "Bulk Campaigns", description: "Enable bulk message campaign feature", enabled: true, category: "Features" },
  { key: "calendar", label: "Booking Calendar", description: "Enable booking/appointment system", enabled: true, category: "Features" },
  { key: "ai_orders", label: "AI Order Agent", description: "AI-powered order processing and confirmation", enabled: true, category: "AI" },
  { key: "multi_branch", label: "Multi-Branch Support", description: "Allow tenants to manage multiple branches", enabled: true, category: "Features" },
  { key: "referral_system", label: "Referral System", description: "Enable referral agent commissions", enabled: true, category: "Platform" },
  { key: "custom_branding", label: "Custom Branding", description: "Allow Enterprise tenants to use custom branding", enabled: false, category: "Platform" },
];

const PLAN_PRICING = [
  { plan: "Free", monthlyPrice: 0, annualPrice: 0, messageLimit: 500, aiCallLimit: 100 },
  { plan: "Starter", monthlyPrice: 4999, annualPrice: 3999, messageLimit: 3000, aiCallLimit: 1000 },
  { plan: "Growth", monthlyPrice: 9999, annualPrice: 7999, messageLimit: 10000, aiCallLimit: 5000 },
  { plan: "Enterprise", monthlyPrice: 0, annualPrice: 0, messageLimit: -1, aiCallLimit: -1 },
];

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState(FEATURE_FLAGS);
  const [pricing, setPricing] = useState(PLAN_PRICING);
  const [saved, setSaved] = useState(false);
  const [platformName, setPlatformName] = useState("NURA AI");
  const [supportEmail, setSupportEmail] = useState("support@nura.ai");
  const [maxTenantsPerPlan, setMaxTenantsPerPlan] = useState("1000");
  const [securitySettings, setSecuritySettings] = useState([
    { label: "Force 2FA for Admins", enabled: true },
    { label: "IP Allowlist", enabled: false },
    { label: "Audit Logging", enabled: true },
    { label: "Rate Limit Enforcement", enabled: true },
  ]);
  const toggleSecurity = (idx: number) => setSecuritySettings(prev => prev.map((s, i) => i === idx ? { ...s, enabled: !s.enabled } : s));

  const toggleFlag = (key: string) => {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const categories = [...new Set(FEATURE_FLAGS.map(f => f.category))];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Platform Settings</h1>
          <p className="text-sm text-slate-400">Feature flags, pricing config, and platform settings</p>
        </div>
        <button onClick={handleSave} className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
          {saved ? <><AlertCircle size={15} />Saved!</> : <><Save size={15} />Save Settings</>}
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-300">General Configuration</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Platform Name</label>
            <input className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value={platformName} onChange={e => setPlatformName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Support Email</label>
            <input className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Tenants</label>
            <input type="number" className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value={maxTenantsPerPlan} onChange={e => setMaxTenantsPerPlan(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-slate-800">
          <Zap size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-300">Feature Flags</h2>
          <span className="text-xs bg-emerald-900 text-emerald-400 px-2 py-0.5 rounded-full ml-auto">
            {flags.filter(f => f.enabled).length} / {flags.length} enabled
          </span>
        </div>
        {categories.map(category => (
          <div key={category}>
            <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{category}</p>
            </div>
            {flags.filter(f => f.category === category).map((flag) => (
              <div key={flag.key} className="flex items-center justify-between px-4 py-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-200">{flag.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{flag.description}</p>
                </div>
                <button onClick={() => toggleFlag(flag.key)}>
                  {flag.enabled
                    ? <ToggleRight size={26} className="text-brand-500" />
                    : <ToggleLeft size={26} className="text-slate-600" />}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Plan Pricing */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-slate-800">
          <DollarSign size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-300">Plan Pricing Configuration</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {["Plan", "Monthly (KSh)", "Annual (KSh)", "Messages/mo", "AI Calls/mo"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pricing.map((plan, idx) => (
                <tr key={plan.plan}>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-200">{plan.plan}</td>
                  {["monthlyPrice", "annualPrice", "messageLimit", "aiCallLimit"].map((field) => (
                    <td key={field} className="px-4 py-3">
                      <input
                        type="number"
                        className="w-24 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                        value={plan[field as keyof typeof plan] === -1 ? "" : plan[field as keyof typeof plan]}
                        placeholder={plan[field as keyof typeof plan] === -1 ? "Unlimited" : ""}
                        onChange={(e) => {
                          const v = e.target.value === "" ? -1 : parseInt(e.target.value) || 0;
                          setPricing(prev => prev.map((p, i) => i === idx ? { ...p, [field]: v } : p));
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-300">Security Settings</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {securitySettings.map((setting, idx) => (
            <div key={setting.label} className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3">
              <p className="text-sm text-slate-300">{setting.label}</p>
              <button onClick={() => toggleSecurity(idx)}>
                {setting.enabled ? <ToggleRight size={22} className="text-brand-500" /> : <ToggleLeft size={22} className="text-slate-600" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
