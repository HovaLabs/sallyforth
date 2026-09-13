import {expect, test} from '@playwright/test';

test('add a product from the carousel (or its PDP) and see it in the drawer with a checkout link', async ({page}) => {
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
  const drawer = page.getByRole('dialog', {name: 'Your basket'});
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('.cart-line')).toHaveCount(1, {timeout: 15_000});
  await expect(drawer.getByRole('link', {name: /checkout/i})).toHaveAttribute('href', /checkout|mock\.shop/);
  await expect(page.locator('.sf-nav__count').first()).toHaveText('1');
});
