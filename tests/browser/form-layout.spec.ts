import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('document editor preserves inputs and fits light and dark viewports', async ({ page }) => {
  for (const dark of [false, true]) {
    await page.goto('/');
    await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
    if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
      await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('button', { name: 'Patterns', exact: true }).first().click();
    await page.getByRole('tab', { name: 'Document editor', exact: true }).click();
    const editor = page.getByRole('tabpanel', { name: 'Document editor' });
    await expect(editor).toHaveCSS('opacity', '1');
    await editor.getByLabel('Title', { exact: true }).fill('Saved in the application');
    expect(
      (await new AxeBuilder({ page }).include('.g-editor-layout').analyze()).violations,
    ).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await editor.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(editor.getByLabel('Title', { exact: true })).toHaveValue(
      'Saved in the application',
    );
  }
});
