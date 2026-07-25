import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so stray parent lockfiles don't confuse Turbopack.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
