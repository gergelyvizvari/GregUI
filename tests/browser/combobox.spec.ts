import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('remote choices support aliases, pending search, retry, stale response cancellation and selection recovery', async ({
  page,
}, testInfo) => {
  for (const dark of [false, true]) {
    await page.goto('/');
    await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
    if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
      await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('button', { name: 'Components', exact: true }).first().click();
    await page.getByLabel('Find a component').fill('Remote choices');
    const input = page.getByRole('combobox', { name: 'Search the country directory' });
    const results = page.getByRole('listbox', { name: 'Search the country directory' });
    await expect(input).toHaveValue('France');
    await input.fill('uk');
    await expect(input).toHaveAttribute('aria-busy', 'true');
    await expect(results.getByRole('option')).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(page.getByText('Selected country: France', { exact: true })).toBeVisible();
    await expect(results.getByRole('option', { name: 'United Kingdom' })).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('United Kingdom');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await input.fill('missing');
    await expect(page.getByRole('status').filter({ hasText: 'No results found.' })).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(input).toHaveValue('United Kingdom');
    await expect(input).toBeFocused();
    await input.fill('error');
    await expect(page.getByRole('alert')).toContainText('could not load countries');
    await expect(results.getByRole('option')).toHaveCount(0);
    await expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-busy', 'true');
    await expect(results.getByRole('option', { name: 'Germany' })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await input.fill('slow');
    await input.fill('berlin');
    await expect(results.getByRole('option', { name: 'Germany' })).toBeVisible();
    // Give the superseded slower response time to arrive if cancellation is broken.
    await page.waitForTimeout(1100);
    await expect(results.getByRole('option')).toHaveCount(1);
    await expect(results.getByRole('option')).toHaveText('Germany');
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
        path: `test-results/remote-choices-${testInfo.project.name}-${dark ? 'dark' : 'light'}.png`,
        fullPage: true,
      });
    await results.getByRole('option', { name: 'Germany' }).click();
    await expect(input).toHaveValue('Germany');
    await expect(input).toBeFocused();
    await input.fill('Paris');
    await expect(results.getByRole('option', { name: 'France' })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(input).not.toBeFocused();
    await expect(input).toHaveValue('Germany');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  }
});
