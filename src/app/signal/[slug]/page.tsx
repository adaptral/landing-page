import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, JsonLd, ORGANIZATION, PostCta } from "@/components/content/chrome";
import { Prose } from "@/components/content/prose";
import { authorByName, personSchema } from "@/lib/authors";
import { formatDate, getAllSignals, getSignal } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "../../site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSignals().map((p) => ({ slug: p.slug }));
}

const live = (slug: string) => getAllSignals().some((p) => p.slug === slug);

export async function generateMetadata({ params }: PageProps<"/signal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!live(slug)) return {};
  const { meta } = getSignal(slug);
  return {
    title: meta.seoTitle ?? `${meta.title} | ${SITE_NAME} Signal`,
    description: meta.description,
    alternates: { canonical: `/signal/${slug}` },
    openGraph: { type: "article", url: `/signal/${slug}`, title: meta.title, description: meta.description, publishedTime: meta.date, modifiedTime: meta.updated },
    twitter: { card: "summary", title: meta.title, description: meta.description },
  };
}

export default async function SignalPage({ params }: PageProps<"/signal/[slug]">) {
  const { slug } = await params;
  if (!live(slug)) notFound();
  const { meta, content } = getSignal(slug);
  const author = authorByName(meta.author);
  const url = `${SITE_URL}/signal/${slug}`;
  const facts: [string, string][] = [
    ["Format", meta.format],
    ...(meta.topic ? [["Topic", meta.topic] as [string, string]] : []),
    ["Published", formatDate(meta.date)],
    ["Updated", formatDate(meta.updated)],
    ["Sources", String(meta.sources.length)],
    ["Read", `${meta.readingTime} min`],
  ];

  return (
    <>
      <JsonLd
        data={{
          "@type": "NewsArticle",
          headline: meta.title,
          description: meta.description,
          datePublished: meta.date,
          dateModified: meta.updated,
          author: author ? personSchema(author) : { "@id": ORGANIZATION["@id"] },
          publisher: ORGANIZATION,
          mainEntityOfPage: url,
          citation: meta.sources.map((s) => s.url),
        }}
      />
      <main className="post">
        {/* A signal post is a dated dispatch: a masthead instead of the blog's cover. */}
        <header className="masthead">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Signal", href: "/signal" },
              { label: meta.title, href: `/signal/${slug}` },
            ]}
          />
          <p className="meta-line">
            <span className="pill">{meta.format}</span>
            <time dateTime={meta.date}>{formatDate(meta.date)}</time>
            {meta.draft && <span className="draft-badge">Draft: not published</span>}
          </p>
          <h1>{meta.title}</h1>
          <p className="page-lede">{meta.description}</p>
          <p className="byline">
            {author ? (
              <Link href={`/blog/authors/${author.slug}`} rel="author" className="byline-author">
                {meta.author}
              </Link>
            ) : (
              <span className="byline-author">{meta.author}</span>
            )}
            <span>{meta.readingTime} min read</span>
          </p>
        </header>

        <div className="post-layout">
          <article className="post-body">
            <Prose content={content} />

            <section className="sources" aria-labelledby="sources">
              <h2 id="sources" className="eyebrow">
                Sources
              </h2>
              <ol>
                {meta.sources.map((s, i) => (
                  <li key={s.url}>
                    <a href={s.url} rel="noopener">
                      <span className="sources-n">{String(i + 1).padStart(2, "0")}</span>
                      <span>
                        <span className="sources-title">{s.label}</span>
                        <small>{new URL(s.url).hostname.replace(/^www\./, "")}</small>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>

            <PostCta />
            <p className="back-link">
              <Link href="/signal">← All dispatches</Link>
            </p>
          </article>

          <aside className="post-rail">
            <div className="facts">
              <p className="eyebrow">Dispatch</p>
              <dl>
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
              </dl>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
