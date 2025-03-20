import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { getDbUser } from '@/lib/db/userStorage';

const GUEST_COOKIE_NAME = 'stocksage_guest_session';
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Creates a new guest session and returns the guest user ID
 * @returns Guest user ID
 */
export async function createGuestSession() {
  const guestId = uuidv4();
  
  // Store the guest ID in a cookie
  const cookieStore = cookies();
  cookieStore.set({
    name: GUEST_COOKIE_NAME,
    value: guestId,
    maxAge: GUEST_COOKIE_MAX_AGE,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  
  return `guest_${guestId}`;
}

/**
 * Gets the current guest session ID from the cookie
 * @returns Guest session ID or null if not found
 */
export function getGuestSessionId(): string | null {
  const cookieStore = cookies();
  const guestCookie = cookieStore.get(GUEST_COOKIE_NAME);
  
  return guestCookie?.value || null;
}

/**
 * Checks if a user ID is from a guest session
 * @param userId The user ID to check
 * @returns Whether the user ID is from a guest session
 */
export function isGuestUserId(userId: string): boolean {
  return userId.startsWith('guest_');
}

/**
 * Clear the guest session cookie
 */
export function clearGuestSession() {
  const cookieStore = cookies();
  cookieStore.delete(GUEST_COOKIE_NAME);
} 