"use client";

import { useState } from "react";
import { Bot, Save, Package, CreditCard, Truck, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";

export default function OrderAgentSettingsPage() {
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [confirmMpesa, setConfirmMpesa] = useState(true);
  const [allowCredit, setAllowCredit] = useState(false);
  const [autoDelivery, setAutoDelivery] = useState(true);
  const [minOrderAmount, setMinOrderAmount] = useState("500");
  const [maxOrderAmount, setMaxOrderAmount] = useState("50000");
  const [creditLimit, setCreditLimit] = useState("5000");
  const [orderConfirmMsg, setOrderConfirmMsg] = useState(
    "Your order {{order_id}} has been confirmed! Total: KSh {{amount}}. We'll prepare it and notify you when it's ready for delivery."
  );
  const [paymentMsg, setPaymentMsg] = useState(
    "Thank you! We've received your M-Pesa payment of KSh {{amount}}. Your order is now confirmed."
  );
  const [deliveryMsg, setDeliveryMsg] = useState(
    "Great news! Your order {{order_id}} is on its way. Estimated delivery: {{delivery_time}}."
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}>
      {value ? <ToggleRight size={26} className="text-brand-600" /> : <ToggleLeft size={26} className="text-slate-300" />}
    </button>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Order Agent Settings</h1>
          <p className="text-sm text-slate-500">Configure how AI handles orders automatically</p>
        </div>
        <button onClick={handleSave} className="btn-primary text-sm gap-1.5">
          {saved ? <><AlertCircle size={15} />Saved!</> : <><Save size={15} />Save Settings</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Order Processing */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-800">Order Processing</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Auto-confirm orders via chat", desc: "AI automatically confirms orders when customer confirms intent", val: autoConfirm, fn: () => setAutoConfirm(!autoConfirm) },
                { label: "Auto-generate invoices", desc: "Automatically create an invoice when an order is placed", val: autoInvoice, fn: () => setAutoInvoice(!autoInvoice) },
                { label: "Auto assign delivery", desc: "Automatically assign orders to available delivery agents", val: autoDelivery, fn: () => setAutoDelivery(!autoDelivery) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle value={item.val} onChange={item.fn} />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Min Order Amount (KSh)</label>
                  <input className="input-field text-sm" type="number" value={minOrderAmount} onChange={e => setMinOrderAmount(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Order Amount (KSh)</label>
                  <input className="input-field text-sm" type="number" value={maxOrderAmount} onChange={e => setMaxOrderAmount(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-800">Payments</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">Auto-confirm M-Pesa payments</p>
                  <p className="text-xs text-slate-500 mt-0.5">Confirm orders when M-Pesa notification is received</p>
                </div>
                <Toggle value={confirmMpesa} onChange={() => setConfirmMpesa(!confirmMpesa)} />
              </div>
              <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">Allow credit orders</p>
                  <p className="text-xs text-slate-500 mt-0.5">Accept orders without upfront payment (up to credit limit)</p>
                </div>
                <Toggle value={allowCredit} onChange={() => setAllowCredit(!allowCredit)} />
              </div>
              {allowCredit && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Default Credit Limit (KSh)</label>
                  <input className="input-field text-sm" type="number" value={creditLimit} onChange={e => setCreditLimit(e.target.value)} />
                </div>
              )}
            </div>
          </div>

          {/* Message Templates */}
          <div className="card">
            <div className="flex items-center gap-2 mb-1">
              <Bot size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-800">Message Templates</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Use {"{{variable}}"} placeholders. Available: order_id, amount, customer_name, delivery_time</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Order Confirmation</label>
                <textarea className="input-field h-20 resize-none text-sm" value={orderConfirmMsg} onChange={e => setOrderConfirmMsg(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Received</label>
                <textarea className="input-field h-20 resize-none text-sm" value={paymentMsg} onChange={e => setPaymentMsg(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Out for Delivery</label>
                <textarea className="input-field h-20 resize-none text-sm" value={deliveryMsg} onChange={e => setDeliveryMsg(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Side Summary */}
        <div className="space-y-4">
          <div className="card bg-brand-50 border-brand-200">
            <h3 className="text-sm font-semibold text-brand-800 mb-3">Active Automations</h3>
            <div className="space-y-2 text-xs text-brand-700">
              {[
                { label: "Auto Confirm", val: autoConfirm },
                { label: "Auto Invoice", val: autoInvoice },
                { label: "Auto Delivery", val: autoDelivery },
                { label: "M-Pesa Confirm", val: confirmMpesa },
                { label: "Credit Orders", val: allowCredit },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span>{item.label}</span>
                  <span className={item.val ? "text-emerald-600 font-bold" : "text-slate-400"}>{item.val ? "On" : "Off"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Order Limits</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Minimum</span>
                <span className="font-semibold">KSh {parseInt(minOrderAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Maximum</span>
                <span className="font-semibold">KSh {parseInt(maxOrderAmount).toLocaleString()}</span>
              </div>
              {allowCredit && (
                <div className="flex justify-between">
                  <span>Credit Limit</span>
                  <span className="font-semibold">KSh {parseInt(creditLimit).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
