import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/middleware/rate-limit";

const RULE_VERIFY_EMAIL = { windowMs: 15 * 60_000, max: 10 }; // 10/15min per email

type RequestBody = {
  email?: string;
  code?: string;
  newPassword?: string;
};

export async function POST(req: NextRequest) {
  // Parse and validate input
  const body = (await req.json().catch(() => null)) as RequestBody | null;

  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const newPassword =
    typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!email || !code || !newPassword) {
    return NextResponse.json(
      { error: "email, code, newPassword are required" },
      { status: 400 }
    );
  }

  // Per-email limit for verification attempts
  const rl = rateLimit({
    key: `email:${email}:pwdverify`,
    rule: RULE_VERIFY_EMAIL,
  });
  if (!rl.ok) {
    return new NextResponse(JSON.stringify({ error: "Too many attempts" }), {
      status: 429,
      headers: rl.headers,
    });
  }

  // No server-side Clerk call: client UI will invoke useSignIn().attemptFirstFactor(...)
  return NextResponse.json({ ok: true });
}
