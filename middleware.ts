import { NextRequest, NextResponse } from 'next/server';

// Define public routes that don't need authentication
const publicRoutes = [
  '/api/webhooks/clerk',
  '/api/test',
  '/api/auth/request-password-reset',
  '/api/auth/reset-password/verify',
  '/reset-password',
  '/sign-in',
  '/sign-up',
  '/unauthorized',
  '/'
];

// Check if a path matches any public route pattern
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route.endsWith('(.*)')|| route.endsWith('(.*)')) {
      const baseRoute = route.replace('(.*)', '');
      return pathname.startsWith(baseRoute);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes to pass through
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // For protected routes, check if user has Clerk session cookies
  // Clerk can use different cookie names, so we check for common ones
  const sessionCookies = [
    '__session',
    '__clerk_session',
    '__clerk_db_jwt'
  ];
  
  const hasSession = sessionCookies.some(cookieName => 
    request.cookies.get(cookieName)?.value
  );
  
  if (!hasSession) {
    // Redirect to sign-in if no session
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals & static files unless in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

