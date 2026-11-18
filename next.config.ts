import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // www is attached to the Vercel project only so it can land here
  redirects: async () => [
    {
      source: "/:path*",
      has: [{ type: "host", value: "www.adaptral.com" }],
      destination: "https://adaptral.com/:path*",
      permanent: true,
    },
  ],
};

export default nextConfig;
