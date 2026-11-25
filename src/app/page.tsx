import { Landing } from "@/components/landing";
import { SiteFooter } from "@/components/site-footer";
import { CALENDLY_URL } from "./site";

export default function Home() {
  return (
    <>
      <Landing calendlyUrl={CALENDLY_URL} />
      <SiteFooter />
    </>
  );
}
