import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: ["sharp"],
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
};
export default config;
