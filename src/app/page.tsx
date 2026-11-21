import { Landing } from "@/components/landing";
import { CALENDLY_URL } from "./site";

export default function Home() {
  return <Landing calendlyUrl={CALENDLY_URL} />;
}
