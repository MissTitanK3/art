"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <Toaster
        position="top-right"        // "top-left" | "top-right" | "bottom-left" | "bottom-right"
        richColors                  // enables colorful presets (info, success, warning, error)
        closeButton                 // adds an inline close X
        expand                      // expands stacked toasts to full width
        offset={24}                 // distance in px from screen edge
        duration={4000}             // default auto-dismiss (ms)
        theme="system"
      />
      {children}
    </NextThemesProvider>
  )
}
