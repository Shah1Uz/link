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
  Layers,
  Palette,
  Eye,
  Rocket,
  Compass,
  Code,
  Brush,
  Briefcase,
  Music,
  Video,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneMockup } from "@/components/marketing/phone-mockup";
import { AvatarUploader } from "@/components/shared/avatar-uploader";
import { PlatformIcon } from "@/components/shared/platform-icon";
import confetti from "canvas-confetti";
import { toast } from "sonner";

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

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [usernameMessage, setUsernameMessage] = useState("");

  const [category, setCategory] = useState("CREATOR");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(avatarPresets[0]);

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="font-bold text-lg text-zinc-900 dark:text-white">BioSpace Onboarding</span>
        </div>
        <div className="text-xs font-semibold text-zinc-500">
          Step {currentStep} of 8
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto w-full my-4">
        <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Content Area */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center py-8">
        {/* STEP 1: WELCOME */}
        {currentStep === 1 && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-sm">
              <Rocket className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white">
                Welcome to BioSpace
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto text-sm sm:text-base">
                Let&apos;s build your custom public profile in less than two minutes. Claim your URL, pick your aesthetic, and connect your audience.
              </p>
            </div>
            <div className="pt-4">
              <Button size="lg" onClick={handleNext} className="rounded-2xl px-8 font-semibold">
                <span>Let&apos;s Get Started</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE USERNAME */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                Choose your unique BioSpace URL
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                This will be your permanent public link: biospace.com/yourname
              </p>
            </div>

            <Card className="p-6">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Desired Username
              </label>
              <div className="flex items-center rounded-2xl border-2 border-zinc-200 bg-white p-2 focus-within:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
                <span className="pl-3 text-sm font-semibold text-zinc-400 select-none">
                  biospace.com/
                </span>
                <input
                  type="text"
                  placeholder="yourname"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                  }
                  className="w-full bg-transparent px-2 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Status Indicator */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                {usernameStatus === "checking" && (
                  <span className="text-zinc-400">Checking availability...</span>
                )}
                {usernameStatus === "valid" && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{usernameMessage}</span>
                  </span>
                )}
                {usernameStatus === "invalid" && (
                  <span className="flex items-center gap-1 text-red-500 font-semibold">
                    <AlertCircle className="h-4 w-4" />
                    <span>{usernameMessage}</span>
                  </span>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* STEP 3: CATEGORY */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                What best describes you?
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                This helps us recommend the best layouts and features for your profile.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-emerald-500 text-black"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">
                        {cat.label}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {cat.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: PROFILE IMAGE & DISPLAY NAME */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                Personalize your profile
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Choose an avatar and write a short biography for your visitors.
              </p>
            </div>

            <Card className="p-6 space-y-6">
              {/* Avatar Selector & Direct Device Upload */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Profile Avatar / Profil Rasmi
                </label>
                <AvatarUploader
                  currentUrl={avatarUrl}
                  onUploadSuccess={(url) => setAvatarUrl(url)}
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Display Name
                </label>
                <Input
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Short Biography
                </label>
                <Textarea
                  placeholder="What are you building or creating?"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>
            </Card>
          </div>
        )}

        {/* STEP 5: ADD SOCIAL LINKS */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                Add your social media links
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                You can add more links and reorder them anytime from your dashboard.
              </p>
            </div>

            <Card className="p-6 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  <PlatformIcon platform="youtube" size={16} />
                  <span>YouTube Channel URL</span>
                </label>
                <Input
                  placeholder="https://youtube.com/@yourchannel"
                  value={socials.youtube}
                  onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  <PlatformIcon platform="instagram" size={16} />
                  <span>Instagram Profile URL</span>
                </label>
                <Input
                  placeholder="https://instagram.com/yourhandle"
                  value={socials.instagram}
                  onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  <PlatformIcon platform="twitter" size={16} />
                  <span>X / Twitter URL</span>
                </label>
                <Input
                  placeholder="https://x.com/yourhandle"
                  value={socials.twitter}
                  onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  <PlatformIcon platform="github" size={16} />
                  <span>GitHub Profile URL</span>
                </label>
                <Input
                  placeholder="https://github.com/yourhandle"
                  value={socials.github}
                  onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  <PlatformIcon platform="telegram" size={16} />
                  <span>Telegram Channel URL</span>
                </label>
                <Input
                  placeholder="https://t.me/yourchannel"
                  value={socials.telegram}
                  onChange={(e) => setSocials({ ...socials, telegram: e.target.value })}
                />
              </div>
            </Card>
          </div>
        )}

        {/* STEP 6: SELECT DESIGN TEMPLATE */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                Select your design template
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Choose a visual theme. You can customize colors, buttons, and layouts later.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {templatePresets.map((tpl) => {
                const isSelected = selectedTemplate === tpl.slug;
                return (
                  <div
                    key={tpl.slug}
                    onClick={() => setSelectedTemplate(tpl.slug)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                    style={{ backgroundColor: tpl.bg }}
                  >
                    <div className="h-16 w-full rounded-xl flex items-center justify-center mb-3 opacity-90 border border-white/10">
                      <div
                        className="h-6 w-20 rounded-md shadow-sm"
                        style={{ backgroundColor: tpl.color }}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{tpl.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-[10px] text-zinc-400">{tpl.category}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: PREVIEW PROFILE */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in text-center">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                Preview your BioSpace profile
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                This is exactly what your mobile audience will experience.
              </p>
            </div>

            <div className="py-2">
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

            <div className="pt-2">
              <Button
                size="lg"
                onClick={handlePublish}
                isLoading={isSubmitting}
                className="rounded-2xl px-10 font-bold bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Publish BioSpace Profile</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 8: PUBLISHED SUCCESS */}
        {currentStep === 8 && (
          <div className="text-center space-y-6 animate-in zoom-in-95">
            <div className="h-20 w-20 rounded-3xl bg-emerald-500 text-black mx-auto flex items-center justify-center shadow-xl">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <Badge variant="pro" className="px-3 py-1 font-bold">LIVE & PUBLISHED</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white">
                Your BioSpace is Live!
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-sm mx-auto">
                Congratulations! Anyone can now visit your public profile at:
              </p>
              <div className="inline-block rounded-2xl bg-zinc-100 dark:bg-zinc-800 px-5 py-2.5 font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                biospace.com/{username || "shahuztech"}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`/${username || "shahuztech"}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="lg" className="w-full rounded-2xl font-semibold">
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View Public Page</span>
                </Button>
              </a>
              <Button
                size="lg"
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto rounded-2xl font-semibold"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Step Navigation Bar */}
      {currentStep > 1 && currentStep < 8 && (
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span>Back</span>
          </Button>

          {currentStep < 7 ? (
            <Button onClick={handleNext} disabled={isSubmitting}>
              <span>Continue</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              isLoading={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
            >
              <span>Publish Profile</span>
              <Sparkles className="h-4 w-4 ml-1.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

