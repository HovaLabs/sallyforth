import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {excerptFromHtml} from '~/components/blog/format';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {getVariantUrl} from '~/lib/variants';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) => {
  const product = args.data?.product;
  const variant = product?.selectedOrFirstAvailableVariant;
  const image = variant?.image ?? product?.featuredImage;
  const meta = pageMeta(args, {
    title: product?.seo?.title || product?.title || 'Product',
    description: product?.seo?.description || excerptFromHtml(product?.descriptionHtml) ||
      product?.description || `Find ${product?.title || 'this item'} in the SallyForth shop.`,
    card: 'shop',
    type: 'product',
    image: image ?? undefined,
    breadcrumbs: [{name: 'Shop', path: '/collections/all'}],
    entity: product && ((url, origin) => ({
      '@type': 'Product',
      '@id': `${url}#product`,
      name: product.title,
      url,
      description: product.description || product.seo?.description || undefined,
      image: image?.url,
      mainEntityOfPage: {'@id': `${url}#webpage`},
      offers: variant ? {
        '@type': 'Offer',
        sku: variant.sku || undefined,
        url: new URL(getVariantUrl({
          handle: product.handle,
          pathname: args.location.pathname,
          searchParams: new URLSearchParams(),
          selectedOptions: product.options.some((option) => option.optionValues.length > 1)
            ? variant.selectedOptions : undefined,
        }), origin).href,
        price: variant.price.amount,
        priceCurrency: variant.price.currencyCode,
        availability: variant.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {'@id': `${origin}/#organization`},
      } : undefined,
    })),
  });
  if (variant && !args.error) {
    meta.push(
      {property: 'product:price:amount', content: variant.price.amount},
      {property: 'product:price:currency', content: variant.price.currencyCode},
    );
  }
  return meta;
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, vendor, descriptionHtml} = product;

  return (
    <article className="product-page" aria-labelledby="product-title">
      <div className="product sf-wrap">
        <Link className="product-back" to="/collections/all">
          <span aria-hidden="true">←</span> Back to shop
        </Link>
        <div className="product-spread">
          <ProductImage image={selectedVariant?.image ?? product.featuredImage} title={title} />
          <div className="product-main">
            <header className="product-header">
              {vendor && <p className="sf-eyebrow">{vendor}</p>}
              <h1 className="product-title" id="product-title">{title}</h1>
            </header>
            <ProductForm productOptions={productOptions} selectedVariant={selectedVariant} />
            {descriptionHtml && (
              <section className="product-description" aria-labelledby="product-details">
                <h2 id="product-details">Details</h2>
                <div className="product-prose" dangerouslySetInnerHTML={{__html: descriptionHtml}} />
              </section>
            )}
          </div>
        </div>
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </article>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    featuredImage {
      __typename
      id
      url
      altText
      width
      height
    }
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
