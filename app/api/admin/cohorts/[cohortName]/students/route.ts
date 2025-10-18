import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getStudentsByCohort,
  addStudentToCohort,
  removeStudentFromCohort
} from "@/lib/database/cohort";

/**
 * GET /api/admin/cohorts/[cohortName]/students
 * Get all students in a specific cohort (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cohortName: string }> }
) {
  try {
    const user = await requireAuth();

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { cohortName } = await params;

    if (!cohortName) {
      return NextResponse.json(
        { error: "Cohort name is required" },
        { status: 400 }
      );
    }

    // Get students in the specified cohort
    const students = await getStudentsByCohort(cohortName);

    if (!students) {
      return NextResponse.json(
        { error: "Failed to fetch students" },
        { status: 500 }
      );
    }

    console.log(
      `Admin ${user.id} fetched ${students.length} students from cohort: ${cohortName}`
    );

    // Map database fields to camelCase for frontend
    const mappedStudents = students.map((student) => ({
      id: student.user_id,
      email: student.email,
      fullName: student.full_name,
      role: student.role,
      createdAt: student.created_at,
      updatedAt: student.updated_at,
      cohort: student.cohort,
      sessionCount: student.session_count,
      totalTimeSeconds: student.total_time_seconds,
      totalTopics: student.total_topics,
      achievements: student.achievements,
      lastSessionEndedAt: student.last_session_ended_at,
      avatarUrl: student.avatar_url,
      authProvider: student.auth_provider,
      externalAuthId: student.external_auth_id
    }));

    return NextResponse.json({
      success: true,
      data: mappedStudents
    });
  } catch (error) {
    console.error(
      "Error in GET /api/admin/cohorts/[cohortName]/students:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/cohorts/[cohortName]/students
 * Add a student to a cohort (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cohortName: string }> }
) {
  try {
    const user = await requireAuth();

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { cohortName } = await params;

    if (!cohortName) {
      return NextResponse.json(
        { error: "Cohort name is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { studentId } = body;

    // Validate request body
    if (
      !studentId ||
      typeof studentId !== "string" ||
      studentId.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Student ID is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Add student to cohort
    await addStudentToCohort(cohortName, studentId.trim());

    console.log(
      `Admin ${user.id} added student ${studentId} to cohort "${cohortName}"`
    );

    return NextResponse.json({
      success: true,
      message: `Student ${studentId} added to cohort "${cohortName}" successfully`
    });
  } catch (error) {
    console.error(
      "Error in POST /api/admin/cohorts/[cohortName]/students:",
      error
    );
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/cohorts/[cohortName]/students/[studentId]
 * Remove a student from a cohort (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cohortName: string }> }
) {
  try {
    const user = await requireAuth();

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { cohortName } = await params;

    if (!cohortName) {
      return NextResponse.json(
        { error: "Cohort name is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    // Validate student ID
    if (!studentId || studentId.trim() === "") {
      return NextResponse.json(
        { error: "Student ID is required as query parameter" },
        { status: 400 }
      );
    }

    // Remove student from cohort
    await removeStudentFromCohort(cohortName, studentId.trim());

    console.log(
      `Admin ${user.id} removed student ${studentId} from cohort "${cohortName}"`
    );

    return NextResponse.json({
      success: true,
      message: `Student ${studentId} removed from cohort "${cohortName}" successfully`
    });
  } catch (error) {
    console.error(
      "Error in DELETE /api/admin/cohorts/[cohortName]/students:",
      error
    );
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
