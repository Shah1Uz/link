"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ProfileData {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  category: string;
  verified: boolean;
  isPublished: boolean;
  layout: string;
}

export interface ThemeData {
  backgroundColor: string;
  backgroundType: string;
  backgroundGradient: string | null;
  buttonStyle: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonBorderColor: string | null;
  buttonRadius: string;
  fontHeading: string;
  fontBody: string;
  textColor: string;
  accentColor: string;
  animationsEnabled: boolean;
  showBranding: boolean;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  thumbnail: string | null;
  displayMode?: string | null;
  isEnabled: boolean;
  isPinned: boolean;
  position: number;
  collectionId: string | null;
  clicksCount: number;
  scheduledStart: string | null;
  scheduledEnd: string | null;
}

export interface CollectionItem {
  id: string;
  title: string;
  description: string | null;
  position: number;
  isCollapsed: boolean;
}

interface DashboardContextType {
  profile: ProfileData | null;
  theme: ThemeData | null;
  links: LinkItem[];
  collections: CollectionItem[];
  subscriptionTier: "FREE" | "PRO";
  isMobilePreviewOpen: boolean;
  setIsMobilePreviewOpen: (open: boolean) => void;
  updateProfile: (data: Partial<ProfileData>) => void;
  updateTheme: (data: Partial<ThemeData>) => void;
  setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>;
  setCollections: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
  refreshData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({
  children,
  initialProfile,
  initialTheme,
  initialLinks,
  initialCollections,
  initialTier = "FREE",
}: {
  children: React.ReactNode;
  initialProfile: ProfileData | null;
  initialTheme: ThemeData | null;
  initialLinks: LinkItem[];
  initialCollections: CollectionItem[];
  initialTier?: "FREE" | "PRO";
}) {
  const [profile, setProfile] = useState<ProfileData | null>(initialProfile);
  const [theme, setTheme] = useState<ThemeData | null>(initialTheme);
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);
  const [collections, setCollections] = useState<CollectionItem[]>(initialCollections);
  const [subscriptionTier] = useState<"FREE" | "PRO">(initialTier);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  const updateProfile = (data: Partial<ProfileData>) => {
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const updateTheme = (data: Partial<ThemeData>) => {
    setTheme((prev) => (prev ? { ...prev, ...data } : null));
  };

  const refreshData = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setTheme(data.theme);
        setLinks(data.links || []);
        setCollections(data.collections || []);
      }
    } catch (err) {
      console.error("Failed to refresh dashboard data:", err);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        profile,
        theme,
        links,
        collections,
        subscriptionTier,
        isMobilePreviewOpen,
        setIsMobilePreviewOpen,
        updateProfile,
        updateTheme,
        setLinks,
        setCollections,
        refreshData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

