import type { MetadataRoute } from "next";
import { AUTHORS } from "@/lib/authors";
import { getAllPosts, getAllSignals } from "@/lib/content";
import { SITE_URL } from "./site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const signals = getAllSignals();
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: posts[0]?.updated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/signal`, lastModified: signals[0]?.updated, changeFrequency: "daily", priority: 0.6 },
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updated, priority: 0.7 })),
    ...signals.map((p) => ({ url: `${SITE_URL}/signal/${p.slug}`, lastModified: p.updated, priority: 0.5 })),
    ...AUTHORS.map((a) => ({ url: `${SITE_URL}/blog/authors/${a.slug}`, priority: 0.3 })),
  ];
}
