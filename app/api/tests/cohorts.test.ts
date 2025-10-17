// app/api/tests/cohorts.test.ts
// -----------------------------------------------------------------------------
// Jest tests for Next.js API routes - Cohort endpoints
// -----------------------------------------------------------------------------

/// <reference types="jest" />

import { NextRequest } from 'next/server';
import { GET as getCohortsRoute, POST as postCohortsRoute, PUT as putCohortsRoute, DELETE as deleteCohortsRoute } from '../admin/cohorts/route';
import { GET as getCohortStudentsRoute, POST as postCohortStudentsRoute, DELETE as deleteCohortStudentsRoute } from '../admin/cohorts/[cohortName]/students/route';
import type { DatabaseUser } from '../../../src/lib/database/user';
import type { CohortData } from '../../../src/lib/database/cohort';

// Mock the auth and database modules
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

jest.mock('@/lib/database/cohort', () => ({
  getCohorts: jest.fn(),
  getStudentsByCohort: jest.fn(),
  createCohort: jest.fn(),
  updateCohort: jest.fn(),
  deleteCohort: jest.fn(),
  addStudentToCohort: jest.fn(),
  removeStudentFromCohort: jest.fn(),
}));

import { requireAuth } from '../../../src/lib/auth';
import { getCohorts, getStudentsByCohort, createCohort, updateCohort, deleteCohort, addStudentToCohort, removeStudentFromCohort } from '../../../src/lib/database/cohort';

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockGetCohorts = getCohorts as jest.MockedFunction<typeof getCohorts>;
const mockGetStudentsByCohort = getStudentsByCohort as jest.MockedFunction<typeof getStudentsByCohort>;
const mockCreateCohort = createCohort as jest.MockedFunction<typeof createCohort>;
const mockUpdateCohort = updateCohort as jest.MockedFunction<typeof updateCohort>;
const mockDeleteCohort = deleteCohort as jest.MockedFunction<typeof deleteCohort>;
const mockAddStudentToCohort = addStudentToCohort as jest.MockedFunction<typeof addStudentToCohort>;
const mockRemoveStudentFromCohort = removeStudentFromCohort as jest.MockedFunction<typeof removeStudentFromCohort>;

