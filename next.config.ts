import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig : NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },{
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '**',
      },{
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '**',
      },{
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      }
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);