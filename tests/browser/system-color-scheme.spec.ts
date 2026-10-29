import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createTheme, switchMode, type Theme } from '@gregui/tokens';

const axe = (page: Page, include?: string) => {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']);
  return (include ? builder.include(include) : builder).analyze();
};
// Playwright rewrites React elements created in test files, so render in a plain Node process.
const serverRender = (theme: Theme) =>
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
      import { createElement as h } from 'react';
      import { renderToString } from 'react-dom/server';
      import { Button, Card, Heading, LocaleProvider, Stack, Text, ThemeProvider } from '@gregui/react';
      const theme = JSON.parse(process.argv[1]);
      process.stdout.write(renderToString(
        h(LocaleProvider, null,
          h(ThemeProvider, { theme, colorScheme: 'system' },
            h('main', null,
              h(Card, null,
                h(Stack, { gap: 3 },
                  h(Heading, { level: 1 }, 'Account'),
                  h(Text, { tone: 'muted' }, 'Follows the device colour setting.'),
                  h(Button, null, 'Continue'))))))));
      `,
      JSON.stringify(theme),
    ],
    { encoding: 'utf8' },
  );
const background = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => getComputedStyle(el).getPropertyValue('--g-background').trim());

test('server-rendered system themes paint the device mode before any script runs', async ({
  page,
}) => {
  const theme = createTheme('flat', 'light', 'cobalt');
  const dark = switchMode(theme, 'dark');
  const html = serverRender(theme);
  const css = await readFile(
    new URL('../../packages/react/dist/styles.css', import.meta.url),
    'utf8',
  );
  await page.emulateMedia({ colorScheme: 'dark' });
  // No client bundle: the first paint must come from the server markup and CSS alone.
  await page.setContent(
    `<!doctype html><html lang="en"><head><title>System colour scheme</title><style>${css}</style></head><body>${html}</body></html>`,
  );
  const frame = page.locator('.g-theme').first();
  await expect(frame).toHaveAttribute('data-mode', 'system');
  expect(await background(page, '.g-theme')).toBe(dark.colors.background);
  expect(await frame.evaluate((el) => getComputedStyle(el).colorScheme)).toBe('light dark');
  const darkPaint = await frame.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect((await axe(page)).violations).toEqual([]);

  await page.emulateMedia({ colorScheme: 'light' });
  expect(await background(page, '.g-theme')).toBe(theme.colors.background);
  expect(await frame.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(darkPaint);
  expect((await axe(page)).violations).toEqual([]);
});

test('workbench previews follow the device colour scheme with Match system', async ({ page }) => {
  const glass = createTheme('glass');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/?page=themes');
  const preview = page.locator('.g-preview-stage').first();
  const previewTheme = '.g-preview-stage';
  const mode = () => preview.evaluate((el) => el.closest('.g-theme')?.getAttribute('data-mode'));
  const variable = () =>
    preview.evaluate((el) =>
      getComputedStyle(el.closest('.g-theme')!).getPropertyValue('--g-background').trim(),
    );
  await expect(preview).toBeVisible();
  expect(await mode()).toBe('light');
  const dark = page.getByRole('switch', { name: 'Dark mode', exact: true });
  await page.getByRole('switch', { name: 'Match system', exact: true }).check();
  await expect(dark).toBeDisabled();
  await expect(page.getByText('Previews follow this device: dark.')).toBeVisible();
  await expect.poll(mode).toBe('dark');
  expect(await variable()).toBe(switchMode(glass, 'dark').colors.background);
  expect((await axe(page, previewTheme)).violations).toEqual([]);

  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(mode).toBe('light');
  expect(await variable()).toBe(glass.colors.background);
  await expect(page.getByText('Previews follow this device: light.')).toBeVisible();

  await page.getByRole('switch', { name: 'Match system', exact: true }).uncheck();
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(dark).toBeEnabled();
  expect(await mode()).toBe('light');
});
