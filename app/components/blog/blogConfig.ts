import {BLOGS, type ArtKey} from '~/config/shop';

export type BlogConfig = (typeof BLOGS)[keyof typeof BLOGS];

export const DEFAULT_BLOG_ART: [ArtKey, ArtKey] = ['tomato', 'carrot'];

/** Title, tagline and art pair for a blog handle; undefined for blogs not in `BLOGS`. */
export function blogConfig(handle: string): BlogConfig | undefined {
  return (BLOGS as Record<string, BlogConfig | undefined>)[handle];
}
