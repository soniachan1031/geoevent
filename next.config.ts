import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`,
      },
      {
        protocol: "https",
        hostname: `s1.ticketm.net`,
      },
      {
        protocol: "https",
        hostname: `images.universe.com`,
      },
    ],
  },
};

export default nextConfig;
