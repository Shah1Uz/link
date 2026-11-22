/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      "pk_test_bGl2ZS1oYWxpYnV0LTYzMDUuY2xlcmsuYWNjb3VudHMuZGV2JA",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.chunkLoadTimeout = 300000;
    }
    return config;
  },
};

export default nextConfig;

