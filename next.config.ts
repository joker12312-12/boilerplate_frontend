/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const HOSTNAME = process.env.NEXT_PUBLIC_HOSTNAME || 'boiler.local';
const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL || 'boilerplate.local';

const nextConfig = {
  env: {
    WP_GRAPHQL_URL: process.env.WP_GRAPHQL_URL || 'http://localhost:3000/graphql',
  },
  images: {
    remotePatterns: [
      // Ad images
      {
        protocol: 'https',
        hostname: 'track.adtraction.com',
        pathname: '/t/**',
      },
      // Your site(s)
      {
        protocol: 'https',
        hostname: 'newfinanstid.kinsta.cloud',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'staging6.finanstidning.se', // <- fixed (no scheme, no slash)
        pathname: '/**',
      },
      // Local/dev hosts (note: these are http; update to https if applicable)
      {
        protocol: 'http',
        hostname: HOSTNAME,
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: HOST_URL,
        pathname: '/**',
      },
      // Gravatar
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
