import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/content/cards";
import { Breadcrumbs, JsonLd } from "@/components/content/chrome";
import { AUTHORS, authorBySlug, personSchema } from "@/lib/authors";
import { getAllPosts } from "@/lib/content";
import { SITE_NAME } from "../../../site";

export const dynamicParams = false;

export function generateStaticParams() {
  return AUTHORS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/authors/[slug]">): Promise<Metadata> {
  const author = authorBySlug((await params).slug);
  if (!author) return {};
  return {
    title: `${author.name}, ${author.role} | ${SITE_NAME}`,
    description: author.bio,
    alternates: { canonical: `/blog/authors/${author.slug}` },
  };
}

export default async function AuthorPage({ params }: PageProps<"/blog/authors/[slug]">) {
  const author = authorBySlug((await params).slug);
  if (!author) notFound();
  const posts = getAllPosts().filter((p) => p.author === author.name);
  return (
    <main className="blog-index">
      <JsonLd data={{ "@type": "ProfilePage", mainEntity: personSchema(author) }} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: author.name, href: `/blog/authors/${author.slug}` },
        ]}
      />
      <header className="page-head author-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={author.photo} alt={author.name} width={96} height={96} />
        <div>
          <p className="eyebrow">{author.role}</p>
          <h1>{author.name}</h1>
          <p className="page-lede">{author.bio}</p>
          <p className="author-links">
            {author.sameAs.map((u) => (
              <a key={u} href={u} rel="me noopener">
                {new URL(u).hostname.replace(/^www\./, "").replace(/\.com$/, "")}
              </a>
            ))}
          </p>
        </div>
      </header>
      {posts.length ? (
        <ul className="post-grid">
          {posts.map((p) => (
            <li key={p.slug}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">No posts yet.</p>
      )}
    </main>
  );
}
