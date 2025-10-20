import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Keep this tiny and explicit:
 * - Make "/" (homepage) public
 * - Allow sign-in route
 * - Protect everything else
 */
const isHome = createRouteMatcher(["/"]);
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

type ClaimsWithRole = {
  publicMetadata?: { role?: string };
  metadata?: { role?: string };
};

function getRoleFromClaims(claims: unknown): string | undefined {
  const c = claims as ClaimsWithRole | null;
  return c?.publicMetadata?.role ?? c?.metadata?.role;
}

export default clerkMiddleware(async (auth, req) => {
  // If visiting "/" and already signed in, redirect before rendering
  if (isHome(req)) {
    const { userId, sessionClaims } = await auth();
    if (userId) {
      const role = getRoleFromClaims(sessionClaims);
      const to = role === "admin" ? "/admin" : "/student";
      return NextResponse.redirect(new URL(to, req.url));
    }
    return NextResponse.next();
  }

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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
