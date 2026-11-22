import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedUser, ensureUserProfile, isEmailInAdminAllowlist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardProvider } from "@/context/dashboard-context";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardPreviewPanel } from "@/components/dashboard/dashboard-preview-panel";
import { DashboardMobileNav } from "@/components/layout/dashboard-mobile-nav";
import { ClerkProfileAutoSync } from "@/components/auth/clerk-auto-sync";
import { DashboardTourWrapper } from "@/components/dashboard/dashboard-tour-wrapper";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch full user profile, theme, links, collections
  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      theme: true,
      links: {
        orderBy: [{ isPinned: "desc" }, { position: "asc" }],
      },
      collections: {
        orderBy: { position: "asc" },
      },
    },
  });

  // If user has no profile yet, safely create a default profile so dashboard never crashes
  if (!profile) {
    const userWithProfile = await ensureUserProfile(user);
    if (userWithProfile?.id) {
      profile = await prisma.profile.findUnique({
        where: { userId: userWithProfile.id },
        include: {
          theme: true,
          links: {
            orderBy: [{ isPinned: "desc" }, { position: "asc" }],
          },
          collections: {
            orderBy: { position: "asc" },
          },
        },
      });
    }
  }

  const isAdmin = Boolean(
    user.role === "SUPER_ADMIN" ||
    user.role === "ADMIN" ||
    user.email.toLowerCase() === "shahuztech@gmail.com" ||
    isEmailInAdminAllowlist(user.email)
  );

  return (
    <DashboardProvider
      initialProfile={profile as any}
      initialTheme={profile?.theme as any}
      initialLinks={(profile?.links as any) || []}
      initialCollections={(profile?.collections as any) || []}
      initialTier={user.subscriptionTier as "FREE" | "PRO"}
      isAdmin={isAdmin}
      userEmail={user.email}
      userRole={user.role}
    >
      <ClerkProfileAutoSync />
      <DashboardTourWrapper />
      <div className="relative flex min-h-screen w-full max-w-full overflow-x-hidden bg-background">
        {/* Ambient studio backdrop: faint grid + aurora glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
          <div className="grid-pattern absolute inset-x-0 top-0 h-[560px] opacity-60 dark:opacity-30" />
          <div className="aurora" />
        </div>

        {/* Left Sidebar */}
        <DashboardSidebar />

        {/* Center Main Editing Area */}
        <div className="relative z-10 flex min-w-0 w-full max-w-full flex-1 flex-col overflow-x-hidden">
          <main className="flex-1 min-w-0 w-full max-w-full pb-24 lg:pb-16">{children}</main>
        </div>

        {/* Right Live Phone Mockup Preview Panel */}
        <DashboardPreviewPanel />

        {/* Mobile Bottom Navigation Bar */}
        <DashboardMobileNav />
      </div>
    </DashboardProvider>
  );
}
