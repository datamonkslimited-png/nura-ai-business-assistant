"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, User } from "lucide-react";

const BOOKINGS = [
  { id: "BK-001", date: "2026-06-08", time: "09:00", customer: "Joyce Kamau", service: "Personal Styling", staff: "Amina Hassan", color: "bg-brand-100 text-brand-800 border-brand-200" },
  { id: "BK-002", date: "2026-06-08", time: "11:00", customer: "Peter Mwangi", service: "Fitting Appointment", staff: "David Otieno", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "BK-003", date: "2026-06-10", time: "14:00", customer: "Sarah Wanjiru", service: "Personal Styling", staff: "Amina Hassan", color: "bg-brand-100 text-brand-800 border-brand-200" },
  { id: "BK-004", date: "2026-06-12", time: "10:00", customer: "Grace Akinyi", service: "Wardrobe Consultation", staff: "Amina Hassan", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "BK-005", date: "2026-06-12", time: "15:00", customer: "James Ochieng", service: "Fitting Appointment", staff: "David Otieno", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "BK-006", date: "2026-06-15", time: "09:30", customer: "Faith Njeri", service: "Group Styling", staff: "Amina Hassan", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "BK-007", date: "2026-06-18", time: "13:00", customer: "David Otieno", service: "Personal Styling", staff: "Amina Hassan", color: "bg-brand-100 text-brand-800 border-brand-200" },
  { id: "BK-008", date: "2026-06-20", time: "11:00", customer: "Samuel Kiprop", service: "Fitting Appointment", staff: "David Otieno", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function BookingCalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<"month" | "week">("month");

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const goToPrev = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const goToNext = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const dateStr = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const bookingsForDay = (day: number) =>
    BOOKINGS.filter((b) => b.date === dateStr(day));

  const selectedBookings = selectedDate ? BOOKINGS.filter((b) => b.date === selectedDate) : [];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Booking Calendar</h1>
          <p className="text-sm text-slate-500">View and manage bookings by date</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            <button onClick={() => setView("month")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${view === "month" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>Month</button>
            <button onClick={() => setView("week")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${view === "week" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>Week</button>
          </div>
          <Link href="/bookings" className="btn-primary text-sm gap-1.5">
            <Plus size={15} /> New Booking
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 card !p-0 overflow-hidden">
          {/* Month Nav */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <button onClick={goToPrev} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <h2 className="text-base font-bold text-slate-900">{MONTHS[currentMonth]} {currentYear}</h2>
            <button onClick={goToNext} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-slate-50 bg-slate-50/40" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const ds = dateStr(day);
              const dayBookings = bookingsForDay(day);
              const isToday = ds === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
              const isSelected = ds === selectedDate;
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
                  className={`min-h-[80px] border-b border-r border-slate-100 p-1.5 cursor-pointer transition-colors ${isSelected ? "bg-brand-50" : "hover:bg-slate-50"}`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full mb-1 ${isToday ? "bg-brand-600 text-white" : "text-slate-700"}`}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 2).map((b) => (
                      <div key={b.id} className={`text-xs px-1 py-0.5 rounded border truncate font-medium ${b.color}`}>
                        {b.time} {b.customer.split(" ")[0]}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-xs text-slate-400 font-medium px-1">+{dayBookings.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Services</h3>
            <div className="space-y-2">
              {[
                { label: "Personal Styling", color: "bg-brand-200" },
                { label: "Fitting Appointment", color: "bg-emerald-200" },
                { label: "Wardrobe Consultation", color: "bg-purple-200" },
                { label: "Group Styling", color: "bg-amber-200" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm text-slate-600">
                  <div className={`w-3 h-3 rounded-sm ${s.color}`} />
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Day Bookings */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {selectedDate ? `Bookings for ${selectedDate}` : "Select a date to view bookings"}
            </h3>
            {selectedBookings.length === 0 ? (
              <div className="text-center py-6">
                <Calendar size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">{selectedDate ? "No bookings on this day" : "Click any date"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedBookings.map((b) => (
                  <div key={b.id} className={`p-3 rounded-xl border ${b.color}`}>
                    <p className="text-xs font-bold">{b.service}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={11} />
                      <span className="text-xs">{b.time}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <User size={11} />
                      <span className="text-xs">{b.customer}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">This Month</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Bookings</span>
                <span className="font-semibold text-slate-800">{BOOKINGS.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Confirmed</span>
                <span className="font-semibold text-emerald-600">{BOOKINGS.filter(b => b.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`)).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
