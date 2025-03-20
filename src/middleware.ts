import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth(.*)',
  '/api/auth(.*)',
  '/terms',
  '/privacy',
  '/_next(.*)',
  '/favicon.ico',
  '/site.webmanifest',
]);

// Define routes that are accessible to guest users
const isGuestAccessibleRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/inventory(.*)',
  '/invoices(.*)',
  '/customers(.*)',
  '/reports(.*)',
  '/financial-dashboard(.*)',
  '/supply-chain(.*)',
]);

// Define routes that require full authentication
const isAuthenticatedOnlyRoute = createRouteMatcher([
  '/api/inventory/create(.*)',
  '/api/inventory/update(.*)',
  '/api/inventory/delete(.*)',
  '/api/invoices/create(.*)',
  '/api/invoices/update(.*)',
  '/api/invoices/delete(.*)',
  '/api/customers/create(.*)',
  '/api/customers/update(.*)',
  '/api/customers/delete(.*)',
  '/api/reports/generate(.*)',
  '/api/settings(.*)',
]);

interface CustomPublicMetadata {
  role?: string;
}

// Safe check for environment variables
const checkEnvVars = () => {
  try {
    // Check both variables
    return Boolean(
      process.env.CLERK_SECRET_KEY && 
      process.env.CLERK_SECRET_KEY.length > 10 &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 10
    );
  } catch (error) {
    console.warn("Error checking Clerk credentials:", error);
    return false;
  }
};

// Simple middleware as fallback
function simpleFallbackMiddleware(req: Request) {
  console.warn("Using simplified middleware due to missing Clerk credentials");
  
  // Allow all public routes
  const url = new URL(req.url);
  if (
    url.pathname === '/' || 
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api/auth') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/site.webmanifest'
  ) {
    return new Response();
  }
  
  // For non-public routes without auth, redirect to login
  return Response.redirect(new URL('/auth/login', req.url));
}

// Choose middleware implementation based on environment
const middlewareImplementation = checkEnvVars()
  ? clerkMiddleware(async (auth, req) => {
      try {
        // Allow public routes without any checks
        if (isPublicRoute(req)) {
          return;
        }

        // Check if there's a Clerk error in the query parameters
        const url = new URL(req.url);
        if (url.searchParams.has('clerkError')) {
          // Redirect to the error page
          return Response.redirect(new URL('/auth/error', req.url));
        }

        try {
          const { userId, sessionClaims } = await auth();
          const metadata = sessionClaims?.publicMetadata as CustomPublicMetadata;
          const isGuestUser = metadata?.role === 'guest';

          // If user is a guest, handle guest-specific access
          if (isGuestUser) {
            // Block access to authenticated-only routes for guest users
            if (isAuthenticatedOnlyRoute(req)) {
              return Response.json(
                { success: false, error: "This action is not available in guest mode" },
                { status: 403 }
              );
            }

            // If not a guest-accessible route, redirect to home
            if (!isGuestAccessibleRoute(req)) {
              return Response.redirect(new URL('/', req.url));
            }

            return;
          }

          // For all other routes, require authentication
          await auth.protect();
        } catch (error: any) {
          // Handle Clerk errors better
          console.error('Auth error in middleware:', error.message);
          
          // If this is a known Clerk error, handle it
          const isClerkError = error.message?.includes('Unable to authenticate') || 
                              error.message?.includes('Check your Clerk cookies') ||
                              error.message?.includes('Missing') ||
                              error.message?.includes('Invalid') ||
                              error.message?.includes('token');
                              
          if (isClerkError) {
            // For API routes, return a JSON error
            if (req.url.includes('/api/')) {
              return Response.json(
                { success: false, error: "Authentication failed" },
                { status: 401 }
              );
            }
            
            // For other routes, redirect to login
            return Response.redirect(new URL('/auth/login', req.url));
          }
          
          // For other auth errors, let Clerk handle them
          throw error;
        }
      } catch (error) {
        console.error('Middleware error:', error);
        // Let the request continue and let Clerk handle any errors
        return;
      }
    })
  : simpleFallbackMiddleware;

export default middlewareImplementation;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
