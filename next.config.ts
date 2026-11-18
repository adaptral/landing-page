import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // These hosts are attached to the Vercel project only so they can land on the primary domain.
  redirects: async () =>
    ["www.adaptral.com", "adaptral.co", "www.adaptral.co", "tryadaptral.com", "www.tryadaptral.com"].map(
      (host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: "https://adaptral.com/:path*",
        permanent: true,
      }),
    ),
};

export default nextConfig;
