import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

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
    <ClerkProvider dynamic>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${plusJakarta.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}

