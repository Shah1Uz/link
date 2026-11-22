"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { useDashboard, LinkItem } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import {
  cn,
  detectPlatformFromUrl,
  isYouTubeUrl,
  extractYouTubeVideoId,
  parseYouTubeVideosFromLink,
  isInstagramUrl,
  extractInstagramUsername,
  isTikTokUrl,
  extractTikTokUsername,
  formatUrlForHref,
  type YouTubeVideoItem,
} from "@/lib/utils";
import { YouTubeEmbed } from "@/components/shared/youtube-embed";
import { InstagramEmbed } from "@/components/shared/instagram-embed";
import { TikTokEmbed } from "@/components/shared/tiktok-embed";
import {
  Plus,
  Pin,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Calendar,
  MousePointerClick,
  Sparkles,
  Link2,
  Video,
  Play,
  Copy,
  Search,
  Instagram,
  Check,
  Folder,
  Layers,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

const PLATFORM_OPTIONS = [
  { value: "website", label: "Website (Globe)", icon: "website", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { value: "youtube", label: "YouTube", icon: "youtube", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  { value: "instagram", label: "Instagram", icon: "instagram", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
  { value: "tiktok", label: "TikTok", icon: "tiktok", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { value: "twitter", label: "X / Twitter", icon: "twitter", color: "text-zinc-300 bg-zinc-500/10 border-zinc-500/20" },
  { value: "telegram", label: "Telegram", icon: "telegram", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  { value: "github", label: "GitHub", icon: "github", color: "text-zinc-200 bg-zinc-500/10 border-zinc-500/20" },
  { value: "spotify", label: "Spotify", icon: "spotify", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { value: "linkedin", label: "LinkedIn", icon: "linkedin", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "discord", label: "Discord", icon: "discord", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  { value: "whatsapp", label: "WhatsApp", icon: "whatsapp", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { value: "email", label: "Email", icon: "email", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { value: "phone", label: "Phone", icon: "phone", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
];

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const selectClass =
  "h-10 w-full rounded-xl border border-border/90 bg-background/60 px-3 text-sm font-medium text-foreground shadow-xs transition-colors focus:border-emerald-500/60 focus:outline-none focus:ring-4 focus:ring-emerald-500/10";

export default function LinksManagementPage() {
  const { t } = useI18n();
  const { links, setLinks, collections, subscriptionTier } = useDashboard();

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formDisplayMode, setFormDisplayMode] = useState<"link" | "embed">("link");
  const [formExtraVideos, setFormExtraVideos] = useState<Array<{ id: string; url: string; title: string }>>([]);
  const [formCollectionId, setFormCollectionId] = useState<string>("");
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formScheduledStart, setFormScheduledStart] = useState("");
  const [formScheduledEnd, setFormScheduledEnd] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [query, setQuery] = useState("");

  // Custom Dropdowns State
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] = useState(false);
  const iconDropdownRef = useRef<HTMLDivElement>(null);
  const collectionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (iconDropdownRef.current && !iconDropdownRef.current.contains(event.target as Node)) {
        setIsIconDropdownOpen(false);
      }
      if (collectionDropdownRef.current && !collectionDropdownRef.current.contains(event.target as Node)) {
        setIsCollectionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setIsModalOpen(false);
    setIsIconDropdownOpen(false);
    setIsCollectionDropdownOpen(false);
  }, []);

  const openCreateModal = (
    mode: "link" | "embed" = "link",
    platform?: "youtube" | "instagram" | "tiktok"
  ) => {
    setEditingLink(null);
    let initialTitle = "";
    let initialIcon = "";
    if (platform === "youtube") {
      initialTitle = "YouTube Video";
      initialIcon = "youtube";
    } else if (platform === "instagram") {
      initialTitle = "My Instagram";
      initialIcon = "instagram";
    } else if (platform === "tiktok") {
      initialTitle = "My TikTok";
      initialIcon = "tiktok";
    } else if (mode === "embed") {
      initialTitle = "Featured Media";
    }

    setFormTitle(initialTitle);
    setFormUrl("");
    setFormDesc("");
    setFormIcon(initialIcon);
    setFormDisplayMode(mode);
    setFormExtraVideos([]);
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
    setFormDisplayMode(
      (link.displayMode as "link" | "embed") ||
        (isYouTubeUrl(link.url) || isInstagramUrl(link.url) || isTikTokUrl(link.url)
          ? "embed"
          : "link")
    );

    // Extract extra carousel videos from thumbnail if present
    let extras: Array<{ id: string; url: string; title: string }> = [];
    if (link.thumbnail && typeof link.thumbnail === "string" && link.thumbnail.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(link.thumbnail);
        if (Array.isArray(parsed)) {
          extras = parsed.map((e, idx) => ({
            id: `extra-${idx}-${Date.now()}`,
            url: e.url || "",
            title: e.title || "",
          }));
        }
      } catch {
        // Ignore
      }
    }
    setFormExtraVideos(extras);

    setFormCollectionId(link.collectionId || "");
    setFormIsPinned(link.isPinned);
    setFormScheduledStart(toDatetimeLocal(link.scheduledStart));
    setFormScheduledEnd(toDatetimeLocal(link.scheduledEnd));
    setIsModalOpen(true);
  };

  const handleUrlChange = (urlVal: string) => {
    setFormUrl(urlVal);
    const isYt = isYouTubeUrl(urlVal);
    const isInsta = isInstagramUrl(urlVal);
    const isTt = isTikTokUrl(urlVal);

    if (isYt) {
      setFormIcon("youtube");
      if (formDisplayMode === "link" && !editingLink) {
        setFormDisplayMode("embed");
      }
      if (!formTitle || formTitle === "Featured Media" || formTitle === "My Instagram" || formTitle === "My TikTok") {
        setFormTitle("YouTube Video");
      }
    } else if (isInsta) {
      setFormIcon("instagram");
      if (formDisplayMode === "link" && !editingLink) {
        setFormDisplayMode("embed");
      }
      const u = extractInstagramUsername(urlVal);
      if (!formTitle || formTitle === "Featured Media" || formTitle === "My Instagram") {
        setFormTitle(u !== "creator" ? `Instagram @${u}` : "My Instagram");
      }
    } else if (isTt) {
      setFormIcon("tiktok");
      if (formDisplayMode === "link" && !editingLink) {
        setFormDisplayMode("embed");
      }
      const u = extractTikTokUsername(urlVal);
      if (!formTitle || formTitle === "Featured Media" || formTitle === "My TikTok") {
        setFormTitle(u !== "creator" ? `TikTok @${u}` : "My TikTok");
      }
    } else if (!formIcon) {
      const detected = detectPlatformFromUrl(urlVal);
      setFormIcon(detected);
    }
  };

  const modalVideos: YouTubeVideoItem[] = useMemo(() => {
    const vids: YouTubeVideoItem[] = [];
    const primaryId = extractYouTubeVideoId(formUrl);
    if (primaryId) {
      vids.push({
        id: "primary",
        url: formUrl,
        title: formTitle || "YouTube Video",
        description: formDesc,
        videoId: primaryId,
      });
    }
    formExtraVideos.forEach((extra, idx) => {
      const extraId = extractYouTubeVideoId(extra.url);
      if (extraId) {
        vids.push({
          id: extra.id || `extra-${idx}`,
          url: extra.url,
          title: extra.title || `Video ${idx + 2}`,
          videoId: extraId,
        });
      }
    });
    return vids;
  }, [formUrl, formTitle, formDesc, formExtraVideos]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formUrl) {
      toast.error("Title and URL are required");
      return;
    }

    setIsSaving(true);
    try {
      // Prepare extra carousel videos / posts payload
      const validExtras = formExtraVideos
        .filter((v) => isYouTubeUrl(v.url) || isInstagramUrl(v.url) || isTikTokUrl(v.url))
        .map((v) => ({ url: v.url.trim(), title: v.title.trim() }));

      const thumbnailPayload =
        validExtras.length > 0
          ? JSON.stringify(validExtras)
          : editingLink?.thumbnail && !editingLink.thumbnail.startsWith("[")
          ? editingLink.thumbnail
          : null;

      const resolvedIcon = formIcon || detectPlatformFromUrl(formUrl);
      const normalizedUrl = formatUrlForHref(formUrl.trim(), resolvedIcon);
      const cleanDescription = formDesc.trim() || null;

      if (editingLink) {
        // Update existing link
        const res = await fetch(`/api/links/${editingLink.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle.trim(),
            url: normalizedUrl,
            description: cleanDescription,
            icon: resolvedIcon,
            thumbnail: thumbnailPayload,
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
            title: formTitle.trim(),
            url: normalizedUrl,
            description: cleanDescription,
            icon: resolvedIcon,
            thumbnail: thumbnailPayload,
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
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(newStatus ? "Link enabled" : "Link hidden");
    } catch {
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, isEnabled: link.isEnabled } : l))
      );
      toast.error("Failed to update status");
    }
  };

  const handleTogglePin = async (link: LinkItem) => {
    const newPinned = !link.isPinned;
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, isPinned: newPinned } : l))
    );

    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: newPinned }),
      });
      if (!res.ok) throw new Error("Failed to update pinned state");
      toast.success(newPinned ? "Link pinned to top" : "Link unpinned");
    } catch {
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, isPinned: link.isPinned } : l))
      );
      toast.error("Failed to update pinned state");
    }
  };

  const handleToggleDisplayMode = async (link: LinkItem) => {
    const nextMode = link.displayMode === "embed" ? "link" : "embed";
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, displayMode: nextMode } : l))
    );
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayMode: nextMode }),
      });
      if (!res.ok) throw new Error("Failed to update display");

      if (nextMode === "embed") {
        if (isInstagramUrl(link.url)) {
          toast.success("Instagram profil va postlar ko'rinishi faollashtirildi!");
        } else if (isTikTokUrl(link.url)) {
          toast.success("TikTok profil va videolar ko'rinishi faollashtirildi!");
        } else if (isYouTubeUrl(link.url)) {
          toast.success("YouTube video player ko'rinishi faollashtirildi!");
        } else {
          toast.success("Interaktiv ko'rinish faollashtirildi!");
        }
      } else {
        toast.success("Standart havola tugmasiga o'zgartirildi.");
      }
    } catch {
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, displayMode: link.displayMode } : l))
      );
      toast.error("Holatni o'zgartirishda xatolik");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const previous = links;
    const updated = [...links];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    setLinks(updated);

    try {
      const res = await fetch("/api/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkIds: updated.map((l) => l.id) }),
      });
      if (!res.ok) throw new Error("Failed to save order");
    } catch {
      setLinks(previous);
      toast.error("Failed to save order");
    }
  };

  const handleDuplicate = async (link: LinkItem) => {
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Copy of ${link.title}`.slice(0, 100),
          url: link.url,
          description: link.description || null,
          icon: link.icon || detectPlatformFromUrl(link.url),
          thumbnail: link.thumbnail || null,
          displayMode: link.displayMode || "link",
          collectionId: link.collectionId || null,
          isPinned: false,
          isEnabled: link.isEnabled,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not duplicate link");
      setLinks((prev) => [...prev, json.link]);
      toast.success("Link duplicated");
    } catch (err: any) {
      toast.error(err.message || "Could not duplicate link");
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

  const activeCount = links.filter((l) => l.isEnabled).length;
  const totalClicks = links.reduce((acc, l) => acc + l.clicksCount, 0);

  return (
    <div>
      <DashboardHeader
        title={t.linksStudio.title}
        description={t.linksStudio.description}
        action={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openCreateModal("embed", "instagram")}
              className="hidden sm:inline-flex gap-1.5 rounded-xl text-xs font-semibold border-pink-500/30 hover:border-pink-500 hover:bg-pink-500/10 text-pink-600 dark:text-pink-400"
            >
              <Instagram className="h-3.5 w-3.5 text-pink-500" />
              <span>+ Instagram</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openCreateModal("embed", "tiktok")}
              className="hidden sm:inline-flex gap-1.5 rounded-xl text-xs font-semibold border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
            >
              <PlatformIcon platform="tiktok" size={13} className="text-cyan-500" />
              <span>+ TikTok</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openCreateModal("embed", "youtube")}
              className="gap-1.5 rounded-xl text-xs font-semibold border-rose-500/30 hover:border-rose-500 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
            >
              <Video className="h-3.5 w-3.5 text-rose-500" />
              <span>+ YouTube</span>
            </Button>
            <Button
              size="sm"
              onClick={() => openCreateModal("link")}
              className="gap-1.5 rounded-xl text-xs font-semibold"
            >
              <Plus className="h-4 w-4" />
              <span>Add link</span>
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {links.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="No links created yet"
            description="Start building your profile by adding your social channels, portfolio, music, or shop."
            action={
              <Button onClick={() => openCreateModal("link")} className="rounded-xl font-semibold">
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Add your first link</span>
              </Button>
            }
          />
        ) : (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search links by title or URL"
                aria-label="Search links"
                className="pl-9"
              />
            </div>

            {/* Summary strip */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-text-secondary">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1">
                <Link2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                {links.length} links
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1 text-emerald-700 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {activeCount} live
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1">
                <MousePointerClick className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                {totalClicks.toLocaleString()} clicks
              </span>
              <span className="ml-auto hidden text-[10px] font-medium uppercase tracking-[0.12em] sm:inline">
                Drag-free reorder with arrows
              </span>
            </div>

            <div className="space-y-3">
              {links
                .map((link, index) => ({ link, index }))
                .filter(({ link }) => {
                  const needle = query.trim().toLowerCase();
                  if (!needle) return true;
                  return (
                    link.title.toLowerCase().includes(needle) ||
                    link.url.toLowerCase().includes(needle)
                  );
                })
                .map(({ link, index }) => {
                const collection = collections.find((c) => c.id === link.collectionId);

                return (
                  <Card
                    key={link.id}
                    className={`card-lift p-3.5 transition-all duration-200 sm:p-4 ${
                      !link.isEnabled ? "opacity-65" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      {/* Left: reorder, icon, info */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex flex-col gap-0.5 text-text-secondary/60">
                          <button
                            type="button"
                            onClick={() => handleMove(index, "up")}
                            disabled={index === 0}
                            aria-label="Move link up"
                            className="rounded p-0.5 transition-colors hover:text-foreground disabled:opacity-20"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, "down")}
                            disabled={index === links.length - 1}
                            aria-label="Move link down"
                            className="rounded p-0.5 transition-colors hover:text-foreground disabled:opacity-20"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-surface/60 text-foreground">
                          <PlatformIcon platform={link.icon || "website"} size={18} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="truncate text-[13px] font-bold text-foreground">
                              {link.title}
                            </h4>
                            {link.isPinned && (
                              <Badge variant="pro" className="px-1.5 py-0 text-[9px]">
                                PINNED
                              </Badge>
                            )}
                            {collection && (
                              <Badge variant="secondary" className="px-1.5 py-0 text-[9px]">
                                {collection.title}
                              </Badge>
                            )}
                            {isYouTubeUrl(link.url) && link.displayMode === "embed" && (
                              <Badge className="flex items-center gap-1 border-rose-500/30 bg-rose-500/10 px-1.5 py-0 text-[9px] font-semibold text-rose-600 dark:text-rose-400">
                                <Play className="h-2.5 w-2.5 fill-current" />
                                <span>
                                  {parseYouTubeVideosFromLink(link).length > 1
                                    ? `Carousel (${parseYouTubeVideosFromLink(link).length})`
                                    : "Embed"}
                                </span>
                              </Badge>
                            )}
                            {isInstagramUrl(link.url) && link.displayMode === "embed" && (
                              <Badge className="flex items-center gap-1 border-pink-500/30 bg-pink-500/10 px-1.5 py-0 text-[9px] font-semibold text-pink-600 dark:text-pink-400">
                                <Instagram className="h-2.5 w-2.5 text-pink-500" />
                                <span>Instagram Feed</span>
                              </Badge>
                            )}
                            {isTikTokUrl(link.url) && link.displayMode === "embed" && (
                              <Badge className="flex items-center gap-1 border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0 text-[9px] font-semibold text-cyan-600 dark:text-cyan-400">
                                <PlatformIcon platform="tiktok" size={10} className="text-cyan-500" />
                                <span>TikTok Feed</span>
                              </Badge>
                            )}
                          </div>

                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex min-w-0 items-center gap-1 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                              <span className="max-w-[190px] truncate sm:max-w-[260px]">{link.url}</span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                            </a>
                            <span className="text-border">•</span>
                            <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                              <MousePointerClick className="h-3 w-3" />
                              {link.clicksCount} clicks
                            </span>
                            {link.scheduledEnd && (
                              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <Calendar className="h-3 w-3" />
                                Scheduled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div className="flex shrink-0 items-center justify-end gap-1.5 border-t border-border/60 pt-2.5 sm:border-0 sm:pt-0">
                        {isYouTubeUrl(link.url) && (
                          <button
                            type="button"
                            onClick={() => handleToggleDisplayMode(link)}
                            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-bold transition-colors ${
                              link.displayMode === "embed"
                                ? "border-rose-500/40 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400"
                                : "border-border/70 bg-surface/50 text-text-secondary hover:text-foreground"
                            }`}
                            title="Video ko'rinishini almashtirish (pleer yoki tugma)"
                          >
                            <Video className="h-3 w-3 text-rose-500" />
                            <span>{link.displayMode === "embed" ? "Player" : "Button"}</span>
                          </button>
                        )}

                        {isInstagramUrl(link.url) && (
                          <button
                            type="button"
                            onClick={() => handleToggleDisplayMode(link)}
                            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-bold transition-colors ${
                              link.displayMode === "embed"
                                ? "border-pink-500/40 bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 dark:text-pink-400"
                                : "border-border/70 bg-surface/50 text-text-secondary hover:text-foreground"
                            }`}
                            title="Instagram ko'rinishini almashtirish (postlar paneli yoki oddiy tugma)"
                          >
                            <Instagram className="h-3 w-3 text-pink-500" />
                            <span>{link.displayMode === "embed" ? "Feed Card" : "Button"}</span>
                          </button>
                        )}

                        {isTikTokUrl(link.url) && (
                          <button
                            type="button"
                            onClick={() => handleToggleDisplayMode(link)}
                            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-bold transition-colors ${
                              link.displayMode === "embed"
                                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 dark:text-cyan-400"
                                : "border-border/70 bg-surface/50 text-text-secondary hover:text-foreground"
                            }`}
                            title="TikTok ko'rinishini almashtirish (videolar paneli yoki oddiy tugma)"
                          >
                            <PlatformIcon platform="tiktok" size={12} className="text-cyan-500" />
                            <span>{link.displayMode === "embed" ? "Video Feed" : "Button"}</span>
                          </button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePin(link)}
                          className={`h-8 w-8 ${link.isPinned ? "text-amber-500" : "text-text-secondary"}`}
                          title={link.isPinned ? "Unpin link" : "Pin to top"}
                          aria-label={link.isPinned ? "Unpin link" : "Pin link to top"}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(link)}
                          className="h-8 w-8 text-text-secondary hover:text-foreground"
                          aria-label="Edit link"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(link)}
                          className="h-8 w-8 text-text-secondary hover:text-foreground"
                          aria-label="Duplicate link"
                          title="Duplicate link"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(link.id)}
                          className="h-8 w-8 text-text-secondary hover:text-rose-500"
                          aria-label="Delete link"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>

                        <div className="ml-1 border-l border-border/70 pl-2">
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
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingLink ? "Edit link" : "Add new link"}
        description="Enter the destination URL, title, icon, and optional publishing schedule."
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="link-url">Destination URL *</Label>
            <Input
              id="link-url"
              required
              placeholder="https://youtube.com/watch?v=… or https://yoursite.com"
              value={formUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>

          {/* YouTube video post embed configurator */}
          {isYouTubeUrl(formUrl) && (
            <div className="space-y-3 rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-4 animate-in fade-in dark:bg-rose-950/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-600 text-white shadow-xs">
                    <Video className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">YouTube video post</h5>
                    <p className="text-[11px] text-text-secondary">
                      Show a rounded video player directly on your profile
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-text-secondary">
                    {formDisplayMode === "embed" ? "Player embed" : "Link button"}
                  </span>
                  <Switch
                    checked={formDisplayMode === "embed"}
                    onCheckedChange={(val) => setFormDisplayMode(val ? "embed" : "link")}
                  />
                </div>
              </div>

              {formDisplayMode === "embed" && (
                <div className="space-y-3 border-t border-rose-500/20 pt-3">
                  {/* Multi-video carousel */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <Label className="flex items-center gap-1.5 normal-case tracking-normal text-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        Karusel uchun qo&apos;shimcha videolar (10s avto-almashinuv)
                      </Label>
                      <span className="text-[10px] font-semibold text-text-secondary">
                        Jami: {modalVideos.length} ta video
                      </span>
                    </div>

                    {formExtraVideos.map((extra, idx) => (
                      <div
                        key={extra.id}
                        className="space-y-2 rounded-xl border border-rose-500/20 bg-card/80 p-2.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-text-secondary">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
                              {idx + 2}
                            </span>
                            <span>Video #{idx + 2}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormExtraVideos((prev) => prev.filter((v) => v.id !== extra.id))
                            }
                            className="p-1 text-text-secondary transition-colors hover:text-rose-500"
                            title="Videoni o'chirish"
                            aria-label="Remove video"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <Input
                            placeholder="YouTube URL: https://youtube.com/watch?v=…"
                            value={extra.url}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormExtraVideos((prev) =>
                                prev.map((v) => (v.id === extra.id ? { ...v, url: val } : v))
                              );
                            }}
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="Video nomi (ixtiyoriy)"
                            value={extra.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormExtraVideos((prev) =>
                                prev.map((v) => (v.id === extra.id ? { ...v, title: val } : v))
                              );
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormExtraVideos((prev) => [
                          ...prev,
                          { id: `extra-${Date.now()}`, url: "", title: "" },
                        ])
                      }
                      className="h-8 w-full gap-1.5 border-dashed border-rose-400/50 text-xs font-bold text-rose-600 hover:border-rose-500 hover:bg-rose-500/5 dark:text-rose-400"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Yana video qo&apos;shish (10 sekundda almashadi)</span>
                    </Button>
                  </div>

                  {/* Live carousel preview */}
                  <div className="space-y-2 border-t border-rose-500/20 pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <span>✓ Jonli ko&apos;rinish ({modalVideos.length} ta video):</span>
                      </p>
                      {modalVideos.length > 1 && (
                        <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          Har 10 soniyada avto-almashuv
                        </span>
                      )}
                    </div>
                    <YouTubeEmbed videos={modalVideos} borderRadius="16px" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instagram Profile & Posts Feed Configurator */}
          {isInstagramUrl(formUrl) && (
            <div className="space-y-3 rounded-2xl border border-pink-500/30 bg-pink-500/[0.04] p-4 animate-in fade-in dark:bg-pink-950/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-xs">
                    <Instagram className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">Instagram profil va postlar</h5>
                    <p className="text-[11px] text-text-secondary">
                      Profilingizda Instagram sahifangiz va so&apos;nggi postlar paneli ko&apos;rinadi
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-text-secondary">
                    {formDisplayMode === "embed" ? "Postlar paneli" : "Oddiy tugma"}
                  </span>
                  <Switch
                    checked={formDisplayMode === "embed"}
                    onCheckedChange={(val) => setFormDisplayMode(val ? "embed" : "link")}
                  />
                </div>
              </div>

              {formDisplayMode === "embed" && (
                <div className="space-y-3 border-t border-pink-500/20 pt-3">
                  {/* Multi-post & reel showcase */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <Label className="flex items-center gap-1.5 normal-case tracking-normal text-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                        Instagram postlari va reellari (Profilingizda ko&apos;rsatish uchun)
                      </Label>
                      <span className="text-[10px] font-semibold text-text-secondary">
                        {formExtraVideos.length > 0 ? `${formExtraVideos.length} ta post qo'shilgan` : "Post qo'shilmagan"}
                      </span>
                    </div>

                    {formExtraVideos.map((extra, idx) => (
                      <div
                        key={extra.id}
                        className="space-y-2 rounded-xl border border-pink-500/20 bg-card/80 p-2.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-text-secondary">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-pink-600 text-[9px] font-bold text-white">
                              {idx + 1}
                            </span>
                            <span>Post / Reel #{idx + 1}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormExtraVideos((prev) => prev.filter((v) => v.id !== extra.id))
                            }
                            className="p-1 text-text-secondary transition-colors hover:text-pink-500"
                            title="Postni o'chirish"
                            aria-label="Remove post"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <Input
                            placeholder="Instagram post/reel: https://instagram.com/p/…"
                            value={extra.url}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormExtraVideos((prev) =>
                                prev.map((v) => (v.id === extra.id ? { ...v, url: val } : v))
                              );
                            }}
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="Post nomi (masalan: Yangi post)"
                            value={extra.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormExtraVideos((prev) =>
                                prev.map((v) => (v.id === extra.id ? { ...v, title: val } : v))
                              );
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormExtraVideos((prev) => [
                          ...prev,
                          { id: `extra-${Date.now()}`, url: "", title: "" },
                        ])
                      }
                      className="h-8 w-full gap-1.5 border-dashed border-pink-400/50 text-xs font-bold text-pink-600 hover:border-pink-500 hover:bg-pink-500/5 dark:text-pink-400"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Instagram post yoki reel qo&apos;shish</span>
                    </Button>
                  </div>

                  <p className="text-[11px] font-semibold text-pink-600 dark:text-pink-400">
                    ✓ Jonli Instagram ko&apos;rinishi:
                  </p>
                  <InstagramEmbed
                    url={formUrl}
                    title={formTitle}
                    description={formDesc}
                    thumbnail={JSON.stringify(formExtraVideos.filter((v) => v.url.trim()))}
                    borderRadius="14px"
                  />
                </div>
              )}
            </div>
          )}

          {/* TikTok Profile & Video Feed Configurator */}
          {isTikTokUrl(formUrl) && (
            <div className="space-y-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.04] p-4 animate-in fade-in dark:bg-cyan-950/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black text-cyan-400 shadow-xs border border-cyan-500/40">
                    <PlatformIcon platform="tiktok" size={14} className="text-cyan-400" />
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">TikTok profil va videolar</h5>
                    <p className="text-[11px] text-text-secondary">
                      Profilingizda TikTok videolaringiz va obunachilar statistikasi ko&apos;rinadi
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-text-secondary">
                    {formDisplayMode === "embed" ? "Videolar paneli" : "Oddiy tugma"}
                  </span>
                  <Switch
                    checked={formDisplayMode === "embed"}
                    onCheckedChange={(val) => setFormDisplayMode(val ? "embed" : "link")}
                  />
                </div>
              </div>

              {formDisplayMode === "embed" && (
                <div className="space-y-2 border-t border-cyan-500/20 pt-3">
                  <p className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                    ✓ Jonli TikTok videolar ko&apos;rinishi:
                  </p>
                  <TikTokEmbed
                    url={formUrl}
                    title={formTitle}
                    description={formDesc}
                    borderRadius="14px"
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="link-title">Link title *</Label>
            <Input
              id="link-title"
              required
              placeholder="e.g. Watch my latest video"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link-desc">Short description (optional)</Label>
            <Input
              id="link-desc"
              placeholder="e.g. 50% discount code inside"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Custom Platform Icon Dropdown */}
            <div className="space-y-1.5 relative" ref={iconDropdownRef}>
              <Label htmlFor="link-icon">Platform icon</Label>
              {(() => {
                const currentPlatform =
                  PLATFORM_OPTIONS.find((p) => p.value === formIcon) || PLATFORM_OPTIONS[0];
                return (
                  <>
                    <button
                      id="link-icon"
                      type="button"
                      onClick={() => {
                        setIsIconDropdownOpen((prev) => !prev);
                        setIsCollectionDropdownOpen(false);
                      }}
                      className="h-11 w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 flex items-center justify-between text-sm font-medium text-foreground shadow-xs transition-all hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border",
                            currentPlatform.color
                          )}
                        >
                          <PlatformIcon platform={currentPlatform.value} size={13} />
                        </span>
                        <span className="truncate text-xs font-semibold">{currentPlatform.label}</span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200",
                          isIconDropdownOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isIconDropdownOpen && (
                      <div className="absolute left-0 top-full z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur-2xl scrollbar-thin dark:border-white/15 dark:bg-zinc-950/95 animate-in fade-in zoom-in-95 duration-150">
                        <div className="space-y-0.5">
                          {PLATFORM_OPTIONS.map((item) => {
                            const isSelected = (formIcon || "website") === item.value;
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => {
                                  setFormIcon(item.value);
                                  setIsIconDropdownOpen(false);
                                }}
                                className={cn(
                                  "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-all",
                                  isSelected
                                    ? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                                    : "text-foreground hover:bg-zinc-100 dark:hover:bg-white/10"
                                )}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <span
                                    className={cn(
                                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border",
                                      item.color
                                    )}
                                  >
                                    <PlatformIcon platform={item.value} size={13} />
                                  </span>
                                  <span className="truncate">{item.label}</span>
                                </span>
                                {isSelected && (
                                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500 ml-1" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Custom Assign Collection Dropdown */}
            <div className="space-y-1.5 relative" ref={collectionDropdownRef}>
              <Label htmlFor="link-collection">Assign collection</Label>
              {(() => {
                const currentCollection = collections.find((c) => c.id === formCollectionId);
                return (
                  <>
                    <button
                      id="link-collection"
                      type="button"
                      onClick={() => {
                        setIsCollectionDropdownOpen((prev) => !prev);
                        setIsIconDropdownOpen(false);
                      }}
                      className="h-11 w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 flex items-center justify-between text-sm font-medium text-foreground shadow-xs transition-all hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border",
                            currentCollection
                              ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                              : "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
                          )}
                        >
                          {currentCollection ? (
                            <Folder className="h-3.5 w-3.5" />
                          ) : (
                            <Layers className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span className="truncate text-xs font-semibold">
                          {currentCollection ? currentCollection.title : "No collection"}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200",
                          isCollectionDropdownOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isCollectionDropdownOpen && (
                      <div className="absolute left-0 top-full z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur-2xl scrollbar-thin dark:border-white/15 dark:bg-zinc-950/95 animate-in fade-in zoom-in-95 duration-150">
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setFormCollectionId("");
                              setIsCollectionDropdownOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-all",
                              !formCollectionId
                                ? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                                : "text-foreground hover:bg-zinc-100 dark:hover:bg-white/10"
                            )}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-zinc-500/20 bg-zinc-500/10 text-zinc-400">
                                <Layers className="h-3.5 w-3.5" />
                              </span>
                              <span className="truncate">No collection</span>
                            </span>
                            {!formCollectionId && (
                              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500 ml-1" />
                            )}
                          </button>

                          {collections.map((c) => {
                            const isSelected = formCollectionId === c.id;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setFormCollectionId(c.id);
                                  setIsCollectionDropdownOpen(false);
                                }}
                                className={cn(
                                  "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-all",
                                  isSelected
                                    ? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                                    : "text-foreground hover:bg-zinc-100 dark:hover:bg-white/10"
                                )}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                                    <Folder className="h-3.5 w-3.5" />
                                  </span>
                                  <span className="truncate">{c.title}</span>
                                </span>
                                {isSelected && (
                                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500 ml-1" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Scheduling (Pro feature) */}
          <div className="space-y-3 rounded-2xl border border-border/80 bg-surface/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Link scheduling & expiration</span>
              </span>
              {subscriptionTier === "PRO" ? (
                <Badge variant="pro" className="text-[9px]">PRO ACTIVE</Badge>
              ) : (
                <Badge variant="outline" className="text-[9px]">PRO ONLY</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="link-start">Publish date</Label>
                <Input
                  id="link-start"
                  type="datetime-local"
                  disabled={subscriptionTier !== "PRO"}
                  value={formScheduledStart}
                  onChange={(e) => setFormScheduledStart(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="link-end">Expiration date</Label>
                <Input
                  id="link-end"
                  type="datetime-local"
                  disabled={subscriptionTier !== "PRO"}
                  value={formScheduledEnd}
                  onChange={(e) => setFormScheduledEnd(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={formIsPinned}
                onChange={(e) => setFormIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-border text-emerald-500 accent-emerald-500 focus:ring-emerald-500"
              />
              <span>Pin this link to the top</span>
            </label>

            <Button type="submit" isLoading={isSaving} className="rounded-xl px-5">
              <span>{editingLink ? "Update link" : "Add link"}</span>
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
        title="Delete link"
        description="Are you sure you want to permanently delete this link from your profile? This action cannot be undone."
      />
    </div>
  );
}
