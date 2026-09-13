export type AdminFetch = (
  query: string,
  variables: Record<string, unknown>,
) => Promise<{data?: any; errors?: unknown}>;

export type SubscribeResult = {ok: true} | {ok: false; error: string};

export const FRIENDLY_ERROR = "Hmm, that didn't take — try again in a moment.";

const CONSENT = {marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN'};

// Admin API documents — deliberately not `#graphql`-tagged so Storefront codegen ignores them.
const CREATE = `
  mutation NewsletterCustomerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

const FIND = `
  query NewsletterFindCustomer($q: String!) {
    customers(first: 1, query: $q) { nodes { id } }
  }
`;

const UPDATE_CONSENT = `
  mutation NewsletterConsentUpdate($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

type UserError = {field?: string[] | null; message: string};

/**
 * Subscribe an email to marketing via the Admin API:
 * create the customer with consent; if the email is taken, look the customer
 * up and update consent instead. Never throws — returns a friendly result.
 */
export async function subscribe(email: string, adminFetch: AdminFetch): Promise<SubscribeResult> {
  try {
    const created = await adminFetch(CREATE, {
      input: {email, tags: ['newsletter'], emailMarketingConsent: CONSENT},
    });
    if (created.errors) return fail('customerCreate errors', created.errors);
    const errs: UserError[] = created.data?.customerCreate?.userErrors ?? [];
    if (errs.length === 0 && created.data?.customerCreate?.customer?.id) return {ok: true};

    const taken = errs.some((e) => /taken/i.test(e.message));
    if (!taken) return fail('customerCreate userErrors', errs);

    const found = await adminFetch(FIND, {q: `email:"${email}"`});
    const id: string | undefined = found.data?.customers?.nodes?.[0]?.id;
    if (!id) return fail('customer lookup found nothing', found);

    const updated = await adminFetch(UPDATE_CONSENT, {
      input: {customerId: id, emailMarketingConsent: CONSENT},
    });
    const updErrs: UserError[] = updated.data?.customerEmailMarketingConsentUpdate?.userErrors ?? [];
    if (updated.errors || updErrs.length) return fail('consent update failed', updated.errors ?? updErrs);
    return {ok: true};
  } catch (err) {
    return fail('admin fetch threw', err);
  }
}

function fail(why: string, detail: unknown): SubscribeResult {
  console.error(`[newsletter] ${why}:`, JSON.stringify(detail));
  return {ok: false, error: FRIENDLY_ERROR};
}
