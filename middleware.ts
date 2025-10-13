import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Keep this tiny and explicit:
 * - Make "/" (homepage) public
 * - Allow sign-in route
 * - Protect everything else
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/favicon.ico",
  "/api/webhooks/clerk",
  "/api/webhooks/clerk/(.*)",
  "/api/test",
  "/api/auth/request-password-reset",
  "/api/auth/reset-password/verify",
  "/reset-password(.*)",
  "/sign-in(.*)",
  "/unauthorized",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Public routes bypass auth
  if (isPublicRoute(req)) return NextResponse.next();

  // Everything else requires auth
  await auth.protect();

  // Extra gate for admin URLs (role/claims can be verified deeper in server components)
  if (isAdminRoute(req)) {
    const { userId } = await auth();
    if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals & static files unless in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
