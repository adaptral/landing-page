import { ImageResponse } from "next/og";
import { color } from "@/design/tokens";
import { getAllPosts, getPost } from "@/lib/content";

/*
 * The share card for a post, a 1200x630 PNG built at deploy time. X, LinkedIn and Slack read this
 * (og:image and twitter:image); the cover on the page can be any format. Colours come from tokens.ts
 * because Satori cannot read CSS variables.
 */

export const alt = "Adaptral blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

/** Long titles stay readable at thumbnail size: the type shrinks in steps. */
const titleSize = (t: string) => (t.length > 80 ? 50 : t.length > 54 ? 60 : 72);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { meta } = getPost(slug);
  const s = color.spectrum;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: color.bg,
        backgroundImage: `radial-gradient(760px 520px at 100% 0%, ${s.violet}33, transparent), radial-gradient(640px 460px at 0% 100%, ${s.teal}22, transparent)`,
        color: color.ink,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="30" height="38" viewBox="0 0 36 46" fill="none">
            <path d="M29 6C15-3 20 49 6 39" stroke={color.ink} strokeWidth="6.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1.4 }}>Adaptral</span>
        </div>
        <span style={{ fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: color.inkSoft }}>{meta.tag}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        <span style={{ fontSize: titleSize(meta.title), lineHeight: 1.08, letterSpacing: -2, maxWidth: 1020, fontWeight: 600 }}>{meta.title}</span>
        <div style={{ display: "flex", height: 5, width: 120, backgroundImage: `linear-gradient(90deg, ${s.violet}, ${s.teal}, ${s.amber}, ${s.pink})` }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: color.inkSoft }}>
        <span>{meta.author}</span>
        <span>adaptral.com/blog · {meta.readingTime} min read</span>
      </div>
    </div>,
    size,
  );
}
