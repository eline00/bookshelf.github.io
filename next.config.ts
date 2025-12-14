import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/bookshelf.github.io',
  assetPrefix: '/bookshelf.github.io/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
