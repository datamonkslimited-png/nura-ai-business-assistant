"use client";

import { useState } from "react";
import { Save, Eye, EyeOff, ExternalLink, CheckCircle, AlertTriangle, Copy } from "lucide-react";

const TABS = ["Business", "WhatsApp", "M-Pesa", "AI Agent", "Staff", "Security"];

function BusinessTab() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-4">Business Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Business Name</label>
            <input defaultValue="My Business" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 transition-all" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Business Type</label>
            <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 transition-all bg-white">
              <option>Salon & Beauty</option>
              <option>Bakery & Food</option>
              <option>Retail Shop</option>
              <option>Clinic</option>
              <option>Travel & Tourism</option>
              <option>Pharmacy</option>
              <option>Restaurant</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Phone Number</label>
            <input defaultValue="+254 712 345 678" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 transition-all" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Email</label>
            <input type="email" defaultValue="hello@mybusiness.co.ke" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 transition-all" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Business Address</label>
            <input defaultValue="Westlands, Nairobi" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 transition-all" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Short Description</label>
            <textarea rows={3} defaultValue="We offer premium beauty services at affordable prices." className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 transition-all resize-none" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary flex items-center gap-2 text-sm"><Save size={16} /> Save Changes</button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-4">Operating Hours</h3>
        <div className="space-y-3">
          {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day, i) => (
            <div key={day} className="flex items-center gap-4">
              <span className="text-sm text-slate-700 w-24 shrink-0">{day}</span>
              <input type="checkbox" defaultChecked={i < 6} className="w-4 h-4 accent-brand-600" />
              <input type="time" defaultValue="08:00" className="px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-400" />
              <span className="text-slate-400 text-sm">to</span>
              <input type="time" defaultValue="18:00" className="px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-400" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary flex items-center gap-2 text-sm"><Save size={16} /> Save Hours</button>
        </div>
      </div>
    </div>
  );
}

