import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge"; // Run on Vercel Edge
export const preferredRegion = "iad1"; // Hint region close to Clerk US
/**
 * Clerk webhook → DB mirror
 * - Name/email: Clerk-first. We mirror to DB here.
 * - Cohort: currently **DB-first**. We intentionally do NOT read/write cohort from Clerk now.
 * 
 * TODO(future): If cohort becomes Clerk-first, read evt.data.public_metadata?.cohort
 * and idempotently write to profiles.cohort here.
 */
import { Webhook } from "svix";
import { headers } from "next/headers";
import { createUser, updateUser, deleteUser, getUserByClerkId, updateLastActive } from "@/lib/database/user";
import { createClient } from "@supabase/supabase-js";

// Type definitions for Clerk webhook events
interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    public_metadata?: Record<string, unknown>; // include themePreference, role, etc.
  };
}

interface UserWebhookData {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: "student" | "admin";
}

/**
 * Clerk webhook handler for user events
 * Handles user.created, user.updated, user.deleted events
 * Integrates with Supabase profiles table using RLS policies
 */

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

// Valid webhook event types
const VALID_EVENT_TYPES = [
  "user.created", 
  "user.updated", 
  "user.deleted",
  "session.created",  // Login event
  "session.ended",    // Logout event
  "session.removed"   // Session revoked
] as const;
type ValidEventType = typeof VALID_EVENT_TYPES[number];

export async function GET(request: NextRequest) {
  // Check for Vercel bypass protection token in header
  // Only enforce bypass token check when running on Vercel
  const isVercel = !!process.env.VERCEL;
  const bypassToken = request.headers.get('x-vercel-protection-bypass');
  const expectedBypassToken = process.env.VERCEL_BYPASS_TOKEN;
  
  // If running on Vercel and bypass token is configured, validate it
  if (isVercel && expectedBypassToken && bypassToken !== expectedBypassToken) {
    return NextResponse.json(
      { error: "Unauthorized - invalid bypass token" },
      { status: 401 }
    );
  }

  return NextResponse.json({ 
    message: "Webhook endpoint is running", 
    method: "GET not supported - use POST for webhooks",
    endpoint: "/api/webhooks/clerk",
    bypassTokenProvided: !!bypassToken,
    environment: isVercel ? "vercel" : "non-vercel"
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check for Vercel bypass protection token in header
    // Only enforce bypass token check when running on Vercel
    const isVercel = !!process.env.VERCEL;
    const bypassToken = request.headers.get('x-vercel-protection-bypass');
    const expectedBypassToken = process.env.VERCEL_BYPASS_TOKEN;
    
    // If running on Vercel and bypass token is configured, validate it
    if (isVercel && expectedBypassToken && bypassToken !== expectedBypassToken) {
      console.error("Invalid or missing Vercel bypass token");
      return NextResponse.json(
        { error: "Unauthorized - invalid bypass token" },
        { status: 401 }
      );
    }

    // Validate webhook secret
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: "Missing required webhook headers" },
        { status: 400 }
      );
    }

    // Parse request body
    const payload = await request.json();

    // Verify webhook signature
    const wh = new Webhook(webhookSecret);
    const evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;

    // Validate event type
    if (!VALID_EVENT_TYPES.includes(evt.type as ValidEventType)) {
      console.warn(`Unhandled webhook event type: ${evt.type}`);
      return NextResponse.json(
        { error: `Unsupported event type: ${evt.type}` },
        { status: 400 }
      );
    }

    // Extract user data
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    let email = email_addresses?.[0]?.email_address;
    const role = validateAndNormalizeRole(public_metadata?.role);

    // Handle missing email for user.created events
    if (evt.type === 'user.created' && (!email || email.trim() === '')) {
      console.warn(`User created without email address: ${id} - using placeholder email`);
      // For testing purposes, use a placeholder email
      email = `user-${id}@placeholder.com`;
      console.log(`Using placeholder email: ${email}`);
    }

    console.log(`Processing webhook: ${evt.type}`, { userId: id, email, role });

    // Handle the webhook event
    switch (evt.type as ValidEventType) {
      case "user.created":
        await handleUserCreated({
          id,
          email,
          firstName: first_name,
          lastName: last_name,
          role,
        });
        break;

      case "user.updated":
        await handleUserUpdated({
          id,
          email,
          firstName: first_name,
          lastName: last_name,
          role,
        });
      // Mirror theme preference to Supabase if provided (non-blocking)
      mirrorThemePreferenceToSupabase(id, (evt.data as { public_metadata?: Record<string, unknown> })?.public_metadata?.themePreference).catch(() => {});
        break;

      case "user.deleted":
        await handleUserDeleted(id);
        break;

      case "session.created":
        await handleUserLogin(id);
        break;

      case "session.ended":
      case "session.removed":
        await handleUserLogout(id);
        break;
    }

    console.log(`Webhook processed successfully: ${evt.type}`, { userId: id });
    return NextResponse.json({ received: true, eventType: evt.type, userId: id });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Validate and normalize role from webhook data
 */
