import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware ensures that the NEXTAUTH environment variables 
// are properly handled in different environments
export function middleware(request: NextRequest) {
  // Just pass through all requests
  return NextResponse.next();
}

// Only match specific paths where we need NextAuth to work
export const config = {
  matcher: [
    // Match all API routes 
    '/api/:path*',
    // Match auth routes
    '/auth/:path*',
    // Exclude static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 