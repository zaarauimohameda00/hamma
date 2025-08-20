/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  async rewrites() {
    return [
      {
        source: '/api/admin/:path*',
        destination: process.env.NEXT_PUBLIC_ADMIN_API_URL
          ? `${process.env.NEXT_PUBLIC_ADMIN_API_URL}/:path*`
          : 'http://localhost:4000/:path*',
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  }
}

module.exports = nextConfig

