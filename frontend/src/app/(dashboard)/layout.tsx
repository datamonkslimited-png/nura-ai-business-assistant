"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Thursday, June 4, 2026" },
  "/inbox": { title: "Messages", subtitle: "Your messaging command center" },
  "/inbox/overview": { title: "Inbox Overview" },
  "/inbox/analytics": { title: "Lead Analytics" },
  "/inbox/queue": { title: "Action Queue" },
  "/inbox/support": { title: "Support Tickets" },
  "/products": { title: "Products", subtitle: "Manage your product catalog" },
  "/orders": { title: "Orders", subtitle: "Manage all customer orders" },
  "/orders/list": { title: "Orders List" },
  "/orders/credit": { title: "Credit Orders" },
  "/campaigns": { title: "Bulk Campaigns" },
  "/bookings": { title: "Bookings", subtitle: "Manage appointments and reservations" },
  "/customers": { title: "Customers" },
  "/knowledge": { title: "AI Knowledge Base" },
  "/knowledge/profile": { title: "Business Profile" },
  "/knowledge/documents": { title: "Business Documents" },
  "/knowledge/instructions": { title: "AI Instructions" },
  "/knowledge/faq": { title: "FAQs & Q&A" },
  "/knowledge/delivery": { title: "Delivery Zones" },
  "/settings": { title: "Settings" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const meta = PAGE_TITLES[pathname] ?? { title: "NURA" };

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      <Sidebar
        businessName="Selpher's Workspace"
        email="selpher@business.co.ke"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
