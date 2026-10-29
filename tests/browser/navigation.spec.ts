import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const axe = (
  page: import('@playwright/test').Page,
  selector = '[aria-label="Component preview"]',
) =>
  new AxeBuilder({ page })
    .include(selector)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();

test('side navigation opens the current branch, toggles groups and passes axe in both modes', async ({
  page,
}, testInfo) => {
  for (const dark of [false, true]) {
    await page.goto('/');
    await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
    if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
      await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('button', { name: 'Components', exact: true }).first().click();
    await page.getByLabel('Find a component').fill('Side Navigation');
    const nav = page.getByRole('navigation', { name: 'Example workspace' });
    await expect(nav.getByRole('link', { name: '2025' })).toHaveAttribute('aria-current', 'page');
    const campaigns = nav.getByRole('button', { name: 'Campaigns' });
    await expect(campaigns).toHaveAttribute('aria-expanded', 'true');
    expect((await axe(page)).violations).toEqual([]);
    await nav.getByRole('link', { name: 'Calendar' }).click();
    await expect(nav.getByRole('link', { name: 'Calendar' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await campaigns.click();
    await expect(campaigns).toHaveAttribute('aria-expanded', 'false');
    await expect(nav.getByRole('link', { name: 'Active 3' })).toBeHidden();
    if (testInfo.project.name === 'chromium')
      await page.screenshot({ path: `test-results/side-nav-${dark ? 'dark' : 'light'}.png` });
  }
});

test('menu supports keyboard navigation, submenus and focus return', async ({ page }, testInfo) => {
  await page.goto('/?page=components&component=menu');
  const trigger = page.getByRole('button', { name: 'Campaign actions' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('menu', { name: 'Campaign actions' });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: /Rename/ })).toBeFocused();
  expect((await axe(page, '[role="menu"]')).violations).toEqual([]);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('menuitem', { name: 'Print-ready PDF' })).toBeFocused();
  if (['chromium', 'mobile'].includes(testInfo.project.name))
    await page.screenshot({ path: `test-results/menu-${testInfo.project.name}.png` });
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.getByText('Chose: Export PDF')).toBeVisible();
});

test('breadcrumbs reveal hidden levels', async ({ page }) => {
  await page.goto('/?page=components&component=breadcrumbs');
  const preview = page.getByRole('region', { name: 'Component preview' });
  const trail = preview.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(trail.getByRole('link')).toHaveCount(2);
  await trail.getByRole('button', { name: 'Show full path' }).click();
  await expect(trail.getByRole('link')).toHaveCount(4);
  await expect(trail.getByRole('link', { name: 'Clients' })).toBeFocused();
  expect((await axe(page)).violations).toEqual([]);
});

test('the app sidebar collapses to a labelled icon rail', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile',
    'The rail is a desktop layout; mobile uses the drawer.',
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  const sidebar = page.locator('aside');
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
  expect((await sidebar.boundingBox())!.width).toBeLessThan(100);
  const nav = page.getByRole('navigation', { name: 'Navigation' }).first();
  await nav.getByRole('button', { name: 'Theme studio' }).hover();
  await expect(page.getByRole('tooltip', { name: 'Theme studio' })).toBeVisible();
  expect((await axe(page, 'aside')).violations).toEqual([]);
  if (testInfo.project.name === 'chromium')
    await page.screenshot({ path: 'test-results/sidebar-rail.png' });
  await page.getByRole('button', { name: 'Expand sidebar' }).click();
  await expect(sidebar).not.toHaveAttribute('data-collapsed');
});
