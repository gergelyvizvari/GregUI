import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openCatalog(page: Page, search: string) {
  if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
    await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'Components', exact: true }).first().click();
  await page.getByLabel('Find a component').fill(search);
}
const presets = [
  'paper',
  'flat',
  'glass',
  'soft',
  'elevated',
  'outline',
  'editorial',
  'porcelain',
  'aurora',
  'studio',
  'canvas',
  'joyful',
  'professional',
  'clay',
  'neumorphic',
  'cream',
];

test('typography and native reading content reflow across all presets, modes and enlarged text', async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  await page.goto('/');
  await openCatalog(page, 'Typography & content');
  const reader = page.getByRole('region', { name: 'Reading example' });
  const panel = page.getByRole('dialog', { name: 'Live theme editor' });
  const preview = page.getByRole('region', { name: 'Component preview' });
  await expect(
    preview.getByRole('heading', { name: 'Card-sized heading', level: 6 }),
  ).toBeVisible();
  for (const preset of presets)
    for (const dark of [false, true]) {
      await page.getByRole('button', { name: 'Edit theme', exact: true }).click();
      await panel.getByLabel('Style', { exact: true }).selectOption(preset);
      await panel.getByRole('switch', { name: 'Dark mode', exact: true }).setChecked(dark);
      await panel.getByRole('button', { name: 'Collapse theme editor' }).click();
      expect(
        await preview.evaluate((el) => el.closest('.g-theme')?.getAttribute('data-preset')),
      ).toBe(preset);
      expect(
        await preview.evaluate((el) => el.closest('.g-theme')?.getAttribute('data-mode')),
      ).toBe(dark ? 'dark' : 'light');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (['paper', 'flat', 'soft', 'glass', 'editorial'].includes(preset)) {
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
              .analyze()
          ).violations,
          `${preset} ${dark}`,
        ).toEqual([]);
      }
      if (testInfo.project.name === 'chromium' && preset === 'soft' && !dark)
        await reader.screenshot({ path: 'test-results/typography-soft-light.png' });
    }
  await page.getByRole('button', { name: 'Edit theme', exact: true }).click();
  await panel.getByLabel('Typography', { exact: true }).selectOption('mono');
  await panel.getByRole('button', { name: 'Collapse theme editor' }).click();
  expect(await reader.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('monospace');
  await reader.getByRole('link', { name: 'Jump to the details' }).click();
  await expect(page).toHaveURL(/#reading-details$/);
  await expect(
    reader.getByRole('heading', { name: 'Details that stay readable' }),
  ).toBeInViewport();
  // Model a consumer's native RTL content and the user's enlarged root-text setting.
  await reader.evaluate((el) => {
    el.setAttribute('dir', 'rtl');
    document.documentElement.style.fontSize = '200%';
  });
  expect(await reader.evaluate((el) => getComputedStyle(el).direction)).toBe('rtl');
  expect(
    await reader.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(32);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await reader.getByRole('region', { name: 'Example code' }).focus();
  await expect(reader.getByRole('region', { name: 'Example code' })).toBeFocused();
  if (testInfo.project.name === 'mobile')
    await reader.screenshot({ path: 'test-results/typography-enlarged-rtl-mobile.png' });
});

test('page foundations preserve page semantics, metadata and responsive actions', async ({
  page,
}, testInfo) => {
  for (const dark of [false, true]) {
    await page.goto('/');
    await page.getByRole('switch', { name: 'Dark mode', exact: true }).setChecked(dark);
    await openCatalog(page, 'Page foundations');
    const preview = page.getByRole('region', { name: 'Component preview' });
    await expect(
      preview.getByRole('heading', { name: 'A reusable page foundation', level: 1 }),
    ).toBeVisible();
    await expect(
      preview.getByRole('region', { name: 'A nested section' }).getByRole('heading', { level: 3 }),
    ).toBeVisible();
    await expect(preview.locator('time')).toHaveAttribute('datetime', '2026-10-28');
    await expect(
      preview.getByRole('navigation', { name: 'Example page breadcrumb' }),
    ).toBeVisible();
    await preview.getByRole('button', { name: 'Preview action', exact: true }).click();
    await expect(preview.getByRole('status')).toHaveText('Preview action completed locally.');
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (['chromium', 'mobile'].includes(testInfo.project.name))
      await preview.screenshot({
        path: `test-results/page-foundations-${testInfo.project.name}-${dark ? 'dark' : 'light'}.png`,
      });
  }
});
