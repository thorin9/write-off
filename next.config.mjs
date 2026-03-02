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
    serverComponentsExternalPackages: [
      'pdf-parse',
      '@prisma/client',
      'prisma',
      'twilio',
      'openai',
    ],
    outputFileTracingExcludes: {
      '*': [
        'node_modules/pdf-parse/test/**',
        'node_modules/@swc/**',
        'node_modules/esbuild/**',
        'node_modules/webpack/**',
      ],
    },
  },
}

export default nextConfig
