import type { Metadata } from "next";
import { PostCard } from "@/components/content/cards";
import { JsonLd } from "@/components/content/chrome";
import { BLOG_TAGS, getAllPosts } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "../site";

const TITLE = "Small models, measured";
const DESCRIPTION =
  "Benchmarks, model comparisons and guides on fine-tuning small open models: what they cost, how fast they run and where they match a frontier LLM.";

export const metadata: Metadata = {
  title: `Blog | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { title: `${TITLE} | ${SITE_NAME} blog`, description: DESCRIPTION, url: "/blog", type: "website" },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;
  const tags = BLOG_TAGS.filter((t) => posts.some((p) => p.tag === t));

  // The filter is CSS only: a radio per tag, and one rule per tag that hides the other cards.
  const filterCss = tags
    .map((t) => `.blog-index:has(#tag-${t}:checked) [data-tag]:not([data-tag="${t}"]){display:none}`)
    .join("");

  return (
    <main className="blog-index">
      <JsonLd
        data={{
          "@type": "Blog",
          name: `${SITE_NAME} blog`,
          url: `${SITE_URL}/blog`,
          description: DESCRIPTION,
          blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.date })),
        }}
      />
      <header className="page-head">
        <p className="eyebrow">Blog</p>
        <h1>{TITLE}</h1>
        <p className="page-lede">{DESCRIPTION}</p>
      </header>

      {posts.length === 0 ? (
        <p className="empty">The first posts are on their way. Subscribe to the <a href="/feed.xml">RSS feed</a> to get them.</p>
      ) : (
        <>
          {tags.length > 1 && (
            <fieldset className="filters">
              <legend className="sr-only">Filter by type</legend>
              <style>{filterCss}</style>
              <input type="radio" name="tag" id="tag-all" defaultChecked />
              <label htmlFor="tag-all">All</label>
              {tags.map((t) => (
                <span key={t} className="filter">
                  <input type="radio" name="tag" id={`tag-${t}`} />
                  <label htmlFor={`tag-${t}`}>{t === "Company" || t === "Research" ? t : `${t}s`}</label>
                </span>
              ))}
            </fieldset>
          )}
          <PostCard post={featured} featured />
          {rest.length > 0 && (
            <ul className="post-grid">
              {rest.map((p) => (
                <li key={p.slug} data-tag={p.tag}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
