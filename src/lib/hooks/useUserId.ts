'use client';

import { useUser } from '@clerk/nextjs';

/**
 * Hook to get the current user ID, handling both regular users and guests
 * @returns User ID string or null if not authenticated
 */
export function useUserId() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) {
    return null;
  }
  
  if (!user) {
    return null;
  }
  
  // Check if user is a guest (has guestId in publicMetadata)
  const guestId = user.publicMetadata.guestId as string | undefined;
  const role = user.publicMetadata.role as string | undefined;
  
  if (guestId && role === 'guest') {
    // Return the guest ID with a prefix to distinguish it in the database
    return `guest_${guestId}`;
  }
  
  // Return the regular user ID
  return user.id;
}

export default useUserId; 