describe('GET /api/admin/cohorts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 for non-admin users', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts');
    const response = await getCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden: Admin access required');
  });

  it('should return 500 when getCohorts fails', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockGetCohorts.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts');
    const response = await getCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should return empty array when no cohorts found', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockGetCohorts.mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts');
    const response = await getCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should successfully fetch cohorts for admin', async () => {
    const mockCohorts: CohortData[] = [
      {
        name: 'Spring 2024',
        studentCount: 5,
        students: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            fullName: 'John Doe',
            role: 'student',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T12:00:00Z',
            sessionCount: 10,
            totalTimeSeconds: 3600,
            totalTopics: ['javascript', 'react'],
            achievements: [],
            lastSessionEndedAt: '2024-01-01T12:00:00Z',
            avatarUrl: 'https://example.com/avatar1.jpg'
          }
        ]
      },
      {
        name: 'Fall 2024',
        studentCount: 3,
        students: [
          {
            id: 'user-2',
            email: 'user2@example.com',
            fullName: 'Jane Smith',
            role: 'student',
            createdAt: '2024-02-01T00:00:00Z',
            updatedAt: '2024-02-01T12:00:00Z',
            sessionCount: 8,
            totalTimeSeconds: 2400,
            totalTopics: ['typescript'],
            achievements: [],
            lastSessionEndedAt: '2024-02-01T12:00:00Z',
            avatarUrl: undefined
          }
        ]
      }
    ];

    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockGetCohorts.mockResolvedValue(mockCohorts);

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts');
    const response = await getCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    
    // Check first cohort
    expect(data.data[0]).toMatchObject({
      name: 'Spring 2024',
      studentCount: 5,
      students: expect.arrayContaining([
        expect.objectContaining({
          id: 'user-1',
          email: 'user1@example.com',
          fullName: 'John Doe',
          role: 'student',
          sessionCount: 10,
          totalTimeSeconds: 3600,
          totalTopics: ['javascript', 'react'],
          avatarUrl: 'https://example.com/avatar1.jpg'
        })
      ])
    });

    // Check second cohort
    expect(data.data[1]).toMatchObject({
      name: 'Fall 2024',
      studentCount: 3,
      students: expect.arrayContaining([
        expect.objectContaining({
          id: 'user-2',
          email: 'user2@example.com',
          fullName: 'Jane Smith',
          role: 'student',
          sessionCount: 8,
          totalTimeSeconds: 2400,
          totalTopics: ['typescript']
        })
      ])
    });

    expect(mockGetCohorts).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/admin/cohorts/[cohortName]/students', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 for non-admin users', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts/Spring%202024/students');
    const response = await getCohortStudentsRoute(request, { params: { cohortName: 'Spring 202024' } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden: Admin access required');
  });

  it('should return 400 when cohort name is missing', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts//students');
    const response = await getCohortStudentsRoute(request, { params: { cohortName: '' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Cohort name is required');
  });

  it('should return 500 when getStudentsByCohort fails', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockGetStudentsByCohort.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts/Spring%202024/students');
    const response = await getCohortStudentsRoute(request, { params: { cohortName: 'Spring 202024' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should return empty array when no students found in cohort', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockGetStudentsByCohort.mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts/Empty%20Cohort/students');
    const response = await getCohortStudentsRoute(request, { params: { cohortName: 'Empty Cohort' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should successfully fetch students by cohort for admin', async () => {
    const mockStudents: DatabaseUser[] = [
      {
        user_id: 'user-1',
        clerk_user_id: 'clerk-1',
        email: 'user1@example.com',
        full_name: 'John Doe',
        role: 'student' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T12:00:00Z',
        cohort: 'Spring 202024',
        session_count: 10,
        total_time_seconds: 3600,
        total_topics: ['javascript', 'react'],
        achievements: [],
        last_session_ended_at: '2024-01-01T12:00:00Z',
        avatar_url: 'https://example.com/avatar1.jpg',
        auth_provider: 'clerk',
        external_auth_id: 'ext-1',
      },
      {
        user_id: 'user-2',
        clerk_user_id: 'clerk-2',
        email: 'user2@example.com',
        full_name: 'Jane Smith',
        role: 'student' as const,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T12:00:00Z',
        cohort: 'Spring 202024',
        session_count: 8,
        total_time_seconds: 2400,
        total_topics: ['typescript'],
        achievements: [],
        last_session_ended_at: '2024-01-02T12:00:00Z',
        avatar_url: undefined,
        auth_provider: 'clerk',
        external_auth_id: 'ext-2',
      },
    ];

    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockGetStudentsByCohort.mockResolvedValue(mockStudents);

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts/Spring%202024/students');
    const response = await getCohortStudentsRoute(request, { params: { cohortName: 'Spring 202024' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    
    // Check first student
    expect(data.data[0]).toMatchObject({
      id: 'user-1',
      email: 'user1@example.com',
      fullName: 'John Doe',
      role: 'student',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T12:00:00Z',
      cohort: 'Spring 202024',
      sessionCount: 10,
      totalTimeSeconds: 3600,
      totalTopics: ['javascript', 'react'],
      lastSessionEndedAt: '2024-01-01T12:00:00Z',
      avatarUrl: 'https://example.com/avatar1.jpg',
      authProvider: 'clerk',
      externalAuthId: 'ext-1'
    });

    // Check second student
    expect(data.data[1]).toMatchObject({
      id: 'user-2',
      email: 'user2@example.com',
      fullName: 'Jane Smith',
      role: 'student',
      sessionCount: 8,
      totalTimeSeconds: 2400,
      totalTopics: ['typescript'],
      authProvider: 'clerk',
      externalAuthId: 'ext-2'
    });

    expect(mockGetStudentsByCohort).toHaveBeenCalledWith('Spring 202024');
    expect(mockGetStudentsByCohort).toHaveBeenCalledTimes(1);
  });

  it('should handle URL encoded cohort names', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockGetStudentsByCohort.mockResolvedValue([]);

    const encodedCohortName = 'Spring%202024%20-%20Advanced';
    const decodedCohortName = 'Spring 202024 - Advanced';
    
    const request = new NextRequest(`http://localhost:3000/api/admin/cohorts/${encodedCohortName}/students`);
    const response = await getCohortStudentsRoute(request, { params: { cohortName: decodedCohortName } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockGetStudentsByCohort).toHaveBeenCalledWith(decodedCohortName);
  });
});

describe('POST /api/admin/cohorts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 for non-admin users', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Cohort', studentIds: ['user-1'] }),
    });
    const response = await postCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden: Admin access required');
  });

  it('should return 400 for missing cohort name', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts', {
      method: 'POST',
      body: JSON.stringify({ studentIds: ['user-1'] }),
    });
    const response = await postCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Cohort name is required and must be a non-empty string');
  });

  it('should return 400 for missing student IDs', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Cohort' }),
    });
    const response = await postCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('At least one student ID must be provided');
  });

  it('should successfully create cohort for admin', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockCreateCohort.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Cohort', studentIds: ['user-1', 'user-2'] }),
    });
    const response = await postCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Cohort "Test Cohort" created successfully with 2 students');
    expect(mockCreateCohort).toHaveBeenCalledWith('Test Cohort', ['user-1', 'user-2']);
  });
});

