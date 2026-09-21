/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'coresg-normal.trae.ai' },
    ],
  },
  async rewrites() {
    // PROXY TRANSPARENTE: /api/* → backend real (Render / localhost:3001)
    // Evita problema de CORS em produção e unifica a URL base.
    // Se NEXT_PUBLIC_API_BASE_URL for "/api" (modo local antigo ou não definido),
    // não aplica rewrite nenhum.
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    if (!apiBase || apiBase.startsWith('/')) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase.replace(/\/api\/?$/, '')}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
