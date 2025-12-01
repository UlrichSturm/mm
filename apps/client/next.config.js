/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone only for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig

