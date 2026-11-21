import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Chart } from "@/components/charts/chart";

/*
 * The Markdown renderer for /blog and /signal. Server-rendered: crawlers and AI fetchers read every
 * word, number and table. Fenced blocks with these languages become components:
 *   ```chart  ```table  ```stats   a chart, a benchmark table or headline numbers (JSON; see charts.md)
 *   ```details                     first line is the summary, the rest is revealed (native <details>)
 */

const WIDGETS = ["chart", "table", "stats"];

function fence(child: ReactNode): { lang: string; raw: string } | null {
  if (!isValidElement<{ className?: string; children?: ReactNode }>(child)) return null;
  const lang = /language-(\w+)/.exec(child.props.className ?? "")?.[1];
  const body = child.props.children;
  const raw = Array.isArray(body) ? body.join("") : body;
  return lang && typeof raw === "string" ? { lang, raw } : null;
}

export function Prose({ content }: { content: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          // Each H2 carries a link to itself, so a reader can share the exact section.
          h2: ({ children, id }) => (
            <h2 id={id}>
              <a className="prose-anchor" href={`#${id}`} aria-hidden="true" tabIndex={-1}>
                #
              </a>
              {children}
            </h2>
          ),
          a: ({ href, children }) => {
            const external = href?.startsWith("http") && !href.startsWith("https://www.adaptral.com");
            return (
              <a href={href} {...(external ? { rel: "noopener" } : {})}>
                {children}
              </a>
            );
          },
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" decoding="async" />,
          // A wide table scrolls in its own box instead of dragging a scrollbar onto the page.
          table: ({ children }) => (
            <div className="prose-table">
              <table>{children}</table>
            </div>
          ),
          pre: ({ children }) => {
            const f = fence(Array.isArray(children) ? children[0] : children);
            if (f && WIDGETS.includes(f.lang)) return <Chart raw={f.raw} lang={f.lang} />;
            if (f?.lang === "details") {
              const [summary, ...rest] = f.raw.replace(/\n$/, "").split("\n");
              return (
                <details className="prose-details">
                  <summary>{summary}</summary>
                  <pre>{rest.join("\n")}</pre>
                </details>
              );
            }
            return <pre>{children}</pre>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
