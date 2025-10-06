import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface StudentAnalytics {
  user_id: string;
  name: string;
  total_sessions: number;
  avg_session_length: number;
  last_active_at: string;
}

interface ProfileData {
  user_id: string;
  full_name: string;
  session_count: number;
  total_time_seconds: number;
  last_session_ended_at: string;
}
//edit
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, session_count, total_time_seconds, last_session_ended_at');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch student analytics' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { data: [], message: 'No student data found' },
        { status: 200 }
      );
    }

    const res: StudentAnalytics[] = (data as ProfileData[])
      .filter(student => 
        student.user_id && 
        student.full_name && 
        student.session_count && 
        student.session_count > 0
      )
      .map(student => {
        // Calculate average session length safely
        const avgSessionLength = student.session_count > 0 && student.total_time_seconds
          ? Math.round(student.total_time_seconds / student.session_count)
          : 0;

        return {
          user_id: student.user_id,
          name: student.full_name || 'Unknown',
          total_sessions: student.session_count || 0,
          avg_session_length: avgSessionLength,
          last_active_at: student.last_session_ended_at || 'Never'
        };
      });
//wdw
    return NextResponse.json({ data: res }, { status: 200 });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
