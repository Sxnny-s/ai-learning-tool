import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { DifficultyInsight } from "@/types/data";

/**
 * GET /api/admin/difficulty-insights?cohortId={id}
 * Retrieve aggregated difficulty insights for a specific cohort
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
      .single();

    if ((profile as any)?.role !== "admin") {
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

    console.log("Fetching difficulty insights for cohort:", cohortId);

    // Get all feedback for this cohort
    const { data: feedbacks, error: feedbackError } = await supabase
      .from("student_difficulty_feedback")
      .select("*")
      .eq("cohort_id", cohortId);

    console.log("Feedbacks found:", feedbacks?.length || 0, "Error:", feedbackError);

    if (feedbackError) {
      console.error("Error fetching feedbacks:", feedbackError);
      return NextResponse.json(
        { error: "Failed to fetch feedback data" },
        { status: 500 }
      );
    }

    if (!feedbacks || feedbacks.length === 0) {
      return NextResponse.json({
        insights: [],
        lastUpdated: null,
        totalResponses: 0,
      });
    }

    // Get addressed topics for this cohort
    const { data: addressedTopics } = await supabase
      .from("addressed_topics")
      .select("topic_name")
      .eq("cohort_id", cohortId)
      .eq("is_active", true);

    const addressedTopicNames = new Set(
      addressedTopics?.map((t: any) => t.topic_name) || []
    );

    // Aggregate the data
    const topicCounts: Record<string, number> = {};
    const customResponses: string[] = [];
    let mostRecentUpdate: string | null = null;

    feedbacks.forEach((feedback: any) => {
      // Track most recent update
      if (
        !mostRecentUpdate ||
        new Date(feedback.updated_at) > new Date(mostRecentUpdate)
      ) {
        mostRecentUpdate = feedback.updated_at;
      }

      // Count selected topics
      if (feedback.selected_topics && Array.isArray(feedback.selected_topics)) {
        feedback.selected_topics.forEach((topic: string) => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
      }

      // Collect custom "Other" responses
      if (feedback.custom_other?.trim()) {
        customResponses.push(feedback.custom_other.trim());
      }
    });

    // Add "Other/Custom" category if there are custom responses
    if (customResponses.length > 0) {
      topicCounts["Other/Custom"] = customResponses.length;
    }

    // Calculate total responses
    const totalResponses = feedbacks.length;

    // Convert to insights array and filter out addressed topics
    const insights: DifficultyInsight[] = Object.entries(topicCounts)
      .filter(([topicName]) => !addressedTopicNames.has(topicName))
      .map(([topicName, count]) => ({
        topicName,
        count,
        percentage: (count / totalResponses) * 100,
        customResponses:
          topicName === "Other/Custom" ? customResponses : undefined,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return NextResponse.json({
      insights,
      lastUpdated: mostRecentUpdate,
      totalResponses,
      cohortId,
    });
  } catch (error) {
    console.error("GET difficulty-insights error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

