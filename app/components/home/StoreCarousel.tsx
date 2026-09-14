import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {HomeFeaturedQuery, HomeProductCardFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {WaveDivider} from '~/components/WaveDivider';
import {featuredProducts} from '~/components/home/featuredProducts';
import {ART} from '~/config/shop';

export function StoreCarousel({featured}: {featured: Promise<HomeFeaturedQuery | null>}) {
  return (
    <section id="store" className="sf-store">
      <img className="sf-art" src={ART.eggplant} alt="" style={{right: -130, top: -20, width: 240, transform: 'rotate(20deg)'}} />
      <WaveDivider variant="store" fill="cream" />
      <div className="sf-section-head pad" style={{margin: '0 0 24px'}}>
        <span className="sf-section-title">The Store</span>
        <Link to="/collections/all" className="sf-italic-link">Browse everything</Link>
      </div>
      <p className="sf-store__intro pad">Hand-painted goods, crated up and shipped with care · scroll →</p>
      <Suspense fallback={<div className="sf-carousel" aria-busy="true" />}>
        <Await resolve={featured}>
          {(data) => {
            const products = featuredProducts(data);
            return (
              <div id="carousel" className="sf-carousel" role="list" aria-label="Featured products">
                {products.length === 0 ? (
                  <p className="sf-blog__empty pad">Nothing on the shelves yet.</p>
                ) : (
                  products.map((p) => <ProductCard key={p.id} product={p} />)
                )}
              </div>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

export function ProductCard({product}: {product: HomeProductCardFragment}) {
  const variants = product.variants.nodes;
  const single = variants.length === 1 ? variants[0] : null;
  const soldOut = !product.availableForSale;
  const url = `/products/${product.handle}`;

  return (
    <article className="sf-card" role="listitem">
      <Link to={url} prefetch="intent">
        {product.featuredImage ? (
          <Image data={product.featuredImage} sizes="210px" className="sf-card__img" alt={product.featuredImage.altText || product.title} />
        ) : null}
        <span className="sf-card__title">{product.title}</span>
      </Link>
      <div className="sf-card__price">
        <Money data={product.priceRange.minVariantPrice} withoutTrailingZeros />
      </div>
      {soldOut ? (
        <button className="sf-card__button" type="button" disabled>SOLD OUT</button>
      ) : single ? (
        <AddToCartButton
          lines={[{merchandiseId: single.id, quantity: 1, selectedVariant: single}]}
          analytics={{products: [{productGid: product.id, variantGid: single.id, name: product.title, price: single.price.amount, quantity: 1}]}}
        >
          ADD TO CART
        </AddToCartButton>
      ) : (
        <Link to={url} className="sf-card__button">ADD TO CART</Link>
      )}
    </article>
  );
}
