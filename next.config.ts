import type { NextConfig } from "next";

// Su GitHub Pages il sito vive in /sistema-report-strategico/;
// in locale (npm run dev) resta sulla radice.
const suPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: suPages ? "/sistema-report-strategico" : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
