import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/policies.$handle';
import {excerptFromHtml} from '~/components/blog/format';
import {pageMeta} from '~/lib/seo';

const policyHandles = {
  'privacy-policy': 'privacyPolicy', 'shipping-policy': 'shippingPolicy',
  'terms-of-service': 'termsOfService', 'refund-policy': 'refundPolicy',
  'subscription-policy': 'subscriptionPolicy',
} as const;

export const meta: Route.MetaFunction = (args) => {
  const policy = args.data?.policy;
  return pageMeta(args, {
    title: policy?.title || 'Store policy',
    description: excerptFromHtml(policy?.body) || `Read the SallyForth ${policy?.title ?? 'store policy'}.`,
    card: 'shop', breadcrumbs: [{name: 'Store policies', path: '/policies'}],
  });
};

export async function loader({params, context}: Route.LoaderArgs) {
  if (!Object.hasOwn(policyHandles, params.handle)) {
    throw new Response('Policy not found', {status: 404});
  }
  const policyName = policyHandles[params.handle as keyof typeof policyHandles];

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      subscriptionPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  return {policy};
}

export default function Policy() {
  const {policy} = useLoaderData<typeof loader>();

  return (
    <div className="policy">
      <br />
      <br />
      <div>
        <Link to="/policies">← Back to Policies</Link>
      </div>
      <br />
      <h1>{policy.title}</h1>
      <div dangerouslySetInnerHTML={{__html: policy.body}} />
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
    $subscriptionPolicy: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
      subscriptionPolicy @include(if: $subscriptionPolicy) {
        id
        handle
        title
        body
      }
    }
  }
` as const;
