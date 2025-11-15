/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // This is the fix for the 'undici' module parse error.
    // It tells Webpack that for the client-side build (!isServer),
    // the 'undici' module should be treated as an empty file (false).
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        undici: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
