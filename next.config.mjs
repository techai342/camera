/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  output: 'standalone',
  productionBrowserSourceMaps: false, // Prevents original .tsx / .ts source maps from leaking in DevTools Sources tab
  allowedDevOrigins: [
    'localhost:3000',
    'localhost:3001',
    '*.run.app'
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet', // Blocks scrapers, web archivers, and Google cache
          },
          {
            key: 'X-Download-Options',
            value: 'noopen',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
