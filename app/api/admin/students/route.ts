import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createStudent } from "@/lib/database/cohort";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface Profile {
  user_id: string;
  clerk_user_id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
  cohort: string | null;
  session_count: number;
  total_time_seconds: number;
  total_topics: string[];
  achievements: unknown[];
  last_session_ended_at: string | null;
  avatar_url: string | null;
  auth_provider: string;
  external_auth_id: string | null;
}

function getRelativeTime(date: string | null): string {
  if (!date) return 'Never';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Less than an hour ago';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

/**
 * GET /api/admin/students
 * Fetch all student profiles from Supabase
 * 
 * Returns: {
 *   students: Array<Student>,
 *   stats: {
 *     total: number,
 *     active: number,
 *     inactive: number,
 *     pending: number
 *   }
 * }
 */
export async function GET() {
  try {
    console.log('[GET /api/admin/students] Starting request...');
    
    const user = await requireAuth();
    console.log('[GET /api/admin/students] User authenticated:', user.id, 'Role:', user.role);
    
    if (user.role !== "admin") {
      console.log('[GET /api/admin/students] Access denied - user is not admin');
      return NextResponse.json(
        { error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();
    console.log('[GET /api/admin/students] Supabase client created');

    // Fetch all students from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false }) as { data: Profile[] | null; error: any };

    if (profilesError) {
      console.error('[GET /api/admin/students] Error fetching students:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }

    console.log('[GET /api/admin/students] Found', profiles?.length || 0, 'student profiles');

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Transform profiles to Student format
    const students = profiles?.map(profile => {
      const lastSessionDate = profile.last_session_ended_at ? new Date(profile.last_session_ended_at) : null;
      const isActive = lastSessionDate && lastSessionDate >= sevenDaysAgo;
      const hasSessions = (profile.session_count || 0) > 0;
      
      // Calculate progress based on session count (assuming 10 sessions = 100%)
      const progress = Math.min(100, Math.round((profile.session_count || 0) * 10));
      
      // Estimate lessons completed based on topics
      const topicCount = profile.total_topics?.length || 0;
      const lessonsCompleted = topicCount;
      const totalLessons = Math.max(topicCount, 10); // Assume at least 10 lessons available
      
      // Calculate streak (simplified - based on recent activity)
      const daysSinceLastSession = lastSessionDate 
        ? Math.floor((now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      const streak = daysSinceLastSession === 0 ? profile.session_count || 0 : 0;

      return {
        id: profile.user_id,
        name: profile.full_name || 'Unknown',
        email: profile.email,
        avatar: profile.avatar_url || undefined,
        joinDate: new Date(profile.created_at).toLocaleDateString(),
        status: isActive ? 'Active' : (hasSessions ? 'Inactive' : 'Pending'),
        progress,
        lessonsCompleted,
        totalLessons,
        lastActive: getRelativeTime(profile.last_session_ended_at),
        streak,
        cohort: profile.cohort,
        sessionCount: profile.session_count || 0,
        totalTimeSeconds: profile.total_time_seconds || 0,
        topics: profile.total_topics || []
      };
    }) || [];

    // Calculate stats
    const stats = {
      total: students.length,
      active: students.filter(s => s.status === 'Active').length,
      inactive: students.filter(s => s.status === 'Inactive').length,
      pending: students.filter(s => s.status === 'Pending').length,
      averageProgress: students.length > 0 
        ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)
        : 0,
      completionRate: students.length > 0
        ? Math.round((students.filter(s => s.progress >= 80).length / students.length) * 100)
        : 0
    };

    console.log('[GET /api/admin/students] Returning stats:', stats);
    console.log('[GET /api/admin/students] Sample student:', students[0]?.name);

    return NextResponse.json({ students, stats }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/admin/students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/students
 * Create a new student profile
 * 
 * Body: {
 *   email: string,
 *   fullName: string,
 *   cohort?: string (optional)
 * }
 * 
 * Returns: {
 *   success: boolean,
 *   data: { studentId: string },
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, fullName, cohort } = body;

    // Validate required fields
    if (!email || email.trim() === '') {
      return NextResponse.json(
        { error: "Student email is required" },
        { status: 400 }
      );
    }

    if (!fullName || fullName.trim() === '') {
      return NextResponse.json(
        { error: "Student full name is required" },
        { status: 400 }
      );
    }

    // Create the student
    const studentId = await createStudent({
      email: email.trim(),
      fullName: fullName.trim(),
      cohort: cohort?.trim()
    });

    console.log(`Admin ${user.id} created new student: ${studentId}`);

    return NextResponse.json({
      success: true,
      data: { studentId },
      message: `Student "${fullName}" created successfully`
    });

  } catch (error) {
    console.error("Error in POST /api/admin/students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
