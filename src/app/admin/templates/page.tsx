"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import {
  LayoutTemplate,
  Plus,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  Sparkles,
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

  return (
    <div>
      <AdminHeader
        title="Template Management"
        description="Author, publish, customize styles, and set featured templates for creators."
        action={
          <Button
            size="sm"
            onClick={openCreateModal}
            className="rounded-xl gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Create Template</span>
          </Button>
        }
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-6xl">
        <Card className="overflow-hidden">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4">Template Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Layout</th>
                    <th className="py-3.5 px-4">Tier</th>
                    <th className="py-3.5 px-4">Usage</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                  {templates.map((tpl) => (
                    <tr key={tpl.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <span>{tpl.name}</span>
                          {tpl.isFeatured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                        </div>
                        <div className="text-zinc-400 text-[11px] font-mono">slug: {tpl.slug}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="outline">{tpl.category}</Badge>
                      </td>

                      <td className="py-3.5 px-4 capitalize font-medium text-zinc-600 dark:text-zinc-300">
                        {tpl.layout}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={tpl.isPro ? "pro" : "secondary"}>
                          {tpl.isPro ? "PRO" : "FREE"}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500">
                        {tpl.useCount} profiles
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={tpl.isPublished ? "success" : "secondary"}>
                          {tpl.isPublished ? "PUBLISHED" : "DRAFT"}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(tpl)}
                            className="h-7 px-2 text-[11px]"
                          >
                            {tpl.isFeatured ? "Unfeature" : "Feature"}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePublish(tpl)}
                            className="h-7 px-2 text-[11px]"
                          >
                            {tpl.isPublished ? "Unpublish" : "Publish"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(tpl)}
                            className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(tpl.id)}
                            className="h-7 w-7 text-zinc-400 hover:text-red-500"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? "Edit Template" : "Create New Template"}
        description="Configure metadata and JSON design properties."
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Template Name *
              </label>
              <Input
                required
                placeholder="Obsidian Minimal"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Unique Slug *
              </label>
              <Input
                required
                placeholder="obsidian-minimal"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold dark:border-zinc-800 dark:bg-zinc-900"
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

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Layout
              </label>
              <select
                value={formLayout}
                onChange={(e) => setFormLayout(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold dark:border-zinc-800 dark:bg-zinc-900"
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

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Description
            </label>
            <Input
              placeholder="Crisp monochrome aesthetic..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Styles JSON Configuration
            </label>
            <Textarea
              rows={5}
              value={formStylesJson}
              onChange={(e) => setFormStylesJson(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formIsPro}
                onChange={(e) => setFormIsPro(e.target.checked)}
                className="rounded border-zinc-300 text-emerald-500"
              />
              <span>PRO Tier Only</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formIsFeatured}
                onChange={(e) => setFormIsFeatured(e.target.checked)}
                className="rounded border-zinc-300 text-emerald-500"
              />
              <span>Featured on Homepage</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              <span>{editingTemplate ? "Save Changes" : "Create Template"}</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
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

