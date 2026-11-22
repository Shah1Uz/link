"use client";

import React, { useState } from "react";
import {
  Mail,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveThemeSurface, withAlpha } from "./theme-surface";
import { toast } from "sonner";

interface PublicNewsletterBlockProps {
  profile: {
    id: string;
    username: string;
    displayName?: string | null;
    newsletterEnabled?: boolean;
    newsletterTitle?: string | null;
    newsletterDescription?: string | null;
    newsletterButtonText?: string | null;
    newsletterPlaceholder?: string | null;
    newsletterSuccessMessage?: string | null;
    newsletterLayout?: string | null;
  };
  theme?: any;
}

export function PublicNewsletterBlock({ profile, theme }: PublicNewsletterBlockProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Only render if explicitly enabled by creator from dashboard
  if (!profile.newsletterEnabled) {
    return null;
  }

  const title = profile.newsletterTitle || "Join my Newsletter";
  const description =
    profile.newsletterDescription ||
    "Get the latest updates, exclusive resources, and releases directly in your inbox.";
  const buttonText = profile.newsletterButtonText || "Subscribe";
  const placeholder = profile.newsletterPlaceholder || "Enter your email...";
  const layout = profile.newsletterLayout || "card";

  // Theme-aware platform surface: derives glass/border/text values from the
  // creator's palette without replacing any theme value.
  const ts = resolveThemeSurface(theme);
  const accentInk = ts.accentInk;
  const accentText = ts.accentText;

  const inputClassName =
    "!h-11 !w-full !rounded-xl !border-[var(--ts-border)] !bg-[var(--ts-surface-strong)] !text-[13px] !text-[var(--ts-text)] !shadow-none backdrop-blur-sm placeholder:!text-[var(--ts-subtle)] focus-visible:!border-[var(--ts-accent-border)] focus-visible:!ring-[color:var(--ts-accent-soft)]";

  const submitButtonStyle: React.CSSProperties = {
    backgroundColor: ts.accent,
    color: accentText,
    borderColor: "transparent",
    boxShadow: `0 12px 28px -16px ${withAlpha(ts.accent, 0.9)}`,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!consentAgreed) {
      toast.error("Please agree to receive emails to subscribe");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          email: email.trim(),
          name: name.trim() || null,
          consentText: "I agree to receive email updates and newsletters.",
          source: "profile_page",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Subscription failed");
      }

      setIsSuccess(true);
      setSuccessMessage(
        data.message || profile.newsletterSuccessMessage || "Thanks for subscribing! Check your email to confirm."
      );
      toast.success("Confirmation email sent! Please check your inbox.");
      setEmail("");
      setName("");
    } catch (err: any) {
      const message = err.message || "Could not complete subscription";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorNote = errorMessage ? (
    <p
      role="alert"
      className="flex items-start gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-medium leading-relaxed animate-in fade-in"
      style={{
        borderColor: withAlpha("#f43f5e", 0.35),
        backgroundColor: withAlpha("#f43f5e", 0.1),
        color: ts.isLight ? "#be123c" : "#fda4af",
      }}
    >
      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
      <span>{errorMessage}</span>
    </p>
  ) : null;

  const consentRow = (size: "sm" | "md" = "md") => (
    <div
      className="flex flex-wrap items-center justify-between gap-2 pt-0.5"
      style={{ color: ts.subtle }}
    >
      <label className="flex cursor-pointer items-center gap-1.5">
        <input
          type="checkbox"
          checked={consentAgreed}
          onChange={(e) => setConsentAgreed(e.target.checked)}
          className={size === "sm" ? "h-3 w-3 cursor-pointer rounded" : "h-3.5 w-3.5 cursor-pointer rounded"}
          style={{ accentColor: ts.accent }}
        />
        <span className="text-[11px]">I agree to receive emails</span>
      </label>
      <span className="flex items-center gap-1 text-[11px]">
        <Lock className="h-2.5 w-2.5" />
        <span>No spam</span>
      </span>
    </div>
  );

  // 1. Success Message View
  if (isSuccess) {
    return (
      <div
        className="relative overflow-hidden rounded-3xl border p-6 text-center animate-in fade-in zoom-in-95 duration-200"
        style={{
          ...ts.vars,
          backgroundColor: ts.surface,
          borderColor: ts.accentBorder,
          color: ts.text,
          boxShadow: ts.glow,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(120% 120% at 50% -10%, ${ts.accentSoft}, transparent 62%)`,
          }}
        />
        <div className="relative space-y-3">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              backgroundColor: ts.accentSoft,
              color: accentInk,
              boxShadow: `0 0 0 6px ${withAlpha(ts.accent, 0.07)}`,
            }}
          >
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-extrabold tracking-tight">You&apos;re on the list</h4>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed" style={{ color: ts.muted }}>
              {successMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setErrorMessage("");
            }}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 hover:gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
            style={{
              color: accentInk,
              backgroundColor: ts.accentSoft,
              "--tw-ring-color": ts.accentBorder,
            } as React.CSSProperties}
          >
            Subscribe another email
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Minimal Layout — slim, single-row form
  if (layout === "minimal") {
    return (
      <div
        className="space-y-2.5 rounded-2xl border p-4 backdrop-blur-xl animate-in fade-in"
        style={{
          ...ts.vars,
          backgroundColor: ts.surface,
          borderColor: ts.border,
          color: ts.text,
          boxShadow: `0 10px 30px -24px ${withAlpha(ts.text, 0.6)}`,
        }}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em]">
          <Mail className="h-3.5 w-3.5" style={{ color: accentInk }} />
          <span style={{ color: ts.muted }}>{title}</span>
        </div>
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            required
            className={inputClassName + " !h-12 !pr-14"}
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            aria-label={buttonText}
            className="absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2 rounded-lg border-0 p-0 shadow-none transition-transform duration-200 hover:brightness-110 active:scale-95"
            style={submitButtonStyle}
          >
            {isSubmitting ? (
              <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </form>
        {errorNote}
      </div>
    );
  }

  // 3. Inline Layout — compact horizontal banner
  if (layout === "inline") {
    return (
      <div
        className="rounded-2xl border p-3.5 backdrop-blur-xl animate-in fade-in sm:p-4"
        style={{
          ...ts.vars,
          backgroundColor: ts.surface,
          borderColor: ts.border,
          color: ts.text,
          boxShadow: `0 10px 30px -24px ${withAlpha(ts.text, 0.6)}`,
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: ts.accentSoft, color: accentInk }}
            >
              <Mail className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h4 className="truncate text-[13px] font-bold tracking-tight sm:text-sm">{title}</h4>
              {description && (
                <p className="truncate text-[11px] leading-relaxed" style={{ color: ts.muted }}>
                  {description}
                </p>
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:shrink-0">
            <Input
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              required
              className={inputClassName + " sm:!w-52"}
            />
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
              className="h-11 shrink-0 rounded-xl border-0 px-4 text-xs font-bold hover:brightness-110 active:scale-[0.98]"
              style={submitButtonStyle}
            >
              {isSubmitting ? "..." : buttonText}
            </Button>
          </form>
        </div>
        {errorMessage && <div className="pt-2">{errorNote}</div>}
      </div>
    );
  }

  // 4. Hero Layout — bold, high-contrast banner card
  if (layout === "hero") {
    return (
      <div
        className="relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl shadow-2xl animate-in fade-in"
        style={{
          ...ts.vars,
          backgroundColor: ts.surface,
          borderColor: ts.accentBorder,
          color: ts.text,
          boxShadow: ts.glow,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(130% 110% at 100% 0%, ${ts.accentSoft}, transparent 58%)`,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${ts.accentBorder}, transparent)`,
          }}
        />

        <div className="relative space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]"
                style={{ backgroundColor: ts.accentSoft, color: accentInk }}
              >
                <Sparkles className="h-3 w-3" />
                <span>Newsletter</span>
              </div>
              <h4 className="text-lg font-extrabold leading-tight tracking-[-0.02em] sm:text-xl">
                {title}
              </h4>
              {description && (
                <p className="max-w-sm text-xs leading-relaxed sm:text-[13px]" style={{ color: ts.muted }}>
                  {description}
                </p>
              )}
            </div>
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
              style={{
                backgroundColor: ts.accentSoft,
                borderColor: ts.accentBorder,
                color: accentInk,
              }}
            >
              <Mail className="h-5 w-5" />
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5 pt-1">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                required
                className={inputClassName}
              />
              <Button
                type="submit"
                variant="outline"
                disabled={isSubmitting}
                className="h-11 shrink-0 rounded-xl border-0 px-5 text-xs font-bold hover:brightness-110 active:scale-[0.98] sm:text-[13px]"
                style={submitButtonStyle}
              >
                {isSubmitting ? "Subscribing..." : buttonText}
              </Button>
            </div>

            {errorNote}

            <div className="flex flex-wrap items-center justify-between gap-2">
              {consentRow()}
              <span className="hidden items-center gap-1 text-[10px] sm:flex" style={{ color: ts.subtle }}>
                <ShieldCheck className="h-3 w-3" />
                Unsubscribe anytime
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 5. Default "Card" Layout
  return (
    <div
      className="relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300 animate-in fade-in hover:shadow-xl sm:p-6"
      style={{
        ...ts.vars,
        backgroundColor: ts.surface,
        borderColor: ts.border,
        color: ts.text,
        boxShadow: `0 16px 40px -30px ${withAlpha(ts.text, 0.7)}`,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${ts.accentBorder}, transparent)`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full opacity-60 blur-2xl"
        style={{ backgroundColor: ts.accentSoft }}
      />

      <div className="relative space-y-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
            style={{
              backgroundColor: ts.accentSoft,
              borderColor: ts.accentBorder,
              color: accentInk,
            }}
          >
            <Mail className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold tracking-tight">{title}</h4>
            {description && (
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed sm:text-xs" style={{ color: ts.muted }}>
                {description}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5 pt-1">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              required
              className={inputClassName}
            />
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
              className="h-11 shrink-0 rounded-xl border-0 px-4 text-xs font-bold hover:brightness-110 active:scale-[0.98]"
              style={submitButtonStyle}
            >
              {isSubmitting ? "Subscribing..." : buttonText}
            </Button>
          </div>

          {errorNote}

          {consentRow()}
        </form>
      </div>
    </div>
  );
}
