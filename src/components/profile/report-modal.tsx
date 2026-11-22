"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Flag, CheckCircle2, ChevronDown, ShieldCheck, Mail } from "lucide-react";
import { toast } from "sonner";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId?: string;
  linkId?: string;
}

const REPORT_REASONS = [
  "Spam or Phishing",
  "Malicious or Deceptive Link",
  "Inappropriate Content",
  "Impersonation / Copyright",
  "Other Violation",
];

export function ReportModal({
  isOpen,
  onClose,
  profileId,
  linkId,
}: ReportModalProps) {
  const [reason, setReason] = useState("Spam or Phishing");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          linkId,
          reason,
          details,
          reporterEmail: email,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit report");
      setSubmitted(true);
      toast.success("Report submitted to moderation team");
    } catch {
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report content"
      description="Reports are anonymous. Our moderation team reviews every submission against the BioSpace guidelines."
      className="max-w-md"
    >
      {submitted ? (
        <div className="relative py-4 text-center animate-in fade-in zoom-in-95">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 shadow-[0_0_0_8px_rgba(16,185,129,0.06)]">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h4 className="mt-4 text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Thanks for keeping BioSpace safe
          </h4>
          <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Our moderation team will review this content against our platform guidelines and take
            action if needed.
          </p>
          <Button variant="outline" size="sm" onClick={onClose} className="mt-5 rounded-xl">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label
              htmlFor="report-reason"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400"
            >
              Reason for report *
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                <Flag className="h-4 w-4" />
              </span>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-zinc-200/90 bg-white/80 pl-10 pr-10 text-sm font-medium text-zinc-900 shadow-xs backdrop-blur-sm transition-all duration-200 hover:border-zinc-300 focus-visible:border-emerald-500/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:border-white/20"
              >
                {REPORT_REASONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>

          <div>
            <label
              htmlFor="report-details"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400"
            >
              Additional details <span className="font-medium normal-case tracking-normal text-zinc-400">(optional)</span>
            </label>
            <Textarea
              id="report-details"
              placeholder="Describe the issue — links, screenshots context, etc."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="rounded-xl text-[13px]"
            />
          </div>

          <div>
            <label
              htmlFor="report-email"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400"
            >
              Your email <span className="font-medium normal-case tracking-normal text-zinc-400">(optional)</span>
            </label>
            <Input
              id="report-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              className="h-11 rounded-xl text-[13px]"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-zinc-100/70 px-3 py-2 text-[10px] leading-relaxed text-zinc-500 dark:bg-white/[0.04] dark:text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span>False reports may affect your account. Submit only accurate information.</span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" variant="destructive" isLoading={isSubmitting} className="rounded-xl">
              <Flag className="mr-1.5 h-4 w-4" />
              <span>Submit report</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
