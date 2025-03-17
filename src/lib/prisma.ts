import { PrismaClient } from '@prisma/client';

// Explicitly check for Vercel build environment
const isVercelBuild = process.env.VERCEL === '1' && process.env.CI === '1';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Mock PrismaClient for build environment
class MockPrismaClient {
  constructor() {
    console.log('Using mock Prisma client for Vercel build');
    return new Proxy({}, {
      get: () => () => {
        return new Proxy({}, {
          get: () => () => {
            console.log('Mock Prisma method called during build');
            return Promise.resolve(null);
          }
        });
      }
    }) as unknown as PrismaClient;
  }
}

// Create client singleton
const createPrismaClient = () => {
  if (isVercelBuild) {
    return new MockPrismaClient() as unknown as PrismaClient;
  }
  
  return new PrismaClient();
};

// Use existing global client or create a new one
export const prisma = global.prisma || createPrismaClient();

// Set global prisma in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') global.prisma = prisma; 