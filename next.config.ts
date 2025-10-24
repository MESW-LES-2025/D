import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import './src/libs/Env';

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/': ['./migrations/**/*'],
  },
};

// Start with the base config
let configWithPlugins = baseConfig;

// Conditionally enable bundle analysis
if (process.env.ANALYZE === 'true') {
  configWithPlugins = withBundleAnalyzer()(configWithPlugins);
}

// No additional plugins needed for now

const nextConfig = configWithPlugins;
export default nextConfig;
