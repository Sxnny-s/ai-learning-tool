// app/api/tests/user-name.test.ts
// -----------------------------------------------------------------------------
// Jest tests for PATCH /api/user/name route
// Invariant under test: PATCH /api/user/name talks to Clerk only; DB helpers must not be called.
// -----------------------------------------------------------------------------

/// <reference types="jest" />

import { NextRequest } from 'next/server';
import { PATCH as patchName } from '../user/name/route';

// Mock Clerk server SDK
jest.mock('@clerk/nextjs/server', () => {
  const actual = jest.requireActual('@clerk/nextjs/server');
  return {
    ...actual,
    auth: jest.fn(),
    clerkClient: {
      users: {
        getUser: jest.fn(),
        updateUser: jest.fn(),
      },
    },
  };
});

// Mock DB module to assert zero calls
jest.mock('../../../src/lib/database/user', () => ({
  __esModule: true,
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

import { auth, clerkClient } from '@clerk/nextjs/server';
import {
  createUser as mockDbCreateUser,
  updateUser as mockDbUpdateUser,
  deleteUser as mockDbDeleteUser,
} from '../../../src/lib/database/user';

type MockAuth = jest.MockedFunction<typeof auth>;
const mockAuth = auth as MockAuth;
type MockClerkUsers = {
  getUser: jest.MockedFunction<(id: string) => Promise<{ firstName?: string; lastName?: string }>>;
  updateUser: jest.MockedFunction<(id: string, payload: { firstName?: string; lastName?: string }) => Promise<{ firstName?: string; lastName?: string }>>;
};
type MockClerkClient = { users: MockClerkUsers };
const mockClient = clerkClient as unknown as MockClerkClient;
const mockGetUser = mockClient.users.getUser;
const mockUpdateUser = mockClient.users.updateUser;
const dbMocks = {
  createUser: mockDbCreateUser as jest.Mock,
  updateUser: mockDbUpdateUser as jest.Mock,
  deleteUser: mockDbDeleteUser as jest.Mock,
};

describe('PATCH /api/user/name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as unknown as ReturnType<typeof auth>);

    const request = new NextRequest('http://localhost:3000/api/user/name', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ first: 'John' }),
    });

    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.error).toBe('Sign in required');
    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(dbMocks.updateUser).not.toHaveBeenCalled();
    expect(dbMocks.deleteUser).not.toHaveBeenCalled();
  });

  it('returns 415 for non-JSON content type', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as unknown as ReturnType<typeof auth>);

    const request = new NextRequest('http://localhost:3000/api/user/name', {
      method: 'PATCH',
      headers: { 'content-type': 'text/plain' },
      body: 'first=John',
    });

    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(415);
    expect(data.error).toBe('Unsupported Media Type');
    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(dbMocks.updateUser).not.toHaveBeenCalled();
    expect(dbMocks.deleteUser).not.toHaveBeenCalled();
  });

  it('returns 400 when neither first nor last provided', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as unknown as ReturnType<typeof auth>);

    const request = new NextRequest('http://localhost:3000/api/user/name', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Provide first or last name');
    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(dbMocks.updateUser).not.toHaveBeenCalled();
    expect(dbMocks.deleteUser).not.toHaveBeenCalled();
  });

  it('returns 400 when provided field normalizes to empty', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as unknown as ReturnType<typeof auth>);

    const request = new NextRequest('http://localhost:3000/api/user/name', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ first: '   ' }),
    });

    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Provide first or last name');
    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(dbMocks.updateUser).not.toHaveBeenCalled();
    expect(dbMocks.deleteUser).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid characters (emoji)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as unknown as ReturnType<typeof auth>);

    const request = new NextRequest('http://localhost:3000/api/user/name', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ first: 'John 😀' }),
    });

    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid characters');
    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(dbMocks.updateUser).not.toHaveBeenCalled();
    expect(dbMocks.deleteUser).not.toHaveBeenCalled();
  });

  it('returns 400 when name is too long (>150)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as unknown as ReturnType<typeof auth>);
    const long = 'a'.repeat(151);

    const request = new NextRequest('http://localhost:3000/api/user/name', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ first: long }),
    });

    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Name is too long (max 150)');
    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(dbMocks.updateUser).not.toHaveBeenCalled();
    expect(dbMocks.deleteUser).not.toHaveBeenCalled();
  });

  it('returns 200 unchanged when provided field matches current', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as unknown as ReturnType<typeof auth>);
    mockGetUser.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });

    const request = new NextRequest('http://localhost:3000/api/user/name', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ first: 'John' }),
    });

    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe('unchanged');
    expect(data.name).toEqual({ first: 'John', last: 'Doe', display: 'John Doe' });
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(dbMocks.updateUser).not.toHaveBeenCalled();
    expect(dbMocks.deleteUser).not.toHaveBeenCalled();
  });

  it('updates first only', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as unknown as ReturnType<typeof auth>);
    mockGetUser.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });
    mockUpdateUser.mockResolvedValue({ firstName: 'Jon', lastName: 'Doe' });

    const request = new NextRequest('http://localhost:3000/api/user/name', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ first: 'Jon' }),
    });

    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe('updated');
    expect(data.name).toEqual({ first: 'Jon', last: 'Doe', display: 'Jon Doe' });
    expect(mockUpdateUser).toHaveBeenCalledWith('user_1', { firstName: 'Jon' });
    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(dbMocks.updateUser).not.toHaveBeenCalled();
    expect(dbMocks.deleteUser).not.toHaveBeenCalled();
  });

  it('updates last only', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as unknown as ReturnType<typeof auth>);
    mockGetUser.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });
    mockUpdateUser.mockResolvedValue({ firstName: 'John', lastName: 'Smith' });

    const request = new NextRequest('http://localhost:3000/api/user/name', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ last: 'Smith' }),
    });

    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe('updated');
    expect(data.name).toEqual({ first: 'John', last: 'Smith', display: 'John Smith' });
    expect(mockUpdateUser).toHaveBeenCalledWith('user_1', { lastName: 'Smith' });
    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(dbMocks.updateUser).not.toHaveBeenCalled();
    expect(dbMocks.deleteUser).not.toHaveBeenCalled();
  });
});

