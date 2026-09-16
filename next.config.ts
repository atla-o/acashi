import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Cloud Run image (see Dockerfile).
  output: "standalone",
  serverExternalPackages: ["@google-cloud/firestore"],
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
