// app/api/tests/name.test.ts
// -----------------------------------------------------------------------------
// Jest tests for PATCH /api/user/name
// -----------------------------------------------------------------------------

/// <reference types="jest" />

import { NextRequest } from 'next/server';
import { PATCH as patchName } from '../user/name/route';

jest.mock('@/lib/auth', () => ({
  getUserId: jest.fn(),
}));

jest.mock('@clerk/nextjs/server', () => ({
  clerkClient: {
    users: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

import { getUserId } from '../../../src/lib/auth';
import { clerkClient } from '@clerk/nextjs/server';

type MockClerkUsers = {
  getUser: jest.Mock;
  updateUser: jest.Mock;
};

type MockClerkClient = {
  users: MockClerkUsers;
};

const mockGetUserId = getUserId as jest.MockedFunction<typeof getUserId>;
const mockedClerk = clerkClient as unknown as MockClerkClient;

describe('PATCH /api/user/name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserId.mockResolvedValue('user-1');
  });

  function makeRequest(body: unknown, contentType: string = 'application/json') {
    const init: {
      method: string;
      body: string;
      headers: Record<string, string>;
    } = {
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: { 'Content-Type': contentType },
    };
    return new NextRequest('http://localhost:3000/api/user/name', init);
  }

  it('returns 415 for non-JSON content type', async () => {
    const request = makeRequest('first=John&last=Doe', 'text/plain');
    const response = await patchName(request);
    expect(response.status).toBe(415);
  });

  it('returns 400 when provided field is blank after trim', async () => {
    mockedClerk.users.getUser.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });
    const request = makeRequest({ first: '  ' });
    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Provide first or last name');
  });

  it('returns 400 for invalid characters', async () => {
    const request = makeRequest({ first: 'John😀' });
    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid characters');
  });

  it('returns 400 when a provided name exceeds 150 chars', async () => {
    const long = 'a'.repeat(151);
    const request = makeRequest({ first: long });
    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Name is too long (max 150)');
  });

  it('returns unchanged when provided fields are identical after normalization (first only)', async () => {
    mockedClerk.users.getUser.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });
    const request = makeRequest({ first: ' John  ' });
    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe('unchanged');
    expect(data.name).toMatchObject({ first: 'John', last: 'Doe', display: 'John Doe' });
    expect(mockedClerk.users.updateUser).not.toHaveBeenCalled();
  });

  it('updates Clerk and returns cleaned names on success (both fields)', async () => {
    mockedClerk.users.getUser.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });
    mockedClerk.users.updateUser.mockResolvedValue({});
    const request = makeRequest({ first: '  Jane ', last: '  Smith  ' });
    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe('updated');
    expect(data.name).toMatchObject({ first: 'Jane', last: 'Smith', display: 'Jane Smith' });
    expect(mockedClerk.users.updateUser).toHaveBeenCalledWith('user-1', { firstName: 'Jane', lastName: 'Smith' });
  });

  it('updates Clerk when first only is provided', async () => {
    mockedClerk.users.getUser.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });
    mockedClerk.users.updateUser.mockResolvedValue({});
    const request = makeRequest({ first: '  Jane ' });
    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe('updated');
    expect(data.name).toMatchObject({ first: 'Jane', last: 'Doe', display: 'Jane Doe' });
    expect(mockedClerk.users.updateUser).toHaveBeenCalledWith('user-1', { firstName: 'Jane' });
  });

  it('updates Clerk when last only is provided', async () => {
    mockedClerk.users.getUser.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });
    mockedClerk.users.updateUser.mockResolvedValue({});
    const request = makeRequest({ last: '  Smith ' });
    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe('updated');
    expect(data.name).toMatchObject({ first: 'John', last: 'Smith', display: 'John Smith' });
    expect(mockedClerk.users.updateUser).toHaveBeenCalledWith('user-1', { lastName: 'Smith' });
  });

  it('returns 400 when neither first nor last is provided', async () => {
    const request = makeRequest({});
    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toBe('Provide first or last name');
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUserId.mockResolvedValueOnce(null);
    const request = makeRequest({ first: 'John' });
    const response = await patchName(request);
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.error).toBe('Sign in required');
  });
});


