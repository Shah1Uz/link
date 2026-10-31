"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Users,
  LayoutTemplate,
  Flag,
  CreditCard,
  Settings,
  History,
  LayoutDashboard,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/reports", label: "Reports & Moderation", icon: Flag },
  { href: "/admin/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/admin/support", label: "Support Tickets", icon: LifeBuoy },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: History },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <Link href="/admin" className="flex items-center gap-2.5 font-bold tracking-tight text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <span className="text-zinc-900 dark:text-white">Admin<span className="text-red-500">Center</span></span>
          </Link>
          <Badge variant="destructive" className="text-[10px] uppercase font-bold">
            RESTRICTED
          </Badge>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Return to Creator Dashboard */}
      <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="w-full justify-start text-xs rounded-xl">
            <ArrowLeft className="h-3.5 w-3.5 mr-2" />
            <span>Creator Dashboard</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}

