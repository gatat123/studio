/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['studio-backend-production.up.railway.app', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'studio-backend-production.up.railway.app',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'studio-backend-production.up.railway.app';
    const fullApiUrl = apiUrl.startsWith('http') ? apiUrl : `https://${apiUrl}`;
    
    return [
      {
        source: '/api/:path*',
        destination: `${fullApiUrl}/api/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
}

export default nextConfig