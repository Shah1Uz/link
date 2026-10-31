"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Download,
  Search,
  Mail,
  UserCheck,
  TrendingUp,
  Sparkles,
  DollarSign,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  email: string;
  name: string;
  source: string;
  spent: number;
  createdAt: string;
}

export default function AudienceDashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadAudience() {
      try {
        setLoading(true);
        const res = await fetch("/api/audience");
        if (res.ok) {
          const data = await res.json();
          setContacts(data.audience || []);
        }
      } catch {
        toast.error("Failed to load audience data");
      } finally {
        setLoading(false);
      }
    }
    loadAudience();
  }, []);

  const filtered = contacts.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.source.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpent = contacts.reduce((sum, c) => sum + c.spent, 0);

  const handleExportCSV = () => {
    if (contacts.length === 0) {
      toast.error("No contacts to export");
      return;
    }

    const headers = "ID,Name,Email,Source,Spent,Date\n";
    const rows = contacts
      .map(
        (c) =>
          `"${c.id}","${c.name}","${c.email}","${c.source}","${c.spent}","${new Date(
            c.createdAt
          ).toLocaleDateString()}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `biospace_audience_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audience list exported to CSV");
  };

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader
        title="Audience & Leads"
        description="Grow, manage, and monetize your direct fan base and customer email subscribers."
        action={
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="rounded-xl gap-2 font-semibold shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Total Subscribers
              </p>
              <h3 className="mt-1 text-2xl font-black text-foreground">
                {contacts.length}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Audience Lifetime Value
              </p>
              <h3 className="mt-1 text-2xl font-black text-foreground">
                ${totalSpent.toFixed(2)}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Audience Retention
              </p>
              <h3 className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                98.4%
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Table Card */}
      <Card className="rounded-2xl border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-500" />
            <span>Captured Contacts & Buyers</span>
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email..."
              className="pl-9 rounded-xl text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-text-secondary">
              Loading audience data...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-secondary">
              No contacts found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface border-b border-border text-text-secondary font-semibold uppercase">
                  <tr>
                    <th className="px-5 py-3">Subscriber</th>
                    <th className="px-5 py-3">Source Channel</th>
                    <th className="px-5 py-3">Customer Value</th>
                    <th className="px-5 py-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-foreground">{c.name}</div>
                        <div className="text-text-secondary font-mono text-[11px]">{c.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className="rounded-lg text-[10px] font-semibold">
                          {c.source}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-foreground">
                        {c.spent > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            ${c.spent.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-text-secondary">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary font-medium">
                        {new Date(c.createdAt).toLocaleDateString()}
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
  );
}

