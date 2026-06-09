"use client";

import { Bell, Menu, Search, ChevronDown, User, Settings, LogOut, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { agentApi } from "@/lib/api";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
  const [showUser, setShowUser] = useState(false);
  const [agentEnabled, setAgentEnabled] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    agentApi
      .getStatus()
      .then((r) => setAgentEnabled(r.enabled))
      .catch(() => {
        // silently fail — default to showing active
      });
  }, []);

  const handleAgentToggle = async () => {
    setToggling(true);
    try {
      const result = await agentApi.toggle();
      setAgentEnabled(result.enabled);
    } catch {
      // ignore
    } finally {
      setToggling(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search - hidden on mobile */}
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 text-sm bg-surface-50 border border-slate-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-500">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>

        {/* AI Agent ON/OFF quick toggle */}
        <button
          onClick={handleAgentToggle}
          disabled={toggling}
          title={agentEnabled ? "AI Agent is ON — click to pause" : "AI Agent is OFF — click to resume"}
          className={`hidden sm:flex items-center gap-1.5 border px-3 py-1.5 rounded-xl transition-colors ${
            agentEnabled
              ? "bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
              : "bg-slate-100 border-slate-200 hover:bg-slate-200"
          }`}
        >
          {toggling ? (
            <Loader2 size={12} className="animate-spin text-slate-400" />
          ) : (
            <div
              className={`w-2 h-2 rounded-full ${agentEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
            />
          )}
          <span
            className={`text-xs font-medium ${agentEnabled ? "text-emerald-700" : "text-slate-500"}`}
          >
            {agentEnabled ? "AI Active" : "AI Paused"}
          </span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center text-white text-sm font-bold">
              S
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">User</span>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl border border-slate-100 shadow-card py-1 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">Selpher Mafube</p>
                <p className="text-xs text-slate-500">selpher@business.co.ke</p>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings size={15} /> Settings
              </Link>
              <Link
                href="/settings/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <User size={15} /> Profile
              </Link>
              <div className="border-t border-slate-100 mt-1">
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full">
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
