import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "@workspace/ui/globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import type { AuthSession } from "@/lib/auth/types";
import { GlobalNavBridge } from "@/components/nav/GlobalNavBridge";
import RegisterServiceWorker from "./components/register-sw";
import InstallPrompt from "@/components/pwa/InstallPrompt";

// Ensure layout and session are always computed per-request in production
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// ---------- Metadata ----------
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://region.example.org",
  ),
  title: {
    default: `ART Region PNW ${process.env.NEXT_PUBLIC_BRAND_NAME}`,
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
      { url: "/og.png", width: 1200, height: 630, alt: `ART. Region ${process.env.NEXT_PUBLIC_BRAND_NAME}` },
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
  // Build our AuthSession from Supabase server auth
  const supabase = await createSupabaseServerClient();
  const [{ data: supaUser }, { data: supaSession }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);

  const session: AuthSession | null =
    supaUser?.user && supaSession?.session
      ? {
        user: {
          id: supaUser.user.id,
          email: supaUser.user.email ?? "",
          // Prefer explicit metadata role, fallback to any server-provided role, else guest
          role: ((supaUser.user as any)?.user_metadata?.role ??
            (supaUser.user as any)?.role ??
            "guest") as any,
          fullName:
            (supaUser.user as any)?.user_metadata?.full_name ?? undefined,
          avatarUrl:
            (supaUser.user as any)?.user_metadata?.avatar_url ?? undefined,
          metadata: (supaUser.user as any)?.user_metadata ?? undefined,
        },
        accessToken: (supaSession.session as any)?.access_token ?? "",
        refreshToken:
          (supaSession.session as any)?.refresh_token ?? undefined,
        expiresAt: (supaSession.session as any)?.expires_at ?? null,
        provider: "supabase",
      }
      : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <AppProviders initialSession={session}>
          <RegisterServiceWorker />
          <InstallPrompt />
          <GlobalNavBridge />
          <div className="px-3 pt-3 space-y-4 mx-auto">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
