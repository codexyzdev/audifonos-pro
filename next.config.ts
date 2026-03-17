import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // No special configuration required for this app
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

export default nextConfig
