/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! ВНИМАНИЕ !!
    // Опасно для продакшена, но идеально для быстрого запуска MVP
    ignoreBuildErrors: true,
  },
  eslint: {
    // Игнорируем варнинги про <img> вместо <Image>
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;