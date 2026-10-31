import React from "react";
import {
  Globe,
  Mail,
  Phone,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Music,
  Twitch,
  MessageCircle,
  Share2,
} from "lucide-react";

interface PlatformIconProps {
  platform: string;
  className?: string;
  size?: number;
}

export function PlatformIcon({
  platform,
  className = "w-5 h-5",
  size = 20,
}: PlatformIconProps) {
  const p = platform.toLowerCase();

  switch (p) {
    case "youtube":
      return <Youtube size={size} className={className} />;
    case "github":
      return <Github size={size} className={className} />;
    case "twitter":
    case "x":
      return <Twitter size={size} className={className} />;
    case "instagram":
      return <Instagram size={size} className={className} />;
    case "linkedin":
      return <Linkedin size={size} className={className} />;
    case "twitch":
      return <Twitch size={size} className={className} />;
    case "email":
      return <Mail size={size} className={className} />;
    case "phone":
      return <Phone size={size} className={className} />;
    case "spotify":
    case "applemusic":
      return <Music size={size} className={className} />;
    case "telegram":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M21.5 2L2 9.5l7 3.5 3 7.5 3-4.5 5.5 3.5z" />
          <path d="M9 13l6-5" />
        </svg>
      );
    case "tiktok":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      );
    case "whatsapp":
      return <MessageCircle size={size} className={className} />;
    case "discord":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M18 6h0c-1.5-.7-3.2-1.1-5-1.1-1.8 0-3.5.4-5 1.1A19.8 19.8 0 0 0 4 18c2 .8 4 1.2 6 1.2a14.2 14.2 0 0 0 1.5-2.2 6.5 6.5 0 0 1-2.5-1.2c.2-.2.4-.3.6-.5 3.8 1.8 8 1.8 11.8 0 .2.2.4.3.6.5a6.5 6.5 0 0 1-2.5 1.2 14.2 14.2 0 0 0 1.5 2.2c2 0 4-.4 6-1.2A19.8 19.8 0 0 0 18 6z" />
          <path d="M9.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
          <path d="M14.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
        </svg>
      );
    default:
      return <Globe size={size} className={className} />;
  }
}

