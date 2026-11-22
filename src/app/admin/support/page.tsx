"use client";

import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  Search,
  Send,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  category: string;
  response: string | null;
  assignedTo: string | null;
  createdAt: string;
  source?: "ticket" | "inquiry";
  user: {
    id: string;
    email: string;
    name: string | null;
    subscriptionTier: string;
  };
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected ticket for modal response
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newStatus, setNewStatus] = useState("RESOLVED");
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/support");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTickets = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressTickets = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED").length;

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.user.email.toLowerCase().includes(search.toLowerCase()) ||
      t.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenTicket = (t: Ticket) => {
    setSelectedTicket(t);
    setReplyText(t.response || "");
    setNewStatus(t.status === "OPEN" ? "IN_PROGRESS" : t.status);
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: newStatus,
          response: replyText.trim() || null,
          source: selectedTicket.source || "ticket",
        }),
      });

      if (!res.ok) throw new Error("Failed to update ticket");
      toast.success("Support ticket updated and response saved");
      setSelectedTicket(null);
      fetchTickets();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadgeVariant = (status: string) => {
    if (status === "OPEN") return "warning" as const;
    if (status === "IN_PROGRESS") return "verified" as const;
    return "success" as const;
  };

  const kpis = [
    {
      label: "Awaiting response",
      value: openTickets,
      icon: Clock,
      tile: "border-amber-500/20 bg-gradient-to-b from-amber-500/15 to-amber-500/[0.03] text-amber-600 dark:text-amber-400",
      valueTone: "text-amber-700 dark:text-amber-300",
    },
    {
      label: "In progress",
      value: inProgressTickets,
      icon: MessageSquare,
      tile: "border-cyan-500/20 bg-gradient-to-b from-cyan-500/15 to-cyan-500/[0.03] text-cyan-600 dark:text-cyan-400",
      valueTone: "text-cyan-700 dark:text-cyan-300",
    },
    {
      label: "Resolved",
      value: resolvedTickets,
      icon: CheckCircle2,
      tile: "border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400",
      valueTone: "text-emerald-700 dark:text-emerald-300",
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Customer Support & Inquiries"
        description="Respond to user inquiries, technical assistance requests, and billing disputes."
      />

      <div className="mx-auto max-w-6xl space-y-5 p-6 sm:space-y-6 sm:p-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="card-lift relative overflow-hidden p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                      {kpi.label}
                    </p>
                    <p
                      className={`mt-2 font-heading text-3xl font-extrabold leading-none tracking-[-0.04em] ${kpi.valueTone}`}
                    >
                      {kpi.value}
                    </p>
                  </div>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${kpi.tile}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Tickets table */}
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-white/[0.08] sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400">
                <LifeBuoy className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                  Support inbox
                </h2>
                <p className="truncate text-[11px] text-text-secondary">
                  {filtered.length} of {tickets.length} tickets shown
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                role="group"
                aria-label="Filter tickets by status"
                className="scrollbar-none -mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-0.5"
              >
                {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((status) => {
                  const active = statusFilter === status;
                  return (
                    <Button
                      key={status}
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      aria-pressed={active}
                      className={`h-8 shrink-0 rounded-lg px-2.5 text-[10.5px] font-bold uppercase tracking-[0.06em] ${
                        active
                          ? "bg-gradient-to-b from-emerald-500 to-emerald-600 text-emerald-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_8px_20px_-10px_rgba(16,185,129,0.8)] hover:from-emerald-500 hover:to-emerald-600"
                          : "text-text-secondary"
                      }`}
                    >
                      {status}
                    </Button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-60">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tickets, email..."
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
              <p className="text-xs font-medium text-text-secondary">
                Loading support tickets…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400">
                <LifeBuoy className="h-5 w-5" />
              </span>
              <p className="font-heading text-sm font-bold text-foreground">
                No tickets found
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-text-secondary">
                No support tickets match the current filter or search query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-surface/60 dark:border-white/[0.08] dark:bg-white/[0.02]">
                    {[
                      "Subject & User",
                      "Category",
                      "Priority",
                      "Status",
                      "Created",
                      "Action",
                    ].map((heading, index) => (
                      <th
                        key={heading}
                        className={`whitespace-nowrap px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary ${
                          index === 5 ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
                  {filtered.map((t) => (
                    <tr
                      key={t.id}
                      className="transition-colors hover:bg-emerald-500/[0.03] dark:hover:bg-white/[0.025]"
                    >
                      <td className="max-w-[22rem] px-4 py-3.5">
                        <div className="truncate font-bold text-foreground">
                          {t.subject}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 truncate text-[10.5px] text-text-secondary">
                          <span className="truncate font-mono">{t.user.email}</span>
                          <Badge
                            variant={t.user.subscriptionTier === "PRO" ? "pro" : "outline"}
                            className="shrink-0 px-1.5 py-0 text-[8.5px]"
                          >
                            {t.user.subscriptionTier}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className="text-[10px]">
                          {t.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            t.priority === "URGENT" || t.priority === "HIGH"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={statusBadgeVariant(t.status)}>
                          {t.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[10.5px] text-text-secondary">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenTicket(t)}
                            className="h-7 gap-1 rounded-lg px-2.5 text-[10.5px] font-semibold"
                          >
                            <span>Review</span>
                            <ChevronRight className="h-3 w-3" />
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

      {/* Ticket reply modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.subject || "Support ticket"}
        description={
          selectedTicket
            ? `Ticket #${selectedTicket.id.slice(-8)} · ${selectedTicket.user.name || "User"} (${selectedTicket.user.email})`
            : undefined
        }
        className="max-w-xl"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{selectedTicket.category}</Badge>
              <Badge
                variant={
                  selectedTicket.priority === "URGENT" ||
                  selectedTicket.priority === "HIGH"
                    ? "destructive"
                    : "secondary"
                }
              >
                {selectedTicket.priority} priority
              </Badge>
              <Badge variant={statusBadgeVariant(selectedTicket.status)}>
                {selectedTicket.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary">
                User message
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-foreground">
                {selectedTicket.message}
              </p>
            </div>

            <form onSubmit={handleSendResponse} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Update Ticket Status</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {["IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={newStatus === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewStatus(s)}
                      className="h-8 rounded-xl text-[10.5px] font-semibold"
                    >
                      {s.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-reply">Official Administrative Reply</Label>
                <Textarea
                  id="admin-reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Provide resolution details or ask follow-up questions..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-200/80 pt-4 dark:border-white/[0.08]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedTicket(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  isLoading={submitting}
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Save &amp; Send Response</span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
