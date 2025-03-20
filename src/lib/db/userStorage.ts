import { prisma } from '@/lib/db';
import { getUserId } from '@/lib/auth/getUserId';

/**
 * Utility functions for handling user data in the database,
 * taking into account both regular users and guest users
 */

/**
 * Creates or retrieves a user record in the database
 * @returns The user database record
 */
export async function getDbUser() {
  const userId = await getUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Check if user exists in the database
  let dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  // If not, create a new user record
  if (!dbUser) {
    // Check if it's a guest user (guest IDs start with "guest_")
    const isGuest = userId.startsWith('guest_');
    
    // Create default empty data for the user
    const defaultData = isGuest ? {
      name: 'Guest User',
      email: `${userId.replace('guest_', '')}@stocksage-temp.com`,
      password: 'temporary-password', // Will be replaced on account upgrade
      role: 'guest',
    } : {
      name: 'New User',
      email: `user_${userId}@stocksage-temp.com`,
      password: 'temporary-password', // Should be replaced with proper auth
      role: 'user',
    };
    
    dbUser = await prisma.user.create({
      data: {
        id: userId,
        ...defaultData,
      },
    });
  }
  
  return dbUser;
}

/**
 * Gets all data for a specific user
 * @param includeRelations Whether to include related records
 * @returns User data with optional relations
 */
export async function getUserData(includeRelations = false) {
  const userId = await getUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Ensure the user exists in the database
  await getDbUser();
  
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: includeRelations ? {
      // Include relations as needed based on schema
      accounts: true,
      sessions: true,
    } : undefined,
  });
  
  return userData;
}

/**
 * Example function to save user-specific data
 * @param data The data to save
 * @returns The created record
 */
export async function saveUserData(data: any) {
  const userId = await getUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Ensure user exists in the database
  const user = await getDbUser();
  
  // Example of saving data associated with the user
  // This would be customized based on your schema
  // For example, creating a new product for the user
  const result = await prisma.product.create({
    data: {
      ...data,
      userId: user.id,
    },
  });
  
  return result;
} 