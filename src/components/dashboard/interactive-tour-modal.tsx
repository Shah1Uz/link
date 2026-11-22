"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Link2,
  Palette,
  Type,
  Smile,
  Music,
  Smartphone,
  ShoppingBag,
  Share2,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOUR_STORAGE_KEY, openPlatformTour } from "@/lib/tour-bus";
import { useI18n } from "@/components/i18n-provider";

export { TOUR_STORAGE_KEY, openPlatformTour };

const STEP_CONFIG = [
  { icon: Sparkles, gradient: "from-emerald-500 via-teal-500 to-cyan-500", actionHref: "/dashboard/bio" },
  { icon: Link2, gradient: "from-blue-500 via-indigo-500 to-violet-500", actionHref: "/dashboard/links" },
  { icon: Palette, gradient: "from-pink-500 via-rose-500 to-amber-500", actionHref: "/dashboard/appearance" },
  { icon: Type, gradient: "from-amber-500 via-orange-500 to-red-500", actionHref: "/dashboard/appearance" },
  { icon: Smile, gradient: "from-yellow-400 via-amber-500 to-orange-500", actionHref: "/dashboard/appearance" },
  { icon: Music, gradient: "from-emerald-400 via-green-500 to-teal-500", actionHref: "/dashboard/music" },
  { icon: Smartphone, gradient: "from-violet-500 via-purple-500 to-fuchsia-500", actionHref: undefined },
  { icon: ShoppingBag, gradient: "from-teal-500 via-cyan-500 to-blue-500", actionHref: "/dashboard/analytics" },
  { icon: Share2, gradient: "from-emerald-500 via-teal-400 to-cyan-500", actionHref: "/dashboard" },
];

export function InteractiveTourModal() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const tourSteps = t.tour.steps.map((s, idx) => ({
    ...s,
    actionLabel: ("actionLabel" in s ? s.actionLabel : undefined) as string | undefined,
    icon: STEP_CONFIG[idx]?.icon || Sparkles,
    gradient: STEP_CONFIG[idx]?.gradient || "from-emerald-500 via-teal-500 to-cyan-500",
    actionHref: STEP_CONFIG[idx]?.actionHref,
  }));

  useEffect(() => {
    // Check if user already dismissed the tour
    const hasSeen = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!hasSeen) {
      // Auto-trigger on first dashboard entrance after 900ms
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for global open event
  useEffect(() => {
    const handleOpen = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener("open-biospace-tour", handleOpen);
    return () => window.removeEventListener("open-biospace-tour", handleOpen);
  }, []);

  const closeTour = () => {
    setIsOpen(false);
    if (dontShowAgain) {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
      closeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep] || tourSteps[0];
  const Icon = step.icon;
  const progressPercent = Math.round(((currentStep + 1) / tourSteps.length) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-3xl border border-border/80 bg-popover/95 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5 bg-surface/40">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} text-white shadow-sm`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {step.badge}
              </span>
              <span className="text-xs text-text-secondary ml-2 font-medium">
                ({currentStep + 1} / {tourSteps.length})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeTour}
              aria-label={t.common.close}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 bg-surface/60 text-text-secondary hover:text-foreground hover:bg-foreground/[0.05] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Top Progress Line */}
        <div className="w-full bg-border/40 h-1">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Visual Showcase Card */}
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-surface/80 to-surface/30 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              <div className={`relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-lg`}>
                <Icon className="h-10 w-10 sm:h-12 sm:w-12 animate-pulse" />
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-emerald-500 text-[10px] font-bold text-foreground">
                  {currentStep + 1}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {step.subtitle}
                </p>
                <p className="mt-2 text-xs sm:text-[13px] text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Feature Bullets */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-border/50">
              {step.features.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded-xl bg-background/60 p-2.5 text-xs text-foreground/90 border border-border/40"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick jump step dots */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {tourSteps.map((s, idx) => {
              const active = idx === currentStep;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 transition-all rounded-full cursor-pointer ${
                    active ? "w-8 bg-emerald-500" : "w-2 bg-border hover:bg-text-secondary/50"
                  }`}
                  title={`${t.tour.stepPrefix} ${idx + 1}: ${s.title}`}
                />
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 p-4 sm:px-6 bg-surface/40">
          {/* Left: Don't show again toggle */}
          <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer hover:text-foreground transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border text-emerald-600 focus:ring-emerald-500"
            />
            <span>{t.tour.dontShowAgain}</span>
          </label>

          {/* Right Navigation Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="gap-1.5 rounded-xl text-xs font-semibold"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>{t.common.back}</span>
              </Button>
            )}

            {step.actionHref && (
              <Link
                href={step.actionHref}
                onClick={closeTour}
                className="hidden sm:inline-flex"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 rounded-xl text-xs font-semibold border border-border"
                >
                  <span>{step.actionLabel || t.sidebar.items.overview}</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1.5 rounded-xl text-xs font-semibold px-4 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer"
            >
              <span>{currentStep === tourSteps.length - 1 ? t.common.finish : t.common.next}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveTourModal;
