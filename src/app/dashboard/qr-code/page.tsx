"use client";

import React, { useState, useEffect, useRef } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/context/dashboard-context";
import QRCode from "qrcode";
import {
  QrCode,
  Download,
  Share2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

export default function QRCodeStudioPage() {
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
        title="QR Code Generator Studio"
        description="Create customized vector and PNG QR codes pointing directly to your BioSpace public page."
      />

      <div className="p-4 sm:p-8 max-w-4xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: QR Code Canvas Preview & Downloads */}
          <div className="md:col-span-5 flex flex-col items-center">
            <Card className="p-8 flex flex-col items-center justify-center text-center w-full max-w-sm shadow-md">
              <div
                className="p-5 rounded-3xl border border-zinc-200/80 shadow-inner flex items-center justify-center mb-6"
                style={{ backgroundColor }}
              >
                {qrPngUrl ? (
                  <img
                    src={qrPngUrl}
                    alt={`QR Code for ${username}`}
                    className="w-56 h-56 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-zinc-400">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="space-y-1 mb-6">
                <h4 className="font-bold text-base text-zinc-900 dark:text-white">
                  @{username}
                </h4>
                <p className="text-xs text-zinc-500 font-mono truncate max-w-[240px]">
                  {publicUrl}
                </p>
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button
                  onClick={handleDownloadPNG}
                  className="rounded-xl font-semibold gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>PNG (800px)</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadSVG}
                  className="rounded-xl font-semibold gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>SVG (Vector)</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="md:col-span-7 space-y-6">
            <Card className="p-6 space-y-5">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Palette className="h-4 w-4 text-emerald-500" />
                <span>Customize Colors</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Foreground Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="h-9 w-9 rounded-lg border border-zinc-200 cursor-pointer p-0"
                    />
                    <Input
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-9 w-9 rounded-lg border border-zinc-200 cursor-pointer p-0"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Preset Colors */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  Popular Creator Presets
                </label>
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
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-semibold hover:border-emerald-500 transition-colors flex items-center gap-1.5"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: p.fg }}
                      />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-3 bg-zinc-50 dark:bg-zinc-900/50">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span>Tips for Offline Promotion</span>
              </h4>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>Print this QR code on business cards, festival flyers, and product packaging.</li>
                <li>Add it to the final slide of your conference keynote presentations.</li>
                <li>Download in SVG for crisp scaling on huge billboard or banner prints.</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

