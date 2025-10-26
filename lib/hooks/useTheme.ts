"use client";

import { useTheme as useNextTheme } from "next-themes";

/**
 * Thin wrapper around next-themes for client components.
 * Returns the current theme, resolvedTheme, and setter.
 */
export type ThemeValue = "light" | "dark" | "system";

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  return { theme: (theme as ThemeValue | undefined) ?? "system", setTheme, resolvedTheme, systemTheme };
}


