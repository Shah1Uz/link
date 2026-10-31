import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d"; // today, 7d, 30d, 90d, all

    let startDate = new Date();
    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7d") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === "90d") {
      startDate.setDate(startDate.getDate() - 90);
    } else if (range === "all") {
      startDate = new Date(2020, 0, 1);
    } else {
      // 30d default
      startDate.setDate(startDate.getDate() - 30);
    }

    // Events in period
    const events = await prisma.analyticsEvent.findMany({
      where: {
        profileId: profile.id,
        createdAt: { gte: startDate },
      },
      include: {
        link: { select: { id: true, title: true, url: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const views = events.filter((e) => e.type === "VIEW");
    const clicks = events.filter((e) => e.type === "CLICK");

    const totalViews = views.length;
    const totalClicks = clicks.length;
    const uniqueVisitors = new Set(views.map((v) => v.visitorId)).size;
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

    // Group by Date for Recharts
    const timeMap: Record<string, { date: string; views: number; clicks: number }> = {};
    events.forEach((ev) => {
      const dateStr = ev.createdAt.toISOString().split("T")[0];
      if (!timeMap[dateStr]) {
        timeMap[dateStr] = { date: dateStr, views: 0, clicks: 0 };
      }
      if (ev.type === "VIEW") timeMap[dateStr].views++;
      if (ev.type === "CLICK") timeMap[dateStr].clicks++;
    });

    const timeSeries = Object.values(timeMap).sort((a, b) => a.date.localeCompare(b.date));

    // Top Performing Links
    const linkClicksMap: Record<string, { id: string; title: string; url: string; clicks: number }> = {};
    clicks.forEach((c) => {
      if (c.link) {
        if (!linkClicksMap[c.link.id]) {
          linkClicksMap[c.link.id] = { id: c.link.id, title: c.link.title, url: c.link.url, clicks: 0 };
        }
        linkClicksMap[c.link.id].clicks++;
      }
    });
    const topLinks = Object.values(linkClicksMap).sort((a, b) => b.clicks - a.clicks).slice(0, 5);

    // Device Breakdown
    const deviceMap: Record<string, number> = {};
    events.forEach((e) => {
      const d = e.device || "Desktop";
      deviceMap[d] = (deviceMap[d] || 0) + 1;
    });
    const deviceBreakdown = Object.entries(deviceMap).map(([name, value]) => ({ name, value }));

    // Referrers Breakdown
    const referrerMap: Record<string, number> = {};
    events.forEach((e) => {
      let ref = e.referrer || "Direct";
      if (ref.includes("youtube")) ref = "YouTube";
      else if (ref.includes("x.com") || ref.includes("twitter")) ref = "Twitter / X";
      else if (ref.includes("instagram")) ref = "Instagram";
      else if (ref.includes("t.me")) ref = "Telegram";
      else if (ref.includes("google")) ref = "Google Search";
      else if (ref.includes("tiktok")) ref = "TikTok";
      else ref = "Direct / Other";
      referrerMap[ref] = (referrerMap[ref] || 0) + 1;
    });
    const referrerBreakdown = Object.entries(referrerMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Geo / Country Breakdown
    const countryMap: Record<string, number> = {};
    events.forEach((e) => {
      const c = e.country || "United States";
      countryMap[c] = (countryMap[c] || 0) + 1;
    });
    const countryBreakdown = Object.entries(countryMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return NextResponse.json({
      summary: {
        totalViews,
        uniqueVisitors,
        totalClicks,
        ctr,
      },
      timeSeries,
      topLinks,
      deviceBreakdown,
      referrerBreakdown,
      countryBreakdown,
    });
  } catch (error) {
    console.error("Fetch analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

// POST track an event (view or click) from public profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, linkId, type = "VIEW", visitorId = "anonymous", referrer, device, browser, country } = body;

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
    }

    const event = await prisma.analyticsEvent.create({
      data: {
        profileId,
        linkId: linkId || null,
        type: type === "CLICK" ? "CLICK" : "VIEW",
        visitorId: visitorId || `vis_${Math.random().toString(36).substring(7)}`,
        referrer: referrer || null,
        device: device || "Desktop",
        browser: browser || "Chrome",
        country: country || "United States",
      },
    });

    // If it was a click on a link, also increment clicksCount on the Link model
    if (type === "CLICK" && linkId) {
      await prisma.link.update({
        where: { id: linkId },
        data: { clicksCount: { increment: 1 } },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    // Non-blocking for client profile speed
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

