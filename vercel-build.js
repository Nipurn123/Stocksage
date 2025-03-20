// Script to ensure environment variables are set before building
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define required environment variables with fallbacks
const requiredEnvVars = {
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_c2tpbGxlZC1sZW1taW5nLTIwLmNsZXJrLmFjY291bnRzLmRldiQ',
  CLERK_SECRET_KEY: 'sk_test_y46cwHjdgNBc6OChMEvY3mzyZrFz0cqAsWbToYxvQy',
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/auth/login',
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/auth/register',
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/dashboard',
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/dashboard',
  
  // NextAuth
  NEXTAUTH_SECRET: 'd41d8cd98f00b204e9800998ecf8427e4b6de62a859c9a0ae9af5c86c7ad1b89',
  NEXTAUTH_URL: 'https://stocksage-9tyl83cxr-nipurns-projects-738e757b.vercel.app',
  NEXTAUTH_DEBUG: 'false',
  
  // Stripe placeholders
  STRIPE_SECRET_KEY: 'placeholder_key',
  STRIPE_PUBLISHABLE_KEY: 'placeholder_key',
  STRIPE_WEBHOOK_SECRET: 'placeholder_key',
};

// Check for missing environment variables and apply fallbacks
let missingVars = [];
let updatedVars = false;

Object.entries(requiredEnvVars).forEach(([key, fallbackValue]) => {
  if (!process.env[key]) {
    console.log(`Setting missing environment variable: ${key}`);
    process.env[key] = fallbackValue;
    missingVars.push(key);
    updatedVars = true;
  }
});

// If any vars were missing, log them
if (missingVars.length > 0) {
  console.log('\n⚠️ The following environment variables were not set and fallbacks were applied:');
  missingVars.forEach(key => console.log(`  - ${key}`));
  console.log('\nThis may cause issues in production. Please set these in your Vercel project settings.\n');
}

// Run the build command
try {
  console.log('\n🚀 Running Next.js build with environment variables applied...\n');
  execSync('next build', { stdio: 'inherit' });
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
} 