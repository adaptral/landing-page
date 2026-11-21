# Vendored skills

Third-party skills copied into this repo so the blog rule (`adaptral-blog/SKILL.md`) can rely on them
at a fixed version. All are MIT; each folder keeps its upstream `LICENSE`. Only the instruction files
were copied: no installers, Python tools, MCP servers or apps. Read on 2026-10-24; copied into this repo from the Reticle site on 2026-11-21.

| Folder | Upstream | Commit | Changes made here |
| --- | --- | --- | --- |
| `humanizer-blader/` | [blader/humanizer](https://github.com/blader/humanizer) `SKILL.md` | `8c307f3` | `name` → `humanizer-blader` (a different `humanizer` is installed globally) |
| `seo-content/` | [AgricIDaniel/claude-seo](https://github.com/AgricIDaniel/claude-seo) `skills/seo-content` | `6be93f4` | Plugin paths `${CLAUDE_PLUGIN_ROOT}/skills/seo(-geo)/references/` → local `references/`; copied `eeat-framework.md`, `eeat-scoring-guide.md`, `google-ai-optimization-guide.md` in |
| `seo-cluster/` | claude-seo `skills/seo-cluster` | `6be93f4` | none |
| `seo-geo/` | claude-seo `skills/seo-geo` | `6be93f4` | none |
| `seo-content-brief/` | claude-seo `skills/seo-content-brief` | `6be93f4` | none |
| `seomator-audit/` | [seo-skills/seo-audit-skill](https://github.com/seo-skills/seo-audit-skill) `skill/` | `fac4b75` | `name` → `seomator-audit` (a different `seo-audit` is installed globally) |
| `seo-content-audit/` | [seranking/seo-skills](https://github.com/seranking/seo-skills) `skills/seo-content-audit` | `fd6d140` | none |

## What does not work here, on purpose

- **claude-seo helper scripts.** `seo-content`, `seo-cluster` and the copied guide still mention
  `${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo ...`. Those scripts belong to the full plugin and were not
  copied; the optional automation steps that call them are unavailable. The guidance itself works.
- **SE Ranking data.** `seo-content-audit` pulls data through SE Ranking's paid MCP (`DATA_*` calls),
  Firecrawl and a GA4 script. None are installed. Use its E-E-A-T and CITE rubric by hand.
- **SEOmator.** `seomator-audit` runs the `@seomator/seo-audit` CLI through npx, a third-party tool.
  Ask before running it. It also suggests reading `.env` to find the site URL: do not; the URL is
  https://www.adaptral.com.

## Not vendored

The rest of claude-seo (local SEO, ecommerce, hreflang, maps, backlinks, DataForSEO/Ahrefs/Bing
extensions, installers) and the rest of seranking/seo-skills (agency, ads, local, API-only reports)
do not apply to writing this blog. Re-fetch from upstream if that changes.
