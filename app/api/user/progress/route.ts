import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { updateUserProgress } from "@/lib/database/user";

/**
 * PATCH /api/user/progress
 * Update current user's learning progress statistics (incremental)
 */ 
export async function PATCH(request: NextRequest) {
    try {
        const user = await requireAuth();
        
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        
        // Get request body
        const { session_count, total_time_seconds } = body;

        // Validate input 
        if ( session_count === undefined && total_time_seconds === undefined ) {
            return NextResponse.json(
                {error: "At least one of session_count or total_time_seconds is required"},
                { status: 400 }
            );
        }
        
        // Validate session_count if provided 
        if (session_count !== undefined ) {
            if (typeof session_count !== "number" || !Number.isInteger(session_count)) {
                return NextResponse.json(
                    {error: "session_count must be an integer"},
                    { status: 400 }
                );
            }
            if (session_count < 0) {
                return NextResponse.json(
                    {error: "session_count must be non-negative"},
                    { status: 400 }
                );
            }
        }

        // Validate total_time_seconds if provided 
        if ( total_time_seconds !== undefined ) {
            if (typeof total_time_seconds !== "number" || !Number.isInteger(total_time_seconds)) {
                return NextResponse.json(
                    {error: "total_time_seconds must be an integer"},
                    { status: 400 }
                );
            }
            if (total_time_seconds < 0) {
                return NextResponse.json(
                    {error: "total_time_seconds must be non-negative"},
                    { status: 400 }
                );
            }
        }

        console.log(`User ${user.id} updating progress:`, { 
            session_count, 
            total_time_seconds 
          });

        // Update user progress
        const updatedProgress = await updateUserProgress(user.id, {
            sessionIncrement: session_count,
            timeSecondsIncrement: total_time_seconds
        });

        if (!updatedProgress) {
            return NextResponse.json(
                {error: "Failed to update progress - user not found"},
                { status: 404 }

            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: updatedProgress.user_id,
                sessionCount: updatedProgress.session_count,
                totalTimeSeconds: updatedProgress.total_time_seconds,
                updatedAt: updatedProgress.updated_at
            }
        });
    } catch (error) {
        console.error("Progress PATCH API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}