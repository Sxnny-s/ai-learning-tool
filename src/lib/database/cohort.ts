/**
 * Database integration utilities for cohort management
 * This file contains functions to query cohort data from the profiles table
 */

import { supabaseAdmin } from '../supabase';
import type { DatabaseUser } from './user';
import { v4 as uuidv4 } from 'uuid';

export interface CohortData {
  name: string;
  studentCount: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  instructor?: string;
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
 * Aggregates data from profiles table and metadata from cohorts table
 */
export async function getCohorts(): Promise<CohortData[]> {
  try {
    // Get all users grouped by cohort
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('cohort, user_id, email, full_name, role, created_at, updated_at, session_count, total_time_seconds, total_topics, achievements, last_session_ended_at, avatar_url')
      .not('cohort', 'is', null) // Only include users with a cohort
      .order('cohort', { ascending: true });

    if (profilesError) {
      console.error("Supabase error getting profiles:", profilesError);
      throw profilesError;
    }

    // Get cohort metadata from cohorts table
    const { data: cohortsData, error: cohortsError } = await supabaseAdmin
      .from('cohorts')
      .select('name, start_date, end_date, is_active, instructor');

    // If cohorts table doesn't exist or has no data, that's okay - we'll use defaults
    if (cohortsError) {
      console.warn("Could not fetch cohort metadata (cohorts table may not exist yet):", cohortsError.message);
    }

    // Create a map of cohort metadata
    const cohortMetadataMap = new Map<string, {
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
      instructor?: string;
    }>();

    if (cohortsData) {
      cohortsData.forEach(cohort => {
        cohortMetadataMap.set(cohort.name, {
          startDate: cohort.start_date,
          endDate: cohort.end_date,
          isActive: cohort.is_active,
          instructor: cohort.instructor || undefined
        });
      });
    }

    if (!profilesData || profilesData.length === 0) {
      return [];
    }

    // Group users by cohort
    const cohortMap = new Map<string, DatabaseUser[]>();
    
    profilesData.forEach(user => {
      const cohortName = user.cohort!;
      if (!cohortMap.has(cohortName)) {
        cohortMap.set(cohortName, []);
      }
      cohortMap.get(cohortName)!.push(user as DatabaseUser);
    });

    // Convert to CohortData format
    const cohorts: CohortData[] = Array.from(cohortMap.entries()).map(([cohortName, users]) => {
      const metadata = cohortMetadataMap.get(cohortName) || {};
      
      return {
        name: cohortName,
        studentCount: users.length,
        startDate: metadata.startDate,
        endDate: metadata.endDate,
        isActive: metadata.isActive,
        instructor: metadata.instructor,
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
      };
    });

    console.log(`Found ${cohorts.length} cohorts with ${profilesData.length} total students`);
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
 * Creates a record in the cohorts table and updates profiles table for students
 */
export async function createCohort(data: {
  name: string;
  studentIds?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  instructor?: string;
}): Promise<void> {
  try {
    const { name, studentIds = [], startDate, endDate, isActive, instructor } = data;

    if (!name || name.trim() === '') {
      throw new Error('Cohort name is required');
    }

    const trimmedName = name.trim();

    // First, create/update the cohort record in the cohorts table
    const cohortData: {
      name: string;
      start_date?: string;
      end_date?: string;
      is_active?: boolean;
      instructor?: string;
      // updated_at: string;
    } = {
      name: trimmedName,
      // updated_at: new Date().toISOString()
    };

    // Add optional fields if provided
    if (startDate) {
      cohortData.start_date = startDate;
    }
    if (endDate) {
      cohortData.end_date = endDate;
    }
    if (isActive !== undefined) {
      cohortData.is_active = isActive;
    }
    if (instructor) {
      cohortData.instructor = instructor;
    }

    // Upsert (insert or update) the cohort record
    const { error: cohortError } = await supabaseAdmin
      .from('cohorts')
      .upsert(cohortData, {
        onConflict: 'name',
        ignoreDuplicates: false
      });

    if (cohortError) {
      console.error("Supabase error creating cohort record:", cohortError);
      throw cohortError;
    }

    // Then, update student profiles if any students are provided
    if (studentIds && studentIds.length > 0) {
      const { error: profilesError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          cohort: trimmedName,
          updated_at: new Date().toISOString()
        })
        .in('user_id', studentIds);

      if (profilesError) {
        console.error("Supabase error updating student profiles:", profilesError);
        throw profilesError;
      }

      console.log(`Created cohort "${trimmedName}" with ${studentIds.length} students`);
    } else {
      console.log(`Created empty cohort "${trimmedName}" - no students assigned yet`);
    }
  } catch (error) {
    console.error("Error creating cohort:", error);
    throw error;
  }
}

/**
 * Update cohort information
 * Updates cohort metadata in cohorts table and optionally renames by updating profiles
 */
export async function updateCohort(
  oldCohortName: string,
  data: {
    name?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    instructor?: string;
  }
): Promise<void> {
  try {
    if (!oldCohortName || oldCohortName.trim() === '') {
      throw new Error('Cohort name is required');
    }

    const cohortName = data.name?.trim() || oldCohortName.trim();

    // Update cohort metadata in cohorts table
    const cohortData: {
      name?: string;
      start_date?: string;
      end_date?: string;
      is_active?: boolean;
      instructor?: string;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString()
    };

    // Add fields if provided
    if (data.name) {
      cohortData.name = cohortName;
    }
    if (data.startDate) {
      cohortData.start_date = data.startDate;
    }
    if (data.endDate) {
      cohortData.end_date = data.endDate;
    }
    if (data.isActive !== undefined) {
      cohortData.is_active = data.isActive;
    }
    if (data.instructor) {
      cohortData.instructor = data.instructor;
    }

    // Update the cohort record
    const { error: cohortError } = await supabaseAdmin
      .from('cohorts')
      .update(cohortData)
      .eq('name', oldCohortName);

    if (cohortError) {
      console.error("Supabase error updating cohort metadata:", cohortError);
      throw cohortError;
    }

    // If name changed, also update student profiles
    if (data.name && data.name.trim() !== oldCohortName.trim()) {
      const { error: profilesError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          cohort: cohortName,
          updated_at: new Date().toISOString()
        })
        .eq('cohort', oldCohortName);

      if (profilesError) {
        console.error("Supabase error updating student profiles:", profilesError);
        throw profilesError;
      }

      console.log(`Updated cohort from "${oldCohortName}" to "${cohortName}"`);
    } else {
      console.log(`Updated cohort "${oldCohortName}" metadata`);
    }
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

/**
 * Create a new student profile
 * Generates a new UUID and inserts a new student record into the profiles table
 */
export async function createStudent(studentData: {
  email: string;
  fullName: string;
  cohort?: string;
}): Promise<string> {
  try {
    if (!studentData.email || studentData.email.trim() === '') {
      throw new Error('Student email is required');
    }

    if (!studentData.fullName || studentData.fullName.trim() === '') {
      throw new Error('Student full name is required');
    }

    // Generate a new UUID for the student
    const newUserId = uuidv4();
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: newUserId,
        email: studentData.email.trim(),
        full_name: studentData.fullName.trim(),
        role: 'student',
        cohort: studentData.cohort?.trim() || null,
        created_at: now,
        updated_at: now,
        // Set defaults for other fields
        session_count: 0,
        total_time_seconds: 0,
        total_topics: [],
        achievements: [],
        last_session_ended_at: null,
        avatar_url: null,
        auth_provider: 'manual',
        external_auth_id: null,
        clerk_user_id: `manual_${newUserId}`
      });

    if (error) {
      console.error("Supabase error creating student:", error);
      throw error;
    }

    console.log(`Created new student "${studentData.fullName}" with ID: ${newUserId}`);
    return newUserId;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
}
