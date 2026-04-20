/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/ollama/:path*",
        destination: "http://127.0.0.1:11434/:path*",
      },
    ];
  },
  serverExternalPackages: [],  // ← fixed (was experimental.serverComponentsExternalPackages)
};

export default nextConfig;