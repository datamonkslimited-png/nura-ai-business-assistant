"use client";

import { useState } from "react";
import { CreditCard, Zap, Check, TrendingUp, MessageSquare, Bot, Receipt, ChevronRight, Star } from "lucide-react";

const CURRENT_PLAN = {
  name: "Starter",
  price: 4999,
  billingCycle: "monthly",
  nextBillingDate: "Jul 8, 2026",
  messagesUsed: 1847,
  messagesLimit: 3000,
  aiCallsUsed: 642,
  aiCallsLimit: 1000,
};

const PAYMENT_HISTORY = [
  { id: "INV-2026-06", date: "Jun 8, 2026", amount: 4999, status: "paid", description: "Starter Plan — June 2026" },
  { id: "INV-2026-05", date: "May 8, 2026", amount: 4999, status: "paid", description: "Starter Plan — May 2026" },
  { id: "INV-2026-04", date: "Apr 8, 2026", amount: 4999, status: "paid", description: "Starter Plan — April 2026" },
  { id: "INV-2026-03", date: "Mar 8, 2026", amount: 4999, status: "paid", description: "Starter Plan — March 2026" },
  { id: "INV-2026-02", date: "Feb 8, 2026", amount: 2499, status: "paid", description: "Free Plan Upgrade" },
];

const PLANS = [
  {
    name: "Free",
    price: 0,
    description: "Get started",
    color: "border-slate-200",
    features: ["500 messages/month", "100 AI calls/month", "1 channel (WhatsApp)", "Basic analytics"],
    current: false,
  },
  {
    name: "Starter",
    price: 4999,
    description: "Small businesses",
    color: "border-brand-400",
    features: ["3,000 messages/month", "1,000 AI calls/month", "2 channels", "Full analytics", "Priority support"],
    current: true,
    badge: "Current Plan",
  },
  {
    name: "Growth",
    price: 9999,
    description: "Growing businesses",
    color: "border-emerald-400",
    features: ["10,000 messages/month", "5,000 AI calls/month", "All channels", "Advanced analytics", "Dedicated support", "Multi-branch"],
    current: false,
    popular: true,
  },
  {
    name: "Enterprise",
    price: 0,
    priceLabel: "Custom",
    description: "Large organizations",
    color: "border-purple-400",
    features: ["Unlimited messages", "Unlimited AI calls", "All channels + custom", "White-label option", "SLA guarantee", "Dedicated account manager"],
    current: false,
  },
];

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const messagesPercent = Math.round((CURRENT_PLAN.messagesUsed / CURRENT_PLAN.messagesLimit) * 100);
  const aiPercent = Math.round((CURRENT_PLAN.aiCallsUsed / CURRENT_PLAN.aiCallsLimit) * 100);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-500">Manage your subscription and payment history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card bg-gradient-to-br from-brand-600 to-brand-700 text-white !border-brand-500">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-brand-200" />
                  <span className="text-brand-200 text-sm font-medium">Current Plan</span>
                </div>
                <h2 className="text-2xl font-bold">{CURRENT_PLAN.name} Plan</h2>
                <p className="text-brand-200 text-sm mt-1">
                  KSh {CURRENT_PLAN.price.toLocaleString()} / month · Renews {CURRENT_PLAN.nextBillingDate}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Star size={20} className="text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 flex gap-3">
              <button className="bg-white text-brand-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-brand-50 transition-colors">
                Manage Plan
              </button>
              <button className="text-white border border-white/30 text-sm px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Usage This Month</h3>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <MessageSquare size={15} className="text-brand-500" />
                    Messages
                  </div>
                  <span className="text-sm text-slate-500">
                    <strong className="text-slate-800">{CURRENT_PLAN.messagesUsed.toLocaleString()}</strong> / {CURRENT_PLAN.messagesLimit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full transition-all ${messagesPercent > 80 ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${messagesPercent}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{messagesPercent}% used</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Bot size={15} className="text-emerald-500" />
                    AI Calls
                  </div>
                  <span className="text-sm text-slate-500">
                    <strong className="text-slate-800">{CURRENT_PLAN.aiCallsUsed.toLocaleString()}</strong> / {CURRENT_PLAN.aiCallsLimit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full transition-all ${aiPercent > 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${aiPercent}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{aiPercent}% used</p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="card !p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Payment History</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {PAYMENT_HISTORY.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                      <Receipt size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{inv.description}</p>
                      <p className="text-xs text-slate-400">{inv.date} · {inv.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">KSh {inv.amount.toLocaleString()}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{inv.status}</span>
                    <button className="text-xs text-brand-600 hover:underline flex items-center gap-0.5">
                      PDF <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side: Payment Method */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3">Payment Method</h3>
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-7 bg-blue-600 rounded flex items-center justify-center shrink-0">
                <CreditCard size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">Visa •••• 4242</p>
                <p className="text-xs text-slate-400">Expires 12/27</p>
              </div>
            </div>
            <button className="btn-secondary w-full mt-3 text-sm justify-center py-2">
              Update Card
            </button>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-1">Next Invoice</h3>
            <p className="text-3xl font-bold text-slate-900">KSh 4,999</p>
            <p className="text-xs text-slate-400 mt-0.5">Due on {CURRENT_PLAN.nextBillingDate}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg p-2">
              <TrendingUp size={13} />
              Auto-renew is enabled
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Upgrade Your Plan</h2>
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            <button onClick={() => setBillingCycle("monthly")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${billingCycle === "monthly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>Monthly</button>
            <button onClick={() => setBillingCycle("annual")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${billingCycle === "annual" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>Annual <span className="text-emerald-600 font-semibold">-20%</span></button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`card border-2 ${plan.color} relative ${plan.current ? "ring-2 ring-brand-400" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</span>
                </div>
              )}
              <div className="pt-2">
                <h3 className="font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{plan.description}</p>
                <div className="mb-4">
                  {plan.priceLabel ? (
                    <span className="text-2xl font-bold text-slate-900">{plan.priceLabel}</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-slate-900">
                        KSh {billingCycle === "annual" ? Math.round(plan.price * 0.8).toLocaleString() : plan.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400">/mo</span>
                    </>
                  )}
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 text-sm font-semibold rounded-xl transition-colors ${plan.current ? "bg-slate-100 text-slate-500 cursor-default" : plan.popular ? "btn-primary" : "btn-secondary"}`}>
                  {plan.current ? "Current Plan" : plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
