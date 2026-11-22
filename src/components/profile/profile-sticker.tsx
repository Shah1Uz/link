"use client";

import React from "react";
import { renderStickerById } from "@/components/shared/sticker-art";

interface ProfileStickerProps {
  theme?: any;
  inPreview?: boolean;
  positionMode?: "fixed" | "inline";
}

export function ProfileSticker({
  theme,
  inPreview = false,
  positionMode = "fixed",
}: ProfileStickerProps) {
  if (!theme?.stickersEnabled) return null;

  const stickerId = theme.stickerId || "big_sale";
  const stickerUrl = theme.stickerUrl || null;
  const position = theme.stickerPosition || "top-right";
  const animation = theme.stickerAnimation || "float";
  const sizeKey = theme.stickerSize || "medium";
  const rotation = theme.stickerRotation || "-6deg";
  const link = theme.stickerLink || null;

  // Size mapping
  const px = inPreview
    ? sizeKey === "small"
      ? 40
      : sizeKey === "large"
      ? 64
      : 50
    : sizeKey === "small"
    ? 56
    : sizeKey === "large"
    ? 96
    : 76;

  // Position placement
  let posClass = "";
  let posStyle: React.CSSProperties = {};

  const posX = theme.stickerPosX !== undefined && theme.stickerPosX !== null ? Number(theme.stickerPosX) : 85;
  const posY = theme.stickerPosY !== undefined && theme.stickerPosY !== null ? Number(theme.stickerPosY) : 12;

  if (position === "custom") {
    const posType = inPreview ? "absolute" : "fixed";
    posClass = `${posType} z-40`;
    posStyle = {
      left: `${posX}%`,
      top: `${posY}%`,
      transform: `translate(-50%, -50%)`,
    };
  } else if (positionMode === "fixed") {
    const posType = inPreview ? "absolute" : "fixed";
    switch (position) {
      case "top-left":
        posClass = `${posType} top-4 left-4 z-40`;
        break;
      case "top-right":
        posClass = `${posType} top-4 right-4 z-40`;
        break;
      case "bottom-left":
        posClass = `${posType} bottom-6 left-4 z-40`;
        break;
      case "bottom-right":
        posClass = `${posType} bottom-6 right-4 z-40`;
        break;
      case "avatar":
        posClass = "absolute -top-3 -right-3 z-30 pointer-events-auto";
        break;
      case "above-links":
        posClass = "mx-auto mb-4 flex justify-center z-20";
        break;
      default:
        posClass = `${posType} top-4 right-4 z-40`;
    }
  }

  // Animation style
  let animClass = "";
  switch (animation) {
    case "float":
      animClass = "animate-[bounce_3s_infinite]";
      break;
    case "pulse":
      animClass = "animate-pulse";
      break;
    case "bounce":
      animClass = "animate-bounce";
      break;
    case "wiggle":
      animClass = "hover:rotate-12 transition-transform";
      break;
    default:
      animClass = "";
  }

  const content = (
    <div
      className={`select-none transition-transform duration-300 hover:scale-110 active:scale-95 ${animClass}`}
      style={{
        transform: `rotate(${rotation})`,
      }}
      title={link ? `Havola: ${link}` : "BioSpace Sticker"}
    >
      {renderStickerById(stickerId, stickerUrl, px)}
    </div>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={posStyle}
        className={`${posClass} pointer-events-auto inline-block cursor-pointer focus:outline-none`}
        aria-label="Creator Sticker Link"
      >
        {content}
      </a>
    );
  }

  return (
    <div style={posStyle} className={`${posClass} pointer-events-auto inline-block`}>
      {content}
    </div>
  );
}
