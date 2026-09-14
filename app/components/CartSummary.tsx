import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
};

/** Sticky cream totals tile: subtotal, discount + gift-card forms, checkout CTA. */
export function CartSummary({cart}: CartSummaryProps) {
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();

  // Deliberately a <div>, not <aside>: the skeleton styles the bare `aside` element as the fixed drawer.
  return (
    <div aria-labelledby={summaryId} className="sf-cart-summary">
      <span id={summaryId} className="sf-eyebrow">
        Totals
      </span>
      <dl role="group" className="sf-cart-summary__row">
        <dt>Subtotal</dt>
        <dd>{cart?.cost?.subtotalAmount?.amount ? <Money data={cart.cost.subtotalAmount} /> : '—'}</dd>
      </dl>
      <CartDiscounts discountCodes={cart?.discountCodes} discountsHeadingId={discountsHeadingId} discountCodeInputId={discountCodeInputId} />
      <CartGiftCard giftCardCodes={cart?.appliedGiftCards} giftCardHeadingId={giftCardHeadingId} giftCardInputId={giftCardInputId} />
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <a href={checkoutUrl} target="_self" className="sf-cart-summary__checkout">
      CONTINUE TO CHECKOUT &rarr;
    </a>
  );
}

function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  discountsHeadingId: string;
  discountCodeInputId: string;
}) {
  const codes: string[] = discountCodes?.filter((discount) => discount.applicable)?.map(({code}) => code) || [];

  return (
    <section aria-label="Discounts">
      <p className="sf-cart-summary__label" id={discountsHeadingId}>
        Discount code
      </p>

      {/* Applied codes as chips; each × resubmits the list without that code. */}
      {codes.length ? (
        <ul className="sf-cart-summary__chips" aria-labelledby={discountsHeadingId}>
          {codes.map((code) => (
            <li key={code}>
              <UpdateDiscountForm discountCodes={codes.filter((c) => c !== code)}>
                <span className="sf-cart-summary__chip">
                  <code>{code}</code>
                  <button type="submit" aria-label={`Remove discount ${code}`}>
                    &times;
                  </button>
                </span>
              </UpdateDiscountForm>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="sf-cart-summary__form">
          <label htmlFor={discountCodeInputId} className="sr-only">
            Discount code
          </label>
          <input id={discountCodeInputId} type="text" name="discountCode" placeholder="Discount code" className="sf-cart-summary__input" />
          <button type="submit" aria-label="Apply discount code" className="sf-cart-summary__apply">
            APPLY
          </button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

function UpdateDiscountForm({discountCodes, children}: {discountCodes?: string[]; children: React.ReactNode}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
  giftCardHeadingId,
  giftCardInputId,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
  giftCardHeadingId: string;
  giftCardInputId: string;
}) {
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const removeButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousCardIdsRef = useRef<string[]>([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current !== null) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(removedCardIndex, giftCardCodes.length - 1);
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard ? removeButtonRefs.current.get(focusTargetCard.id) : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId: string) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
    }
  };

  return (
    <section aria-label="Gift cards">
      <p className="sf-cart-summary__label" id={giftCardHeadingId}>
        Gift card
      </p>

      {giftCardCodes && giftCardCodes.length > 0 && (
        <ul className="sf-cart-summary__chips" aria-labelledby={giftCardHeadingId}>
          {giftCardCodes.map((giftCard) => (
            <li key={giftCard.id}>
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                buttonRef={(el: HTMLButtonElement | null) => {
                  if (el) {
                    removeButtonRefs.current.set(giftCard.id, el);
                  } else {
                    removeButtonRefs.current.delete(giftCard.id);
                  }
                }}
              >
                <code>***{giftCard.lastCharacters}</code>
                <Money data={giftCard.amountUsed} as="span" />
              </RemoveGiftCardForm>
            </li>
          ))}
        </ul>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div className="sf-cart-summary__form">
          <label htmlFor={giftCardInputId} className="sr-only">
            Gift card code
          </label>
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
            className="sf-cart-summary__input"
          />
          <button
            type="submit"
            disabled={giftCardAddFetcher.state !== 'idle'}
            aria-label="Apply gift card code"
            className="sf-cart-summary__apply"
          >
            APPLY
          </button>
        </div>
      </AddGiftCardForm>
    </section>
  );
}

function AddGiftCardForm({fetcherKey, children}: {fetcherKey?: string; children: React.ReactNode}) {
  return (
    <CartForm fetcherKey={fetcherKey} route="/cart" action={CartForm.ACTIONS.GiftCardCodesAdd}>
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
}: {
  giftCardId: string;
  lastCharacters: string;
  children: React.ReactNode;
  onRemoveClick?: () => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      <span className="sf-cart-summary__chip">
        {children}
        <button type="submit" aria-label={`Remove gift card ending in ${lastCharacters}`} onClick={onRemoveClick} ref={buttonRef}>
          &times;
        </button>
      </span>
    </CartForm>
  );
}
