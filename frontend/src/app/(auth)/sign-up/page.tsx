"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, Lock, Mail, User, Phone, Building2, Check, AlertCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const STEPS = ["Account", "Business", "Done"];

export default function SignUpPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    businessName: "",
    businessType: "",
    city: "",
  });

  const BUSINESS_TYPES = [
    "Retail & Fashion",
    "Food & Restaurant",
    "Electronics",
    "Pharmacy / Health",
    "Real Estate",
    "Transport & Logistics",
    "Beauty & Salon",
    "Education",
    "Other",
  ];

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            phone: `+254${form.phone}`,
            business_name: form.businessName,
            business_type: form.businessType,
            city: form.city,
          },
        },
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      setStep(2);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="w-full max-w-md">
        <div className="card shadow-brand p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Welcome to NURA!</h2>
          <p className="text-slate-600 mb-2">
            Your account for <strong>{form.businessName}</strong> has been created.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Check your email (<strong>{form.email}</strong>) to verify your account, then complete your workspace setup.
          </p>
          <Link href="/onboarding" className="btn-primary w-full py-3 justify-center">
            Set Up My Workspace
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="card shadow-brand p-8">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i < step ? "bg-emerald-500 text-white" :
                i === step ? "bg-brand-600 text-white" :
                "bg-slate-100 text-slate-400"
              }`}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? "text-brand-700" : "text-slate-400"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {step === 0 && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
              <p className="text-slate-500 text-sm">Start your free NURA workspace today</p>
            </div>
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Wanjiku" className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@mybusiness.co.ke" className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+254</span>
                  <input
                    type="tel" required value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="7XX XXX XXX" className="input-field pl-14"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"} required
                    minLength={8} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 8 characters" className="input-field pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3 justify-center mt-2">
                Continue <ArrowRight size={18} />
              </button>
            </form>
          </>
        )}

        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Your Business</h1>
              <p className="text-slate-500 text-sm">Tell us about your business so we can set up NURA correctly</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Name</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" required value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    placeholder="My Boutique Ltd" className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Type</label>
                <select
                  required value={form.businessType}
                  onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select business type...</option>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">City / Town</label>
                <input
                  type="text" required value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Nairobi, Mombasa, Kisumu..." className="input-field"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1 py-3 justify-center">
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 justify-center disabled:opacity-70">
                  {loading ? <><Loader2 size={18} className="animate-spin" />Creating...</> : <>Create Account <ArrowRight size={18} /></>}
                </button>
              </div>
            </form>
          </>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-brand-600 font-medium hover:underline">Sign in</Link>
        </p>
        <p className="text-center text-xs text-slate-400 mt-2">
          By signing up, you agree to our{" "}
          <a href="#" className="underline">Terms</a> and{" "}
          <a href="#" className="underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
