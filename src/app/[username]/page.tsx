import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { PublicProfileView } from "@/components/profile/public-profile-view";
import { isReservedUsername } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = username.toLowerCase();

  if (isReservedUsername(cleanUsername)) {
    return { title: "Page Not Found — BioSpace" };
  }

  let profile = await prisma.profile.findUnique({
    where: { username: cleanUsername },
  });

  // If not found by username, resolve active custom domain
  if (!profile) {
    profile = await prisma.profile.findFirst({
      where: {
        customDomains: {
          some: {
            domain: cleanUsername,
            status: "ACTIVE",
          },
        },
      },
    });
  }

  if (!profile) {
    return {
      title: "Profile Not Found — BioSpace",
    };
  }

  const name = profile.displayName || profile.username;
  const description = profile.bio || `Connect with ${name} on BioSpace. Explore all social links, projects, and updates in one place.`;

  return {
    title: `${name} (@${profile.username}) — BioSpace`,
    description,
    openGraph: {
      title: `${name} (@${profile.username})`,
      description,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} (@${profile.username})`,
      description,
      images: profile.avatarUrl ? [profile.avatarUrl] : [],
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const cleanUsername = username.toLowerCase();

  if (isReservedUsername(cleanUsername)) {
    return notFound();
  }

  let profile = await prisma.profile.findUnique({
    where: { username: cleanUsername },
    include: {
      theme: true,
      links: {
        where: { isEnabled: true },
        orderBy: [{ isPinned: "desc" }, { position: "asc" }],
      },
      collections: {
        orderBy: { position: "asc" },
      },
      products: {
        where: { isEnabled: true },
        orderBy: { position: "asc" },
      },
    },
  });

  // If not found by username, check if cleanUsername is a registered active CustomDomain
  if (!profile) {
    profile = await prisma.profile.findFirst({
      where: {
        customDomains: {
          some: {
            domain: cleanUsername,
            status: "ACTIVE",
          },
        },
      },
      include: {
        theme: true,
        links: {
          where: { isEnabled: true },
          orderBy: [{ isPinned: "desc" }, { position: "asc" }],
        },
        collections: {
          orderBy: { position: "asc" },
        },
        products: {
          where: { isEnabled: true },
          orderBy: { position: "asc" },
        },
      },
    });
  }

  if (!profile || !profile.isPublished) {
    notFound();
  }

  let theme: any = profile.theme;
  if (theme) {
    let backgroundVideo: string | null = null;
    let spotifyData: any = {};
    let heroData: any = {
      heroBlur: "16px",
      heroFade: "high",
      heroDarken: "balanced",
    };
    try {
      const rawRes: any = await prisma.$queryRawUnsafe(
        "SELECT \"backgroundVideo\", \"spotifyMusicEnabled\", \"spotifyTrackUrl\", \"spotifyTrackTitle\", \"spotifyTrackArtist\", \"spotifyTrackImage\", \"spotifyTrackPreview\", \"spotifyMusicLayout\", \"spotifyMusicAutoplay\", \"heroBlur\", \"heroFade\", \"heroDarken\" FROM \"Theme\" WHERE \"profileId\" = ? LIMIT 1",
        profile.id
      );
      if (rawRes?.[0]) {
        if (rawRes[0].backgroundVideo) {
          backgroundVideo = rawRes[0].backgroundVideo;
        }
        if (rawRes[0].heroBlur) heroData.heroBlur = rawRes[0].heroBlur;
        if (rawRes[0].heroFade) heroData.heroFade = rawRes[0].heroFade;
        if (rawRes[0].heroDarken) heroData.heroDarken = rawRes[0].heroDarken;
        spotifyData = {
          spotifyMusicEnabled: Boolean(rawRes[0].spotifyMusicEnabled),
          spotifyTrackUrl: rawRes[0].spotifyTrackUrl || null,
          spotifyTrackTitle: rawRes[0].spotifyTrackTitle || null,
          spotifyTrackArtist: rawRes[0].spotifyTrackArtist || null,
          spotifyTrackImage: rawRes[0].spotifyTrackImage || null,
          spotifyTrackPreview: rawRes[0].spotifyTrackPreview || null,
          spotifyMusicLayout: rawRes[0].spotifyMusicLayout || "floating",
          spotifyMusicAutoplay: Boolean(rawRes[0].spotifyMusicAutoplay),
        };
      }
    } catch {}
    theme = {
      ...theme,
      ...spotifyData,
      ...heroData,
      backgroundVideo: backgroundVideo || null,
    };
  }

  return (
    <PublicProfileView
      profile={profile}
      theme={theme}
      links={profile.links}
      collections={profile.collections}
      products={profile.products}
    />
  );
}

