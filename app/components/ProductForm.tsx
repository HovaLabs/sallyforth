import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {ProductPrice} from './ProductPrice';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  return (
    <div className="product-form">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <fieldset className="product-options" key={option.name}>
            <legend>{option.name}</legend>
            <div className="product-options-grid">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const itemClassName = [
                  'product-options-item',
                  selected ? 'is-selected' : '',
                  available ? '' : 'is-unavailable',
                ]
                  .filter(Boolean)
                  .join(' ');

                if (isDifferentProduct) {
                  // SEO
                  // When the variant is a combined listing child product
                  // that leads to a different url, we need to render it
                  // as an anchor tag
                  return (
                    <Link
                      className={itemClassName}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      aria-current={selected ? 'true' : undefined}
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  // SEO
                  // When the variant is an update to the search param,
                  // render it as a button with javascript navigating to
                  // the variant so that SEO bots do not index these as
                  // duplicated links
                  return (
                    <button
                      type="button"
                      className={itemClassName}
                      key={option.name + name}
                      aria-pressed={selected}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          void navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
          </fieldset>
        );
      })}
      <div className="product-purchase">
        <ProductPrice price={selectedVariant?.price} compareAtPrice={selectedVariant?.compareAtPrice} />
        <AddToCartButton
          className="sf-pill sf-pill--red product-cta"
          disabled={!selectedVariant?.availableForSale}
          lines={selectedVariant ? [{merchandiseId: selectedVariant.id, quantity: 1, selectedVariant}] : []}
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <>
      <span className="product-option-label-swatch" aria-hidden="true" style={{backgroundColor: color || 'transparent'}}>
        {image && <img src={image} alt="" />}
      </span>
      {name}
    </>
  );
}
