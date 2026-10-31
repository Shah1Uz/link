import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { PublicProfileView } from "@/components/profile/public-profile-view";
import { isReservedUsername } from "@/lib/validations";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = username.toLowerCase();

  if (isReservedUsername(cleanUsername)) {
    return { title: "Page Not Found — BioSpace" };
  }

  const profile = await prisma.profile.findUnique({
    where: { username: cleanUsername },
  });

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

  const profile = await prisma.profile.findUnique({
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

  if (!profile || !profile.isPublished) {
    notFound();
  }

  return (
    <PublicProfileView
      profile={profile}
      theme={profile.theme}
      links={profile.links}
      collections={profile.collections}
      products={profile.products}
    />
  );
}

