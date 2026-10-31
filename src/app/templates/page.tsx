import React from "react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TemplatesGalleryPage() {
  const templates = await prisma.template.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { useCount: "desc" }],
  });

  const categories = [
    "All",
    "Minimal",
    "Creator",
    "Influencer",
    "Business",
    "Music",
    "Gaming",
    "Photography",
    "Portfolio",
    "Fashion",
    "Personal Brand",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <MarketingNavbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Badge variant="secondary" className="px-3 py-1 font-semibold">
              Designer Templates
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              20+ Handcrafted Themes
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
              Every template is pixel-perfect, mobile-optimized, and fully customizable. Switch anytime without re-entering your links.
            </p>
          </div>

          {/* Grid of Templates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((tpl) => {
              let styles = { backgroundColor: "#0f172a", textColor: "#fff", buttonColor: "#22c55e", buttonRadius: "12px", backgroundGradient: "" };
              try {
                styles = JSON.parse(tpl.stylesJson);
              } catch {}

              const bgStyle = styles.backgroundGradient
                ? { background: styles.backgroundGradient }
                : { backgroundColor: styles.backgroundColor || "#0f172a" };

              return (
                <div
                  key={tpl.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm hover:shadow-xl hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300"
                >
                  {/* Miniature rendered preview card */}
                  <div
                    className="relative h-60 w-full rounded-xl overflow-hidden p-4 flex flex-col items-center justify-between text-center select-none shadow-inner"
                    style={{ ...bgStyle, color: styles.textColor || "#fff" }}
                  >
                    {/* Top status */}
                    <div className="w-full flex justify-between items-center text-[10px] opacity-70">
                      <span className="font-semibold">{tpl.layout.toUpperCase()}</span>
                      {tpl.isPro && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[9px]">
                          PRO
                        </span>
                      )}
                    </div>

                    {/* Miniature Avatar & Name */}
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full border-2 border-white/30 bg-white/20 mb-1.5 flex items-center justify-center text-xs font-bold">
                        BIO
                      </div>
                      <div className="text-xs font-bold">{tpl.name}</div>
                      <div className="text-[10px] opacity-75">@{tpl.slug}</div>
                    </div>

                    {/* Miniature Links */}
                    <div className="w-full space-y-1.5 px-2">
                      <div
                        className="w-full py-1.5 text-[10px] font-semibold truncate rounded-md shadow-sm"
                        style={{
                          backgroundColor: styles.buttonColor || "#fff",
                          color: (styles as any).buttonTextColor || "#000",
                          borderRadius: styles.buttonRadius || "8px",
                        }}
                      >
                        Featured Work & Updates
                      </div>
                      <div
                        className="w-full py-1.5 text-[10px] font-semibold truncate rounded-md shadow-sm opacity-90"
                        style={{
                          backgroundColor: styles.buttonColor || "#fff",
                          color: (styles as any).buttonTextColor || "#000",
                          borderRadius: styles.buttonRadius || "8px",
                        }}
                      >
                        Follow My Journey
                      </div>
                    </div>
                  </div>

                  {/* Info below */}
                  <div className="pt-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                          {tpl.name}
                        </h3>
                        <Badge variant="outline" className="text-[10px]">
                          {tpl.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
                        {tpl.description}
                      </p>
                    </div>

                    <Link href={`/sign-up?template=${tpl.slug}`}>
                      <Button variant="default" size="sm" className="w-full rounded-xl group font-semibold">
                        <span>Use This Template</span>
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

