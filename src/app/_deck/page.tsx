import type { Metadata } from "next";
import { Deck } from "@/components/deck/deck";
import "./deck.css";

// The pitch deck. SWITCHED OFF: this folder is named `_deck`, and Next.js gives folders that
// start with an underscore no URL. Rename it back to `deck` to bring /deck back.
// When live it is shared by link, so search engines are asked to skip it.
export const metadata: Metadata = {
  title: "Adaptral | Pitch deck",
  description: "Small AI models trained for one job in your business, on your own servers, at a fixed cost.",
  alternates: { canonical: "/deck" },
  robots: { index: false, follow: false },
};

// Same rule as the home page: the Calendly link is read here, at build time.
const calendly = (process.env.NEXT_CALENDLY_URL ?? "").trim();
const calendlyUrl = /^https?:\/\//i.test(calendly) ? calendly : "";

export default function DeckPage() {
  return <Deck calendlyUrl={calendlyUrl} />;
}
