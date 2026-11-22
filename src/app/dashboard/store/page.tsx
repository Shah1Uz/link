"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import {
  ShoppingBag,
  Plus,
  DollarSign,
  PackageCheck,
  TrendingUp,
  Tag,
  Trash2,
  Edit3,
  ExternalLink,
  Check,
  Download,
  AlertCircle,
  FileText,
  BookOpen,
  GraduationCap,
  Calendar,
  Package,
  Sparkles,
  Eye,
  MousePointerClick,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Search,
  Filter,
  Upload,
  CreditCard,
  ShieldCheck,
  Settings,
  HelpCircle,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  PRODUCT_TYPES,
  PRODUCT_CATEGORIES,
  ProductType,
  formatCurrency,
} from "@/lib/store/config";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  galleryUrls?: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  type: ProductType;
  category: string;
  isDigital: boolean;
  isEnabled: boolean;
  isFeatured: boolean;
  position: number;
  salesCount: number;
  viewsCount?: number;
  clicksCount?: number;
  _count?: { orders: number };
}

interface Order {
  id: string;
  orderNumber: string | null;
  customerEmail: string;
  customerName: string | null;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  product?: {
    id: string;
    title: string;
    type: string;
  };
}

export default function StoreDashboardPage() {
  const { t } = useI18n();
  const { profile, updateProfile } = useDashboard();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "settings">("products");
  const [isUpdatingStoreStatus, setIsUpdatingStoreStatus] = useState(false);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    tier: string;
    maxProducts: number;
    currentCount: number;
    canAddMore: boolean;
  } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderMetrics, setOrderMetrics] = useState<{
    totalOrders: number;
    completedCount: number;
    refundedCount: number;
    grossRevenue: number;
    netRevenue: number;
  }>({
    totalOrders: 0,
    completedCount: 0,
    refundedCount: 0,
    grossRevenue: 0,
    netRevenue: 0,
  });
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalTab, setModalTab] = useState<"basics" | "media" | "options">("basics");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("29.00");
  const [currency, setCurrency] = useState("USD");
  const [productType, setProductType] = useState<ProductType>("DIGITAL_DOWNLOAD");
  const [category, setCategory] = useState("Development & Code");
  const [imageUrl, setImageUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [fileUrl, setFileUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Refund Modal state
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.subscription) {
          setSubscriptionInfo(data.subscription);
        }
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch("/api/store/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.metrics) {
          setOrderMetrics(data.metrics);
        }
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  // Summary Metrics calculations
  const totalViews = products.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const totalClicks = products.reduce((sum, p) => sum + (p.clicksCount || 0), 0);
  const publishedCount = products.filter((p) => p.isEnabled).length;
  const ctrRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  const [storeEnabledState, setStoreEnabledState] = useState<boolean>(
    profile?.storeEnabled !== false
  );

  useEffect(() => {
    if (profile?.storeEnabled !== undefined) {
      setStoreEnabledState(profile.storeEnabled !== false);
    }
  }, [profile?.storeEnabled]);

  const isStoreEnabled = storeEnabledState;
  const hasProducts = products.length > 0;
  const isEffectivelyActive = isStoreEnabled && hasProducts;

  const handleToggleStoreStatus = async (newVal: boolean) => {
    if (!hasProducts && newVal) {
      toast.error("Do'konni yoqish uchun avval kamida 1 ta mahsulot qo'shing!");
      return;
    }
    setStoreEnabledState(newVal);
    setIsUpdatingStoreStatus(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeEnabled: newVal }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update store visibility");
      }
      updateProfile({ storeEnabled: newVal });
      toast.success(
        newVal
          ? "Do'kon bo'limi profilda muvaffaqiyatli yoqildi!"
          : "Do'kon bo'limi profildan yashirildi (faqat Links ko'rinadi)!"
      );
    } catch (error: any) {
      setStoreEnabledState(!newVal);
      toast.error(error.message || "Xatolik yuz berdi");
    } finally {
      setIsUpdatingStoreStatus(false);
    }
  };

  const handleOpenAddModal = () => {
    if (subscriptionInfo && !subscriptionInfo.canAddMore) {
      toast.error(
        `Product limit reached (${subscriptionInfo.maxProducts} products for ${subscriptionInfo.tier} plan). Please upgrade your plan!`
      );
      return;
    }

    setEditingProduct(null);
    setTitle("");
    setDescription("");
    setPrice("19.99");
    setCurrency("USD");
    setProductType("DIGITAL_DOWNLOAD");
    setCategory("Development & Code");
    setImageUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80");
    setGalleryUrls([]);
    setFileUrl("https://example.com/assets/download-package.zip");
    setExternalUrl("");
    setIsEnabled(true);
    setIsFeatured(false);
    setModalTab("basics");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setDescription(p.description || "");
    setPrice(p.price.toString());
    setCurrency(p.currency || "USD");
    setProductType(p.type || "DIGITAL_DOWNLOAD");
    setCategory(p.category || "General");
    setImageUrl(p.imageUrl || "");
    setFileUrl(p.fileUrl || "");
    setExternalUrl(p.externalUrl || "");
    setIsEnabled(p.isEnabled);
    setIsFeatured(p.isFeatured || false);

    if (p.galleryUrls) {
      try {
        const parsed = JSON.parse(p.galleryUrls);
        setGalleryUrls(Array.isArray(parsed) ? parsed : []);
      } catch {
        setGalleryUrls([]);
      }
    } else {
      setGalleryUrls([]);
    }

    setModalTab("basics");
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingImage(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image upload failed");

      setImageUrl(data.url);
      toast.success("Product cover image uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a product title");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        id: editingProduct?.id,
        title: title.trim(),
        description: description.trim() || null,
        price: parseFloat(price) || 0,
        currency,
        type: productType,
        category,
        imageUrl: imageUrl.trim() || null,
        galleryUrls: galleryUrls.filter(Boolean),
        fileUrl: fileUrl.trim() || null,
        externalUrl: externalUrl.trim() || null,
        isEnabled,
        isFeatured,
      };

      const res = await fetch("/api/products", {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      toast.success(
        editingProduct ? "Product updated successfully!" : "Product created and added to your store!"
      );
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      const newStatus = !product.isEnabled;
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isEnabled: newStatus } : p))
      );

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, isEnabled: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      toast.success(newStatus ? "Product published!" : "Product moved to drafts.");
    } catch {
      toast.error("Failed to update product status");
      fetchProducts();
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const newFeatured = !product.isFeatured;
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isFeatured: newFeatured } : p))
      );

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, isFeatured: newFeatured }),
      });

      if (!res.ok) throw new Error("Failed to update featured flag");
      toast.success(newFeatured ? "Featured on public profile!" : "Removed from featured.");
    } catch {
      toast.error("Failed to update featured flag");
      fetchProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product");

      toast.success("Product deleted successfully");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (subscriptionInfo) {
        setSubscriptionInfo({
          ...subscriptionInfo,
          currentCount: Math.max(0, subscriptionInfo.currentCount - 1),
          canAddMore: true,
        });
      }
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleMovePosition = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newProducts = [...products];
    const temp = newProducts[index];
    newProducts[index] = newProducts[targetIndex];
    newProducts[targetIndex] = temp;

    const updatedItems = newProducts.map((p, idx) => ({ id: p.id, position: idx }));
    setProducts(newProducts);

    try {
      await fetch("/api/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updatedItems }),
      });
      toast.success("Order updated!");
    } catch {
      toast.error("Failed to save new order");
      fetchProducts();
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOrder) return;

    try {
      setRefundSubmitting(true);
      const res = await fetch("/api/store/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: refundModalOrder.id,
          reason: refundReason || "Requested by customer",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refund processing failed");

      toast.success(data.message || "Order refunded successfully");
      setRefundModalOrder(null);
      setRefundReason("");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to process refund");
    } finally {
      setRefundSubmitting(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    if (selectedTypeFilter !== "ALL" && p.type !== selectedTypeFilter) return false;
    if (selectedStatusFilter === "PUBLISHED" && !p.isEnabled) return false;
    if (selectedStatusFilter === "DRAFT" && p.isEnabled) return false;
    if (selectedStatusFilter === "FEATURED" && !p.isFeatured) return false;
    return true;
  });

  return (
    <div className="flex-1 pb-16">
      <DashboardHeader
        heading={t.store.title}
        text={t.store.description}
      >
        <div className="flex items-center gap-2">
          {profile?.username && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl border-zinc-200 dark:border-zinc-800 text-xs font-semibold gap-1.5"
            >
              <a href={`/${profile.username}`} target="_blank" rel="noreferrer">
                <span>{t.sidebar.viewPublicPage}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          <Button
            onClick={handleOpenAddModal}
            size="sm"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{t.store.addProduct}</span>
          </Button>
        </div>
      </DashboardHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Store Visibility On/Off Toggle Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white/90 dark:bg-zinc-900/90 dark:border-zinc-800 shadow-soft gap-4 backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div
              className={`p-3 rounded-2xl transition-colors ${
                isEffectivelyActive
                  ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20"
                  : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800/80"
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Do&apos;kon bo&apos;limi (Shop Section)
                </h3>
                <Badge
                  variant="outline"
                  className={
                    isEffectivelyActive
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold"
                      : "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 text-[11px] font-bold"
                  }
                >
                  {isEffectivelyActive
                    ? "Profilda faol (ON)"
                    : !hasProducts
                    ? "Avtomatik yopiq (Mahsulot yo'q)"
                    : "Profildan yashirilgan (OFF)"}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
                {!hasProducts
                  ? "Profilda Shop bo'limi chiqishi uchun avval kamida bitta mahsulot qo'shing. Mahsulot bo'lmaganda do'kon avtomatik ravishda yopiq turadi."
                  : isStoreEnabled
                  ? "Do'koningiz va barcha mahsulotlaringiz profilingizda tashrif buyuruvchilarga ko'rinmoqda."
                  : "Do'kon bo'limi profildan vaqtincha yashirib qo'yilgan (yopiq holatda)."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              {isStoreEnabled && hasProducts ? "Yoqilgan" : "O'chirilgan"}
            </span>
            <Switch
              checked={isStoreEnabled && hasProducts}
              disabled={!hasProducts || isUpdatingStoreStatus}
              onCheckedChange={(val) => handleToggleStoreStatus(val)}
            />
          </div>
        </div>
        {/* Subscription Product Limit Card */}
        {subscriptionInfo && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {subscriptionInfo.tier} Plan Storefront Quota
                </div>
                <div className="text-sm font-bold text-white">
                  {subscriptionInfo.currentCount} of {subscriptionInfo.maxProducts} Products Created
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Badge
                variant="outline"
                className={`text-xs font-bold px-3 py-1 ${
                  subscriptionInfo.canAddMore
                    ? "border-emerald-500/40 text-emerald-400"
                    : "border-amber-500/40 text-amber-400"
                }`}
              >
                {subscriptionInfo.canAddMore
                  ? `${subscriptionInfo.maxProducts - subscriptionInfo.currentCount} slots remaining`
                  : "Plan limit reached"}
              </Badge>
              {subscriptionInfo.tier === "FREE" && (
                <Button
                  size="sm"
                  asChild
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs"
                >
                  <a href="/dashboard/upgrade">Upgrade to Pro</a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Seller Dashboard Metrics (Requirement 5) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {/* Card 1: Revenue */}
          <div className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                Net Revenue
              </span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight truncate">
                {formatCurrency(orderMetrics.netRevenue || 0)}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                Verified sales
              </p>
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                Orders
              </span>
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <PackageCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight truncate">
                {orderMetrics.completedCount || 0}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                Completed purchases
              </p>
            </div>
          </div>

          {/* Card 3: Total Products */}
          <div className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                Products
              </span>
              <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight truncate">
                {products.length}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                In your catalog
              </p>
            </div>
          </div>

          {/* Card 4: Published */}
          <div className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                Published
              </span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Check className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight truncate">
                {publishedCount}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                Live on profile
              </p>
            </div>
          </div>

          {/* Card 5: Store Views */}
          <div className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                Store Views
              </span>
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Eye className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight truncate">
                {totalViews}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                Product impressions
              </p>
            </div>
          </div>

          {/* Card 6: Checkout Clicks */}
          <div className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                Clicks
              </span>
              <div className="h-7 w-7 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                <MousePointerClick className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight truncate">
                {totalClicks}
              </div>
              <p className="text-[11px] font-semibold text-emerald-500 mt-0.5 truncate">
                {ctrRate}% CTR
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto scrollbar-none border-b border-border/70">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "products"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Products Portfolio ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "orders"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <PackageCheck className="h-4 w-4" />
            <span>Orders & Transactions ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "settings"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Payment & Gateway</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS PORTFOLIO */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border/80 bg-card shadow-xs">
              <div className="relative flex-1 w-full min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search products by title, category, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs px-3 py-1.5 font-medium"
                >
                  <option value="ALL">All Product Types</option>
                  <option value="DIGITAL_DOWNLOAD">Digital Downloads</option>
                  <option value="EBOOK">E-Books</option>
                  <option value="COURSE">Online Courses</option>
                  <option value="SERVICE">Services</option>
                  <option value="PHYSICAL">Physical Goods</option>
                  <option value="EXTERNAL">External / Partner</option>
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs px-3 py-1.5 font-medium"
                >
                  <option value="ALL">All Status</option>
                  <option value="PUBLISHED">Published Only</option>
                  <option value="DRAFT">Drafts Only</option>
                  <option value="FEATURED">Featured Only</option>
                </select>
              </div>
            </div>

            {/* Products List */}
            {loading ? (
              <div className="p-12 text-center text-zinc-500 text-sm">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div className="font-bold text-base text-zinc-900 dark:text-white">
                  {searchQuery ? "No products matching your search" : "Your storefront is empty"}
                </div>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your filters or search terms."
                    : "Add your first digital download, e-book, or course to start monetizing your audience."}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={handleOpenAddModal}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Create Your First Product</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((p, index) => {
                  const typeConfig = PRODUCT_TYPES[p.type] || PRODUCT_TYPES.DIGITAL_DOWNLOAD;

                  return (
                    <div
                      key={p.id}
                      className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      {/* Left: Reorder & Thumbnail & Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Position Up / Down */}
                        <div className="flex flex-col gap-0.5 text-zinc-400">
                          <button
                            onClick={() => handleMovePosition(index, "up")}
                            disabled={index === 0}
                            className="p-1 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 transition-colors"
                            title="Move Up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMovePosition(index, "down")}
                            disabled={index === products.length - 1}
                            className="p-1 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 transition-colors"
                            title="Move Down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt={p.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <ShoppingBag className="h-6 w-6 opacity-40" />
                            </div>
                          )}
                        </div>

                        {/* Text Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline" className="text-[10px] font-semibold py-0">
                              {typeConfig.label}
                            </Badge>
                            <span className="text-[11px] text-zinc-400">•</span>
                            <span className="text-[11px] text-zinc-500 font-medium">{p.category}</span>
                            {p.isFeatured && (
                              <Badge className="bg-amber-400 text-black text-[10px] font-black tracking-wide py-0 flex items-center gap-1">
                                <Sparkles className="h-2.5 w-2.5" />
                                FEATURED
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                            {p.title}
                          </h4>
                          {p.description && (
                            <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{p.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Right: Metrics & Controls */}
                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
                        {/* Price & Sales */}
                        <div className="text-left md:text-right">
                          <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                            {p.price === 0 ? "FREE" : formatCurrency(p.price, p.currency)}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {p.salesCount} sold • {p.viewsCount || 0} views
                          </div>
                        </div>

                        {/* Quick Switches */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleFeatured(p)}
                            className={`h-8 rounded-lg text-xs font-semibold px-2.5 ${
                              p.isFeatured
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                : "text-zinc-400 border-zinc-200 dark:border-zinc-800"
                            }`}
                            title="Toggle Feature on Public Profile"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            <span>{p.isFeatured ? "Featured" : "Feature"}</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePublish(p)}
                            className={`h-8 rounded-lg text-xs font-semibold px-2.5 ${
                              p.isEnabled
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                            }`}
                            title="Toggle Publish Status"
                          >
                            <span
                              className={`h-2 w-2 rounded-full mr-1.5 ${
                                p.isEnabled ? "bg-emerald-500" : "bg-zinc-400"
                              }`}
                            />
                            <span>{p.isEnabled ? "Live" : "Draft"}</span>
                          </Button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(p)}
                            className="h-8 w-8 p-0 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                            title="Edit Product"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(p.id)}
                            className="h-8 w-8 p-0 rounded-lg text-zinc-500 hover:text-red-500"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS & TRANSACTIONS */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                  <span>Transactions & Fulfillments</span>
                  <Badge variant="outline" className="text-xs">
                    {orders.length} Total Orders
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  All customer orders, payments, receipts, and refund statuses.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {ordersLoading ? (
                  <div className="p-12 text-center text-zinc-500 text-sm">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="p-12 text-center text-zinc-500 text-xs">
                    No orders recorded yet. When customers purchase from your public store, they will appear here.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface/60 text-text-secondary uppercase tracking-wider font-bold border-b border-border/70">
                        <tr>
                          <th className="px-5 py-3.5">Order Number</th>
                          <th className="px-5 py-3.5">Product</th>
                          <th className="px-5 py-3.5">Customer Email</th>
                          <th className="px-5 py-3.5">Amount</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Date</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                            <td className="px-5 py-4 font-mono font-bold text-zinc-900 dark:text-white">
                              {o.orderNumber || o.id.slice(0, 10)}
                            </td>
                            <td className="px-5 py-4 font-medium text-zinc-900 dark:text-white">
                              {o.product?.title || "Digital Product"}
                            </td>
                            <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                              {o.customerEmail}
                            </td>
                            <td className="px-5 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(o.amount, o.currency)}
                            </td>
                            <td className="px-5 py-4">
                              <Badge
                                className={`text-[10px] font-bold ${
                                  o.status === "COMPLETED"
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    : o.status === "REFUNDED"
                                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                }`}
                              >
                                {o.status}
                              </Badge>
                            </td>
                            <td className="px-5 py-4 text-zinc-500">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-4 text-right">
                              {o.status === "COMPLETED" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setRefundModalOrder(o)}
                                  className="h-7 px-2 text-[11px] text-zinc-500 hover:text-red-500 font-semibold"
                                >
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  <span>Refund</span>
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: STORE & PAYMENT SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-4 max-w-3xl">
            {/* Store Visibility Control Card */}
            <Card className="rounded-2xl border-zinc-200/90 dark:border-zinc-800">
              <CardHeader className="p-6 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-emerald-500" />
                    <span>Do&apos;kon ko&apos;rinishi (Storefront Visibility)</span>
                  </CardTitle>
                  <Switch
                    checked={isStoreEnabled && hasProducts}
                    disabled={!hasProducts || isUpdatingStoreStatus}
                    onCheckedChange={(val) => handleToggleStoreStatus(val)}
                  />
                </div>
                <CardDescription className="text-xs mt-1">
                  {!hasProducts
                    ? "Do'koningizda hozircha mahsulotlar yo'q. Mahsulot bo'lmaganda do'kon bo'limi profilda avtomatik ravishda yopiq turadi."
                    : isStoreEnabled
                    ? "Do'kon bo'limi profilda faol va foydalanuvchilar 'Shop' tugmasini bosib mahsulotlarni xarid qilishlari mumkin."
                    : "Do'kon bo'limi profilingizdan vaqtincha yashirilgan (o'chirilgan)."}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-500" />
                  <span>Stripe Payment Gateway Status</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Connect Stripe to accept global credit card payments, Apple Pay, Google Pay, and handle automatic payouts.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-3 space-y-4">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-500">Stripe Secret Key</span>
                    <Badge variant="outline" className="text-xs font-bold text-amber-500 border-amber-500/30">
                      Sandbox / Preview Mode
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    BioSpace supports full end-to-end Stripe Checkout Sessions and Webhook event verification. To activate live transactions, configure your keys in <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-xs font-mono">.env</code>:
                  </p>
                  <pre className="p-3 rounded-lg bg-zinc-950 text-emerald-400 text-xs font-mono overflow-x-auto">
{`STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."`}
                  </pre>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div>
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Platform Fee Rate</h5>
                    <p className="text-xs text-zinc-500">
                      Current tier ({subscriptionInfo?.tier || "FREE"}):{" "}
                      {subscriptionInfo?.tier === "BUSINESS" ? "0%" : subscriptionInfo?.tier === "PRO" ? "4%" : "9%"} fee on completed sales
                    </p>
                  </div>
                  {subscriptionInfo?.tier === "FREE" && (
                    <Button
                      size="sm"
                      asChild
                      className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs"
                    >
                      <a href="/dashboard/upgrade">Upgrade for Lower Fees</a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Create New Product"}
        description="Configure your digital product details, pricing, assets, and display options."
        className="max-w-2xl text-zinc-900 dark:text-white max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Modal Tab Switcher */}
          <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
            <button
              type="button"
              onClick={() => setModalTab("basics")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                modalTab === "basics"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              1. Basics & Pricing
            </button>
            <button
              type="button"
              onClick={() => setModalTab("media")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                modalTab === "media"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              2. Media & Asset Delivery
            </button>
            <button
              type="button"
              onClick={() => setModalTab("options")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                modalTab === "options"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              3. Visibility & Feature
            </button>
          </div>

          {/* TAB 1: BASICS */}
          {modalTab === "basics" && (
            <div className="space-y-4">
              {/* Product Type Selection Cards (Requirement 1) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Product Type *
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(PRODUCT_TYPES) as ProductType[]).map((tKey) => {
                    const t = PRODUCT_TYPES[tKey];
                    const isSelected = productType === tKey;

                    return (
                      <div
                        key={tKey}
                        onClick={() => setProductType(tKey)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                            : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                        }`}
                      >
                        <div className="font-bold text-xs">{t.label}</div>
                        <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                          {t.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="product-title" className="text-xs font-bold">
                    Product Title *
                  </Label>
                  <Input
                    id="product-title"
                    placeholder="e.g. Next.js SaaS Architecture Blueprint"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="rounded-xl h-10 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="product-category" className="text-xs font-bold">
                    Category *
                  </Label>
                  <select
                    id="product-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-10 px-3 text-sm font-medium"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="product-price" className="text-xs font-bold">
                    Price (USD / $) *
                  </Label>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="29.00 (Enter 0 for free)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="rounded-xl h-10 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="product-currency" className="text-xs font-bold">
                    Currency
                  </Label>
                  <select
                    id="product-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-10 px-3 text-sm font-medium"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="UZS">UZS (so'm)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label htmlFor="product-description" className="text-xs font-bold">
                  Description & Deliverable Overview
                </Label>
                <textarea
                  id="product-description"
                  rows={3}
                  placeholder="Detail what is included with this product, key benefits, and file contents..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-sm leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA & ASSET DELIVERY */}
          {modalTab === "media" && (
            <div className="space-y-4">
              {/* Cover Image */}
              <div className="space-y-2">
                <Label className="text-xs font-bold">Cover Image (URL or Upload from device)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="rounded-xl h-10 text-xs flex-1"
                  />
                  <label className="relative inline-flex items-center justify-center px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer font-bold text-xs shrink-0 transition-colors">
                    <Upload className="h-4 w-4 mr-1.5" />
                    <span>{uploadingImage ? "Uploading..." : "Device Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      disabled={uploadingImage}
                      className="sr-only"
                    />
                  </label>
                </div>

                {imageUrl && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              {/* Asset URL or External Link */}
              {productType === "EXTERNAL" ? (
                <div className="space-y-1">
                  <Label htmlFor="external-url" className="text-xs font-bold">
                    Partner / Affiliate Checkout URL *
                  </Label>
                  <Input
                    id="external-url"
                    placeholder="https://partnerstore.com/item"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="rounded-xl h-10 text-sm"
                  />
                  <span className="text-[11px] text-zinc-500">
                    Customers clicking "Buy" will be redirected to this external website.
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label htmlFor="file-url" className="text-xs font-bold">
                    {PRODUCT_TYPES[productType]?.defaultDeliverableLabel} URL (File / Access Link)
                  </Label>
                  <Input
                    id="file-url"
                    placeholder="https://cloud.com/downloads/package.zip or https://calendly.com/your-name"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="rounded-xl h-10 text-sm"
                  />
                  <span className="text-[11px] text-zinc-500">
                    Delivered automatically to customer upon confirmed purchase.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OPTIONS & VISIBILITY */}
          {modalTab === "options" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div>
                  <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Published Status</h5>
                  <p className="text-xs text-zinc-500">
                    Make this product visible and purchasable on your public profile.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="h-5 w-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Feature on Profile</h5>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Highlight with a "FEATURED" ribbon at the top of your public store section.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-5 w-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              {modalTab !== "options" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalTab(modalTab === "basics" ? "media" : "options")}
                  className="rounded-xl text-xs font-semibold"
                >
                  Next Step →
                </Button>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs"
              >
                {submitting ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* REFUND MODAL */}
      <Modal
        isOpen={!!refundModalOrder}
        onClose={() => setRefundModalOrder(null)}
        title="Issue Customer Refund"
        description={`Refund order #${refundModalOrder?.orderNumber || refundModalOrder?.id} (${formatCurrency(
          refundModalOrder?.amount || 0,
          refundModalOrder?.currency || "USD"
        )})`}
        className="max-w-md text-zinc-900 dark:text-white"
      >
        <form onSubmit={handleRefundSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="refund-reason" className="text-xs font-bold">
              Refund Reason (Optional)
            </Label>
            <Input
              id="refund-reason"
              placeholder="e.g. Customer requested cancellation"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="rounded-xl h-10 text-sm"
            />
          </div>

          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 leading-relaxed">
            This will mark the order as <strong>REFUNDED</strong> and execute a reversal on the Stripe payment gateway if payment was processed.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRefundModalOrder(null)}
              className="rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={refundSubmitting}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
            >
              {refundSubmitting ? "Processing..." : "Confirm & Refund Order"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
