"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Zap, Phone, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { featuresApi, api, BusinessTemplate } from "@/lib/api";

const TOTAL_STEPS = 5;

const ROLES = [
  { id: "owner", label: "Business Owner", emoji: "👔", desc: "I run my own business" },
  { id: "manager", label: "Manager", emoji: "📋", desc: "I manage a team or location" },
  { id: "agency", label: "Agency", emoji: "🏢", desc: "I manage multiple clients" },
  { id: "freelancer", label: "Freelancer", emoji: "💼", desc: "I work independently" },
];

// Fallback types if API fails
const FALLBACK_TYPES: BusinessTemplate[] = [
  { id: "salon", key: "salon", name: "Salon & Beauty", description: null, icon: "💅", is_active: true },
  { id: "bakery", key: "bakery", name: "Bakery & Food", description: null, icon: "🍞", is_active: true },
  { id: "travel", key: "travel", name: "Travel & Tourism", description: null, icon: "✈️", is_active: true },
  { id: "clinic", key: "clinic", name: "Clinic & Health", description: null, icon: "🏥", is_active: true },
  { id: "pharmacy", key: "pharmacy", name: "Pharmacy", description: null, icon: "💊", is_active: true },
  { id: "retail", key: "retail", name: "Retail Shop", description: null, icon: "🛍️", is_active: true },
  { id: "restaurant", key: "restaurant", name: "Restaurant", description: null, icon: "🍽️", is_active: true },
  { id: "other", key: "other", name: "Other", description: null, icon: "✨", is_active: true },
];

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

