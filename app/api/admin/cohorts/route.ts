import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getCohorts } from "@/lib/database/cohort";

/**
 * GET /api/admin/cohorts
 * Get all cohorts with student counts (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Get all cohorts from database
    const cohorts = await getCohorts();

    if (!cohorts) {
      return NextResponse.json(
        { error: "Failed to fetch cohorts" },
        { status: 500 }
      );
    }

    if (cohorts.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    console.log(`Admin ${user.id} fetched ${cohorts.length} cohorts`);

    // Map database fields to camelCase for frontend
    const mappedCohorts = cohorts.map(cohort => ({
      name: cohort.name,
      studentCount: cohort.studentCount,
      students: cohort.students.map(student => ({
        id: student.id,
        email: student.email,
        fullName: student.fullName,
        role: student.role,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        sessionCount: student.sessionCount,
        totalTimeSeconds: student.totalTimeSeconds,
        totalTopics: student.totalTopics,
        achievements: student.achievements,
        lastSessionEndedAt: student.lastSessionEndedAt,
        avatarUrl: student.avatarUrl
      }))
    }));

    return NextResponse.json({
      success: true,
      data: mappedCohorts
    });
  } catch (error) {
    console.error("Error in GET /api/admin/cohorts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
