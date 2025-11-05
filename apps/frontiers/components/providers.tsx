"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ResonanceRealtime } from "@/components/ResonanceRealtime"
import { ShipSelectionBanner } from "@/components/ShipSelectionBanner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="lofi"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <ResonanceRealtime />
      <ShipSelectionBanner />
      {children}
    </NextThemesProvider>
  )
}
