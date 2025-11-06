"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useCallback } from "react";

/**
 * Client wrapper around next-themes.
 *
 * Order when setting a theme:
 * 1) Save to localStorage and a cookie (for SSR on the next load).
 * 2) POST to /api/user/theme (do not await).
 * 3) Call next-themes setTheme.
 *
 * This makes the UI instant and avoids flicker on reload.
 */
export type ThemeValue = "light" | "dark" | "system";

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();

  // Wrap setter to persist preference to Clerk via edge API (fire-and-forget)
  const setThemeAndPersist = useCallback(
    (value: string) => {
      if (value === "light" || value === "dark" || value === "system") {
        // 1) Client persistence for immediate SSR alignment on next render
        try {
          localStorage.setItem("theme", value);
          document.cookie = `theme=${encodeURIComponent(value)}; Path=/; Max-Age=31536000`;
        } catch {}
        // 2) Async server persistence; errors are swallowed to keep UI responsive
        void fetch("/api/user/theme", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ theme: value }),
          keepalive: true,
        }).catch(() => {});
      }
      // 3) Update runtime theme (next-themes manages <html> class)
      setTheme(value);
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


