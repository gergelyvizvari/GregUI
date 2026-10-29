import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { featuredPresets, presetInfo, presets } from '@gregui/tokens';
async function navigate(page: Page, name: string) {
  if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
    await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name, exact: true }).first().click();
}
test('default view is accessible and fits narrow screens', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Seven directions. One foundation.' }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({
    path: `test-results/overview-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
for (const preset of featuredPresets) {
  test(`featured preset ${preset} and dark mode preserve accessible rendered content`, async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    const name = presetInfo[preset].name;
    await page.getByRole('button', { name: new RegExp(`^${name} `) }).click();
    for (const dark of [false, true]) {
      await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
      const results = await new AxeBuilder({ page })
        .include('[aria-label="Component preview"]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations, `${name} ${dark ? 'dark' : 'light'}`).toEqual([]);
      if (name === 'Paper') {
        const preview = page.locator('[aria-label="Component preview"]');
        const input = preview.getByRole('textbox').first();
        await expect(input).toHaveCSS('border-top-width', '0px');
        await expect(input).toHaveCSS('border-bottom-width', '1px');
        await input.fill('Updated workspace');
        await expect(input).toHaveValue('Updated workspace');
        await expect(preview.locator('.g-card').first()).toHaveCSS('border-top-width', '0px');
        const button = preview.getByRole('button').first();
        await expect(button).toHaveCSS('box-shadow', 'none');
        await button.hover();
        await expect(button).toHaveCSS('box-shadow', 'none');
        await expect(button).toHaveCSS('transform', 'none');
        await button.focus();
        await page.keyboard.press('Tab');
        await button.focus();
        await expect(button).toBeFocused();
        await expect(button).not.toHaveCSS('outline-style', 'none');
      }
      if (testInfo.project.name === 'chromium')
        await page.locator('[aria-label="Component preview"]').screenshot({
          path: `test-results/preset-${name.toLowerCase()}-${dark ? 'dark' : 'light'}.png`,
        });
    }
  });
}
test('theme editing supports undo, local drafts, validated import and export', async ({ page }) => {
  await page.goto('/');
  await navigate(page, 'Theme studio');
  await page.getByRole('textbox', { name: 'Theme name' }).fill('My brand');
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await page.getByRole('textbox', { name: 'Theme name' }).fill('Changed');
  await page.getByRole('button', { name: 'Restore draft' }).click();
  await expect(page.getByRole('textbox', { name: 'Theme name' })).toHaveValue('My brand');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export theme', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('gregui-theme.json');
  await page.getByRole('button', { name: 'Import JSON' }).click();
  await page.getByRole('textbox', { name: 'Theme JSON' }).fill('{"version":2}');
  await page.getByRole('button', { name: 'Apply theme' }).click();
  await expect(page.getByText('Unsupported theme version. Expected version 1.')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('textbox', { name: 'Theme name' }).fill('Undo this');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Theme name' })).toHaveValue('My brand');
});
test('RTL dialog traps focus, inherits colors and returns focus', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Preview language').selectOption('ar');
  await page.getByRole('switch', { name: 'Dark mode' }).check();
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((el) => getComputedStyle(el).direction)).toBe('rtl');
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open dialog', exact: true })).toBeFocused();
});
test('settings form validates and then saves locally', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Workspace name').fill('');
  await page.getByLabel('Contact email').fill('bad');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByLabel('Workspace name')).toBeFocused();
  await expect(page.getByLabel('Contact email')).toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Workspace name').fill('New workspace');
  await page.getByLabel('Contact email').fill('hello@example.com');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByText('Your preview changes are saved for this session.')).toBeVisible();
});
test('catalog filtering and overlay examples work', async ({ page }) => {
  await page.goto('/');
  await navigate(page, 'Components');
  await page.getByLabel('Find a component').fill('drawer');
  await page.getByRole('button', { name: 'Open drawer' }).click();
  await expect(page.getByRole('dialog', { name: 'Filter results' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByLabel('Find a component').fill('no-such-component');
  await expect(page.getByRole('heading', { name: 'No matching components' })).toBeVisible();
});
test('catalog and supporting pages pass accessibility checks', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Components', 'Foundations', 'Patterns', 'Accessibility & support']) {
    await navigate(page, name);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations, name).toEqual([]);
  }
});
test('320px reflow and reduced motion preserve access', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await navigate(page, 'Components');
  await page.getByLabel('Find a component').fill('button');
  expect(
    await page.locator('.g-spinner').evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('palettes preserve style and survive mode, undo and saved drafts', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.getByLabel('Palette', { exact: true }).selectOption('cobalt');
  await page.getByRole('switch', { name: 'Dark mode' }).check();
  await expect(page.getByLabel('Palette', { exact: true })).toHaveValue('cobalt');
  await expect(page.locator('[aria-label="Component preview"]').locator('..')).toHaveAttribute(
    'data-preset',
    'glass',
  );
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await page.getByLabel('Palette', { exact: true }).selectOption('forest');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByLabel('Palette', { exact: true })).toHaveValue('cobalt');
  await page.getByLabel('Palette', { exact: true }).selectOption('clay');
  await page.getByRole('button', { name: 'Restore draft', exact: true }).click();
  await expect(page.getByLabel('Palette', { exact: true })).toHaveValue('cobalt');
  if (testInfo.project.name === 'chromium')
    await page.screenshot({ path: 'test-results/palette-editor.png', fullPage: true });
});

test('motion keeps overlays positioned and respects reduced motion including switch thumbs', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((el) => getComputedStyle(el).animationName)).toBe('g-overlay-in');
  if (testInfo.project.name === 'chromium')
    await page.screenshot({ path: 'test-results/motion-dialog.png', animations: 'disabled' });
  await page.keyboard.press('Escape');
  await page.getByRole('switch', { name: 'Reduce motion' }).check();
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  expect(await dialog.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page
      .getByRole('switch', { name: 'Dark mode' })
      .evaluate((el) => getComputedStyle(el, '::after').transitionDuration),
  ).toBe('0s');
});

test('authentication demo completes login, recovery and registration flows', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await navigate(page, 'Authentication');
  await page.getByLabel('Email address', { exact: false }).fill('demo@example.com');
  await page.getByLabel('Password (required)', { exact: true }).fill('demo-password');
  await page.getByRole('checkbox', { name: 'Keep me signed in' }).check();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByLabel('Verification code').fill('000000');
  await page.getByRole('button', { name: 'Verify code', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Something went wrong');
  await page.getByLabel('Verification code').fill('123456');
  await page.getByRole('button', { name: 'Verify code', exact: true }).click();
  await expect(page.getByText('Demo flow complete.')).toBeVisible();
  await page.getByLabel('Authentication flow').selectOption('forgot-password');
  await page.getByLabel('Email address').fill('demo@example.com');
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await page.getByRole('button', { name: 'Open demo reset link' }).click();
  await page.getByLabel('Password (required)', { exact: true }).fill('new-password');
  await page.getByLabel('Confirm password (required)', { exact: true }).fill('mismatch');
  await page.getByRole('button', { name: 'Set new password', exact: true }).click();
  await expect(page.getByLabel('Confirm password (required)', { exact: true })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await page.getByLabel('Confirm password (required)', { exact: true }).fill('new-password');
  await page.getByRole('button', { name: 'Set new password', exact: true }).click();
  await expect(page.getByText('Demo flow complete.')).toBeVisible();
  await page.getByLabel('Authentication flow').selectOption('register');
  await page.getByLabel('Full name').fill('Demo Person');
  await page.getByLabel('Email address').fill('demo@example.com');
  await page.getByLabel('Password (required)', { exact: true }).fill('demo-password');
  await page.getByLabel('Confirm password (required)', { exact: true }).fill('demo-password');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await page.getByRole('button', { name: 'Resend code' }).click();
  await expect(page.getByText('A new code has been requested.', { exact: true })).toBeVisible();
  await page.getByLabel('Verification code').fill('123456');
  await page.getByRole('button', { name: 'Verify code', exact: true }).click();
  await expect(page.getByText('Demo flow complete.')).toBeVisible();
  await page.getByRole('button', { name: 'Start again' }).click();
  await page.getByLabel('Form language').selectOption('hu');
  await expect(page.getByRole('button', { name: 'Bejelentkezés', exact: true })).toBeVisible();
  await page.screenshot({ path: `test-results/auth-${testInfo.project.name}.png`, fullPage: true });
});

test('all authentication screens pass accessibility and narrow reflow checks', async ({ page }) => {
  await page.goto('/');
  await navigate(page, 'Authentication');
  for (const flow of [
    'login',
    'register',
    'forgot-password',
    'reset-password',
    'verify-email',
    'two-factor',
  ]) {
    await page.getByLabel('Authentication flow').selectOption(flow);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations, flow).toEqual([]);
  }
  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByLabel('Authentication flow').selectOption('register');
  await page.getByLabel('Form language').selectOption('hu');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('optional social login providers support configuration, failure and retry', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await navigate(page, 'Authentication');
  await page.getByLabel('Social sign-in providers').selectOption('none');
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toHaveCount(0);
  await expect(page.getByText('or sign in with email')).toHaveCount(0);
  await page.getByLabel('Social sign-in providers').selectOption('google');
  await expect(page.getByRole('button', { name: 'Continue with Apple' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await expect(page.getByText('Demo flow complete.')).toBeVisible();
  await page.getByRole('button', { name: 'Start again' }).click();
  await page.getByLabel('Social sign-in providers').selectOption('apple');
  await page.getByLabel('Demo response').selectOption('error');
  await page.getByRole('button', { name: 'Continue with Apple' }).click();
  await expect(page.getByRole('alert')).toContainText('Something went wrong');
  await page.getByLabel('Demo response').selectOption('success');
  await page.getByRole('button', { name: 'Continue with Apple' }).click();
  await expect(page.getByText('Demo flow complete.')).toBeVisible();
  await page.getByRole('button', { name: 'Start again' }).click();
  await page.getByLabel('Social sign-in providers').selectOption('both');
  await page.getByLabel('Form language').selectOption('hu');
  await expect(page.getByRole('button', { name: 'Folytatás Google-fiókkal' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Folytatás Apple-fiókkal' })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({
    path: `test-results/social-auth-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

for (const preset of presets) {
  test(`editorial authentication inherits every material in light and dark (${preset})`, async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    for (const dark of [false, true]) {
      await navigate(page, 'Authentication');
      await page.getByLabel('Preview style').selectOption(preset);
      await navigate(page, 'Overview');
      await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
      await navigate(page, 'Authentication');
      const results = await new AxeBuilder({ page })
        .include('.g-auth-layout')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations, `${preset} ${dark}`).toEqual([]);
      if (testInfo.project.name === 'chromium' && !dark)
        await page
          .locator('.g-auth-layout')
          .screenshot({ path: `test-results/material-auth-${preset.toLowerCase()}.png` });
    }
  });
}

