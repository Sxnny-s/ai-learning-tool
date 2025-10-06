import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
// If @ alias ambiguity is unresolved, use relative import temporarily:
// import { rateLimit } from "../../../../../src/lib/middleware/rate-limit";
import { rateLimit } from "@/lib/middleware/rate-limit";

const RULE_VERIFY_EMAIL = { windowMs: 15 * 60_000, max: 10 }; // 10/15min/email

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!email || !code || !newPassword) {
    return NextResponse.json(
      { error: "email, code, newPassword are required" },
      { status: 400 }
    );
  }

  // Rate-limit verification attempts per email
  const rl = rateLimit({ key: `email:${email}:pwdverify`, rule: RULE_VERIFY_EMAIL });
  if (!rl.ok) {
    return new NextResponse(JSON.stringify({ error: "Too many attempts" }), {
      status: 429,
      headers: rl.headers,
    });
  }

  try {
    // Recreate SignIn for this email and attempt factor w/ code+new password
    const signIn = await clerkClient.signIn.create({ identifier: email });

    const res = await clerkClient.signIn.attemptFirstFactor({
      signInId: signIn.id,
      strategy: "reset_password_email_code",
      code,
      password: newPassword,
    });

    if (res.status === "complete") {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Invalid code or password policy" },
      { status: 400 }
    );
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

    return NextResponse.json(
      { error: "Invalid code or password policy" },
      { status: 400 }
    );
  }
}
