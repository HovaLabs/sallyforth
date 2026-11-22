import {expect, test} from '@playwright/test';

test('desktop search fills available space and the shared highlight follows links', async ({page}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop navigation only');
  await page.goto('/about');
  const nav = page.getByRole('navigation', {name: 'Primary'});
  const about = nav.getByRole('link', {name: 'About', exact: true});
  const almanac = nav.getByRole('link', {name: 'Bits and Bobs Almanac'});
  const pill = nav.locator('.sf-nav__highlight');
  await expect(about).toHaveCSS('font-weight', '400');
  await expect(about).toHaveAttribute('data-highlighted', 'true');
  await almanac.hover();
  await expect(almanac).toHaveAttribute('data-highlighted', 'true');
  await expect(about).toHaveAttribute('data-highlighted', 'false');
  await expect.poll(async () => {
    const target = await almanac.boundingBox();
    const highlight = await pill.boundingBox();
    return Math.abs(target!.x - highlight!.x) + Math.abs(target!.width - highlight!.width);
  }).toBeLessThan(2);
  await page.mouse.move(0, 200);
  await expect(about).toHaveAttribute('data-highlighted', 'true');
  await almanac.focus();
  await expect(almanac).toHaveAttribute('data-highlighted', 'true');
  await page.locator('.sf-nav__search-input').focus();
  await expect(about).toHaveAttribute('data-highlighted', 'true');
  for (const width of [1440, 1000, 931]) {
    await page.setViewportSize({width, height: 900});
    const gaps = await page.evaluate(() => {
      const logo = document.querySelector('.sf-nav__logo')!.getBoundingClientRect();
      const search = document.querySelector('.sf-nav__search')!.getBoundingClientRect();
      const right = document.querySelector('.sf-nav__right')!.getBoundingClientRect();
      return [search.left - logo.right, right.left - search.right];
    });
    for (const gap of gaps) expect(gap).toBeCloseTo(16, 0);
  }
  await page.emulateMedia({reducedMotion: 'reduce'});
  await expect(pill).toHaveCSS('transition-duration', '0s');
  await page.setViewportSize({width: 375, height: 812});
  await expect(nav).toBeHidden();
  await expect(page.getByRole('button', {name: 'Menu', exact: true})).toBeVisible();
});
