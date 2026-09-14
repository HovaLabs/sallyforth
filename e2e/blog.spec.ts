import {expect, test} from '@playwright/test';

test.describe('blog', () => {
  for (const path of ['/blog', '/bits-and-bobs-almanac']) {
    test(`${path} renders the branded index inside the frame`, async ({page}) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(path);
      await expect(page.locator('.sf-frame')).toBeVisible();
      await expect(page.locator('.sf-posts')).toBeVisible();
      await expect(page.getByRole('heading', {level: 1})).toBeVisible();
      // Either the featured post or the empty message — never the bare skeleton list.
      await expect(page.locator('.sf-posts__featured, .sf-posts__empty').first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBe(0);
      expect(errors).toEqual([]);
    });
  }

  test('the featured post opens the branded article page', async ({page}) => {
    await page.goto('/blog');
    const cta = page.getByRole('link', {name: /read the post/i});
    test.skip((await cta.count()) === 0, 'no posts published');
    await cta.click();
    await expect(page).toHaveURL(/\/blog\/[^/]+$/);
    await expect(page.locator('.sf-article')).toBeVisible();
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
    await expect(page.locator('.sf-article__body')).toBeVisible();
    await expect(page.getByRole('link', {name: /back to/i})).toHaveAttribute('href', '/blog');
  });
});
