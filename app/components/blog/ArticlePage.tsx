import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {ArticleCardFragment, PrettyArticleQuery} from 'storefrontapi.generated';
import {WaveDivider} from '~/components/WaveDivider';
import {ART, type ArtKey} from '~/config/shop';
import {blogPathForHandle} from '~/lib/blog';
import {blogConfig} from './blogConfig';
import {formatDate} from './format';
import {PostCard} from './PostCard';

type PrettyArticle = NonNullable<NonNullable<PrettyArticleQuery['blog']>['articleByHandle']>;

/**
 * Branded article page: centred header with eyebrow/byline, hero image tile,
 * a 720px reading column with a drop cap, and a "More from the garden" strip.
 * Renders the data `loadArticle` (app/lib/blog.tsx) + `loadMoreArticles` return.
 */
export function ArticlePage({article, blogHandle, more}: {article: PrettyArticle; blogHandle: string; more: ArticleCardFragment[]}) {
  const config = blogConfig(blogHandle);
  const basePath = blogPathForHandle(blogHandle);
  const blogTitle = config?.title ?? 'The Blog';
  const accent: ArtKey = config?.art[0] ?? 'tomato';

  return (
    <article className="sf-article">
      <header className="sf-article__head">
        <img className="sf-art" src={ART[accent]} alt="" style={{right: -150, top: -10, width: 320, transform: 'rotate(14deg)'}} />
        <div className="sf-wrap">
          <div className="sf-article__head-inner">
            <div className="sf-eyebrow">
              <Link to={basePath}>{blogTitle}</Link> · {formatDate(article.publishedAt)}
            </div>
            <h1 className="sf-article__title">{article.title}</h1>
            {article.author?.name ? <p className="sf-article__byline">by {article.author.name}</p> : null}
          </div>
          {article.image ? (
            <div className="sf-article__hero">
              <Image data={article.image} sizes="(min-width: 1000px) 1000px, 100vw" loading="eager" alt={article.image.altText || article.title} />
            </div>
          ) : null}
        </div>
      </header>
      <div className="sf-wrap">
        <div className="sf-article__body" dangerouslySetInnerHTML={{__html: article.contentHtml}} />
        <div className="sf-article__foot">
          <Link to={basePath} className="sf-italic-link">← Back to {blogTitle}</Link>
        </div>
      </div>
      {more.length ? (
        <section className="sf-article__more" aria-labelledby="sf-more-title">
          <WaveDivider variant="blog" fill="cream" />
          <div className="sf-wrap">
            <div className="sf-section-head">
              <span id="sf-more-title" className="sf-section-title">More from the garden</span>
              <Link to={basePath} className="sf-italic-link">All posts</Link>
            </div>
            <div className="sf-posts__grid">
              {more.map((post) => <PostCard key={post.id} post={post} basePath={basePath} />)}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
