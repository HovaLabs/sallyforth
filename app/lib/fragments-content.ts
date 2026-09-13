export const ARTICLE_CARD_FRAGMENT = `#graphql
  fragment ArticleCard on Article {
    id
    handle
    title
    excerpt
    publishedAt
    tags
    author: authorV2 { name }
    image { id url altText width height }
  }
` as const;
