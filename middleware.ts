import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/api/webhooks/clerk',
  '/api/webhooks/clerk/(.*)',
  '/api/test',
  '/api/auth/request-password-reset',
  '/api/auth/reset-password/verify',
  '/reset-password(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/unauthorized'
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // 1) Let public routes pass through
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 2) Protect everything else
  await auth.protect();

  // 3) Extra gate for admin routes (role check happens deeper)
  if (isAdminRoute(req)) {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // The server-side requireRole() in the layout will handle the actual role check
    // This middleware just ensures authentication for admin routes
  }
  // default allow
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
