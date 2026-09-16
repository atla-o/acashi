import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Cloud Run image (see Dockerfile).
  output: "standalone",
  serverExternalPackages: ["@google-cloud/firestore"],
};

export default nextConfig;
