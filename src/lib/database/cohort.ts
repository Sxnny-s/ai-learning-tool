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
      cohortMap.get(cohortName)!.push(user as DatabaseUser);
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

/**
 * Create a new cohort by assigning students to a cohort name
 * Updates the profiles table to set cohort field for specified students
 */
export async function createCohort(cohortName: string, studentIds: string[]): Promise<void> {
  try {
    if (!cohortName || cohortName.trim() === '') {
      throw new Error('Cohort name is required');
    }

    if (!studentIds || studentIds.length === 0) {
      throw new Error('At least one student must be assigned to the cohort');
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        cohort: cohortName.trim(),
        updated_at: new Date().toISOString()
      })
      .in('user_id', studentIds);

    if (error) {
      console.error("Supabase error creating cohort:", error);
      throw error;
    }

    console.log(`Created cohort "${cohortName}" with ${studentIds.length} students`);
  } catch (error) {
    console.error("Error creating cohort:", error);
    throw error;
  }
}

/**
 * Update cohort name (rename cohort)
 * Updates all students in the old cohort to the new cohort name
 */
export async function updateCohort(oldCohortName: string, newCohortName: string): Promise<void> {
  try {
    if (!oldCohortName || oldCohortName.trim() === '') {
      throw new Error('Old cohort name is required');
    }

    if (!newCohortName || newCohortName.trim() === '') {
      throw new Error('New cohort name is required');
    }

    if (oldCohortName === newCohortName) {
      throw new Error('Old and new cohort names cannot be the same');
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        cohort: newCohortName.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('cohort', oldCohortName);

    if (error) {
      console.error("Supabase error updating cohort:", error);
      throw error;
    }

    console.log(`Updated cohort from "${oldCohortName}" to "${newCohortName}"`);
  } catch (error) {
    console.error("Error updating cohort:", error);
    throw error;
  }
}

/**
 * Delete cohort (remove all students from cohort)
 * Sets cohort field to null for all students in the specified cohort
 */
export async function deleteCohort(cohortName: string): Promise<void> {
  try {
    if (!cohortName || cohortName.trim() === '') {
      throw new Error('Cohort name is required');
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        cohort: null,
        updated_at: new Date().toISOString()
      })
      .eq('cohort', cohortName);

    if (error) {
      console.error("Supabase error deleting cohort:", error);
      throw error;
    }

    console.log(`Deleted cohort "${cohortName}" - removed all students from cohort`);
  } catch (error) {
    console.error("Error deleting cohort:", error);
    throw error;
  }
}

/**
 * Add a student to a cohort
 * Updates the student's cohort field to the specified cohort name
 */
export async function addStudentToCohort(cohortName: string, studentId: string): Promise<void> {
  try {
    if (!cohortName || cohortName.trim() === '') {
      throw new Error('Cohort name is required');
    }

    if (!studentId || studentId.trim() === '') {
      throw new Error('Student ID is required');
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        cohort: cohortName.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', studentId);

    if (error) {
      console.error("Supabase error adding student to cohort:", error);
      throw error;
    }

    console.log(`Added student ${studentId} to cohort "${cohortName}"`);
  } catch (error) {
    console.error("Error adding student to cohort:", error);
    throw error;
  }
}

/**
 * Remove a student from a cohort
 * Sets the student's cohort field to null
 */
export async function removeStudentFromCohort(cohortName: string, studentId: string): Promise<void> {
  try {
    if (!cohortName || cohortName.trim() === '') {
      throw new Error('Cohort name is required');
    }

    if (!studentId || studentId.trim() === '') {
      throw new Error('Student ID is required');
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        cohort: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', studentId)
      .eq('cohort', cohortName);

    if (error) {
      console.error("Supabase error removing student from cohort:", error);
      throw error;
    }

    console.log(`Removed student ${studentId} from cohort "${cohortName}"`);
  } catch (error) {
    console.error("Error removing student from cohort:", error);
    throw error;
  }
}
