import type {AdminFetch} from '~/lib/newsletter/subscribe';

export const ADMIN_API_VERSION = '2026-04';

/**
 * Real Admin GraphQL fetch bound to the store + private token.
 * Returns null when not configured so callers can degrade gracefully.
 */
export function createAdminFetch(env: {
  PUBLIC_STORE_DOMAIN?: string;
  PRIVATE_ADMIN_API_ACCESS_TOKEN?: string;
}): AdminFetch | null {
  const domain = env.PUBLIC_STORE_DOMAIN;
  const token = env.PRIVATE_ADMIN_API_ACCESS_TOKEN;
  if (!domain || !token || domain === 'mock.shop') return null;
  const url = `https://${domain}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
  return async (query, variables) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token},
      body: JSON.stringify({query, variables}),
    });
    if (!res.ok) throw new Error(`Admin API ${res.status}`);
    return (await res.json()) as {data?: any; errors?: unknown};
  };
}
