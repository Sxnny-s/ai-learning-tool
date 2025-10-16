import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getStudentsByCohort } from "@/lib/database/cohort";

/**
 * GET /api/admin/cohorts/[cohortName]/students
 * Get all students in a specific cohort (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { cohortName: string } }
) {
  try {
    const user = await requireAuth();
    
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { cohortName } = params;

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

    console.log(`Admin ${user.id} fetched ${students.length} students from cohort: ${cohortName}`);

    // Map database fields to camelCase for frontend
    const mappedStudents = students.map(student => ({
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
    console.error("Error in GET /api/admin/cohorts/[cohortName]/students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
