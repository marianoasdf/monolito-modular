/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ['192.168.100.109', 'localhost', '127.0.0.1'],
  },
  swcMinify: false,
}

module.exports = nextConfig
