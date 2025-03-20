import { PrismaClient } from '@prisma/client';

// Add prisma to the global type
declare global {
  var cachedPrisma: PrismaClient;
}

// Prevent multiple instances during hot reloading in development
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

export { prisma }; 