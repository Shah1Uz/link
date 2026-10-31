"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useDashboard } from "@/context/dashboard-context";
import {
  ShoppingBag,
  Plus,
  DollarSign,
  PackageCheck,
  TrendingUp,
  Tag,
  Trash2,
  Edit2,
  ExternalLink,
  Check,
  Download,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  isDigital: boolean;
  isEnabled: boolean;
  salesCount: number;
  _count?: { orders: number };
}

export default function StoreDashboardPage() {
  const { profile } = useDashboard();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("29.00");
  const [fileUrl, setFileUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalRevenue = products.reduce(
    (sum, p) => sum + p.price * (p.salesCount || (p._count?.orders ?? 0)),
    0
  );
  const totalOrders = products.reduce(
    (sum, p) => sum + (p.salesCount || (p._count?.orders ?? 0)),
    0
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setPrice("19.99");
    setFileUrl("https://example.com/download/asset.zip");
    setImageUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description || "");
    setPrice(p.price.toString());
    setFileUrl(p.fileUrl || "");
    setImageUrl(p.imageUrl || "");
    setIsModalOpen(true);
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
        title: title.trim(),
        description: description.trim() || null,
        price: parseFloat(price) || 0,
        currency: "USD",
        fileUrl: fileUrl.trim() || null,
        imageUrl: imageUrl.trim() || null,
        isDigital: true,
        isEnabled: true,
      };

      if (editingId) {
        const res = await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        if (!res.ok) throw new Error("Failed to update product");
        toast.success("Product updated successfully");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create product");
        toast.success("Product created and published to your bio page");
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product removed");
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleToggle = async (p: Product) => {
    try {
      const updatedEnabled = !p.isEnabled;
      setProducts(
        products.map((item) =>
          item.id === p.id ? { ...item, isEnabled: updatedEnabled } : item
        )
      );

      await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, isEnabled: updatedEnabled }),
      });
      toast.success(updatedEnabled ? "Product is now visible" : "Product hidden");
    } catch {
      toast.error("Failed to update status");
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader
        title="Creator Mini Store"
        description="Sell digital downloads, e-books, presets, and services directly on your BioSpace page."
        action={
          <Button onClick={handleOpenAdd} className="rounded-xl gap-2 font-semibold shadow-md">
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        }
      />

      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Total Revenue
              </p>
              <h3 className="mt-1 text-2xl font-black text-foreground">
                ${totalRevenue.toFixed(2)}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Orders Completed
              </p>
              <h3 className="mt-1 text-2xl font-black text-foreground">
                {totalOrders}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <PackageCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Active Offerings
              </p>
              <h3 className="mt-1 text-2xl font-black text-foreground">
                {products.filter((p) => p.isEnabled).length}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product List */}
      <Card className="rounded-2xl border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border p-5">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Tag className="h-4 w-4 text-emerald-500" />
            <span>Store Products & Digital Offerings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {loading ? (
            <div className="py-12 text-center text-sm text-text-secondary">
              Loading store items...
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-text-secondary mb-3">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h4 className="font-bold text-foreground">No products added yet</h4>
              <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto">
                Sell your presets, PDF guides, exclusive templates, or services directly through your bio profile.
              </p>
              <Button onClick={handleOpenAdd} className="mt-4 rounded-xl gap-2 font-semibold">
                <Plus className="h-4 w-4" />
                <span>Add Your First Product</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-border bg-surface p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-sm"
                >
                  <div>
                    {p.imageUrl && (
                      <div className="h-36 w-full rounded-xl overflow-hidden mb-3 bg-zinc-100 dark:bg-zinc-800">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">
                        {p.title}
                      </h4>
                      <Badge variant="outline" className="font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30">
                        ${p.price.toFixed(2)}
                      </Badge>
                    </div>
                    {p.description && (
                      <p className="mt-1.5 text-xs text-text-secondary line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <button
                      onClick={() => handleToggle(p)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                        p.isEnabled
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : "bg-muted text-text-secondary border-border"
                      }`}
                    >
                      {p.isEnabled ? "Live" : "Draft"}
                    </button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(p)}
                        className="h-8 w-8 rounded-lg text-text-secondary hover:text-foreground"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p.id)}
                        className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground">
              {editingId ? "Edit Product" : "Add Store Product"}
            </h3>
            <p className="mt-1 text-xs text-text-secondary">
              Configure product details, pricing, and download delivery for buyers.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-foreground">Product Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lightroom Creator Presets Pack 2026"
                  className="mt-1 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground">Price (USD) *</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3.5 top-2.5 text-sm text-text-secondary">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-8 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground">Description</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what the buyer receives upon purchase..."
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground">Cover Image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 rounded-xl text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground">Digital Download File URL</Label>
                <Input
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or S3 download URL"
                  className="mt-1 rounded-xl text-xs"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl font-semibold"
                >
                  {submitting ? "Saving..." : editingId ? "Update Product" : "Publish to Bio"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

