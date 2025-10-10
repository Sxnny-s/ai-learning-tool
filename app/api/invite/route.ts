import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // if (user.role !== "admin") {
    //   return NextResponse.json(
    //     { error: "Forbidden: Admin access required" },
    //     { status: 403 }
    //   );
    // }

    // Get email addresses from request
    const { emails }: { emails: string[] } = await request.json();

    if (!emails || emails.length === 0) {
      return NextResponse.json(
        { error: "No emails provided" },
        { status: 400 }
      );
    }

    for (const email of emails) {
      await clerkClient.invitations.createInvitation({
        emailAddress: email,
        ignoreExisting: true,
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in POST /api/invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
