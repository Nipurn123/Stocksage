import { PrismaClient } from '@prisma/client';

// Detect if we're in a build context
const isBuildProcess = process.env.VERCEL_ENV === 'preview' && process.env.NODE_ENV === 'production';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a mock PrismaClient for build time to avoid connection errors
class MockPrismaClient {
  constructor() {
    return new Proxy({}, {
      get: () => async () => {
        console.log('Mock Prisma client used during build');
        return null;
      }
    });
  }
}

// Use a custom client config for better connection handling
const prismaClientSingleton = () => {
  if (isBuildProcess) {
    console.log('Using mock Prisma client for build');
    return new MockPrismaClient() as unknown as PrismaClient;
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = global.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma; 