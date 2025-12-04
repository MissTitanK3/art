import { Geist, Geist_Mono } from "next/font/google";

import "@workspace/ui/globals.css";
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
    <html
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth overflow-x-hidden"
    >
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased px-3 snap-y snap-mandatory overflow-x-hidden`}
      >
        <Providers>
          <div className="px-3 pt-2">
            {children}
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
