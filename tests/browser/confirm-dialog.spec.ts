import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('async confirmation locks pending actions, retains errors for retry and returns focus after success', async ({
  page,
}, testInfo) => {
  for (const dark of [false, true]) {
    await page.goto('/');
    await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
    if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
      await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('button', { name: 'Components', exact: true }).first().click();
    await page.getByLabel('Find a component').fill('Async confirmation');
    const trigger = page.getByRole('button', { name: 'Archive sample project', exact: true });
    await trigger.click();
    const dialog = page.getByRole('alertdialog', { name: 'Archive this project?' });
    const cancel = dialog.getByRole('button', { name: 'Keep project', exact: true });
    await expect(cancel).toBeFocused();
    await cancel.click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.getByText('Archive requests: 0', { exact: true })).toBeVisible();
    await trigger.click();
    const action = dialog.getByRole('button', { name: /Archive project/ });
    await action.click();
    await expect(action).toBeDisabled();
    await expect(cancel).toBeDisabled();
    await expect(dialog.getByRole('status').filter({ hasText: 'Loading' })).toHaveText('Loading');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.mouse.click(3, 3);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('alert')).toContainText('could not archive this project');
    const retry = dialog.getByRole('button', { name: 'Try again: Archive project', exact: true });
    await expect(retry).toBeFocused();
    await expect(cancel).toBeEnabled();
    await expect(dialog.locator('.g-dialog-footer')).toHaveAttribute('aria-busy', 'false');
    expect(await dialog.evaluate((el) => el.closest('.g-theme')?.getAttribute('data-mode'))).toBe(
      dark ? 'dark' : 'light',
    );
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
      await page.screenshot({
        path: `test-results/async-confirmation-${testInfo.project.name}-${dark ? 'dark' : 'light'}.png`,
        fullPage: true,
      });
    await page.keyboard.press('Enter');
    await expect(action).toBeDisabled();
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(
      page.getByRole('status').filter({ hasText: 'Sample project archived locally.' }),
    ).toBeVisible();
    await expect(page.getByText('Archive requests: 2', { exact: true })).toBeVisible();
    await trigger.click();
    await expect(cancel).toBeFocused();
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await page.getByRole('button', { name: 'Reset archive demo' }).click();
    await expect(page.getByText('Archive requests: 0', { exact: true })).toBeVisible();
  }
});
