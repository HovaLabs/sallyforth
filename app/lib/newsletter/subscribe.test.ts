import {describe, expect, it, vi} from 'vitest';
import {subscribe, type AdminFetch} from '~/lib/newsletter/subscribe';

function fakeAdmin(responses: Array<{data?: any; errors?: unknown}>) {
  const calls: Array<{query: string; variables: Record<string, unknown>}> = [];
  const fetch: AdminFetch = vi.fn(async (query, variables) => {
    calls.push({query, variables});
    return responses.shift() ?? {data: {}};
  });
  return {fetch, calls};
}

describe('subscribe', () => {
  it('creates a subscribed customer tagged newsletter', async () => {
    const {fetch, calls} = fakeAdmin([
      {data: {customerCreate: {customer: {id: 'gid://shopify/Customer/1'}, userErrors: []}}},
    ]);
    await expect(subscribe('sally@example.com', fetch)).resolves.toEqual({ok: true});
    expect(calls).toHaveLength(1);
    expect(calls[0].query).toContain('customerCreate');
    expect(calls[0].variables).toEqual({
      input: {
        email: 'sally@example.com',
        tags: ['newsletter'],
        emailMarketingConsent: {marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN'},
      },
    });
  });

  it('updates consent when the email already exists', async () => {
    const {fetch, calls} = fakeAdmin([
      {data: {customerCreate: {customer: null, userErrors: [{field: ['email'], message: 'Email has already been taken'}]}}},
      {data: {customers: {nodes: [{id: 'gid://shopify/Customer/7'}]}}},
      {data: {customerEmailMarketingConsentUpdate: {customer: {id: 'gid://shopify/Customer/7'}, userErrors: []}}},
    ]);
    await expect(subscribe('sally@example.com', fetch)).resolves.toEqual({ok: true});
    expect(calls).toHaveLength(3);
    expect(calls[1].variables).toEqual({q: 'email:"sally@example.com"'});
    expect(calls[2].variables).toEqual({
      input: {
        customerId: 'gid://shopify/Customer/7',
        emailMarketingConsent: {marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN'},
      },
    });
  });

  it('reports a friendly error on other user errors', async () => {
    const {fetch} = fakeAdmin([
      {data: {customerCreate: {customer: null, userErrors: [{field: ['email'], message: 'Email is invalid'}]}}},
    ]);
    await expect(subscribe('sally@example.com', fetch)).resolves.toEqual({
      ok: false,
      error: "Hmm, that didn't take — try again in a moment.",
    });
  });

  it('reports a friendly error when the API throws or returns errors', async () => {
    const throwing: AdminFetch = async () => { throw new Error('boom'); };
    await expect(subscribe('sally@example.com', throwing)).resolves.toMatchObject({ok: false});
    const {fetch} = fakeAdmin([{errors: [{message: 'unauthorized'}]}]);
    await expect(subscribe('sally@example.com', fetch)).resolves.toMatchObject({ok: false});
  });
});
