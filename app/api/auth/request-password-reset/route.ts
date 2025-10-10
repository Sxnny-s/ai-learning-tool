import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/middleware/rate-limit";

const RULE_PER_IP = { windowMs: 60_000, max: 10 };       // 10/min per IP
const RULE_PER_EMAIL = { windowMs: 15 * 60_000, max: 3 }; // 3/15min per email

type RequestBody = { email?: string };

export async function POST(req: NextRequest) {
  // Parse and validate input
  const body = (await req.json().catch(() => null)) as RequestBody | null;
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Derive client IP without using req.ip (not on NextRequest type)
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // Per-IP limit
  {
    const rl = rateLimit({ key: `ip:${clientIp}:pwdreq`, rule: RULE_PER_IP });
    if (!rl.ok) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: rl.headers,
      });
    }
  }

  // Per-email limit
  {
    const rl = rateLimit({ key: `email:${email}:pwdreq`, rule: RULE_PER_EMAIL });
    if (!rl.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests for this email" }),
        { status: 429, headers: rl.headers }
      );
    }
  }

  // No server-side Clerk call: client UI will invoke useSignIn().create(...)
  return NextResponse.json({ ok: true });
}
