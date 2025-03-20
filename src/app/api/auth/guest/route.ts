import { NextResponse } from 'next/server';
import { createGuestSession, getGuestSessionId, clearGuestSession } from '@/lib/auth/guestAuth';
import { getDbUser } from '@/lib/db/userStorage';

/**
 * Create a new guest session
 */
export async function POST(request: Request) {
  try {
    // Create a new guest session
    const guestId = await createGuestSession();
    
    // Create a database user for this guest
    await getDbUser();
    
    return NextResponse.json({ success: true, guestId });
  } catch (error) {
    console.error('Failed to create guest session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create guest session' },
      { status: 500 }
    );
  }
}

/**
 * Check if the current user has a guest session
 */
export async function GET(request: Request) {
  const guestId = getGuestSessionId();
  
  return NextResponse.json({
    hasGuestSession: Boolean(guestId),
    guestId,
  });
}

/**
 * Delete the guest session
 */
export async function DELETE(request: Request) {
  clearGuestSession();
  
  return NextResponse.json({ success: true });
} 