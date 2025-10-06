import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
// If your @ alias currently prefers the *root* lib/, use a relative import temporarily:
// import { rateLimit } from "../../../../src/lib/middleware/rate-limit";
import { rateLimit } from "@/lib/middleware/rate-limit";

const RULE_PER_IP    = { windowMs: 60_000,      max: 10 }; // 10/min/IP
const RULE_PER_EMAIL = { windowMs: 15 * 60_000, max: 3  }; // 3/15min/email

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // Rate-limit per IP
  {
    const rl = rateLimit({ key: `ip:${clientIp}:pwdreq`, rule: RULE_PER_IP });
    if (!rl.ok) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: rl.headers,
      });
    }
  }

  // Rate-limit per email
  {
    const rl = rateLimit({ key: `email:${email}:pwdreq`, rule: RULE_PER_EMAIL });
    if (!rl.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests for this email" }),
        { status: 429, headers: rl.headers }
      );
    }
  }

  // Ask Clerk (provider API) to send reset code
  try {
    const client = await clerkClient();
    const signInAttempt = await client.signIns.create({
      identifier: email,
      strategy: 'reset_password_email_code',
    });
    
    await signInAttempt.prepareFirstFactor({
      strategy: 'reset_password_email_code',
    });

    // Always respond success to avoid revealing if email exists
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || err?.response?.status;
    const retryAfter =
      err?.response?.headers?.get?.("retry-after") ??
      err?.response?.headers?.["retry-after"];

    if (status === 429) {
      return new NextResponse(JSON.stringify({ error: "Try again later" }), {
        status: 429,
        headers: retryAfter ? { "Retry-After": String(retryAfter) } : {},
      });
    }

    // Remain opaque on other errors (no user enumeration)
    return NextResponse.json({ ok: true });
  }
}
