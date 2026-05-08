/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '.prisma/client'],
  },
  eslint: {
    // ESLint runs locally and in CI; do not block production builds on lint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'levelupingermany.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.levelupingermany.com', pathname: '/**' },
      // Vercel Blob (admin uploads in production)
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
    ],
  },
  async headers() {
    // Baseline security headers applied to every route. CSP is intentionally
    // omitted for now to avoid breaking embedded YouTube / Vercel Blob assets;
    // it should be added in report-only mode first, then enforced.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
