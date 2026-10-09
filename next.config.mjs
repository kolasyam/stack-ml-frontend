/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow mobile devices on LAN to access the dev server
  allowedDevOrigins: ['http://192.168.0.130:3000'],
  // Turbopack config (Next.js 16 default bundler — much faster than webpack)
  turbopack: {
    resolveAlias: {
      canvas: '',
    },
  },
  // react-pdf ships a worker + canvas deps that must not be bundled server-side.
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
