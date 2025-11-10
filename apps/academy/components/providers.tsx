"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

const SUPPORTED_THEME_CLASSNAMES = ["light", "dark", "dim", "lofi"] as const;

function ThemeClassSync() {
  const { theme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    const activeTheme = theme === "system" ? resolvedTheme : theme;
    if (!activeTheme) {
      return;
    }

    const root = document.documentElement;
    const body = document.body;

    root.dataset.theme = activeTheme;
    body.dataset.theme = activeTheme;

    for (const name of SUPPORTED_THEME_CLASSNAMES) {
      body.classList.remove(name);
    }

    body.classList.add(activeTheme);
  }, [theme, resolvedTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <ThemeClassSync />
      {children}
    </NextThemesProvider>
  );
}
