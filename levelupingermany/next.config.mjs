/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'levelupingermany.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
