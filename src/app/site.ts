// Site-wide facts used by the metadata, robots.txt and the sitemap.

// Set NEXT_PUBLIC_SITE_URL to override. On Vercel it falls back to the live host, not the project's
// production URL (that one is adaptral.co, which redirects): every canonical tag, sitemap entry and
// feed link must point at the host that answers 200, or search engines index nothing.
const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim() || (process.env.VERCEL ? "https://www.adaptral.com" : "");

export const SITE_URL = (/^https?:\/\//.test(fromEnv) ? fromEnv : "http://localhost:3000").replace(/\/+$/, "");
export const SITE_NAME = "Adaptral";
export const SITE_TITLE = "Adaptral | Small models, fine-tuned for your workflows";
export const SITE_DESCRIPTION =
  "Not every workflow in your app needs a frontier LLM. Adaptral's AI agents audit your LLM calls, find the high-volume, narrow tasks, and move each one to a small model fine-tuned for you, with the data, evals and retraining taken care of.";

// Tag Manager container and Clarity project. Public by nature (they ship in the HTML); empty env var turns one off.
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-WL5XNF6H";
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "zfi6gshmki";

// "Talk to founders" goes here. Read on the server at build time: only NEXT_PUBLIC_ variables reach
// browser code directly. Missing or malformed, it is "" and the buttons stay inert.
const calendly = (process.env.NEXT_CALENDLY_URL ?? "").trim();
export const CALENDLY_URL = /^https?:\/\//i.test(calendly) ? calendly : "";
