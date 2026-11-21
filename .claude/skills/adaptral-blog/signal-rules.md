# Signal rules

Read this before writing any /signal dispatch. The loader (`src/lib/content.ts`) enforces the format
at build time; the editorial rules are on you. The voice, honesty and chart rules in `SKILL.md` apply.

## What belongs here

1. **Scope:** small and open-weight models, fine-tuning, distillation, inference cost and speed,
   evals, and the LLM-API price moves that change the build-vs-buy maths. Every dispatch answers
   "what does this change for a team deciding whether to move a workload off a frontier model?"
   If it cannot, skip the topic.
2. **Reject:** funding rounds, hiring, personnel news, AI-industry drama, leaderboard wars with no
   cost or deployment consequence, and anything you cannot add a mechanism or a number to.
3. **One original asset per dispatch:** a run you did (an eval, a latency or cost measurement), a
   chart built from public numbers that no one has put side by side, or a synthesis of at least five
   cited sources.
4. **No pure aggregation.** If a link to the source would do, do not publish.
5. **One opinion, stated in the first 150 words.** The rest supports it.
6. **Attribution:** link every quote and name every source. Quote in short, attributed fragments.
   Never reproduce a full post, a paywalled article or a long excerpt.
7. **700 to 1,000 words.**
8. **A dispatch never delays a planned /blog post.** If the topic overlaps a planned post, write a
   short dispatch that links to the post once it ships, or pick another topic.
9. **Pruning:** a dispatch with zero search impressions after 30 days is merged into a blog post,
   set to noindex, or deleted. Review monthly.

## Three formats (rotate; not the same format twice in a day)

- **Benchmark:** take one new model or release, run it on a real task, report the number with its
  method in short (dataset, n, metric, cost basis). The highest-value format: at least weekly.
- **Reaction:** a new model, price change or release, and what it changes for small-model economics.
  Opinion with a mechanism and at least one chart or table. 700-900 words.
- **Digest:** what engineers said this week on Hacker News, Reddit or X about one topic, quoted and
  attributed, with one takeaway. 800-1,000 words.

## Format spec

- **File:** `src/content/signal/YYYY-MM-DD-slug.md`. The URL is `/signal/YYYY-MM-DD-slug`. The build
  fails if the frontmatter `date` differs from the date in the file name.
- **Frontmatter:**

  ```yaml
  ---
  title: "H1 text, the opinion if it fits"
  description: "150-160 chars, no em-dash"
  date: "YYYY-MM-DD"          # same as the file name
  updated: "YYYY-MM-DD"       # optional; defaults to date
  author: "Divyanshu Shekhar"
  format: "Benchmark"         # Benchmark | Reaction | Digest (the build fails otherwise)
  topic: "short topic label"
  draft: true                 # remove to publish
  sources:                    # at least one; rendered as the numbered Sources list
    - label: "Publisher: page title"
      url: "https://..."
  ---
  ```

- **Page:** masthead (format, date, title, description, author), the body, then the numbered sources,
  the call-to-action card and a facts rail. NewsArticle JSON-LD with `citation` for every source.
  No cover image, no FAQ, no fixed ending.
- **Before publishing:** open every source URL and confirm it says what you cite; drop any claim whose
  link does not resolve. Run `npm run check:post -- signal/<slug>`.
- **Tweet drafts:** write a founder and a company draft (SKILL.md section 7) and hand them to the owner.
