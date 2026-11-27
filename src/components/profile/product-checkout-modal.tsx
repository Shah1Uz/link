"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Check,
  CreditCard,
  Download,
  BookOpen,
  GraduationCap,
  Calendar,
  Package,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { toast } from "sonner";
import { PRODUCT_TYPES, ProductType, formatCurrency } from "@/lib/store/config";
import { cn } from "@/lib/utils";

export interface StoreProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  galleryUrls?: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  type?: string;
  category?: string | null;
  isDigital: boolean;
  isEnabled: boolean;
  isFeatured?: boolean;
  salesCount: number;
}

export interface StoreSeller {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isVerified?: boolean;
}

interface ProductCheckoutModalProps {
  product: StoreProduct | null;
  seller: StoreSeller;
  onClose: () => void;
}

export function ProductCheckoutModal({
  product,
  seller,
  onClose,
}: ProductCheckoutModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!product) {
      document.body.style.overflow = "unset";
      return;
    }

    // Lock scroll on underlying page while modal is active
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product]);

  if (!product || !mounted) return null;

  // Extract gallery images
  const galleryImages: string[] = [];
  if (product.imageUrl) galleryImages.push(product.imageUrl);
  if (product.galleryUrls) {
    try {
      const parsed = JSON.parse(product.galleryUrls);
      if (Array.isArray(parsed)) {
        parsed.forEach((img: string) => {
          if (img && !galleryImages.includes(img)) galleryImages.push(img);
        });
      }
    } catch {}
  }
  const currentHeroImage = galleryImages[activeImageIndex] || galleryImages[0] || null;

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "EBOOK":
        return <BookOpen className="h-3.5 w-3.5" />;
      case "COURSE":
        return <GraduationCap className="h-3.5 w-3.5" />;
      case "SERVICE":
        return <Calendar className="h-3.5 w-3.5" />;
      case "PHYSICAL":
        return <Package className="h-3.5 w-3.5" />;
      case "EXTERNAL":
        return <ShoppingBag className="h-3.5 w-3.5" />;
      default:
        return <Download className="h-3.5 w-3.5" />;
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim()) {
      toast.error("Please enter your email to receive order access");
      return;
    }

    try {
      setIsCheckingOut(true);

      // Track purchase attempt
      fetch(`/api/products/${product.id}/click`, { method: "POST" }).catch(() => {});

      const res = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          customerEmail: customerEmail.trim(),
          customerName: customerName.trim() || null,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process order");
      }

      // Case 1: Stripe Checkout Session URL available -> redirect
      if (data.checkoutUrl) {
        toast.info("Redirecting to secure Stripe checkout...");
        window.location.href = data.checkoutUrl;
        return;
      }

      // Case 2: Free product ($0) or test mode -> instant receipt
      setCompletedOrder({
        orderNumber: data.orderNumber,
        isFree: data.isFree,
        downloadUrl: data.downloadUrl || product.fileUrl,
        warning: data.warning,
      });

      if (data.isFree) {
        toast.success("Order confirmed! Digital access unlocked.");
      } else if (data.warning) {
        toast.warning("Preview order recorded. Live payment gateway setup pending.");
      }
    } catch (err: any) {
      toast.error(err.message || "Checkout could not be initialized");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 font-sans antialiased overflow-y-auto"
      style={{
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Deep, opaque backdrop completely eliminates background page bleeding */}
      <div
        className="fixed inset-0 z-0 backdrop-blur-xl transition-opacity duration-200"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.88)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-white/15 bg-zinc-950 text-white shadow-[0_25px_80px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-3xl outline-none sm:rounded-[32px]"
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product view"
          className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/75 text-white/90 shadow-xl backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:bg-black/95 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>

        {/* Scrollable Content Body */}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-5 pb-6 pt-2 sm:px-7 sm:pb-7">
          {/* Hero Media Section */}
          {currentHeroImage ? (
            <div className="mb-5 space-y-2.5">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-inner sm:aspect-[16/9] sm:rounded-3xl">
                {/* Ambient Blurred Background Glow */}
                <Image
                  src={currentHeroImage}
                  alt=""
                  fill
                  className="scale-125 object-cover opacity-35 blur-2xl"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/25" />

                {/* Sharp Product Image */}
                <div className="relative h-full w-full p-2.5 sm:p-4">
                  <Image
                    src={currentHeroImage}
                    alt={product.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>

                {/* Badges on Hero */}
                <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/70 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
                    {product.category || "General"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-zinc-200 backdrop-blur-md">
                    {getTypeIcon(product.type)}
                    <span>
                      {PRODUCT_TYPES[(product.type as ProductType) || "DIGITAL_DOWNLOAD"]?.label ||
                        "Digital"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={cn(
                        "relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                        activeImageIndex === idx
                          ? "scale-105 border-emerald-400 shadow-md shadow-emerald-500/20"
                          : "border-white/10 opacity-60 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Product Header: Title & Price */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              {!currentHeroImage && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    {product.category || "General"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
                    {getTypeIcon(product.type)}
                    <span>
                      {PRODUCT_TYPES[(product.type as ProductType) || "DIGITAL_DOWNLOAD"]?.label ||
                        "Digital"}
                    </span>
                  </span>
                </div>
              )}
              <h2 className="text-xl font-extrabold leading-tight tracking-tight text-white sm:text-2xl">
                {product.title}
              </h2>
            </div>

            <div className="shrink-0 self-start rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-left sm:self-auto sm:text-right">
              <span className="block text-xl font-black text-emerald-400 sm:text-2xl">
                {product.price === 0 ? "FREE" : formatCurrency(product.price, product.currency)}
              </span>
              <span className="mt-0.5 block text-[9px] font-black uppercase tracking-wider text-emerald-300/80">
                {product.price === 0 ? "instant access" : "one-time payment"}
              </span>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
              <p className="scrollbar-thin max-h-36 overflow-y-auto text-xs leading-relaxed text-zinc-300 sm:text-[13px]">
                {product.description}
              </p>
            </div>
          )}

          {/* Creator Attribution Card */}
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 text-xs font-black text-zinc-950 shadow-md">
                {seller.avatarUrl ? (
                  <img
                    src={seller.avatarUrl}
                    alt={seller.username}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  seller.username.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 truncate text-xs font-bold text-white">
                  <span>{seller.displayName || `@${seller.username}`}</span>
                  {seller.isVerified && (
                    <VerifiedBadge size="xs" />
                  )}
                </div>
                <p className="truncate text-[10px] text-zinc-400">Creator on BioSpace</p>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Direct Purchase</span>
            </span>
          </div>

          {/* Flow Branch: Receipt View vs Checkout Form */}
          {completedOrder ? (
            <div className="space-y-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center animate-in fade-in zoom-in-95">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20">
                <Check className="h-6 w-6" strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {completedOrder.isFree ? "Digital Download Unlocked!" : "Order Confirmed!"}
                </h3>
                <p className="mt-1 text-xs text-zinc-300">
                  Order reference:{" "}
                  <span className="font-mono font-bold text-emerald-400">
                    #{completedOrder.orderNumber}
                  </span>
                </p>
              </div>

              {completedOrder.warning && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs leading-relaxed text-amber-300">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{completedOrder.warning}</span>
                </div>
              )}

              {completedOrder.downloadUrl && (
                <a
                  href={completedOrder.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-sm font-extrabold text-zinc-950 shadow-lg shadow-emerald-500/30 transition-all hover:brightness-110 active:scale-[0.99]"
                >
                  <Download className="h-4 w-4" />
                  <span>Download your file</span>
                </a>
              )}

              <button
                type="button"
                onClick={onClose}
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="checkout-modal-email"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-300"
                >
                  Your Email Address <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="checkout-modal-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3.5 text-sm text-white placeholder:text-zinc-500 transition-all focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                />
                <p className="mt-1 text-[10px] text-zinc-400">
                  Receipt and digital product access link will be delivered here.
                </p>
              </div>

              <div>
                <label
                  htmlFor="checkout-modal-name"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-300"
                >
                  Your Name <span className="font-normal lowercase text-zinc-500">(optional)</span>
                </label>
                <input
                  id="checkout-modal-name"
                  type="text"
                  placeholder="Jane Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3.5 text-sm text-white placeholder:text-zinc-500 transition-all focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="group relative flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-sm font-extrabold text-zinc-950 shadow-[0_12px_30px_-8px_rgba(16,185,129,0.5)] transition-all duration-300 hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                      <span>Processing checkout...</span>
                    </span>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>
                        {product.price === 0
                          ? "Get Instant Free Download"
                          : `Purchase for ${formatCurrency(product.price, product.currency)}`}
                      </span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 pb-2 text-[10px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Secure delivery</span>
                </span>
                <span aria-hidden="true" className="text-zinc-600">
                  •
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>256-bit encrypted checkout</span>
                </span>
                <span aria-hidden="true" className="text-zinc-600">
                  •
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Instant access</span>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
