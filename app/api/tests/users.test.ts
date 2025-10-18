// app/api/tests/users.test.ts
// -----------------------------------------------------------------------------
// Jest tests for Next.js API routes - Users and Progress endpoints
// -----------------------------------------------------------------------------

/// <reference types="jest" />

import { NextRequest } from 'next/server';
import { GET as getUsers } from '../users/route';
import { PATCH as patchProgress } from '../user/progress/route';
import type { DatabaseUser } from '../../../src/lib/database/user';

// Mock the auth and database modules
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

jest.mock('@/lib/database/user', () => ({
  getAllUsers: jest.fn(),
  updateUserProgress: jest.fn(),
}));

import { requireAuth } from '../../../src/lib/auth';
import { getAllUsers, updateUserProgress } from '../../../src/lib/database/user';

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockGetAllUsers = getAllUsers as jest.MockedFunction<typeof getAllUsers>;
const mockUpdateUserProgress = updateUserProgress as jest.MockedFunction<typeof updateUserProgress>;

describe('GET /api/users', () => {
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

    const request = new NextRequest('http://localhost:3000/api/users');
    const response = await getUsers(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden: Admin access required');
  });

  it('should return 500 when getAllUsers fails', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockGetAllUsers.mockResolvedValue(null as unknown as DatabaseUser[]);

    const request = new NextRequest('http://localhost:3000/api/users');
    const response = await getUsers(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch users');
  });

  it('should return empty array when no users found', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });

    mockGetAllUsers.mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/users');
    const response = await getUsers(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should return filtered user list for admin', async () => {
    const mockUsers: DatabaseUser[] = [
      {
        user_id: 'user-1',
        clerk_user_id: 'clerk-1',
        email: 'user1@example.com',
        full_name: 'John Doe',
        role: 'student' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        cohort: 'cohort-1',
        session_count: 5,
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
        role: 'admin' as const,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        cohort: 'cohort-2',
        session_count: 10,
        total_time_seconds: 7200,
        total_topics: ['typescript', 'node'],
        achievements: [],
        last_session_ended_at: '2024-01-02T12:00:00Z',
        avatar_url: 'https://example.com/avatar2.jpg',
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

    mockGetAllUsers.mockResolvedValue(mockUsers);

    const request = new NextRequest('http://localhost:3000/api/users');
    const response = await getUsers(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    
    // Check that sensitive fields are filtered out
    expect(data.data[0]).not.toHaveProperty('clerk_user_id');
    expect(data.data[0]).not.toHaveProperty('auth_provider');
    expect(data.data[0]).not.toHaveProperty('external_auth_id');
    
    // Check that expected fields are present
    expect(data.data[0]).toMatchObject({
      id: 'user-1',
      email: 'user1@example.com',
      fullName: 'John Doe',
      role: 'student',
      sessionCount: 5,
      totalTimeSeconds: 3600,
    });
  });
});

describe('PATCH /api/user/progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for invalid JSON', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/user/progress', {
      method: 'PATCH',
      body: 'invalid json',
    });
    
    const response = await patchProgress(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid JSON body');
  });

  it('should return 400 when no fields provided', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/user/progress', {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
    
    const response = await patchProgress(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('At least one of session_count or total_time_seconds is required');
  });

  it('should return 400 for invalid session_count type', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/user/progress', {
      method: 'PATCH',
      body: JSON.stringify({ session_count: 'not-a-number' }),
    });
    
    const response = await patchProgress(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('session_count must be an integer');
  });

  it('should return 400 for negative session_count', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/user/progress', {
      method: 'PATCH',
      body: JSON.stringify({ session_count: -1 }),
    });
    
    const response = await patchProgress(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('session_count must be non-negative');
  });

  it('should return 400 for invalid total_time_seconds type', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/user/progress', {
      method: 'PATCH',
      body: JSON.stringify({ total_time_seconds: 'not-a-number' }),
    });
    
    const response = await patchProgress(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('total_time_seconds must be an integer');
  });

  it('should return 400 for negative total_time_seconds', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    const request = new NextRequest('http://localhost:3000/api/user/progress', {
      method: 'PATCH',
      body: JSON.stringify({ total_time_seconds: -100 }),
    });
    
    const response = await patchProgress(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('total_time_seconds must be non-negative');
  });

  it('should return 404 when user not found', async () => {
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    mockUpdateUserProgress.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/user/progress', {
      method: 'PATCH',
      body: JSON.stringify({ session_count: 1, total_time_seconds: 1800 }),
    });
    
    const response = await patchProgress(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Failed to update progress - user not found');
  });

  it('should successfully update progress', async () => {
    const mockUpdatedUser: DatabaseUser = {
      user_id: 'user-1',
      clerk_user_id: 'clerk-1',
      email: 'user@example.com',
      full_name: 'John Doe',
      role: 'student' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T12:00:00Z',
      session_count: 6,
      total_time_seconds: 5400,
      total_topics: [],
      achievements: [],
      last_session_ended_at: '2024-01-01T12:00:00Z',
      auth_provider: 'clerk',
    };

    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    mockUpdateUserProgress.mockResolvedValue(mockUpdatedUser);

    const request = new NextRequest('http://localhost:3000/api/user/progress', {
      method: 'PATCH',
      body: JSON.stringify({ session_count: 1, total_time_seconds: 1800 }),
    });
    
    const response = await patchProgress(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({
      id: 'user-1',
      sessionCount: 6,
      totalTimeSeconds: 5400,
      updatedAt: '2024-01-01T12:00:00Z',
    });

    expect(mockUpdateUserProgress).toHaveBeenCalledWith('user-1', {
      sessionIncrement: 1,
      timeSecondsIncrement: 1800,
    });
  });

  it('should handle only session_count update', async () => {
    const mockUpdatedUser: DatabaseUser = {
      user_id: 'user-1',
      clerk_user_id: 'clerk-1',
      email: 'user@example.com',
      role: 'student' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T12:00:00Z',
      session_count: 5,
      total_time_seconds: 3600,
      total_topics: [],
      achievements: [],
      auth_provider: 'clerk',
    };

    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    mockUpdateUserProgress.mockResolvedValue(mockUpdatedUser);

    const request = new NextRequest('http://localhost:3000/api/user/progress', {
      method: 'PATCH',
      body: JSON.stringify({ session_count: 1 }),
    });
    
    const response = await patchProgress(request);
    await response.json();

    expect(response.status).toBe(200);
    expect(mockUpdateUserProgress).toHaveBeenCalledWith('user-1', {
      sessionIncrement: 1,
      timeSecondsIncrement: undefined,
    });
  });

  it('should handle only total_time_seconds update', async () => {
    const mockUpdatedUser: DatabaseUser = {
      user_id: 'user-1',
      clerk_user_id: 'clerk-1',
      email: 'user@example.com',
      role: 'student' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T12:00:00Z',
      session_count: 4,
      total_time_seconds: 5400,
      total_topics: [],
      achievements: [],
      auth_provider: 'clerk',
    };

    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    });

    mockUpdateUserProgress.mockResolvedValue(mockUpdatedUser);

    const request = new NextRequest('http://localhost:3000/api/user/progress', {
      method: 'PATCH',
      body: JSON.stringify({ total_time_seconds: 1800 }),
    });
    
    const response = await patchProgress(request);
    await response.json();

    expect(response.status).toBe(200);
    expect(mockUpdateUserProgress).toHaveBeenCalledWith('user-1', {
      sessionIncrement: undefined,
      timeSecondsIncrement: 1800,
    });
  });
});
