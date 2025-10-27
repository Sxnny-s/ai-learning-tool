"use client";

import type React from "react";
import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";

// SSR-safe theme provider that initializes from Clerk publicMetadata.themePreference
type ThemePreference = "light" | "dark" | "system";

function ThemeInitializer() {
  const { isLoaded, user } = useUser();
  const { setTheme } = useNextTheme();

  useEffect(() => {
    if (!isLoaded) return;
    const rawPref = (user?.publicMetadata as Record<string, unknown> | undefined)?.themePreference as
      | string
      | undefined;
    const pref = rawPref?.toLowerCase();
    if (pref === "light" || pref === "dark" || pref === "system") {
      setTheme(pref as ThemePreference);
    }
  }, [isLoaded, user, setTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
      storageKey="app-theme"
    >
      <ThemeInitializer />
      {children}
    </NextThemesProvider>
  );
}
