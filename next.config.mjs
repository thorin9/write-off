/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Limit worker processes to avoid EAGAIN on resource-constrained envs
    workerThreads: false,
    cpus: 1,
  },
  eslint: {
    // Allow production builds to succeed even with ESLint warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even with type warnings
    ignoreBuildErrors: false,
  },
}

export default nextConfig
