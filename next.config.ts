import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  headers: async () => [
    {
      source: "/.well-known/apple-app-site-association",
      headers: [{ key: "Content-Type", value: "application/json" }],
    },
  ],
};

export default nextConfig;
