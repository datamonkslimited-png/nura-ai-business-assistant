"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BarChart3, Activity, CreditCard,
  Settings, Zap, Shield, GitBranch, LogOut
} from "lucide-react";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Tenants", href: "/admin/tenants", icon: Users },
  { label: "Revenue Analytics", href: "/admin/analytics", icon: CreditCard },
  { label: "AI Monitoring", href: "/admin/ai-monitoring", icon: Activity },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: BarChart3 },
  { label: "Referral Agents", href: "/admin/referrals", icon: GitBranch },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Admin sidebar */}
      <aside className="w-[220px] shrink-0 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shrink-0">
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">NURA Admin</p>
              <div className="flex items-center gap-1">
                <Shield size={10} className="text-red-400" />
                <p className="text-xs text-red-400 font-medium">Super Admin</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-brand-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all">
            <LogOut size={16} /> Exit Admin
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
