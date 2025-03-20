import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
const publicRoutes = [
  "/",
  "/sign-in*",
  "/sign-up*",
  "/api/webhook*",
  "/terms",
  "/privacy",
  "/invoices*",
  "/inventory*",
  "/dashboard*",
  "/reports*",
  "/financial*",
  "/customers*",
  "/supply-chain*"
];

export async function middleware(request: NextRequest) {
  const { userId } = await getAuth(request);
  
  // Allow public routes
  if (publicRoutes.some(route => {
    const pattern = new RegExp(route.replace('*', '.*'));
    return pattern.test(request.nextUrl.pathname);
  })) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 