"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { useDashboard } from "@/context/dashboard-context";
import {
  User,
  ShieldAlert,
  Download,
  Bell,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function UserSettingsPage() {
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
        title="Account & System Settings"
        description="Manage your credentials, change handle, export personal data, or configure notifications."
      />

      <div className="p-4 sm:p-8 max-w-3xl space-y-8">
        {/* Username Modification */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-500" />
            <span>Profile Username / URL</span>
          </h3>
          <p className="text-xs text-zinc-500">
            Changing your username immediately updates your public URL. Any older printed links will need to be updated.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 flex-1">
              <span className="text-zinc-400 select-none mr-1 font-semibold text-xs">
                biospace.com/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""));
                  setUsernameStatus("");
                }}
                className="w-full bg-transparent font-bold text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>

            <Button
              variant="outline"
              onClick={handleCheckUsername}
              isLoading={isChecking}
              disabled={username === profile?.username}
              className="text-xs font-semibold"
            >
              Check Availability
            </Button>

            <Button
              onClick={handleSaveUsername}
              isLoading={isSavingUsername}
              disabled={username === profile?.username || usernameStatus !== "available"}
              className="text-xs font-semibold"
            >
              Save Username
            </Button>
          </div>

          {usernameStatus === "available" && (
            <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Username is free! Click Save Username to apply.</span>
            </p>
          )}
        </Card>

        {/* Notifications Card */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-500" />
            <span>Notification Preferences</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Link Click Milestone Alerts
                </h4>
                <p className="text-xs text-zinc-500">
                  Receive an email when your links hit 100, 500, or 10,000 clicks.
                </p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Weekly Analytics Digest
                </h4>
                <p className="text-xs text-zinc-500">
                  Receive a summary of your top referrers and visitor traffic every Monday.
                </p>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>
          </div>
        </Card>

        {/* Export Data */}
        <Card className="p-6 space-y-3">
          <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <Download className="h-4 w-4 text-sky-500" />
            <span>Data Portability & Export</span>
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Download an immutable JSON archive containing your profile bio, theme configurations, link collections, and click statistics.
          </p>
          <div className="pt-2">
            <Button variant="outline" onClick={handleExportData} className="gap-2 text-xs font-semibold">
              <Download className="h-4 w-4" />
              <span>Export BioSpace Archive (.json)</span>
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 space-y-3 border-red-500/30 bg-red-50/20 dark:bg-red-950/10">
          <h3 className="font-bold text-base text-red-600 dark:text-red-400 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>Danger Zone</span>
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Permanently delete your BioSpace profile, published links, and analytics history. This action cannot be reversed.
          </p>
          <div className="pt-2">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteModalOpen(true)}
              className="gap-2 text-xs font-semibold"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Account & Profile</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeletingAccount}
        title="Permanently Delete Account?"
        description="This will instantly unpublish your public link and delete all links, analytics events, and theme data. Are you sure you wish to proceed?"
        confirmText="Yes, Delete Everything"
      />
    </div>
  );
}

