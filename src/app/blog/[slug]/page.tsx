import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cover, PostCard } from "@/components/content/cards";
import { Breadcrumbs, JsonLd, ORGANIZATION, PostCta, ReadingProgress } from "@/components/content/chrome";
import { Prose } from "@/components/content/prose";
import { TableOfContents } from "@/components/content/toc";
import { authorByName, personSchema } from "@/lib/authors";
import { formatDate, getAllPosts, getFaq, getHeadings, getPost } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "../../site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

const live = (slug: string) => getAllPosts().some((p) => p.slug === slug);

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!live(slug)) return {};
  const { meta } = getPost(slug);
  return {
    title: meta.seoTitle ?? `${meta.title} | ${SITE_NAME}`,
    description: meta.description,
    alternates: { canonical: `/blog/${slug}` },
    authors: [{ name: meta.author }],
    // og:image comes from opengraph-image.tsx in this folder (a PNG every unfurler renders).
    openGraph: {
      type: "article",
      url: `/blog/${slug}`,
      title: meta.title,
      description: meta.description,
      publishedTime: meta.date,
      modifiedTime: meta.updated,
      authors: [meta.author],
      tags: [meta.tag],
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  if (!live(slug)) notFound();
  const { meta, content } = getPost(slug);
  const headings = getHeadings(content);
  const faq = getFaq(content);
  const author = authorByName(meta.author);
  const url = `${SITE_URL}/blog/${slug}`;
  const all = getAllPosts();
  // Read next: the ones the author picked, then the newest of the same tag, then the newest.
  const next = [
    ...all.filter((p) => meta.related.includes(p.slug)),
    ...all.filter((p) => p.tag === meta.tag),
    ...all,
  ]
    .filter((p, i, list) => p.slug !== slug && list.findIndex((q) => q.slug === p.slug) === i)
    .slice(0, 2);

  return (
    <>
      <JsonLd
        data={{
          "@type": "BlogPosting",
          headline: meta.title,
          description: meta.description,
          image: `${url}/opengraph-image`,
          datePublished: meta.date,
          dateModified: meta.updated,
          author: author ? personSchema(author) : { "@id": ORGANIZATION["@id"] },
          publisher: ORGANIZATION,
          mainEntityOfPage: url,
          articleSection: meta.tag,
        }}
      />
      {faq.length > 0 && (
        <JsonLd
          data={{
            "@type": "FAQPage",
            mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
          }}
        />
      )}
      <ReadingProgress />

      <main className="post">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: meta.title, href: `/blog/${slug}` },
          ]}
        />

        <header className="post-head">
          <p className="eyebrow">{meta.tag}</p>
          <h1>{meta.title}</h1>
          <p className="page-lede">{meta.description}</p>
          <p className="byline">
            {author ? (
              <Link href={`/blog/authors/${author.slug}`} rel="author" className="byline-author">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={author.photo} alt="" width={28} height={28} />
                {author.name}
              </Link>
            ) : (
              <span className="byline-author">{meta.author}</span>
            )}
            <span>
              <time dateTime={meta.date}>{formatDate(meta.date)}</time>
            </span>
            {meta.updated !== meta.date && (
              <span>
                Updated <time dateTime={meta.updated}>{formatDate(meta.updated)}</time>
              </span>
            )}
            <span>{meta.readingTime} min read</span>
            {meta.draft && <span className="draft-badge">Draft: not published</span>}
          </p>
        </header>

        {/* The type cover only repeats the H1 here; the page shows a cover when there is a real one. */}
        {meta.image && <Cover post={meta} eager />}

        <div className="post-layout">
          <article className="post-body">
            {meta.tldr.length > 0 && (
              <section className="tldr" aria-labelledby="tldr">
                <p id="tldr" className="tldr-title">
                  Key takeaways
                </p>
                <ul>
                  {meta.tldr.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </section>
            )}

            {headings.length > 2 && (
              <details className="toc-mobile">
                <summary>On this page</summary>
                <ul>
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <Prose content={content} />

            {meta.resources.length > 0 && (
              <section className="resources" aria-labelledby="reproduce">
                <h2 id="reproduce">Reproduce it</h2>
                <ul>
                  {meta.resources.map((r) => (
                    <li key={r.url}>
                      <a href={r.url} rel="noopener">
                        <span>{r.label}</span>
                        <small>{new URL(r.url).hostname.replace(/^www\./, "")}</small>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <PostCta />

            {author && (
              <section className="author-card" aria-label="About the author">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={author.photo} alt="" width={56} height={56} />
                <div>
                  <p className="author-card-name">
                    <Link href={`/blog/authors/${author.slug}`}>{author.name}</Link>
                    <span>{author.role}</span>
                  </p>
                  <p>{author.bio}</p>
                </div>
              </section>
            )}
          </article>

          <aside className="post-rail">
            <TableOfContents headings={headings} />
          </aside>
        </div>

        {next.length > 0 && (
          <section className="read-next" aria-labelledby="read-next">
            <h2 id="read-next" className="eyebrow">
              Read next
            </h2>
            <ul className="post-grid post-grid-2">
              {next.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
