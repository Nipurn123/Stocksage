// This script runs after npm install and handles Prisma setup
import { execSync } from 'child_process';

// Check if we're in Vercel build
const isVercelBuild = process.env.VERCEL === '1' && process.env.CI === '1';

try {
  if (isVercelBuild) {
    console.log('📊 Vercel build detected - using special Prisma setup');
    
    // Generate Prisma without accessing the database
    execSync('npx prisma generate --no-engine', { stdio: 'inherit' });
    
    console.log('✅ Generated Prisma client without database connection');
  } else {
    // Normal Prisma client generation
    console.log('📊 Generating Prisma client');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully');
  }
} catch (error) {
  console.error('❌ Error during postinstall script:', error);
  // Don't exit with error to allow builds to continue
} 