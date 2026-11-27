"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  title?: string;
}

const SIZE_MAP = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-[19px] w-[19px]",
  lg: "h-[22px] w-[22px]",
};

export function VerifiedBadge({
  size = "md",
  className,
  title = "Verified creator",
}: VerifiedBadgeProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/verified-badge.png"
      alt={title}
      title={title}
      className={cn(
        "inline-block shrink-0 select-none object-contain drop-shadow-[0_1px_4px_rgba(0,151,253,0.35)]",
        SIZE_MAP[size],
        className
      )}
    />
  );
}
