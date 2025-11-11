import "server-only";

// Edge runtime hint for modules imported by edge routes/actions
export const runtime = "edge";

import { createClerkClient } from "@clerk/backend";

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerk = clerkSecretKey ? createClerkClient({ secretKey: clerkSecretKey }) : null;

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

    if (!clerk) {
      console.error("CLERK_SECRET_KEY is not configured.");
      return { ok: false, error: "persist_failed" };
    }

    await clerk.users.updateUser(userId, {
      publicMetadata: { themePreference: value as ThemePreference },
    });

    return { ok: true };
  } catch (error) {
    console.error("updateUserTheme failed:", error);
    return { ok: false, error: "persist_failed" };
  }
}
