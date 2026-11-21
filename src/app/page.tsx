import { Landing } from "@/components/landing";

// The Calendly link comes from the NEXT_CALENDLY_URL environment variable. It is read here,
// on the server at build time, because only NEXT_PUBLIC_ variables reach browser code directly.
// Missing, empty or malformed, it becomes "" and the buttons stay inert.
const calendly = (process.env.NEXT_CALENDLY_URL ?? "").trim();
const calendlyUrl = /^https?:\/\//i.test(calendly) ? calendly : "";

export default function Home() {
  return <Landing calendlyUrl={calendlyUrl} />;
}
