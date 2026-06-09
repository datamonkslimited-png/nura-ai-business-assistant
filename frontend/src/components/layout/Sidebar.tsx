"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, ShoppingBag, Package, Calendar,
  Megaphone, Brain, Settings, Zap, ChevronDown,
  BarChart3, Users, HelpCircle, Truck, FileText, LogOut, X,
  AlertCircle, Activity, GitBranch, UserCheck, CreditCard, Plug, Bot
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Inbox",
    icon: MessageSquare,
    children: [
      { label: "Messages", href: "/inbox", icon: MessageSquare },
      { label: "Overview", href: "/inbox/overview", icon: Activity },
      { label: "Lead Analytics", href: "/inbox/analytics", icon: BarChart3 },
      { label: "Action Queue", href: "/inbox/queue", icon: AlertCircle },
      { label: "Bulk Campaigns", href: "/campaigns", icon: Megaphone },
      { label: "Support Tickets", href: "/inbox/support", icon: HelpCircle },
    ],
  },
  {
    label: "AI Knowledge Base",
    icon: Brain,
    children: [
      { label: "Business Profile", href: "/knowledge/profile", icon: FileText },
      { label: "Business Docs", href: "/knowledge/documents", icon: FileText },
      { label: "AI Instructions", href: "/knowledge/instructions", icon: Brain },
      { label: "FAQs & Q&A", href: "/knowledge/faq", icon: HelpCircle },
      { label: "Delivery Zones", href: "/knowledge/delivery", icon: Truck },
    ],
  },
  {
    label: "Products",
    href: "/products",
    icon: ShoppingBag,
  },
  {
    label: "Orders",
    icon: Package,
    children: [
      { label: "All Orders", href: "/orders", icon: Package },
      { label: "Orders List", href: "/orders/list", icon: Package },
      { label: "Credit Orders", href: "/orders/credit", icon: FileText },
      { label: "Agent Settings", href: "/orders/settings", icon: Settings },
    ],
  },
  {
    label: "Bookings",
    href: "/bookings",
    icon: Calendar,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    label: "Branches",
    href: "/branches",
    icon: GitBranch,
  },
  {
    label: "Staff",
    href: "/staff",
    icon: UserCheck,
  },
  {
    label: "Integrations",
    href: "/integrations",
    icon: Plug,
  },
  {
    label: "AI Settings",
    href: "/ai-settings",
    icon: Bot,
  },
  {
    label: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  businessName?: string;
  email?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ businessName = "My Business", email = "user@business.com", mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(["Inbox"]);

  const toggle = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={onMobileClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen z-40 bg-white border-r border-slate-100
        flex flex-col transition-transform duration-300
        w-[260px]
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shrink-0">
              <Zap size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{businessName}</p>
              <p className="text-xs text-slate-400 truncate">{email}</p>
            </div>
          </div>
          <button onClick={onMobileClose} className="md:hidden p-1 hover:bg-slate-100 rounded">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Label */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Now</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            if (item.children) {
              const isExpanded = expanded.includes(item.label);
              const hasActive = item.children.some((c) => isActive(c.href));
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggle(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      hasActive ? "text-brand-700 bg-brand-50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <item.icon size={18} className={hasActive ? "text-brand-600" : "text-slate-400"} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""} ${hasActive ? "text-brand-400" : "text-slate-300"}`} />
                  </button>
                  {isExpanded && (
                    <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-100 pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onMobileClose}
                          className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all duration-150 ${
                            isActive(child.href)
                              ? "text-brand-700 bg-brand-50 font-medium"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          <child.icon size={14} className={isActive(child.href) ? "text-brand-500" : "text-slate-300"} />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={onMobileClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive(item.href!)
                    ? "text-brand-700 bg-brand-50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon size={18} className={isActive(item.href!) ? "text-brand-600" : "text-slate-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-all duration-150">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
