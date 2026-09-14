import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ART} from '~/config/shop';
import {excerptFromHtml, formatDate} from './format';

/**
 * The subset of an article both blog queries provide. `excerpt` is used when
 * the fragment has it; otherwise one is derived from `contentHtml`.
 */
export type PostLike = {
  id: string;
  handle: string;
  title: string;
  publishedAt: string;
  image?: {id?: string | null; url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
  excerpt?: string | null;
  contentHtml?: string | null;
};

export function postExcerpt(post: PostLike, max: number): string {
  return post.excerpt?.trim() || excerptFromHtml(post.contentHtml, max);
}

export function PostCard({post, basePath, loading = 'lazy'}: {post: PostLike; basePath: string; loading?: 'eager' | 'lazy'}) {
  const url = `${basePath}/${post.handle}`;
  const excerpt = postExcerpt(post, 150);
  return (
    <article className="sf-post">
      {/* The image duplicates the title link, so it's hidden from assistive tech and the tab order. */}
      <Link to={url} className="sf-post__img" aria-hidden="true" tabIndex={-1}>
        {post.image ? (
          <Image data={post.image} aspectRatio="3/2" sizes="(min-width: 1000px) 33vw, (min-width: 600px) 50vw, 100vw" loading={loading} alt={post.image.altText || post.title} />
        ) : (
          <img src={ART.blogTile} alt="" />
        )}
      </Link>
      <div className="sf-post__body">
        <div className="sf-eyebrow">{formatDate(post.publishedAt)}</div>
        <h3 className="sf-post__title"><Link to={url}>{post.title}</Link></h3>
        {excerpt ? <p className="sf-post__excerpt">{excerpt}</p> : null}
        <Link to={url} className="sf-italic-link sf-post__read">Read →</Link>
      </div>
    </article>
  );
}
