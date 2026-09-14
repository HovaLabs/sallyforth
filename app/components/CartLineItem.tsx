import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart: image tile, title (links to the product),
 * option chips, price, a pill quantity stepper and a remove link. Child lines
 * (warranties, gift wrapping, …) render nested below the parent.
 */
export function CartLineItem({line, childrenMap}: {line: CartLine; childrenMap: LineItemChildrenMap}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;
  // Single-variant products carry a placeholder "Title: Default Title" option — not worth a chip.
  const options = selectedOptions.filter((option) => option.value !== 'Default Title');

  return (
    <li key={id} className="cart-line sf-cart-line">
      <Link to={lineItemUrl} prefetch="intent" className="sf-cart-line__img" aria-hidden="true" tabIndex={-1}>
        {image ? <Image alt={title} aspectRatio="1/1" data={image} height={120} width={120} loading="lazy" /> : null}
      </Link>
      <div className="sf-cart-line__body">
        <div className="sf-cart-line__top">
          <Link prefetch="intent" to={lineItemUrl} className="sf-cart-line__title">
            {product.title}
          </Link>
          <div className="sf-cart-line__price">
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>
        </div>
        {options.length ? (
          <ul className="sf-cart-line__opts">
            {options.map((option) => (
              <li key={option.name}>
                {option.name}: {option.value}
              </li>
            ))}
          </ul>
        ) : null}
        <CartLineQuantity line={line} />
        {lineItemChildren ? (
          <div>
            <p id={childrenLabelId} className="sr-only">
              Line items with {product.title}
            </p>
            <ul aria-labelledby={childrenLabelId} className="cart-line-children sf-cart-line__children">
              {lineItemChildren.map((childLine) => (
                <CartLineItem childrenMap={childrenMap} key={childLine.id} line={childLine} />
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Pill stepper to update a line's quantity, plus remove. Disabled while the
 * line is optimistic (the server hasn't confirmed it yet).
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="sf-cart-line__controls">
      <div className="sf-cart-qty" role="group" aria-label="Quantity">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            type="submit"
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
          >
            &#8722;
          </button>
        </CartLineUpdateButton>
        <span className="sf-cart-qty__n" aria-live="polite">
          {quantity}
        </span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button type="submit" aria-label="Increase quantity" name="increase-quantity" value={nextQuantity} disabled={!!isOptimistic}>
            &#43;
          </button>
        </CartLineUpdateButton>
      </div>
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({lineIds, disabled}: {lineIds: string[]; disabled: boolean}) {
  return (
    <CartForm fetcherKey={getUpdateKey(lineIds)} route="/cart" action={CartForm.ACTIONS.LinesRemove} inputs={{lineIds}}>
      <button disabled={disabled} type="submit" className="sf-cart-line__remove">
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({children, lines}: {children: React.ReactNode; lines: CartLineUpdateInput[]}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm fetcherKey={getUpdateKey(lineIds)} route="/cart" action={CartForm.ACTIONS.LinesUpdate} inputs={{lines}}>
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
