---
name: adaptral-blog
description: The house rule for writing, rewriting or updating any post on adaptral.com/blog or adaptral.com/signal. Use whenever a post or dispatch is drafted, edited, refreshed or published, when a benchmark or model comparison is written up, and when revisiting internal links. Covers the reader, voice, honesty and benchmark-method rules, keyword placement, links, charts (with charts.md), covers, the fixed ending, frontmatter and the pre-publish checks.
---

# Writing for adaptral.com

The reader is an engineer or a technical lead whose company pays an LLM bill every month. They
found this post from a search, a Hacker News thread or a colleague, and they arrived suspicious:
every vendor claims its small model "matches GPT". They have read a hundred of those posts. The rules
below exist so this one is the post they forward to their team.

Two lanes, one voice:

- **/blog**: evergreen posts that should rank for years. Benchmarks, comparisons, guides, research.
- **/signal**: short, dated dispatches on what changed this week. Read `signal-rules.md` first.

Charts are how this blog wins. Read `charts.md` before writing any post with a number in it.

## 1. Who you are writing for

- **Engineers first** (ML, platform, backend), **then their leads** (CTO, head of AI, eng manager).
  Assume they know what a token, a prompt, an eval and p95 latency are. Do not explain an API call.
- **They punish:** benchmark numbers with no method, cherry-picked tasks, "up to 10x" claims, vendor
  adjectives, a product pitch dressed as a tutorial, and anything that reads like a model wrote it.
- **They reward:** a reproducible setup, a number with error bars, a chart that answers the question
  in five seconds, a cost worked out per million requests, and an honest "here is where the small
  model lost".

## 2. Voice

- **Professional, plain, light.** A senior engineer explaining something to a colleague: correct,
  direct, not above a dry joke. One to three per post, never in a sentence that carries a number.
- **Second person, active voice, concrete nouns.** "Your classifier sends 40M requests a month to a
  frontier model", not "organisations may incur significant costs".
- **Short paragraphs.** Two to four sentences, under 80 words. A wall of text is a closed tab.
- **Examples everywhere.** Every claim shows a prompt, an output, a cost line, a config or a chart.
- **No em-dashes** in titles, descriptions or body (the build fails on one). Use a colon, a period, or
  restructure. En-dashes in numeric ranges are fine.
- **No buzzwords or filler.** `npm run check:post` fails on: revolutionary, game-changing,
  cutting-edge, seamless, leverage, unlock, delve, robust, empower, elevate, paradigm, synergy,
  world-class, state-of-the-art, "in today's", fast-paced, landscape, tapestry, testament,
  transformative, streamline, supercharge, "it's important to note", "in conclusion". If you need one
  of these words, you have not found the specific thing yet.
- **Run `humanizer-blader` on every draft** before it is checked. It catches not-X-but-Y contrasts,
  one-line dramatic closers, forced triads, staged openers, inflated significance, bold as decoration
  and chatbot residue.

## 3. Honesty is the product

- **Not promotional.** The post teaches something useful on its own. Adaptral appears only where it is
  the honest answer, as one option among real ones (fine-tune yourself with Unsloth or Axolotl, use a
  hosted fine-tuning API, distil, or stay on the frontier model), with its limits stated.
  - `ANCHOR` posts may name Adaptral from the middle on.
  - `CONTEXTUAL` posts name it only after 70% of the article (checked), in one short section.
  - No signup banners and no "book a demo" in the body. The call to action is page chrome.
- **Every number has a source you can link.** Our numbers come from a run we did and can show (the
  `resources` frontmatter links the code, model and dataset). Outside numbers link to the paper,
  model card, leaderboard, price page or dataset, with the date read. No "studies show".
- **Never fabricate** a number, a quote, a tweet, a customer, a benchmark result, a price, a date or a
  model capability. If you cannot find or measure it, write the post without it.
- **Say where it breaks.** Every post that recommends something says when it is the wrong choice:
  tasks the small model failed, volumes where fine-tuning does not pay back, data you need first.

