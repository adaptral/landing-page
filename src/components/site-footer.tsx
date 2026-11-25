import Link from "next/link";
import { CALENDLY_URL } from "@/app/site";
import { AUTHORS } from "@/lib/authors";
import "./site-footer.css";

/*
 * The site footer, on every page. Modelled on reticle.sh's: a brand block, grouped link columns, a
 * thin mono bar, and an oversized wordmark drifting underneath. Server-rendered with no client
 * JavaScript: the drift is a CSS animation, and the scroll-linked travel is a CSS scroll-driven
 * animation (skipped where unsupported or when the reader prefers reduced motion).
 */

const SOCIALS = [
  {
    label: "Adaptral on LinkedIn",
    href: "https://www.linkedin.com/company/adaptral",
    path: "M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.22 8.02h4.56V23H.22V8.02zM8.34 8.02h4.37v2.05h.06c.61-1.15 2.1-2.37 4.32-2.37 4.62 0 5.47 3.04 5.47 7V23h-4.56v-7.3c0-1.74-.03-3.98-2.42-3.98-2.43 0-2.8 1.9-2.8 3.85V23H8.34V8.02z",
  },
  {
    label: "Adaptral on X",
    href: "https://x.com/adaptral",
    path: "M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z",
  },
];

type FooterLink = { label: string; href: string };

const GROUPS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      ...(CALENDLY_URL ? [{ label: "Talk to founders", href: CALENDLY_URL }] : []),
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Signal", href: "/signal" },
      { label: "RSS feed", href: "/feed.xml" },
    ],
  },
  {
    title: "Company",
    links: [
      ...AUTHORS.map((a) => ({ label: a.name, href: `/blog/authors/${a.slug}` })),
      { label: "Entrepreneurs First", href: "https://www.joinef.com/" },
    ],
  },
];

function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 46" fill="none" aria-hidden="true">
      <path d="M29 6C15-3 20 49 6 39" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
    </svg>
  );
}

function FooterLinkItem({ label, href }: FooterLink) {
  const external = href.startsWith("http");
  const className = "site-footer-link";
  if (external)
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  // The feed is a file, not a page: a plain link, so the router does not try to render it.
  if (href.endsWith(".xml"))
    return (
      <a className={className} href={href}>
        {label}
      </a>
    );
  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-top">
        <div className="site-footer-brand">
          <Link href="/" className="site-footer-wordmark" aria-label="Adaptral home">
            <Mark />
            <span>Adaptral</span>
          </Link>
          <p>Not every workflow needs a frontier LLM. We move the narrow, high-volume ones to small models fine-tuned for you.</p>
          <a className="site-footer-badge" href="https://www.joinef.com/" target="_blank" rel="noopener noreferrer">
            <span aria-hidden="true" />
            Backed by Entrepreneurs First
          </a>
          <div className="site-footer-social">
            {SOCIALS.map((s) => (
              <a key={s.href} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={s.path} fill="currentColor" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <nav className="site-footer-cols" aria-label="Footer">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h2>{g.title}</h2>
              <ul>
                {g.links.map((l) => (
                  <li key={l.href}>
                    <FooterLinkItem {...l} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="site-footer-bar">
        <span>© {new Date().getFullYear()} Adaptral · small models, fine-tuned for your workflows.</span>
        <span>Built to be measured.</span>
      </div>

      {/* Decoration: the name, oversized, drifting. Four identical units so the loop is seamless. */}
      <div className="site-footer-mark" aria-hidden="true">
        <div className="site-footer-mark-track">
          <div className="site-footer-mark-strip">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="site-footer-mark-unit">
                <Mark />
                <span>Adaptral</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
