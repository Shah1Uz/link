"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useDashboard } from "@/context/dashboard-context";

export function ClerkProfileAutoSync() {
  const { user: clerkUser, isLoaded } = useUser();
  const { profile, updateProfile } = useDashboard();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !clerkUser || hasSynced.current) return;

    const rawUsername =
      clerkUser.username ||
      clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] ||
      clerkUser.firstName ||
      "";

    const cleanCandidate = rawUsername.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleanCandidate || cleanCandidate.length < 3) return;

    const currentUsername = profile?.username || "";
    const isGenericCurrent =
      !currentUsername ||
      currentUsername.startsWith("creator_") ||
      currentUsername.startsWith("biospacecreator") ||
      currentUsername.startsWith("user_");

    // Only sync if the current username is generic or different from the explicit Clerk username
    if (isGenericCurrent || (clerkUser.username && currentUsername !== clerkUser.username.toLowerCase())) {
      hasSynced.current = true;
      fetch("/api/auth/sync-clerk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUsername: clerkUser.username || cleanCandidate,
          displayName: clerkUser.fullName || clerkUser.username || cleanCandidate,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          avatarUrl: clerkUser.imageUrl,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.username && data.username !== profile?.username) {
            updateProfile({
              username: data.username,
              displayName: profile?.displayName || clerkUser.fullName || data.username,
              avatarUrl: profile?.avatarUrl || clerkUser.imageUrl,
            });
          }
        })
        .catch((err) => {
          console.warn("Clerk auto sync failed:", err);
        });
    }
  }, [isLoaded, clerkUser, profile, updateProfile]);

  return null;
}
