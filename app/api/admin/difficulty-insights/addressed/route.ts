import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

/**
 * GET /api/admin/difficulty-insights/addressed?cohortId={id}
 * Retrieve list of addressed topics for a specific cohort
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("clerk_user_id", user.id)
      .single<{ role: string }>();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get cohortId from query params
    const searchParams = request.nextUrl.searchParams;
    const cohortId = searchParams.get("cohortId");

    if (!cohortId) {
      return NextResponse.json(
        { error: "cohortId query parameter is required" },
        { status: 400 }
      );
    }

    // Get addressed topics for this cohort
    const { data: addressedTopics, error: fetchError } = await supabase
      .from("addressed_topics")
      .select("*")
      .eq("cohort_id", cohortId)
      .eq("is_active", true)
      .order("addressed_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching addressed topics:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch addressed topics" },
        { status: 500 }
      );
    }

    // Transform to match interface
    const topics = (addressedTopics || []).map((topic: { id: string; cohort_id: string; topic_name: string; addressed_by: string; addressed_at: string; is_active: boolean; notes: string | null }) => ({
      id: topic.id,
      cohortId: topic.cohort_id,
      topicName: topic.topic_name,
      addressedBy: topic.addressed_by,
      addressedAt: topic.addressed_at,
      isActive: topic.is_active,
      notes: topic.notes,
    }));

    return NextResponse.json({
      addressedTopics: topics,
      count: topics.length,
    });
  } catch (error) {
    console.error("GET addressed topics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

