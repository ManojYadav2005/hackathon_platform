/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js to run the 'undici' package through its own compiler.
  // This should fix the modern JavaScript syntax error (!#target in this).
  transpilePackages: ['undici'],
};

module.exports = nextConfig;
