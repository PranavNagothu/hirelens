import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Move the dev-only indicator to the bottom-right so it never overlaps the left sidebar.
  devIndicators: {
    position: "bottom-right",
  },
  // Don't bundle the résumé parsers into the serverless function. pdf-parse pulls in pdfjs, which
  // breaks when bundled for Vercel's serverless runtime; keeping these external loads them from
  // node_modules at runtime instead. This is what fixes the upload route's 500 on Vercel.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
