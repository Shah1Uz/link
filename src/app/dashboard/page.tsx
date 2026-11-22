import React from "react";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardOverviewClient } from "@/components/dashboard/dashboard-overview-client";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

export default async function DashboardOverviewPage() {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      theme: true,
      links: {
        orderBy: { clicksCount: "desc" },
      },
      analyticsEvents: {
        take: 100,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const now = Date.now();
  const weekStart = new Date(now - 7 * DAY);
  const prevWeekStart = new Date(now - 14 * DAY);
  const profileId = profile?.id;

  const [viewsAllTime, clicksAllTime, viewsThisWeek, viewsPrevWeek, clicksThisWeek, clicksPrevWeek] =
    profileId
      ? await Promise.all([
          prisma.analyticsEvent.count({ where: { profileId, type: "VIEW" } }),
          prisma.analyticsEvent.count({ where: { profileId, type: "CLICK" } }),
          prisma.analyticsEvent.count({
            where: { profileId, type: "VIEW", createdAt: { gte: weekStart } },
          }),
          prisma.analyticsEvent.count({
            where: {
              profileId,
              type: "VIEW",
              createdAt: { gte: prevWeekStart, lt: weekStart },
            },
          }),
          prisma.analyticsEvent.count({
            where: { profileId, type: "CLICK", createdAt: { gte: weekStart } },
          }),
          prisma.analyticsEvent.count({
            where: {
              profileId,
              type: "CLICK",
              createdAt: { gte: prevWeekStart, lt: weekStart },
            },
          }),
        ])
      : [0, 0, 0, 0, 0, 0];

  const links = profile?.links || [];
  const totalClicks = links.reduce((acc, l) => acc + l.clicksCount, 0) || clicksAllTime;
  const activeLinks = links.filter((l) => l.isEnabled).length;
  const ctr = viewsAllTime > 0 ? ((totalClicks / viewsAllTime) * 100).toFixed(1) : "0.0";
  const topLinks = [...links].sort((a, b) => b.clicksCount - a.clicksCount).slice(0, 3);
  const maxClicks = Math.max(1, ...topLinks.map((l) => l.clicksCount));
  const recentEvents = (profile?.analyticsEvents || []).slice(0, 6);
  const displayName = profile?.displayName || user.name || "Creator";
  const username = profile?.username || "creator";

  return (
    <DashboardOverviewClient
      displayName={displayName}
      username={username}
      isPublished={Boolean(profile?.isPublished)}
      avatarUrl={profile?.avatarUrl || null}
      bio={profile?.bio || null}
      hasTheme={Boolean(profile?.theme)}
      viewsAllTime={viewsAllTime}
      totalClicks={totalClicks}
      ctr={ctr}
      activeLinks={activeLinks}
      totalLinksCount={links.length}
      viewsThisWeek={viewsThisWeek}
      viewsPrevWeek={viewsPrevWeek}
      clicksThisWeek={clicksThisWeek}
      clicksPrevWeek={clicksPrevWeek}
      topLinks={topLinks.map((l) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        clicksCount: l.clicksCount,
        isPinned: l.isPinned,
      }))}
      maxClicks={maxClicks}
      recentEvents={recentEvents.map((e) => ({
        id: e.id,
        type: e.type,
        linkId: e.linkId,
        country: e.country,
        device: e.device,
        referrer: e.referrer,
        createdAt: e.createdAt.toISOString(),
      }))}
      allLinks={links.map((l) => ({
        id: l.id,
        title: l.title,
      }))}
    />
  );
}
