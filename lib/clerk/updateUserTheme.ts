import "server-only";

// Edge runtime hint for modules imported by edge routes/actions
export const runtime = "edge";

import { clerkClient } from "@clerk/nextjs/server";

export type ThemePreference = "light" | "dark" | "system";

/**
 * Persist user's theme to Clerk publicMetadata (edge-safe).
 * Validates input; returns boolean for success without throwing.
 */
export async function updateUserTheme(
  userId: string,
  theme: unknown
): Promise<{ ok: boolean; error?: string }> {
  try {
    const value = typeof theme === "string" ? theme.toLowerCase() : "";
    if (value !== "light" && value !== "dark" && value !== "system") {
      return { ok: false, error: "invalid_theme" };
    }

    await clerkClient.users.updateUser(userId, {
      publicMetadata: { themePreference: value as ThemePreference },
    });

    return { ok: true };
  } catch (error) {
    // Non-throwing contract for callers (e.g., fire-and-forget)
    return { ok: false, error: "persist_failed" };
  }
}


