import { NextRequest } from "next/server";
import { getUserId } from "@/lib/auth";
import { updateUserTheme } from "@/lib/clerk/updateUserTheme";

export const runtime = "edge";

type Body = {
  theme?: string;
};

// Saves the theme to Clerk publicMetadata.
// Input: POST { theme: "light" | "dark" | "system" }
// Always returns 204 No Content. Unauthenticated is also 204 (no-op).
// No redirects or JSON body.
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const body = (await req.json().catch(() => ({}))) as Body;
    const theme = typeof body.theme === "string" ? body.theme : undefined;

    if (!userId) return new Response(null, { status: 204 });

    const result = await updateUserTheme(userId, theme);
    const status = result.ok ? 204 : result.error === "invalid_theme" ? 400 : 500;
    return new Response(null, { status });
  } catch {
    return new Response(null, { status: 204 });
  }
}


