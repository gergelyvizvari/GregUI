import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('typography has a dedicated destination and the catalog supports categories, focused examples and direct links', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
    await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'Typography & pages', exact: true }).first().click();
  await expect(page).toHaveURL(/page=typography/);
  await expect(
    page.getByRole('heading', { name: 'Typography and page elements', exact: true }),
  ).toBeVisible();
  if (['chromium', 'mobile'].includes(testInfo.project.name))
    await page.screenshot({
      path: `test-results/typography-destination-${testInfo.project.name}.png`,
    });
  await page.getByRole('tab', { name: 'Reading content', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Reading example' })).toBeVisible();
  await page.getByRole('tab', { name: 'Page elements', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'A reusable page foundation', exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Type scale', exact: true }).click();
  await expect(page.getByRole('table', { name: 'Typography roles' })).toBeVisible();
  await page.goto('/?page=components&component=team-members');
  const index = page.getByRole('navigation', { name: 'Component index', exact: true });
  await expect(page.getByRole('heading', { name: 'Team Members', exact: true })).toBeVisible();
  await expect(index.getByRole('button', { name: /^Team Members/ })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(page.getByRole('region', { name: 'Component preview', exact: true })).toHaveCount(1);
  if (['chromium', 'mobile'].includes(testInfo.project.name))
    await page.screenshot({ path: `test-results/catalog-index-${testInfo.project.name}.png` });
  await page.getByLabel('Component category', { exact: true }).selectOption('Forms');
  await page.getByLabel('Find a component').fill('Combobox');
  await expect(page.getByRole('heading', { name: 'Combobox', exact: true })).toBeVisible();
  await index.getByRole('button', { name: /^Remote choices/ }).click();
  await expect(page.getByRole('heading', { name: 'Remote choices', exact: true })).toBeFocused();
  await expect(page).toHaveURL(/component=remote-choices/);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Combobox', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/component=combobox/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Combobox', exact: true })).toBeVisible();
  await page.getByLabel('Find a component').fill('no-such-component-123');
  await expect(page.getByRole('heading', { name: 'No matching components' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await page.getByLabel('Component category', { exact: true }).selectOption('Layout');
  await index.getByRole('button', { name: /^Page foundations/ }).click();
  await expect(page.getByRole('heading', { name: 'Page foundations', exact: true })).toBeFocused();
  await page.getByText('Usage example', { exact: true }).click();
  await expect(page.getByRole('region', { name: 'Page foundations usage' })).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (['chromium', 'mobile'].includes(testInfo.project.name))
    await page.screenshot({ path: `test-results/catalog-navigation-${testInfo.project.name}.png` });
});

test('team invitation and role actions align with their fields across density and mode changes', async ({
  page,
}, testInfo) => {
  await page.goto('/?page=components&component=team-members');
  const row = page
    .locator('.g-notification')
    .filter({ has: page.getByLabel('Role: Alex Morgan', { exact: true }) });
  const panel = page.getByRole('dialog', { name: 'Live theme editor' });
  for (const density of ['comfortable', 'compact'])
    for (const dark of [false, true]) {
      await page.getByRole('button', { name: 'Edit theme', exact: true }).click();
      await panel.getByLabel('Style', { exact: true }).selectOption('glass');
      await panel.getByLabel('Density', { exact: true }).selectOption(density);
      await panel.getByRole('switch', { name: 'Dark mode', exact: true }).setChecked(dark);
      await panel.getByRole('button', { name: 'Collapse theme editor' }).click();
      const field = await row.getByRole('combobox').boundingBox();
      const button = await row
        .getByRole('button', { name: 'Save changes', exact: true })
        .boundingBox();
      expect(field).not.toBeNull();
      expect(button).not.toBeNull();
      if (button!.y < field!.y + field!.height && button!.y + button!.height > field!.y) {
        expect(Math.abs(button!.y + button!.height - field!.y - field!.height)).toBeLessThan(1);
      } else {
        expect(button!.y).toBeGreaterThanOrEqual(field!.y + field!.height);
        expect(Math.abs(button!.x - field!.x)).toBeLessThan(1);
      }
      const invitation = await page
        .getByRole('textbox', { name: /Invitation email/ })
        .boundingBox();
      const inviteButton = await page
        .getByRole('button', { name: 'Send invitation', exact: true })
        .boundingBox();
      if (inviteButton!.y < invitation!.y + invitation!.height)
        expect(
          Math.abs(inviteButton!.y + inviteButton!.height - invitation!.y - invitation!.height),
        ).toBeLessThan(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  await row.getByRole('combobox').selectOption('viewer');
  await expect(row.getByRole('button', { name: 'Save changes', exact: true })).toBeEnabled();
  if (['chromium', 'mobile'].includes(testInfo.project.name))
    await row.screenshot({ path: `test-results/team-alignment-${testInfo.project.name}.png` });
  await row.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(row.getByRole('status')).toHaveText('Saved successfully.');
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test('component index groups categories and keeps its last entry reachable above the viewport bottom', async ({
  page,
}, testInfo) => {
  await page.goto('/?page=components&component=wizard');
  const index = page.getByRole('navigation', { name: 'Component index', exact: true });
  await index.scrollIntoViewIfNeeded();
  await expect(index.getByRole('heading', { name: /Forms/ })).toHaveCount(1);
  await index.getByRole('button', { name: 'Forms', exact: true }).click();
  await expect(
    index
      .getByRole('list', { name: 'Forms', exact: true })
      .getByRole('button', { name: 'Text field', exact: true }),
  ).toHaveCount(1);
  await index.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  const last = index.getByRole('button').last();
  await expect(last).toBeInViewport();
  await expect
    .poll(async () => {
      await index.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      const pane = (await index.boundingBox())!;
      const entry = (await last.boundingBox())!;
      return (
        entry.y >= pane.y &&
        entry.y + entry.height <=
          Math.min(pane.y + pane.height, await page.evaluate(() => innerHeight)) - 2
      );
    })
    .toBe(true);
  const lastName = (await last.innerText()).replace('✓', '').trim();
  await last.click();
  await expect(page.getByRole('heading', { name: lastName, exact: true })).toBeFocused();
  await index.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(last).toBeInViewport();
  await index.evaluate((element) => {
    element.scrollTop = 0;
  });
  await index.screenshot({ path: `test-results/grouped-index-${testInfo.project.name}.png` });
  expect(
    (await new AxeBuilder({ page }).include('.g-list-detail > nav').analyze()).violations,
  ).toEqual([]);
});

test('categories collapse by keyboard and the selected component category stays open', async ({
  page,
}, testInfo) => {
  await page.goto('/?page=components&component=wizard');
  const index = page.getByRole('navigation', { name: 'Component index', exact: true });
  const patterns = index.getByRole('button', { name: 'Patterns', exact: true });
  const forms = index.getByRole('button', { name: 'Forms', exact: true });
  await expect(patterns).toHaveAttribute('aria-expanded', 'true');
  await expect(patterns).toHaveAttribute('aria-disabled', 'true');
  await patterns.focus();
  await page.keyboard.press('Enter');
  await expect(patterns).toHaveAttribute('aria-expanded', 'true');
  await expect(forms).toHaveAttribute('aria-expanded', 'false');
  await forms.focus();
  await page.keyboard.press('Enter');
  await expect(forms).toHaveAttribute('aria-expanded', 'true');
  await expect(index.getByRole('button', { name: 'Text field', exact: true })).toHaveCount(1);
  await expect(forms).toBeFocused();
  await page.keyboard.press('Space');
  await expect(forms).toHaveAttribute('aria-expanded', 'false');
  await expect(index.getByRole('button', { name: 'Text field', exact: true })).toHaveCount(0);
  await page.getByLabel('Find a component').fill('Text field');
  await expect(forms).toHaveAttribute('aria-expanded', 'true');
  await expect(forms).toHaveAttribute('aria-disabled', 'true');
  await expect(index.getByRole('button', { name: 'Text field', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await forms.focus();
  await page.keyboard.press('Enter');
  await expect(forms).toHaveAttribute('aria-expanded', 'true');
  await index.getByRole('button', { name: 'Text field', exact: true }).click();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(index.getByRole('button', { name: 'Forms', exact: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await index.screenshot({
    path: `test-results/collapsible-categories-${testInfo.project.name}.png`,
  });
  expect(
    (await new AxeBuilder({ page }).include('.g-list-detail > nav').analyze()).violations,
  ).toEqual([]);
});

test('category expansion survives refresh, rejects invalid storage and always reveals the selected category', async ({
  page,
}) => {
  await page.goto('/?page=components&component=wizard');
  await page.evaluate(() => localStorage.setItem('gregui.catalog.groups.v1', '{broken'));
  await page.reload();
  const index = page.getByRole('navigation', { name: 'Component index', exact: true });
  const forms = index.getByRole('button', { name: 'Forms', exact: true });
  await expect(forms).toHaveAttribute('aria-expanded', 'false');
  await expect(index.getByRole('button', { name: 'Patterns', exact: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await forms.click();
  await page.reload();
  await expect(forms).toHaveAttribute('aria-expanded', 'true');
  await forms.click();
  await page.reload();
  await expect(forms).toHaveAttribute('aria-expanded', 'false');
  await page.goto('/?page=components&component=text-field');
  await expect(forms).toHaveAttribute('aria-expanded', 'true');
  await expect(forms).toHaveAttribute('aria-disabled', 'true');
  await page.reload();
  await expect(forms).toHaveAttribute('aria-expanded', 'true');
  await page.goto('/?page=components&component=wizard');
  await expect(forms).toHaveAttribute('aria-expanded', 'false');
  await page.evaluate(() =>
    localStorage.setItem(
      'gregui.catalog.groups.v1',
      JSON.stringify({ version: 1, expandedGroups: [42] }),
    ),
  );
  await page.reload();
  await expect(forms).toHaveAttribute('aria-expanded', 'false');
  await forms.click();
  await page.getByLabel('Find a component').fill('Wizard');
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(forms).toHaveAttribute('aria-expanded', 'true');
});

test('category toggling remains usable when browser storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === 'gregui.catalog.groups.v1') throw new Error('Storage blocked');
      return get.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === 'gregui.catalog.groups.v1') throw new Error('Storage blocked');
      return set.call(this, key, value);
    };
  });
  await page.goto('/?page=components&component=wizard');
  const index = page.getByRole('navigation', { name: 'Component index', exact: true });
  const forms = index.getByRole('button', { name: 'Forms', exact: true });
  await forms.click();
  await expect(forms).toHaveAttribute('aria-expanded', 'true');
  await forms.click();
  await expect(forms).toHaveAttribute('aria-expanded', 'false');
  await expect(index.getByRole('button', { name: 'Patterns', exact: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
});
