import { Geist, Geist_Mono } from "next/font/google";
import type { Viewport } from "next";
import "leaflet/dist/leaflet.css";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { NavbarGate } from "@/components/NavbarGate";
import { Toaster } from "@workspace/ui/primitives/sonner";
import { MissionsSyncAgent } from "@/components/MissionsSyncAgent";
import { AuthModalGate } from "@/components/AuthModalGate";
import { ProfileSyncAgent } from "@/components/ProfileSyncAgent";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased px-3`}
      >
        <Providers>
          <NavbarGate />
          <div className="px-3 pt-2">
            {children}
            <Toaster />
          </div>
          <MissionsSyncAgent />
          <ProfileSyncAgent />
          <AuthModalGate />
        </Providers>
      </body>
    </html>
  );
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
