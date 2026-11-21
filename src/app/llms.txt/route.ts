import { getAllPosts, getAllSignals } from "@/lib/content";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../site";

// llms.txt (llmstxt.org): a plain index AI answer engines and agents can read in one fetch.
export const dynamic = "force-static";

export function GET() {
  const line = (path: string, title: string, description: string) => `- [${title}](${SITE_URL}${path}): ${description}`;
  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Blog",
    ...getAllPosts().map((p) => line(`/blog/${p.slug}`, p.title, p.description)),
    "",
    "## Signal",
    ...getAllSignals().map((p) => line(`/signal/${p.slug}`, p.title, p.description)),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
