import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

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
    strugglingCount?: number;
    isAddressed?: boolean;
    addressedAt?: string;
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

export async function GET(request: NextRequest) {
  try {
    console.log('Dashboard stats: Starting request');
    
    // Authenticate user
    const user = await requireAuth();
    console.log('Dashboard stats: User authenticated:', user.id, 'Role:', user.role);
    
    // Verify admin role
    if (user.role !== 'admin') {
      console.log('Dashboard stats: Access denied - user is not admin');
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }
    
    // Get cohort filter from query params
    const searchParams = request.nextUrl.searchParams;
    const cohortId = searchParams.get('cohortId');
    console.log('Dashboard stats: Cohort filter:', cohortId || 'all cohorts');
    
    const supabase = await createServerSupabaseClient();
    console.log('Dashboard stats: Supabase client created');

    // Fetch students from profiles table (optionally filtered by cohort)
    let profilesQuery = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');
    
    if (cohortId) {
      profilesQuery = profilesQuery.eq('cohort', cohortId);
    }
    
    const { data: profiles, error: profilesError } = await profilesQuery as { data: Profile[] | null; error: Error | null };

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

    // Fetch difficulty feedback data for topics students are struggling with (filtered by cohort)
    let difficultyQuery = supabase
      .from('student_difficulty_feedback')
      .select('user_id, selected_topics, custom_other, updated_at, topic_ratings');
    
    if (cohortId) {
      difficultyQuery = difficultyQuery.eq('cohort_id', cohortId);
    }
    
    const { data: difficultyFeedbacks } = await difficultyQuery;

    // Fetch addressed topics (filtered by cohort)
    let addressedQuery = supabase
      .from('addressed_topics')
      .select('topic_name, addressed_at, is_active')
      .eq('is_active', true);
    
    if (cohortId) {
      addressedQuery = addressedQuery.eq('cohort_id', cohortId);
    }
    
    const { data: addressedTopicsData } = await addressedQuery;

    // Create map of addressed topics
    const addressedTopicsMap = new Map<string, string>();
    addressedTopicsData?.forEach((topic: { topic_name: string; addressed_at: string }) => {
      addressedTopicsMap.set(topic.topic_name, topic.addressed_at);
    });

    // Count difficulty feedback submissions by topic and aggregate ratings
    const difficultyTopicCounts = new Map<string, number>();
    const topicRatingAggregation = new Map<string, { High: number; Medium: number; Low: number }>();
    let mostRecentFeedback: string | null = null;

    difficultyFeedbacks?.forEach((feedback: { user_id: string; selected_topics?: string[]; custom_other?: string; updated_at: string; topic_ratings?: Record<string, string> }) => {
      // Track most recent feedback
      if (!mostRecentFeedback || new Date(feedback.updated_at) > new Date(mostRecentFeedback)) {
        mostRecentFeedback = feedback.updated_at;
      }

      // Count each topic submission and aggregate ratings
      feedback.selected_topics?.forEach((topic: string) => {
        difficultyTopicCounts.set(topic, (difficultyTopicCounts.get(topic) || 0) + 1);
        
        // Aggregate difficulty ratings for this topic
        const topicRatings = feedback.topic_ratings || {};
        const rating = topicRatings[topic] as 'High' | 'Medium' | 'Low' | undefined;
        
        if (rating) {
          const current = topicRatingAggregation.get(topic) || { High: 0, Medium: 0, Low: 0 };
          current[rating]++;
          topicRatingAggregation.set(topic, current);
        }
      });
    });

    // Create Hot Topics from difficulty feedback submissions with student details and ratings
    // Only include UNADDRESSED topics in Hot Topics
    const hotTopics = Array.from(difficultyTopicCounts.entries())
      .map(([name, count]) => {
        const isAddressed = addressedTopicsMap.has(name);
        const strugglingPercentage = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
        
        // Get student-reported difficulty ratings for this topic
        const ratings = topicRatingAggregation.get(name) || { High: 0, Medium: 0, Low: 0 };
        const totalRatings = ratings.High + ratings.Medium + ratings.Low;
        
        let studentReportedDifficulty: 'High' | 'Medium' | 'Low' | null = null;
        if (totalRatings > 0) {
          const weightedScore = (ratings.High * 3 + ratings.Medium * 2 + ratings.Low * 1) / totalRatings;
          if (weightedScore >= 2.5) {
            studentReportedDifficulty = 'High';
          } else if (weightedScore >= 1.5) {
            studentReportedDifficulty = 'Medium';
          } else {
            studentReportedDifficulty = 'Low';
          }
        }
        
        // Get list of students who requested help for this topic
        const studentsRequesting = difficultyFeedbacks
          ?.filter((feedback: { user_id: string; selected_topics?: string[]; custom_other?: string; updated_at: string; topic_ratings?: Record<string, string> }) => feedback.selected_topics?.includes(name))
          .map((feedback: { user_id: string; selected_topics?: string[]; custom_other?: string; updated_at: string; topic_ratings?: Record<string, string> }) => {
             // Match by Supabase user_id (UUID), not clerk_user_id
            const profile = profiles?.find((p: Profile) => p.user_id === feedback.user_id);
            const topicRating = feedback.topic_ratings?.[name] || null;
            return {
              userId: feedback.user_id,
              clerkUserId: profile?.clerk_user_id || null,
              name: profile?.full_name || 'Unknown',
              email: profile?.email || 'Unknown',
              submittedAt: feedback.updated_at,
              difficultyRating: topicRating
            };
          }) || [];
        
        return {
          name,
          discussionCount: count,
          studentCount: count,
          strugglingCount: count,
          trend: 'stable' as const,
          difficulty: (strugglingPercentage > 30 ? 'High' : strugglingPercentage > 15 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
          lastActivity: mostRecentFeedback ? getRelativeTime(mostRecentFeedback) : 'No recent activity',
          isAddressed,
          addressedAt: isAddressed ? addressedTopicsMap.get(name) : undefined,
          studentReportedDifficulty,
          difficultyRatings: ratings,
          studentsRequesting
        };
      })
      .filter(topic => !topic.isAddressed) // Only show unaddressed topics in Hot Topics
      .sort((a, b) => b.strugglingCount - a.strugglingCount) // Sort by most struggling students
      .slice(0, 5);

    // Topic difficulties based on difficulty feedback submissions + student ratings
    // Uses BOTH percentage AND minimum count thresholds to avoid small sample size issues
    const topicDifficulties = Array.from(difficultyTopicCounts.entries())
      .map(([name, requestCount]) => {
        // Calculate difficulty based on request frequency
        const requestPercentage = totalStudents > 0 
          ? (requestCount / totalStudents) * 100 
          : 0;
        
        // Get aggregated student ratings for this topic
        const ratings = topicRatingAggregation.get(name) || { High: 0, Medium: 0, Low: 0 };
        const totalRatings = ratings.High + ratings.Medium + ratings.Low;
        
        // Calculate weighted average of student ratings (High=3, Medium=2, Low=1)
        let studentReportedDifficulty: 'High' | 'Medium' | 'Low' = 'Medium';
        if (totalRatings > 0) {
          const weightedScore = (ratings.High * 3 + ratings.Medium * 2 + ratings.Low * 1) / totalRatings;
          if (weightedScore >= 2.5) {
            studentReportedDifficulty = 'High';
          } else if (weightedScore >= 1.5) {
            studentReportedDifficulty = 'Medium';
          } else {
            studentReportedDifficulty = 'Low';
          }
        }
        
        // Determine final difficulty level with MINIMUM COUNT THRESHOLDS
        // This prevents small cohorts from showing inflated difficulty levels
        let difficulty: 'High' | 'Medium' | 'Low';
        
        // HIGH DIFFICULTY: Requires minimum 3 students OR 50%+ with at least 2 students
        if (studentReportedDifficulty === 'High' && requestCount >= 2) {
          difficulty = 'High';
        }
        else if ((requestPercentage >= 30 && requestCount >= 3) || (requestPercentage >= 50 && requestCount >= 2)) {
          difficulty = 'High';
        }
        // MEDIUM DIFFICULTY: Requires minimum 2 students OR 40%+ with at least 1 student
        else if (studentReportedDifficulty === 'Medium' && requestCount >= 2) {
          difficulty = 'Medium';
        }
        else if ((requestPercentage >= 15 && requestCount >= 2) || (requestPercentage >= 40 && requestCount >= 1)) {
          difficulty = 'Medium';
        }
        // LOW DIFFICULTY: Everything else
        else {
          difficulty = 'Low';
        }
        
        return {
          name,
          difficulty,
          studentsStruggling: requestCount,
          averageTime: '2-4 hours',
          completionRate: Math.max(0, 100 - Math.round(requestPercentage)) // Inverse of struggle rate
        };
      })
      .sort((a, b) => {
        // Sort by difficulty level first, then by count
        const difficultyOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const diffDiff = difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        if (diffDiff !== 0) return diffDiff;
        return b.studentsStruggling - a.studentsStruggling;
      })
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

