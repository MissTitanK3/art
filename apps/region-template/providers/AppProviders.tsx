"use client";

import * as React from "react";
import "@/providers/NotificationsStoreBootstrap"; // side-effect: set notifications storage key
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@workspace/ui/primitives/sonner";
import { AuthProvider } from "@/providers/AuthProvider";
import type { AuthSession } from "@/lib/auth/types";
import { RegionProvider } from "@/providers/RegionProvider";
import { AutoCreateProfile } from "@/components/auth/AutoCreateProfile";
import { NotificationsRealtime } from "@/providers/NotificationsRealtime";
import { ProfileStoreProvider } from "@/providers/ProfileStoreProvider";

type AppProvidersProps = {
  children: React.ReactNode;
  initialSession?: AuthSession | null;
};

export function AppProviders({ children, initialSession }: AppProvidersProps) {
  return (
    <AuthProvider initialSession={initialSession}>
      <RegionProvider>
        <ProfileStoreProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Toaster
              position="top-right" // "top-left" | "top-right" | "bottom-left" | "bottom-right"
              richColors // enables colorful presets (info, success, warning, error)
              closeButton // adds an inline close X
              expand // expands stacked toasts to full width
              offset={24} // distance in px from screen edge
              duration={4000} // default auto-dismiss (ms)
              theme="system"
            />
            {/* Optional: live broadcast notifications via Supabase Realtime */}
            <NotificationsRealtime />
            <AutoCreateProfile />
            {children}
          </NextThemesProvider>
        </ProfileStoreProvider>
      </RegionProvider>
    </AuthProvider>
  );
}
