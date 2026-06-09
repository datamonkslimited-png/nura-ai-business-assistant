"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User, Phone, Check, X, AlertCircle } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const BOOKINGS = [
  { id: "b1", name: "Faith Njeri", phone: "+254 756 789 012", service: "Hair Braiding", date: "2026-06-08", time: "09:00", duration: 90, status: "confirmed" },
  { id: "b2", name: "Grace Akinyi", phone: "+254 778 901 234", service: "Manicure & Pedicure", date: "2026-06-08", time: "11:00", duration: 60, status: "confirmed" },
  { id: "b3", name: "Joyce Kamau", phone: "+254 712 345 678", service: "Facial Treatment", date: "2026-06-08", time: "14:00", duration: 45, status: "pending" },
  { id: "b4", name: "Sarah Wanjiru", phone: "+254 734 567 890", service: "Hair Braiding", date: "2026-06-09", time: "10:00", duration: 90, status: "confirmed" },
  { id: "b5", name: "David Otieno", phone: "+254 767 890 123", service: "Consultation", date: "2026-06-10", time: "16:00", duration: 30, status: "pending" },
  { id: "b6", name: "Peter Mwangi", phone: "+254 723 456 789", service: "Massage", date: "2026-06-11", time: "13:00", duration: 60, status: "confirmed" },
];

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", class: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  pending: { label: "Pending", class: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  cancelled: { label: "Cancelled", class: "bg-red-50 text-red-600", dot: "bg-red-500" },
};

const TODAY_BOOKINGS = BOOKINGS.filter((b) => b.date === "2026-06-08");
const UPCOMING = BOOKINGS.filter((b) => b.date > "2026-06-08");

export default function BookingsPage() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const today = new Date(2026, 5, 8); // June 2026
  const [currentMonth] = useState({ year: 2026, month: 5 });

  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const calDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const bookedDays = new Set(BOOKINGS.map((b) => parseInt(b.date.split("-")[2])));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bookings</h1>
          <p className="text-sm text-slate-500">{TODAY_BOOKINGS.length} appointments today</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 text-sm">
            <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded-lg font-medium transition-all ${view === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>List</button>
            <button onClick={() => setView("calendar")} className={`px-3 py-1.5 rounded-lg font-medium transition-all ${view === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Calendar</button>
          </div>
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Booking
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Today — June 8</h2>
            {TODAY_BOOKINGS.length === 0 ? (
              <div className="card text-center py-10 text-slate-400">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No bookings today</p>
              </div>
            ) : (
              TODAY_BOOKINGS.map((b) => {
                const st = STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG];
                return (
                  <div key={b.id} className="card flex items-start gap-4">
                    <div className="text-center shrink-0 w-14">
                      <p className="text-lg font-bold text-slate-900">{b.time}</p>
                      <p className="text-xs text-slate-400">{b.duration}min</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{b.name}</p>
                          <p className="text-sm text-slate-500">{b.service}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                            <Phone size={12} /> {b.phone}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${st.class}`}>{st.label}</span>
                      </div>
                    </div>
                    {b.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <button className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all">
                          <Check size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider pt-2">Upcoming</h2>
            {UPCOMING.map((b) => {
              const st = STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG];
              return (
                <div key={b.id} className="card flex items-start gap-4 opacity-80">
                  <div className="text-center shrink-0 w-14">
                    <p className="text-sm font-bold text-slate-700">{new Date(b.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</p>
                    <p className="text-xs text-slate-400">{b.time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{b.name}</p>
                    <p className="text-sm text-slate-500">{b.service} · {b.duration}min</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${st.class}`}>{st.label}</span>
                </div>
              );
            })}
          </div>

          {/* Availability panel */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-slate-900 mb-4">Today's Schedule</h3>
              <div className="space-y-2">
                {["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"].map((hr) => {
                  const booked = TODAY_BOOKINGS.find((b) => b.time === hr);
                  return (
                    <div key={hr} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-12 shrink-0">{hr}</span>
                      <div className={`flex-1 h-8 rounded-lg flex items-center px-2 text-xs font-medium ${
                        booked ? "bg-brand-100 text-brand-700" : "bg-slate-50 text-slate-300 border border-dashed border-slate-200"
                      }`}>
                        {booked ? booked.name : "Available"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-slate-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">This week</span>
                  <span className="font-semibold text-slate-900">12 bookings</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Completion rate</span>
                  <span className="font-semibold text-emerald-600">94%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Cancellations</span>
                  <span className="font-semibold text-red-500">2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Avg. duration</span>
                  <span className="font-semibold text-slate-900">62 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Calendar view */
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">{MONTHS[currentMonth.month]} {currentMonth.year}</h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-all"><ChevronLeft size={18} className="text-slate-500" /></button>
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-all"><ChevronRight size={18} className="text-slate-500" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calDays.map((day, i) => {
              const isToday = day === today.getDate();
              const hasBooking = day !== null && bookedDays.has(day);
              return (
                <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm cursor-pointer transition-all ${
                  day === null ? "" :
                  isToday ? "bg-brand-500 text-white font-bold" :
                  hasBooking ? "bg-brand-50 text-brand-700 font-medium hover:bg-brand-100" :
                  "hover:bg-slate-100 text-slate-700"
                }`}>
                  {day !== null && (
                    <>
                      {day}
                      {hasBooking && !isToday && <span className="w-1 h-1 rounded-full bg-brand-400 mt-0.5" />}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
