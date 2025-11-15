/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // This is the fix for the 'undici' module parse error during 'next build'
    // It tells Webpack to treat 'undici' as an external module
    // that shouldn't be bundled.
    if (!isServer) {
      config.externals = [...config.externals, 'undici'];
    }

    return config;
  },
};

module.exports = nextConfig;
