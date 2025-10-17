/**
 * GET /api/user/summary
 * Returns current user's { name, email, cohort }
 * 
 * Source of truth:
 * - Name/email: Clerk-first, mirrored into DB by webhook; we read from DB for simplicity.
 * - Cohort: **DB-first** today (not in Clerk). We read directly from profiles.
 * 
 * Do not write here. No redirects. Always "current user" (no userId param).
 * 
 * TODO(future): If team flips cohort to Clerk-first (public_metadata.cohort),
 * - Update webhook to mirror it into DB, (you can add a key in clerk for cohort in the public_metadata)
 * - Optionally fallback-read from Clerk here if DB is missing, but still keep this route read-only.
 */
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserByClerkId } from "@/lib/database/user";

function normalizeDisplay(value: string | null | undefined): string {
  const raw = (value ?? "");
  return raw
    .normalize("NFKC")
    .replace(/[\s\u00A0]+/g, " ")
    .trim();
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const profile = await getUserByClerkId(userId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const display = normalizeDisplay(profile.full_name || "");
    // Normalize display name (NFKC, collapse spaces, trim). Do NOT guess-split into first/last.
    // If DB lacks first/last columns, return { first: null, last: null } and keep display authoritative for UI.
    const responseBody = {
      name: {
        first: null as string | null,
        last: null as string | null,
        display,
      },
      email: profile.email,
      cohort: profile.cohort ?? null,
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("User summary GET API error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}


