"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Download,
  BookOpen,
  GraduationCap,
  Calendar,
  Package,
  Sparkles,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { PRODUCT_TYPES, ProductType, formatCurrency } from "@/lib/store/config";
import { resolveThemeSurface, withAlpha } from "./theme-surface";
import { ProductCheckoutModal, StoreProduct, StoreSeller } from "./product-checkout-modal";
import { cn } from "@/lib/utils";

interface PublicStoreSectionProps {
  products: StoreProduct[];
  seller: StoreSeller;
  theme?: any;
}

// Fallback high-resolution merch images so mosaic preview is always vibrant & complete
const FALLBACK_MERCH_IMAGES = [
  "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80", // Graphic sticker / print
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80", // Merch badge
  "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&auto=format&fit=crop&q=80", // Beanie / streetwear
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80", // Apparel / hoodie
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80", // Longsleeve / t-shirt
];

export function PublicStoreSection({ products, seller, theme }: PublicStoreSectionProps) {
  // Navigation mode: defaults directly to "catalog" so products are immediately accessible
  const [viewMode, setViewMode] = useState<"collection" | "catalog">("catalog");
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  if (!products || products.length === 0) {
    return null;
  }

  // Derive available categories
  const categories = Array.from(
    new Set(products.map((p) => p.category || "General").filter(Boolean))
  );

  const filteredProducts = products.filter((p) => {
    if (activeCategory === "ALL") return true;
    return (p.category || "General") === activeCategory;
  });

  // Build mosaic image list from product images, filling gaps with curated merch photos
  const realProductImages = products
    .map((p) => p.imageUrl)
    .filter((img): img is string => Boolean(img && img.trim().length > 0));

  const mosaicImages: string[] = [
    realProductImages[0] || FALLBACK_MERCH_IMAGES[0],
    realProductImages[1] || FALLBACK_MERCH_IMAGES[1],
    realProductImages[2] || FALLBACK_MERCH_IMAGES[2],
    realProductImages[3] || FALLBACK_MERCH_IMAGES[3],
    realProductImages[4] || FALLBACK_MERCH_IMAGES[4],
  ];

  const handleOpenProduct = (product: StoreProduct) => {
    setSelectedProduct(product);
    // Non-blocking view tracking
    fetch(`/api/products/${product.id}/view`, { method: "POST" }).catch(() => {});
  };

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

  // Theme-aware platform surface (never replaces creator theme values).
  const ts = resolveThemeSurface(theme);
  const accentInk = ts.accentInk;
  const accentText = ts.accentText;

  const categoryPills = [
    { label: "All Items", value: "ALL" },
    ...categories.map((category) => ({ label: category, value: category })),
  ];

  const featuredBadge = (className?: string) => (
    <span
      className={cn(
        "absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-amber-950 shadow-md",
        className
      )}
    >
      <Sparkles className="h-2.5 w-2.5" />
      Featured
    </span>
  );

  const typeBadge = (type?: string) => (
    <span className="absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/70 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md shadow-sm">
      {getTypeIcon(type)}
      <span>{PRODUCT_TYPES[(type as ProductType) || "DIGITAL_DOWNLOAD"]?.label || "Digital"}</span>
    </span>
  );

  return (
    <div className="w-full" style={ts.vars}>
      {/* ======================================================== */}
      {/* MODE 1: COLLECTION VIEW (Merch Card with 5-image mosaic) */}
      {/* ======================================================== */}
      {viewMode === "collection" ? (
        <div className="animate-in fade-in slide-in-from-left-6 duration-300">
          <button
            type="button"
            onClick={() => setViewMode("catalog")}
            aria-label="Open merch catalog"
            className="group relative block w-full overflow-hidden rounded-3xl border p-3 text-left shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 sm:p-4"
            style={{
              backgroundColor: ts.surface,
              borderColor: ts.border,
              color: ts.text,
              boxShadow: `0 24px 55px -34px ${withAlpha(ts.text, 0.7)}`,
              "--tw-ring-color": ts.accentBorder,
            } as React.CSSProperties}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${ts.accentBorder}, transparent)`,
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-80"
              style={{ backgroundColor: ts.accentSoft }}
            />

            <span className="relative block">
              {/* 5-Photo Mosaic Grid */}
              <span className="grid aspect-[4/3] grid-cols-2 gap-1.5 overflow-hidden rounded-[20px] sm:aspect-[16/11]">
                {/* Left 50%: 1 large square/tall image */}
                <span
                  className="relative block h-full w-full overflow-hidden"
                  style={{ backgroundColor: withAlpha(ts.base, 0.5) }}
                >
                  <Image
                    src={mosaicImages[0]}
                    alt={products[0]?.title || "Merch Item"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </span>

                {/* Right 50%: 2x2 grid of 4 images */}
                <span className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1.5">
                  {[1, 2, 3, 4].map((index) => (
                    <span
                      key={index}
                      className="relative block h-full w-full overflow-hidden"
                      style={{ backgroundColor: withAlpha(ts.base, 0.5) }}
                    >
                      <Image
                        src={mosaicImages[index]}
                        alt={products[index]?.title || "Merch Item"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    </span>
                  ))}
                </span>
              </span>

              {/* Bottom Bar: Title, Subtitle, and CTA */}
              <span className="flex items-center justify-between gap-3 px-1 pb-1 pt-4">
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-base font-extrabold tracking-[-0.02em] sm:text-lg">
                      Merch
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em]"
                      style={{ backgroundColor: ts.accentSoft, color: accentInk }}
                    >
                      Collection
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium sm:text-xs" style={{ color: ts.muted }}>
                    {products.length} {products.length === 1 ? "product" : "products"} · Tap to explore
                  </span>
                </span>

                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out-expo group-hover:translate-x-0.5"
                  style={{
                    backgroundColor: ts.accent,
                    color: accentText,
                    boxShadow: ts.glow,
                  }}
                >
                  <ArrowRight className="h-5 w-5" />
                </span>
              </span>
            </span>
          </button>
        </div>
      ) : (
        /* ======================================================== */
        /* MODE 2: CATALOG VIEW (Products Grid & Direct Purchase)   */
        /* ======================================================== */
        <div className="animate-in fade-in slide-in-from-right-6 duration-300 space-y-4">
          {/* Header Bar with optional Collection View toggle */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold tracking-tight" style={{ color: ts.text }}>
              Products ({filteredProducts.length})
            </span>

            {products.length >= 3 && (
              <button
                type="button"
                onClick={() => setViewMode("collection")}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-md transition-all duration-200 hover:bg-[var(--ts-hover)]"
                style={{
                  backgroundColor: ts.faint,
                  borderColor: ts.border,
                  color: ts.text,
                }}
              >
                <span>Mosaic preview</span>
              </button>
            )}
          </div>

          {/* Category Filter Pills (if > 1 category) */}
          {categories.length > 1 && (
            <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto pb-1">
              {categoryPills.map((pill) => {
                const isActive = activeCategory === pill.value;
                return (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => setActiveCategory(pill.value)}
                    aria-pressed={isActive}
                    className={cn(
                      "whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-bold transition-all duration-200",
                      isActive ? "" : "bg-[var(--ts-faint)] hover:bg-[var(--ts-hover)]"
                    )}
                    style={
                      isActive
                        ? {
                            backgroundColor: ts.accent,
                            borderColor: ts.accentBorder,
                            color: accentText,
                          }
                        : { borderColor: ts.border, color: ts.muted }
                    }
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {filteredProducts.map((p) => {
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleOpenProduct(p)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border text-left backdrop-blur-md transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:bg-[var(--ts-surface-hover)] hover:shadow-[0_26px_50px_-30px_rgba(0,0,0,0.6)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 bg-[var(--ts-surface)]"
                  style={{
                    borderColor: ts.border,
                    color: ts.text,
                    boxShadow: `0 14px 34px -28px ${withAlpha(ts.text, 0.6)}`,
                    "--tw-ring-color": ts.accentBorder,
                  } as React.CSSProperties}
                >
                  {/* Product Cover Image */}
                  {p.imageUrl ? (
                    <span
                      className="relative block aspect-[4/3] w-full overflow-hidden"
                      style={{ backgroundColor: withAlpha(ts.base, 0.5) }}
                    >
                      <Image
                        src={p.imageUrl}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
                        unoptimized
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15"
                      />
                      {p.isFeatured && featuredBadge()}
                      {typeBadge(p.type)}
                    </span>
                  ) : (
                    <span
                      className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${ts.accentSoft}, transparent 72%)`,
                      }}
                    >
                      <ShoppingBag className="h-9 w-9" style={{ color: ts.subtle }} />
                      {p.isFeatured && featuredBadge()}
                      {typeBadge(p.type)}
                    </span>
                  )}

                  {/* Product Details */}
                  <span className="flex flex-1 flex-col justify-between p-3.5">
                    <span className="block">
                      <span className="mb-1 flex items-center justify-between gap-2">
                        <span
                          className="truncate text-[10px] font-semibold uppercase tracking-[0.12em]"
                          style={{ color: ts.muted }}
                        >
                          {p.category || "General"}
                        </span>
                        {p.salesCount > 0 && (
                          <span className="shrink-0 text-[10px] font-medium" style={{ color: ts.subtle }}>
                            {p.salesCount} sold
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-sm font-bold tracking-[-0.01em]">
                        {p.title}
                      </span>
                      {p.description && (
                        <span
                          className="mt-1 line-clamp-2 block text-[11px] leading-relaxed"
                          style={{ color: ts.muted }}
                        >
                          {p.description}
                        </span>
                      )}
                    </span>

                    <span
                      className="mt-3 flex items-center justify-between border-t pt-2.5"
                      style={{ borderColor: ts.border }}
                    >
                      <span className="text-sm font-extrabold" style={{ color: accentInk }}>
                        {p.price === 0 ? "FREE" : formatCurrency(p.price, p.currency)}
                      </span>
                      <span
                        className="flex items-center gap-1 text-[11px] font-semibold opacity-80 transition-opacity group-hover:opacity-100"
                        style={{ color: ts.text }}
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modern, Portal-mounted, Completely Isolated Product Details & Checkout Modal */}
      <ProductCheckoutModal
        product={selectedProduct}
        seller={seller}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
