# Adaptral

The landing page for [adaptral.com](https://www.adaptral.com): small models, fine-tuned for your workflows.

Next.js, built as a static site. The hero is a live 3D neural network whose weights update in real time over an animated loss landscape.

## Quick start

```sh
npm install
npm run dev        # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Static export to `out/` |
| `npm run typecheck` | TypeScript check |

## Deploying

Every push to `main` deploys to production on Vercel (project `adaptral-landing-page`). Other branches get preview URLs.

The Vercel team is on the Hobby plan, which only connects public repositories. Keep this repo public, or upgrade Vercel to Pro before making it private.

Vercel redirects `adaptral.com` to `www.adaptral.com` in its domain settings. The site is a static export, so redirects in `next.config.ts` do not work.

## Environment variables

Set these in Vercel > Project > Settings > Environment Variables. All are optional.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_CALENDLY_URL` | empty | Where "Book a call" goes. Empty or not a URL: the buttons do nothing. |
| `NEXT_PUBLIC_SITE_URL` | Vercel production URL | Canonical origin for metadata, sitemap and robots.txt |
| `NEXT_PUBLIC_GTM_ID` | `GTM-WL5XNF6H` | Google Tag Manager container. Set empty to turn off. |
| `NEXT_PUBLIC_CLARITY_ID` | `zfi6gshmki` | Microsoft Clarity project. Set empty to turn off. |

## Where to change things

| To change | Edit |
| --- | --- |
| Page copy and sections | `src/components/landing.tsx` |
| Title, description, site URL, analytics IDs | `src/app/site.ts` |
| Case studies (Prorated, Bayvis) | `src/components/case-studies.ts` |
| Models in "How it works" | `TASKS` in `src/components/workflow-scene.ts`, logos in `public/models/` |
| Partner logos | `public/logos/` |
| Colours, type, layout | `src/app/globals.css` |
| Brand assets (logo, favicons, social images) | `logo/` (see `logo/README.md`) |

## How the animation works

- **Network** (`neural-network.tsx`): a fully connected network (4-6-6-3 on desktop, 3-5-5-2 on mobile) projected in 3D. Line thickness follows weight size. Updates travel along a connection as a rainbow pulse while its number rolls to the new value.
- **Loss landscape** (`loss-landscape.tsx`): a second canvas behind it. Its moving dot carries a colour spectrum across the grid and headline, then fades into the input layer and starts a layer-by-layer pass of weight updates.
- **Partners**: scrolling to "Our partners" zooms the camera into the network, and a second network of case-study cards grows into place. The cards are real buttons laid out by CSS (`.studies-grid`); the canvas reads their positions and draws the wiring beneath them.
- Both canvases share one animation clock, pause offscreen and in background tabs, and respect the reduced-motion setting.

## Project layout

```
src/app/          routes, layout, metadata, robots.txt, sitemap
src/components/   landing page and canvas animations
public/           images served as-is (logos, models, team, EF badge)
logo/             brand kit: SVG/PNG logos, favicons, social images
```
