"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useCallback } from "react";

/**
 * Thin wrapper around next-themes for client components.
 * Returns the current theme, resolvedTheme, and setter.
 */
export type ThemeValue = "light" | "dark" | "system";

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();

  // Wrap setter to persist preference to Clerk via edge API (fire-and-forget)
  const setThemeAndPersist = useCallback(
    (value: string) => {
      setTheme(value);
      // Do not await; avoid blocking UI/hydration
      if (value === "light" || value === "dark" || value === "system") {
        void fetch("/api/user/theme", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ theme: value }),
          // keepalive helps during page unload navigations
          keepalive: true,
        }).catch(() => {});
      }
    },
    [setTheme]
  );

  return {
    theme: (theme as ThemeValue | undefined) ?? "system",
    setTheme: setThemeAndPersist,
    resolvedTheme,
    systemTheme,
  };
}


