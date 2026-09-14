import {expect, test} from '@playwright/test';

test('an empty basket shows the branded empty state with a link to the shop', async ({page}) => {
  await page.goto('/cart');
  await expect(page.locator('.sf-cart-empty')).toBeVisible();
  await expect(page.getByRole('link', {name: /wander the rows/i})).toHaveAttribute('href', '/collections/all');
});

test('add a product (no drawer), then open the cart page with the line, totals and checkout link', async ({page}) => {
  await page.goto('/');
  const card = page.locator('#carousel .sf-card').first();
  await expect(card).toBeVisible();
  const quickAdd = card.locator('button.sf-card__button:not([disabled])');
  if (await quickAdd.count()) {
    await quickAdd.click();
  } else {
    await card.locator('a.sf-card__button').click();
    await page.getByRole('button', {name: /add to cart/i}).click();
  }
  // The cart is a page now, not a popover: nothing opens, but the header count updates.
  await expect(page.getByRole('dialog', {name: 'Your basket'})).toHaveCount(0);
  await expect(page.locator('.sf-nav__count').first()).toHaveText('1', {timeout: 15_000});
  // The cart icon navigates to the /cart page: line item, sticky totals, checkout link.
  await page.locator('a.sf-nav__icon[aria-label^="Cart"]').click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.locator('.cart-line')).toHaveCount(1, {timeout: 15_000});
  await expect(page.locator('.sf-cart-summary')).toBeVisible();
  await expect(page.getByRole('link', {name: /checkout/i})).toHaveAttribute('href', /checkout|mock\.shop/);
});
