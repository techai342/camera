/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  output: 'standalone',
  allowedDevOrigins: [
    'localhost:3000',
    'localhost:3001',
    '*.run.app'
  ],
};

export default nextConfig;
