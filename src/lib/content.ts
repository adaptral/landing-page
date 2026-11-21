import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

/*
 * The two writing lanes, both Markdown files in src/content:
 *   /blog    evergreen posts that should rank for years (benchmarks, comparisons, guides).
 *   /signal  short, dated reactions to what changed this week. Rules: .claude/skills/adaptral-blog/signal-rules.md
 * Every page is generated at build time, so a new post is a new file plus a deploy.
 *
 * The loader is strict on purpose: a broken frontmatter field or a link to a post that is not
 * published fails `next build` (and shows in the dev overlay) instead of shipping a broken page.
 */

const ROOT = join(process.cwd(), "src/content");

/** `draft: true` posts render in `next dev` only. They never reach the build, the sitemap or the feed. */
const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

export const BLOG_TAGS = ["Benchmark", "Comparison", "Guide", "Research", "Company"] as const;
export const SIGNAL_FORMATS = ["Benchmark", "Reaction", "Digest"] as const;

export type Link = { label: string; url: string };

type Base = {
  slug: string;
  title: string;
  /** The <title> tag, when it should differ from "<title> | Adaptral". */
  seoTitle?: string;
  description: string;
  date: string; // yyyy-mm-dd
  updated: string; // yyyy-mm-dd, defaults to `date`
  author: string;
  readingTime: number; // minutes
  draft: boolean;
};

export type PostMeta = Base & {
  tag: (typeof BLOG_TAGS)[number];
  /** Cover image, e.g. /blog/<slug>.webp (npm run blog:cover). Without one, the card draws a type cover. */
  image?: string;
  /** "Key takeaways" box under the header: 2-4 one-sentence findings. */
  tldr: string[];
  /** Reproducibility links at the end: code, model weights, eval dataset. */
  resources: Link[];
  /** Published slugs shown as "Read next". */
  related: string[];
};

export type SignalMeta = Base & {
  format: (typeof SIGNAL_FORMATS)[number];
  topic: string;
  sources: Link[];
};

