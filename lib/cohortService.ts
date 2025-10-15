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
 */
export const fetchCohorts = async (): Promise<Cohort[]> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}`)
    // if (!response.ok) throw new Error('Failed to fetch cohorts')
    // return await response.json()
    
    // Placeholder data - will be removed when backend is ready
    console.log('TODO: Replace with actual API call to GET /api/admin/cohorts')
    return generateSampleCohorts()
  } catch (error) {
    console.error('Error fetching cohorts:', error)
    throw error
  }
}

/**
 * Fetch students in a specific cohort
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: GET /api/admin/cohorts/{cohortId}/students
 */
export const fetchCohortStudents = async (cohortId: number): Promise<CohortStudent[]> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/${cohortId}/students`)
    // if (!response.ok) throw new Error('Failed to fetch cohort students')
    // return await response.json()
    
    // Placeholder data - will be removed when backend is ready
    console.log(`TODO: Replace with actual API call to GET /api/admin/cohorts/${cohortId}/students`)
    return generateSampleCohortStudents(cohortId)
  } catch (error) {
    console.error('Error fetching cohort students:', error)
    throw error
  }
}

/**
 * Create a new cohort
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: POST /api/admin/cohorts
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createCohort = async (_cohortData: Omit<Cohort, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cohort> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(cohortData)
    // })
    // if (!response.ok) throw new Error('Failed to create cohort')
    // return await response.json()
    
    // Placeholder response - will be removed when backend is ready
    console.log('TODO: Replace with actual API call to POST /api/admin/cohorts')
    throw new Error('Create cohort functionality not yet implemented - waiting for backend')
  } catch (error) {
    console.error('Error creating cohort:', error)
    throw error
  }
}

/**
 * Update an existing cohort
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: PUT /api/admin/cohorts/{cohortId}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateCohort = async (cohortId: number, _cohortData: Partial<Cohort>): Promise<Cohort> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/${cohortId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(cohortData)
    // })
    // if (!response.ok) throw new Error('Failed to update cohort')
    // return await response.json()
    
    // Placeholder response - will be removed when backend is ready
    console.log(`TODO: Replace with actual API call to PUT /api/admin/cohorts/${cohortId}`)
    throw new Error('Update cohort functionality not yet implemented - waiting for backend')
  } catch (error) {
    console.error('Error updating cohort:', error)
    throw error
  }
}

/**
 * Delete a cohort
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: DELETE /api/admin/cohorts/{cohortId}
 */
export const deleteCohort = async (cohortId: number): Promise<void> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/${cohortId}`, {
    //   method: 'DELETE'
    // })
    // if (!response.ok) throw new Error('Failed to delete cohort')
    
    // Placeholder response - will be removed when backend is ready
    console.log(`TODO: Replace with actual API call to DELETE /api/admin/cohorts/${cohortId}`)
    throw new Error('Delete cohort functionality not yet implemented - waiting for backend')
  } catch (error) {
    console.error('Error deleting cohort:', error)
    throw error
  }
}

/**
 * Add a student to a cohort
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: POST /api/admin/cohorts/{cohortId}/students
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addStudentToCohort = async (cohortId: number, _studentId: number): Promise<void> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/${cohortId}/students`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ studentId })
    // })
    // if (!response.ok) throw new Error('Failed to add student to cohort')
    
    // Placeholder response - will be removed when backend is ready
    console.log(`TODO: Replace with actual API call to POST /api/admin/cohorts/${cohortId}/students`)
    throw new Error('Add student to cohort functionality not yet implemented - waiting for backend')
  } catch (error) {
    console.error('Error adding student to cohort:', error)
    throw error
  }
}

/**
 * Remove a student from a cohort
 * TODO: Replace with actual API call when backend route is ready
 * Expected endpoint: DELETE /api/admin/cohorts/{cohortId}/students/{studentId}
 */
export const removeStudentFromCohort = async (cohortId: number, studentId: number): Promise<void> => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/${cohortId}/students/${studentId}`, {
    //   method: 'DELETE'
    // })
    // if (!response.ok) throw new Error('Failed to remove student from cohort')
    
    // Placeholder response - will be removed when backend is ready
    console.log(`TODO: Replace with actual API call to DELETE /api/admin/cohorts/${cohortId}/students/${studentId}`)
    throw new Error('Remove student from cohort functionality not yet implemented - waiting for backend')
  } catch (error) {
    console.error('Error removing student from cohort:', error)
    throw error
  }
}
