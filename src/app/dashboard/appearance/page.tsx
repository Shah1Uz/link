"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/context/dashboard-context";
import {
  Palette,
  Sparkles,
  Save,
  Check,
  Type,
  Square,
  Circle,
  Eye,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";

const presetGradients = [
  { name: "Creator Horizon", value: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #064e3b 100%)" },
  { name: "Cyber Violet", value: "radial-gradient(ellipse at top, #3b0764 0%, #0b0b14 70%)" },
  { name: "Executive Navy", value: "linear-gradient(180deg, #0a192f 0%, #020c1b 100%)" },
  { name: "Sunset Amber", value: "linear-gradient(180deg, #ffedd5 0%, #fff7ed 60%, #fed7aa 100%)" },
  { name: "Rose Velvet", value: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)" },
  { name: "Electric Indigo", value: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)" },
  { name: "Monochrome Stealth", value: "linear-gradient(180deg, #18181b 0%, #09090b 100%)" },
];

const buttonStyles = [
  { id: "rounded", label: "Rounded", radius: "16px" },
  { id: "pill", label: "Pill Full", radius: "9999px" },
  { id: "square", label: "Square Edge", radius: "4px" },
  { id: "shadow", label: "Drop Shadow", radius: "14px" },
  { id: "outlined", label: "Outlined Minimal", radius: "12px" },
  { id: "glass", label: "Frosted Glass", radius: "16px" },
  { id: "neon", label: "Neon Glow", radius: "9999px" },
];

const fontFamilies = [
  "Inter",
  "Plus Jakarta Sans",
  "Poppins",
  "Playfair Display",
  "Space Grotesk",
];

export default function AppearanceEditorPage() {
  const { theme, updateTheme, subscriptionTier } = useDashboard();

  const [backgroundColor, setBackgroundColor] = useState(theme?.backgroundColor || "#0d1117");
  const [backgroundType, setBackgroundType] = useState(theme?.backgroundType || "gradient");
  const [backgroundGradient, setBackgroundGradient] = useState(
    theme?.backgroundGradient || presetGradients[0].value
  );
  const [buttonStyle, setButtonStyle] = useState(theme?.buttonStyle || "filled");
  const [buttonColor, setButtonColor] = useState(theme?.buttonColor || "#10b981");
  const [buttonTextColor, setButtonTextColor] = useState(theme?.buttonTextColor || "#042f2e");
  const [buttonBorderColor, setButtonBorderColor] = useState(theme?.buttonBorderColor || "#34d399");
  const [buttonRadius, setButtonRadius] = useState(theme?.buttonRadius || "16px");
  const [fontHeading, setFontHeading] = useState(theme?.fontHeading || "Inter");
  const [textColor, setTextColor] = useState(theme?.textColor || "#ffffff");
  const [accentColor, setAccentColor] = useState(theme?.accentColor || "#10b981");
  const [animationsEnabled, setAnimationsEnabled] = useState(theme?.animationsEnabled ?? true);
  const [showBranding, setShowBranding] = useState(theme?.showBranding ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backgroundColor,
          backgroundType,
          backgroundGradient,
          buttonStyle,
          buttonColor,
          buttonTextColor,
          buttonBorderColor,
          buttonRadius,
          fontHeading,
          textColor,
          accentColor,
          animationsEnabled,
          showBranding,
        }),
      });

      if (!res.ok) throw new Error("Failed to save theme");
      toast.success("Theme settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update appearance");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <DashboardHeader
        title="Appearance & Theme Studio"
        description="Customize every visual element of your public profile with real-time preview."
        action={
          <Button
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            className="rounded-xl gap-1.5 text-xs font-semibold"
          >
            <Save className="h-4 w-4" />
            <span>Save Theme</span>
          </Button>
        }
      />

      <div className="p-4 sm:p-8 max-w-3xl space-y-8">
        {/* BACKGROUND SECTION */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-emerald-500" />
              <span>Background & Canvas</span>
            </h3>
            <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setBackgroundType("gradient");
                  updateTheme({ backgroundType: "gradient", backgroundGradient });
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  backgroundType === "gradient" ? "bg-white dark:bg-zinc-900 shadow-sm" : "text-zinc-500"
                }`}
              >
                Gradients
              </button>
              <button
                type="button"
                onClick={() => {
                  setBackgroundType("color");
                  updateTheme({ backgroundType: "color", backgroundColor });
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  backgroundType === "color" ? "bg-white dark:bg-zinc-900 shadow-sm" : "text-zinc-500"
                }`}
              >
                Solid Color
              </button>
            </div>
          </div>

          {backgroundType === "gradient" ? (
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                Preset Gradients
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {presetGradients.map((g) => {
                  const isSelected = backgroundGradient === g.value;
                  return (
                    <div
                      key={g.name}
                      onClick={() => {
                        setBackgroundGradient(g.value);
                        updateTheme({ backgroundGradient: g.value, backgroundType: "gradient" });
                      }}
                      className={`h-16 rounded-xl border-2 cursor-pointer p-2 flex items-end justify-between transition-all ${
                        isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-zinc-200 dark:border-zinc-800"
                      }`}
                      style={{ background: g.value }}
                    >
                      <span className="text-[10px] font-bold text-white drop-shadow-md">
                        {g.name}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Solid Color Hex
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      updateTheme({ backgroundColor: e.target.value, backgroundType: "color" });
                    }}
                    className="h-9 w-9 rounded-lg border border-zinc-200 cursor-pointer p-0"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      updateTheme({ backgroundColor: e.target.value, backgroundType: "color" });
                    }}
                    className="w-32 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* BUTTONS SECTION */}
        <Card className="p-6 space-y-5">
          <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-500" />
            <span>Button Style & Geometry</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {buttonStyles.map((b) => {
              const isSelected = buttonStyle === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => {
                    setButtonStyle(b.id);
                    setButtonRadius(b.radius);
                    updateTheme({ buttonStyle: b.id, buttonRadius: b.radius });
                  }}
                  className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <div
                    className="h-7 w-full border border-current rounded mb-1.5 opacity-80"
                    style={{ borderRadius: b.radius }}
                  />
                  <span className="text-xs">{b.label}</span>
                </div>
              );
            })}
          </div>

          {/* Button Color Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Button Fill Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={buttonColor}
                  onChange={(e) => {
                    setButtonColor(e.target.value);
                    updateTheme({ buttonColor: e.target.value });
                  }}
                  className="h-8 w-8 rounded-lg border border-zinc-200 cursor-pointer p-0"
                />
                <Input
                  value={buttonColor}
                  onChange={(e) => {
                    setButtonColor(e.target.value);
                    updateTheme({ buttonColor: e.target.value });
                  }}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Button Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={buttonTextColor}
                  onChange={(e) => {
                    setButtonTextColor(e.target.value);
                    updateTheme({ buttonTextColor: e.target.value });
                  }}
                  className="h-8 w-8 rounded-lg border border-zinc-200 cursor-pointer p-0"
                />
                <Input
                  value={buttonTextColor}
                  onChange={(e) => {
                    setButtonTextColor(e.target.value);
                    updateTheme({ buttonTextColor: e.target.value });
                  }}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Border & Ring Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={buttonBorderColor}
                  onChange={(e) => {
                    setButtonBorderColor(e.target.value);
                    updateTheme({ buttonBorderColor: e.target.value });
                  }}
                  className="h-8 w-8 rounded-lg border border-zinc-200 cursor-pointer p-0"
                />
                <Input
                  value={buttonBorderColor}
                  onChange={(e) => {
                    setButtonBorderColor(e.target.value);
                    updateTheme({ buttonBorderColor: e.target.value });
                  }}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* TYPOGRAPHY & TEXT COLORS */}
        <Card className="p-6 space-y-5">
          <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <Type className="h-4 w-4 text-emerald-500" />
            <span>Typography & Palette</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
              Font Family
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {fontFamilies.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setFontHeading(f);
                    updateTheme({ fontHeading: f, fontBody: f });
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    fontHeading === f
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Heading & Bio Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    updateTheme({ textColor: e.target.value });
                  }}
                  className="h-8 w-8 rounded-lg border border-zinc-200 cursor-pointer p-0"
                />
                <Input
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    updateTheme({ textColor: e.target.value });
                  }}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Accent Highlight Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => {
                    setAccentColor(e.target.value);
                    updateTheme({ accentColor: e.target.value });
                  }}
                  className="h-8 w-8 rounded-lg border border-zinc-200 cursor-pointer p-0"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => {
                    setAccentColor(e.target.value);
                    updateTheme({ accentColor: e.target.value });
                  }}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* BRANDING & ANIMATIONS */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                Smooth Entrance Animations
              </h4>
              <p className="text-xs text-zinc-500">
                Delicate fade and spring animations when visitors load your profile.
              </p>
            </div>
            <Switch
              checked={animationsEnabled}
              onCheckedChange={(val) => {
                setAnimationsEnabled(val);
                updateTheme({ animationsEnabled: val });
              }}
            />
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  BioSpace Branding Footer
                </h4>
                {subscriptionTier === "PRO" ? (
                  <Badge variant="pro">PRO ACTIVE</Badge>
                ) : (
                  <Badge variant="outline">PRO FEATURE</Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                Remove the &ldquo;Join on BioSpace&rdquo; footer tag on your public page.
              </p>
            </div>
            <Switch
              checked={showBranding}
              disabled={subscriptionTier !== "PRO"}
              onCheckedChange={(val) => {
                setShowBranding(val);
                updateTheme({ showBranding: val });
              }}
            />
          </div>
        </Card>

        {/* Sticky Save CTA */}
        <div className="flex justify-end pt-2">
          <Button
            size="lg"
            onClick={handleSave}
            isLoading={isSaving}
            className="rounded-2xl px-10 font-bold"
          >
            <Save className="h-4 w-4 mr-2" />
            <span>Save Appearance</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

