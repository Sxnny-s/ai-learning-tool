/**
 * Source of truth: Name (first/last/display) is **Clerk-first**.
 * - This route updates Clerk only; DB mirrors via the Clerk webhook.
 * - Do not import or write to DB here. Keep logic read/write isolated to Clerk.
 * 
 * No redirects:
 * - Unauth → 401 JSON { error: "Sign in required" }
 * 
 * Notes:
 * - Partial updates supported (first? last?).
 * - Normalize names (NFKC, collapse spaces, trim).
 * - Validate chars (letters, spaces, hyphens, apostrophes ' and ’, periods) and ≤ 150 chars per field.
 * 
 * TODO(future): If we ever store first/last columns in DB, keep Clerk as owner and mirror through webhook only.
 */
import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";

type ClerkUsersApi = {
  getUser: (id: string) => Promise<{ firstName?: string | null; lastName?: string | null }>;
  updateUser: (
    id: string,
    payload: { firstName?: string; lastName?: string }
  ) => Promise<unknown>;
};

type ClerkServerClient = { users: ClerkUsersApi };

type RequestBody = {
  first?: string;
  last?: string;
};

function normalizeName(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\s\u00A0]+/g, " ")
    .trim();
}

function isValidName(value: string): boolean {
  if (!value) return false;
  if (value.length > 150) return false;
  const allowed = /^[\p{L} .'\-\u2019]+$/u;
  return allowed.test(value);
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json({ error: "Unsupported Media Type" }, { status: 415 });
    }

    let body: RequestBody;
    try {
      body = (await request.json()) as RequestBody;
    } catch {
      return NextResponse.json({ error: "Unsupported Media Type" }, { status: 415 });
    }

    const firstProvided = typeof body.first === "string";
    const lastProvided = typeof body.last === "string";

    if (!firstProvided && !lastProvided) {
      return NextResponse.json({ error: "Provide first or last name" }, { status: 400 });
    }

    const first = firstProvided ? normalizeName(body.first!) : "";
    const last = lastProvided ? normalizeName(body.last!) : "";

    if ((firstProvided && !first) || (lastProvided && !last)) {
      return NextResponse.json({ error: "Provide first or last name" }, { status: 400 });
    }

    if (firstProvided) {
      if (first.length > 150) {
        return NextResponse.json({ error: "Name is too long (max 150)" }, { status: 400 });
      }
      if (!isValidName(first)) {
        return NextResponse.json({ error: "Invalid characters" }, { status: 400 });
      }
    }
    if (lastProvided) {
      if (last.length > 150) {
        return NextResponse.json({ error: "Name is too long (max 150)" }, { status: 400 });
      }
      if (!isValidName(last)) {
        return NextResponse.json({ error: "Invalid characters" }, { status: 400 });
      }
    }

    const client: ClerkServerClient =
      typeof (clerkClient as unknown) === "function"
        ? await (clerkClient as unknown as () => ClerkServerClient)()
        : (clerkClient as unknown as ClerkServerClient);
    const clerkUser = await client.users.getUser(userId);
    const currentFirst = normalizeName(clerkUser.firstName ?? "");
    const currentLast = normalizeName(clerkUser.lastName ?? "");

    const firstChanged = firstProvided ? first !== currentFirst : false;
    const lastChanged = lastProvided ? last !== currentLast : false;
    const allProvidedUnchanged = (firstProvided ? !firstChanged : true) && (lastProvided ? !lastChanged : true);

    if (allProvidedUnchanged) {
      const nameFirst = firstProvided ? first : currentFirst;
      const nameLast = lastProvided ? last : currentLast;
      const display = `${nameFirst} ${nameLast}`.trim();
      return NextResponse.json({ status: "unchanged", name: { first: nameFirst, last: nameLast, display } });
    }

    const updatePayload: { firstName?: string; lastName?: string } = {};
    if (firstChanged) updatePayload.firstName = first;
    if (lastChanged) updatePayload.lastName = last;
    // Clerk-only write path (DB must mirror via webhook). Do NOT add DB writes here.
    // TODO(future): If team approves, add a light audit log (userId, fieldsChanged) for observability.
    await client.users.updateUser(userId, updatePayload);

    const nameFirst = firstProvided ? first : currentFirst;
    const nameLast = lastProvided ? last : currentLast;
    const display = `${nameFirst} ${nameLast}`.trim();
    return NextResponse.json({ status: "updated", name: { first: nameFirst, last: nameLast, display } });
  } catch (error) {
    console.error("Name PATCH API error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}


