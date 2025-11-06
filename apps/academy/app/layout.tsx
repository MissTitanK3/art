import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata } from 'next'

import "@workspace/ui/globals.css"
import "./print.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@workspace/ui/components/sonner"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
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
  )
}

export const metadata: Metadata = {
  title: 'ART Academy',
  description: 'Learn, train, and certify with the ART Academy.',
  openGraph: {
    title: 'ART Academy',
    description: 'Learn, train, and certify with the ART Academy.',
  },
  twitter: {
    title: 'ART Academy',
    description: 'Learn, train, and certify with the ART Academy.',
  },
};
