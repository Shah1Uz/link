"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ProfileData {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl?: string | null;
  category: string;
  verified: boolean;
  isPublished: boolean;
  layout: string;
  customCss?: string | null;
  newsletterEnabled?: boolean;
  newsletterTitle?: string;
  newsletterDescription?: string | null;
  newsletterButtonText?: string;
  bookingEnabled?: boolean;
  bookingTitle?: string;
  bookingDescription?: string | null;
  bookingTimezone?: string;
  storeEnabled?: boolean;
}

export interface ThemeData {
  backgroundColor: string;
  backgroundType: string;
  backgroundGradient: string | null;
  backgroundImage?: string | null;
  backgroundVideo?: string | null;
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
  spotifyMusicEnabled?: boolean;
  spotifyTrackUrl?: string | null;
  spotifyTrackTitle?: string | null;
  spotifyTrackArtist?: string | null;
  spotifyTrackImage?: string | null;
  spotifyTrackPreview?: string | null;
  spotifyMusicLayout?: "floating" | "card" | string;
  spotifyMusicAutoplay?: boolean;
  heroBlur?: string | null;
  heroFade?: string | null;
  heroDarken?: string | null;
  stickersEnabled?: boolean;
  stickerId?: string | null;
  stickerUrl?: string | null;
  stickerText?: string | null;
  stickerPosition?: string | null;
  stickerAnimation?: string | null;
  stickerSize?: string | null;
  stickerRotation?: string | null;
  stickerLink?: string | null;
  stickerPosX?: number | null;
  stickerPosY?: number | null;
  wallpaperEffect?: string | null;
  wallpaperTint?: number | null;
  wallpaperNoise?: boolean | null;
  gradientStyle?: string | null;
  gradientColor?: string | null;
  gradientDirection?: string | null;
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
  isAdmin?: boolean;
  userEmail?: string;
  userRole?: string;
  impersonatedBy?: { id: string; email: string; name: string | null } | null;
  isMobilePreviewOpen: boolean;
  setIsMobilePreviewOpen: (open: boolean) => void;
  updateProfile: (data: Partial<ProfileData>) => void;
  updateTheme: (data: Partial<ThemeData>) => void;
  setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>;
  setCollections: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
  refreshData: () => Promise<void>;
  refreshDashboardData?: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function broadcastRealtimeUpdate(payload: any) {
  if (typeof window === "undefined") return;
  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("biospace_realtime_sync");
      bc.postMessage(payload);
      bc.close();
    }
  } catch {}

  try {
    localStorage.setItem(
      "biospace_realtime_event",
      JSON.stringify({ ...payload, timestamp: Date.now() })
    );
  } catch {}
}

export function DashboardProvider({
  children,
  initialProfile,
  initialTheme,
  initialLinks,
  initialCollections,
  initialTier = "FREE",
  isAdmin = false,
  userEmail,
  userRole,
  impersonatedBy = null,
}: {
  children: React.ReactNode;
  initialProfile: ProfileData | null;
  initialTheme: ThemeData | null;
  initialLinks: LinkItem[];
  initialCollections: CollectionItem[];
  initialTier?: "FREE" | "PRO";
  isAdmin?: boolean;
  userEmail?: string;
  userRole?: string;
  impersonatedBy?: { id: string; email: string; name: string | null } | null;
}) {
  const [profile, setProfile] = useState<ProfileData | null>(initialProfile);
  const [theme, setTheme] = useState<ThemeData | null>(initialTheme);
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);
  const [collections, setCollections] = useState<CollectionItem[]>(initialCollections);
  const [subscriptionTier] = useState<"FREE" | "PRO">(initialTier);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isAdminUser] = useState<boolean>(Boolean(isAdmin));
  const [userEmailVal] = useState<string | undefined>(userEmail);
  const [userRoleVal] = useState<string | undefined>(userRole);
  const [impersonatedByVal] = useState<{ id: string; email: string; name: string | null } | null>(impersonatedBy);

  const updateProfile = (data: Partial<ProfileData>) => {
    setProfile((prev) => {
      const next = prev ? { ...prev, ...data } : (data as ProfileData);
      if (next) {
        broadcastRealtimeUpdate({ type: "PROFILE_UPDATED", profile: next });
      }
      return next;
    });
  };

  const updateTheme = (data: Partial<ThemeData>) => {
    setTheme((prev) => {
      const next = prev ? { ...prev, ...data } : (data as ThemeData);
      if (next) {
        broadcastRealtimeUpdate({ type: "THEME_UPDATED", theme: next });
      }
      return next;
    });
  };

  // Broadcast when links update in state
  useEffect(() => {
    if (typeof window !== "undefined" && links) {
      broadcastRealtimeUpdate({ type: "LINKS_UPDATED", links });
    }
  }, [links]);

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
        isAdmin: isAdminUser,
        userEmail: userEmailVal,
        userRole: userRoleVal,
        impersonatedBy: impersonatedByVal,
        isMobilePreviewOpen,
        setIsMobilePreviewOpen,
        updateProfile,
        updateTheme,
        setLinks,
        setCollections,
        refreshData,
        refreshDashboardData: refreshData,
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

