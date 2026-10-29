import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('remote records support paging, sorting, selection, loading and retry in both modes', async ({
  page,
}, testInfo) => {
  for (const dark of [false, true]) {
    await page.goto('/');
    await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
    if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
      await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('button', { name: 'Components', exact: true }).first().click();
    await page.getByLabel('Find a component').fill('Remote records');
    const table = page
      .getByRole('region', { name: 'Component preview', exact: true })
      .getByRole('region', { name: 'Remote records', exact: true });
    await expect(table).toHaveAttribute('aria-busy', 'false');
    await page.getByLabel('Select row Customer portal').check();
    const next = page.getByRole('button', { name: 'Next', exact: true });
    await next.click();
    await expect(table).toHaveAttribute('aria-busy', 'true');
    await expect(next).toBeDisabled();
    await expect(table.getByRole('button', { name: 'Record' })).toBeDisabled();
    await expect(page.getByRole('rowheader', { name: 'Mobile app', exact: true })).toBeVisible();
    await expect(table).toHaveAttribute('aria-busy', 'false');
    await page.getByLabel('Select row Mobile app').check();
    await page.getByRole('button', { name: 'Previous', exact: true }).click();
    await expect(page.getByLabel('Select row Customer portal')).toBeChecked();
    await expect(table).toHaveAttribute('aria-busy', 'false');
    const sort = table.getByRole('button', { name: 'Record' });
    await sort.focus();
    await page.keyboard.press('Enter');
    await expect(table.getByRole('columnheader', { name: 'Record' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await expect(table).toHaveAttribute('aria-busy', 'false');
    await sort.click();
    await expect(table.getByRole('rowheader').first()).toHaveText('Mobile app');
    await expect(table).toHaveAttribute('aria-busy', 'false');
    await page.getByRole('button', { name: 'Simulate service failure' }).click();
    await expect(page.getByRole('alert')).toContainText('could not load records');
    await expect(page.getByLabel('Select row Mobile app')).toBeDisabled();
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(table).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(table).toHaveAttribute('aria-busy', 'false');
    await expect(page.getByLabel('Select row Mobile app')).toBeChecked();
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
        path: `test-results/remote-records-${testInfo.project.name}-${dark ? 'dark' : 'light'}.png`,
        fullPage: true,
      });
    await page.getByLabel('Filter remote records').fill('nothing matches');
    await expect(page.getByText('No results found.', { exact: true })).toBeVisible();
    await expect(table.getByRole('rowheader')).toHaveCount(0);
    await page.getByLabel('Filter remote records').fill('Help');
    await expect(table.getByRole('rowheader')).toHaveText('Help centre');
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toHaveCount(0);
  }
});
