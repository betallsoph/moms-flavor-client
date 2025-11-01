import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Tắt các indicator trong development mode
  devIndicators: false,
};

export default nextConfig;
