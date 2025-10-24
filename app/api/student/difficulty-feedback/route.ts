import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

/**
 * GET /api/student/difficulty-feedback
 * Retrieve the current student's difficulty feedback
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    // Get user's current cohort from profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("cohort, user_id")
      .eq("clerk_user_id", user.id)
      .single();

    if (profileError || !profile || !(profile as any).cohort) {
      return NextResponse.json(
        { error: "User cohort not found" },
        { status: 404 }
      );
    }

    // Get existing feedback for this user and cohort
    const { data: feedback, error: feedbackError } = await supabase
      .from("student_difficulty_feedback")
      .select("*")
      .eq("user_id", (profile as any).user_id)
      .eq("cohort_id", (profile as any).cohort)
      .maybeSingle();

    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError);
      return NextResponse.json(
        { error: "Failed to fetch feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      feedback: feedback
        ? {
            id: (feedback as any).id,
            userId: (feedback as any).user_id,
            cohortId: (feedback as any).cohort_id,
            selectedTopics: (feedback as any).selected_topics || [],
            customOther: (feedback as any).custom_other,
            createdAt: (feedback as any).created_at,
            updatedAt: (feedback as any).updated_at,
          }
        : null,
    });
  } catch (error) {
    console.error("GET difficulty-feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/student/difficulty-feedback
 * Submit or update student difficulty feedback
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { selectedTopics, customOther } = body;

    // Validation
    if (
      (!Array.isArray(selectedTopics) || selectedTopics.length === 0) &&
      !customOther?.trim()
    ) {
      return NextResponse.json(
        {
          error: "Please select at least one topic or provide custom feedback",
        },
        { status: 400 }
      );
    }

    if (customOther && customOther.length > 200) {
      return NextResponse.json(
        { error: "Custom feedback must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Get user's current cohort
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("cohort, user_id")
      .eq("clerk_user_id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const cohortValue = (profile as any).cohort;
    console.log("User cohort value:", cohortValue, "User ID:", user.id);

    if (!cohortValue) {
      return NextResponse.json(
        { error: "User cohort not assigned. Please contact your administrator to assign you to a cohort." },
        { status: 404 }
      );
    }

    // Upsert feedback (insert or update if exists)
    const { data: feedback, error: upsertError } = await supabase
      .from("student_difficulty_feedback")
      .upsert(
        {
          user_id: (profile as any).user_id,
          cohort_id: cohortValue,
          selected_topics: selectedTopics || [],
          custom_other: customOther?.trim() || null,
          updated_at: new Date().toISOString(),
        } as any,
        {
          onConflict: "user_id,cohort_id",
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Error upserting feedback:", upsertError);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback: {
        id: (feedback as any).id,
        userId: (feedback as any).user_id,
        cohortId: (feedback as any).cohort_id,
        selectedTopics: (feedback as any).selected_topics || [],
        customOther: (feedback as any).custom_other,
        createdAt: (feedback as any).created_at,
        updatedAt: (feedback as any).updated_at,
      },
    });
  } catch (error) {
    console.error("POST difficulty-feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/student/difficulty-feedback
 * Delete student's difficulty feedback
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    // Get user's current cohort
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("cohort, user_id")
      .eq("clerk_user_id", user.id)
      .single();

    if (profileError || !profile || !(profile as any).cohort) {
      return NextResponse.json(
        { error: "User cohort not found" },
        { status: 404 }
      );
    }

    // Delete feedback
    const { error: deleteError } = await supabase
      .from("student_difficulty_feedback")
      .delete()
      .eq("user_id", (profile as any).user_id)
      .eq("cohort_id", (profile as any).cohort);

    if (deleteError) {
      console.error("Error deleting feedback:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("DELETE difficulty-feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

