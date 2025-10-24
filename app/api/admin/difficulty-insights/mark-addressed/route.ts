import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

/**
 * POST /api/admin/difficulty-insights/mark-addressed
 * Mark a topic as addressed (or unmark it) for a specific cohort
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, user_id")
      .eq("clerk_user_id", user.id)
      .single();

    if ((profile as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

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

    const { cohortId, topicName, notes, unmark } = body;

    // Validation
    if (!cohortId || !topicName) {
      return NextResponse.json(
        { error: "cohortId and topicName are required" },
        { status: 400 }
      );
    }

    if (unmark) {
      // Unmark the topic (set is_active to false)
      const { error: updateError } = await (supabase
        .from("addressed_topics") as any)
        .update({ is_active: false })
        .eq("cohort_id", cohortId)
        .eq("topic_name", topicName);

      if (updateError) {
        console.error("Error unmarking topic:", updateError);
        return NextResponse.json(
          { error: "Failed to unmark topic" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Topic unmarked successfully",
      });
    } else {
      // Mark the topic as addressed (upsert with is_active = true)
      const { error: upsertError } = await supabase
        .from("addressed_topics")
        .upsert(
          {
            cohort_id: cohortId,
            topic_name: topicName,
            addressed_by: (profile as any).user_id,
            addressed_at: new Date().toISOString(),
            is_active: true,
            notes: notes || null,
          } as any,
          {
            onConflict: "cohort_id,topic_name",
          }
        );

      if (upsertError) {
        console.error("Error marking topic as addressed:", upsertError);
        return NextResponse.json(
          { error: "Failed to mark topic as addressed" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Topic marked as addressed successfully",
      });
    }
  } catch (error) {
    console.error("POST mark-addressed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

