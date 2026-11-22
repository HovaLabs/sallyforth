/** Use the public storefront host for shared links, including on preview domains. */
export function siteOrigin(request: Request, env: {PUBLIC_SITE_URL?: string}): string {
  if (env.PUBLIC_SITE_URL && URL.canParse(env.PUBLIC_SITE_URL)) {
    const configured = new URL(env.PUBLIC_SITE_URL);
    if (configured.protocol === 'https:' || configured.protocol === 'http:') return configured.origin;
  }
  return new URL(request.url).origin;
}
