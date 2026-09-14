import {expect, test} from '@playwright/test';

test.describe('about', () => {
  test('renders hero, story, and shared chrome inside the frame', async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/about');
    await expect(page.locator('.sf-frame')).toBeVisible();
    await expect(page.getByRole('heading', {level: 1, name: 'Welcome to SallyForth'})).toBeVisible();
    await expect(page.locator('.sf-about-story')).toBeVisible();
    await expect(page.locator('.sf-footgrid')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBe(0);
    expect(errors).toEqual([]);
  });

  test('story CTAs link to the store and the blog', async ({page}) => {
    await page.goto('/about');
    const story = page.locator('.sf-about-story');
    await expect(story.getByRole('link', {name: 'WANDER THE ROWS'})).toHaveAttribute('href', '/collections/all');
    await expect(story.getByRole('link', {name: 'or start with the blog'})).toHaveAttribute('href', '/blog');
  });

  test('hero art parallax responds to scroll', async ({page}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'desktop only');
    await page.goto('/about');
    const beet = page.locator('.sf-about-hero__art--beet');
    const at = async (y: number) => {
      await page.evaluate((y) => { window.scrollTo(0, y); window.dispatchEvent(new Event('scroll')); }, y);
      await page.waitForTimeout(50);
      return beet.evaluate((el) => (el as HTMLElement).style.transform);
    };
    const t0 = await at(0);
    const t300 = await at(300);
    expect(t0).toBe('translate(0px, 0px) rotate(10deg)');
    expect(t300).not.toBe(t0);
  });
});
