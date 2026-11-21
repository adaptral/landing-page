# Adaptral

The landing page for [adaptral.com](https://www.adaptral.com): small models, fine-tuned for your workflows.

Next.js; every page is prerendered at build time. The hero is a live 3D neural network whose weights update in real time over an animated loss landscape.

## Quick start

```sh
npm install
npm run dev        # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build (every page prerendered) |
| `npm run check:post -- <slug>` | Check a post against the writing rule before publishing |
| `npm run blog:cover -- <slug> "<idea>"` | Generate a post's cover image with OpenAI (needs `OPENAI_API_KEY` in `.env.local`) |
| `npm run typecheck` | TypeScript check |

## Deploying

Every push to `main` deploys to production on Vercel (project `adaptral-landing-page`). Other branches get preview URLs.

The Vercel team is on the Hobby plan, which only connects public repositories. Keep this repo public, or upgrade Vercel to Pro before making it private.

Vercel redirects `adaptral.com` to `www.adaptral.com` in its domain settings. Keep that redirect there, not in `next.config.ts`, so the two never disagree.

## Environment variables

Set these in Vercel > Project > Settings > Environment Variables. All are optional.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_CALENDLY_URL` | empty | Where "Book a call" goes. Empty or not a URL: the buttons do nothing. |
| `NEXT_PUBLIC_SITE_URL` | `https://www.adaptral.com` on Vercel | Canonical origin for metadata, sitemap, feed and robots.txt |
| `NEXT_PUBLIC_GTM_ID` | `GTM-WL5XNF6H` | Google Tag Manager container. Set empty to turn off. |
| `NEXT_PUBLIC_CLARITY_ID` | `zfi6gshmki` | Microsoft Clarity project. Set empty to turn off. |

`OPENAI_API_KEY` is for `npm run blog:cover` on your machine only (`.env.local`); never set it in Vercel. `.env.example` lists every variable.

## Blog and Signal

- `/blog`: evergreen posts (benchmarks, comparisons, guides). Markdown in `src/content/blog/`.
- `/signal`: short, dated dispatches on what changed this week. Markdown in `src/content/signal/YYYY-MM-DD-slug.md`.

A post is a Markdown file plus a deploy. `draft: true` shows it in `npm run dev` only. Charts, benchmark tables and headline numbers are fenced JSON blocks (```` ```chart ````, ```` ```table ````, ```` ```stats ````) rendered on the server, so every number is in the HTML. Open `/blog/chart-kit-reference` in dev to see each one.

Writing rules, for people and for Claude: `.claude/skills/adaptral-blog/` (`SKILL.md` for voice, honesty and the benchmark method; `charts.md` for figures; `signal-rules.md` for dispatches). The build fails on a broken frontmatter field, an em-dash, an invalid chart or a link to an unpublished post.

Each post gets an Article/FAQ schema, a share image generated from its title, an RSS entry (`/feed.xml`), a sitemap entry and an `llms.txt` line.

## Design tokens

Every colour, font, type size, space, radius, shadow, timing and layer is a CSS variable in `src/design/tokens.css`; stylesheets use the variables, never raw values. Code that cannot read CSS (canvas, generated images) imports the same values from `src/design/tokens.ts`. Chart colours are the `--series-*` slots, validated for colour-blind separation on the dark surface: use them in order.

## Where to change things

| To change | Edit |
| --- | --- |
| Page copy and sections | `src/components/landing.tsx` |
| Title, description, site URL, analytics IDs | `src/app/site.ts` |
| Case studies (Prorated, Bayvis) | `src/components/case-studies.ts` |
| Models in "How it works" | `TASKS` in `src/components/workflow-scene.ts`, logos in `public/models/` |
| Partner logos | `public/logos/` |
| Colours, type, spacing (tokens) | `src/design/tokens.css` |
| Landing page layout | `src/app/globals.css` |
| Blog and Signal layout | `src/app/content.css` |
| Brand assets (logo, favicons, social images) | `logo/` (see `logo/README.md`) |

## How the animation works

- **Network** (`neural-network.tsx`): a fully connected network (4-6-6-3 on desktop, 3-5-5-2 on mobile) projected in 3D. Line thickness follows weight size. Updates travel along a connection as a rainbow pulse while its number rolls to the new value.
- **Loss landscape** (`loss-landscape.tsx`): a second canvas behind it. Its moving dot carries a colour spectrum across the grid and headline, then fades into the input layer and starts a layer-by-layer pass of weight updates.
- **Partners**: scrolling to "Our partners" zooms the camera into the network, and a second network of case-study cards grows into place. The cards are real buttons laid out by CSS (`.studies-grid`); the canvas reads their positions and draws the wiring beneath them.
- Both canvases share one animation clock, pause offscreen and in background tabs, and respect the reduced-motion setting.

## Project layout

```
src/app/          routes: landing, /blog, /signal, /deck, feed, sitemap, robots, llms.txt
src/components/   landing page and canvas animations; charts/ and content/ for the blog
src/content/      blog posts and signal dispatches (Markdown)
src/design/       design tokens
src/lib/          content loader, authors
scripts/          blog:cover and check:post
public/           images served as-is (logos, models, team, EF badge)
logo/             brand kit: SVG/PNG logos, favicons, social images
```