export type Heading = { id: string; text: string };
export type FaqItem = { q: string; a: string };

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const SIGNAL_SLUG = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function files(lane: "blog" | "signal"): string[] {
  try {
    return readdirSync(join(ROOT, lane))
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

function read(lane: "blog" | "signal", slug: string) {
  const file = matter(readFileSync(join(ROOT, lane, `${slug}.md`), "utf8"));
  const d = file.data as Record<string, unknown>;
  const fail = (why: string): never => {
    throw new Error(`[${lane}] src/content/${lane}/${slug}.md: ${why}`);
  };
  const str = (key: string, required = true): string => {
    const v = d[key];
    if (v === undefined || v === null || v === "") return required ? fail(`frontmatter \`${key}\` is required`) : "";
    if (v instanceof Date) return v.toISOString().slice(0, 10); // an unquoted YAML date
    return String(v);
  };
  const links = (key: string): Link[] => {
    const v = (d[key] ?? []) as Link[];
    if (!Array.isArray(v) || v.some((l) => !l?.label || !/^https?:\/\//.test(l?.url ?? "")))
      fail(`\`${key}\` must be a list of {label, url} with absolute URLs`);
    return v;
  };

  const date = str("date");
  const updated = str("updated", false) || date;
  if (!ISO.test(date) || !ISO.test(updated)) fail("dates must be YYYY-MM-DD");
  if (file.content.includes("—")) fail("em-dash in the body; use a colon, a period or restructure");
  const words = file.content.replace(/```[\s\S]*?```/g, " ").trim().split(/\s+/).filter(Boolean).length;

  const base: Base = {
    slug,
    title: str("title"),
    seoTitle: str("seoTitle", false) || undefined,
    description: str("description"),
    date,
    updated,
    author: str("author", false) || "The Adaptral team",
    readingTime: Math.max(1, Math.round(words / 220)),
    draft: d.draft === true,
  };
  return { file, d, base, fail, links };
}

function parsePost(slug: string): { meta: PostMeta; content: string } {
  const { file, d, base, fail, links } = read("blog", slug);
  if (!SLUG.test(slug)) fail("file name must be lowercase-words-with-hyphens");
  const tag = d.tag as PostMeta["tag"];
  if (!BLOG_TAGS.includes(tag)) fail(`tag must be one of ${BLOG_TAGS.join(", ")}`);
  const tldr = (d.tldr ?? []) as string[];
  if (!Array.isArray(tldr) || tldr.some((t) => typeof t !== "string")) fail("`tldr` must be a list of sentences");
  return {
    content: file.content,
    meta: {
      ...base,
      tag,
      image: typeof d.image === "string" ? d.image : undefined,
      tldr,
      resources: links("resources"),
      related: (d.related ?? []) as string[],
    },
  };
}

function parseSignal(slug: string): { meta: SignalMeta; content: string } {
  const { file, d, base, fail, links } = read("signal", slug);
  if (!SIGNAL_SLUG.test(slug)) fail("file name must be YYYY-MM-DD-lowercase-words");
  if (base.date !== slug.slice(0, 10)) fail("frontmatter `date` must match the date in the file name");
  const format = d.format as SignalMeta["format"];
  if (!SIGNAL_FORMATS.includes(format)) fail(`format must be one of ${SIGNAL_FORMATS.join(", ")}`);
  const sources = links("sources");
  if (!sources.length) fail("needs at least one source");
  return { content: file.content, meta: { ...base, format, topic: String(d.topic ?? ""), sources } };
}

const newestFirst = (a: Base, b: Base) => (a.date === b.date ? (a.slug < b.slug ? 1 : -1) : a.date < b.date ? 1 : -1);

export function getAllPosts(): PostMeta[] {
  return files("blog")
    .map((s) => parsePost(s).meta)
    .filter((p) => SHOW_DRAFTS || !p.draft)
    .sort(newestFirst);
}

export function getAllSignals(): SignalMeta[] {
  return files("signal")
    .map((s) => parseSignal(s).meta)
    .filter((p) => SHOW_DRAFTS || !p.draft)
    .sort(newestFirst);
}

/** Every internal link in a body must land on a published page: a draft or a typo fails the build. */
function checkLinks(lane: string, slug: string, content: string) {
  const live = {
    blog: new Set(getAllPosts().map((p) => p.slug)),
    signal: new Set(getAllSignals().map((p) => p.slug)),
  };
  for (const m of content.matchAll(/\]\((?:https:\/\/www\.adaptral\.com)?\/(blog|signal)\/([a-z0-9-]+)\/?(?:#[^)]*)?\)/g)) {
    if (!live[m[1] as "blog" | "signal"].has(m[2]))
      throw new Error(`[${lane}] ${slug}.md links to /${m[1]}/${m[2]}, which is not published`);
  }
}

export function getPost(slug: string) {
  const post = parsePost(slug);
  checkLinks("blog", slug, post.content);
  const live = new Set(getAllPosts().map((p) => p.slug));
  for (const r of post.meta.related)
    if (!live.has(r)) throw new Error(`[blog] ${slug}.md: related post "${r}" is not published`);
  return post;
}

export function getSignal(slug: string) {
  const signal = parseSignal(slug);
  checkLinks("signal", slug, signal.content);
  return signal;
}

/** `##` headings, slugged the way rehype-slug slugs them, so the contents links match the ids. */
export function getHeadings(content: string): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  let fenced = false;
  for (const line of content.split("\n")) {
    if (line.startsWith("```")) fenced = !fenced;
    const m = !fenced && /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      const text = m[1].replace(/[*_`]/g, "");
      out.push({ id: slugger.slug(text), text });
    }
  }
  return out;
}

/** A `## FAQ` section: each `###` is a question, the text under it the answer. Feeds FAQPage JSON-LD. */
export function getFaq(content: string): FaqItem[] {
  const section = /^##\s+(?:FAQs?|Frequently asked questions)\s*$([\s\S]*?)(?=^##\s|(?![\s\S]))/im.exec(content);
  if (!section) return [];
  return section[1]
    .split(/^###\s+/m)
    .slice(1)
    .map((block) => {
      const [q, ...rest] = block.split("\n");
      const a = rest.join(" ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`>]/g, "").replace(/\s+/g, " ").trim();
      return { q: q.trim(), a };
    })
    .filter((f) => f.q && f.a);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
