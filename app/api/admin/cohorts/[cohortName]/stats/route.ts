import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

function formatTimeSpent(seconds: number): string {
  const hours = Math.round(seconds / 3600 * 10) / 10;
  return `${hours} hours`;
}

/**
 * GET /api/admin/cohorts/[cohortName]/stats
 * Get statistics for a specific cohort (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { cohortName: string } }
) {
  try {
    const user = await requireAuth();
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const cohortName = params.cohortName;

    if (!cohortName) {
      return NextResponse.json(
        { error: 'Cohort name is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching stats for cohort: ${cohortName}`);

    const supabase = await createServerSupabaseClient();

    // Fetch all students in this cohort
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('cohort', cohortName) as { data: Profile[] | null; error: any };

    if (profilesError) {
      console.error('Error fetching cohort profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch cohort data', details: profilesError.message },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      // Return empty stats for cohorts with no students
      return NextResponse.json({
        success: true,
        data: {
          cohortName,
          totalStudents: 0,
          activeStudents: 0,
          averageTimeSpent: '0 hours',
          totalSessions: 0,
          completionRate: 0,
          strugglingStudents: 0,
          hotTopics: []
        }
      });
    }

    console.log(`Found ${profiles.length} students in cohort ${cohortName}`);

    // Calculate statistics
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const totalStudents = profiles.length;
    const activeStudents = profiles.filter(p => {
      if (!p.last_session_ended_at) return false;
      return new Date(p.last_session_ended_at) >= sevenDaysAgo;
    }).length;

    const totalTime = profiles.reduce((sum, p) => sum + (p.total_time_seconds || 0), 0);
    const totalSessions = profiles.reduce((sum, p) => sum + (p.session_count || 0), 0);
    const avgTimePerSession = totalSessions > 0 ? totalTime / totalSessions : 0;

    // Identify struggling students (low session count, inactive, or few topics)
    const strugglingCount = profiles.filter(p => {
      const daysSinceLastSession = p.last_session_ended_at 
        ? Math.floor((now.getTime() - new Date(p.last_session_ended_at).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      const sessionCount = p.session_count || 0;
      const topicCount = p.total_topics?.length || 0;
      
      return daysSinceLastSession > 3 || sessionCount < 5 || topicCount < 2;
    }).length;

    // Analyze topics - count frequency across cohort students
    const topicFrequency = new Map<string, number>();
    profiles.forEach(p => {
      p.total_topics?.forEach((topic: string) => {
        topicFrequency.set(topic, (topicFrequency.get(topic) || 0) + 1);
      });
    });

    const hotTopics = Array.from(topicFrequency.entries())
      .map(([name, count]) => name)
      .sort((a, b) => (topicFrequency.get(b) || 0) - (topicFrequency.get(a) || 0))
      .slice(0, 5);

    // Estimate completion rate based on session activity
    const completionRate = totalStudents > 0 
      ? Math.round((activeStudents / totalStudents) * 100) 
      : 0;

    const stats = {
      cohortName,
      totalStudents,
      activeStudents,
      averageTimeSpent: formatTimeSpent(avgTimePerSession),
      totalSessions,
      completionRate,
      strugglingStudents: strugglingCount,
      hotTopics
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Cohort stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

