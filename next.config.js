/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ['192.168.100.109', 'localhost', '127.0.0.1'],
  },
  swcMinify: false,
  async rewrites() {
    const yoniHosts = [
      { type: 'host', value: 'yoni24hs.com' },
      { type: 'host', value: 'www.yoni24hs.com' },
    ];
    return {
      beforeFiles: yoniHosts.flatMap((has) => [
        { source: '/privacy', has: [has], destination: '/yoni247/rotisserie/privacy' },
        { source: '/terms', has: [has], destination: '/yoni247/rotisserie/terms' },
        { source: '/order/:orderId', has: [has], destination: '/yoni247/rotisserie/order/:orderId' },
      ]),
    };
  },
  async redirects() {
    return [
      { source: '/yoni247/:path*', has: [{ type: 'host', value: 'yoni24hs.com' }], destination: '/', permanent: false },
      { source: '/yoni247/:path*', has: [{ type: 'host', value: 'www.yoni24hs.com' }], destination: '/', permanent: false },
    ];
  },
}

module.exports = nextConfig
