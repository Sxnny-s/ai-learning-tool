// app/api/tests/user-summary.test.ts
// -----------------------------------------------------------------------------
// Invariant under test: GET /api/user/summary is read-only and DB-first for cohort; no writes.
// -----------------------------------------------------------------------------

/// <reference types="jest" />

import { GET as getSummary } from '../user/summary/route';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('../../../src/lib/database/user', () => ({
  __esModule: true,
  getUserByClerkId: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

import { auth } from '@clerk/nextjs/server';
import {
  getUserByClerkId as mockDbGetUserByClerkId,
  createUser as mockDbCreateUser,
  updateUser as mockDbUpdateUser,
  deleteUser as mockDbDeleteUser,
} from '../../../src/lib/database/user';

type MockAuth = jest.MockedFunction<typeof auth>;
const mockAuth = auth as MockAuth;
const dbMocks = {
  getUserByClerkId: mockDbGetUserByClerkId as jest.Mock,
  createUser: mockDbCreateUser as jest.Mock,
  updateUser: mockDbUpdateUser as jest.Mock,
  deleteUser: mockDbDeleteUser as jest.Mock,
};

describe('GET /api/user/summary', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('401 unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);
    const res = await getSummary();
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.error).toBe('Sign in required');
    expect(dbMocks.getUserByClerkId).not.toHaveBeenCalled();
    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(dbMocks.updateUser).not.toHaveBeenCalled();
    expect(dbMocks.deleteUser).not.toHaveBeenCalled();
  });

  it('404 when no profile', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as any);
    dbMocks.getUserByClerkId.mockResolvedValue(null);
    const res = await getSummary();
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.error).toBe('Profile not found');
    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(dbMocks.updateUser).not.toHaveBeenCalled();
    expect(dbMocks.deleteUser).not.toHaveBeenCalled();
  });

  it('200 happy path with display normalized and first/last null', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as any);
    dbMocks.getUserByClerkId.mockResolvedValue({
      email: 'jane@example.com',
      cohort: 'Fall-2025',
      full_name: '  Jane   Smith  ',
    });
    const res = await getSummary();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({
      name: { first: null, last: null, display: 'Jane Smith' },
      email: 'jane@example.com',
      cohort: 'Fall-2025',
    });
    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(dbMocks.updateUser).not.toHaveBeenCalled();
    expect(dbMocks.deleteUser).not.toHaveBeenCalled();
  });
});

