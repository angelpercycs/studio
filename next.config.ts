import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/ads.txt',
        destination: 'https://srv.adstxtmanager.com/19390/fszscore.com',
        permanent: true,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hvpbekkmegtfrzgztfoy.supabase.co',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
