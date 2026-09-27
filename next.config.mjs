/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Remplacer par le domaine du projet Supabase de Rug You Too
        // (Storage sert les fichiers depuis <project-ref>.supabase.co)
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // marge pour les uploads de design (logo/photo) via Server Actions
    },
  },
};

export default nextConfig;
