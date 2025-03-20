import { NextResponse } from 'next/server';
import { Clerk } from '@clerk/clerk-sdk-node';

// Initialize Clerk client with the secret key
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Guest user pool configuration
const GUEST_USER_PREFIX = 'stocksage_guest_';
const MAX_GUEST_USERS = 10; // Limit the number of guest users in the pool

interface ClerkError {
  status?: number;
  errors?: Array<{ code: string; message: string }>;
}

export async function POST() {
  try {
    // First, try to reuse an existing guest user from our pool
    const existingGuestUsers = await findExistingGuestUsers();
    
    if (existingGuestUsers.length > 0) {
      // Return a random guest user from the pool
      const randomIndex = Math.floor(Math.random() * existingGuestUsers.length);
      const guestUser = existingGuestUsers[randomIndex];
      
      // Update the last accessed timestamp
      await clerk.users.updateUser(guestUser.id, {
        publicMetadata: {
          ...guestUser.publicMetadata,
          lastAccessed: Date.now(),
        },
      });
      
      return NextResponse.json({
        success: true,
        userId: guestUser.id,
        email: guestUser.emailAddresses[0].emailAddress,
        password: guestUser.publicMetadata.password,
        guestId: guestUser.publicMetadata.guestId,
        reused: true,
      });
    }
    
    // If no guest users are available, create a new one
    const guestId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const email = `${GUEST_USER_PREFIX}${guestId}@stocksage-temp.com`;
    const password = `Guest_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
    const username = `guest_${Math.random().toString(36).substring(2, 8)}`;
    
    // Create the guest user in Clerk with proper metadata
    const user = await clerk.users.createUser({
      emailAddress: [email],
      password,
      firstName: 'Guest',
      lastName: 'User',
      username,
      publicMetadata: {
        role: 'guest',
        guestId,
        password,
        created: Date.now(),
        lastAccessed: Date.now(),
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      userId: user.id,
      email,
      password,
      guestId,
      reused: false,
    });
  } catch (error) {
    console.error('Error creating guest user:', error);
    
    // If we hit the user quota limit, try to clean up old guest users
    const clerkError = error as ClerkError;
    if (clerkError.status === 403 && clerkError.errors?.[0]?.code === 'user_quota_exceeded') {
      try {
        await cleanupOldGuestUsers();
        return NextResponse.json(
          { success: false, error: 'User limit reached. Please try again.' },
          { status: 429 }
        );
      } catch (cleanupError) {
        console.error('Error cleaning up guest users:', cleanupError);
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create guest user' },
      { status: 500 }
    );
  }
}

/**
 * Find existing guest users in the Clerk database
 */
async function findExistingGuestUsers() {
  try {
    const users = await clerk.users.getUserList({
      limit: 50,
    });
    
    return users.filter(user => {
      return user.publicMetadata?.role === 'guest';
    });
  } catch (error) {
    console.error('Error finding existing guest users:', error);
    return [];
  }
}

/**
 * Clean up old guest users to make room for new ones
 */
async function cleanupOldGuestUsers() {
  try {
    const guestUsers = await findExistingGuestUsers();
    
    // Sort by last accessed time (oldest first)
    guestUsers.sort((a, b) => {
      const aTime = Number(a.publicMetadata?.lastAccessed || a.publicMetadata?.created || 0);
      const bTime = Number(b.publicMetadata?.lastAccessed || b.publicMetadata?.created || 0);
      return aTime - bTime;
    });
    
    // Keep only the MAX_GUEST_USERS newest guests, delete the rest
    const usersToDelete = guestUsers.slice(0, Math.max(0, guestUsers.length - MAX_GUEST_USERS));
    
    for (const user of usersToDelete) {
      await clerk.users.deleteUser(user.id);
      console.log(`Deleted old guest user: ${user.id}`);
    }
    
    return usersToDelete.length;
  } catch (error) {
    console.error('Error cleaning up guest users:', error);
    return 0;
  }
} 