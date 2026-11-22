import {redirect, type RouterContextProvider} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import type {PrettyBlogQuery, PrettyArticleQuery} from 'storefrontapi.generated';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {SHOP} from '~/config/shop';
import {blogConfig} from '~/components/blog/blogConfig';
import {excerptFromHtml} from '~/components/blog/format';
import type {pageMeta} from '~/lib/seo';

/**
 * Shared blog loaders used by the pretty blog routes (`/blog`,
 * `/bits-and-bobs-almanac`). Each of those routes targets a fixed blog handle,
 * so the handle never appears in the URL — the loaders receive it directly.
 * The branded views live in `~/components/blog/` (BlogIndex, ArticlePage).
 */

type LoaderContext = {
  context: Readonly<RouterContextProvider>;
  request: Request;
};

type PrettyBlog = NonNullable<PrettyBlogQuery['blog']>;
type PrettyArticle = NonNullable<
  NonNullable<PrettyArticleQuery['blog']>['articleByHandle']
>;

/**
 * Resolve the public URL for a blog handle. Blogs listed in `BLOGS` use their
 * configured pretty path (e.g. `blog` -> `/blog`); anything else falls back to
 * the default `/blogs/:handle` route.
 */
export function blogPathForHandle(handle: string): string {
  return blogConfig(handle)?.path ?? `/blogs/${encodeURIComponent(handle)}`;
}

export function redirectBrandedBlog(request: Request, handle: string, articleHandle?: string) {
  const path = blogConfig(handle)?.path;
  if (path) {
    const article = articleHandle ? `/${encodeURIComponent(articleHandle)}` : '';
    throw redirect(path + article + new URL(request.url).search, 301);
  }
}

export function blogSeo(blog: PrettyBlog | undefined, handle: string): Parameters<typeof pageMeta>[1] {
  const config = blogConfig(handle);
  const title = config?.title ?? blog?.title ?? 'Blog';
  const path = blogPathForHandle(handle);
  return {
    title: blog?.seo?.title || title,
    description: blog?.seo?.description || config?.tagline ||
      `Read the latest posts from ${title} at ${SHOP.name}.`,
    card: handle === SHOP.handles.almanac ? 'almanac' : 'blog',
    pageType: 'CollectionPage',
    paginated: true,
    entity: blog && ((_url, origin) => ({
      '@type': 'Blog',
      '@id': `${origin}${path}#blog`,
      name: title,
      url: `${origin}${path}`,
      publisher: {'@id': `${origin}/#organization`},
      blogPost: blog.articles.nodes.map((article) => ({
        '@type': 'BlogPosting',
        '@id': `${origin}${path}/${encodeURIComponent(article.handle)}#article`,
        headline: article.title,
      })),
    })),
  };
}

export function articleSeo(article: PrettyArticle | undefined, handle: string): Parameters<typeof pageMeta>[1] {
  const blogName = blogConfig(handle)?.title ?? article?.blog.title ?? 'Blog';
  const blogPath = blogPathForHandle(handle);
  const byline = article?.author?.name?.trim();
  const description = article?.seo?.description || article?.excerpt ||
    excerptFromHtml(article?.contentHtml) || `Read ${article?.title || 'the latest story'} in ${blogName}.`;
  return {
    title: article?.seo?.title || article?.title || 'Article',
    description,
    type: 'article',
    card: handle === SHOP.handles.almanac ? 'almanac' : 'blog',
    image: article?.image ?? undefined,
    publishedTime: article?.publishedAt,
    author: byline,
    breadcrumbs: [{name: blogName, path: blogPath}],
    entity: article && ((url, origin) => ({
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      url,
      headline: article.title,
      description,
      datePublished: article.publishedAt,
      image: article.image?.url,
      author: byline?.toLowerCase() === SHOP.name.toLowerCase()
        ? {'@id': `${origin}/#organization`}
        : byline ? {'@type': 'Person', name: byline} : undefined,
      publisher: {'@id': `${origin}/#organization`},
      isPartOf: {'@id': `${origin}${blogPath}#blog`},
      mainEntityOfPage: {'@id': `${url}#webpage`},
    })),
  };
}

export async function loadBlogArticles(
  {context, request}: LoaderContext,
  blogHandle: string,
): Promise<{blog: PrettyBlog}> {
  const paginationVariables = getPaginationVariables(request, {pageBy: 10});

  const {blog} = await context.storefront.query(BLOG_ARTICLES_QUERY, {
    variables: {blogHandle, ...paginationVariables},
  });

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  return {blog};
}

export async function loadArticle(
  {context, request}: LoaderContext,
  blogHandle: string,
  articleHandle: string | undefined,
): Promise<{article: PrettyArticle}> {
  if (!articleHandle) {
    throw new Response('Not found', {status: 404});
  }

  const {blog} = await context.storefront.query(ARTICLE_QUERY, {
    variables: {blogHandle, articleHandle},
  });

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  // The blog handle isn't part of a pretty URL, so only the article handle can
  // be localized here.
  redirectIfHandleIsLocalized(request, {
    handle: articleHandle,
    data: blog.articleByHandle,
  });

  return {article: blog.articleByHandle};
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOG_ARTICLES_QUERY = `#graphql
  query PrettyBlog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...PrettyArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
  fragment PrettyArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query PrettyArticle(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        excerpt
        blog { title }
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
` as const;
