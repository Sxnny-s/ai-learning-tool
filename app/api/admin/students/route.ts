import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createStudent } from "@/lib/database/cohort";

/**
 * POST /api/admin/students
 * Create a new student profile
 * 
 * Body: {
 *   email: string,
 *   fullName: string,
 *   cohort?: string (optional)
 * }
 * 
 * Returns: {
 *   success: boolean,
 *   data: { studentId: string },
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, fullName, cohort } = body;

    // Validate required fields
    if (!email || email.trim() === '') {
      return NextResponse.json(
        { error: "Student email is required" },
        { status: 400 }
      );
    }

    if (!fullName || fullName.trim() === '') {
      return NextResponse.json(
        { error: "Student full name is required" },
        { status: 400 }
      );
    }

    // Create the student
    const studentId = await createStudent({
      email: email.trim(),
      fullName: fullName.trim(),
      cohort: cohort?.trim()
    });

    console.log(`Admin ${user.id} created new student: ${studentId}`);

    return NextResponse.json({
      success: true,
      data: { studentId },
      message: `Student "${fullName}" created successfully`
    });

  } catch (error) {
    console.error("Error in POST /api/admin/students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
