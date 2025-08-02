/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for API routes during build
  experimental: {
    serverComponentsExternalPackages: ['mongodb']
  },
  // Set environment variables for build time
  env: {
    NEXT_PHASE: process.env.NEXT_PHASE || 'phase-production-build'
  }
};

export default nextConfig;
