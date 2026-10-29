import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const axe = (page: import('@playwright/test').Page) =>
  new AxeBuilder({ page })
    .include('[aria-label="Component preview"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();

test('avatars, icons, keys and alert tones pass axe in both modes', async ({ page }, testInfo) => {
  for (const dark of [false, true]) {
    for (const component of ['avatar', 'icons', 'keyboard-keys-hidden-text', 'alert-status']) {
      await page.goto(`/?page=components&component=${component}`);
      if (dark) {
        const panel = page.getByRole('dialog', { name: 'Live theme editor' });
        await page.getByRole('button', { name: 'Edit theme', exact: true }).click();
        await panel.getByRole('switch', { name: 'Dark mode', exact: true }).setChecked(true);
        await panel.getByRole('button', { name: 'Collapse theme editor' }).click();
      }
      const preview = page.getByLabel('Component preview');
      if (component === 'avatar') {
        await expect(preview.getByRole('img', { name: 'Sam Taylor, away' })).toBeVisible();
        await expect(preview.getByRole('img', { name: '3 more people' })).toHaveText('+3');
      }
      if (component === 'alert-status')
        await expect(preview.locator('.g-alert > .g-icon')).toHaveCount(4);
      expect((await axe(page)).violations).toEqual([]);
      if (testInfo.project.name === 'chromium')
        await preview.screenshot({
          path: `test-results/${component}-${dark ? 'dark' : 'light'}.png`,
        });
    }
  }
});
