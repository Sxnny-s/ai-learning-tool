import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { updateUserTheme } from "@/lib/clerk/updateUserTheme";

export const runtime = "edge";

type Body = {
  theme?: string;
};

/**
 * Persist theme to Clerk publicMetadata (edge-safe, auth required).
 * POST { theme: "light"|"dark"|"system" }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as Body;
    const theme = typeof body.theme === "string" ? body.theme : "";

    const result = await updateUserTheme(userId, theme);
    if (!result.ok) {
      const status = result.error === "invalid_theme" ? 400 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "unexpected" }, { status: 500 });
  }
}


