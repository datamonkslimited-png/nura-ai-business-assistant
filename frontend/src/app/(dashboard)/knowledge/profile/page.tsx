"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, Phone, Mail, Globe, Clock, Save, AlertCircle, Loader2 } from "lucide-react";
import { api, TenantSettings } from "@/lib/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? "AM" : "PM";
  return { value: String(i).padStart(2, "0") + ":00", label: `${h}:00 ${ampm}` };
});

interface BusinessHours {
  open: boolean;
  start: string;
  end: string;
}

const DEFAULT_HOURS: Record<string, BusinessHours> = {
  Monday: { open: true, start: "08:00", end: "20:00" },
  Tuesday: { open: true, start: "08:00", end: "20:00" },
  Wednesday: { open: true, start: "08:00", end: "20:00" },
  Thursday: { open: true, start: "08:00", end: "20:00" },
  Friday: { open: true, start: "08:00", end: "21:00" },
  Saturday: { open: true, start: "09:00", end: "21:00" },
  Sunday: { open: false, start: "10:00", end: "18:00" },
};

interface ProfileForm {
  businessName: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  instagramHandle: string;
  businessType: string;
  currency: string;
}

export default function BusinessProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileForm>({
    businessName: "",
    tagline: "",
    description: "",
    address: "",
    city: "Nairobi",
    country: "Kenya",
    phone: "",
    email: "",
    website: "",
    instagramHandle: "",
    businessType: "Retail & Fashion",
    currency: "KES",
  });

  const [hours, setHours] = useState<Record<string, BusinessHours>>(DEFAULT_HOURS);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const settings = await api.get<TenantSettings>("/settings");
        setForm((prev) => ({
          ...prev,
          businessName: settings.business_name ?? "",
          businessType: settings.business_type ?? "Retail & Fashion",
        }));
        if (settings.business_hours) {
          try {
            const parsed = JSON.parse(settings.business_hours);
            setHours(parsed);
          } catch {
            // keep defaults
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.patch("/settings", {
        business_name: form.businessName,
        business_type: form.businessType,
        business_hours: JSON.stringify(hours),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateHours = (day: string, field: keyof BusinessHours, value: string | boolean) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
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
          <h1 className="text-xl font-bold text-slate-900">Business Profile</h1>
          <p className="text-sm text-slate-500">This information is used by the AI to answer customer questions</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm gap-1.5 flex items-center">
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : saved ? (
            <AlertCircle size={15} />
          ) : (
            <Save size={15} />
          )}
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-800">Basic Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Name</label>
                <input
                  className="input-field"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tagline</label>
                <input
                  className="input-field"
                  placeholder="A short description of your business"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Description</label>
                <textarea
                  className="input-field h-28 resize-none text-sm leading-relaxed"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <p className="text-xs text-slate-400 mt-1">
                  {form.description.length} characters — AI uses this to describe your business to customers
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Type</label>
                  <select
                    className="input-field text-sm"
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                  >
                    {[
                      "Retail & Fashion",
                      "Food & Restaurant",
                      "Electronics",
                      "Pharmacy / Health",
                      "Real Estate",
                      "Beauty & Salon",
                      "Education",
                      "Other",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency</label>
                  <select
                    className="input-field text-sm"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="KES">KES — Kenyan Shilling</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="TZS">TZS — Tanzanian Shilling</option>
                    <option value="UGX">UGX — Ugandan Shilling</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Phone size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-800">Contact Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Phone Number", key: "phone", icon: Phone, placeholder: "+254 7XX XXX XXX" },
                { label: "Email Address", key: "email", icon: Mail, placeholder: "hello@business.co.ke" },
                { label: "Website", key: "website", icon: Globe, placeholder: "www.business.co.ke" },
                { label: "Instagram Handle", key: "instagramHandle", icon: Globe, placeholder: "@mybusiness_ke" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                  <div className="relative">
                    <field.icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="input-field pl-9 text-sm"
                      placeholder={field.placeholder}
                      value={form[field.key as keyof ProfileForm]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-800">Location</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Street Address</label>
                <input
                  className="input-field"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                  <input
                    className="input-field"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
                  <input
                    className="input-field"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-brand-600" />
              <h2 className="font-semibold text-slate-800">Business Hours</h2>
            </div>
            <div className="space-y-3">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-3">
                  <div className="w-24 shrink-0">
                    <p className="text-sm font-medium text-slate-700">{day.slice(0, 3)}</p>
                  </div>
                  <button
                    onClick={() => updateHours(day, "open", !hours[day].open)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      hours[day].open
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {hours[day].open ? "Open" : "Closed"}
                  </button>
                  {hours[day].open && (
                    <>
                      <select
                        className="input-field py-1.5 text-xs flex-1"
                        value={hours[day].start}
                        onChange={(e) => updateHours(day, "start", e.target.value)}
                      >
                        {HOURS.map((h) => (
                          <option key={h.value} value={h.value}>
                            {h.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-slate-400 text-xs">to</span>
                      <select
                        className="input-field py-1.5 text-xs flex-1"
                        value={hours[day].end}
                        onChange={(e) => updateHours(day, "end", e.target.value)}
                      >
                        {HOURS.map((h) => (
                          <option key={h.value} value={h.value}>
                            {h.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Preview */}
        <div>
          <div className="card sticky top-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">AI Preview</h3>
            <p className="text-xs text-slate-500 mb-3 italic">How AI introduces your business:</p>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              &ldquo;Welcome to <strong>{form.businessName || "your business"}</strong>!{" "}
              {form.tagline ? form.tagline + ". " : ""}
              {form.description.slice(0, 100)}
              {form.description.length > 100 ? "..." : ""}
              <br />
              <br />
              We&apos;re located at {form.address || "our address"}, {form.city}. You can reach us at{" "}
              {form.phone || "our phone"} or {form.email || "our email"}.&rdquo;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
