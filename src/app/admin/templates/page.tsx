"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import {
  LayoutTemplate,
  Plus,
  Edit2,
  Trash2,
  Star,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface TemplateItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  layout: string;
  isPro: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  useCount: number;
  stylesJson: string;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Creator");
  const [formDesc, setFormDesc] = useState("");
  const [formLayout, setFormLayout] = useState("classic");
  const [formIsPro, setFormIsPro] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formStylesJson, setFormStylesJson] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const json = await res.json();
        setTemplates(json.templates);
      }
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormName("");
    setFormSlug("");
    setFormCategory("Creator");
    setFormDesc("");
    setFormLayout("modern");
    setFormIsPro(false);
    setFormIsFeatured(false);
    setFormStylesJson(
      JSON.stringify(
        {
          backgroundColor: "#0d1117",
          backgroundType: "gradient",
          backgroundGradient: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
          buttonStyle: "filled",
          buttonColor: "#10b981",
          buttonTextColor: "#042f2e",
          buttonRadius: "16px",
          fontHeading: "Inter",
          textColor: "#ffffff",
          accentColor: "#10b981",
        },
        null,
        2
      )
    );
    setIsModalOpen(true);
  };

  const openEditModal = (tpl: TemplateItem) => {
    setEditingTemplate(tpl);
    setFormName(tpl.name);
    setFormSlug(tpl.slug);
    setFormCategory(tpl.category);
    setFormDesc(tpl.description);
    setFormLayout(tpl.layout);
    setFormIsPro(tpl.isPro);
    setFormIsFeatured(tpl.isFeatured);
    setFormStylesJson(tpl.stylesJson);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingTemplate) {
        const res = await fetch("/api/admin/templates", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingTemplate.id,
            name: formName,
            slug: formSlug,
            category: formCategory,
            description: formDesc,
            layout: formLayout,
            isPro: formIsPro,
            isFeatured: formIsFeatured,
            stylesJson: formStylesJson,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update template");

        setTemplates((prev) =>
          prev.map((t) => (t.id === editingTemplate.id ? json.template : t))
        );
        toast.success("Template updated successfully!");
      } else {
        const res = await fetch("/api/admin/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            slug: formSlug,
            category: formCategory,
            description: formDesc,
            layout: formLayout,
            isPro: formIsPro,
            isFeatured: formIsFeatured,
            stylesJson: formStylesJson,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create template");

        setTemplates((prev) => [json.template, ...prev]);
        toast.success("Template created and published!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (tpl: TemplateItem) => {
    const newStatus = !tpl.isPublished;
    try {
      await fetch("/api/admin/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tpl.id, isPublished: newStatus }),
      });
      setTemplates((prev) =>
        prev.map((t) => (t.id === tpl.id ? { ...t, isPublished: newStatus } : t))
      );
      toast.success(newStatus ? "Template published" : "Template unpublished");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleToggleFeatured = async (tpl: TemplateItem) => {
    const newFeatured = !tpl.isFeatured;
    try {
      await fetch("/api/admin/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tpl.id, isFeatured: newFeatured }),
      });
      setTemplates((prev) =>
        prev.map((t) => (t.id === tpl.id ? { ...t, isFeatured: newFeatured } : t))
      );
      toast.success(newFeatured ? "Marked as featured" : "Removed from featured");
    } catch {
      toast.error("Failed to update featured state");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/templates?id=${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete template");

      setTemplates((prev) => prev.filter((t) => t.id !== deleteId));
      toast.success("Template deleted permanently");
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectClasses =
    "flex h-10 w-full rounded-xl border border-zinc-200/90 bg-white/80 px-3 text-xs font-semibold text-foreground shadow-xs backdrop-blur-sm transition-colors hover:border-zinc-300 focus-visible:border-emerald-500/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:border-white/20";

  return (
    <div>
      <AdminHeader
        title="Template Management"
        description="Author, publish, customize styles, and set featured templates for creators."
        action={
          <Button
            size="sm"
            onClick={openCreateModal}
            className="gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Template</span>
          </Button>
        }
      />

      <div className="mx-auto max-w-6xl space-y-5 p-6 sm:space-y-6 sm:p-8">
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-white/[0.08] sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400">
                <LayoutTemplate className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                  Template catalog
                </h2>
                <p className="truncate text-[11px] text-text-secondary">
                  Published themes available to creators
                </p>
              </div>
            </div>
            {!loading && (
              <Badge variant="secondary" className="shrink-0 tabular-nums">
                {templates.length} {templates.length === 1 ? "template" : "templates"}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
              <p className="text-xs font-medium text-text-secondary">
                Loading template catalog…
              </p>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400">
                <LayoutTemplate className="h-5 w-5" />
              </span>
              <p className="font-heading text-sm font-bold text-foreground">
                No templates yet
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-text-secondary">
                Create the first Aurora template to give creators a beautiful
                starting point.
              </p>
              <Button
                size="sm"
                onClick={openCreateModal}
                className="mt-2 gap-1.5 rounded-xl text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Template</span>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-surface/60 dark:border-white/[0.08] dark:bg-white/[0.02]">
                    {[
                      "Template",
                      "Category",
                      "Layout",
                      "Tier",
                      "Usage",
                      "Status",
                      "Actions",
                    ].map((heading, index) => (
                      <th
                        key={heading}
                        className={`whitespace-nowrap px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary ${
                          index === 6 ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
                  {templates.map((tpl) => (
                    <tr
                      key={tpl.id}
                      className="transition-colors hover:bg-emerald-500/[0.03] dark:hover:bg-white/[0.025]"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <span className="truncate">{tpl.name}</span>
                          {tpl.isFeatured && (
                            <Star
                              aria-label="Featured template"
                              className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                            />
                          )}
                        </div>
                        <div className="mt-0.5 truncate font-mono text-[10.5px] text-text-secondary">
                          /{tpl.slug}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant="outline">{tpl.category}</Badge>
                      </td>

                      <td className="px-4 py-3.5 capitalize text-[11px] font-medium text-text-secondary">
                        {tpl.layout}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant={tpl.isPro ? "pro" : "secondary"}>
                          {tpl.isPro ? "PRO" : "FREE"}
                        </Badge>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-[11px] text-text-secondary">
                        <span className="font-semibold text-foreground">
                          {tpl.useCount}
                        </span>{" "}
                        profiles
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant={tpl.isPublished ? "success" : "secondary"}>
                          {tpl.isPublished ? "PUBLISHED" : "DRAFT"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(tpl)}
                            aria-label={
                              tpl.isFeatured
                                ? `Unfeature ${tpl.name}`
                                : `Feature ${tpl.name}`
                            }
                            className={`h-7 rounded-lg px-2 text-[10.5px] font-semibold ${
                              tpl.isFeatured
                                ? "text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
                                : ""
                            }`}
                          >
                            {tpl.isFeatured ? "Unfeature" : "Feature"}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePublish(tpl)}
                            className={`h-7 rounded-lg px-2 text-[10.5px] font-semibold ${
                              tpl.isPublished
                                ? "border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                                : ""
                            }`}
                          >
                            {tpl.isPublished ? "Unpublish" : "Publish"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${tpl.name}`}
                            onClick={() => openEditModal(tpl)}
                            className="h-7 w-7 rounded-lg text-text-secondary hover:bg-zinc-900/[0.05] hover:text-foreground dark:hover:bg-white/[0.06]"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${tpl.name}`}
                            onClick={() => setDeleteId(tpl.id)}
                            className="h-7 w-7 rounded-lg text-text-secondary hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Create / edit modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? "Edit Template" : "Create New Template"}
        description="Configure metadata and JSON design properties."
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                required
                placeholder="Obsidian Minimal"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="template-slug">Unique Slug *</Label>
              <Input
                id="template-slug"
                required
                placeholder="obsidian-minimal"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="template-category">Category</Label>
              <select
                id="template-category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className={selectClasses}
              >
                <option value="Creator">Creator</option>
                <option value="Minimal">Minimal</option>
                <option value="Influencer">Influencer</option>
                <option value="Business">Business</option>
                <option value="Music">Music</option>
                <option value="Gaming">Gaming</option>
                <option value="Photography">Photography</option>
                <option value="Portfolio">Portfolio</option>
                <option value="Fashion">Fashion</option>
                <option value="Personal Brand">Personal Brand</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="template-layout">Layout</Label>
              <select
                id="template-layout"
                value={formLayout}
                onChange={(e) => setFormLayout(e.target.value)}
                className={selectClasses}
              >
                <option value="classic">Classic</option>
                <option value="hero">Hero</option>
                <option value="modern">Modern</option>
                <option value="glass">Glass</option>
                <option value="cutout">Cutout</option>
                <option value="minimal">Minimal</option>
                <option value="creator">Creator</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-description">Description</Label>
            <Input
              id="template-description"
              placeholder="Crisp monochrome aesthetic..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-styles">Styles JSON Configuration</Label>
            <Textarea
              id="template-styles"
              rows={5}
              value={formStylesJson}
              onChange={(e) => setFormStylesJson(e.target.value)}
              className="font-mono text-[11px] leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={formIsPro}
                onChange={(e) => setFormIsPro(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 accent-emerald-500"
              />
              <span>PRO Tier Only</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={formIsFeatured}
                onChange={(e) => setFormIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 accent-emerald-500"
              />
              <span>Featured on Homepage</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-zinc-200/80 pt-4 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              <span>{editingTemplate ? "Save Changes" : "Create Template"}</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Template"
        description="Are you sure you want to permanently delete this template from the catalog?"
      />
    </div>
  );
}
