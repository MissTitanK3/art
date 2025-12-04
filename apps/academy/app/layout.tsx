import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";

import "@workspace/ui/globals.css";
import "./print.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@workspace/ui/primitives/sonner";

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
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col academy-print`}
      >
        <Providers>
          <div className="flex-1 flex flex-col">
            {children}
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "ART Academy",
  description: "Learn, train, and certify with the ART Academy.",
  applicationName: "ART Academy",
  openGraph: {
    title: "ART Academy",
    description: "Learn, train, and certify with the ART Academy.",
  },
  twitter: {
    title: "ART Academy",
    description: "Learn, train, and certify with the ART Academy.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
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
