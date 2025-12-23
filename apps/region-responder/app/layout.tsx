import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "@workspace/ui/globals.css";
import { AppProviders } from "@/providers/AppProviders";
import RegisterServiceWorker from "./components/register-sw";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { BottomNav } from "@/components/nav/BottomNav";
import { PrefetchRoutes } from "./components/prefetch-routes";
import { CacheDynamicRoutes } from "./components/cache-dynamic-routes";
import { OfflineBanner } from "./components/offline-banner";

// Ensure layout and session are always computed per-request in production
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// ---------- Metadata ----------
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://region.example.org"
  ),
  title: {
    default: `ART Region ${process.env.NEXT_PUBLIC_BRAND_NAME}`,
    template: "%s · ART Region ${process.env.NEXT_PUBLIC_BRAND_NAME}",
  },
  description:
    "Regional dispatch operations template: pods, shifts, onboarding, and trust list—siloed per-region with metadata-only uplinks.",
  applicationName: `ART Dispatch — ${process.env.NEXT_PUBLIC_BRAND_NAME}`,
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
    siteName: `ART. Region ${process.env.NEXT_PUBLIC_BRAND_NAME}`,
    title: `ART. Region ${process.env.NEXT_PUBLIC_BRAND_NAME}`,
    description: "Siloed regional operations with cross‑region metadata only.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `ART. Region ${process.env.NEXT_PUBLIC_BRAND_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `ART. Region ${process.env.NEXT_PUBLIC_BRAND_NAME}`,
    description: "Siloed regional operations with cross‑region metadata only.",
    images: ["/og.png"],
    creator: "@alwaysreadytools",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { url: "/maskable-icon-192.png", type: "image/png", sizes: "192x192", rel: "mask-icon" },
      { url: "/maskable-icon-512.png", type: "image/png", sizes: "512x512", rel: "mask-icon" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
      { url: "/icon-192.png", sizes: "192x192" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.json",
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
const fontVars = {
  ["--font-sans" as const]: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  ["--font-mono" as const]:
    "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
} as React.CSSProperties;

// ---------- Layout ----------
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={fontVars}
        className="font-sans antialiased"
      >
        <AppProviders>
          <RegisterServiceWorker />
          <PrefetchRoutes />
          <CacheDynamicRoutes />
          <OfflineBanner />
          <InstallPrompt />
          <div className="px-3 pt-3 pb-24 space-y-4 mx-auto">{children}</div>
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