describe('PUT /api/admin/cohorts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 for non-admin users', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts', {
      method: 'PUT',
      body: JSON.stringify({ oldName: 'Old Cohort', newName: 'New Cohort' }),
    });
    const response = await putCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden: Admin access required');
  });

  it('should return 400 for missing old name', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts', {
      method: 'PUT',
      body: JSON.stringify({ newName: 'New Cohort' }),
    });
    const response = await putCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Old cohort name is required and must be a non-empty string');
  });

  it('should return 400 for same old and new names', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts', {
      method: 'PUT',
      body: JSON.stringify({ oldName: 'Same Cohort', newName: 'Same Cohort' }),
    });
    const response = await putCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Old and new cohort names cannot be the same');
  });

  it('should successfully update cohort for admin', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockUpdateCohort.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts', {
      method: 'PUT',
      body: JSON.stringify({ oldName: 'Old Cohort', newName: 'New Cohort' }),
    });
    const response = await putCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Cohort renamed from "Old Cohort" to "New Cohort" successfully');
    expect(mockUpdateCohort).toHaveBeenCalledWith('Old Cohort', 'New Cohort');
  });
});

describe('DELETE /api/admin/cohorts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 for non-admin users', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts?name=Test%20Cohort');
    const response = await deleteCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden: Admin access required');
  });

  it('should return 400 for missing cohort name', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts');
    const response = await deleteCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Cohort name is required as query parameter');
  });

  it('should successfully delete cohort for admin', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockDeleteCohort.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts?name=Test%20Cohort');
    const response = await deleteCohortsRoute(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Cohort "Test Cohort" deleted successfully');
    expect(mockDeleteCohort).toHaveBeenCalledWith('Test Cohort');
  });
});

describe('POST /api/admin/cohorts/[cohortName]/students', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 for non-admin users', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts/Test%20Cohort/students', {
      method: 'POST',
      body: JSON.stringify({ studentId: 'user-1' }),
    });
    const response = await postCohortStudentsRoute(request, { params: { cohortName: 'Test Cohort' } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden: Admin access required');
  });

  it('should return 400 for missing student ID', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts/Test%20Cohort/students', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const response = await postCohortStudentsRoute(request, { params: { cohortName: 'Test Cohort' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Student ID is required and must be a non-empty string');
  });

  it('should successfully add student to cohort for admin', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockAddStudentToCohort.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts/Test%20Cohort/students', {
      method: 'POST',
      body: JSON.stringify({ studentId: 'user-1' }),
    });
    const response = await postCohortStudentsRoute(request, { params: { cohortName: 'Test Cohort' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Student user-1 added to cohort "Test Cohort" successfully');
    expect(mockAddStudentToCohort).toHaveBeenCalledWith('Test Cohort', 'user-1');
  });
});

describe('DELETE /api/admin/cohorts/[cohortName]/students', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 for non-admin users', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts/Test%20Cohort/students?studentId=user-1');
    const response = await deleteCohortStudentsRoute(request, { params: { cohortName: 'Test Cohort' } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden: Admin access required');
  });

  it('should return 400 for missing student ID', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts/Test%20Cohort/students');
    const response = await deleteCohortStudentsRoute(request, { params: { cohortName: 'Test Cohort' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Student ID is required as query parameter');
  });

  it('should successfully remove student from cohort for admin', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockRemoveStudentFromCohort.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/admin/cohorts/Test%20Cohort/students?studentId=user-1');
    const response = await deleteCohortStudentsRoute(request, { params: { cohortName: 'Test Cohort' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Student user-1 removed from cohort "Test Cohort" successfully');
    expect(mockRemoveStudentFromCohort).toHaveBeenCalledWith('Test Cohort', 'user-1');
  });
});
