import {expect, test} from '@playwright/test';

test.describe('about', () => {
  test('renders the garden letter within the shared site frame', async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/about');
    await expect(page.locator('.sf-frame')).toBeVisible();
    await expect(page.getByRole('heading', {level: 1, name: 'From my little patch'})).toBeVisible();
    const letter = page.getByRole('article', {name: 'From my little patch'});
    await expect(letter).toContainText('It started in my little patch of the family garden.');
    await expect(letter).toContainText('made a perfect way for my Daddy’s life lessons.');
    await expect(letter).toContainText('SallyForth begins');
    await expect(page.locator('.sf-footgrid')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBe(0);
    expect(errors).toEqual([]);
  });
});
