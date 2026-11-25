import "../content.css";
import { SiteHeader } from "@/components/content/chrome";
import { SiteFooter } from "@/components/site-footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="content-page">
      <SiteHeader current="blog" />
      <div className="content-main">{children}</div>
      <SiteFooter />
    </div>
  );
}
