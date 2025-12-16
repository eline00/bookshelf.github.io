import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/bookshelf.github.io' : '',
  assetPrefix: isProd ? '/bookshelf.github.io/' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
