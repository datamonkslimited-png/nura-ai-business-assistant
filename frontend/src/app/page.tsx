"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MessageSquare, Zap, ShoppingCart, BarChart3, Check,
  ArrowRight, Star, Bot, CreditCard, Users,
  Package, Bell, TrendingUp, ChevronRight, Sparkles,
  Shield, Globe, Clock
} from "lucide-react";

/* ─── Animation helpers ─── */
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
});

const revealLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -32 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
});

const revealRight = (delay = 0) => ({
  initial: { opacity: 0, x: 32 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
});

/* ─── NAVBAR ─── */
function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand">
            <Zap size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-extrabold text-slate-900 tracking-tight">NURA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          {[["#features","Features"],["#how-it-works","How it Works"],["#pricing","Pricing"],["#businesses","Businesses"]].map(([href,label]) => (
            <a key={href} href={href} className="hover:text-brand-700 transition-colors">{label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5">
            Log in
          </Link>
          <Link href="/onboarding"
            className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-full transition-all shadow-brand hover:shadow-brand-lg">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── HERO ─── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-white">
      {/* Blue geometric background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[55%] h-[85%] bg-brand-50 rounded-bl-[100px]" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-brand-100/60 rounded-full blur-3xl" />
        <div className="absolute bottom-16 left-0 w-56 h-56 bg-blue-100/50 rounded-full blur-3xl" />
        {/* Grid dots */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#2563eb"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Copy */}
        <div>
          <motion.div {...reveal(0)}
            className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7">
            <Sparkles size={12} strokeWidth={2.5} /> AI Employee for Kenyan Businesses
          </motion.div>

          <motion.h1 {...reveal(0.08)}
            className="hero-headline text-[3.4rem] sm:text-[4rem] text-slate-900 mb-5">
            Your AI Employee<br />
            <span className="gradient-text">That Never&nbsp;Sleeps</span>
          </motion.h1>

          <motion.p {...reveal(0.16)}
            className="text-lg text-slate-500 leading-relaxed mb-9 max-w-[440px]">
            Capture more sales, automate bookings, take M-Pesa payments and support customers 24/7 — right on WhatsApp.
          </motion.p>

          <motion.div {...reveal(0.22)} className="flex flex-wrap gap-3 mb-10">
            <Link href="/onboarding"
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-7 py-3.5 rounded-full transition-all shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5">
              Start Free Trial <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <a href="#how-it-works"
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-7 py-3.5 rounded-full hover:border-brand-300 hover:text-brand-700 transition-all hover:-translate-y-0.5">
              See how it works
            </a>
          </motion.div>

          <motion.div {...reveal(0.28)} className="flex items-center gap-5">
            <div className="flex -space-x-2">
              {["GW","JK","PM","SN"].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-brand-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">{i}</div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_,i) => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs text-slate-500">Trusted by <strong className="text-slate-800">500+</strong> Kenyan businesses</p>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:block text-xs text-slate-500">
              <span className="font-semibold text-slate-800">14-day</span> free trial<br />No credit card
            </div>
          </motion.div>
        </div>

        {/* Dashboard Mockup */}
        <motion.div {...revealRight(0.1)} className="relative hidden lg:block">
          {/* Main dashboard card */}
          <div className="relative bg-white rounded-3xl shadow-float border border-slate-100 p-5 ml-6 z-10">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-50">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
                <Zap size={13} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Mama Grace's Bakery</p>
                <p className="text-[10px] text-slate-400">NURA Dashboard · Live</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
              </span>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Messages", val: "127", color: "bg-brand-50 text-brand-700 border-brand-100" },
                { label: "Orders", val: "23", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                { label: "Revenue", val: "KSh 45k", color: "bg-amber-50 text-amber-700 border-amber-100" },
              ].map((s) => (
                <div key={s.label} className={`${s.color} border rounded-xl p-2.5 text-center`}>
                  <p className="text-sm font-black">{s.val}</p>
                  <p className="text-[9px] font-semibold mt-0.5 opacity-70">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Mini bar chart */}
            <div className="flex items-end gap-1 h-14 mb-4 px-1">
              {[35,58,42,75,55,88,70].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-brand-600" style={{ height: `${h}%`, opacity: 0.15 + (i / 7) * 0.85 }} />
              ))}
            </div>

            {/* Recent messages */}
            <div className="space-y-2">
              {[
                { name: "Joyce K.", msg: "I want 2 chocolate cakes 🎂", time: "2m", avatar: "bg-brand-600" },
                { name: "Peter M.", msg: "M-Pesa payment confirmed ✅", time: "5m", avatar: "bg-emerald-600" },
                { name: "Sarah W.", msg: "When is delivery to Westlands?", time: "11m", avatar: "bg-amber-500" },
              ].map((m) => (
                <div key={m.name} className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
                  <div className={`w-6 h-6 ${m.avatar} rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0`}>{m.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-800">{m.name}</p>
                    <p className="text-[9px] text-slate-500 truncate">{m.msg}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 shrink-0">{m.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating payment card */}
          <motion.div
            animate={{ y: [0, -9, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
            className="absolute -top-8 -left-6 bg-white rounded-2xl shadow-float border border-slate-100 p-3.5 flex items-center gap-3 z-20">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <CreditCard size={17} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Payment received</p>
              <p className="text-[10px] text-emerald-600 font-semibold">KSh 3,200 via M-Pesa</p>
            </div>
          </motion.div>

          {/* Floating AI badge */}
          <motion.div
            animate={{ y: [0, 9, 0] }}
            transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 0.6 }}
            className="absolute -bottom-6 -right-6 bg-brand-600 rounded-2xl shadow-brand-lg p-3.5 flex items-center gap-2.5 z-20">
            <Bot size={16} className="text-white" />
            <div>
              <p className="text-[10px] font-semibold text-white">AI replied</p>
              <p className="text-[10px] text-brand-200">0.8s response time</p>
            </div>
          </motion.div>

          {/* Floating booking card */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1.2 }}
            className="absolute top-1/3 -left-16 bg-white rounded-xl shadow-float border border-slate-100 px-3 py-2.5 z-20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <Check size={12} className="text-brand-600" strokeWidth={3} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-900">Booking confirmed</p>
                <p className="text-[9px] text-slate-500">Friday 2pm · Hair Braiding</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── STATS BAR ─── */
function StatsBar() {
  const stats = [
    { val: "500+", label: "Kenyan Businesses" },
    { val: "2M+",  label: "Messages Handled" },
    { val: "98%",  label: "Response Rate" },
    { val: "KSh 50M+", label: "Payments Processed" },
  ];
  return (
    <section className="bg-brand-600 py-11">
      <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
        {stats.map((s, i) => (
          <motion.div key={s.label} {...reveal(i * 0.07)}>
            <p className="font-display text-4xl font-extrabold mb-1">{s.val}</p>
            <p className="text-brand-200 text-sm font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── BUSINESS TYPES ─── */
function BusinessTypes() {
  const types = [
    { emoji: "🍞", label: "Bakery" },
    { emoji: "💅", label: "Salon" },
    { emoji: "✈️", label: "Travel" },
    { emoji: "🏥", label: "Clinic" },
    { emoji: "💊", label: "Pharmacy" },
    { emoji: "🍽️", label: "Restaurant" },
    { emoji: "🛍️", label: "Retail" },
  ];
  return (
    <section id="businesses" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5 text-center">
        <motion.p {...reveal(0)} className="section-label mb-3">Built for Every Business</motion.p>
        <motion.h2 {...reveal(0.08)} className="font-display text-4xl font-extrabold text-slate-900 mb-14">
          NURA works for your industry
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-4">
          {types.map((t, i) => (
            <motion.div key={t.label} {...reveal(i * 0.05)}
              whileHover={{ y: -5, scale: 1.04 }}
              className="flex flex-col items-center gap-2.5 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-2xl px-7 py-5 cursor-pointer transition-all shadow-sm hover:shadow-brand">
              <span className="text-3xl">{t.emoji}</span>
              <span className="text-sm font-semibold text-slate-700">{t.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PROBLEM SECTION ─── */
function ProblemSection() {
  const problems = [
    { icon: MessageSquare, title: "Missed WhatsApp Messages", desc: "Customers message at 10pm. You're asleep. They order from a competitor.", bg: "bg-red-50", fg: "text-red-500" },
    { icon: ShoppingCart,  title: "No Booking System",        desc: "Customers call for appointments. You forget. Double bookings. Chaos.",  bg: "bg-orange-50", fg: "text-orange-500" },
    { icon: CreditCard,    title: "Manual Payment Chasing",   desc: "You send M-Pesa numbers. They forget. You follow up. Awkward.",          bg: "bg-amber-50", fg: "text-amber-500" },
    { icon: Bell,          title: "Zero Follow-ups",          desc: "Customers buy once, never return. No reminders. Lost forever.",           bg: "bg-rose-50", fg: "text-rose-500" },
  ];
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <motion.p {...reveal(0)} className="section-label mb-3">The Problem</motion.p>
          <motion.h2 {...reveal(0.08)} className="font-display text-4xl font-extrabold text-slate-900 mb-4">Every day you lose money</motion.h2>
          <motion.p {...reveal(0.14)} className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            Kenyan SMEs lose up to <strong className="text-slate-800">40% of potential revenue</strong> from missed messages, manual processes, and no automation.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map((p, i) => (
            <motion.div key={p.title} {...reveal(i * 0.08)}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
              <div className={`w-11 h-11 rounded-2xl ${p.bg} flex items-center justify-center mb-4`}>
                <p.icon size={20} className={p.fg} />
              </div>
              <h3 className="font-display font-bold text-slate-900 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─── */
function HowItWorks() {
  const steps = [
    { icon: Users,       label: "Customer",  bg: "bg-slate-800",   shadow: "" },
    { icon: MessageSquare, label: "WhatsApp", bg: "bg-emerald-600", shadow: "" },
    { icon: Bot,         label: "NURA AI",   bg: "bg-brand-600",   shadow: "shadow-brand" },
    { icon: CreditCard,  label: "M-Pesa",    bg: "bg-green-600",   shadow: "" },
    { icon: Package,     label: "Order",     bg: "bg-amber-600",   shadow: "" },
    { icon: TrendingUp,  label: "Revenue",   bg: "bg-brand-800",   shadow: "" },
  ];
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <motion.p {...reveal(0)} className="section-label mb-3">How It Works</motion.p>
          <motion.h2 {...reveal(0.08)} className="font-display text-4xl font-extrabold text-slate-900">Simple as sending a message</motion.h2>
        </div>

        {/* Flow */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-20">
          {steps.map((s, i) => (
            <motion.div key={s.label} {...reveal(i * 0.07)} className="flex items-center gap-2">
              <div className={`flex flex-col items-center ${s.bg} ${s.shadow} rounded-2xl px-6 py-4 text-white text-center`}>
                <s.icon size={22} className="mb-2" />
                <span className="text-xs font-semibold">{s.label}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight size={18} className="text-slate-300 shrink-0" />}
            </motion.div>
          ))}
        </div>

        {/* Feature trio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Bot,        title: "AI Replies Instantly",    desc: "Understands Swahili & English. Greets, answers questions, takes orders and handles FAQs — automatically.", dot: "bg-brand-600" },
            { icon: CreditCard, title: "M-Pesa in One Tap",       desc: "Customer says 'I'll pay' — NURA sends STK Push. Payment confirmed in seconds. Zero friction.", dot: "bg-emerald-600" },
            { icon: BarChart3,  title: "Dashboard Updates Live",  desc: "Every order, booking, message and payment appears in your dashboard in real time. Always in control.", dot: "bg-amber-500" },
          ].map((f, i) => (
            <motion.div key={f.title} {...reveal(i * 0.08)}
              className="relative bg-white border border-slate-100 rounded-3xl p-7 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
              <div className={`w-2 h-2 rounded-full ${f.dot} mb-5`} />
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                <f.icon size={22} className="text-brand-600" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES SPLIT ─── */
function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-20">
          <motion.p {...reveal(0)} className="section-label mb-3">All the Tools You Need</motion.p>
          <motion.h2 {...reveal(0.08)} className="font-display text-4xl font-extrabold text-slate-900">
            Built for Kenyan SMEs
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div {...revealLeft(0)}>
            <p className="section-label mb-3">AI Employee</p>
            <h3 className="font-display text-3xl font-extrabold text-slate-900 mb-5 leading-tight">
              Handles customers like a trained staff member
            </h3>
            <div className="space-y-5">
              {[
                { title: "Auto-replies to WhatsApp 24/7",     desc: "Responds to greetings, product questions and price enquiries instantly." },
                { title: "Takes orders and bookings",          desc: "Captures all order details, confirms with the customer, logs to dashboard." },
                { title: "Sends M-Pesa STK Push automatically", desc: "Triggers payment request the moment a customer confirms an order." },
                { title: "Speaks Swahili & English",           desc: "Detects language and replies accordingly. No extra setup needed." },
              ].map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} className="text-brand-700" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{f.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/onboarding"
              className="mt-8 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-7 py-3.5 rounded-full transition-all shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5">
              Get Started <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </motion.div>

          <motion.div {...revealRight(0.1)} className="relative hidden lg:block">
            {/* Background card */}
            <div className="bg-brand-50 rounded-3xl p-1 h-80 relative">
              {/* Order card */}
              <div className="absolute top-6 left-5 right-5 bg-white rounded-2xl shadow-card p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <Check size={12} className="text-emerald-600" strokeWidth={3} />
                  </div>
                  <p className="text-xs font-bold text-slate-900">New Order · Mama Grace's Bakery</p>
                  <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Paid ✓</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-brand-50 rounded-xl p-2"><p className="text-sm font-black text-brand-700">2×</p><p className="text-[9px] text-slate-500">Cakes</p></div>
                  <div className="bg-emerald-50 rounded-xl p-2"><p className="text-sm font-black text-emerald-700">KSh 1,200</p><p className="text-[9px] text-slate-500">M-Pesa</p></div>
                  <div className="bg-amber-50 rounded-xl p-2"><p className="text-sm font-black text-amber-700">Today</p><p className="text-[9px] text-slate-500">Delivery</p></div>
                </div>
              </div>

              {/* Chat card */}
              <div className="absolute bottom-5 left-5 right-5 bg-white rounded-2xl shadow-card p-4 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 mb-2.5">NURA AI · WhatsApp</p>
                <div className="bg-brand-600 text-white text-xs rounded-2xl rounded-tl-none px-3 py-2 inline-block mb-2">
                  Karibu! 👋 I'm Nura from Mama Grace's. How can I help?
                </div>
                <div className="bg-slate-100 text-slate-700 text-xs rounded-2xl rounded-tr-none px-3 py-2 inline-block ml-10">
                  Nataka kuorder chocolate cake
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Second feature row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...revealLeft(0.1)} className="relative hidden lg:block order-2 lg:order-1">
            <div className="bg-slate-900 rounded-3xl p-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold">Analytics · This Week</p>
                <span className="text-xs bg-brand-600 px-2 py-0.5 rounded-full">Live</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Total Revenue", val: "KSh 127,400", up: true },
                  { label: "Orders", val: "89", up: true },
                  { label: "Conversations", val: "342", up: true },
                  { label: "Bookings", val: "34", up: false },
                ].map((k) => (
                  <div key={k.label} className="bg-slate-800 rounded-xl p-3">
                    <p className="text-xs text-slate-400">{k.label}</p>
                    <p className="text-base font-extrabold text-white mt-0.5">{k.val}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${k.up ? "text-emerald-400" : "text-red-400"}`}>{k.up ? "↑ 12%" : "↓ 3%"}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-1 h-16">
                {[30,55,40,72,58,84,67].map((h,i) => (
                  <div key={i} className="flex-1 rounded-t bg-brand-600" style={{ height: `${h}%`, opacity: 0.3 + (i/7)*0.7 }} />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div {...revealRight(0)} className="order-1 lg:order-2">
            <p className="section-label mb-3">Business Analytics</p>
            <h3 className="font-display text-3xl font-extrabold text-slate-900 mb-5 leading-tight">
              Know your business inside out
            </h3>
            <div className="space-y-5">
              {[
                { title: "Real-time revenue tracking", desc: "See KSh flowing in as M-Pesa payments land. Track daily, weekly, monthly." },
                { title: "Conversation analytics",     desc: "Understand which products customers ask about most. Spot trends." },
                { title: "AI performance metrics",     desc: "Response time, resolution rate, handoff rate — all tracked automatically." },
                { title: "Customer insights",          desc: "See your top customers, repeat buyers, and who hasn't ordered in a while." },
              ].map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} className="text-brand-700" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{f.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA BAND ─── */
function CTABand() {
  return (
    <section className="py-24 bg-brand-600 relative overflow-hidden">
      {/* Geometric shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
      <div className="absolute inset-0">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-5 text-center relative">
        <motion.p {...reveal(0)} className="text-brand-200 text-xs font-semibold uppercase tracking-widest mb-4">Launch Your AI Employee Today</motion.p>
        <motion.h2 {...reveal(0.08)} className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
          Ready? Let's go live<br />in under 5 minutes
        </motion.h2>
        <motion.p {...reveal(0.14)} className="text-brand-100 text-lg mb-10 max-w-xl mx-auto">
          No technical skills required. Connect WhatsApp, add your products, and NURA starts selling immediately.
        </motion.p>
        <motion.div {...reveal(0.18)} className="flex flex-wrap gap-4 justify-center">
          <Link href="/onboarding"
            className="flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-full hover:bg-brand-50 transition-all shadow-xl hover:-translate-y-0.5">
            Start Free Trial <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
          <a href="https://wa.me/254700000000"
            className="flex items-center gap-2 bg-white/10 backdrop-blur text-white font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition-all border border-white/20 hover:-translate-y-0.5">
            <MessageSquare size={18} /> Chat on WhatsApp
          </a>
        </motion.div>
        <motion.p {...reveal(0.24)} className="mt-6 text-brand-200 text-sm">
          14-day free trial · No credit card · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}

/* ─── PRICING ─── */
function PricingSection() {
  const plans = [
    {
      name: "Starter", price: "2,500", desc: "For small businesses getting started",
      features: ["1 WhatsApp number","500 AI conversations/month","50 products","M-Pesa integration","Basic analytics","Email support"],
      cta: "Get Started", highlight: false,
    },
    {
      name: "Growth", price: "6,500", desc: "For growing businesses with more volume",
      features: ["2 WhatsApp numbers","2,000 AI conversations/month","300 products","M-Pesa + bulk campaigns","Bookings management","Advanced analytics","Priority support","Facebook Messenger"],
      cta: "Start Growing", highlight: true,
    },
    {
      name: "Business", price: "Custom", desc: "For agencies and large businesses",
      features: ["Unlimited WhatsApp numbers","Unlimited AI conversations","Custom AI training","White-label option","API access","Dedicated account manager","SLA guarantee"],
      cta: "Contact Sales", highlight: false,
    },
  ];
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <motion.p {...reveal(0)} className="section-label mb-3">Pricing</motion.p>
          <motion.h2 {...reveal(0.08)} className="font-display text-4xl font-extrabold text-slate-900 mb-3">Choose Your Plan</motion.h2>
          <motion.p {...reveal(0.14)} className="text-slate-500">All prices in KSh. 14-day free trial. No credit card needed.</motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} {...reveal(i * 0.08)}
              className={`rounded-3xl p-8 border relative ${plan.highlight
                ? "bg-brand-600 border-brand-500 shadow-brand-lg md:scale-105 md:-mt-2"
                : "bg-white border-slate-200 shadow-sm"}`}>
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                  Most Popular
                </div>
              )}
              <h3 className={`font-display text-xl font-extrabold mb-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
              <p className={`text-sm mb-5 ${plan.highlight ? "text-brand-200" : "text-slate-500"}`}>{plan.desc}</p>
              <div className="mb-7">
                {plan.price !== "Custom" ? (
                  <><span className={`font-display text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-slate-900"}`}>KSh {plan.price}</span>
                  <span className={`text-sm ml-1.5 ${plan.highlight ? "text-brand-200" : "text-slate-400"}`}>/month</span></>
                ) : (
                  <span className={`font-display text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-slate-900"}`}>Custom</span>
                )}
              </div>
              <ul className="space-y-3.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <Check size={14} className={plan.highlight ? "text-brand-200" : "text-brand-600"} strokeWidth={3} />
                    <span className={`text-sm ${plan.highlight ? "text-brand-100" : "text-slate-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/onboarding"
                className={`block text-center font-semibold py-3.5 rounded-full transition-all ${plan.highlight
                  ? "bg-white text-brand-700 hover:bg-brand-50"
                  : "bg-brand-600 text-white hover:bg-brand-700 shadow-brand"}`}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ─── */
function Testimonials() {
  const reviews = [
    { name: "Grace Wanjiku",  role: "Owner, Luxe Salon Karen",       text: "NURA handles all our WhatsApp bookings. I wake up to confirmed appointments and M-Pesa payments already in. Life-changing.", rating: 5 },
    { name: "John Kamau",     role: "Manager, Mama's Kitchen",        text: "We were losing so many orders to missed messages. Now NURA replies in seconds, even at midnight. Sales up 60% in 2 months.", rating: 5 },
    { name: "Sarah Otieno",   role: "Founder, Nairobi Bakers Co.",    text: "The M-Pesa integration is seamless. Customer orders, NURA sends payment request, money lands. No more chasing payments!", rating: 5 },
  ];
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <motion.p {...reveal(0)} className="section-label mb-3">Testimonials</motion.p>
          <motion.h2 {...reveal(0.08)} className="font-display text-4xl font-extrabold text-slate-900">What businesses say</motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div key={r.name} {...reveal(i * 0.08)}
              className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
              <div className="flex gap-0.5 mb-5">{[...Array(r.rating)].map((_,j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-600 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0">{r.name[0]}</div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <Zap size={13} className="text-white" />
              </div>
              <span className="font-display text-base font-extrabold text-white">NURA</span>
            </div>
            <p className="text-sm leading-relaxed">AI Employee platform for Kenyan SMEs. A product of <a href="https://datamonks.com" className="text-brand-400 hover:text-brand-300 transition-colors">DataMonks</a></p>
            <p className="text-xs mt-3 text-slate-600">Nairobi, Kenya 🇰🇪</p>
          </div>
          {[
            { title: "Product", links: ["Features","Pricing","Demo","Changelog","API"] },
            { title: "Company", links: ["About","Blog","Careers","Contact"] },
            { title: "Legal",   links: ["Privacy","Terms","Security","Cookies"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
              <ul className="space-y-2.5">{col.links.map((l) => <li key={l}><a href="#" className="text-sm hover:text-brand-400 transition-colors">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© 2026 DataMonks Limited. All rights reserved. NURA™ is a trademark of DataMonks.</p>
          <p>datamonks.com · robotics.africa</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── PAGE EXPORT ─── */
export default function HomePage() {
  return (
    <div className="font-body">
      <Navbar />
      <Hero />
      <StatsBar />
      <BusinessTypes />
      <ProblemSection />
      <HowItWorks />
      <FeaturesSection />
      <CTABand />
      <PricingSection />
      <Testimonials />
      <Footer />
    </div>
  );
}
