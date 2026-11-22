"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import {
  Globe,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { CopyButton } from "@/components/shared/copy-button";
import { toast } from "sonner";

interface DNSInstruction {
  type: "CNAME" | "A" | "TXT";
  name: string;
  value: string;
  ttl: string;
}

interface DomainEvent {
  id: string;
  eventType: string;
  description: string;
  createdAt: string;
}

interface CustomDomain {
  id: string;
  domain: string;
  status: "PENDING" | "VERIFYING" | "VERIFIED" | "PROVISIONING_SSL" | "ACTIVE" | "FAILED" | "SUSPENDED";
  sslStatus: "PENDING" | "ISSUING" | "ACTIVE" | "FAILED";
  isApex: boolean;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  instructions: DNSInstruction[];
  events?: DomainEvent[];
}

export default function CustomDomainsPage() {
  const { t } = useI18n();
  const { subscriptionTier } = useDashboard();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(subscriptionTier === "PRO" || (subscriptionTier as string) === "BUSINESS");

  // Add Domain Form
  const [newDomain, setNewDomain] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Verifying State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Remove Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<CustomDomain | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/domains");
      const data = await res.json();
      if (res.ok) {
        setDomains(data.domains || []);
        setIsPro(data.isPro);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load custom domains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    try {
      setConnecting(true);
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect domain");
      }

      toast.success(data.message || "Domain added! Please configure DNS records.");
      setNewDomain("");
      loadDomains();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    try {
      setVerifyingId(domainId);
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification check failed");
      }

      if (data.status === "ACTIVE") {
        toast.success(data.message || "Domain verified and active!");
      } else {
        toast.warning(data.message || "DNS records not detected yet. Please allow propagation time.");
      }

      loadDomains();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async () => {
    if (!domainToDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/domains?id=${domainToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove domain");

      toast.success(data.message || "Domain removed");
      setDeleteModalOpen(false);
      setDomainToDelete(null);
      loadDomains();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: CustomDomain["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Active & Live
          </Badge>
        );
      case "PROVISIONING_SSL":
        return (
          <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 gap-1 animate-pulse">
            <Lock className="w-3 h-3" />
            Provisioning SSL
          </Badge>
        );
      case "VERIFIED":
        return (
          <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30 gap-1">
            <ShieldCheck className="w-3 h-3" />
            Ownership Verified
          </Badge>
        );
      case "VERIFYING":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 gap-1 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Verifying DNS
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            DNS Failed
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge variant="destructive" className="gap-1">
            <ShieldAlert className="w-3 h-3" />
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 gap-1">
            <Clock className="w-3 h-3" />
            Pending Setup
          </Badge>
        );
    }
  };

  return (
    <div className="pb-16">
      {/* Header */}
      <DashboardHeader
        title={t.domainsStudio.title}
        description={t.domainsStudio.description}
      />

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8">

      {/* PRO Gate Banner if user is on Free Tier */}
      {!isPro && (
        <Card className="border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-500/5 to-amber-500/10 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500 text-black font-extrabold text-[10px] uppercase">
                    PRO Feature
                  </Badge>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                    Brand Your Profile with a Custom Domain
                  </h3>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl">
                  Custom domains allow you to serve your BioSpace page directly from your personal or business URL.
                  Includes free automatic SSL certificates, CNAME routing, and DNS ownership verification.
                </p>
              </div>

              <Button
                asChild
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs h-9 px-4 rounded-xl shadow-md shrink-0 gap-1.5"
              >
                <Link href="/dashboard/upgrade">
                  <Sparkles className="w-3.5 h-3.5" />
                  Upgrade to PRO
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connect New Domain Form */}
      {isPro && (
        <Card className="border border-border/80 bg-card shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              Connect a Domain
            </CardTitle>
            <CardDescription className="text-xs">
              Enter a subdomain (e.g. <span className="font-mono text-zinc-800 dark:text-zinc-200">links.yourbrand.com</span>) or root apex domain (e.g. <span className="font-mono text-zinc-800 dark:text-zinc-200">yourbrand.me</span>).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
              <Input
                type="text"
                placeholder="links.yourdomain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="h-10 text-xs font-mono"
              />
              <Button
                type="submit"
                disabled={connecting}
                className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs h-10 px-5 shrink-0"
              >
                {connecting ? "Connecting..." : "Connect Domain"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Connected Domains List */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
          Connected Domains ({domains.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500 animate-pulse">
            Loading domain configuration...
          </div>
        ) : domains.length === 0 ? (
          <Card className="border border-dashed border-border/80 bg-surface/30 shadow-xs p-8 text-center space-y-2">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-card text-text-secondary">
              <Globe className="w-5 h-5" />
            </span>
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">No custom domains connected</h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Add your personal domain above to direct visitors to your BioSpace link using your own brand.
            </p>
          </Card>
        ) : (
          domains.map((d) => (
            <Card
              key={d.id}
              className="card-lift border border-border/80 bg-card shadow-soft overflow-hidden"
            >
              <CardContent className="p-5 sm:p-6 space-y-4">
                {/* Domain Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-base text-zinc-900 dark:text-white font-mono">
                        {d.domain}
                      </h4>
                      {getStatusBadge(d.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>Type: {d.isApex ? "Apex Domain (@)" : "Subdomain"}</span>
                      <span>•</span>
                      <span>
                        SSL:{" "}
                        <span className={d.sslStatus === "ACTIVE" ? "text-emerald-500 font-semibold" : "text-amber-500"}>
                          {d.sslStatus === "ACTIVE" ? "Encrypted (HTTPS)" : d.sslStatus}
                        </span>
                      </span>
                      {d.lastCheckedAt && (
                        <>
                          <span>•</span>
                          <span>Last checked: {new Date(d.lastCheckedAt).toLocaleTimeString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {d.status === "ACTIVE" && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 text-xs font-semibold gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      >
                        <a href={`https://${d.domain}`} target="_blank" rel="noreferrer">
                          <span>Visit Live</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={verifyingId === d.id}
                      onClick={() => handleVerify(d.id)}
                      className="h-8 text-xs font-semibold gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${verifyingId === d.id ? "animate-spin" : ""}`} />
                      <span>{verifyingId === d.id ? "Checking..." : "Verify DNS"}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDomainToDelete(d);
                        setDeleteModalOpen(true);
                      }}
                      className="h-8 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Error diagnostics banner if failed */}
                {d.errorMessage && d.status === "FAILED" && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Verification Note</p>
                      <p className="text-[11px] mt-0.5 opacity-90">{d.errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* DNS Configuration Table */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      Required DNS Records
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Configure these in your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.)
                    </span>
                  </div>

                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-x-auto bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="min-w-[460px]">
                      <div className="grid grid-cols-12 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="col-span-2">Type</span>
                      <span className="col-span-3">Name / Host</span>
                      <span className="col-span-5">Value / Target</span>
                      <span className="col-span-2 text-right">TTL</span>
                    </div>

                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {d.instructions.map((inst, idx) => (
                        <div key={idx} className="grid grid-cols-12 px-3 py-2.5 text-xs items-center gap-1">
                          <span className="col-span-2 font-mono font-bold text-zinc-900 dark:text-white">
                            {inst.type}
                          </span>
                          <div className="col-span-3 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                            <span className="truncate">{inst.name}</span>
                            <CopyButton text={inst.name} size="sm" className="h-6 w-6 p-0 shrink-0" />
                          </div>
                          <div className="col-span-5 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                            <span className="truncate">{inst.value}</span>
                            <CopyButton text={inst.value} size="sm" className="h-6 w-6 p-0 shrink-0" />
                          </div>
                          <span className="col-span-2 text-right text-[11px] text-zinc-500">
                            {inst.ttl}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            </Card>
          ))
        )}
      </div>

      </div>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Remove Custom Domain"
      >
        <div className="space-y-3 text-xs">
          <p className="text-zinc-600 dark:text-zinc-300">
            Are you sure you want to disconnect{" "}
            <span className="font-bold text-zinc-900 dark:text-white">
              {domainToDelete?.domain}
            </span>
            ? Traffic to this domain will no longer be routed to your BioSpace profile.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={deleting}
              onClick={handleDelete}
              className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Removing..." : "Remove Domain"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
