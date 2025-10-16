/**
 * Database integration utilities for cohort management
 * This file contains functions to query cohort data from the profiles table
 */

import { supabaseAdmin } from '../supabase';
import type { DatabaseUser } from './user';

export interface CohortData {
  name: string;
  studentCount: number;
  students: Array<{
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    sessionCount: number;
    totalTimeSeconds: number;
    totalTopics: string[];
    achievements: unknown[];
    lastSessionEndedAt?: string;
    avatarUrl?: string;
  }>;
}

/**
 * Get all unique cohorts with student counts
 * Aggregates data from the profiles table's cohort field
 */
export async function getCohorts(): Promise<CohortData[]> {
  try {
    // Get all users grouped by cohort
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('cohort, user_id, email, full_name, role, created_at, updated_at, session_count, total_time_seconds, total_topics, achievements, last_session_ended_at, avatar_url')
      .not('cohort', 'is', null) // Only include users with a cohort
      .order('cohort', { ascending: true });

    if (error) {
      console.error("Supabase error getting cohorts:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Group users by cohort
    const cohortMap = new Map<string, DatabaseUser[]>();
    
    data.forEach(user => {
      const cohortName = user.cohort!;
      if (!cohortMap.has(cohortName)) {
        cohortMap.set(cohortName, []);
      }
      cohortMap.get(cohortName)!.push(user);
    });

    // Convert to CohortData format
    const cohorts: CohortData[] = Array.from(cohortMap.entries()).map(([cohortName, users]) => ({
      name: cohortName,
      studentCount: users.length,
      students: users.map(user => ({
        id: user.user_id,
        email: user.email,
        fullName: user.full_name || '',
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        sessionCount: user.session_count,
        totalTimeSeconds: user.total_time_seconds,
        totalTopics: user.total_topics,
        achievements: user.achievements,
        lastSessionEndedAt: user.last_session_ended_at,
        avatarUrl: user.avatar_url
      }))
    }));

    console.log(`Found ${cohorts.length} cohorts with ${data.length} total students`);
    return cohorts;
  } catch (error) {
    console.error("Error getting cohorts:", error);
    throw error;
  }
}

/**
 * Get all students in a specific cohort
 * Queries the profiles table where cohort matches the provided name
 */
export async function getStudentsByCohort(cohortName: string): Promise<DatabaseUser[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('cohort', cohortName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error getting students by cohort:", error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} students in cohort: ${cohortName}`);
    return data || [];
  } catch (error) {
    console.error("Error getting students by cohort:", error);
    throw error;
  }
}
