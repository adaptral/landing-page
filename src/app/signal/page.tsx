import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getAllSignals, SIGNAL_FORMATS } from "@/lib/content";
import { SITE_NAME } from "../site";

const DESCRIPTION =
  "Dated notes on what changed this week for small models: new open-weight releases, price moves and eval results, each with a measurement or enough sources to be worth your time.";

export const metadata: Metadata = {
  title: `Signal: what changed this week in small models | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: "/signal", types: { "application/rss+xml": "/feed.xml" } },
};

export default function SignalIndex() {
  const posts = getAllSignals();
  return (
    <main className="signal-index">
      <header className="masthead">
        <p className="eyebrow">Signal</p>
        <h1>What changed this week in small models</h1>
        <p className="page-lede">{DESCRIPTION}</p>
        <p className="format-row">
          {SIGNAL_FORMATS.map((f) => (
            <span key={f} className="pill">
              {f}
            </span>
          ))}
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="empty">The first dispatch lands soon.</p>
      ) : (
        // A dated feed: the date line is the spine, newest first.
        <ol className="timeline">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/signal/${p.slug}`}>
                <p className="meta-line">
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                  <span className="pill">{p.format}</span>
                  {p.topic && <span>{p.topic}</span>}
                  <span>{p.readingTime} min read</span>
                  {p.draft && <span className="draft-badge">Draft</span>}
                </p>
                <span className="timeline-title">{p.title}</span>
                <span className="timeline-desc">{p.description}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
