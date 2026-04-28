/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '.prisma/client'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'levelupingermany.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.levelupingermany.com', pathname: '/**' },
      // Vercel Blob (admin uploads in production)
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
