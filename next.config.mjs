/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // react-pdf ships a worker + canvas deps that must not be bundled server-side.
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  // eslint: {
  //   // Lint is run separately in CI; don't block production builds on it.
  //   ignoreDuringBuilds: true,
  // },
};

export default nextConfig;