function validateAndNormalizeRole(role: unknown): "student" | "admin" {
  if (!role || typeof role !== "string") {
    return "student";
  }
  
  const normalizedRole = role.toLowerCase().trim();
  if (normalizedRole === "admin") {
    return "admin";
  }
  
  return "student";
}

async function handleUserCreated(userData: UserWebhookData) {
  const { id, email, firstName, lastName, role } = userData;
  
  if (!email || !email.trim()) {
    console.error("User creation failed - missing email:", { userId: id, email, firstName, lastName, role });
    throw new Error("Email is required for user creation");
  }

  // Check if user already exists before creating
  try {
    const existingUser = await getUserByClerkId(id);
    if (existingUser) {
      console.log("User already exists, updating instead of creating:", { userId: id });
      // User exists, update them instead
      await handleUserUpdated(userData);
      return;
    }
  } catch {
    console.log("Could not check if user exists, proceeding with creation:", { userId: id });
  }

  console.log("Creating user in Supabase:", { userId: id, email, role });
  
  try {
    const createdUser = await createUser({
      clerkId: id,
      email: email.trim(),
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      role,
    });

    console.log("User created successfully:", { userId: id, dbUserId: createdUser.user_id });
  } catch (error) {
    // Handle duplicate key error specifically
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      console.log("User already exists (duplicate key), updating instead:", { userId: id });
      try {
        await handleUserUpdated(userData);
        return;
      } catch (updateError) {
        console.error("Failed to update existing user:", { userId: id, error: updateError });
        throw updateError;
      }
    }
    
    console.error("Failed to create user in database:", { userId: id, error: error instanceof Error ? error.message : error });
    throw error;
  }
}

async function handleUserUpdated(userData: UserWebhookData) {
  const { id, email, firstName, lastName, role } = userData;
  
  console.log("Updating user in Supabase:", { userId: id, email, role });
  
  // First, check if user exists in database
  try {
    const existingUser = await getUserByClerkId(id);
    
    if (!existingUser) {
      console.log("User not found in database, creating new user instead:", { userId: id });
      // User doesn't exist, create them instead of updating
      await handleUserCreated(userData);
      return;
    }
  } catch (error) {
    console.error("Error checking if user exists:", error);
    // If we can't check, try to create the user anyway
    console.log("Could not verify user existence, attempting to create user:", { userId: id });
    await handleUserCreated(userData);
    return;
  }
  
  // Prepare update data
  const updateData: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    role: "student" | "admin";
  }> = {};

  // Only include fields that have values
  if (email && email.trim()) {
    updateData.email = email.trim();
  }
  if (firstName !== undefined) {
    updateData.firstName = firstName.trim();
  }
  if (lastName !== undefined) {
    updateData.lastName = lastName.trim();
  }
  if (role) {
    updateData.role = role;
  }

  // Check if there are any updates to make
  if (Object.keys(updateData).length === 0) {
    console.log("No updates needed for user:", id);
    return;
  }

  // Note: cohort is NOT mirrored from Clerk today.
  // TODO(future): mirror public_metadata.cohort → profiles.cohort if team flips cohort to Clerk-first. Right now its only DB
  const updatedUser = await updateUser(id, updateData);

  if (!updatedUser) {
    throw new Error("Failed to update user - user not found or update failed");
  }

  console.log("User updated successfully:", { 
    userId: id, 
    updatedFields: Object.keys(updateData) 
  });
}

async function handleUserDeleted(userId: string) {
  console.log("Deleting user from Supabase:", { userId });
  
  await deleteUser(userId);

  console.log("User deleted successfully:", { userId });
}

/**
 * Mirror Clerk public_metadata.themePreference to Supabase profiles.
 */
async function mirrorThemePreferenceToSupabase(
  clerkUserId: string,
  theme: unknown
) {
  try {
    const value = typeof theme === "string" ? theme.toLowerCase() : "";
    if (value !== "light" && value !== "dark" && value !== "system") return;

    // Create a one-off admin client (edge-safe)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Update profiles table (DB is DB-first for cohorts, but theme is Clerk-first)
    await supabase
      .from('profiles')
      .update({ theme_preference: value, updated_at: new Date().toISOString() })
      .eq('clerk_user_id', clerkUserId);
  } catch {
    // Intentionally swallow; webhook should not fail on mirror issues
  }
}

async function handleUserLogin(userId: string) {
  console.log("User login detected:", { userId });
  
  try {
    // Update last_active_at timestamp
    await updateLastActive(userId);
    console.log("User login recorded successfully:", { userId });
  } catch (error) {
    console.error("Error recording user login:", error);
    // Don't throw - login tracking is not critical
  }
}

async function handleUserLogout(userId: string) {
  console.log("User logout detected:", { userId });
  
  try {
    // Could add logout tracking here if needed
    // For now, just log the event
    console.log("User logout recorded successfully:", { userId });
  } catch (error) {
    console.error("Error recording user logout:", error);
    // Don't throw - logout tracking is not critical
  }
}
