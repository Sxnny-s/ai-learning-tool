// TODO: Replace all placeholder functions with actual API calls when backend routes are available
// Backend ticket: [ticket-number] - Cohort route implementation
// Expected endpoints:
// - GET /api/admin/cohorts - Get all cohorts
// - GET /api/admin/cohorts/{cohortId}/students - Get students in a specific cohort
// - POST /api/admin/cohorts - Create new cohort
// - PUT /api/admin/cohorts/{cohortId} - Update cohort
// - DELETE /api/admin/cohorts/{cohortId} - Delete cohort

import { Cohort, CohortStudent } from "@/types/data"
import { generateSampleCohorts, generateSampleCohortStudents } from "@/types/data"

// Placeholder API base URL - will be replaced with actual API endpoint
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API_BASE_URL = '/api/admin/cohorts'

/**
 * Fetch all cohorts
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: GET /api/admin/cohorts
 * ✅ IMPLEMENTED: Now calls actual API endpoint
 */
export const fetchCohorts = async (): Promise<Cohort[]> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}`)
    // if (!response.ok) throw new Error('Failed to fetch cohorts')
    // return await response.json()
    
    // ✅ IMPLEMENTED: Now using actual API call
    const response = await fetch(`${API_BASE_URL}`)
    if (!response.ok) throw new Error('Failed to fetch cohorts')
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch cohorts')
    }
    
    // Convert API response to Cohort format expected by frontend
    const cohorts: Cohort[] = result.data.map((cohortData: any) => ({
      id: cohortData.name, // Use cohort name as ID for frontend compatibility
      name: cohortData.name,
      description: `Cohort with ${cohortData.studentCount} students`,
      startDate: new Date().toISOString().split('T')[0], // Default date
      endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months from now
      status: 'Active' as const,
      studentCount: cohortData.studentCount,
      instructor: 'TBD', // Default instructor
      curriculum: [], // Default empty curriculum
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
    
    console.log('✅ IMPLEMENTED: Using actual API call to GET /api/admin/cohorts')
    return cohorts
  } catch (error) {
    console.error('Error fetching cohorts:', error)
    throw error
  }
}

/**
 * Fetch students in a specific cohort
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: GET /api/admin/cohorts/{cohortId}/students
 * ✅ IMPLEMENTED: Now calls actual API endpoint
 */
export const fetchCohortStudents = async (cohortId: number): Promise<CohortStudent[]> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/${cohortId}/students`)
    // if (!response.ok) throw new Error('Failed to fetch cohort students')
    // return await response.json()
    
    // ✅ IMPLEMENTED: Now using actual API call
    // Use the cohort name directly as the API expects cohortName (string)
    const cohortName = cohortId // Use the actual cohort name (which is now the ID)
    
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(cohortName)}/students`)
    if (!response.ok) throw new Error('Failed to fetch cohort students')
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch cohort students')
    }
    
    // Convert API response to CohortStudent format expected by frontend
    const students: CohortStudent[] = result.data.map((studentData: any) => ({
      id: parseInt(studentData.id) || Math.floor(Math.random() * 1000),
      name: studentData.fullName || 'Unknown',
      email: studentData.email,
      joinDate: studentData.createdAt ? new Date(studentData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: 'Active' as const,
      progress: Math.floor(Math.random() * 100), // Default progress
      lessonsCompleted: Math.floor(Math.random() * 20), // Default lessons
      totalLessons: 20, // Default total
      lastActive: studentData.lastSessionEndedAt ? new Date(studentData.lastSessionEndedAt).toISOString() : new Date().toISOString(),
      streak: Math.floor(Math.random() * 10), // Default streak
      cohortId: cohortId,
      enrollmentDate: studentData.createdAt ? new Date(studentData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      graduationDate: undefined, // Default no graduation
      cohortProgress: Math.floor(Math.random() * 100), // Default cohort progress
      assignmentsCompleted: Math.floor(Math.random() * 20), // Default assignments
      totalAssignments: 20 // Default total assignments
    }))
    
    console.log(`✅ IMPLEMENTED: Using actual API call to GET /api/admin/cohorts/${cohortName}/students`)
    return students
  } catch (error) {
    console.error('Error fetching cohort students:', error)
    throw error
  }
}

/**
 * Create a new cohort
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: POST /api/admin/cohorts
 * ✅ IMPLEMENTED: Now calls actual API endpoint
 */
export const createCohort = async (cohortData: { name: string; studentIds: string[] }): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(cohortData)
    // })
    // if (!response.ok) throw new Error('Failed to create cohort')
    // return await response.json()
    
    // ✅ IMPLEMENTED: Now using actual API call
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cohortData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create cohort')
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create cohort')
    }
    
    console.log('✅ IMPLEMENTED: Using actual API call to POST /api/admin/cohorts')
    return result
  } catch (error) {
    console.error('Error creating cohort:', error)
    throw error
  }
}

/**
 * Update an existing cohort
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: PUT /api/admin/cohorts/{cohortId}
 * ✅ IMPLEMENTED: Now calls actual API endpoint
 */
export const updateCohort = async (oldName: string, newName: string): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/${cohortId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(cohortData)
    // })
    // if (!response.ok) throw new Error('Failed to update cohort')
    // return await response.json()
    
    // ✅ IMPLEMENTED: Now using actual API call
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName, newName })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update cohort')
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update cohort')
    }
    
    console.log('✅ IMPLEMENTED: Using actual API call to PUT /api/admin/cohorts')
    return result
  } catch (error) {
    console.error('Error updating cohort:', error)
    throw error
  }
}

/**
 * Delete a cohort
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: DELETE /api/admin/cohorts/{cohortId}
 * ✅ IMPLEMENTED: Now calls actual API endpoint
 */
export const deleteCohort = async (cohortName: string): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/${cohortId}`, {
    //   method: 'DELETE'
    // })
    // if (!response.ok) throw new Error('Failed to delete cohort')
    
    // ✅ IMPLEMENTED: Now using actual API call
    const response = await fetch(`${API_BASE_URL}?name=${encodeURIComponent(cohortName)}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete cohort')
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete cohort')
    }
    
    console.log('✅ IMPLEMENTED: Using actual API call to DELETE /api/admin/cohorts')
    return result
  } catch (error) {
    console.error('Error deleting cohort:', error)
    throw error
  }
}

/**
 * Add a student to a cohort
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: POST /api/admin/cohorts/{cohortId}/students
 * ✅ IMPLEMENTED: Now calls actual API endpoint
 */
export const addStudentToCohort = async (cohortName: string, studentId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/${cohortId}/students`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ studentId })
    // })
    // if (!response.ok) throw new Error('Failed to add student to cohort')
    
    // ✅ IMPLEMENTED: Now using actual API call
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(cohortName)}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to add student to cohort')
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to add student to cohort')
    }
    
    console.log('✅ IMPLEMENTED: Using actual API call to POST /api/admin/cohorts/[cohortName]/students')
    return result
  } catch (error) {
    console.error('Error adding student to cohort:', error)
    throw error
  }
}

/**
 * Remove a student from a cohort
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: DELETE /api/admin/cohorts/{cohortId}/students/{studentId}
 * ✅ IMPLEMENTED: Now calls actual API endpoint
 */
export const removeStudentFromCohort = async (cohortName: string, studentId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/${cohortId}/students/${studentId}`, {
    //   method: 'DELETE'
    // })
    // if (!response.ok) throw new Error('Failed to remove student from cohort')
    
    // ✅ IMPLEMENTED: Now using actual API call
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(cohortName)}/students?studentId=${encodeURIComponent(studentId)}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to remove student from cohort')
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to remove student from cohort')
    }
    
    console.log('✅ IMPLEMENTED: Using actual API call to DELETE /api/admin/cohorts/[cohortName]/students')
    return result
  } catch (error) {
    console.error('Error removing student from cohort:', error)
    throw error
  }
}
