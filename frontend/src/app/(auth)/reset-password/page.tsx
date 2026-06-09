"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, Lock, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="w-full max-w-md">
        <div className="card shadow-brand p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Password updated!</h2>
          <p className="text-slate-600 mb-8">Your password has been reset successfully. Sign in with your new password.</p>
          <Link href="/sign-in" className="btn-primary w-full py-3 justify-center">
            Sign in now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="card shadow-brand p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={22} className="text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Set new password</h1>
          <p className="text-slate-500 text-sm">Must be at least 8 characters long.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"} required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter new password" className="input-field pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirm ? "text" : "password"} required
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Confirm your password" className="input-field pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 justify-center mt-2 disabled:opacity-70">
            {loading
              ? <><Loader2 size={18} className="animate-spin" />Updating...</>
              : <>Update Password <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
