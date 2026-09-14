import {type RouterContextProvider} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import type {PrettyBlogQuery, PrettyArticleQuery} from 'storefrontapi.generated';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {BLOGS} from '~/config/shop';

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
  const configured = (BLOGS as Record<string, {path: string} | undefined>)[
    handle
  ];
  return configured?.path ?? `/blogs/${handle}`;
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
