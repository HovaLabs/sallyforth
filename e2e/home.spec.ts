import {expect, test, type Page} from '@playwright/test';

function wreathRadii(page: Page) {
  return page.locator('.sf-hero__wreath').evaluate((wreath) => {
    const ring = wreath.getBoundingClientRect();
    const centerX = ring.x + ring.width / 2;
    const centerY = ring.y + ring.height / 2;
    return Array.from(wreath.querySelectorAll('img'), (image) => {
      const box = image.getBoundingClientRect();
      return Math.round(Math.hypot(box.x + box.width / 2 - centerX, box.y + box.height / 2 - centerY));
    });
  });
}

test.describe('home', () => {
  test('renders hero, marquee, teaser, carousel, footer inside the frame', async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('.sf-frame')).toBeVisible();
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.getByRole('heading', {name: 'SallyForth', level: 1})).toBeVisible();
    const vegetables = page.locator('.sf-hero__wreath img');
    await expect(vegetables.first()).toBeVisible();
    await expect.poll(() => vegetables.evaluateAll((images) =>
      images.every((img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0),
    )).toBe(true);
    await expect(page.locator('#store')).toBeVisible();
    await expect(page.locator('.sf-footgrid')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('marquee is seamless: rendered sequence is at least viewport width', async ({page}) => {
    await page.goto('/');
    await page.waitForFunction(() => document.querySelectorAll('.sf-marquee__unit').length >= 4);
    const {trackWidth, viewport, units} = await page.evaluate(() => ({
      trackWidth: document.querySelector('.sf-marquee__track')!.getBoundingClientRect().width,
      viewport: window.innerWidth,
      units: document.querySelectorAll('.sf-marquee__unit').length,
    }));
    expect(units % 2).toBe(0);
    expect(trackWidth / 2).toBeGreaterThanOrEqual(viewport);
  });

  test('has no horizontal overflow and the footer stacks correctly', async ({page}, testInfo) => {
    await page.goto('/');
    await page.waitForSelector('.sf-card, .sf-blog__empty');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBe(0);
    const columns = await page.evaluate(() => getComputedStyle(document.querySelector('.sf-footgrid')!).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(testInfo.project.name === 'mobile' ? 1 : 4);
  });

  test('carousel first card aligns with the section title', async ({page}) => {
    await page.goto('/');
    const card = page.locator('#carousel .sf-card').first();
    await expect(card).toBeVisible();
    const cardLeft = (await card.boundingBox())!.x;
    const titleLeft = (await page.locator('#store .sf-section-title').boundingBox())!.x;
    expect(Math.abs(cardLeft - titleLeft)).toBeLessThanOrEqual(2);
    expect(await page.locator('#carousel').evaluate((el) => el.scrollLeft)).toBe(0);
  });

  test('the vegetables spread away from the title on scroll and return at the top', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.goto('/');
    const initial = await wreathRadii(page);
    const vegetable = page.locator('.sf-hero__wreath img').first();
    const width = () => vegetable.evaluate((image) => image.getBoundingClientRect().width);
    const initialWidth = await width();

    await page.evaluate(() => window.scrollTo(0, 100));
    await expect.poll(async () => (await wreathRadii(page)).every((r, i) => r > initial[i])).toBe(true);
    const midway = await wreathRadii(page);

    await page.evaluate(() => window.scrollTo(0, 250));
    await expect.poll(async () => (await wreathRadii(page)).every((r, i) => r > midway[i])).toBe(true);
    expect(await width()).toBeCloseTo(initialWidth, 1);
    const expanded = await wreathRadii(page);

    await page.emulateMedia({reducedMotion: 'reduce'});
    await expect.poll(() => wreathRadii(page)).toEqual(initial);
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await expect.poll(() => wreathRadii(page)).toEqual(expanded);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => wreathRadii(page)).toEqual(initial);
  });

  test('reduced motion holds the wreath still while the homepage navigation bar responds to scrolling', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto('/');
    const nav = page.locator('.sf-nav');
    const transparent = 'rgba(0, 0, 0, 0)';
    const initial = await wreathRadii(page);
    await expect(nav).toHaveCSS('background-color', transparent);

    await page.evaluate(() => window.scrollTo(0, 200));
    await expect(nav).not.toHaveCSS('background-color', transparent);
    expect(await wreathRadii(page)).toEqual(initial);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(nav).toHaveCSS('background-color', transparent);
  });

  test('mobile: burger opens the menu with the nav links', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile only');
    await page.goto('/');
    await expect(page.locator('.sf-nav__links')).toBeHidden();
    await page.getByRole('button', {name: 'Menu'}).click();
    const dialog = page.getByRole('dialog', {name: 'Menu'});
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('link', {name: 'Bits and Bobs Almanac'})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
