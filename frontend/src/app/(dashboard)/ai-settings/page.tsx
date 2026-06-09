"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Save,
  Clock,
  AlertCircle,
  MessageSquare,
  Globe,
  Mic,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { api, agentApi, TenantSettings } from "@/lib/api";

const TONE_OPTIONS = [
  { value: "professional", label: "Professional", description: "Formal, polished responses. Best for B2B or premium brands.", emoji: "👔" },
  { value: "friendly", label: "Friendly", description: "Warm and approachable. Great for retail and lifestyle brands.", emoji: "😊" },
  { value: "casual", label: "Casual", description: "Relaxed, conversational tone. Perfect for youth brands.", emoji: "✌️" },
];

const LANGUAGES = ["English", "Swahili", "English + Swahili", "French", "Arabic"];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? "AM" : "PM";
  return { value: String(i).padStart(2, "0") + ":00", label: `${h}:00 ${ampm}` };
});

export default function AISettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Agent toggle
  const [agentEnabled, setAgentEnabled] = useState(true);
  const [togglingAgent, setTogglingAgent] = useState(false);

  // Form fields
  const [agentName, setAgentName] = useState("Nura");
  const [tone, setTone] = useState("friendly");
  const [language, setLanguage] = useState("English + Swahili");
  const [instructions, setInstructions] = useState("");
  const [strictness, setStrictness] = useState("flexible");
  const [autoReply, setAutoReply] = useState(true);
  const [workingHoursEnabled, setWorkingHoursEnabled] = useState(true);
  const [workingHours, setWorkingHours] = useState({ start: "08:00", end: "20:00" });
  const [escalationEnabled, setEscalationEnabled] = useState(true);
  const [escalationKeywords, setEscalationKeywords] = useState("refund, complaint, broken, damaged, urgent, angry");
  const [escalationDelay, setEscalationDelay] = useState("5");

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [settings, status] = await Promise.all([
          api.get<TenantSettings>("/settings"),
          agentApi.getStatus(),
        ]);
        setAgentName(settings.ai_agent_name ?? "Nura");
        setTone(settings.ai_tone ?? "friendly");
        setLanguage(settings.ai_language ?? "English + Swahili");
        setInstructions(settings.ai_custom_instructions ?? "");
        setStrictness(settings.ai_strictness ?? "flexible");
        setAgentEnabled(status.enabled);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.patch("/settings", {
        ai_agent_name: agentName,
        ai_tone: tone,
        ai_language: language,
        ai_custom_instructions: instructions,
        ai_strictness: strictness,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAgent = async () => {
    setTogglingAgent(true);
    try {
      const result = await agentApi.toggle();
      setAgentEnabled(result.enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle agent");
    } finally {
      setTogglingAgent(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">AI Employee Settings</h1>
          <p className="text-sm text-slate-500">Configure how your AI assistant interacts with customers</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm gap-1.5 flex items-center">
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : saved ? (
            <AlertCircle size={15} className="text-emerald-300" />
          ) : (
            <Save size={15} />
          )}
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Agent Name */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Bot size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-800">Agent Name</h2>
            </div>
            <input
              className="input-field"
              placeholder="e.g. Nura, Lena, Aria"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-2">
              Your AI will introduce itself by this name to customers.
            </p>
          </div>

          {/* Tone */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Mic size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-800">Tone of Voice</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTone(opt.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    tone === opt.value
                      ? "border-brand-400 bg-brand-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{opt.emoji}</div>
                  <p
                    className={`text-sm font-semibold ${
                      tone === opt.value ? "text-brand-700" : "text-slate-800"
                    }`}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-800">Language</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    language === lang
                      ? "border-brand-400 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              AI will respond in the customer&apos;s language when possible, defaulting to your selected language.
            </p>
          </div>

          {/* Strictness */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-800">Response Strictness</h2>
            </div>
            <div className="flex gap-3">
              {["flexible", "strict"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setStrictness(opt)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    strictness === opt
                      ? "border-brand-400 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="font-semibold capitalize">{opt}</p>
                  <p className="text-xs mt-0.5 font-normal text-slate-500">
                    {opt === "flexible"
                      ? "Answer general questions helpfully"
                      : "Only answer from knowledge base"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-800">Custom Instructions</h2>
            </div>
            <textarea
              className="input-field h-36 resize-none text-sm leading-relaxed"
              placeholder="Give your AI specific instructions about how to handle customers, what to promote, what to avoid, etc."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-2">{instructions.length} / 1000 characters</p>
          </div>

          {/* Working Hours */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-brand-600" />
                <h2 className="font-semibold text-slate-800">Working Hours</h2>
              </div>
              <button
                onClick={() => setWorkingHoursEnabled(!workingHoursEnabled)}
                className="flex items-center gap-2 text-sm"
              >
                {workingHoursEnabled ? (
                  <ToggleRight size={24} className="text-brand-600" />
                ) : (
                  <ToggleLeft size={24} className="text-slate-300" />
                )}
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              When enabled, AI auto-reply is active only during working hours. Outside hours, a message will
              inform customers of your schedule.
            </p>
            {workingHoursEnabled && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Opens at</label>
                  <select
                    className="input-field text-sm"
                    value={workingHours.start}
                    onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
                  >
                    {HOURS.map((h) => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-slate-400 mt-5">to</div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Closes at</label>
                  <select
                    className="input-field text-sm"
                    value={workingHours.end}
                    onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
                  >
                    {HOURS.map((h) => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Escalation */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-brand-600" />
                <h2 className="font-semibold text-slate-800">Escalation to Human</h2>
              </div>
              <button
                onClick={() => setEscalationEnabled(!escalationEnabled)}
                className="flex items-center gap-2 text-sm"
              >
                {escalationEnabled ? (
                  <ToggleRight size={24} className="text-brand-600" />
                ) : (
                  <ToggleLeft size={24} className="text-slate-300" />
                )}
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Automatically flag conversations for human review when trigger keywords are detected.
            </p>
            {escalationEnabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Trigger Keywords</label>
                  <input
                    className="input-field text-sm"
                    placeholder="refund, complaint, urgent..."
                    value={escalationKeywords}
                    onChange={(e) => setEscalationKeywords(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 mt-1">Separate keywords with commas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Escalation Delay (minutes)
                  </label>
                  <select
                    className="input-field text-sm"
                    value={escalationDelay}
                    onChange={(e) => setEscalationDelay(e.target.value)}
                  >
                    <option value="0">Immediate</option>
                    <option value="2">2 minutes</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side */}
        <div className="space-y-4">
          {/* Agent ON/OFF Toggle */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Bot size={20} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">AI Auto-Reply</p>
                  <p className="text-xs text-slate-500">{agentEnabled ? "Active" : "Paused"}</p>
                </div>
              </div>
              <button onClick={handleToggleAgent} disabled={togglingAgent}>
                {togglingAgent ? (
                  <Loader2 size={24} className="animate-spin text-slate-400" />
                ) : agentEnabled ? (
                  <ToggleRight size={28} className="text-brand-600" />
                ) : (
                  <ToggleLeft size={28} className="text-slate-300" />
                )}
              </button>
            </div>
            {!agentEnabled && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                AI auto-reply is paused. All incoming messages will go to the inbox queue.
              </div>
            )}
          </div>

          {/* AI Summary */}
          <div className="card bg-brand-50 border-brand-200">
            <h3 className="text-sm font-semibold text-brand-800 mb-3">Current Configuration</h3>
            <div className="space-y-2 text-xs text-brand-700">
              <div className="flex justify-between">
                <span>Agent Name</span>
                <strong>{agentName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tone</span>
                <strong className="capitalize">{tone}</strong>
              </div>
              <div className="flex justify-between">
                <span>Language</span>
                <strong>{language}</strong>
              </div>
              <div className="flex justify-between">
                <span>Strictness</span>
                <strong className="capitalize">{strictness}</strong>
              </div>
              <div className="flex justify-between">
                <span>Auto-Reply</span>
                <strong>{agentEnabled ? "On" : "Off"}</strong>
              </div>
              <div className="flex justify-between">
                <span>Working Hours</span>
                <strong>
                  {workingHoursEnabled ? `${workingHours.start}–${workingHours.end}` : "Always on"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Escalation</span>
                <strong>{escalationEnabled ? "On" : "Off"}</strong>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Tips</h3>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-start gap-2">
                <span className="text-brand-400 mt-0.5">•</span>
                Use the Friendly tone for WhatsApp — it converts 30% better than professional.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-400 mt-0.5">•</span>
                Add custom instructions for your top 3 FAQs to reduce escalations.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-400 mt-0.5">•</span>
                Set working hours to manage customer expectations during nights.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
