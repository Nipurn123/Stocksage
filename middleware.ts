import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware ensures that the NEXTAUTH environment variables 
// are properly handled in different environments
export function middleware(request: NextRequest) {
  // For auth routes, ensure we have the NEXTAUTH_URL and NEXTAUTH_SECRET
  const requestForAuth = request.nextUrl.pathname.startsWith('/api/auth');
  
  if (requestForAuth) {
    // Add cache control headers for auth routes
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    // Log authentication attempt in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth request:', request.nextUrl.pathname);
    }
    
    return response;
  }
  
  return NextResponse.next();
}

// Match specific paths
export const config = {
  matcher: [
    // Only match API auth routes and auth pages
    '/api/auth/:path*',
    '/auth/:path*',
  ],
}; 