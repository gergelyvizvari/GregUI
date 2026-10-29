import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('floating theme editor updates live previews and shares drafts, history and transfers with Theme studio', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const compact = testInfo.project.name === 'mobile';
  await page.goto('/');
  if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
    await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'Components', exact: true }).first().click();
  await page.getByLabel('Find a component').fill('Text field');
  await page.getByLabel('Email address', { exact: true }).fill('kept@example.com');
  const launcher = page.getByRole('button', { name: 'Edit theme', exact: true });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(launcher).toBeInViewport();
  await launcher.click();
  const panel = page.getByRole('dialog', { name: 'Live theme editor', exact: true });
  if (compact) await expect(panel).toHaveAttribute('aria-modal', 'true');
  else await expect(panel).not.toHaveAttribute('aria-modal', 'true');
  await expect(panel.getByLabel('Style', { exact: true }).locator('option')).toHaveCount(15);
  await expect(panel.getByLabel('Palette', { exact: true }).locator('option')).toHaveCount(16);
  await expect(panel.locator('input[type=color]')).toHaveCount(11);
  await panel.getByLabel('Style', { exact: true }).selectOption('professional');
  await panel.getByLabel('Palette', { exact: true }).selectOption('cobalt');
  await panel.getByRole('switch', { name: 'Dark mode', exact: true }).check();
  await panel.getByLabel('Density', { exact: true }).selectOption('compact');
  await panel.getByLabel('Corners', { exact: true }).selectOption('square');
  await panel.getByLabel('Typography', { exact: true }).selectOption('mono');
  await panel.getByRole('switch', { name: 'Reduce motion', exact: true }).check();
  const preview = page.locator('.g-preview-stage');
  expect(await preview.evaluate((el) => el.closest('.g-theme')?.getAttribute('data-preset'))).toBe(
    'professional',
  );
  expect(await preview.evaluate((el) => el.closest('.g-theme')?.getAttribute('data-mode'))).toBe(
    'dark',
  );
  expect(await preview.evaluate((el) => el.closest('.g-theme')?.getAttribute('data-density'))).toBe(
    'compact',
  );
  expect(await preview.evaluate((el) => el.closest('.g-theme')?.getAttribute('data-motion'))).toBe(
    'reduced',
  );
  expect(await panel.evaluate((el) => el.closest('.g-theme')?.getAttribute('data-mode'))).toBe(
    'light',
  );
  if (!compact) {
    await page.getByLabel('Email address', { exact: true }).fill('edited-beside-panel@example.com');
    await expect(panel).toBeVisible();
  } else {
    await panel.getByRole('button', { name: 'Export theme', exact: true }).focus();
    await page.keyboard.press('Tab');
    expect(await panel.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  const surface = await panel.getByLabel('Surface color', { exact: true }).inputValue();
  // Exercise the native color input's change handler without automating an OS color-picker dialog.
  await panel.getByLabel('Text color', { exact: true }).evaluate((element, color) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, color);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, surface);
  await expect(panel.getByRole('button', { name: 'Export theme', exact: true })).toBeDisabled();
  await expect(
    panel.getByRole('button', { name: 'Export CSS tokens', exact: true }),
  ).toBeDisabled();
  await panel.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Export theme', exact: true })).toBeEnabled();
  await panel.getByLabel('Theme name', { exact: true }).fill('Catalog edit');
  await panel.getByRole('button', { name: 'Save draft', exact: true }).click();
  await panel.getByLabel('Theme name', { exact: true }).fill('Temporary');
  await panel.getByRole('button', { name: 'Restore draft', exact: true }).click();
  await expect(panel.getByLabel('Theme name', { exact: true })).toHaveValue('Catalog edit');
  const downloadEvent = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Export theme', exact: true }).click();
  const download = await downloadEvent;
  const exported = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(exported).toMatchObject({
    name: 'Catalog edit',
    preset: 'professional',
    mode: 'dark',
    density: 'compact',
    radius: 'square',
    font: 'mono',
    motion: 'reduced',
  });
  const guideEvent = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Export DESIGN.md', exact: true }).click();
  const guide = await guideEvent;
  expect(guide.suggestedFilename()).toBe('DESIGN.md');
  const markdown = await readFile((await guide.path())!, 'utf8');
  expect(markdown).toContain('# Workspace');
  expect(markdown).toContain('"name": "Catalog edit"');
  await panel.getByRole('button', { name: 'Import JSON', exact: true }).click();
  const importer = page.getByRole('dialog', { name: 'Import a theme', exact: true });
  await importer.getByLabel('Theme JSON').fill('{"version":2}');
  await importer.getByRole('button', { name: 'Apply theme' }).click();
  await expect(importer.getByText('Unsupported theme version. Expected version 1.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(importer).toHaveCount(0);
  await expect(panel.getByRole('button', { name: 'Import JSON', exact: true })).toBeFocused();
  await panel.getByRole('button', { name: 'Import JSON', exact: true }).click();
  await importer
    .getByLabel('Theme JSON')
    .fill(JSON.stringify({ ...exported, name: 'Imported live' }));
  await importer.getByRole('button', { name: 'Apply theme' }).click();
  await expect(importer).toHaveCount(0);
  await expect(panel.getByLabel('Theme name', { exact: true })).toHaveValue('Imported live');
  await panel.getByLabel('Style', { exact: true }).scrollIntoViewIfNeeded();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (['chromium', 'mobile'].includes(testInfo.project.name))
    await page.screenshot({ path: `test-results/theme-panel-${testInfo.project.name}.png` });
  await panel.getByRole('button', { name: 'Collapse theme editor', exact: true }).click();
  await expect(panel).toHaveCount(0);
  await expect(launcher).toBeFocused();
  await expect(page.getByLabel('Email address', { exact: true })).toHaveValue(
    compact ? 'kept@example.com' : 'edited-beside-panel@example.com',
  );
  await launcher.click();
  await expect(panel.getByLabel('Theme name', { exact: true })).toHaveValue('Imported live');
  await page.setViewportSize({ width: compact ? 1100 : 390, height: 800 });
  if (compact) await expect(panel).not.toHaveAttribute('aria-modal', 'true');
  else await expect(panel).toHaveAttribute('aria-modal', 'true');
  await expect(panel.getByLabel('Theme name', { exact: true })).toHaveValue('Imported live');
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
    await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'Theme studio', exact: true }).first().click();
  await expect(page.getByLabel('Theme name', { exact: true })).toHaveValue('Imported live');
  await expect(page.getByRole('switch', { name: 'Dark mode', exact: true })).toBeChecked();
});
