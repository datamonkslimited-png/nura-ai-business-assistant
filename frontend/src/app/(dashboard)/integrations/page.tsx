"use client";

import { useState } from "react";
import { MessageSquare, Facebook, Instagram, CreditCard, CheckCircle, XCircle, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  detail?: string;
  icon: React.ReactNode;
  color: string;
  status?: "healthy" | "error" | "warning";
  category: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Connect your WhatsApp Business account to receive and reply to customer messages through NURA AI.",
      connected: true,
      detail: "+254 712 000 001",
      icon: <MessageSquare size={22} className="text-white" />,
      color: "bg-[#25D366]",
      status: "healthy",
      category: "Messaging",
    },
    {
      id: "mpesa",
      name: "M-Pesa",
      description: "Accept payments via M-Pesa Paybill or Till number. Automatically confirm payments and update orders.",
      connected: true,
      detail: "Paybill: 522522 · Account: MyBoutique",
      icon: <CreditCard size={22} className="text-white" />,
      color: "bg-red-500",
      status: "healthy",
      category: "Payments",
    },
    {
      id: "facebook",
      name: "Facebook Messenger",
      description: "Manage Facebook Messenger conversations from your business page within NURA AI.",
      connected: false,
      icon: <Facebook size={22} className="text-white" />,
      color: "bg-[#1877F2]",
      category: "Messaging",
    },
    {
      id: "instagram",
      name: "Instagram DMs",
      description: "Reply to Instagram Direct Messages and comments automatically with your AI employee.",
      connected: false,
      icon: <Instagram size={22} className="text-white" />,
      color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
      category: "Messaging",
    },
  ]);

  const [connecting, setConnecting] = useState<string | null>(null);

  const toggleConnection = async (id: string) => {
    setConnecting(id);
    await new Promise(r => setTimeout(r, 1200));
    setIntegrations(prev =>
      prev.map(i => i.id === id ? { ...i, connected: !i.connected, status: !i.connected ? "healthy" : undefined } : i)
    );
    setConnecting(null);
  };

  const categories = ["Messaging", "Payments"];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Integrations</h1>
        <p className="text-sm text-slate-500">Connect your channels and payment services</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-2xl font-bold text-slate-900">{integrations.filter(i => i.connected).length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Connected</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-slate-400">{integrations.filter(i => !i.connected).length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Available</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-emerald-600">{integrations.filter(i => i.status === "healthy").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Healthy</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-amber-500">{integrations.filter(i => i.status === "error" || i.status === "warning").length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Issues</p>
        </div>
      </div>

      {categories.map(category => (
        <div key={category}>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {integrations.filter(i => i.category === category).map((integration) => (
              <div key={integration.id} className={`card ${integration.connected ? "border-emerald-200 bg-emerald-50/30" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${integration.color}`}>
                    {integration.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                        {integration.connected && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {integration.status === "healthy" && (
                              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                <CheckCircle size={11} /> Connected
                              </span>
                            )}
                            {integration.status === "error" && (
                              <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                <XCircle size={11} /> Error
                              </span>
                            )}
                            {integration.status === "warning" && (
                              <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                <AlertTriangle size={11} /> Warning
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{integration.description}</p>
                    {integration.connected && integration.detail && (
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600 font-medium">
                        {integration.detail}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    {integration.connected && (
                      <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 font-medium">
                        <ExternalLink size={12} /> Settings
                      </button>
                    )}
                    {integration.connected && (
                      <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 font-medium ml-3">
                        <RefreshCw size={12} /> Refresh
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => toggleConnection(integration.id)}
                    disabled={connecting === integration.id}
                    className={`text-sm font-semibold px-4 py-1.5 rounded-xl transition-all disabled:opacity-60 ${
                      integration.connected
                        ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        : "btn-primary"
                    }`}
                  >
                    {connecting === integration.id
                      ? integration.connected ? "Disconnecting..." : "Connecting..."
                      : integration.connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Coming Soon */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Coming Soon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {["Telegram", "TikTok Shop", "Shopify"].map((name) => (
            <div key={name} className="card opacity-60 border-dashed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <MessageSquare size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{name}</p>
                  <p className="text-xs text-slate-400">Coming soon</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
