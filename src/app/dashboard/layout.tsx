import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardProvider } from "@/context/dashboard-context";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardPreviewPanel } from "@/components/dashboard/dashboard-preview-panel";

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

  // If user has no profile yet, create a default profile so dashboard never crashes
  if (!profile) {
    const baseUsername = user.name
      ? user.name.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 20)
      : `creator_${user.id.slice(-6)}`;

    profile = await prisma.profile.create({
      data: {
        userId: user.id,
        username: baseUsername || `user_${Date.now().toString(36)}`,
        displayName: user.name || "New Creator",
        bio: "Welcome to my new BioSpace profile! Follow and connect below.",
        avatarUrl: user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
        category: "CREATOR",
        isPublished: true,
      },
      include: {
        theme: true,
        links: true,
        collections: true,
      },
    });

    // Create default theme
    await prisma.theme.create({
      data: {
        profileId: profile.id,
        backgroundColor: "#0d1117",
        backgroundType: "gradient",
        backgroundGradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #064e3b 100%)",
        buttonStyle: "filled",
        buttonColor: "#10b981",
        buttonTextColor: "#042f2e",
        buttonBorderColor: "#34d399",
        buttonRadius: "16px",
        fontHeading: "Plus Jakarta Sans",
        textColor: "#f0fdf4",
        accentColor: "#10b981",
      },
    });

    profile = await prisma.profile.findUnique({
      where: { id: profile.id },
      include: {
        theme: true,
        links: true,
        collections: true,
      },
    });
  }

  return (
    <DashboardProvider
      initialProfile={profile as any}
      initialTheme={profile?.theme as any}
      initialLinks={(profile?.links as any) || []}
      initialCollections={(profile?.collections as any) || []}
      initialTier={user.subscriptionTier as "FREE" | "PRO"}
    >
      <div className="flex min-h-screen bg-white dark:bg-zinc-950">
        {/* Left Sidebar */}
        <DashboardSidebar />

        {/* Center Main Editing Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 pb-16">{children}</main>
        </div>

        {/* Right Live Phone Mockup Preview Panel */}
        <DashboardPreviewPanel />
      </div>
    </DashboardProvider>
  );
}

