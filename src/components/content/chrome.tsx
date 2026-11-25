import Link from "next/link";
import { CALENDLY_URL, SITE_NAME, SITE_URL } from "@/app/site";

/** The one place structured data reaches a page. `<` is escaped so a title can never close the tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c") }}
    />
  );
}

/** Every Article's publisher points here by @id, so search engines see one entity. */
export const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
};

export function Wordmark() {
  return (
    <Link href="/" className="content-wordmark" aria-label="Adaptral home">
      <svg viewBox="0 0 36 46" fill="none" aria-hidden="true">
        <path d="M29 6C15-3 20 49 6 39" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
      </svg>
      <span>Adaptral</span>
    </Link>
  );
}

export function SiteHeader({ current }: { current?: "blog" | "signal" }) {
  return (
    <header className="content-header">
      <Wordmark />
      <nav aria-label="Main">
        <Link href="/blog" aria-current={current === "blog" ? "page" : undefined}>
          Blog
        </Link>
        <Link href="/signal" aria-current={current === "signal" ? "page" : undefined}>
          Signal
        </Link>
        {CALENDLY_URL && (
          <a className="content-header-cta" href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
            Talk to founders
          </a>
        )}
      </nav>
    </header>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: `${SITE_URL}${it.href}` })),
        }}
      />
      <nav aria-label="Breadcrumb" className="crumbs">
        <ol>
          {items.map((it, i) => (
            <li key={it.href}>
              {i === items.length - 1 ? <span aria-current="page">{it.label}</span> : <Link href={it.href}>{it.label}</Link>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/** A thin bar that fills as you read. CSS scroll-driven animation: no JavaScript; absent where unsupported. */
export function ReadingProgress() {
  return <div className="reading-progress" aria-hidden="true" />;
}

/** The end-of-post call to action. Never in the body: the post has to stand on its own. */
export function PostCta() {
  return (
    <aside className="post-cta">
      <p className="post-cta-eyebrow">Adaptral</p>
      <p className="post-cta-title">Paying frontier prices for narrow tasks?</p>
      <p>We audit your LLM calls, find the high-volume ones a small model can do, and fine-tune, evaluate and serve it for you.</p>
      {CALENDLY_URL ? (
        <a className="cta cta-primary" href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
          Talk to founders
        </a>
      ) : (
        <Link className="cta cta-primary" href="/">
          See how it works
        </Link>
      )}
    </aside>
  );
}
