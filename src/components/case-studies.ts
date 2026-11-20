export type CaseStudy = {
  id: string;
  company: string;
  // The partner's website, linked from the open case study.
  url?: string;
  sector: string;
  // One line shown on the card inside the network.
  brief: string;
  // Path under /public, e.g. "/logos/acme.svg". Leave undefined to show the placeholder.
  image?: string;
  metrics: { value: string; label: string }[];
  story: { heading: string; body: string }[];
};

// Our partners. With one or two entries each card is its own layer; from three up,
// cards are wired two per layer, in order, so keep that count even.
// The cost and speed figures are estimates from public price lists, not measured results,
// and each label says so.
export const caseStudies: CaseStudy[] = [
  {
    id: "prorated",
    company: "Prorated",
    url: "https://prorated.io/",
    sector: "Hiring · CRM automation",
    brief: "An AI assistant runs their recruiting CRM. We moved it from a frontier model to a small one of their own.",
    image: "/logos/prorated-white.svg",
    metrics: [
      { value: "65–85%", label: "Lower running cost (estimate)" },
      { value: "2×", label: "Faster per task (estimate)" },
      { value: "Private", label: "Candidate data stays inside" },
    ],
    story: [
      { heading: "The problem", body: "Prorated builds hiring software that finds engineers and tests them on real work. An AI assistant operates its recruiting CRM: it moves candidates between stages, updates records, sends follow-ups and books interviews. Every one of those steps went through a frontier model, so the bill rose with each task and candidate data left their systems." },
      { heading: "What we trained", body: "A small model fine-tuned on those same screens and tasks, evaluated side by side with the frontier model before any traffic moved." },
      { heading: "The result", body: "The same work at a fraction of the running cost, with faster replies on every step and candidate records kept on their own machines." },
    ],
  },
  {
    id: "bayvis",
    company: "Bayvis",
    url: "https://bayvis.co/",
    sector: "Collision repair · Estimate checking",
    brief: "AI estimating for car repair shops. We trained a small model to check every line of an estimate.",
    image: "/logos/bayvis-white.svg",
    metrics: [
      { value: "Fixed", label: "Cost, not a fee per estimate" },
      { value: "2×", label: "Faster drafts (estimate)" },
      { value: "Private", label: "Customer photos stay inside" },
    ],
    story: [
      { heading: "The problem", body: "Bayvis builds estimating software for collision repair shops. From photos of the damage it writes the full repair estimate, with a published source behind every line. Checking each line on a frontier model meant a fee on every estimate, and customers' photos sent to an outside provider." },
      { heading: "What we trained", body: "A small model fine-tuned to check estimate lines against the estimating guides and the car makers' repair procedures." },
      { heading: "The result", body: "Line checks at a cost that no longer grows with each estimate, drafts ready sooner, and shop data kept in-house." },
    ],
  },
];
