import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getCohorts, createCohort, updateCohort, deleteCohort } from "@/lib/database/cohort";

/**
 * GET /api/admin/cohorts
 * Get all cohorts with student counts (admin only)
 */
export async function GET() {
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
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      isActive: cohort.isActive,
      instructor: cohort.instructor,
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

/**
 * POST /api/admin/cohorts
 * Create a new cohort by assigning students to a cohort name (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, studentIds, startDate, endDate, isActive, instructor } = body;

    // Validate request body
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: "Cohort name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Allow empty student arrays for creating empty cohorts
    if (!studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: "studentIds must be an array" },
        { status: 400 }
      );
    }

    // Validate student IDs (only if any are provided)
    const validStudentIds = studentIds.filter(id => typeof id === 'string' && id.trim() !== '');
    if (studentIds.length > 0 && validStudentIds.length === 0) {
      return NextResponse.json(
        { error: "All student IDs must be valid non-empty strings" },
        { status: 400 }
      );
    }

    // Create the cohort with all fields
    await createCohort({
      name: name.trim(),
      // studentIds: validStudentIds,
      startDate,
      endDate,
      isActive,
      instructor
    });

    console.log(`Admin ${user.id} created cohort "${name}" with ${validStudentIds.length} students`);

    return NextResponse.json({
      success: true,
      message: `Cohort "${name}" created successfully with ${validStudentIds.length} students`
    });
  } catch (error) {
    console.error("Error in POST /api/admin/cohorts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/cohorts
 * Update cohort information (name, dates, active status, instructor) (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { oldName, name, startDate, endDate, isActive, instructor } = body;

    // Validate request body
    if (!oldName || typeof oldName !== 'string' || oldName.trim() === '') {
      return NextResponse.json(
        { error: "Old cohort name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate that at least one field is being updated
    if (!name && startDate === undefined && endDate === undefined && isActive === undefined && !instructor) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 }
      );
    }

    // Update the cohort with provided fields
    await updateCohort(oldName.trim(), {
      name: name?.trim(),
      startDate,
      endDate,
      isActive,
      instructor
    });

    console.log(`Admin ${user.id} updated cohort "${oldName}"`);

    return NextResponse.json({
      success: true,
      message: `Cohort "${oldName}" updated successfully`
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/cohorts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/cohorts
 * Delete cohort (remove all students from cohort) (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cohortName = searchParams.get('name');

    // Validate cohort name
    if (!cohortName || cohortName.trim() === '') {
      return NextResponse.json(
        { error: "Cohort name is required as query parameter" },
        { status: 400 }
      );
    }

    // Delete the cohort
    await deleteCohort(cohortName.trim());

    console.log(`Admin ${user.id} deleted cohort "${cohortName}"`);

    return NextResponse.json({
      success: true,
      message: `Cohort "${cohortName}" deleted successfully`
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/cohorts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
