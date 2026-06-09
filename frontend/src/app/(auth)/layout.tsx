import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">NURA</span>
        </Link>
        <p className="text-sm text-slate-500">
          Built by{" "}
          <a href="https://datamonks.com" className="text-brand-600 font-medium hover:underline">
            Datamonks
          </a>
        </p>
      </div>

      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-brand-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        {children}
      </div>

      <div className="text-center py-4 text-xs text-slate-400">
        © 2026 Datamonks Ltd ·{" "}
        <a href="#" className="hover:text-brand-600">Privacy</a> ·{" "}
        <a href="#" className="hover:text-brand-600">Terms</a>
      </div>
    </div>
  );
}
