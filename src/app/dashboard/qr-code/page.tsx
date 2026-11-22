"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import QRCode from "qrcode";
import {
  Download,
  Sparkles,
  Palette,
  ScanLine,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function QRCodeStudioPage() {
  const { t } = useI18n();
  const { profile } = useDashboard();
  const username = profile?.username || "creator";
  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${username}`
    : `https://biospace.com/${username}`;

  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [qrPngUrl, setQrPngUrl] = useState<string>("");
  const [qrSvgString, setQrSvgString] = useState<string>("");

  useEffect(() => {
    async function generateQRCodes() {
      try {
        // Generate PNG data URL (high resolution 800px)
        const png = await QRCode.toDataURL(publicUrl, {
          width: 800,
          margin: 2,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
        });
        setQrPngUrl(png);

        // Generate SVG string
        const svg = await QRCode.toString(publicUrl, {
          type: "svg",
          margin: 2,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
        });
        setQrSvgString(svg);
      } catch (err) {
        console.error("Failed to generate QR code:", err);
      }
    }
    generateQRCodes();
  }, [publicUrl, foregroundColor, backgroundColor]);

  const handleDownloadPNG = () => {
    if (!qrPngUrl) return;
    const a = document.createElement("a");
    a.href = qrPngUrl;
    a.download = `biospace-qr-${username}.png`;
    a.click();
    toast.success("Downloaded high-res PNG!");
  };

  const handleDownloadSVG = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `biospace-qr-${username}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded scalable vector SVG!");
  };

  return (
    <div>
      <DashboardHeader
        title={t.qrStudio.title}
        description={t.qrStudio.description}
      />

      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
          {/* Preview + download */}
          <div className="md:col-span-5">
            <Card className="flex flex-col items-center p-6 text-center sm:p-7">
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <ScanLine className="h-3 w-3" />
                Scannable
              </span>

              <div
                className="mb-6 flex items-center justify-center rounded-3xl border border-border/70 p-4 shadow-inner"
                style={{ backgroundColor }}
              >
                {qrPngUrl ? (
                  <img
                    src={qrPngUrl}
                    alt={`QR code for ${username}`}
                    className="h-52 w-52 rounded-xl object-contain sm:h-56 sm:w-56"
                  />
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center text-xs text-text-secondary sm:h-56 sm:w-56">
                    Generating QR…
                  </div>
                )}
              </div>

              <div className="mb-6 space-y-1">
                <h4 className="font-heading text-base font-extrabold tracking-[-0.02em] text-foreground">
                  @{username}
                </h4>
                <p className="max-w-[240px] truncate font-mono text-[11px] text-text-secondary">
                  {publicUrl}
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-2.5">
                <Button onClick={handleDownloadPNG} className="gap-1.5 rounded-xl text-xs font-semibold">
                  <Download className="h-4 w-4" />
                  <span>PNG</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadSVG}
                  className="gap-1.5 rounded-xl text-xs font-semibold"
                >
                  <Download className="h-4 w-4" />
                  <span>SVG</span>
                </Button>
              </div>
              <p className="mt-2.5 text-[10px] text-text-secondary">
                800px raster · infinitely scalable vector
              </p>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-6 md:col-span-7">
            <Card className="p-0">
              <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400">
                  <Palette className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                    Customise colours
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Keep strong contrast for reliable scanning.
                  </p>
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="qr-fg">Foreground colour</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="qr-fg"
                        type="color"
                        value={foregroundColor}
                        onChange={(e) => setForegroundColor(e.target.value)}
                        aria-label="Foreground colour"
                        className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-border/80 bg-background p-0.5"
                      />
                      <Input
                        value={foregroundColor}
                        onChange={(e) => setForegroundColor(e.target.value)}
                        className="font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="qr-bg">Background colour</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="qr-bg"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        aria-label="Background colour"
                        className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-border/80 bg-background p-0.5"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Popular creator presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { fg: "#000000", bg: "#ffffff", label: "Classic B&W" },
                      { fg: "#042f2e", bg: "#10b981", label: "Emerald Glow" },
                      { fg: "#1e1b4b", bg: "#818cf8", label: "Indigo" },
                      { fg: "#7c2d12", bg: "#fed7aa", label: "Amber Sunset" },
                      { fg: "#0a192f", bg: "#64ffda", label: "Tech Cyan" },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setForegroundColor(p.fg);
                          setBackgroundColor(p.bg);
                        }}
                        className="flex items-center gap-1.5 rounded-full border border-border/80 bg-surface/40 px-3 py-1.5 text-[11px] font-semibold text-text-secondary transition-all hover:border-emerald-500/40 hover:text-foreground active:scale-95"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-border/60"
                          style={{ backgroundColor: p.fg }}
                        />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-0">
              <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/25 bg-gradient-to-b from-cyan-500/15 to-cyan-500/[0.04] text-cyan-600 dark:text-cyan-400">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                    Tips for offline promotion
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Where this code works hardest.
                  </p>
                </div>
              </div>
              <ul className="space-y-2.5 p-5 text-xs leading-relaxed text-text-secondary sm:p-6">
                {[
                  "Print it on business cards, festival flyers and product packaging.",
                  "Add it to the final slide of your keynote presentations.",
                  "Use the SVG export for crisp billboard or banner prints.",
                  "Pair it with a short call-to-action: “Scan to see every link”.",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border/70 px-5 py-3.5">
                <a
                  href={`/${username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 transition-colors hover:text-emerald-600 dark:text-emerald-400"
                >
                  <span>Test your live page</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
