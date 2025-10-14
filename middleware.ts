import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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

export default clerkMiddleware(async (auth, req) => {
  // Let public routes pass through without protection
  if (isPublicRoute(req)) {
    return;
  }

  // Protect all other routes
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals & static files unless in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