function WhatsAppTab() {
  const [connected, setConnected] = useState(false);
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="space-y-4">
      <div className={`card border-2 ${connected ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${connected ? "bg-emerald-100" : "bg-slate-100"}`}>
            <svg viewBox="0 0 24 24" className={`w-6 h-6 ${connected ? "fill-emerald-600" : "fill-slate-400"}`}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.374 0 0 5.373 0 12c0 2.116.549 4.095 1.506 5.805L.003 24l6.333-1.659A11.946 11.946 0 0012 24c6.626 0 12-5.373 12-12S18.626 0 12 0zm0 21.6a9.578 9.578 0 01-4.886-1.335l-.351-.208-3.761.986.999-3.666-.229-.376A9.578 9.578 0 012.4 12C2.4 6.698 6.698 2.4 12 2.4S21.6 6.698 21.6 12 17.302 21.6 12 21.6z"/></svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">WhatsApp Business API</h3>
            <p className={`text-sm ${connected ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              {connected ? "✓ Connected — +254 700 000 000" : "Not connected"}
            </p>
          </div>
          <button onClick={() => setConnected(!connected)} className={`ml-auto text-sm font-medium px-4 py-2 rounded-xl transition-all ${connected ? "bg-red-50 text-red-600 hover:bg-red-100" : "btn-primary"}`}>
            {connected ? "Disconnect" : "Connect"}
          </button>
        </div>

        {!connected && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-600">Enter your Meta WhatsApp Business credentials:</p>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Phone Number ID</label>
              <input placeholder="123456789012345" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Access Token</label>
              <div className="relative">
                <input type={showToken ? "text" : "password"} placeholder="EAAxxxx..." className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400" />
                <button onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Webhook Verify Token</label>
              <div className="flex gap-2">
                <input readOnly defaultValue="nura_wh_abc123xyz789" className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 font-mono" />
                <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all"><Copy size={16} className="text-slate-500" /></button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Use this in your Meta Webhook configuration</p>
            </div>
            <button className="btn-primary text-sm flex items-center gap-2 w-full justify-center"><ExternalLink size={16} /> Connect WhatsApp</button>
          </div>
        )}
      </div>

      {connected && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4">Webhook Configuration</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Webhook URL (copy to Meta)</label>
              <div className="flex gap-2">
                <input readOnly value="https://api.nura.datamonks.com/webhooks/whatsapp" className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 font-mono text-xs" />
                <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all"><Copy size={16} className="text-slate-500" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MpesaTab() {
  const [live, setLive] = useState(false);
  return (
    <div className="space-y-4">
      <div className="card border-2 border-green-200 bg-green-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center font-black text-green-700 text-sm">M</div>
          <div>
            <h3 className="font-semibold text-slate-900">M-Pesa Daraja API</h3>
            <p className="text-sm text-slate-500">Accept payments via STK Push</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500">Sandbox</span>
            <button onClick={() => setLive(!live)} className={`relative w-10 h-6 rounded-full transition-all ${live ? "bg-green-500" : "bg-slate-300"}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${live ? "left-5" : "left-1"}`} />
            </button>
            <span className="text-xs text-slate-500">Live</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Consumer Key</label>
            <input placeholder="Your Daraja Consumer Key" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Consumer Secret</label>
            <input type="password" placeholder="••••••••••••" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Business Shortcode</label>
            <input placeholder="174379" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Passkey</label>
            <input type="password" placeholder="••••••••••••" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Callback URL (copy to Safaricom)</label>
            <div className="flex gap-2">
              <input readOnly value="https://api.nura.datamonks.com/webhooks/mpesa/callback" className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 font-mono text-xs" />
              <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100"><Copy size={16} className="text-slate-500" /></button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary text-sm flex items-center gap-2"><Save size={16} /> Save M-Pesa Config</button>
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <div className="flex gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Sandbox Mode Active</strong> — Test with Safaricom test credentials. Switch to Live only after approval from Safaricom.
            <a href="https://developer.safaricom.co.ke" target="_blank" rel="noreferrer" className="text-amber-700 underline ml-1">Get credentials →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIAgentTab() {
  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-4">AI Personality</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Agent Name</label>
            <input defaultValue="Nura" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Tone</label>
            <div className="grid grid-cols-3 gap-2">
              {["Friendly", "Professional", "Casual"].map((t) => (
                <button key={t} className={`py-2 text-sm rounded-xl border-2 font-medium transition-all ${t === "Friendly" ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-brand-200"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Response Language</label>
            <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 bg-white">
              <option>English</option>
              <option>Swahili</option>
              <option>English + Swahili (auto-detect)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Custom Instructions</label>
            <textarea rows={4} placeholder="e.g. Always greet with 'Karibu!' and mention our current promotion..." className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 resize-none" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary text-sm flex items-center gap-2"><Save size={16} /> Save AI Settings</button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-4">Automation Rules</h3>
        <div className="space-y-3">
          {[
            { label: "Auto-reply to greetings", desc: "AI responds to Hi, Hello, Karibu automatically" },
            { label: "Send payment requests automatically", desc: "AI sends M-Pesa prompt when order is placed" },
            { label: "Booking reminders", desc: "Send reminder 24h before appointment via WhatsApp" },
            { label: "Follow-up on abandoned carts", desc: "Remind customers who browsed but didn't order" },
          ].map((rule) => (
            <div key={rule.label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 accent-brand-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">{rule.label}</p>
                <p className="text-xs text-slate-500">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Business");

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Configure your workspace and integrations</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap border-b border-slate-100 -mb-2 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 ${
              activeTab === tab
                ? "border-brand-500 text-brand-700 bg-brand-50/50"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {activeTab === "Business" && <BusinessTab />}
        {activeTab === "WhatsApp" && <WhatsAppTab />}
        {activeTab === "M-Pesa" && <MpesaTab />}
        {activeTab === "AI Agent" && <AIAgentTab />}
        {activeTab === "Staff" && (
          <div className="card text-center py-12 text-slate-400">
            <p className="text-sm">Staff management coming soon</p>
          </div>
        )}
        {activeTab === "Security" && (
          <div className="card text-center py-12 text-slate-400">
            <p className="text-sm">Security settings coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
