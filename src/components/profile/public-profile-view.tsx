"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Share2,
  ExternalLink,
  Sparkles,
  ChevronDown,
  Flag,
  Copy,
  Check,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { ReportModal } from "./report-modal";
import { formatUrlForHref } from "@/lib/utils";
import { toast } from "sonner";

interface PublicProfileViewProps {
  profile: any;
  theme: any;
  links: any[];
  collections: any[];
  products?: any[];
}

export function PublicProfileView({
  profile,
  theme,
  links,
  collections,
  products = [],
}: PublicProfileViewProps) {
  const [collapsedCollections, setCollapsedCollections] = useState<Record<string, boolean>>({});
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReportLinkId, setSelectedReportLinkId] = useState<string | undefined>(undefined);
  const [copiedShare, setCopiedShare] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Auto-record page view event on mount (non-blocking)
  useEffect(() => {
    try {
      const visitorId = localStorage.getItem("biospace_visitor_id") || `vis_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem("biospace_visitor_id", visitorId);

      const device = window.innerWidth < 768 ? "Mobile" : window.innerWidth < 1024 ? "Tablet" : "Desktop";

      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          type: "VIEW",
          visitorId,
          referrer: document.referrer || "direct",
          device,
        }),
      }).catch(() => {});
    } catch {}
  }, [profile.id]);

  const handleLinkClick = (linkId: string, url: string) => {
    try {
      const visitorId = localStorage.getItem("biospace_visitor_id") || "anonymous";
      const device = window.innerWidth < 768 ? "Mobile" : "Desktop";

      // Track click
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          linkId,
          type: "CLICK",
          visitorId,
          referrer: window.location.href,
          device,
        }),
      }).catch(() => {});
    } catch {}

    // Navigate to destination
    window.open(formatUrlForHref(url), "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName || profile.username} on BioSpace`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      toast.success("Profile URL copied to clipboard!");
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const toggleCollection = (id: string) => {
    setCollapsedCollections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter out scheduled links that are outside their active date window
  const now = new Date();
  const visibleLinks = links.filter((l) => {
    if (!l.isEnabled) return false;
    if (l.scheduledStart && new Date(l.scheduledStart) > now) return false;
    if (l.scheduledEnd && new Date(l.scheduledEnd) < now) return false;
    return true;
  });

  const uncollectedLinks = visibleLinks.filter((l) => !l.collectionId);

  // Background styling
  const bgStyle =
    theme?.backgroundType === "gradient" && theme?.backgroundGradient
      ? { background: theme.backgroundGradient }
      : { backgroundColor: theme?.backgroundColor || "#0d1117" };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between transition-colors duration-300"
      style={{
        ...bgStyle,
        color: theme?.textColor || "#ffffff",
        fontFamily: theme?.fontHeading || "Inter",
      }}
    >
      {/* Top Floating Action Bar */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between p-4 sm:p-6 z-10">
        <button
          onClick={() => {
            setSelectedReportLinkId(undefined);
            setReportModalOpen(true);
          }}
          className="h-9 w-9 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center transition-all opacity-70 hover:opacity-100"
          title="Report Profile"
        >
          <Flag className="h-4 w-4" />
        </button>

        <button
          onClick={handleShare}
          className="h-9 w-9 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100"
          title="Share Profile"
        >
          {copiedShare ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Profile Container */}
      <main className="w-full max-w-lg mx-auto px-5 pb-12 flex-1 flex flex-col items-center">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center w-full mb-8">
          {/* Avatar */}
          <div className="relative mb-4 group">
            <div
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-full p-1 border-2 transition-transform duration-300 group-hover:scale-105"
              style={{ borderColor: theme?.accentColor || "#10b981" }}
            >
              <img
                src={
                  profile.avatarUrl ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                }
                alt={profile.displayName || profile.username}
                className="h-full w-full rounded-full object-cover shadow-lg"
              />
            </div>
          </div>

          {/* Display Name & Verified Badge */}
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {profile.displayName || profile.username}
            </h1>
            {profile.verified && (
              <CheckCircle2
                className="h-5 w-5 shrink-0"
                style={{ color: theme?.accentColor || "#38bdf8" }}
              />
            )}
          </div>

          {/* Username */}
          <p className="text-xs sm:text-sm font-semibold opacity-75 mt-0.5">
            @{profile.username}
          </p>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-3 max-w-sm text-xs sm:text-sm leading-relaxed opacity-90 font-normal">
              {profile.bio}
            </p>
          )}

          {/* Social Icons Row */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-5">
            {visibleLinks
              .filter((l) => l.icon && l.icon !== "website")
              .slice(0, 6)
              .map((l) => (
                <div
                  key={l.id}
                  onClick={() => handleLinkClick(l.id, l.url)}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                >
                  <PlatformIcon platform={l.icon} size={15} />
                </div>
              ))}
          </div>
        </div>

        {/* Links & Collections Container */}
        <div className="w-full space-y-4">
          {/* Uncollected links */}
          {uncollectedLinks.map((link) => (
            <div
              key={link.id}
              onClick={() => handleLinkClick(link.id, link.url)}
              className="group relative flex items-center justify-between px-5 py-4 text-sm font-bold shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.015] active:scale-[0.98]"
              style={{
                backgroundColor: theme?.buttonColor || "#10b981",
                color: theme?.buttonTextColor || "#042f2e",
                borderRadius: theme?.buttonRadius || "16px",
                border: theme?.buttonBorderColor ? `1px solid ${theme.buttonBorderColor}` : "none",
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-3">
                {link.icon && (
                  <div className="shrink-0">
                    <PlatformIcon platform={link.icon} size={18} />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate">{link.title}</div>
                  {link.description && (
                    <div className="text-[11px] font-normal opacity-75 truncate mt-0.5">
                      {link.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                {link.isPinned && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/10 mr-1.5 font-bold uppercase tracking-wider">
                    Featured
                  </span>
                )}
                <ExternalLink className="h-4 w-4" />
              </div>
            </div>
          ))}

          {/* Grouped Collections */}
          {collections.map((col) => {
            const colLinks = visibleLinks.filter((l) => l.collectionId === col.id);
            if (colLinks.length === 0) return null;

            const isCollapsed = collapsedCollections[col.id];

            return (
              <div key={col.id} className="pt-2">
                <button
                  type="button"
                  onClick={() => toggleCollection(col.id)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider opacity-75 hover:opacity-100 transition-opacity"
                >
                  <span>{col.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isCollapsed ? "-rotate-90" : ""
                    }`}
                  />
                </button>

                {!isCollapsed && (
                  <div className="space-y-3 pt-1">
                    {colLinks.map((link) => (
                      <div
                        key={link.id}
                        onClick={() => handleLinkClick(link.id, link.url)}
                        className="group relative flex items-center justify-between px-5 py-4 text-sm font-bold shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.015] active:scale-[0.98]"
                        style={{
                          backgroundColor: theme?.buttonColor || "#10b981",
                          color: theme?.buttonTextColor || "#042f2e",
                          borderRadius: theme?.buttonRadius || "16px",
                          border: theme?.buttonBorderColor ? `1px solid ${theme.buttonBorderColor}` : "none",
                        }}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 pr-3">
                          {link.icon && (
                            <div className="shrink-0">
                              <PlatformIcon platform={link.icon} size={18} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="truncate">{link.title}</div>
                            {link.description && (
                              <div className="text-[11px] font-normal opacity-75 truncate mt-0.5">
                                {link.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Creator Products Store (Commerce Domain) */}
          {products.length > 0 && (
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider opacity-75">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Digital Store & Downloads</span>
                </span>
                <span className="text-[11px] font-normal opacity-70">
                  {products.length} {products.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm truncate">{p.title}</div>
                      {p.description && (
                        <div className="text-xs opacity-75 line-clamp-1 mt-0.5">
                          {p.description}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow-sm">
                        {"$"}{p.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Checkout Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.title || "Digital Product"}
        description={selectedProduct?.description || "Digital download product"}
        className="max-w-md text-zinc-900 dark:text-white"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <span className="text-xs font-semibold text-zinc-500">Price</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {"$"}{selectedProduct?.price?.toFixed(2)} {selectedProduct?.currency}
            </span>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Instant digital access delivered immediately to your email upon confirmed checkout.
          </p>

          <Button
            onClick={() => {
              toast.success("Order simulated! Digital download link generated.");
              setSelectedProduct(null);
            }}
            className="w-full rounded-xl font-bold gap-2 bg-emerald-500 hover:bg-emerald-600 text-black"
          >
            <CreditCard className="h-4 w-4" />
            <span>Complete Order & Download</span>
          </Button>
        </div>
      </Modal>

      {/* BioSpace Branding Footer (Can be toggled off by Pro users) */}
      {(theme?.showBranding ?? true) && (
        <footer className="w-full py-6 text-center text-xs opacity-75 flex items-center justify-center gap-1.5 font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hover:underline hover:opacity-100 transition-opacity"
          >
            Create your own free BioSpace
          </a>
        </footer>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        profileId={profile.id}
        linkId={selectedReportLinkId}
      />
    </div>
  );
}

