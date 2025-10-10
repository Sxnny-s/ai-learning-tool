import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

import { getAllUsers } from "@/lib/database/user";

/**
 * GET /api/users
 * Get all users' profiles (admin only) 
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
        // Get all users from database
         const users = await getAllUsers();

         

         if (!users) {
            return NextResponse.json(
                {error: "Failed to fetch users"},
                {status: 500}
            )
         }
         if (users.length === 0) {
            return NextResponse.json({
                success: true,
                data: []
            });
         }
         
         console.log(`User ${user.id} searching all users in the database`);
         console.log(`User ${user.id} found ${users.length} users in the database`);

         const filteredUsers = users.map(dbUser => ({
            id: dbUser.user_id,
            email: dbUser.email,
            fullName: dbUser.full_name,
            role: dbUser.role,
            createdAt: dbUser.created_at,
            updatedAt: dbUser.updated_at,
            cohort: dbUser.cohort,
            sessionCount: dbUser.session_count,
            totalTimeSeconds: dbUser.total_time_seconds,
            totalTopics: dbUser.total_topics,
            achievements: dbUser.achievements,
            lastSessionEndedAt: dbUser.last_session_ended_at,
            avatarUrl: dbUser.avatar_url
          }));
         

        return NextResponse.json({
            success: true,
            data: filteredUsers
        }); 
    } catch (error) {
        console.error("Error in GET /api/users:", error);
        return NextResponse.json(
            {error: "Internal server error"},
            {status: 500}
        );
    }
}
 