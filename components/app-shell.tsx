"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FileText,
  LayoutDashboard,
  Menu,
  Plus,
  Receipt,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Expenses", href: "/expenses", icon: Receipt },
];

function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3"
      aria-label="InvoiceLite dashboard"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
        <FileText className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-[15px] font-bold tracking-tight text-slate-950">
          InvoiceLite
        </span>
        <span className="block text-[11px] font-medium text-slate-400">
          Freelance finance
        </span>
      </span>
    </Link>
  );
}

function Sidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      data-sidebar
      className={cn(
        "flex h-full w-64 flex-col border-r border-slate-200/80 bg-white",
        className,
      )}
    >
      <div className="px-6 py-7">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Primary navigation">
        {navigation.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.name}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="m-4 rounded-2xl bg-slate-950 p-4 text-white">
        <p className="text-xs font-medium text-slate-400">Quick create</p>
        <p className="mt-1 text-sm font-semibold">Ready to bill a client?</p>
        <Button
          asChild
          size="sm"
          className="mt-4 w-full bg-white text-slate-950 hover:bg-slate-100"
        >
          <Link href="/invoices/new" onClick={onNavigate}>
            <Plus className="h-4 w-4" />
            New invoice
          </Link>
        </Button>
      </div>
      <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
        Simple books. Clear head.
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Sidebar className="fixed inset-y-0 left-0 z-30 hidden lg:flex" />

      <header
        data-mobile-header
        className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden"
      >
        <Brand />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          <div className="relative h-full w-72 max-w-[85vw]">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
            <Button
              variant="outline"
              size="icon"
              className="absolute right-3 top-3"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <main className="dashboard-main lg:ml-64">
        <div className="dashboard-content mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
