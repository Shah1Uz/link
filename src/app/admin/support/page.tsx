"use client";

import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Send,
  User,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Customer Support & Inquiries
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Respond to user inquiries, technical assistance requests, and billing disputes.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Awaiting Response
              </p>
              <h3 className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                {openTickets}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                In Progress
              </p>
              <h3 className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">
                {inProgressTickets}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
              <MessageSquare className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Resolved
              </p>
              <h3 className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {resolvedTickets}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card className="rounded-2xl border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="h-8 rounded-xl text-xs font-semibold"
              >
                {status}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets, email..."
              className="pl-9 rounded-xl text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-text-secondary">
              Loading support tickets...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-secondary">
              No tickets found matching current criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface border-b border-border text-text-secondary font-semibold uppercase">
                  <tr>
                    <th className="px-5 py-3">Subject & User</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-foreground">{t.subject}</div>
                        <div className="text-text-secondary font-mono text-[11px] flex items-center gap-2 mt-0.5">
                          <span>{t.user.email}</span>
                          <span className="text-[10px] uppercase font-bold text-emerald-600">
                            [{t.user.subscriptionTier}]
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className="rounded-lg text-[10px]">
                          {t.category}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            t.priority === "URGENT" || t.priority === "HIGH"
                              ? "destructive"
                              : "secondary"
                          }
                          className="rounded-lg text-[10px]"
                        >
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            t.status === "OPEN"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                              : t.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary font-medium">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenTicket(t)}
                          className="h-7 px-3 rounded-xl text-xs font-semibold gap-1"
                        >
                          <span>Review</span>
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-text-secondary">
                  Ticket #{selectedTicket.id.slice(-8)}
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  {selectedTicket.subject}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  From: {selectedTicket.user.name || "User"} ({selectedTicket.user.email})
                </p>
              </div>
              <Badge variant="outline">{selectedTicket.category}</Badge>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold text-text-secondary mb-1">User Message:</p>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedTicket.message}
              </p>
            </div>

            <form onSubmit={handleSendResponse} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Update Ticket Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {["IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={newStatus === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewStatus(s)}
                      className="h-8 rounded-xl text-xs font-semibold"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Official Administrative Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Provide resolution details or ask follow-up questions..."
                  rows={4}
                  className="mt-1 w-full rounded-2xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl text-xs font-semibold gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submitting ? "Saving..." : "Save & Send Response"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

