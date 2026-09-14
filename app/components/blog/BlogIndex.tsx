import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {PrettyBlogQuery, PrettyArticleItemFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {WaveDivider} from '~/components/WaveDivider';
import {ART, SHOP} from '~/config/shop';
import {blogPathForHandle} from '~/lib/blog';
import {DEFAULT_BLOG_ART, blogConfig} from './blogConfig';
import {formatDate} from './format';
import {PostCard, postExcerpt} from './PostCard';

type PrettyBlog = NonNullable<PrettyBlogQuery['blog']>;

/**
 * Branded blog index for `/blog` and `/bits-and-bobs-almanac`: a hero with the
 * blog's tagline and art pair, the newest post featured, then the rest in a
 * cream band. Renders the data `loadBlogArticles` (app/lib/blog.tsx) returns.
 */
export function BlogIndex({blog}: {blog: PrettyBlog}) {
  const config = blogConfig(blog.handle);
  const basePath = blogPathForHandle(blog.handle);
  const title = config?.title ?? blog.title;
  const [artA, artB] = config?.art ?? DEFAULT_BLOG_ART;
  const nodes = blog.articles.nodes;
  // Feature the newest post regardless of the connection's order.
  const featured = nodes.reduce<PrettyArticleItemFragment | null>(
    (best, article) => (!best || new Date(article.publishedAt) > new Date(best.publishedAt) ? article : best),
    null,
  );
  const featuredId = featured?.id;
  const hasMore = nodes.length > 1 || blog.articles.pageInfo.hasNextPage;

  return (
    <div className="sf-posts">
      <section className="sf-posts__hero" aria-labelledby="sf-posts-title">
        <img className="sf-art" src={ART[artA]} alt="" style={{left: -150, top: 30, width: 380, transform: 'rotate(-14deg)'}} />
        <img className="sf-art" src={ART[artB]} alt="" style={{right: -130, top: 140, width: 320, transform: 'rotate(16deg)'}} />
        <div className="sf-wrap">
          <div className="sf-posts__hero-text">
            <div className="sf-eyebrow">{SHOP.name}</div>
            <h1 id="sf-posts-title" className="sf-posts__title">{title}</h1>
            {config?.tagline ? <p className="sf-posts__tagline">{config.tagline}</p> : null}
          </div>
          {featured ? <FeaturedPost post={featured} basePath={basePath} /> : <p className="sf-posts__empty">Nothing planted here yet.</p>}
        </div>
      </section>
      {featured && hasMore ? (
        <section className="sf-posts__band" aria-labelledby="sf-posts-all">
          <WaveDivider variant="store" fill="cream" />
          <div className="sf-wrap sf-posts__list">
            <div className="sf-section-head">
              <span id="sf-posts-all" className="sf-section-title">All posts</span>
            </div>
            <PaginatedResourceSection<PrettyArticleItemFragment> connection={blog.articles} resourcesClassName="sf-posts__grid">
              {({node, index}) =>
                node.id === featuredId ? null : <PostCard key={node.id} post={node} basePath={basePath} loading={index < 3 ? 'eager' : 'lazy'} />
              }
            </PaginatedResourceSection>
          </div>
        </section>
      ) : null}
    </div>
  );
}

/** The home teaser's two-column card: image tile beside eyebrow, title, excerpt, CTA. */
function FeaturedPost({post, basePath}: {post: PrettyArticleItemFragment; basePath: string}) {
  const url = `${basePath}/${post.handle}`;
  const excerpt = postExcerpt(post, 200);
  return (
    <div className="sf-posts__featured">
      <Link to={url} className="sf-posts__tile" aria-hidden="true" tabIndex={-1}>
        {post.image ? (
          <Image data={post.image} sizes="(min-width: 900px) 460px, 100vw" loading="eager" alt={post.image.altText || post.title} />
        ) : (
          <img src={ART.blogTile} alt="" className="sf-posts__tile-art" />
        )}
      </Link>
      <div>
        <div className="sf-eyebrow">Latest · {formatDate(post.publishedAt)}</div>
        <h2 className="sf-posts__featured-title"><Link to={url}>{post.title}</Link></h2>
        {excerpt ? <p className="sf-posts__excerpt">{excerpt}</p> : null}
        <Link to={url} className="sf-posts__cta">READ THE POST →</Link>
      </div>
    </div>
  );
}
