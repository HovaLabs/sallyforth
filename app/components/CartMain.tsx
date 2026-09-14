import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {ART} from '~/config/shop';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};
/** Returns a map of all line items and their children. */
function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}

/**
 * The cart page body: line items on the left, a sticky totals tile on the
 * right (stacked on small screens), or the branded empty state.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);
  const lines = cart?.lines?.nodes ?? [];
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(lines);

  if (!lines.length) return <CartEmpty />;

  return (
    <section className="sf-cart__layout" aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}>
      <div>
        <p id="cart-lines" className="sr-only">
          Line items
        </p>
        <ul aria-labelledby="cart-lines" className="sf-cart__lines">
          {lines.map((line) => {
            // we do not render non-parent lines at the root of the cart
            if ('parentRelationship' in line && line.parentRelationship?.parent) {
              return null;
            }
            return <CartLineItem key={line.id} line={line} childrenMap={childrenMap} />;
          })}
        </ul>
      </div>
      {cartHasItems ? <CartSummary cart={cart} /> : null}
    </section>
  );
}

function CartEmpty() {
  return (
    <div className="sf-cart-empty">
      <img src={ART.peapod} alt="" />
      <h2 className="sf-cart-empty__title">Your basket is empty</h2>
      <p>Nothing picked yet — the rows are full.</p>
      <Link to="/collections/all" prefetch="viewport" className="sf-cart-empty__cta">
        WANDER THE ROWS
      </Link>
    </div>
  );
}
