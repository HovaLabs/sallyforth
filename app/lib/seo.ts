import {isRouteErrorResponse, type MetaDescriptor} from 'react-router';
import {SHOP} from '~/config/shop';

const cards = {
  home: 'The SallyForth signature above an illustrated vegetable garden at sunrise.',
  shop: 'The SallyForth Store beside a seed packet illustrated with a red radish.',
  blog: 'The SallyForth Blog framed by blue forget-me-nots and a garden snail.',
  almanac: 'Bits and Bobs Almanac beside a flowering sweet pea vine.',
  about: 'From my little patch, a stamped SallyForth letter on blue gingham.',
};

type MetaContext = {
  location: {pathname: string; search: string};
  matches: ReadonlyArray<{id: string; data?: unknown} | undefined>;
  error?: unknown;
};

type Crumb = {name: string; path: string};
type PageDetails = {
  title: string;
  description: string;
  path?: string;
  card?: keyof typeof cards;
  image?: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
  type?: 'website' | 'article' | 'product';
  pageType?: string;
  breadcrumbs?: Crumb[];
  entity?: (url: string, origin: string) => Record<string, unknown>;
  questions?: ReadonlyArray<{question: string; answer: string}>;
  author?: string | null;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  paginated?: boolean;
  noindex?: boolean;
};

export function errorMeta(error: unknown): MetaDescriptor[] {
  const title = isRouteErrorResponse(error) && error.status === 404 ? 'Page not found' : 'Page unavailable';
  return [{title: `${title} — ${SHOP.name}`}, {name: 'robots', content: 'noindex, follow'}];
}

export function pageMeta(context: MetaContext, page: PageDetails): MetaDescriptor[] {
  const root = context.matches.find((match) => match?.id === 'root')?.data as {siteOrigin: string} | undefined;
  if (context.error || !root?.siteOrigin) return errorMeta(context.error);
  const origin = root.siteOrigin;
  const canonical = new URL(origin);
  canonical.pathname = (page.path ?? context.location.pathname).replace(/\/+$/, '') || '/';
  if (page.paginated) {
    const params = new URLSearchParams(context.location.search);
    const cursor = params.get('cursor');
    if (cursor) {
      canonical.searchParams.set('direction', params.get('direction') === 'previous' ? 'previous' : 'next');
      canonical.searchParams.set('cursor', cursor);
    }
  }
  const url = canonical.href;
  const title = /\bSallyForth\b/i.test(page.title) ? page.title : `${page.title} — ${SHOP.name}`;
  const card = page.card ?? 'home';
  const image = page.image?.url ? page.image : {
    url: `/social/${card}.jpg`, altText: cards[card], width: 1200, height: 630,
  };
  const imageUrl = new URL(image.url, origin).href;
  const imageAlt = image.altText || page.title;
  const meta: MetaDescriptor[] = [
    {title},
    {name: 'description', content: page.description},
    {tagName: 'link', rel: 'canonical', href: url},
    {name: 'robots', content: page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'},
    {property: 'og:site_name', content: SHOP.name},
    {property: 'og:locale', content: 'en_US'},
    {property: 'og:type', content: page.type ?? 'website'},
    {property: 'og:url', content: url},
    {property: 'og:title', content: title},
    {property: 'og:description', content: page.description},
    {property: 'og:image', content: imageUrl},
    {property: 'og:image:alt', content: imageAlt},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: page.description},
    {name: 'twitter:image', content: imageUrl},
    {name: 'twitter:image:alt', content: imageAlt},
  ];
  if (image.width && image.height) {
    meta.push(
      {property: 'og:image:width', content: String(image.width)},
      {property: 'og:image:height', content: String(image.height)},
    );
  }
  if (page.publishedTime) meta.push({property: 'article:published_time', content: page.publishedTime});
  if (page.modifiedTime) meta.push({property: 'article:modified_time', content: page.modifiedTime});
  if (page.author) meta.push({name: 'author', content: page.author});
  if (page.noindex) return meta;

  const organization = `${origin}/#organization`;
  const website = `${origin}/#website`;
  const entity = page.entity?.(url, origin);
  const crumbs = [{name: 'Home', path: '/'}, ...(page.breadcrumbs ?? []).filter((crumb) => crumb.path !== '/')];
  if (crumbs[crumbs.length - 1].path !== canonical.pathname) {
    crumbs.push({name: page.title, path: canonical.pathname});
  }
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization', '@id': organization, name: SHOP.name, url: origin + '/',
      logo: {'@type': 'ImageObject', url: origin + '/social/brand-mark.png'},
    },
    {
      '@type': 'WebSite', '@id': website, name: SHOP.name, url: origin + '/',
      inLanguage: 'en-US', publisher: {'@id': organization},
    },
    {
      '@type': page.pageType ?? 'WebPage', '@id': url + '#webpage', url,
      name: page.title, description: page.description, inLanguage: 'en-US',
      isPartOf: {'@id': website}, publisher: {'@id': organization},
      primaryImageOfPage: {'@type': 'ImageObject', url: imageUrl},
      breadcrumb: crumbs.length > 1 ? {'@id': url + '#breadcrumb'} : undefined,
      mainEntity: page.questions?.map(({question, answer}) => ({
        '@type': 'Question', name: question, acceptedAnswer: {'@type': 'Answer', text: answer},
      })) ?? (entity ? {'@id': entity['@id']} : undefined),
    },
  ];
  if (crumbs.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList', '@id': url + '#breadcrumb',
      itemListElement: crumbs.map((crumb, i) => ({
        '@type': 'ListItem', position: i + 1, name: crumb.name,
        item: i === crumbs.length - 1 ? url : new URL(crumb.path, origin).href,
      })),
    });
  }
  if (entity) graph.push(entity);
  meta.push({'script:ld+json': {'@context': 'https://schema.org', '@graph': graph}});
  return meta;
}
