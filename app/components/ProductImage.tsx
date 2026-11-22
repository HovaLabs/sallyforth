import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  image,
  title,
}: {
  image: ProductVariantFragment['image'];
  title: string;
}) {
  if (!image) {
    return null;
  }
  return (
    <div className="product-image">
      <Image
        alt={image.altText || title}
        data={image}
        key={image.id}
        loading="eager"
        sizes="(min-width: 1350px) 585px, (min-width: 761px) 45vw, (min-width: 480px) 420px, 90vw"
      />
    </div>
  );
}
