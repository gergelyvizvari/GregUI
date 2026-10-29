import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const axe = (page: Page) =>
  new AxeBuilder({ page })
    .include('[aria-label="Component preview"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();

async function applyTheme(page: Page, preset: string, dark: boolean) {
  const panel = page.getByRole('dialog', { name: 'Live theme editor' });
  await page.getByRole('button', { name: 'Edit theme', exact: true }).click();
  await panel.getByLabel('Style', { exact: true }).selectOption(preset);
  await panel.getByRole('switch', { name: 'Dark mode', exact: true }).setChecked(dark);
  await panel.getByRole('button', { name: 'Collapse theme editor' }).click();
}

// One test per combination keeps each within the default timeout in slower browsers.
for (const preset of ['glass', 'paper'])
  for (const dark of [false, true])
    for (const component of ['segmented-control', 'slider', 'number-field'])
      test(`${component} passes axe in ${preset} ${dark ? 'dark' : 'light'}`, async ({
        page,
      }, testInfo) => {
        await page.goto(`/?page=components&component=${component}`);
        await applyTheme(page, preset, dark);
        const preview = page.getByLabel('Component preview');
        await expect
          .poll(() => preview.evaluate((el) => el.closest('.g-theme')?.getAttribute('data-preset')))
          .toBe(preset);
        // Contrast is meaningful once the theme switch's colour transitions have settled.
        await page.waitForFunction(() =>
          document.getAnimations().every((animation) => animation.playState !== 'running'),
        );
        expect((await axe(page)).violations).toEqual([]);
        if (testInfo.project.name === 'chromium')
          await preview.screenshot({
            path: `test-results/${component}-${preset}-${dark ? 'dark' : 'light'}.png`,
          });
      });

test('segmented control selects with arrow keys', async ({ page }) => {
  await page.goto('/?page=components&component=segmented-control');
  const preview = page.getByLabel('Component preview');
  const view = preview.getByRole('group', { name: 'View' });
  await view.getByRole('radio', { name: 'List' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(view.getByRole('radio', { name: 'Grid' })).toBeChecked();
  await expect(view.getByRole('radio', { name: 'Grid' })).toBeFocused();
  await page.keyboard.press('End');
  await expect(view.getByRole('radio', { name: 'Calendar' })).toBeChecked();
  await expect(preview.getByText('Showing the calendar view.')).toBeVisible();
  await view.getByRole('radio', { name: 'List' }).click();
  await expect(view.getByRole('radio', { name: 'List' })).toBeChecked();
  // Tab enters at the selected segment and leaves the group.
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(view.getByRole('radio', { name: 'List' })).toBeFocused();
  const period = preview.getByRole('group', { name: 'Period' });
  await expect(period.getByRole('radio', { name: 'Year' })).toBeDisabled();
});

test('slider moves with the keyboard and shows a formatted value', async ({ page }) => {
  await page.goto('/?page=components&component=slider');
  const preview = page.getByLabel('Component preview');
  const volume = preview.getByRole('slider', { name: 'Volume' });
  await expect(volume).toHaveAttribute('aria-valuetext', '60%');
  await volume.focus();
  await page.keyboard.press('ArrowRight');
  await expect(volume).toHaveAttribute('aria-valuetext', '65%');
  await expect(preview.locator('output').first()).toHaveText('65%');
  const budget = preview.getByRole('slider', { name: 'Delivery budget' });
  await budget.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(budget).toHaveAttribute('aria-valuetext', '£50, Standard');
  await expect(preview.getByRole('slider', { name: 'Locked setting' })).toBeDisabled();
});

test('number field keeps typed text, steps and flags out-of-range values', async ({ page }) => {
  await page.goto('/?page=components&component=number-field');
  const preview = page.getByLabel('Component preview');
  const quantity = preview.getByRole('textbox', { name: 'Quantity' });
  await expect(quantity).toHaveValue('2');
  await quantity.focus();
  await page.keyboard.press('ArrowUp');
  await expect(quantity).toHaveValue('3');
  await quantity.fill('25');
  await expect(quantity).toHaveValue('25');
  await quantity.blur();
  await expect(quantity).toHaveAttribute('aria-invalid', 'true');
  await expect(preview.getByText('Enter 20 or less.')).toBeVisible();
  await preview.getByRole('button', { name: 'Decrease' }).first().click();
  await expect(quantity).toHaveValue('20');
  await expect(quantity).not.toHaveAttribute('aria-invalid');
  const price = preview.getByRole('textbox', { name: 'Price' });
  await price.fill('1234.5');
  await price.blur();
  await expect(price).toHaveValue('£1,234.50');
});
