"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";

// Theme provider wrapper
// - next-themes applies the theme class (attribute="class").
// - After mount, we read Clerk once and only set a value if the user has no
//   saved choice. This avoids flipping the theme after the user clicks.
type ThemePreference = "light" | "dark" | "system";

function ThemeInitializer() {
  const { isLoaded, user } = useUser();
  const { setTheme } = useNextTheme();
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current || !isLoaded) return;
    didInit.current = true;

    // If the user already saved a theme, do nothing.
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("theme");
    } catch {}
    if (stored === "light" || stored === "dark" || stored === "system") {
      return;
    }

    // Apply Clerk value once for light/dark only. Let "system" resolve
    // normally via next-themes.
    const rawPref = (user?.publicMetadata as Record<string, unknown> | undefined)?.themePreference as
      | string
      | undefined;
    const pref = rawPref?.toLowerCase();
    if (pref === "light" || pref === "dark") {
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
      storageKey="theme"
    >
      {/*
        Mount-only initializer.
        - Runs after the pre-paint script.
        - Skips if a saved theme exists.
        - Does not force "system".
      */}
      <ThemeInitializer />
      {children}
    </NextThemesProvider>
  );
}
