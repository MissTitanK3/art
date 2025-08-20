import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import 'leaflet/dist/leaflet.css'
import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@workspace/ui/components/sonner";
import { navConfig } from "@/nav.config";
import { GlobalNav } from "@/components/client/global-nav";
import type { NavRole } from "@workspace/ui/types/nav";

// ---------- Metadata ----------
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://region.example.org"),
  title: {
    default: "A.R.T. Region Template",
    template: "%s · A.R.T. Region Template",
  },
  description:
    "Regional dispatch operations template: pods, shifts, onboarding, and trust list—siloed per-region with metadata-only uplinks.",
  applicationName: "ICE Tea Dispatch — Region",
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
    siteName: "A.R.T. Region Template",
    title: "A.R.T. Region Template",
    description:
      "Siloed regional operations with cross‑region metadata only.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "A.R.T. Region Template" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "A.R.T. Region Template",
    description:
      "Siloed regional operations with cross‑region metadata only.",
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
};

// (Optional) nice address bar color
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

// ---------- Fonts ----------
const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

// ---------- Layout ----------
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // const role: NavRole = "regional_admin";
  const role: NavRole = "national_admin";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}>
        <Providers>
          <GlobalNav
            config={navConfig}
            role={role}
            rightSlot={<Toaster
              richColors
              closeButton
              position="top-right"
            />} />
          <div className="px-3 pt-3 space-y-4 max-w-5xl mx-auto">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
