import {expect, test} from '@playwright/test';

test.describe('home', () => {
  test('renders hero, marquee, teaser, carousel, footer inside the frame', async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('.sf-frame')).toBeVisible();
    await expect(page.locator('#hero')).toBeVisible();
    const landscape = page.locator('.sf-hero__landscape');
    await expect(landscape).toBeVisible();
    await expect(landscape).toHaveJSProperty('complete', true);
    expect(await landscape.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
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

  test('both cloud layers drift and respect reduced motion', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.goto('/');
    const near = page.locator('.sf-hero__clouds--near');
    const far = page.locator('.sf-hero__clouds--far');
    for (const layer of [near, far]) {
      await expect(layer).toBeVisible();
      const position = () => layer.evaluate((el) => el.getBoundingClientRect().left);
      const start = await position();
      await expect.poll(position).not.toBe(start);
    }

    await page.emulateMedia({reducedMotion: 'reduce'});
    for (const layer of [near, far]) {
      await expect(layer).toBeVisible();
      await expect(layer).toHaveCSS('animation-name', 'none');
    }
  });

  test('the sunrise grows with scrolling and returns to its initial size at the top', async ({page}) => {
    await page.goto('/');
    const sun = page.locator('.sf-hero__sun-disc');
    const diameter = () => sun.evaluate((el) => el.getBoundingClientRect().width);
    await expect(sun).toBeVisible();
    const initial = await diameter();

    await page.evaluate(() => window.scrollTo(0, 100));
    await expect.poll(diameter).toBeGreaterThan(initial);
    const midway = await diameter();

    await page.evaluate(() => window.scrollTo(0, 250));
    await expect.poll(diameter).toBeGreaterThan(midway);

    const hero = (await page.locator('#hero').boundingBox())!;
    await page.evaluate((height) => window.scrollTo(0, height), hero.height);
    await expect.poll(diameter).toBeCloseTo(initial * 2.1, 1);

    await page.evaluate(() => window.scrollTo(0, 100));
    await expect.poll(diameter).toBeCloseTo(midway, 1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(diameter).toBeCloseTo(initial, 1);
  });

  test('reduced motion holds the sun still while the homepage navigation bar responds to scrolling', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto('/');
    const sun = page.locator('.sf-hero__sun-disc');
    const nav = page.locator('.sf-nav');
    const transparent = 'rgba(0, 0, 0, 0)';
    await expect(sun).toBeVisible();
    const initial = await sun.evaluate((el) => el.getBoundingClientRect().width);
    await expect(nav).toHaveCSS('background-color', transparent);

    await page.evaluate(() => window.scrollTo(0, 200));
    await expect(nav).not.toHaveCSS('background-color', transparent);
    expect(await sun.evaluate((el) => el.getBoundingClientRect().width)).toBeCloseTo(initial, 1);
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
