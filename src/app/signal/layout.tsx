import "../content.css";
import { SiteFooter, SiteHeader } from "@/components/content/chrome";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-page">
      <SiteHeader current="signal" />
      <div className="content-main">{children}</div>
      <SiteFooter />
    </div>
  );
}
