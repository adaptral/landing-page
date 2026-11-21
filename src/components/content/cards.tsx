import Link from "next/link";
import { formatDate, type PostMeta } from "@/lib/content";

/**
 * A post's cover at 2:1. The generated image (npm run blog:cover) when there is one; otherwise a
 * type cover drawn in CSS from the tag and title, so a new post never ships with a grey box.
 */
export function Cover({ post, eager }: { post: PostMeta; eager?: boolean }) {
  if (post.image)
    return (
      <div className="cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.image} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
      </div>
    );
  return (
    <div className="cover cover-type" aria-hidden="true" data-tag={post.tag}>
      <span className="cover-type-tag">{post.tag}</span>
      <span className="cover-type-title">{post.title}</span>
    </div>
  );
}

export function PostMetaLine({ post }: { post: PostMeta }) {
  return (
    <p className="meta-line">
      <span className="meta-tag">{post.tag}</span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span>{post.readingTime} min read</span>
    </p>
  );
}

export function PostCard({ post, featured }: { post: PostMeta; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className={featured ? "post-card post-card-featured" : "post-card"} data-tag={post.tag}>
      <Cover post={post} eager={featured} />
      <div className="post-card-body">
        {featured && <span className="post-card-latest">Latest</span>}
        <PostMetaLine post={post} />
        <span className="post-card-title">{post.title}</span>
        <span className="post-card-desc">{post.description}</span>
        <span className="post-card-author">{post.author}</span>
      </div>
    </Link>
  );
}
