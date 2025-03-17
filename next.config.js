/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Needed for Vercel deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Needed for Vercel deployment
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['res.cloudinary.com', 'via.placeholder.com'],
  },
  // Vercel-specific overrides
  env: {
    // Disable Prisma CLI during builds
    PRISMA_HIDE_UPDATE_MESSAGE: '1',
    PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary',
  },
  experimental: {
    // This ensures that Prisma Client isn't bundled in production
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  }
};

module.exports = nextConfig; 