"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { useDashboard, CollectionItem } from "@/context/dashboard-context";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Link2,
} from "lucide-react";
import { toast } from "sonner";

export default function CollectionsPage() {
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
        title="Collections & Categories"
        description="Group your links into logical sections like Projects, Socials, Music, or Products."
        action={
          <Button
            size="sm"
            onClick={openCreateModal}
            className="rounded-xl gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>New Collection</span>
          </Button>
        }
      />

      <div className="p-4 sm:p-8 max-w-4xl space-y-6">
        {collections.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No collections created yet"
            description="Collections allow you to group related links together under custom headings on your public profile."
            action={
              <Button onClick={openCreateModal} className="rounded-xl font-semibold">
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Create Collection</span>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {collections.map((col) => {
              const colLinks = links.filter((l) => l.collectionId === col.id);

              return (
                <Card key={col.id} className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <FolderTree className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                          {col.title}
                        </h4>
                        {col.description && (
                          <p className="text-xs text-zinc-500">{col.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 mr-2">
                        {colLinks.length} {colLinks.length === 1 ? "link" : "links"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(col)}
                        className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(col.id)}
                        className="h-8 w-8 text-zinc-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Links inside this collection */}
                  {colLinks.length > 0 && (
                    <div className="mt-3 pl-12 space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                      {colLinks.map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between text-xs py-1 text-zinc-600 dark:text-zinc-300"
                        >
                          <span className="font-medium truncate">{l.title}</span>
                          <span className="text-zinc-400 shrink-0">{l.clicksCount} clicks</span>
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
        title={editingCol ? "Edit Collection" : "Create New Collection"}
        description="Organize your bio links into a clean group."
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Collection Title *
            </label>
            <Input
              required
              placeholder="e.g. My Featured Projects or Music Releases"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Description (optional)
            </label>
            <Input
              placeholder="e.g. Everything I have launched in 2026"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              <span>{editingCol ? "Save Changes" : "Create Collection"}</span>
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
        title="Delete Collection"
        description="Are you sure you want to delete this collection? Any links inside will remain intact and will simply be moved out of this collection."
      />
    </div>
  );
}

