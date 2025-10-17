import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * PUT /api/admin/students/[userId]
 * Update a student's information
 * 
 * Body: {
 *   fullName?: string,
 *   email?: string
 * }
 * 
 * Returns: {
 *   success: boolean,
 *   message: string
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await requireAuth();
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    const { userId } = params;
    const body = await request.json();
    const { fullName, email } = body;

    // Validate that at least one field is provided
    if (!fullName && !email) {
      return NextResponse.json(
        { error: "At least one field (fullName or email) must be provided" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (fullName && fullName.trim() !== '') {
      updateData.full_name = fullName.trim();
    }

    if (email && email.trim() !== '') {
      updateData.email = email.trim();
    }

    // Update the student
    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId)
      .eq('role', 'student'); // Ensure we're only updating students

    if (error) {
      console.error("Supabase error updating student:", error);
      return NextResponse.json(
        { error: "Failed to update student" },
        { status: 500 }
      );
    }

    console.log(`Admin ${user.id} updated student: ${userId}`);

    return NextResponse.json({
      success: true,
      message: `Student updated successfully`
    });

  } catch (error) {
    console.error("Error in PUT /api/admin/students/[userId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
