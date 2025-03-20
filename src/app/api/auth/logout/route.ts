import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirect_url') || '/';
  
  // Get the clerk-cookie header value to include in the response
  const clerkCookieHeader = request.headers.get('cookie') || '';
  
  // Create a response that will redirect the user
  const response = NextResponse.redirect(new URL(redirectUrl, request.url));
  
  // Clear all Clerk cookies
  const cookiesToClear = clerkCookieHeader
    .split(';')
    .map(cookie => cookie.trim().split('=')[0])
    .filter(name => 
      name.startsWith('__clerk') || 
      name.startsWith('__session') || 
      name.startsWith('__client')
    );
  
  // Clear each cookie by setting its expiration to the past
  cookiesToClear.forEach(name => {
    response.cookies.set({
      name,
      value: '',
      expires: new Date(0),
      path: '/',
    });
  });
  
  // Set a special header to tell the client to clear localStorage
  response.headers.set('X-Clear-Clerk-Storage', 'true');
  
  return response;
} 