import type { Metadata } from "next";
import { Deck } from "@/components/deck/deck";
import "./deck.css";

// The pitch deck, at /deck. Back on temporarily. To switch it off again without deleting
// anything, rename this folder to `_deck`: Next.js gives folders that start with an underscore no URL.
// It is shared by link, so search engines are asked to skip it.
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
