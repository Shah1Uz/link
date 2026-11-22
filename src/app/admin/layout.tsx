import React from "react";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await verifyAdminSession();

  if (!admin) {
    redirect("/sign-in?admin=required");
  }

  return (
    <div className="relative isolate flex min-h-screen bg-background text-foreground">
      {/* Ambient mission-control backdrop: aurora glow + faint grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 isolate overflow-hidden"
      >
        <div className="aurora" />
        <div className="grid-pattern absolute inset-0 opacity-60 dark:opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/70" />
      </div>

      <AdminSidebar
        admin={{
          name: admin.name,
          email: admin.email,
          role: admin.role,
          avatarUrl: admin.avatar || admin.profile?.avatarUrl || null,
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <main id="admin-main" className="flex-1 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}
