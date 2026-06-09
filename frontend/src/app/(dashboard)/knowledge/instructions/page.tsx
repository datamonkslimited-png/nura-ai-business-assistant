"use client";

import { useState } from "react";
import { Brain, Save, AlertCircle, Plus, Trash2, ChevronDown } from "lucide-react";

const PERSONA_TEMPLATES = [
  { name: "Professional Assistant", value: "You are a professional customer service assistant for {{business_name}}. You are polite, accurate, and always focused on helping customers find what they need." },
  { name: "Friendly Sales Rep", value: "You are a friendly and enthusiastic sales representative for {{business_name}}. You love the products and always highlight their best features. You use warm, conversational language." },
  { name: "Expert Advisor", value: "You are an expert product advisor at {{business_name}}. You have deep knowledge of all products and help customers make the best purchasing decisions for their needs and budget." },
];

const INITIAL_RULES = [
  "Always respond in the customer's language (English or Swahili)",
  "Never share pricing of competitors",
  "Always mention ongoing promotions when discussing pricing",
  "For bulk orders (5+ items), always mention that discounts are available",
  "If a customer asks for a refund, apologize and escalate to a human agent immediately",
];

export default function AIInstructionsPage() {
  const [persona, setPersona] = useState(PERSONA_TEMPLATES[1].value.replace("{{business_name}}", "My Boutique"));
  const [rules, setRules] = useState<string[]>(INITIAL_RULES);
  const [newRule, setNewRule] = useState("");
  const [doList, setDoList] = useState("Greet customers by name\nOffer alternatives when items are out of stock\nUpsell matching accessories when appropriate\nConfirm order details before processing");
  const [dontList, setDontList] = useState("Don't promise delivery timelines you can't guarantee\nDon't share customer data\nDon't offer discounts without manager approval\nDon't argue with customers");
  const [saved, setSaved] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const addRule = () => {
    if (newRule.trim()) {
      setRules(prev => [...prev, newRule.trim()]);
      setNewRule("");
    }
  };

  const removeRule = (idx: number) => {
    setRules(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">AI Instructions</h1>
          <p className="text-sm text-slate-500">Define your AI&apos;s persona, behavior rules, and conversation style</p>
        </div>
        <button onClick={handleSave} className="btn-primary text-sm gap-1.5">
          {saved ? <><AlertCircle size={15} />Saved!</> : <><Save size={15} />Save</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Persona */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain size={18} className="text-brand-600" />
                <h2 className="font-semibold text-slate-800">AI Persona</h2>
              </div>
              <button onClick={() => setShowTemplates(!showTemplates)} className="flex items-center gap-1.5 text-xs text-brand-600 font-medium hover:underline">
                Templates <ChevronDown size={13} className={`transition-transform ${showTemplates ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showTemplates && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                {PERSONA_TEMPLATES.map((t) => (
                  <button key={t.name} onClick={() => { setPersona(t.value.replace("{{business_name}}", "My Boutique")); setShowTemplates(false); }}
                    className="text-left p-3 border border-slate-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-all">
                    <p className="text-xs font-semibold text-slate-800">{t.name}</p>
                  </button>
                ))}
              </div>
            )}

            <textarea
              className="input-field h-36 resize-none text-sm leading-relaxed"
              value={persona}
              onChange={e => setPersona(e.target.value)}
              placeholder="Describe your AI's persona and role..."
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Use {"{{business_name}}"} as a placeholder for your business name. {persona.length} / 1500 chars.
            </p>
          </div>

          {/* Rules */}
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-4">Behavior Rules</h2>
            <div className="space-y-2 mb-4">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
                  <span className="text-brand-500 text-xs font-bold mt-0.5">{idx + 1}</span>
                  <p className="flex-1 text-sm text-slate-700">{rule}</p>
                  <button onClick={() => removeRule(idx)} className="p-0.5 hover:text-red-500 text-slate-300 transition-colors shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input-field text-sm flex-1"
                placeholder="Add a new rule..."
                value={newRule}
                onChange={e => setNewRule(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addRule()}
              />
              <button onClick={addRule} className="btn-primary text-sm gap-1.5 px-4 py-2 shrink-0">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Do's and Don'ts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card border-emerald-200">
              <h2 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full text-white text-xs flex items-center justify-center font-bold">✓</span>
                AI Should Do
              </h2>
              <textarea
                className="input-field h-36 resize-none text-sm leading-relaxed border-emerald-200 focus:ring-emerald-300"
                value={doList}
                onChange={e => setDoList(e.target.value)}
                placeholder="One item per line..."
              />
            </div>
            <div className="card border-red-200">
              <h2 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">✕</span>
                AI Should NOT Do
              </h2>
              <textarea
                className="input-field h-36 resize-none text-sm leading-relaxed border-red-200 focus:ring-red-300"
                value={dontList}
                onChange={e => setDontList(e.target.value)}
                placeholder="One item per line..."
              />
            </div>
          </div>
        </div>

        {/* Side */}
        <div className="space-y-4">
          <div className="card bg-brand-50 border-brand-200">
            <h3 className="text-sm font-semibold text-brand-800 mb-3">How Instructions Work</h3>
            <ul className="space-y-2 text-xs text-brand-700">
              <li className="flex items-start gap-2"><span className="shrink-0 mt-0.5">1.</span> The AI persona defines the character and communication style.</li>
              <li className="flex items-start gap-2"><span className="shrink-0 mt-0.5">2.</span> Behavior rules override default AI behavior for specific situations.</li>
              <li className="flex items-start gap-2"><span className="shrink-0 mt-0.5">3.</span> Do&apos;s and don&apos;ts provide a quick guardrails checklist.</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Quick Stats</h3>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Active Rules</span>
                <span className="font-semibold">{rules.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Persona Length</span>
                <span className="font-semibold">{persona.length} chars</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
