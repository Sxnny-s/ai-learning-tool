import { NextResponse } from 'next/server';
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

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  averageTimeSpent: string;
  totalSessions: number;
  completionRate: number;
  totalConversations: number;
  strugglingStudents: Array<{
    id: string;
    name: string;
    email: string;
    lastActive: string;
    progress: number;
    strugglingTopics: string[];
    riskLevel: 'High' | 'Medium' | 'Low';
    daysSinceLastSession: number;
  }>;
  topicDifficulties: Array<{
    name: string;
    difficulty: 'High' | 'Medium' | 'Low';
    studentsStruggling: number;
    averageTime: string;
    completionRate: number;
  }>;
  hotTopics: Array<{
    name: string;
    discussionCount: number;
    studentCount: number;
    trend: 'up' | 'down' | 'stable';
    difficulty: 'High' | 'Medium' | 'Low';
    lastActivity: string;
  }>;
  recentStudents: Array<{
    name: string;
    email: string;
    joined: string;
    status: string;
  }>;
}

function formatTimeSpent(seconds: number): string {
  const hours = Math.round(seconds / 3600 * 10) / 10;
  return `${hours} hours`;
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

export async function GET() {
  try {
    console.log('Dashboard stats: Starting request');
    const supabase = await createServerSupabaseClient();
    console.log('Dashboard stats: Supabase client created');

    // Fetch all students from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student') as { data: Profile[] | null; error: any };

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles', details: profilesError.message }, { status: 500 });
    }

    console.log(`Dashboard stats: Fetched ${profiles?.length || 0} students`);

    // Fetch total conversations from chat_sessions
    const { count: conversationsCount, error: conversationsError } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
    }

    // Calculate statistics
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const totalStudents = profiles?.length || 0;
    const activeStudents = profiles?.filter(p => {
      if (!p.last_session_ended_at) return false;
      return new Date(p.last_session_ended_at) >= sevenDaysAgo;
    }).length || 0;

    const totalTime = profiles?.reduce((sum, p) => sum + (p.total_time_seconds || 0), 0) || 0;
    const totalSessions = profiles?.reduce((sum, p) => sum + (p.session_count || 0), 0) || 0;
    const avgTimePerSession = totalSessions > 0 ? totalTime / totalSessions : 0;

    // Identify struggling students (low session count, inactive, or few topics)
    const strugglingStudents = profiles
      ?.filter(p => {
        const daysSinceLastSession = p.last_session_ended_at 
          ? Math.floor((now.getTime() - new Date(p.last_session_ended_at).getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        const sessionCount = p.session_count || 0;
        const topicCount = p.total_topics?.length || 0;
        
        return daysSinceLastSession > 3 || sessionCount < 5 || topicCount < 2;
      })
      .map(p => {
        const daysSinceLastSession = p.last_session_ended_at 
          ? Math.floor((now.getTime() - new Date(p.last_session_ended_at).getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        
        return {
          id: p.user_id,
          name: p.full_name || 'Unknown',
          email: p.email,
          lastActive: getRelativeTime(p.last_session_ended_at),
          progress: Math.min(100, (p.session_count || 0) * 10),
          strugglingTopics: p.total_topics || [],
          riskLevel: (daysSinceLastSession > 7 ? 'High' : daysSinceLastSession > 3 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
          daysSinceLastSession
        };
      })
      .sort((a, b) => b.daysSinceLastSession - a.daysSinceLastSession)
      .slice(0, 5) || [];

    // Analyze topics - count frequency across all students
    const topicFrequency = new Map<string, number>();
    profiles?.forEach(p => {
      p.total_topics?.forEach((topic: string) => {
        topicFrequency.set(topic, (topicFrequency.get(topic) || 0) + 1);
      });
    });

    const hotTopics = Array.from(topicFrequency.entries())
      .map(([name, count]) => ({
        name,
        discussionCount: count * 3, // Estimate discussions
        studentCount: count,
        trend: 'stable' as const,
        difficulty: count > totalStudents * 0.5 ? 'Low' : count > totalStudents * 0.2 ? 'Medium' : 'High' as 'High' | 'Medium' | 'Low',
        lastActivity: 'Recently'
      }))
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 5);

    // Topic difficulties (inverse of frequency = difficulty)
    const topicDifficulties = Array.from(topicFrequency.entries())
      .map(([name, count]) => {
        const completionRate = Math.round((count / totalStudents) * 100);
        return {
          name,
          difficulty: (completionRate < 30 ? 'High' : completionRate < 60 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
          studentsStruggling: totalStudents - count,
          averageTime: '2-4 hours',
          completionRate
        };
      })
      .sort((a, b) => b.studentsStruggling - a.studentsStruggling)
      .slice(0, 8);

    // Recent students (last 5 registered)
    const recentStudents = profiles
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .map(p => ({
        name: p.full_name || 'Unknown',
        email: p.email,
        joined: getRelativeTime(p.created_at),
        status: (p.session_count || 0) > 0 ? 'Active' : 'Pending'
      })) || [];

    // Estimate completion rate based on session activity
    const completionRate = totalStudents > 0 
      ? Math.round((activeStudents / totalStudents) * 100) 
      : 0;

    const stats: DashboardStats = {
      totalStudents,
      activeStudents,
      averageTimeSpent: formatTimeSpent(avgTimePerSession),
      totalSessions,
      completionRate,
      totalConversations: conversationsCount || 0,
      strugglingStudents,
      topicDifficulties,
      hotTopics,
      recentStudents
    };

    return NextResponse.json(stats, { status: 200 });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

