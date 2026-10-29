import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const axe = (page: import('@playwright/test').Page) =>
  new AxeBuilder({ page })
    .include('[aria-label="Component preview"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();

test('date picker opens a month grid, skips nothing silently and returns the chosen date', async ({
  page,
}, testInfo) => {
  for (const dark of [false, true]) {
    await page.goto('/');
    await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
    if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
      await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('button', { name: 'Components', exact: true }).first().click();
    await page.getByLabel('Find a component').fill('Date Picker');
    const trigger = page.getByRole('button', { name: /^Arrives by/ });
    await expect(trigger).toContainText('Choose a date');
    await trigger.click();
    const grid = page.getByRole('grid', { name: /^Arrives by, / });
    await expect(grid).toBeVisible();
    await expect(grid.locator('button[tabindex="0"]')).toBeFocused();
    expect((await axe(page)).violations).toEqual([]);
    // Too-soon dates are blocked with a reason rather than hidden.
    await expect(grid.locator('[aria-disabled="true"]').first()).toBeVisible();
    await page.keyboard.press('PageDown');
    await expect(page.getByRole('grid', { name: /^Arrives by, / })).toBeVisible();
    const target = page
      .getByRole('grid', { name: /^Arrives by, / })
      .locator('button:not([aria-disabled])')
      .first();
    await target.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('grid')).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).not.toContainText('Choose a date');
    if (testInfo.project.name === 'chromium')
      await page.locator('[aria-label="Component preview"]').screenshot({
        path: `test-results/date-picker-${dark ? 'dark' : 'light'}.png`,
      });
  }
});

test('calendar month shows occasions, explains blocked days and fits narrow screens', async ({
  page,
}, testInfo) => {
  await page.goto('/?page=components&component=calendar-month');
  const grid = page.getByRole('grid', { name: /^Send date, / });
  await expect(grid).toBeVisible();
  const blocked = grid.locator('[aria-disabled="true"]').first();
  await blocked.focus();
  await expect(page.locator('.g-calendar-note')).not.toHaveText(/^\s*$/);
  await page.keyboard.press('ArrowRight');
  await expect(grid.locator('button[tabindex="0"]')).toBeFocused();
  expect((await axe(page)).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('[aria-label="Component preview"]').screenshot({
    path: `test-results/calendar-month-${testInfo.project.name}.png`,
  });
});

test('calendar agenda lists yearly occasions, moves by arrow keys and adds a repeating date', async ({
  page,
}) => {
  await page.goto('/?page=components&component=calendar-agenda');
  const agenda = page.getByRole('region', { name: 'Coming up' });
  await expect(agenda).toBeVisible();
  const entries = agenda.getByRole('button');
  await expect(entries.first()).toContainText('Every year');
  await entries.first().focus();
  await page.keyboard.press('ArrowDown');
  await expect(entries.nth(1)).toBeFocused();
  await page.keyboard.press('End');
  await expect(entries.last()).toBeFocused();
  await expect(agenda.locator('button[tabindex="0"]')).toHaveCount(1);
  expect((await axe(page)).violations).toEqual([]);

  await page.getByLabel('Occasion').fill('Grandad');
  await page.getByRole('button', { name: /^Date/ }).click();
  await expect(
    page.getByRole('grid', { name: /^Date, / }).locator('button[tabindex="0"]'),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Add occasion' }).click();
  const added = agenda.getByRole('button', { name: /^Grandad/ });
  await expect(added).toContainText('Every year');
  await expect(added).toHaveAccessibleDescription(/today/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
