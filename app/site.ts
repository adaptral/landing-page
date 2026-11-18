// Everything about the site that is not layout lives here. Override per environment in .env (see .env.example).
export const site = {
  name: "Adaptral",
  tagline: "The model adaptation platform",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://adaptral.com",
  // <= 60 characters
  title: "Adaptral: Fine-Tune Infra, RLOps Platform & Model Adapters",
  // 150-160 characters
  description:
    "Adaptral is the model adaptation platform: fine-tune infra, an RLOps platform and model adapters to train and deploy OSS models in production. Book a call.",
  keywords: [
    "fine-tune infra",
    "fine-tuning infrastructure",
    "deploy OSS model",
    "deploy open-source models",
    "RLOps platform",
    "model adapter",
    "LoRA adapter",
    "model adaptation platform",
  ],
  // ponytail: placeholder until the real scheduling link exists; set NEXT_PUBLIC_BOOKING_URL
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://cal.com/adaptral",
  social: {
    linkedin: "https://www.linkedin.com/company/adaptral",
    x: "https://x.com/adaptral",
    instagram: "https://www.instagram.com/adaptral",
  },
  analytics: {
    // Tag Manager container and Clarity project. Public by nature (they ship in the HTML), so they have defaults.
    gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-WL5XNF6H",
    clarityId: process.env.NEXT_PUBLIC_CLARITY_ID ?? "zfi6gshmki",
    gaId: process.env.NEXT_PUBLIC_GA_ID,
    googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION,
  },
};