### Benchmark and comparison method (required for tag Benchmark or Comparison)

A benchmark post without its method is an ad. Every one carries a `## Method and caveats` section
(before the fixed ending) that states, in a list:

- **Task and dataset**: what the model had to do, where the examples came from, how many, and how
  they were split (never test on training data; say how you checked).
- **Models**: exact names and versions or checkpoints, the provider, and the date of each run.
- **Prompting and decoding**: the prompt (in a ```details block if long), temperature, max tokens,
  few-shot or not. The same for every model unless the difference is the point.
- **Metric**: how a "correct" answer is scored (exact match, F1, LLM judge with which model and rubric).
- **Runs and error**: number of runs or examples, and the ± you report (std, CI, binomial).
- **Cost basis**: price per 1M input and output tokens for each model, the date of the price list, and
  the request mix (average input and output tokens) the cost per 1M requests is computed from.
- **Latency basis**: hardware or API region, batch size, concurrency, p50 and p95.
- **Caveats**: what this does not show. A different task, language or data size may not transfer.

Headline numbers must match the chart, the table and the Method section exactly.

## 4. Keywords: placement, not density

Read `.claude/skills/seo-content-brief/references/keyword-density.md`. In short:

- **Primary keyword** in the title tag (near the front), the H1, the slug, the description and the
  first 100 words. In one or two H2s, not every heading.
- **Slugs read like the search an agent or a person types**: primary keyword first, then intent words
  (`vs`, `cost`, `benchmark`, `how-to`, `when-to`). Example:
  `/blog/fine-tuned-qwen3-4b-vs-gpt-5-mini-invoice-extraction-cost-accuracy`. No dates in blog slugs.
  Set it before the first deploy: a live URL only changes with a redirect.
- **Headline = the finding** when there is one: "A fine-tuned 4B model matches GPT-5 mini on invoice
  extraction at 1/40th the cost", not "Exploring small models for extraction".
- **Secondary keywords**: each at least once, in a sentence a human would write.
- Use `seo-content` for the E-E-A-T pass and `seo-geo` so the definition and FAQ answers are
  liftable by AI answer engines (one clear sentence, then the support).

## 5. Links

- **At least one external link** to a source that backs a claim: a paper, a model card, a price page,
  a dataset, an eval harness. Not a competitor's landing page.
- **Internal links by topic.** Link sideways to the closest published posts with descriptive, varied
  anchors written into sentences, and list the closest one or two in frontmatter `related`. A body
  link to a /blog or /signal page that is not published fails the build.
- **The cluster revisit (every publish).** After a post ships, go through the other posts: does one
  mention this topic, and would its reader want this post next? If yes, add a link where it helps.
  `npm run check:post` flags a post nothing links to yet.

## 6. Charts, tables and images

- **Benchmark and Comparison posts carry at least two charts or tables**, and one of them is usually
  the cost-against-quality scatter. Guides carry at least one figure where a number or a flow helps.
- Write them as ```chart / ```table / ```stats JSON blocks (reference: `charts.md`). They render as
  HTML on the server with a data table, so crawlers and AI engines read every number. Never paste a
  chart as a PNG: an image of a chart is invisible to search and to screen readers.
- Diagrams that are not data (a pipeline, an architecture) are hand-written SVG in
  `public/blog/<slug>/<name>.svg`, dark ground, brand spectrum for decoration only, accurate labels
  (image models garble text). Alt text says what the image shows, in a sentence.
- **Featured image on every blog post.** `npm run blog:cover -- <slug> "<one visual metaphor>"` asks
  OpenAI for an abstract cover in the brand style, crops it to 2:1 and writes
  `public/blog/<slug>.webp`. Look at it before using it; regenerate if it is generic. Without one,
  cards fall back to a type cover, which is fine for a draft and second-best for a live post.
  The share card (og:image) is generated separately from the title, so no action is needed for it.

## 7. Code, interactivity and embeds

- **Code with its output.** Show the command, then what it prints. Long output goes in a ```details
  block (first line is the summary).
- **Interactive, but crawler-friendly.** `details` reveals, tables and charts only. No client-only
  widgets whose content is missing from the HTML.
- **Real voices, verbatim.** Search X, Reddit, Hacker News, LinkedIn and personal blogs for what
  practitioners said about the topic, and quote the best one or two in short, attributed, linked
  fragments. Never invent a quote. If nothing real turns up, say so in the report.
- **Before publishing, draft two posts**: one for the founder (@dshekhar17) and one for the company
  (@adaptral). First person, one idea, under 280 characters, what was learned or what surprised.
  Banned: "we're excited", "introducing", "game-changer", feature lists, hashtag strings, "thread 🧵".
  A line that claims a feeling or habit is marked [confirm]. Hand them to the owner; do not post.

## 8. Structure that works

1. An opening that states the problem in the reader's words, with the primary keyword, in the first
   100 words. No throat-clearing.
2. The answer early: the headline number or the one-sentence definition.
3. Question-shaped H2s where natural, each with an example, chart or table.
4. For Benchmark and Comparison posts: `## Method and caveats` (section 3).
5. A section on when not to do this.

**Every blog post ends with these three H2s, in this order:**

6. `## Fun fact`. The single most surprising true thing about the topic, two to four sentences, with
   its source linked. Researched properly (primary source, or two independent reliable ones). Leave it
   out rather than ship a shaky one. No "did you know".
7. `## Conclusion`. One or two short paragraphs: what the reader now knows and the one thing to do
   next. No new claims, no recap of every heading.
8. `## FAQ`, last. 3-5 questions phrased the way people type them ("is fine-tuning cheaper than
   GPT-5 mini", "how many examples to fine-tune a small model"). Each answer opens with one sentence
   that answers on its own, then one to three sentences of support, 40-60 words, plain text. Each
   question is an `###`; the page emits FAQPage JSON-LD from them.

Signal dispatches skip 6-8: they end with the sources list the template renders.

## 9. Frontmatter

```yaml
---
title: "H1 text, the finding if there is one"
seoTitle: "Title tag, 50-60 chars | Adaptral"   # only if it differs from "title | Adaptral"
description: "150-160 chars, primary keyword included, no em-dash"
date: "YYYY-MM-DD"            # quoted
updated: "YYYY-MM-DD"         # when the numbers or text change; shown and used as dateModified
author: "Divyanshu Shekhar"   # a name in src/lib/authors.ts, or "The Adaptral team"
tag: "Benchmark"              # Benchmark | Comparison | Guide | Research | Company
image: "/blog/<slug>.webp"    # npm run blog:cover
draft: true                   # renders in dev only; remove to publish
tldr:                         # "Key takeaways" box, 2-4 one-sentence findings with numbers
  - "..."
resources:                    # "Reproduce it" links: code, model weights, eval dataset
  - label: "Eval code on GitHub"
    url: "https://github.com/..."
related: ["<published slug>"]
primary_keyword: "..."
secondary_keywords: ["...", "..."]
inclusion_tier: "CONTEXTUAL"  # or ANCHOR
---
```

## 10. Before you publish (in order)

1. `humanizer-blader` on the full draft; then read it aloud once.
2. `seo-content` (and `seo-content-audit` for its E-E-A-T rubric) on the draft.
3. Every number traced to its source or run; the Method section matches the charts and tables.
4. Cover generated and looked at.
5. `npm run check:post -- <slug>` (or `-- signal/<slug>`): zero FAIL; every WARN fixed or accepted.
6. The cluster revisit (section 5).
7. Remove `draft: true`, then `npm run build`: green.
8. Commit to a branch and open a PR. After it deploys, submit the URL for indexing (`/google-index`).

The vendored skills this rule relies on, and what was changed in them, are listed in
`.claude/skills/VENDORED.md`.
