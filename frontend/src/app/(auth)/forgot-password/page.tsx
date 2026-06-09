"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card shadow-brand p-8">
        {!sent ? (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={22} className="text-brand-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot password?</h1>
              <p className="text-slate-500 text-sm">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com" className="input-field pl-10"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 justify-center disabled:opacity-70">
                {loading
                  ? <><Loader2 size={18} className="animate-spin" />Sending...</>
                  : <>Send Reset Link <ArrowRight size={18} /></>}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Check your email</h2>
            <p className="text-slate-600 text-sm mb-2">
              We&apos;ve sent a password reset link to:
            </p>
            <p className="font-semibold text-slate-900 mb-6">{email}</p>
            <p className="text-slate-500 text-xs mb-6">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <button onClick={() => setSent(false)} className="text-brand-600 font-medium hover:underline">
                try again
              </button>
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <Link href="/sign-in" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-brand-600 font-medium">
            <ArrowLeft size={16} />
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
