import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const axe = (page: Page) =>
  new AxeBuilder({ page })
    .include('[aria-label="Component preview"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();

async function open(page: Page, component: string, dark: boolean) {
  await page.goto(`/?page=components&component=${component}`);
  if (!dark) return;
  const panel = page.getByRole('dialog', { name: 'Live theme editor' });
  await page.getByRole('button', { name: 'Edit theme', exact: true }).click();
  await panel.getByRole('switch', { name: 'Dark mode', exact: true }).setChecked(true);
  await panel.getByRole('button', { name: 'Collapse theme editor' }).click();
}

test('timed toasts pause on hover, keep errors and pass axe in both modes', async ({
  page,
}, testInfo) => {
  await page.clock.install();
  for (const dark of [false, true]) {
    await open(page, 'toast-stack', dark);
    const preview = page.getByLabel('Component preview');
    const stack = preview.getByRole('region', { name: 'Notifications' });
    await preview.getByRole('button', { name: 'Show timed notification' }).click();
    await preview.getByRole('button', { name: 'Show error' }).click();
    const saved = stack.getByRole('status').filter({ hasText: 'Changes saved' });
    const failed = stack.getByRole('alert').filter({ hasText: 'Upload failed' });
    await expect(saved).toBeVisible();
    await expect(failed).toBeVisible();
    expect((await axe(page)).violations).toEqual([]);
    if (testInfo.project.name === 'chromium')
      await preview.screenshot({ path: `test-results/toast-stack-${dark ? 'dark' : 'light'}.png` });

    // Hovering pauses the countdown; leaving resumes it. Errors never expire.
    await saved.hover();
    await expect(stack).toHaveAttribute('data-paused', 'true');
    await page.clock.runFor(10_000);
    await expect(saved).toBeVisible();
    await page.mouse.move(1, 1);
    await expect(stack).not.toHaveAttribute('data-paused');
    await page.clock.runFor(6_500);
    await expect(saved).toHaveCount(0);
    await expect(failed).toBeVisible();

    // Retry keeps the error open; the action of a timed toast dismisses it.
    await failed.getByRole('button', { name: 'Retry' }).click();
    await expect(failed).toBeVisible();
    await failed.getByRole('button', { name: 'Dismiss: Upload failed' }).click();
    await expect(failed).toHaveCount(0);
    await preview.getByRole('button', { name: 'Show timed notification' }).click();
    await stack.getByRole('button', { name: 'Undo' }).click();
    await expect(stack.getByRole('status')).toHaveCount(0);
    await expect(preview.getByText('Undo used 1 times.')).toBeVisible();
  }
});

test('banners are silent, dismissible and pass axe in both modes', async ({ page }, testInfo) => {
  for (const dark of [false, true]) {
    await open(page, 'banner', dark);
    const preview = page.getByLabel('Component preview');
    await expect(preview.locator('.g-banner')).toHaveCount(4);
    await expect(preview.locator('.g-banner > .g-icon')).toHaveCount(4);
    await expect(preview.getByRole('status')).toHaveCount(0);
    await expect(preview.getByRole('alert')).toHaveCount(0);
    expect((await axe(page)).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (testInfo.project.name === 'chromium' || testInfo.project.name === 'mobile')
      await preview.screenshot({
        path: `test-results/banner-${testInfo.project.name}-${dark ? 'dark' : 'light'}.png`,
      });
    await preview.getByRole('button', { name: 'Dismiss: Your trial ends in 3 days' }).click();
    await expect(preview.locator('.g-banner')).toHaveCount(3);
    await preview.getByRole('button', { name: 'Show trial banner again' }).click();
    await expect(preview.locator('.g-banner')).toHaveCount(4);
  }
});
