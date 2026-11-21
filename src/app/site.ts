// Site-wide facts used by the metadata, robots.txt and the sitemap.

// Set NEXT_PUBLIC_SITE_URL to the live domain (e.g. https://adaptral.com). Without it,
// Vercel's own production URL is used, and localhost when building anywhere else.
const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim() || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");

export const SITE_URL = (/^https?:\/\//.test(fromEnv) ? fromEnv : "http://localhost:3000").replace(/\/+$/, "");
export const SITE_NAME = "Adaptral";
export const SITE_TITLE = "Adaptral | Small models, fine-tuned for your workflows";
export const SITE_DESCRIPTION =
  "Not every workflow in your app needs a frontier LLM. Adaptral's AI agents audit your LLM calls, find the high-volume, narrow tasks, and move each one to a small model fine-tuned for you, with the data, evals and retraining taken care of.";

// Tag Manager container and Clarity project. Public by nature (they ship in the HTML); empty env var turns one off.
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-WL5XNF6H";
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "zfi6gshmki";
