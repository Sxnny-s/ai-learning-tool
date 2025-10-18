// app/api/tests/invite.test.ts
// -----------------------------------------------------------------------------
// Jest tests for Next.js API route - Invite endpoint
// -----------------------------------------------------------------------------

/// <reference types="jest" />

import { NextRequest } from "next/server";

// Create mock invitation function that will be shared across tests
const mockCreateInvitation = jest.fn();

// Mock the auth module
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
}));

// Mock the Clerk backend - return consistent mock instance
jest.mock("@clerk/backend", () => ({
  createClerkClient: jest.fn(() => ({
    invitations: {
      createInvitation: mockCreateInvitation,
    },
  })),
}));

import { POST as postInvite } from "../invite/route";
import { requireAuth } from "../../../src/lib/auth";

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe("POST /api/invite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 for non-admin users", async () => {
    mockRequireAuth.mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "student",
    });

    const request = new NextRequest("http://localhost:3000/api/invite", {
      method: "POST",
      body: JSON.stringify({ emails: ["test@example.com"] }),
    });

    const response = await postInvite(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden: Admin access required");
    expect(mockCreateInvitation).not.toHaveBeenCalled();
  });

  it("should return 400 for missing emails field", async () => {
    mockRequireAuth.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });

    const request = new NextRequest("http://localhost:3000/api/invite", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await postInvite(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No emails provided");
    expect(mockCreateInvitation).not.toHaveBeenCalled();
  });

  it("should return 400 for null emails field", async () => {
    mockRequireAuth.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });

    const request = new NextRequest("http://localhost:3000/api/invite", {
      method: "POST",
      body: JSON.stringify({ emails: null }),
    });

    const response = await postInvite(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No emails provided");
    expect(mockCreateInvitation).not.toHaveBeenCalled();
  });

  it("should return 400 for empty emails array", async () => {
    mockRequireAuth.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });

    const request = new NextRequest("http://localhost:3000/api/invite", {
      method: "POST",
      body: JSON.stringify({ emails: [] }),
    });

    const response = await postInvite(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No emails provided");
    expect(mockCreateInvitation).not.toHaveBeenCalled();
  });

  it("should successfully create invitation for single email", async () => {
    mockRequireAuth.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });

    mockCreateInvitation.mockResolvedValue({
      id: "inv_123",
      emailAddress: "newuser@example.com",
      status: "pending",
    });

    const request = new NextRequest("http://localhost:3000/api/invite", {
      method: "POST",
      body: JSON.stringify({ emails: ["newuser@example.com"] }),
    });

    const response = await postInvite(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCreateInvitation).toHaveBeenCalledTimes(1);
    // Verify we pass correct parameters to Clerk API
    expect(mockCreateInvitation).toHaveBeenCalledWith({
      emailAddress: "newuser@example.com",
      ignoreExisting: true,
    });
  });

  it("should successfully create invitations for multiple emails", async () => {
    mockRequireAuth.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });

    mockCreateInvitation.mockResolvedValue({
      id: "inv_123",
      status: "pending",
    });

    const emails = [
      "user1@example.com",
      "user2@example.com",
      "user3@example.com",
    ];

    const request = new NextRequest("http://localhost:3000/api/invite", {
      method: "POST",
      body: JSON.stringify({ emails }),
    });

    const response = await postInvite(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCreateInvitation).toHaveBeenCalledTimes(3);

    // Verify each email was processed
    emails.forEach((email, index) => {
      expect(mockCreateInvitation).toHaveBeenNthCalledWith(index + 1, {
        emailAddress: email,
        ignoreExisting: true,
      });
    });
  });

  it("should return 500 when Clerk API fails", async () => {
    mockRequireAuth.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });

    // Test that ANY Clerk API error is caught and returns 500
    // (We don't differentiate error types in our route)
    mockCreateInvitation.mockRejectedValue(new Error("Clerk API error"));

    const request = new NextRequest("http://localhost:3000/api/invite", {
      method: "POST",
      body: JSON.stringify({ emails: ["test@example.com"] }),
    });

    const response = await postInvite(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
