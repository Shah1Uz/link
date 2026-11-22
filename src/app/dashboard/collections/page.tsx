"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { useDashboard, CollectionItem } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import { FolderTree, Plus, Edit2, Trash2, Link2 } from "lucide-react";
import { toast } from "sonner";

export default function CollectionsPage() {
  const { t } = useI18n();
  const { collections, setCollections, links } = useDashboard();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<CollectionItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingCol(null);
    setTitle("");
    setDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (col: CollectionItem) => {
    setEditingCol(col);
    setTitle(col.title);
    setDescription(col.description || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("Collection title is required");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCol) {
        const res = await fetch(`/api/collections/${editingCol.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update collection");

        setCollections((prev) =>
          prev.map((c) => (c.id === editingCol.id ? json.collection : c))
        );
        toast.success("Collection updated!");
      } else {
        const res = await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create collection");

        setCollections((prev) => [...prev, json.collection]);
        toast.success("Collection created!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save collection");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/collections/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete collection");

      setCollections((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success("Collection deleted successfully");
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.message || "Could not delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <DashboardHeader
        title={t.collectionsStudio.title}
        description={t.collectionsStudio.description}
        action={
          <Button
            size="sm"
            onClick={openCreateModal}
            className="gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>New collection</span>
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {collections.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No collections created yet"
            description="Collections let you group related links under custom headings on your public profile."
            action={
              <Button onClick={openCreateModal} className="rounded-xl font-semibold">
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Create collection</span>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {collections.map((col) => {
              const colLinks = links.filter((l) => l.collectionId === col.id);

              return (
                <Card key={col.id} className="card-lift overflow-hidden p-0">
                  <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400">
                        <FolderTree className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="truncate font-heading text-sm font-bold text-foreground">
                          {col.title}
                        </h4>
                        {col.description ? (
                          <p className="truncate text-[11px] text-text-secondary">
                            {col.description}
                          </p>
                        ) : (
                          <p className="text-[11px] text-text-secondary">
                            {colLinks.length} {colLinks.length === 1 ? "link" : "links"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="hidden rounded-full border border-border/70 bg-surface/50 px-2.5 py-1 text-[10px] font-semibold text-text-secondary sm:inline">
                        {colLinks.length} {colLinks.length === 1 ? "link" : "links"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(col)}
                        className="h-8 w-8 text-text-secondary hover:text-foreground"
                        aria-label="Edit collection"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(col.id)}
                        className="h-8 w-8 text-text-secondary hover:text-rose-500"
                        aria-label="Delete collection"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {colLinks.length > 0 && (
                    <div className="space-y-2 border-t border-border/70 bg-surface/25 px-4 py-3 sm:px-5">
                      {colLinks.map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between gap-3 text-xs text-text-secondary"
                        >
                          <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
                            <Link2 className="h-3 w-3 shrink-0 text-text-secondary/70" />
                            <span className="truncate">{l.title}</span>
                          </span>
                          <span className="shrink-0 text-[11px] tabular-nums">
                            {l.clicksCount} clicks
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCol ? "Edit collection" : "Create new collection"}
        description="Organise your bio links into a clean group."
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="collection-title">Collection title *</Label>
            <Input
              id="collection-title"
              required
              placeholder="e.g. My featured projects"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="collection-desc">Description (optional)</Label>
            <Input
              id="collection-desc"
              placeholder="e.g. Everything I launched this year"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} className="rounded-xl">
              <span>{editingCol ? "Save changes" : "Create collection"}</span>
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete collection"
        description="Are you sure you want to delete this collection? Links inside will remain intact and simply be moved out of this collection."
      />
    </div>
  );
}
