/** @type {import('next').NextConfig} */
const publicRotisserieTenants = [
  {
    slug: 'lafamilia',
    hosts: ['lafamiliaroti.com', 'www.lafamiliaroti.com'],
  },
  {
    slug: 'yoni247',
    hosts: ['yoni24hs.com', 'www.yoni24hs.com'],
  },
]

function hostCondition(host) {
  return { type: 'host', value: host }
}

const nextConfig = {
  experimental: {
    allowedDevOrigins: ['192.168.100.109', 'localhost', '127.0.0.1'],
  },
  swcMinify: false,
  async rewrites() {
    return {
      beforeFiles: publicRotisserieTenants.flatMap((tenant) =>
        tenant.hosts.flatMap((host) => {
          const has = [hostCondition(host)]
          return [
            { source: '/privacy', has, destination: `/${tenant.slug}/rotisserie/privacy` },
            { source: '/terms', has, destination: `/${tenant.slug}/rotisserie/terms` },
            { source: '/order/:orderId', has, destination: `/${tenant.slug}/rotisserie/order/:orderId` },
          ]
        }),
      ),
    }
  },
  async redirects() {
    return publicRotisserieTenants.flatMap((tenant) =>
      tenant.hosts.map((host) => ({
        source: `/${tenant.slug}/:path*`,
        has: [hostCondition(host)],
        destination: '/',
        permanent: false,
      })),
    )
  },
}

module.exports = nextConfig