interface OnboardingState {
  role: string;
  businessType: string;
  templateKey: string;
  businessName: string;
  phone: string;
  otp: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<OnboardingState>({
    role: "",
    businessType: "",
    templateKey: "",
    businessName: "",
    phone: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [templates, setTemplates] = useState<BusinessTemplate[]>(FALLBACK_TYPES);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [completingOnboarding, setCompletingOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load templates from API when reaching step 2
  useEffect(() => {
    if (step === 2) {
      setTemplatesLoading(true);
      featuresApi
        .listTemplates()
        .then((data) => {
          if (data && data.length > 0) setTemplates(data);
        })
        .catch(() => {
          // Keep fallback templates
        })
        .finally(() => setTemplatesLoading(false));
    }
  }, [step]);

  const goNext = () => {
    setDir(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const goBack = () => {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const sendOtp = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setOtpSent(true);
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setVerified(true);
    setLoading(false);
    setTimeout(goNext, 600);
  };

  const completeOnboarding = async () => {
    setCompletingOnboarding(true);
    setError(null);
    try {
      // Update tenant settings with business info
      await api.patch("/settings", {
        business_name: data.businessName,
        business_type: data.businessType,
        template_key: data.templateKey || data.businessType,
        owner_phone: data.phone ? `+254${data.phone}` : undefined,
      });

      // Assign feature template if a key is selected
      const templateKey = data.templateKey || data.businessType;
      if (templateKey) {
        await featuresApi.assignTemplate(templateKey).catch(() => {
          // Non-fatal: template assignment might not exist yet
        });
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete setup");
      setCompletingOnboarding(false);
    }
  };

  const canProceed =
    (step === 1 && data.role) ||
    (step === 2 && data.businessType) ||
    (step === 3 && data.businessName.trim().length >= 2) ||
    (step === 4 && verified) ||
    step === 5;

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-brand rounded-xl flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="text-xl font-black text-slate-900">NURA</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i + 1 <= step ? "bg-brand-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="p-6 sm:p-8"
            >
              {/* Step 1 — Role */}
              {step === 1 && (
                <div>
                  <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
                    Step 1 of {TOTAL_STEPS}
                  </p>
                  <h2 className="text-2xl font-black text-slate-900 mb-1">Who are you?</h2>
                  <p className="text-sm text-slate-500 mb-6">This helps us set up NURA for you.</p>
                  <div className="space-y-3">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setData((d) => ({ ...d, role: r.id }))}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                          data.role === r.id
                            ? "border-brand-500 bg-brand-50"
                            : "border-slate-100 bg-slate-50 hover:border-brand-200"
                        }`}
                      >
                        <span className="text-2xl">{r.emoji}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{r.label}</p>
                          <p className="text-xs text-slate-500">{r.desc}</p>
                        </div>
                        {data.role === r.id && (
                          <div className="ml-auto w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center shrink-0">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 — Business Type */}
              {step === 2 && (
                <div>
                  <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
                    Step 2 of {TOTAL_STEPS}
                  </p>
                  <h2 className="text-2xl font-black text-slate-900 mb-1">What do you sell?</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    We&apos;ll configure your AI agent for your industry.
                  </p>
                  {templatesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={24} className="animate-spin text-brand-500" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map((b) => (
                        <button
                          key={b.key}
                          onClick={() => setData((d) => ({ ...d, businessType: b.key, templateKey: b.key }))}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all ${
                            data.businessType === b.key
                              ? "border-brand-500 bg-brand-50"
                              : "border-slate-100 bg-slate-50 hover:border-brand-200"
                          }`}
                        >
                          <span className="text-3xl">{b.icon ?? "✨"}</span>
                          <span className="text-sm font-semibold text-slate-800">{b.name}</span>
                          {data.businessType === b.key && (
                            <span className="w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center">
                              <Check size={10} className="text-white" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3 — Business Name */}
              {step === 3 && (
                <div>
                  <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
                    Step 3 of {TOTAL_STEPS}
                  </p>
                  <h2 className="text-2xl font-black text-slate-900 mb-1">
                    What&apos;s your business called?
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Your AI agent will introduce itself as part of your team.
                  </p>
                  <input
                    type="text"
                    value={data.businessName}
                    onChange={(e) => setData((d) => ({ ...d, businessName: e.target.value }))}
                    placeholder="e.g. Mama Grace's Bakery"
                    className="w-full px-4 py-3.5 text-lg border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-brand-400 transition-all placeholder:text-slate-300"
                    autoFocus
                  />
                  {data.businessName && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-brand-50 border border-brand-100 rounded-2xl"
                    >
                      <p className="text-sm text-brand-700">
                        Your AI agent will be named{" "}
                        <strong>Nura from {data.businessName}</strong> 🤖
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 4 — Phone Verification */}
              {step === 4 && (
                <div>
                  <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
                    Step 4 of {TOTAL_STEPS}
                  </p>
                  <h2 className="text-2xl font-black text-slate-900 mb-1">Verify your number</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    We&apos;ll send an OTP to your WhatsApp or SMS.
                  </p>

                  {!otpSent ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1.5">
                          Phone Number
                        </label>
                        <div className="flex gap-2">
                          <div className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 shrink-0">
                            🇰🇪 +254
                          </div>
                          <input
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                            placeholder="712 345 678"
                            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 transition-all text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={sendOtp}
                        disabled={!data.phone || loading}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                            Sending...
                          </span>
                        ) : (
                          <>
                            <Phone size={16} /> Send OTP
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600">
                        OTP sent to <strong>+254 {data.phone}</strong>
                      </p>
                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1.5">
                          Enter 6-digit OTP
                        </label>
                        <input
                          type="number"
                          value={data.otp}
                          onChange={(e) => setData((d) => ({ ...d, otp: e.target.value }))}
                          placeholder="______"
                          maxLength={6}
                          className="w-full px-4 py-3.5 text-xl text-center font-mono tracking-[0.5em] border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-brand-400 transition-all"
                        />
                      </div>
                      {verified ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-medium">
                          <Check size={18} className="bg-emerald-100 rounded-full p-0.5" /> Verified!
                        </div>
                      ) : (
                        <button
                          onClick={verifyOtp}
                          disabled={data.otp.length < 6 || loading}
                          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                        >
                          {loading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            "Verify OTP"
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setOtpSent(false)}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        ← Change number
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5 — Success */}
              {step === 5 && (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Zap size={36} className="text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-2xl font-black text-slate-900 mb-2">You&apos;re all set! 🎉</h2>
                    <p className="text-slate-600 mb-2">
                      <strong>{data.businessName}</strong> is ready to launch.
                    </p>
                    <p className="text-sm text-slate-500 mb-8">
                      Connect WhatsApp and add your products to start taking AI-powered orders in minutes.
                    </p>

                    {error && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={completeOnboarding}
                      disabled={completingOnboarding}
                      className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base"
                    >
                      {completingOnboarding ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Setting up...
                        </>
                      ) : (
                        <>
                          Go to Dashboard <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                    <p className="mt-4 text-xs text-slate-400">Takes less than 5 minutes to go live</p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {step < 5 && (
            <div className="px-6 sm:px-8 pb-6 flex items-center justify-between">
              <button
                onClick={goBack}
                disabled={step === 1}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={goNext}
                disabled={!canProceed}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  canProceed ? "btn-primary" : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
              >
                {step === 4 ? "Finish" : "Continue"} <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
