"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { AvatarUploader } from "@/components/shared/avatar-uploader";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import {
  User,
  ShieldAlert,
  Download,
  Bell,
  Trash2,
  CheckCircle2,
  AtSign,
  Database,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";

function SectionHeader({
  icon: Icon,
  iconClass,
  title,
  description,
}: {
  icon: React.ElementType;
  iconClass: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
          {title}
        </h2>
        <p className="text-[11px] leading-relaxed text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

export default function UserSettingsPage() {
  const { t } = useI18n();
  const { profile, updateProfile, links, collections, theme } = useDashboard();

  const [username, setUsername] = useState(profile?.username || "");
  const [usernameStatus, setUsernameStatus] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [marketingNews, setMarketingNews] = useState(false);

  // Danger Zone Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const clerk = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {}

    try {
      const cookieNames = [
        "biospace_session",
        "__session",
        "__client_uat",
        "__clerk_db_jwt",
        "__clerk_handshake",
      ];
      cookieNames.forEach((name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
        if (typeof window !== "undefined" && window.location.hostname) {
          document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
        }
      });
    } catch {}

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}

    try {
      if (clerk && typeof clerk.signOut === "function") {
        await clerk.signOut({ redirectUrl: "/sign-in" });
        return;
      }
    } catch {}

    window.location.replace("/sign-in");
  };

  const handleCheckUsername = async () => {
    if (!username || username === profile?.username) return;
    setIsChecking(true);
    try {
      const res = await fetch(`/api/profile/check-username?username=${encodeURIComponent(username)}`);
      const json = await res.json();
      if (json.available) {
        setUsernameStatus("available");
      } else {
        setUsernameStatus("unavailable");
        toast.error(json.message || "Username is unavailable");
      }
    } catch {
      toast.error("Failed to check username");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSaveUsername = async () => {
    if (username === profile?.username) return;
    setIsSavingUsername(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update username");

      updateProfile({ username });
      toast.success("Username updated! Your new link is active.");
      setUsernameStatus("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change username");
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleExportData = () => {
    const data = {
      profile,
      theme,
      links,
      collections,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `biospace-data-${profile?.username || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("User data export generated and downloaded!");
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
      });
      toast.success("Account successfully scheduled for deletion.");
      window.location.href = "/";
    } catch (err) {
      toast.error("Could not delete account");
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div>
      <DashboardHeader
        title={t.settingsStudio.title}
        description={t.settingsStudio.description}
      />

      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Avatar */}
        <Card className="overflow-hidden p-0">
          <SectionHeader
            icon={User}
            iconClass="border-emerald-500/25 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400"
            title="Profile photo"
            description="Upload a picture directly from your phone, tablet or desktop."
          />
          <div className="p-5 sm:p-6">
            <AvatarUploader
              currentUrl={profile?.avatarUrl}
              onUploadSuccess={async (url) => {
                updateProfile({ avatarUrl: url });
                try {
                  await fetch("/api/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ avatarUrl: url }),
                  });
                } catch (e) {
                  console.error("Auto-saving avatar failed:", e);
                }
              }}
            />
          </div>
        </Card>

        {/* Username */}
        <Card className="overflow-hidden p-0">
          <SectionHeader
            icon={AtSign}
            iconClass="border-cyan-500/25 bg-gradient-to-b from-cyan-500/15 to-cyan-500/[0.04] text-cyan-600 dark:text-cyan-400"
            title="Profile username & URL"
            description="Changing your username instantly updates your public address — older printed links will need refreshing."
          />
          <div className="space-y-4 p-5 sm:p-6">
            <div className="space-y-1.5">
              <Label htmlFor="settings-username">Your BioSpace URL</Label>
              <div className="flex items-center rounded-xl border border-border/90 bg-background/60 px-3 shadow-xs transition-colors focus-within:border-emerald-500/60 focus-within:ring-4 focus-within:ring-emerald-500/10">
                <span className="mr-0.5 select-none text-xs font-semibold text-text-secondary">
                  biospace.com/
                </span>
                <input
                  id="settings-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""));
                    setUsernameStatus("");
                  }}
                  className="h-11 w-full bg-transparent text-sm font-bold text-foreground placeholder:text-text-secondary/60 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                onClick={handleCheckUsername}
                isLoading={isChecking}
                disabled={username === profile?.username}
                className="rounded-xl text-xs font-semibold"
              >
                Check availability
              </Button>

              <Button
                onClick={handleSaveUsername}
                isLoading={isSavingUsername}
                disabled={username === profile?.username || usernameStatus !== "available"}
                className="rounded-xl text-xs font-semibold"
              >
                Save username
              </Button>
            </div>

            {usernameStatus === "available" && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Username is free — click save to apply it.</span>
              </p>
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card className="overflow-hidden p-0">
          <SectionHeader
            icon={Bell}
            iconClass="border-amber-500/25 bg-gradient-to-b from-amber-500/15 to-amber-500/[0.04] text-amber-600 dark:text-amber-400"
            title="Notification preferences"
            description="Choose which updates land in your inbox."
          />
          <div className="divide-y divide-border/70">
            <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
              <div>
                <h4 className="text-[13px] font-bold text-foreground">
                  Link click milestone alerts
                </h4>
                <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                  Receive an email when your links hit 100, 500, or 10,000 clicks.
                </p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>

            <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
              <div>
                <h4 className="text-[13px] font-bold text-foreground">
                  Weekly analytics digest
                </h4>
                <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                  A summary of top referrers and visitor traffic every Monday.
                </p>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>

            <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
              <div>
                <h4 className="text-[13px] font-bold text-foreground">
                  Product & marketing news
                </h4>
                <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                  Occasional updates about new BioSpace features and templates.
                </p>
              </div>
              <Switch checked={marketingNews} onCheckedChange={setMarketingNews} />
            </div>
          </div>
        </Card>

        {/* Export */}
        <Card className="overflow-hidden p-0">
          <SectionHeader
            icon={Database}
            iconClass="border-violet-500/25 bg-gradient-to-b from-violet-500/15 to-violet-500/[0.04] text-violet-600 dark:text-violet-400"
            title="Data portability & export"
            description="Download an immutable JSON archive of your profile, theme, links and click statistics."
          />
          <div className="p-5 sm:p-6">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="gap-2 rounded-xl text-xs font-semibold"
            >
              <Download className="h-4 w-4" />
              <span>Export BioSpace archive (.json)</span>
            </Button>
          </div>
        </Card>

        {/* Active Session & Log out */}
        <Card className="overflow-hidden p-0">
          <SectionHeader
            icon={LogOut}
            iconClass="border-amber-500/25 bg-gradient-to-b from-amber-500/15 to-amber-500/[0.04] text-amber-600 dark:text-amber-400"
            title="Active session & sign out"
            description="Sign out of this device or switch to another BioSpace account."
          />
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-bold text-foreground">
                Signed in as @{profile?.username || "creator"}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Switch accounts anytime without losing your saved data.
              </p>
            </div>
            <Button
              variant="outline"
              disabled={isSigningOut}
              onClick={handleSignOut}
              className="gap-2 rounded-xl border-rose-500/30 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>{isSigningOut ? "Signing out…" : "Sign out from account"}</span>
            </Button>
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="overflow-hidden border-rose-500/25 bg-rose-500/[0.03] p-0 dark:bg-rose-950/10">
          <SectionHeader
            icon={ShieldAlert}
            iconClass="border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400"
            title="Danger zone"
            description="Permanently delete your profile, published links and analytics history. This cannot be reversed."
          />
          <div className="p-5 sm:p-6">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteModalOpen(true)}
              className="gap-2 rounded-xl text-xs font-semibold"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete account & profile</span>
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeletingAccount}
        title="Permanently delete account?"
        description="This will instantly unpublish your public link and delete all links, analytics events, and theme data. Are you sure you wish to proceed?"
        confirmText="Yes, delete everything"
      />
    </div>
  );
}
