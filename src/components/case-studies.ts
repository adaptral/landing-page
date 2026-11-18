export type CaseStudy = {
  id: string;
  company: string;
  sector: string;
  // One line shown on the card inside the network.
  brief: string;
  // Path under /public, e.g. "/studies/acme.png". Leave undefined to show the placeholder.
  image?: string;
  metrics: { value: string; label: string }[];
  story: { heading: string; body: string }[];
};

// Placeholder content: replace each entry with a real partner. Cards are wired
// two per layer, in order, so keep the count even.
export const caseStudies: CaseStudy[] = Array.from({ length: 6 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `partner-${number}`,
    company: `Partner ${number}`,
    sector: "Industry · Use case",
    brief: "One line on the task we trained a model for, and what changed for them.",
    metrics: [
      { value: "00%", label: "Headline metric" },
      { value: "00×", label: "Second metric" },
      { value: "00ms", label: "Third metric" },
    ],
    story: [
      { heading: "The problem", body: "Placeholder. What the partner was trying to do, and why an off-the-shelf model was not good enough." },
      { heading: "What we trained", body: "Placeholder. The data we started from, the model we shaped around their task, and how we evaluated it." },
      { heading: "The result", body: "Placeholder. What improved, how it was measured, and what the partner did next." },
    ],
  };
});
