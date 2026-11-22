import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFAF6" },
    { media: "(prefers-color-scheme: dark)", color: "#07080C" },
  ],
};

export const metadata: Metadata = {
  title: "BioSpace — Everything you are, in one link",
  description:
    "The premium Link-in-Bio SaaS platform for creators, influencers, and brands. Beautiful customizable landing pages, real-time analytics, and advanced creator tools.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "BioSpace — Everything you are, in one link",
    description: "Connect your audience to everything you create with a single, high-converting bio link.",
    url: "https://biospace.com",
    siteName: "BioSpace",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BioSpace — Everything you are, in one link",
    description: "The next-generation Link-in-Bio SaaS platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#10b981",
          colorBackground: "#18181b",
          colorInputBackground: "#27272a",
          colorText: "#ffffff",
          colorTextSecondary: "#a1a1aa",
          borderRadius: "0.875rem",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className="scroll-smooth">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik+Bubbles&family=Modak&family=Shrikhand&family=Righteous&family=Bungee&family=Fugaz+One&family=Permanent+Marker&family=Press+Start+2P&family=Creepster&display=swap" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne&family=Syncopate&family=Audiowide&family=Orbitron&family=Michroma&family=Chakra+Petch&family=Space+Grotesk&display=swap" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display&family=Cinzel&family=Cinzel+Decorative&family=Bodoni+Moda&family=Cormorant+Garamond&family=DM+Serif+Display&family=Corben&display=swap" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pacifico&family=Caveat&family=Dancing+Script&family=Great+Vibes&family=Satisfy&display=swap" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit&family=Manrope&family=Montserrat&family=DM+Sans&family=Poppins&display=swap" />
        </head>
        <body className={`${inter.variable} ${plusJakarta.variable} min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background font-sans text-foreground antialiased`}>
          <ThemeProvider>
            <I18nProvider>
              {children}
              <Toaster position="top-right" richColors />
            </I18nProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

