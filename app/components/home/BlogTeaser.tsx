import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {HomeArticlesQuery, ArticleCardFragment} from 'storefrontapi.generated';
import {WaveDivider} from '~/components/WaveDivider';
import {ART, BLOGS, SHOP} from '~/config/shop';

const BLOG = BLOGS[SHOP.handles.blog];

export function articleUrl(article: Pick<ArticleCardFragment, 'handle'>) {
  return `${BLOG.path}/${article.handle}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).toUpperCase();
}

export function BlogTeaser({articles}: {articles: Promise<HomeArticlesQuery | null>}) {
  return (
    <section id="blog" className="sf-blog pad">
      <img className="sf-art" src={ART.tomato} alt="" style={{right: -190, bottom: -40, width: 330, transform: 'rotate(12deg)'}} />
      <img className="sf-art" src={ART.blogArtLeft} alt="" style={{left: -320, bottom: -60, width: 570, transform: 'rotate(-18deg)'}} />
      <WaveDivider variant="blog" fill="white" />
      <div className="sf-section-head">
        <span className="sf-section-title">{BLOG.title}</span>
        <Link to={BLOG.path} className="sf-italic-link">All posts</Link>
      </div>
      <Suspense fallback={<TeaserBody articles={[]} loading />}>
        <Await resolve={articles}>
          {(data) => <TeaserBody articles={data?.blog?.articles.nodes ?? []} />}
        </Await>
      </Suspense>
    </section>
  );
}

function TeaserBody({articles, loading = false}: {articles: ArticleCardFragment[]; loading?: boolean}) {
  const [featured, ...rest] = articles;
  return (
    <div className="sf-blog__grid">
      <div className="sf-blog__tile">
        {featured?.image ? (
          <Image data={featured.image} sizes="(min-width: 900px) 460px, 100vw" className="sf-blog__tile-photo" alt={featured.image.altText || featured.title} />
        ) : (
          <img src={ART.blogTile} alt="" className="sf-blog__tile-art" />
        )}
      </div>
      <div>
        {featured ? (
          <>
            <div className="sf-eyebrow" style={{marginBottom: 12}}>Latest · {formatDate(featured.publishedAt)}</div>
            <div className="sf-blog__title">{featured.title}</div>
            {featured.excerpt ? <p className="sf-blog__excerpt">{featured.excerpt}</p> : null}
            <Link to={articleUrl(featured)} className="sf-blog__cta">READ THE POST →</Link>
            {rest.length ? (
              <div className="sf-blog__more">
                {rest.slice(0, 2).map((a) => <Link key={a.id} to={articleUrl(a)}>{a.title}</Link>)}
              </div>
            ) : null}
          </>
        ) : (
          <p className="sf-blog__empty">{loading ? 'Loading the latest…' : 'Nothing planted here yet.'}</p>
        )}
      </div>
    </div>
  );
}
