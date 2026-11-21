// The writing rule, as a check:  npm run check:post -- <slug>   or   npm run check:post -- signal/<slug>
// The rule is .claude/skills/adaptral-blog/SKILL.md; this enforces the parts a script can see.
// FAIL exits non-zero (do not publish); WARN needs a human look; INFO is for the report.
import { existsSync, readFileSync } from "node:fs";
import matter from "gray-matter";
import { getAllPosts, getPost, getSignal } from "../src/lib/content.ts";

const arg = process.argv[2] ?? "";
const signal = arg.startsWith("signal/");
const slug = arg.replace(/^(signal|blog)\//, "");
const file = `src/content/${signal ? "signal" : "blog"}/${slug}.md`;
if (!slug || !existsSync(file)) {
  console.error("usage: npm run check:post -- <blog-slug>   or   npm run check:post -- signal/<slug>");
  process.exit(1);
}

const out = { FAIL: [], WARN: [], INFO: [] };
const say = (level, msg) => out[level].push(msg);

// The loader's own checks first: frontmatter, em-dashes, unpublished links. A throw is a FAIL.
let meta, content;
try {
  ({ meta, content } = signal ? getSignal(slug) : getPost(slug));
} catch (e) {
  console.log(`FAIL ${e.message}`);
  process.exit(1);
}
const raw = readFileSync(file, "utf8");
const fm = matter(raw).data;

const prose = content.replace(/```[\s\S]*?```/g, " ");
const words = (s) => (s.match(/[A-Za-z0-9][\w'’-]*/g) ?? []).length;
const total = words(prose);
const lower = prose.toLowerCase();
const count = (needle) => lower.split(needle.toLowerCase()).length - 1;
const h2s = [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
const first = (n) => prose.trim().split(/\s+/).slice(0, n).join(" ").toLowerCase();

say("INFO", `${total} words of prose`);
if (meta.draft) say("WARN", "draft: true is set; remove it to publish");

// Voice.
if (raw.includes("—")) say("FAIL", `${raw.split("—").length - 1} em-dash(es) in the file; use a colon, a period or restructure`);
const BUZZ = [
  "revolutionary", "game-changing", "game changer", "cutting-edge", "seamless", "seamlessly", "leverage",
  "unlock", "unleash", "delve", "robust", "empower", "elevate", "paradigm", "synergy", "world-class",
  "best-in-class", "next-generation", "state-of-the-art", "in today's", "fast-paced", "landscape",
  "tapestry", "testament", "supercharge", "effortless", "transformative", "streamline",
  "it's important to note", "in conclusion", "at the end of the day", "needless to say",
];
const hits = BUZZ.filter((b) => lower.includes(b));
if (hits.length) say("FAIL", `buzzwords/filler: ${hits.join(", ")}`);
const paras = prose.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p && !/^(#|\||[-*] |\d+\. |>|!\[)/.test(p));
const walls = paras.filter((p) => words(p) > 80 || (p.match(/[.!?](\s|$)/g) ?? []).length > 4);
if (walls.length) say("WARN", `${walls.length} long paragraph(s), e.g. "${walls[0].slice(0, 70)}..."`);

// Description length.
const dl = meta.description.length;
if (dl < 120 || dl > 165) say("WARN", `description is ${dl} characters (aim for 150-160)`);

// Links.
const links = [...content.matchAll(/\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g)].map((m) => m[1]);
const external = links.filter((l) => l.startsWith("http") && !/adaptral\.com/.test(l));
if (external.length === 0 && !signal) say("FAIL", "no external link to an outside source");
else say("INFO", `${external.length} external link(s)`);

// Figures.
const figures = (content.match(/^```(chart|table|stats)\b/gm) ?? []).length;
const charts = [...content.matchAll(/^```(chart|table)\n([\s\S]*?)^```/gm)].map((m) => m[2]);
const unsourced = charts.filter((c) => !/"source"\s*:/.test(c)).length;
if (unsourced) say("FAIL", `${unsourced} chart(s) or table(s) without a "source"`);
say("INFO", `${figures} figure(s)`);

if (signal) {
  if (total < 700 || total > 1000) say("WARN", `${total} words; a dispatch is 700-1,000 (signal-rules.md rule 7)`);
  if (!/\d/.test(first(150))) say("INFO", "no number in the first 150 words; is the opinion stated there?");
} else {
  // Keywords: placement over density.
  const pk = fm.primary_keyword;
  if (!pk) say("FAIL", "frontmatter primary_keyword is missing");
  else {
    const where = {
      title: (meta.seoTitle ?? meta.title).toLowerCase().includes(pk),
      h1: meta.title.toLowerCase().includes(pk),
      slug: slug.includes(pk.replace(/\s+/g, "-")),
      description: meta.description.toLowerCase().includes(pk),
      first100: first(100).includes(pk),
    };
    const missing = Object.entries(where).filter(([, ok]) => !ok).map(([k]) => k);
    if (missing.length) say("WARN", `primary "${pk}" not in: ${missing.join(", ")} (a reordered form may be fine)`);
    const inH2 = h2s.filter((h) => h.toLowerCase().includes(pk)).length;
    if (inH2 === 0) say("WARN", `primary "${pk}" is in no H2 (aim for 1-2)`);
    if (inH2 > 2) say("WARN", `primary "${pk}" is in ${inH2} H2s (1-2 is enough)`);
    const density = (100 * count(pk) * pk.split(" ").length) / total;
    say(density > 1.5 ? "WARN" : "INFO", `primary "${pk}": ${density.toFixed(2)}% of words${density > 1.5 ? " (reads as stuffing)" : ""}`);
  }
  for (const k of fm.secondary_keywords ?? []) if (count(k) === 0) say("WARN", `secondary "${k}" never appears`);

  // Internal links, both directions.
  const internal = new Set(links.filter((l) => l.startsWith("/blog/")));
  if (internal.size < 2) say("WARN", `only ${internal.size} internal blog link(s) out`);
  const inbound = getAllPosts().filter((p) => p.slug !== slug && getPost(p.slug).content.includes(`](/blog/${slug})`));
  if (inbound.length === 0) say("WARN", "no other post links here yet: do the cluster revisit (SKILL.md section 5)");

  // Figures and method for benchmark posts.
  if (["Benchmark", "Comparison"].includes(meta.tag)) {
    if (figures < 2) say("FAIL", `${meta.tag} posts carry at least 2 charts or tables (have ${figures})`);
    if (!h2s.some((h) => /^method/i.test(h))) say("FAIL", `${meta.tag} posts need a "## Method and caveats" section`);
    if (!meta.resources.length) say("WARN", "no `resources` (code, model, dataset) for readers to reproduce it");
  }
  if (!meta.tldr.length) say("WARN", "no `tldr` key takeaways");

  // Cover.
  if (!meta.image) say("WARN", "no cover image (npm run blog:cover); cards will show the type cover");
  else if (!existsSync(`public${meta.image}`)) say("FAIL", `cover ${meta.image} does not exist`);
  const imgs = [...content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  const noAlt = imgs.filter((m) => m[1].trim().length < 8);
  if (noAlt.length) say("FAIL", `${noAlt.length} image(s) without real alt text`);

  // The fixed ending: Fun fact, Conclusion, FAQ.
  const tail = h2s.slice(-3).map((h) => h.toLowerCase());
  if (tail.join("|") !== "fun fact|conclusion|faq")
    say("FAIL", `the last three H2s must be "Fun fact", "Conclusion", "FAQ" (got: ${h2s.slice(-3).join(", ")})`);
  const fun = content.split(/^## Fun fact\s*$/im)[1]?.split(/^## /m)[0] ?? "";
  if (fun && !/\]\(https?:\/\//.test(fun)) say("FAIL", "the fun fact links no source");
  const faq = content.split(/^## (?:FAQ|Frequently asked questions)\s*$/im)[1];
  if (faq)
    for (const b of faq.split(/^## /m)[0].split(/^### /m).slice(1)) {
      const [q, ...a] = b.split("\n");
      const n = words(a.join(" "));
      if (n < 40 || n > 60) say("WARN", `FAQ "${q.trim()}" is ${n} words (40-60)`);
    }

  // CONTEXTUAL posts keep the brand out of the first 70%.
  if (fm.inclusion_tier === "CONTEXTUAL") {
    const i = prose.search(/\bAdaptral\b/);
    const pct = i < 0 ? 100 : (100 * i) / prose.length;
    say(pct < 70 ? "FAIL" : "INFO", `first "Adaptral" at ${pct.toFixed(1)}% of the article (CONTEXTUAL needs 70%+)`);
  }
}

for (const level of ["FAIL", "WARN", "INFO"]) for (const m of out[level]) console.log(`${level.padEnd(4)} ${m}`);
console.log(out.FAIL.length ? `\n${arg}: ${out.FAIL.length} failure(s). Do not publish.` : `\n${arg}: no failures.`);
process.exit(out.FAIL.length ? 1 : 0);
