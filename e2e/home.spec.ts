import {expect, test} from '@playwright/test';

test.describe('home', () => {
  test('renders hero, marquee, teaser, carousel, footer inside the frame', async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('.sf-frame')).toBeVisible();
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('.sf-hero__layer')).toHaveCount(12);
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

  test('parallax progress is continuous through 520px', async ({page}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'desktop only');
    await page.goto('/');
    const at = async (y: number) => {
      await page.evaluate((y) => { window.scrollTo(0, y); window.dispatchEvent(new Event('scroll')); }, y);
      await page.waitForTimeout(50);
      return page.locator('.sf-hero__layer').first().evaluate((el) => el.style.transform);
    };
    const t0 = await at(0), t519 = await at(519), t521 = await at(521);
    expect(t0).toBe('translate(0px, 0px) rotate(18deg)');
    expect(t519).not.toBe(t521);
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