test('authentication style selector updates the shared theme without resetting the form', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await navigate(page, 'Authentication');
  await page.getByLabel('Email address').fill('demo@example.com');
  for (const preset of ['flat', 'glass', 'soft', 'elevated', 'outline']) {
    await page.getByLabel('Preview style').selectOption(preset);
    await expect(page.locator(`.g-theme[data-preset="${preset}"] .g-auth-layout`)).toBeVisible();
    await expect(page.getByLabel('Email address')).toHaveValue('demo@example.com');
  }
  await page.getByLabel('Preview style').selectOption('soft');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({
    path: `test-results/auth-style-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await navigate(page, 'Overview');
  await expect(
    page.locator('.g-theme[data-preset="soft"] [aria-label="Component preview"]'),
  ).toBeVisible();
  await navigate(page, 'Authentication');
  await expect(page.getByLabel('Preview style')).toHaveValue('soft');
});

test('onboarding validates, retains fields, retries saves and completes', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await navigate(page, 'Patterns');
  await page.getByRole('tab', { name: 'Onboarding' }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByLabel('Workspace name')).toBeFocused();
  await page.getByLabel('Workspace name').fill('Studio North');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Preferences', exact: true })).toBeFocused();
  await page.getByLabel('Product updates').check();
  await page.getByText('How is this preference used?').click();
  await expect(
    page.getByText('This demo keeps the choice in memory only.', { exact: false }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByLabel('Workspace name')).toHaveValue('Studio North');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByLabel('Product updates')).toBeChecked();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  // The wizard focuses the step heading after rendering; wait so that jump can't eat the next click.
  await expect(page.getByRole('heading', { name: 'Review', exact: true })).toBeFocused();
  await page.getByLabel('Simulate a save failure').check();
  await page.getByRole('button', { name: 'Create workspace', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not continue');
  await page.getByLabel('Simulate a save failure').uncheck();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: `test-results/onboarding-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Create workspace', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Workspace ready' })).toBeVisible();
});

