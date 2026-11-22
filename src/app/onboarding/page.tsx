"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Camera,
  Eye,
  Rocket,
  Compass,
  Code,
  Brush,
  Briefcase,
  Video,
  FileText,
  AtSign,
  Link2,
  LayoutTemplate,
  PartyPopper,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PhoneMockup } from "@/components/marketing/phone-mockup";
import { AvatarUploader } from "@/components/shared/avatar-uploader";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

const categories = [
  { id: "CREATOR", label: "Creator", icon: Video, desc: "YouTube, streamers, podcasts" },
  { id: "INFLUENCER", label: "Influencer", icon: Compass, desc: "Lifestyle, fashion, social media" },
  { id: "DEVELOPER", label: "Developer", icon: Code, desc: "Open-source, tech, engineers" },
  { id: "BUSINESS", label: "Business", icon: Briefcase, desc: "Startups, brands, agencies" },
  { id: "ARTIST", label: "Artist", icon: Brush, desc: "Illustrators, visual art, designers" },
  { id: "PHOTOGRAPHER", label: "Photographer", icon: Camera, desc: "Prints, portfolios, commercial" },
  { id: "BLOGGER", label: "Blogger / Writer", icon: FileText, desc: "Newsletters, journalism, essays" },
  { id: "OTHER", label: "Other", icon: Sparkles, desc: "Students, organizers, founders" },
];

const templatePresets = [
  { slug: "creator-horizon", name: "Creator Horizon", category: "Creator", color: "#10b981", bg: "#0d1117" },
  { slug: "cyber-stream", name: "Cyber Stream", category: "Creator", color: "#a855f7", bg: "#0b0b14" },
  { slug: "obsidian-minimal", name: "Obsidian Minimal", category: "Minimal", color: "#ffffff", bg: "#09090b" },
  { slug: "golden-hour", name: "Golden Hour", category: "Influencer", color: "#f97316", bg: "#fff7ed" },
  { slug: "executive-navy", name: "Executive Navy", category: "Business", color: "#64ffda", bg: "#0a192f" },
  { slug: "developer-terminal", name: "Developer Terminal", category: "Portfolio", color: "#58a6ff", bg: "#0d1117" },
];

const avatarPresets = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
];

const STEPS = [
  { id: 1, label: "Welcome", description: "Start your setup" },
  { id: 2, label: "Username", description: "Claim your URL" },
  { id: 3, label: "Category", description: "What describes you" },
  { id: 4, label: "Profile", description: "Avatar & bio" },
  { id: 5, label: "Links", description: "Your socials" },
  { id: 6, label: "Template", description: "Pick a look" },
  { id: 7, label: "Publish", description: "Review & go live" },
  { id: 8, label: "Done", description: "You are live" },
];

