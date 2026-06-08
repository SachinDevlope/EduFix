/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mongoose + native deps should not be bundled for the server runtime.
  serverExternalPackages: ['mongoose', 'mongodb-memory-server', 'bcryptjs', 'pdfkit', 'exceljs'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
};

export default nextConfig;
