import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Move the dev-only indicator to the bottom-right so it never overlaps the left sidebar's
  // "Sign out" control. This affects the development overlay only; it does not ship to production.
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
