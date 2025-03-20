import { auth } from '@clerk/nextjs/server';

/**
 * Gets the current user ID from the Clerk session, handling both regular users and guests
 * @returns User ID string or null if not authenticated
 */
export async function getUserId() {
  const authResult = await auth();
  const { userId } = authResult;
  
  if (!userId) {
    return null;
  }
  
  // Check if user is a guest (has guestId in publicMetadata)
  const publicMetadata = authResult.sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
  const guestId = publicMetadata?.guestId as string | undefined;
  const role = publicMetadata?.role as string | undefined;
  
  if (guestId && role === 'guest') {
    // Return the guest ID with a prefix to distinguish it in the database
    return `guest_${guestId}`;
  }
  
  // Return the regular user ID
  return userId;
}

export default getUserId; 