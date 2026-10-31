"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Flag, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId?: string;
  linkId?: string;
}

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
    <Modal isOpen={isOpen} onClose={onClose} title="Report Content" className="max-w-md">
      {submitted ? (
        <div className="py-6 text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-base text-zinc-900 dark:text-white">
            Thank you for helping keep BioSpace safe
          </h4>
          <p className="text-xs text-zinc-500">
            Our moderation team will review this content against our platform guidelines.
          </p>
          <Button variant="outline" size="sm" onClick={onClose} className="mt-2">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Reason for Report *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              <option value="Spam or Phishing">Spam or Phishing</option>
              <option value="Malicious or Deceptive Link">Malicious or Deceptive Link</option>
              <option value="Inappropriate Content">Inappropriate Content</option>
              <option value="Impersonation / Copyright">Impersonation / Copyright</option>
              <option value="Other Violation">Other Violation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Additional Details (optional)
            </label>
            <Textarea
              placeholder="Describe the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Your Email (optional)
            </label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" isLoading={isSubmitting}>
              <Flag className="h-4 w-4 mr-1.5" />
              <span>Submit Report</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

