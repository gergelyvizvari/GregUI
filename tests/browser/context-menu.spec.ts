import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const axe = (page: import('@playwright/test').Page, selector: string) =>
  new AxeBuilder({ page })
    .include(selector)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();

test('context menu opens on right click, keeps toggles open and passes axe in both modes', async ({
  page,
}, testInfo) => {
  for (const dark of [false, true]) {
    await page.goto('/?page=components&component=context-menu');
    if (dark) {
      const panel = page.getByRole('dialog', { name: 'Live theme editor' });
      await page.getByRole('button', { name: 'Edit theme', exact: true }).click();
      await panel.getByRole('switch', { name: 'Dark mode', exact: true }).setChecked(true);
      await panel.getByRole('button', { name: 'Collapse theme editor' }).click();
    }
    await page.getByText('Quarterly report.pdf').click({ button: 'right' });
    const menu = page.getByRole('menu', { name: 'Report actions' });
    await expect(menu).toBeVisible();
    // Let the opening animation and any theme transition settle before measuring contrast.
    await page.evaluate(() =>
      Promise.all(document.getAnimations().map((animation) => animation.finished)),
    );
    expect((await axe(page, '[role="menu"]')).violations).toEqual([]);
    expect((await axe(page, '[aria-label="Component preview"]')).violations).toEqual([]);
    await menu.getByRole('menuitemcheckbox', { name: 'Starred' }).click();
    await expect(menu.getByRole('menuitemcheckbox', { name: 'Starred' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await menu.getByRole('menuitemradio', { name: 'Grid' }).click();
    await expect(menu).toBeVisible();
    if (['chromium', 'mobile'].includes(testInfo.project.name))
      await page.screenshot({
        path: `test-results/context-menu-${testInfo.project.name}-${dark ? 'dark' : 'light'}.png`,
      });
    await menu.getByRole('menuitem', { name: /Rename/ }).click();
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(page.getByText('Chose: Rename')).toBeVisible();
    await expect(page.getByText('Starred: yes. View: grid.')).toBeVisible();
  }
});

test('context menu opens from Shift+F10 with arrow keys, submenus and focus return', async ({
  page,
}) => {
  await page.goto('/?page=components&component=context-menu');
  const card = page.locator('[aria-label="Component preview"] [tabindex="0"]', {
    hasText: 'Quarterly report.pdf',
  });
  await card.focus();
  await page.keyboard.press('Shift+F10');
  const menu = page.getByRole('menu', { name: 'Report actions' });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: /Open/ })).toBeFocused();
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((animation) => animation.finished)),
  );
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: /Rename/ })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: /Share/ })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('menuitem', { name: 'Copy link' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.getByText('Chose: Copy link')).toBeVisible();
  await expect(card).toBeFocused();
  await page.keyboard.press('Shift+F10');
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(card).toBeFocused();
});