function StepHeading({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2.5">
      <span className="eyebrow">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Step {step} of 7
      </span>
      <h2 className="font-heading text-2xl font-extrabold leading-[1.1] tracking-[-0.035em] text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="max-w-xl text-[13px] leading-relaxed text-text-secondary sm:text-sm">
        {description}
      </p>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoRedirecting, setIsAutoRedirecting] = useState(true);

  // If user signed up/in with Clerk, automatically sync their username and bypass onboarding straight to dashboard!
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (clerkUser) {
      const rawUser =
        clerkUser.username ||
        clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] ||
        clerkUser.firstName ||
        "";
      const cleanCandidate = rawUser.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

      fetch("/api/auth/sync-clerk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUsername: clerkUser.username || cleanCandidate,
          displayName: clerkUser.fullName || clerkUser.username || cleanCandidate,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          avatarUrl: clerkUser.imageUrl,
        }),
      })
        .catch(() => {})
        .finally(() => {
          router.replace("/dashboard");
        });
    } else {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data?.profile?.username) {
            router.replace("/dashboard");
          } else {
            setIsAutoRedirecting(false);
          }
        })
        .catch(() => {
          setIsAutoRedirecting(false);
        });
    }
  }, [isClerkLoaded, clerkUser, router]);

  // Form State
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [usernameMessage, setUsernameMessage] = useState("");

  const [category, setCategory] = useState("CREATOR");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(avatarPresets[0]);

  // Pre-fill from Clerk if user remains on manual onboarding
  useEffect(() => {
    if (clerkUser) {
      if (clerkUser.username) setUsername(clerkUser.username.toLowerCase());
      if (clerkUser.fullName) setDisplayName(clerkUser.fullName);
      if (clerkUser.imageUrl) setAvatarUrl(clerkUser.imageUrl);
    }
  }, [clerkUser]);

  // Social Links
  const [socials, setSocials] = useState({
    youtube: "",
    instagram: "",
    twitter: "",
    github: "",
    telegram: "",
  });

  const [selectedTemplate, setSelectedTemplate] = useState("creator-horizon");

  // Check username debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus("checking");
      try {
        const res = await fetch(`/api/profile/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus("valid");
          setUsernameMessage("Username is available!");
        } else {
          setUsernameStatus("invalid");
          setUsernameMessage(data.message || "Username is unavailable");
        }
      } catch {
        setUsernameStatus("invalid");
        setUsernameMessage("Error verifying availability");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleNext = () => {
    if (currentStep === 2 && usernameStatus !== "valid") {
      toast.error("Please choose a valid and available username");
      return;
    }
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const socialLinksList = [];
      if (socials.youtube) socialLinksList.push({ title: "YouTube Channel", url: socials.youtube, platform: "youtube" });
      if (socials.instagram) socialLinksList.push({ title: "Instagram Profile", url: socials.instagram, platform: "instagram" });
      if (socials.twitter) socialLinksList.push({ title: "X / Twitter", url: socials.twitter, platform: "twitter" });
      if (socials.github) socialLinksList.push({ title: "GitHub Portfolio", url: socials.github, platform: "github" });
      if (socials.telegram) socialLinksList.push({ title: "Telegram Channel", url: socials.telegram, platform: "telegram" });

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          displayName: displayName || username,
          category,
          bio,
          avatarUrl,
          socialLinks: socialLinksList,
          templateSlug: selectedTemplate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish profile");

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      setCurrentStep(8);
      toast.success("Profile published successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = Math.round((currentStep / 8) * 100);
  const selectedCategory = categories.find((c) => c.id === category);
  const activeTemplate = templatePresets.find((t) => t.slug === selectedTemplate);
  const socialLinksCount = Object.values(socials).filter(Boolean).length;

  if (isAutoRedirecting) {
    return (
      <div className="dark relative flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="aurora" />
        <div className="relative z-10 flex flex-col items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="font-heading text-sm font-bold text-white">
            BioSpace profilingiz tayyorlanmoqda…
          </p>
          <p className="text-xs text-zinc-400">
            Clerk hisobingiz bo'yicha profil sozlanmoqda, dashboardga yo'naltirilmoqda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="grid-pattern absolute inset-x-0 top-0 h-[620px] opacity-70 dark:opacity-40" />
        <div className="aurora" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-emerald-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_12px_26px_-12px_rgba(16,185,129,0.8)]">
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <div>
              <p className="font-heading text-base font-extrabold tracking-[-0.03em] text-foreground">
                Bio<span className="text-gradient-ink">Space</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                Creator onboarding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] font-semibold text-text-secondary sm:inline">
              Step {Math.min(currentStep, 7)} of 7
            </span>
            <span className="rounded-full border border-border/70 bg-surface/50 px-3 py-1 text-[11px] font-bold tabular-nums text-foreground">
              {currentStep === 8 ? "100%" : `${progress}%`}
            </span>
          </div>
        </header>

        <div className="mt-6 grid flex-1 items-start gap-6 lg:mt-10 lg:grid-cols-[260px_1fr] lg:gap-10">
          {/* Step rail (desktop) */}
          <aside className="hidden lg:block">
            <div className="panel p-4">
              <p className="px-1 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                Setup progress
              </p>
              <ol className="space-y-1">
                {STEPS.map((step) => {
                  const isDone = currentStep > step.id;
                  const isActive = currentStep === step.id;
                  return (
                    <li
                      key={step.id}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors",
                        isActive && "bg-emerald-500/[0.08]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-extrabold",
                          isDone
                            ? "border-emerald-500/40 bg-emerald-500 text-white"
                            : isActive
                            ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "border-border/80 bg-surface/60 text-text-secondary"
                        )}
                      >
                        {isDone ? <Check className="h-3 w-3" strokeWidth={3} /> : step.id}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "truncate text-[12px] font-bold",
                            isActive ? "text-foreground" : "text-text-secondary"
                          )}
                        >
                          {step.label}
                        </p>
                        <p className="truncate text-[10px] text-text-secondary/80">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.10] to-transparent p-4">
              <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-200">
                Takes about 2 minutes
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                Everything here can be changed later from your studio.
              </p>
            </div>
          </aside>

          {/* Step content */}
          <main className="min-w-0">
            {/* Mobile progress */}
            <div className="mb-5 lg:hidden">
              <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-text-secondary">
                <span>
                  {STEPS[currentStep - 1]?.label || "Done"}
                </span>
                <span className="tabular-nums">
                  {Math.min(currentStep, 7)} / 7
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div key={currentStep} className="animate-in fade-in zoom-in-95">
              {/* STEP 1: WELCOME */}
              {currentStep === 1 && (
                <div className="panel relative overflow-hidden p-6 text-center sm:p-10">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl"
                  />
                  <div className="relative space-y-6">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/20 to-emerald-500/[0.04] text-emerald-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:text-emerald-400">
                      <Rocket className="h-8 w-8" />
                    </span>
                    <div className="space-y-2.5">
                      <h1 className="font-heading text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-4xl">
                        Welcome to{" "}
                        <span className="text-gradient-ink">BioSpace</span>
                      </h1>
                      <p className="mx-auto max-w-md text-[13px] leading-relaxed text-text-secondary sm:text-sm">
                        Let&apos;s build your custom public profile in less than two minutes. Claim
                        your URL, pick your aesthetic and connect your audience.
                      </p>
                    </div>

                    <div className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-2 pt-1">
                      {["Claim your URL", "Choose a theme", "Publish instantly"].map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/50 px-3 py-1.5 text-[11px] font-semibold text-text-secondary"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2">
                      <Button size="lg" onClick={handleNext} className="rounded-2xl px-8 font-bold">
                        <span>Let&apos;s get started</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: USERNAME */}
              {currentStep === 2 && (
                <div className="panel p-5 sm:p-7">
                  <StepHeading
                    step={2}
                    title="Choose your unique BioSpace URL"
                    description="This becomes your permanent public link. Short, memorable handles convert best."
                  />

                  <div className="mt-6 space-y-3">
                    <Label htmlFor="onboarding-username">Desired username</Label>
                    <div className="flex items-center rounded-2xl border border-border/90 bg-background/60 px-3.5 shadow-xs transition-all focus-within:border-emerald-500/60 focus-within:ring-4 focus-within:ring-emerald-500/10">
                      <span className="select-none text-sm font-semibold text-text-secondary">
                        biospace.com/
                      </span>
                      <input
                        id="onboarding-username"
                        type="text"
                        placeholder="yourname"
                        value={username}
                        onChange={(e) =>
                          setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                        }
                        className="h-12 w-full bg-transparent px-1 text-base font-bold text-foreground placeholder:font-medium placeholder:text-text-secondary/50 focus:outline-none"
                        autoFocus
                      />
                      {usernameStatus === "checking" && (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-text-secondary" />
                      )}
                      {usernameStatus === "valid" && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      )}
                      {usernameStatus === "invalid" && (
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      )}
                    </div>

                    <div className="min-h-[20px] text-xs">
                      {usernameStatus === "checking" && (
                        <span className="text-text-secondary">Checking availability…</span>
                      )}
                      {usernameStatus === "valid" && (
                        <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{usernameMessage}</span>
                        </span>
                      )}
                      {usernameStatus === "invalid" && (
                        <span className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                          <AlertCircle className="h-4 w-4" />
                          <span>{usernameMessage}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface/40 p-3.5">
                    <AtSign className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-[11px] leading-relaxed text-text-secondary">
                      Only lowercase letters, numbers, hyphens and underscores. You can change it
                      later from Settings.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: CATEGORY */}
              {currentStep === 3 && (
                <div className="panel p-5 sm:p-7">
                  <StepHeading
                    step={3}
                    title="What best describes you?"
                    description="This helps us recommend the best layouts, templates and features for your profile."
                  />

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={cn(
                            "group flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 ease-out-soft active:scale-[0.99]",
                            isSelected
                              ? "border-emerald-500/50 bg-emerald-500/[0.07] shadow-[0_0_0_1px_rgba(16,185,129,0.2)]"
                              : "border-border/80 bg-surface/30 hover:border-border hover:bg-surface/60"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                              isSelected
                                ? "border-emerald-500/40 bg-gradient-to-b from-emerald-400 to-teal-500 text-white"
                                : "border-border/70 bg-background/60 text-text-secondary group-hover:text-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="text-[13px] font-bold text-foreground">
                                {cat.label}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              )}
                            </span>
                            <span className="mt-0.5 block text-[11px] leading-relaxed text-text-secondary">
                              {cat.desc}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: PROFILE */}
              {currentStep === 4 && (
                <div className="panel p-5 sm:p-7">
                  <StepHeading
                    step={4}
                    title="Personalise your profile"
                    description="Choose an avatar and write a short biography for your visitors."
                  />

                  <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <Label>Profile avatar</Label>
                      <AvatarUploader
                        currentUrl={avatarUrl}
                        onUploadSuccess={(url) => setAvatarUrl(url)}
                      />
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                          or pick one
                        </span>
                        {avatarPresets.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setAvatarUrl(preset)}
                            className={cn(
                              "h-9 w-9 overflow-hidden rounded-full border-2 transition-all",
                              avatarUrl === preset
                                ? "border-emerald-500 ring-2 ring-emerald-500/25"
                                : "border-border/70 opacity-70 hover:opacity-100"
                            )}
                          >
                            <img src={preset} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-border/70 pt-5">
                      <Label htmlFor="onboarding-name">Display name</Label>
                      <Input
                        id="onboarding-name"
                        placeholder="e.g. Alex Rivera"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="onboarding-bio">Short biography</Label>
                        <span className="text-[10px] font-semibold tabular-nums text-text-secondary">
                          {bio.length} / 250
                        </span>
                      </div>
                      <Textarea
                        id="onboarding-bio"
                        placeholder="What are you building or creating?"
                        value={bio}
                        maxLength={250}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: SOCIALS */}
              {currentStep === 5 && (
                <div className="panel p-5 sm:p-7">
                  <StepHeading
                    step={5}
                    title="Add your social media links"
                    description="We will turn these into buttons on your profile. You can add more and reorder them anytime from your studio."
                  />

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      { key: "youtube", platform: "youtube", label: "YouTube channel", placeholder: "https://youtube.com/@yourchannel" },
                      { key: "instagram", platform: "instagram", label: "Instagram profile", placeholder: "https://instagram.com/yourhandle" },
                      { key: "twitter", platform: "twitter", label: "X / Twitter", placeholder: "https://x.com/yourhandle" },
                      { key: "github", platform: "github", label: "GitHub profile", placeholder: "https://github.com/yourhandle" },
                      { key: "telegram", platform: "telegram", label: "Telegram channel", placeholder: "https://t.me/yourchannel" },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <Label
                          htmlFor={`onboarding-${field.key}`}
                          className="flex items-center gap-1.5 normal-case tracking-normal text-foreground"
                        >
                          <PlatformIcon platform={field.platform} size={14} />
                          <span>{field.label}</span>
                        </Label>
                        <Input
                          id={`onboarding-${field.key}`}
                          placeholder={field.placeholder}
                          value={socials[field.key as keyof typeof socials]}
                          onChange={(e) => setSocials({ ...socials, [field.key]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 flex items-center gap-2 text-[11px] font-medium text-text-secondary">
                    <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {socialLinksCount} {socialLinksCount === 1 ? "link" : "links"} ready — you can
                    skip and add them later.
                  </p>
                </div>
              )}

              {/* STEP 6: TEMPLATE */}
              {currentStep === 6 && (
                <div className="panel p-5 sm:p-7">
                  <StepHeading
                    step={6}
                    title="Select your design template"
                    description="Choose a starting look. Colours, buttons and layout can be customised later in the appearance studio."
                  />

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {templatePresets.map((tpl) => {
                      const isSelected = selectedTemplate === tpl.slug;
                      return (
                        <button
                          key={tpl.slug}
                          type="button"
                          onClick={() => setSelectedTemplate(tpl.slug)}
                          className={cn(
                            "group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 p-3 text-left transition-all duration-200 ease-out-soft active:scale-[0.98]",
                            isSelected
                              ? "border-emerald-500 shadow-glow-sm"
                              : "border-border/70 hover:border-border"
                          )}
                          style={{ backgroundColor: tpl.bg }}
                        >
                          <div className="mb-3 flex h-16 w-full items-center justify-center rounded-xl border border-white/10 opacity-90">
                            <div
                              className="h-6 w-20 rounded-md shadow-sm"
                              style={{ backgroundColor: tpl.color }}
                            />
                          </div>
                          <div className="w-full">
                            <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-white">
                              <span className="truncate">{tpl.name}</span>
                              {isSelected && (
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-400">{tpl.category}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-[11px] text-text-secondary">
                    <LayoutTemplate className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Selected:{" "}
                    <span className="font-semibold text-foreground">{activeTemplate?.name}</span>
                  </div>
                </div>
              )}

              {/* STEP 7: PREVIEW & PUBLISH */}
              {currentStep === 7 && (
                <div className="panel p-5 sm:p-7">
                  <div className="text-center">
                    <StepHeading
                      step={7}
                      title="Preview your BioSpace profile"
                      description="This is exactly what your mobile audience will see. Publish when you are happy."
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/50 px-3 py-1.5 text-[11px] font-semibold text-text-secondary">
                      <AtSign className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      biospace.com/{username || "yourname"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/50 px-3 py-1.5 text-[11px] font-semibold text-text-secondary">
                      <LayoutTemplate className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                      {activeTemplate?.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/50 px-3 py-1.5 text-[11px] font-semibold text-text-secondary">
                      <Link2 className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                      {socialLinksCount} links
                    </span>
                  </div>

                  <div className="mt-7 flex justify-center">
                    <PhoneMockup
                      displayName={displayName || username || "Alex Rivera"}
                      username={username || "creator"}
                      bio={bio || "Welcome to my BioSpace! Tap any link below to explore my projects."}
                      avatarUrl={avatarUrl}
                      links={[
                        { id: "1", title: "YouTube Channel", url: socials.youtube || "https://youtube.com", icon: "youtube" },
                        { id: "2", title: "Instagram Feed", url: socials.instagram || "https://instagram.com", icon: "instagram" },
                        { id: "3", title: "GitHub Projects", url: socials.github || "https://github.com", icon: "github" },
                        { id: "4", title: "Follow on X", url: socials.twitter || "https://x.com", icon: "twitter" },
                      ]}
                    />
                  </div>

                  <div className="mt-7 flex justify-center">
                    <Button
                      size="lg"
                      onClick={handlePublish}
                      isLoading={isSubmitting}
                      className="rounded-2xl px-10 font-bold"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Publish BioSpace profile</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 8: SUCCESS */}
              {currentStep === 8 && (
                <div className="panel relative overflow-hidden p-6 text-center sm:p-10">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl"
                  />

                  <div className="relative space-y-6">
                    <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-emerald-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_24px_50px_-20px_rgba(16,185,129,0.8)]">
                      <PartyPopper className="h-9 w-9" />
                    </span>

                    <div className="space-y-2.5">
                      <Badge variant="pro" className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">
                        Live & published
                      </Badge>
                      <h2 className="font-heading text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-4xl">
                        Your BioSpace is live
                      </h2>
                      <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-text-secondary sm:text-sm">
                        Congratulations! Anyone can now visit your public profile at:
                      </p>
                      <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.08] px-5 py-2.5 font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        <span className="truncate">biospace.com/{username || "shahuztech"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                      <a
                        href={`/${username || "shahuztech"}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto"
                      >
                        <Button variant="outline" size="lg" className="w-full rounded-2xl font-semibold">
                          <Eye className="h-4 w-4" />
                          <span>View public page</span>
                        </Button>
                      </a>
                      <Button
                        size="lg"
                        onClick={() => router.push("/dashboard")}
                        className="w-full rounded-2xl font-bold sm:w-auto"
                      >
                        <span>Go to studio</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-[11px] text-text-secondary">
                      Tip: add more links, generate an AI bio or install a custom domain from your
                      studio.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer nav */}
            {currentStep > 1 && currentStep < 8 && (
              <div className="mt-5 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isSubmitting}
                  className="rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>

                {currentStep < 7 ? (
                  <Button onClick={handleNext} disabled={isSubmitting} className="rounded-xl px-6 font-semibold">
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handlePublish}
                    isLoading={isSubmitting}
                    className="rounded-xl px-6 font-semibold"
                  >
                    <span>Publish profile</span>
                    <Sparkles className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
