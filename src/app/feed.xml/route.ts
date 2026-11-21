import { getAllPosts, getAllSignals } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "../site";

// Built once per deploy: a new post is a new deploy, so the feed is never staler than the site.
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rfc822 = (iso: string) => new Date(`${iso}T00:00:00Z`).toUTCString();

export function GET() {
  const items = [
    ...getAllPosts().map((p) => ({ ...p, path: `/blog/${p.slug}`, category: p.tag })),
    ...getAllSignals().map((p) => ({ ...p, path: `/signal/${p.slug}`, category: `Signal: ${p.format}` })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${SITE_NAME}: small models, measured</title>
<link>${SITE_URL}/blog</link>
<description>Benchmarks, model comparisons and guides on fine-tuning small open models.</description>
<language>en</language>
<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items[0] ? `<lastBuildDate>${rfc822(items[0].updated)}</lastBuildDate>` : ""}
${items
  .map(
    (p) => `<item>
<title>${esc(p.title)}</title>
<link>${SITE_URL}${p.path}</link>
<guid isPermaLink="true">${SITE_URL}${p.path}</guid>
<pubDate>${rfc822(p.date)}</pubDate>
<dc:creator>${esc(p.author)}</dc:creator>
<category>${esc(p.category)}</category>
<description>${esc(p.description)}</description>
</item>`,
  )
  .join("\n")}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
