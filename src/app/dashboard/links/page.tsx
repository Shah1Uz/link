"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { useDashboard, LinkItem } from "@/context/dashboard-context";
import { detectPlatformFromUrl, isYouTubeUrl } from "@/lib/utils";
import { YouTubeEmbed } from "@/components/shared/youtube-embed";
import {
  Plus,
  Pin,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Clock,
  Calendar,
  MousePointerClick,
  Sparkles,
  Link2,
  Video,
  Play,
} from "lucide-react";
import { toast } from "sonner";

export default function LinksManagementPage() {
  const { links, setLinks, collections, subscriptionTier } = useDashboard();

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formDisplayMode, setFormDisplayMode] = useState<"link" | "embed">("link");
  const [formCollectionId, setFormCollectionId] = useState<string>("");
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formScheduledStart, setFormScheduledStart] = useState("");
  const [formScheduledEnd, setFormScheduledEnd] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = (mode: "link" | "embed" = "link") => {
    setEditingLink(null);
    setFormTitle(mode === "embed" ? "Featured YouTube Video" : "");
    setFormUrl(mode === "embed" ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : "");
    setFormDesc("");
    setFormIcon(mode === "embed" ? "youtube" : "");
    setFormDisplayMode(mode);
    setFormCollectionId("");
    setFormIsPinned(false);
    setFormScheduledStart("");
    setFormScheduledEnd("");
    setIsModalOpen(true);
  };

  const openEditModal = (link: LinkItem) => {
    setEditingLink(link);
    setFormTitle(link.title);
    setFormUrl(link.url);
    setFormDesc(link.description || "");
    setFormIcon(link.icon || "");
    setFormDisplayMode((link.displayMode as "link" | "embed") || (isYouTubeUrl(link.url) ? "embed" : "link"));
    setFormCollectionId(link.collectionId || "");
    setFormIsPinned(link.isPinned);
    setFormScheduledStart(link.scheduledStart ? link.scheduledStart.slice(0, 16) : "");
    setFormScheduledEnd(link.scheduledEnd ? link.scheduledEnd.slice(0, 16) : "");
    setIsModalOpen(true);
  };

  const handleUrlChange = (urlVal: string) => {
    setFormUrl(urlVal);
    const isYt = isYouTubeUrl(urlVal);
    if (isYt) {
      setFormIcon("youtube");
      if (formDisplayMode === "link" && !editingLink) {
        setFormDisplayMode("embed");
      }
    } else if (!formIcon) {
      const detected = detectPlatformFromUrl(urlVal);
      setFormIcon(detected);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formUrl) {
      toast.error("Title and URL are required");
      return;
    }

    setIsSaving(true);
    try {
      if (editingLink) {
        // Update existing link
        const res = await fetch(`/api/links/${editingLink.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle,
            url: formUrl,
            description: formDesc || null,
            icon: formIcon || detectPlatformFromUrl(formUrl),
            displayMode: formDisplayMode,
            collectionId: formCollectionId || null,
            isPinned: formIsPinned,
            scheduledStart: formScheduledStart ? new Date(formScheduledStart).toISOString() : null,
            scheduledEnd: formScheduledEnd ? new Date(formScheduledEnd).toISOString() : null,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update link");

        setLinks((prev) =>
          prev.map((l) => (l.id === editingLink.id ? json.link : l))
        );
        toast.success("Link updated successfully!");
      } else {
        // Create new link
        const res = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle,
            url: formUrl,
            description: formDesc || null,
            icon: formIcon || detectPlatformFromUrl(formUrl),
            displayMode: formDisplayMode,
            collectionId: formCollectionId || null,
            isPinned: formIsPinned,
            isEnabled: true,
            scheduledStart: formScheduledStart ? new Date(formScheduledStart).toISOString() : null,
            scheduledEnd: formScheduledEnd ? new Date(formScheduledEnd).toISOString() : null,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create link");

        setLinks((prev) => [...prev, json.link]);
        toast.success("Link added successfully!");
      }

      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save link");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (link: LinkItem) => {
    const newStatus = !link.isEnabled;
    // Optimistic update
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, isEnabled: newStatus } : l))
    );

    try {
      await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: newStatus }),
      });
      toast.success(newStatus ? "Link enabled" : "Link hidden");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleTogglePin = async (link: LinkItem) => {
    const newPinned = !link.isPinned;
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, isPinned: newPinned } : l))
    );

    try {
      await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: newPinned }),
      });
      toast.success(newPinned ? "Link pinned to top" : "Link unpinned");
    } catch {
      toast.error("Failed to update pinned state");
    }
  };

  const handleToggleDisplayMode = async (link: LinkItem) => {
    const nextMode = link.displayMode === "embed" ? "link" : "embed";
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, displayMode: nextMode } : l))
    );
    try {
      await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayMode: nextMode }),
      });
      toast.success(
        nextMode === "embed"
          ? "YouTube video player ko'rinishi faollashtirildi!"
          : "Standart havola tugmasiga o'zgartirildi."
      );
    } catch {
      toast.error("Holatni o'zgartirishda xatolik");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const updated = [...links];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    setLinks(updated);

    try {
      await fetch("/api/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkIds: updated.map((l) => l.id) }),
      });
    } catch {
      toast.error("Failed to save order");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/links/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete link");

      setLinks((prev) => prev.filter((l) => l.id !== deleteId));
      toast.success("Link deleted successfully!");
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.message || "Could not delete link");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <DashboardHeader
        title="Links & Content"
        description="Add, edit, reorder, and schedule all your public URLs."
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openCreateModal("embed")}
              className="rounded-xl gap-1.5 text-xs font-semibold border-red-500/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-red-400"
            >
              <Video className="h-4 w-4 text-red-500" />
              <span>+ YouTube Post</span>
            </Button>
            <Button
              size="sm"
              onClick={() => openCreateModal("link")}
              className="rounded-xl gap-1.5 text-xs font-semibold"
            >
              <Plus className="h-4 w-4" />
              <span>Add Link</span>
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-8 max-w-4xl space-y-6">
        {links.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="No links created yet"
            description="Start building your profile by adding your social channels, portfolio, music, or shop."
            action={
              <Button onClick={() => openCreateModal("link")} className="rounded-xl font-semibold">
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Add Your First Link</span>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => {
              const collection = collections.find((c) => c.id === link.collectionId);

              return (
                <Card
                  key={link.id}
                  className={`p-4 transition-all duration-200 ${
                    !link.isEnabled ? "opacity-60 bg-zinc-50/80 dark:bg-zinc-900/40" : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Left: Reorder buttons, Icon, Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Move Up / Down */}
                      <div className="flex flex-col gap-0.5 text-zinc-400">
                        <button
                          type="button"
                          onClick={() => handleMove(index, "up")}
                          disabled={index === 0}
                          className="hover:text-zinc-900 dark:hover:text-white disabled:opacity-20"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, "down")}
                          disabled={index === links.length - 1}
                          className="hover:text-zinc-900 dark:hover:text-white disabled:opacity-20"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Icon */}
                      <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-800 dark:text-zinc-200">
                        <PlatformIcon platform={link.icon || "website"} size={18} />
                      </div>

                      {/* Title & URL */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {link.title}
                          </h4>
                          {link.isPinned && (
                            <Badge variant="pro" className="text-[9px] px-1.5 py-0">
                              PINNED
                            </Badge>
                          )}
                          {collection && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {collection.title}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate hover:text-emerald-500 transition-colors flex items-center gap-1"
                          >
                            <span className="truncate max-w-[220px]">{link.url}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <MousePointerClick className="h-3 w-3" />
                            <span>{link.clicksCount} clicks</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions, Pin, Toggle */}
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-0 pt-2 sm:pt-0">
                      {/* YouTube Post Embed Toggle */}
                      {isYouTubeUrl(link.url) && (
                        <button
                          type="button"
                          onClick={() => handleToggleDisplayMode(link)}
                          className={`text-[10px] px-2 py-1 rounded-xl font-bold border flex items-center gap-1.5 transition-colors shadow-xs ${
                            link.displayMode === "embed"
                              ? "bg-red-500/10 text-red-600 border-red-500/40 hover:bg-red-500/20 dark:text-red-400"
                              : "bg-surface text-text-secondary border-border hover:text-foreground"
                          }`}
                          title="Video ko'rinishini almashtirish (pleer yoki tugma)"
                        >
                          <Video className="h-3.5 w-3.5 text-red-500" />
                          <span>{link.displayMode === "embed" ? "Video Embed" : "Link Button"}</span>
                        </button>
                      )}

                      {/* Pin Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePin(link)}
                        className={`h-8 w-8 ${
                          link.isPinned ? "text-amber-500" : "text-zinc-400"
                        }`}
                        title={link.isPinned ? "Unpin link" : "Pin to top"}
                      >
                        <Pin className="h-4 w-4" />
                      </Button>

                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(link)}
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(link.id)}
                        className="h-8 w-8 text-zinc-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      {/* Enabled / Disabled Toggle */}
                      <div className="ml-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                        <Switch
                          checked={link.isEnabled}
                          onCheckedChange={() => handleToggle(link)}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLink ? "Edit Link" : "Add New Link"}
        description="Enter the destination URL, title, icon, and optional publishing schedule."
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Destination URL *
            </label>
            <Input
              required
              placeholder="https://youtube.com/watch?v=... or https://yoursite.com"
              value={formUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>

          {/* YouTube Video Post Embed Configurator */}
          {isYouTubeUrl(formUrl) && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 space-y-3 dark:bg-red-950/20 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs">
                    <Video className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-zinc-900 dark:text-white">
                      YouTube Video Post
                    </h5>
                    <p className="text-[11px] text-zinc-500">
                      Show video player with border-radius directly on profile
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    {formDisplayMode === "embed" ? "Player Embed" : "Link Button"}
                  </span>
                  <Switch
                    checked={formDisplayMode === "embed"}
                    onCheckedChange={(val) => setFormDisplayMode(val ? "embed" : "link")}
                  />
                </div>
              </div>

              {formDisplayMode === "embed" && (
                <div className="pt-1">
                  <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                    ✓ Border-radiusli chiroyli video pleer ko&apos;rinishi:
                  </p>
                  <YouTubeEmbed
                    url={formUrl}
                    title={formTitle || "YouTube Video Preview"}
                    description={formDesc}
                    borderRadius="16px"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Link Title *
            </label>
            <Input
              required
              placeholder="e.g. Watch My Latest Video"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Short Description (optional)
            </label>
            <Input
              placeholder="e.g. 50% discount code inside"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Platform Icon
              </label>
              <select
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              >
                <option value="website">Website (Globe)</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="twitter">X / Twitter</option>
                <option value="telegram">Telegram</option>
                <option value="github">GitHub</option>
                <option value="spotify">Spotify</option>
                <option value="linkedin">LinkedIn</option>
                <option value="discord">Discord</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Assign Collection
              </label>
              <select
                value={formCollectionId}
                onChange={(e) => setFormCollectionId(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              >
                <option value="">No Collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scheduling (Pro Feature) */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                <span>Link Scheduling & Expiration</span>
              </span>
              {subscriptionTier === "PRO" ? (
                <Badge variant="pro" className="text-[9px]">PRO ACTIVE</Badge>
              ) : (
                <Badge variant="outline" className="text-[9px]">PRO ONLY</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">
                  Publish Date
                </label>
                <Input
                  type="datetime-local"
                  disabled={subscriptionTier !== "PRO"}
                  value={formScheduledStart}
                  onChange={(e) => setFormScheduledStart(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">
                  Expiration Date
                </label>
                <Input
                  type="datetime-local"
                  disabled={subscriptionTier !== "PRO"}
                  value={formScheduledEnd}
                  onChange={(e) => setFormScheduledEnd(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formIsPinned}
                onChange={(e) => setFormIsPinned(e.target.checked)}
                className="rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Pin this link to the top of your profile</span>
            </label>

            <Button type="submit" isLoading={isSaving} className="rounded-xl px-5">
              <span>{editingLink ? "Update Link" : "Add Link"}</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Link"
        description="Are you sure you want to permanently delete this link from your profile? This action cannot be undone."
      />
    </div>
  );
}

