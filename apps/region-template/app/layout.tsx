import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "@workspace/ui/globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { Toaster } from "@workspace/ui/components/sonner";
import { navConfig } from "@/nav.config";
import { GlobalNav } from "@/components/client/global-nav";
import { NavRole } from "@workspace/store/utils/nav";
import { getServerSession } from "@/lib/auth/server";
import { GlobalNavBridge } from "@/components/client/GlobalNavBridge";
import ServiceWorkerRegister from "@/components/client/ServiceWorkerRegister";
import InstallPrompt from "@/components/client/InstallPrompt";

// ---------- Metadata ----------
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://region.example.org",
  ),
  title: {
    default: "ART Region Template",
    template: "%s · ART Region Template",
  },
  description:
    "Regional dispatch operations template: pods, shifts, onboarding, and trust list—siloed per-region with metadata-only uplinks.",
  applicationName: "ART Dispatch — Region",
  keywords: [
    "dispatch",
    "regional",
    "pods",
    "shifts",
    "academy",
    "trust list",
    "Always Ready Tools",
  ],
  authors: [{ name: "Always Ready Tools" }],
  creator: "Always Ready Tools",
  publisher: "Always Ready Tools",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ART. Region Template",
    title: "ART. Region Template",
    description: "Siloed regional operations with cross‑region metadata only.",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "ART. Region Template" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ART. Region Template",
    description: "Siloed regional operations with cross‑region metadata only.",
    images: ["/og.png"],
    creator: "@alwaysreadytools",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
  },
};

// (Optional) nice address bar color
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(0.98 0.03 95)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.38 0.02 260)" },
  ],
};

// ---------- Fonts ----------
const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

// ---------- Layout ----------
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <AppProviders initialSession={session}>
          {/* Register service worker for PWA installability */}
          <ServiceWorkerRegister />
          <InstallPrompt />
          <GlobalNavBridge />
          <div className="px-3 pt-3 space-y-4 mx-auto">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
