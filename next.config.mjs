/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
    serverComponentsExternalPackages: ['pdf-parse', '@prisma/client', 'prisma'],
  },
}

export default nextConfig