for (const preset of presets) {
  test(`new workflow components support every material and paginated content (${preset})`, async ({
    page,
  }) => {
    await page.goto('/');
    for (const dark of [false, true]) {
      await navigate(page, 'Authentication');
      await page.getByLabel('Preview style').selectOption(preset);
      await navigate(page, 'Overview');
      await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
      await navigate(page, 'Patterns');
      await page.getByRole('tab', { name: 'Onboarding' }).click();
      // Contrast is meaningful once the tab's entrance fade has finished.
      await expect(page.getByRole('tabpanel')).toHaveCSS('opacity', '1');
      const results = await new AxeBuilder({ page })
        .include('.g-wizard')
        .include('.g-stepper')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations, `${preset} ${dark}`).toEqual([]);
    }
    await navigate(page, 'Components');
    await page.getByLabel('Find a component').fill('Pagination');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('rowheader', { name: 'Help centre' })).toBeVisible();
    await page.getByRole('button', { name: 'Page 3', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
    await expect(page.getByRole('rowheader', { name: 'Member area' })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('expanded catalog has accessible responsive examples for all twenty additions', async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  await page.goto('/');
  await navigate(page, 'Components');
  const names = [
    'Tree View',
    'Timeline View',
    'Data Table',
    'Combobox',
    'Date Range Picker',
    'File Upload',
    'Action Menu',
    'Command Palette',
    'Toast Stack',
    'Search & Filter Bar',
    'List Detail',
    'Dashboard',
    'Profile Settings',
    'Security Settings',
    'Team Members',
    'Notification Centre',
    'Privacy Preferences',
    'Pricing Cards',
    'Comments Panel',
    'Approval Panel',
  ];
  for (const name of names) {
    await page.getByLabel('Find a component').fill(name);
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations, name).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      name,
    ).toBe(true);
    if (
      testInfo.project.name === 'chromium' &&
      ['Tree View', 'Timeline View', 'Profile Settings', 'Data Table'].includes(name)
    )
      await page.screenshot({
        path: `test-results/expanded-${name.replaceAll(' ', '-')}.png`,
        fullPage: true,
      });
  }
});

test('tree and combobox support keyboard interaction and commands return focus', async ({
  page,
}) => {
  await page.goto('/');
  await navigate(page, 'Components');
  await page.getByLabel('Find a component').fill('Tree View');
  await page.getByRole('treeitem', { name: 'Workspace', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('treeitem', { name: 'Design', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('treeitem', { name: 'Tokens', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Selected: tokens')).toBeVisible();
  await page.getByLabel('Find a component').fill('Combobox');
  await page.getByRole('combobox', { name: 'Search region' }).fill('Ger');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('combobox', { name: 'Search region' })).toHaveValue('Germany');
  await page.getByRole('combobox', { name: 'Search region' }).fill('Fra');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('combobox', { name: 'Search region' })).toHaveValue('Germany');
  await page.getByLabel('Find a component').fill('Command Palette');
  await page.getByRole('button', { name: 'Open commands' }).click();
  await page.getByRole('dialog').getByLabel('Search').fill('Open');
  await page.getByRole('button', { name: 'Open project', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open commands' })).toBeFocused();
});

test('composed panels perform local profile, team, discussion and approval actions', async ({
  page,
}) => {
  await page.goto('/');
  await navigate(page, 'Components');
  await page.getByLabel('Find a component').fill('Profile Settings');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByText('Saved successfully.')).toBeVisible();
  await page.getByLabel('Find a component').fill('Team Members');
  await page.getByLabel('Invitation email').fill('test@example.com');
  await page.getByRole('button', { name: 'Send invitation' }).click();
  await expect(page.getByText('1 simulated invitations. No emails are sent.')).toBeVisible();
  await page.getByLabel('Role: Sam Taylor').selectOption('viewer');
  await page.getByRole('button', { name: 'Save changes', exact: true }).last().click();
  await expect(page.getByLabel('Role: Sam Taylor')).toHaveValue('viewer');
  await page.getByLabel('Find a component').fill('Comments Panel');
  await page.getByLabel('Comment', { exact: true }).fill('Looks good.');
  await page.getByRole('button', { name: 'Post comment' }).click();
  await expect(page.getByText('Looks good.', { exact: true })).toBeVisible();
  await page.getByLabel('Find a component').fill('Approval Panel');
  await page.getByRole('button', { name: 'Approve', exact: true }).click();
  await expect(page.getByText('Decision recorded.')).toBeVisible();
});

for (const preset of presets) {
  test(`expanded catalog retains contrast across all materials and modes (${preset})`, async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Material matrix is covered once; interactions run in every browser.',
    );
    await page.goto('/');
    for (const dark of [false, true]) {
      await navigate(page, 'Authentication');
      await page.getByLabel('Preview style').selectOption(preset);
      await navigate(page, 'Overview');
      await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
      await navigate(page, 'Components');
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations, `${preset} ${dark}`).toEqual([]);
    }
    await navigate(page, 'Authentication');
    await page.getByLabel('Preview style').selectOption('soft');
    await navigate(page, 'Components');
    await page.getByLabel('Find a component').fill('Tree View');
    await expect(page.locator('.g-theme[data-preset="soft"] [role="tree"]')).toBeVisible();
    await page.setViewportSize({ width: 320, height: 720 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath('tree-mobile-320.png'), fullPage: true });
  });
}

for (const preset of presets) {
  test(`pricing makes current and recommended plans distinct in every theme (${preset})`, async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    for (const dark of [false, true]) {
      await navigate(page, 'Authentication');
      await page.getByLabel('Preview style').selectOption(preset);
      await navigate(page, 'Overview');
      await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
      await navigate(page, 'Components');
      await page.getByLabel('Find a component').fill('Pricing Cards');
      const team = page.getByRole('article', { name: 'Team', exact: true });
      await page.getByRole('button', { name: 'Choose plan: Team', exact: true }).click();
      await expect(team).toHaveAttribute('aria-current', 'true');
      await expect(team.locator('.g-badge').filter({ hasText: 'Current plan' })).toBeVisible();
      await expect(page.getByRole('article', { name: 'Starter', exact: true })).not.toHaveAttribute(
        'aria-current',
        'true',
      );
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations, `${preset} ${dark}`).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (preset === 'soft' && !dark)
        await page.screenshot({
          path: `test-results/pricing-usability-${testInfo.project.name}.png`,
          fullPage: true,
        });
    }
  });
}
test('selection cues, action dismissal and file clearing are usable in the catalog', async ({
  page,
}) => {
  await page.goto('/');
  await navigate(page, 'Components');
  await page.getByLabel('Find a component').fill('Data Table');
  await page.getByLabel('Select row Customer portal').check();
  await expect(
    page.getByRole('row').filter({ has: page.getByRole('rowheader', { name: 'Customer portal' }) }),
  ).toHaveAttribute('data-selected', 'true');
  await page.getByLabel('Find a component').fill('List Detail');
  await page.getByRole('button', { name: 'Design library Draft' }).click();
  await expect(page.getByRole('button', { name: /Design library/ })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await page.getByLabel('Find a component').fill('Action Menu');
  await page.getByRole('button', { name: 'Project actions' }).click();
  await page.getByRole('button', { name: 'Open project', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Project actions' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Open project', exact: true })).toHaveCount(0);
  await page.getByLabel('Find a component').fill('File Upload');
  await page
    .getByLabel('Demo attachments')
    .setInputFiles({ name: 'example.txt', mimeType: 'text/plain', buffer: Buffer.from('Demo') });
  await page.getByRole('button', { name: 'Clear selected files' }).click();
  await expect(
    page.getByText('PDF or TXT, up to 5 MB per file. Selected: None. No upload occurs.'),
  ).toBeVisible();
});

test('refreshed palettes stay readable on Paper in both modes', async ({ page }, testInfo) => {
  test.setTimeout(120000);
  await page.goto('/');
  await page.getByRole('button', { name: /^Paper / }).click();
  const palette = page.getByLabel('Palette', { exact: true });
  const ids = await palette
    .locator('option')
    .evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value).filter((id) => id !== 'custom'),
    );
  expect(ids).toHaveLength(16);
  const preview = page.locator('[aria-label="Component preview"]');
  for (const id of ids) {
    await palette.selectOption(id);
    for (const dark of [false, true]) {
      await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
      expect(
        (
          await new AxeBuilder({ page })
            .include('[aria-label="Component preview"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
        id,
      ).toEqual([]);
      if (id === 'paper' && !dark) {
        await expect(preview.getByRole('textbox').first()).toHaveCSS(
          'background-color',
          'rgb(255, 255, 255)',
        );
      }
      if (
        testInfo.project.name === 'chromium' &&
        ['paper', 'coral', 'mint', 'citrus', 'violet'].includes(id)
      ) {
        await preview.screenshot({
          path: `test-results/palette-${id}-${dark ? 'dark' : 'light'}.png`,
        });
      }
    }
  }
});
