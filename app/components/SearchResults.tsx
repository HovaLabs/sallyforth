import type {ReactNode} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import type {
  SearchArticleFragment,
  SearchProductFragment,
} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {formatDate} from '~/components/blog/format';
import {ART} from '~/config/shop';
import {blogPathForHandle} from '~/lib/blog';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';

const illustrations = {article: ART.blogTile, product: ART.logoSmall, page: ART.snail};

interface ResultProps {
  kind: keyof typeof illustrations;
  to: string;
  title: string;
  image?: SearchArticleFragment['image'];
  inlineImage?: string;
  summary?: string | null;
  byline?: ReactNode;
  price?: MoneyV2;
  loading: 'eager' | 'lazy';
}

function ResultPreview({
  kind, to, title, image, inlineImage, summary, byline, price, loading,
}: ResultProps) {
  const padImage = kind === 'product' || (!image && !inlineImage);
  return (
    <article className="sf-search-result">
      <Link className="sf-search-result__link" to={to} prefetch="intent" aria-label={title}>
        <div className={`sf-search-result__image${padImage ? ' sf-search-result__image--padded' : ''}`}>
          {image ? (
            <Image
              data={image}
              alt={image.altText || ''}
              sizes="(max-width: 600px) 100vw, (max-width: 1000px) 25vw, 250px"
              loading={loading}
            />
          ) : (
            <img src={inlineImage ?? illustrations[kind]} alt="" loading={loading} />
          )}
        </div>
        <div className="sf-search-result__text">
          {byline && <div className="sf-eyebrow sf-search-result__byline">{byline}</div>}
          <h3>{title}</h3>
          {summary && <p>{summary}</p>}
          {price && <div className="sf-search-result__price"><Money data={price} /></div>}
        </div>
      </Link>
    </article>
  );
}

export function SearchResults({items, term}: {
  items: RegularSearchReturn['result']['items'];
  term: string;
}) {
  const {products, articles, pages} = items;
  const resultUrl = (baseUrl: string, trackingParams?: string | null) =>
    urlWithTrackingParams({baseUrl, trackingParams, term});

  return (
    <div className="sf-search__groups">
      {products.nodes.length > 0 && (
        <section className="sf-search__group" aria-labelledby="search-products">
          <h2 id="search-products">Products</h2>
          <PaginatedResourceSection<SearchProductFragment>
            connection={products}
            resourcesClassName="sf-search__list"
          >
            {({node: product, index}) => {
              const variant = product.selectedOrFirstAvailableVariant;
              return (
                <ResultPreview
                  key={product.id}
                  kind="product"
                  to={resultUrl(`/products/${product.handle}`, product.trackingParameters)}
                  title={product.title}
                  image={variant?.image ?? product.featuredImage}
                  summary={product.description}
                  price={variant?.price}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              );
            }}
          </PaginatedResourceSection>
        </section>
      )}
      {articles.nodes.length > 0 && (
        <section className="sf-search__group" aria-labelledby="search-articles">
          <h2 id="search-articles">Articles</h2>
          <div className="sf-search__list">
            {articles.nodes.map((article, index) => (
              <ResultPreview
                key={article.id}
                kind="article"
                to={resultUrl(`${blogPathForHandle(article.blog.handle)}/${encodeURIComponent(article.handle)}`, article.trackingParameters)}
                title={article.title}
                image={article.image}
                inlineImage={article.inlineImage}
                summary={article.excerpt}
                byline={
                  <>{article.blog.title} · <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time></>
                }
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        </section>
      )}
      {pages.nodes.length > 0 && (
        <section className="sf-search__group" aria-labelledby="search-pages">
          <h2 id="search-pages">Pages</h2>
          <div className="sf-search__list">
            {pages.nodes.map((page, index) => (
              <ResultPreview
                key={page.id}
                kind="page"
                to={resultUrl(`/pages/${page.handle}`, page.trackingParameters)}
                title={page.title}
                inlineImage={page.inlineImage}
                summary={page.bodySummary}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
