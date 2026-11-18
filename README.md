# Adaptral landing page

One static page: Next.js (App Router), no runtime dependencies beyond Next and React.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, fully static
npm run logos    # regenerate logo/ and the icons the site serves
```

## Where things are

| What | File |
| --- | --- |
| Copy | `app/page.tsx` |
| Title, description, keywords, links, booking URL | `app/site.ts` |
| Styles (light and dark) | `app/globals.css` |
| Metadata, JSON-LD, GA4, Clarity | `app/layout.tsx` |
| robots.txt, sitemap.xml, manifest | `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts` |
| Logo kit and its generator | `logo/`, `scripts/build-logos.mjs` |

## Deploying to Vercel

Import the repository; the defaults work. Then set these in Project > Settings > Environment Variables
(all optional, see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Defaults to `https://adaptral.com`. |
| `NEXT_PUBLIC_BOOKING_URL` | Target of "Book a call with us". The default is a placeholder. |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID (`G-…`). |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity project ID. |
| `GOOGLE_SITE_VERIFICATION` | Search Console HTML-tag token. |

Analytics scripts load only when their ID is set. Clicking either booking link sends a
`book_call_click` event to GA4 (with `location: header | cta`) and to Clarity; mark it as a key event in GA4.
After the first deploy, submit `https://adaptral.com/sitemap.xml` in Search Console.
