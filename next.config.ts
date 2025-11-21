import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: './',
  },
  images: {
    qualities: [75, 85],
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pinimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;