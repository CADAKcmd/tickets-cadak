import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: './',
  },
  images: {
    qualities: [75, 85],
  },
};

export default nextConfig;
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pinimg.com', pathname: '/**' },
      // add any others you might use:
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;