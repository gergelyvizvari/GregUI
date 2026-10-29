import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('postcard choices and dimensioned preview work in light/dark, RTL and narrow viewports', async ({
  page,
}, testInfo) => {
  await page.goto('/?page=components&component=postcard-studio');
  const preview = page.getByRole('region', { name: 'Postcard preview', exact: true });
  const choices = page.getByRole('group', { name: 'Postcard design' });
  await expect(preview).toBeVisible();
  await expect(choices.getByRole('radio', { name: 'AI artwork' })).toBeDisabled();
  await choices.getByRole('radio', { name: 'Alpine escape' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(choices.getByRole('radio', { name: 'A little hello' })).toBeChecked();
  await expect(preview.getByRole('heading', { name: 'A little hello' })).toBeVisible();
  await page.getByLabel('Message', { exact: true }).fill('A postcard just for you.');
  await page.getByRole('textbox', { name: /^Recipient name/ }).fill('Jamie Example');
  const address = page.getByRole('group', { name: 'Recipient address' });
  await expect(address.getByRole('combobox', { name: /^Country/ })).toHaveValue('HU');
  await expect(address.getByRole('textbox', { name: /^Postal code/ })).toHaveAttribute(
    'inputmode',
    'numeric',
  );
  await address
    .getByRole('textbox', { name: /^Street name and house number/ })
    .fill('Árvíz utca 28.');
  await address
    .getByRole('textbox', { name: 'Building, staircase, floor, door (optional)', exact: true })
    .fill('2. em. 4.');
  await address.getByRole('textbox', { name: /^Postal code/ }).fill('123');
  await page.getByRole('button', { name: 'Check address fields' }).click();
  await expect(address.getByRole('textbox', { name: /^Postal code/ })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(address.getByText('Enter a four-digit Hungarian postal code.')).toBeVisible();
  await address.getByRole('textbox', { name: /^Postal code/ }).fill('1117');
  await expect(
    page.getByRole('status').filter({ hasText: 'Address fields and postcode format checked.' }),
  ).toBeVisible();
  await preview.getByLabel('Side').selectOption('back');
  await expect(preview.getByText('BUDAPEST', { exact: true })).toBeVisible();
  await expect(preview.getByText('Árvíz utca 28.', { exact: true })).toBeVisible();
  await expect(preview.getByText('1117', { exact: true })).toBeVisible();
  await expect(preview.getByText('HUNGARY', { exact: true })).toHaveCount(0);
  await preview.screenshot({ path: `test-results/postcard-hungary-${testInfo.project.name}.png` });
  await address.getByRole('combobox', { name: /^Country/ }).selectOption('GB');
  await expect(address.getByRole('textbox', { name: /^Postcode/ })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await address
    .getByRole('textbox', { name: 'Flat or sub-building (optional)', exact: true })
    .fill('Flat 4');
  await address.getByRole('textbox', { name: /^Building and street/ }).fill('28 Sample Road');
  await address.getByRole('textbox', { name: /^Post town/ }).fill('London');
  await address.getByRole('textbox', { name: /^Postcode/ }).fill('sw1a2aa');
  await address
    .getByRole('textbox', { name: 'Dependent locality (optional)', exact: true })
    .fill('Sample village');
  await expect(preview.getByText('Flat 4', { exact: true })).toBeVisible();
  await expect(preview.getByText('LONDON', { exact: true })).toBeVisible();
  await expect(preview.getByText('SW1A 2AA', { exact: true })).toBeVisible();
  await expect(
    preview.getByText('EGYESÜLT KIRÁLYSÁG / UNITED KINGDOM', { exact: true }),
  ).toBeVisible();
  await page.getByRole('combobox', { name: 'Posting from', exact: true }).selectOption('GB');
  await expect(preview.getByText(/UNITED KINGDOM/)).toHaveCount(0);
  await address.getByRole('combobox', { name: /^Country/ }).selectOption('HU');
  await expect(
    address.getByRole('textbox', { name: 'Dependent locality (optional)', exact: true }),
  ).toHaveCount(0);
  await address.getByRole('combobox', { name: /^Country/ }).selectOption('GB');
  await expect(
    address.getByRole('textbox', { name: 'Dependent locality (optional)', exact: true }),
  ).toHaveValue('Sample village');

  await expect(preview.getByText('Jamie Example', { exact: true })).toBeVisible();
  await expect(preview.getByText('A postcard just for you.', { exact: true })).toBeVisible();
  await preview.getByLabel('Show print guides').check();
  await expect(preview.locator('.g-document-guides')).toBeVisible();
  await preview.getByLabel('Zoom', { exact: true }).selectOption('2');
  await expect(preview.locator('.g-document-sheet')).toHaveCSS(
    'transform',
    'matrix(2, 0, 0, 2, 0, 0)',
  );
  await preview.getByLabel('Zoom', { exact: true }).selectOption('fit');
  for (const dark of [false, true]) {
    await page.getByRole('button', { name: 'Edit theme', exact: true }).click();
    await page.getByRole('switch', { name: 'Dark mode' }).setChecked(dark);
    await page.getByRole('button', { name: 'Collapse theme editor', exact: true }).click();
    expect(
      (
        await new AxeBuilder({ page })
          .include('.g-visual-choice-group')
          .include('.g-address-fields')
          .include('.g-document-preview')
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  await page.screenshot({
    path: `test-results/postcard-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await expect
    .poll(() =>
      preview
        .locator('.g-document-footprint')
        .evaluate(
          (element) =>
            element.getBoundingClientRect().width <= element.parentElement!.clientWidth - 30,
        ),
    )
    .toBe(true);
  const messageBox = (await preview
    .getByRole('region', { name: 'Postcard message', exact: true })
    .boundingBox())!;
  const recipientBox = (await preview
    .getByRole('region', { name: 'Postcard recipient', exact: true })
    .boundingBox())!;
  expect(recipientBox.x).toBeGreaterThan(messageBox.x + messageBox.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await address.evaluate((element) => element.setAttribute('dir', 'rtl'));
  await expect(address.getByRole('textbox', { name: /^Building and street/ })).toHaveCSS(
    'direction',
    'rtl',
  );
  await choices.evaluate((element) => element.setAttribute('dir', 'rtl'));
  await choices.getByRole('radio', { name: 'A little hello' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(choices.getByRole('radio', { name: 'Alpine escape' })).toBeChecked();
  await preview.getByLabel('Zoom', { exact: true }).selectOption('2');
  expect(
    await preview
      .locator('.g-document-viewport')
      .evaluate((element) => element.scrollWidth > element.clientWidth),
  ).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('print guides show bleed, trim and crop marks and the front warns about a low-resolution photo', async ({
  page,
}, testInfo) => {
  await page.goto('/?page=components&component=postcard-studio');
  const preview = page.getByRole('region', { name: 'Postcard preview', exact: true });
  await preview.getByLabel('Zoom', { exact: true }).selectOption('1');
  const warning = preview.locator('.g-alert[data-tone="warning"]');
  await expect(warning).toContainText('Image may print blurry');
  await expect(warning).toContainText('Alpine lake photo prints at about 183 dpi');
  const sheet = (await preview.locator('.g-document-sheet').boundingBox())!;
  const photo = (await preview.getByRole('img', { name: /Clear lake/ }).boundingBox())!;
  // 154 × 111 mm with 3 mm bleed; the photo covers the whole sheet.
  expect(sheet.width).toBeCloseTo((154 * 96) / 25.4, 0);
  expect(sheet.height).toBeCloseTo((111 * 96) / 25.4, 0);
  expect(photo.width).toBeCloseTo(sheet.width, 0);
  expect(photo.height).toBeCloseTo(sheet.height, 0);
  await expect(preview.locator('.g-document-trim')).toHaveCount(0);
  await preview.getByLabel('Show print guides').check();
  const trim = (await preview.locator('.g-document-trim').boundingBox())!;
  const bleed = (3 * 96) / 25.4;
  expect(trim.x - sheet.x).toBeCloseTo(bleed, 0);
  expect(trim.width).toBeCloseTo((148 * 96) / 25.4, 0);
  await expect(preview.locator('.g-document-crop')).toHaveCount(4);
  const safe = (await preview.locator('.g-document-guides').boundingBox())!;
  expect(safe.x - trim.x).toBeCloseTo((5 * 96) / 25.4, 0);
  await preview.screenshot({ path: `test-results/print-guides-${testInfo.project.name}.png` });
  await preview.getByLabel('Side', { exact: true }).selectOption('back');
  await expect(warning).toHaveCount(0);
  await preview.getByLabel('Side', { exact: true }).selectOption('front');
  await page
    .getByRole('group', { name: 'Postcard design' })
    .getByRole('radio', { name: 'A little hello' })
    .check();
  await expect(warning).toHaveCount(0);
  expect(
    (await new AxeBuilder({ page }).include('.g-document-preview').analyze()).violations,
  ).toEqual([]);
});

test('postcard fields align with unequal hints/errors and preview controls share form sizing', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.goto('/?page=components&component=postcard-studio');
  const address = page.getByRole('group', { name: 'Recipient address' });
  const postal = address.getByRole('textbox', { name: /^Postal code/ });
  const city = address.getByRole('textbox', { name: /^Settlement/ });
  const preview = page.getByRole('region', { name: 'Postcard preview', exact: true });
  const panel = page.getByRole('dialog', { name: 'Live theme editor' });
  for (const density of ['comfortable', 'compact']) {
    await page.getByRole('button', { name: 'Edit theme', exact: true }).click();
    await panel.getByLabel('Density', { exact: true }).selectOption(density);
    await panel.getByRole('button', { name: 'Collapse theme editor' }).click();
    for (const error of [false, true]) {
      await postal.fill(error ? '12' : '1117');
      await page.getByRole('button', { name: 'Check address fields' }).click();
      const a = (await postal.boundingBox())!;
      const b = (await city.boundingBox())!;
      expect(b.x).toBeGreaterThan(a.x + a.width);
      expect(Math.abs(a.y - b.y)).toBeLessThan(1);
      const side = (await preview.getByLabel('Side', { exact: true }).boundingBox())!;
      const zoom = (await preview.getByLabel('Zoom', { exact: true }).boundingBox())!;
      const country = (await address.getByRole('combobox', { name: /^Country/ }).boundingBox())!;
      expect(Math.abs(side.height - country.height)).toBeLessThan(1);
      expect(Math.abs(side.y - zoom.y)).toBeLessThan(1);
      const check = (await preview
        .getByRole('checkbox', { name: 'Show print guides' })
        .boundingBox())!;
      expect(Math.abs(check.y + check.height / 2 - side.y - side.height / 2)).toBeLessThan(1);
    }
  }
  await address.screenshot({ path: `test-results/address-alignment-${testInfo.project.name}.png` });
  await preview.screenshot({ path: `test-results/preview-controls-${testInfo.project.name}.png` });
});

test('folded cards show cover, inside and back with a separate envelope draft', async ({
  page,
}, testInfo) => {
  await page.goto('/?page=components&component=postcard-studio');
  await page.getByRole('textbox', { name: /^Recipient name/ }).fill('Postcard recipient');
  await page.getByLabel('Message', { exact: true }).fill('The message inside the card');
  await page.getByLabel('Card format', { exact: true }).selectOption('folded');
  const card = page.getByRole('region', { name: 'Folded card preview', exact: true });
  const envelope = page.getByRole('region', { name: 'Envelope preview', exact: true });
  const fields = page.getByRole('group', { name: 'Envelope address', exact: true });
  await expect(card.getByLabel('Side', { exact: true })).toHaveValue('cover');
  await expect(fields.getByRole('textbox', { name: /^Recipient name/ })).toHaveValue('Kovács Anna');
  await fields.getByRole('textbox', { name: /^Recipient name/ }).fill('Envelope recipient');
  await fields.getByRole('textbox', { name: /^Street name/ }).fill('Boríték utca 8.');
  await expect(envelope.getByText('Envelope recipient', { exact: true })).toBeVisible();
  await expect(card.getByText('Envelope recipient', { exact: true })).toHaveCount(0);
  await page
    .getByLabel('Inside left message (optional)', { exact: true })
    .fill('A small memory on the left');
  await page.getByLabel('Back cover text', { exact: true }).fill('Made with love');
  await card.getByLabel('Side', { exact: true }).selectOption('inside');
  await expect(card.getByRole('region', { name: 'Inside left', exact: true })).toHaveText(
    'A small memory on the left',
  );
  await expect(card.getByRole('region', { name: 'Inside right', exact: true })).toHaveText(
    'The message inside the card',
  );
  await expect(
    card.getByText('Inside (open spread) · 296 × 105 mm', { exact: true }),
  ).toBeVisible();
  await expect(card.getByText('Boríték utca 8.', { exact: true })).toHaveCount(0);
  for (const dark of [false, true]) {
    await page.getByRole('button', { name: 'Edit theme', exact: true }).click();
    await page.getByRole('switch', { name: 'Dark mode', exact: true }).setChecked(dark);
    await page.getByRole('button', { name: 'Collapse theme editor', exact: true }).click();
    expect(
      (
        await new AxeBuilder({ page })
          .include('.g-document-preview')
          .include('.g-address-fields')
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  await card.screenshot({ path: `test-results/folded-inside-${testInfo.project.name}.png` });
  await envelope.screenshot({ path: `test-results/folded-envelope-${testInfo.project.name}.png` });
  await card.getByLabel('Side', { exact: true }).selectOption('back');
  await expect(card.getByText('Made with love', { exact: true })).toBeVisible();
  await expect(card.getByText('The message inside the card', { exact: true })).toHaveCount(0);
  await page.getByLabel('Card format', { exact: true }).selectOption('flat');
  await expect(page.getByRole('region', { name: 'Envelope preview', exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: /^Recipient name/ })).toHaveValue(
    'Postcard recipient',
  );
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue(
    'The message inside the card',
  );
  await page.getByLabel('Card format', { exact: true }).selectOption('folded');
  await expect(fields.getByRole('textbox', { name: /^Recipient name/ })).toHaveValue(
    'Envelope recipient',
  );
  await card.getByLabel('Side', { exact: true }).selectOption('inside');
  await page.setViewportSize({ width: 320, height: 740 });
  await expect
    .poll(() =>
      card
        .locator('.g-document-footprint')
        .evaluate(
          (element) =>
            element.getBoundingClientRect().width <= element.parentElement!.clientWidth - 30,
        ),
    )
    .toBe(true);
  expect(
    (
      await card
        .locator('.g-document-spread')
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns)
    ).split(' '),
  ).toHaveLength(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('flat and folded cards retain content and selected surface across portrait and landscape', async ({
  page,
}, testInfo) => {
  await page.goto('/?page=components&component=postcard-studio');
  await page.getByLabel('Message', { exact: true }).fill('Preserved across orientations');
  for (const format of ['flat', 'folded']) {
    await page.getByLabel('Card format', { exact: true }).selectOption(format);
    const preview = page.getByRole('region', {
      name: format === 'flat' ? 'Postcard preview' : 'Folded card preview',
      exact: true,
    });
    for (const orientation of ['portrait', 'landscape']) {
      await page.getByLabel('Card orientation', { exact: true }).selectOption(orientation);
      const width = orientation === 'portrait' ? 105 : 148;
      const height = orientation === 'portrait' ? 148 : 105;
      const side = preview.getByLabel('Side', { exact: true });
      await side.selectOption(format === 'flat' ? 'front' : 'cover');
      await expect(
        preview.getByText(`${format === 'flat' ? 'Front' : 'Cover'} · ${width} × ${height} mm`, {
          exact: true,
        }),
      ).toBeVisible();
      await side.selectOption(format === 'flat' ? 'back' : 'inside');
      await expect(
        preview.getByText(
          `${format === 'flat' ? 'Back' : 'Inside (open spread)'} · ${width * (format === 'folded' ? 2 : 1)} × ${height} mm`,
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        preview.getByText('Preserved across orientations', { exact: true }),
      ).toBeVisible();
      // The sheet includes bleed; trimmed content keeps the card's proportions.
      const dimensions = await preview.locator('.g-document-content').boundingBox();
      expect(dimensions!.width / dimensions!.height).toBeCloseTo(
        (width * (format === 'folded' ? 2 : 1)) / height,
        2,
      );
      await preview.screenshot({
        path: `test-results/${format}-${orientation}-${testInfo.project.name}.png`,
      });
      if (format === 'folded') {
        await side.selectOption('back');
        await expect(
          preview.getByText(`Back cover · ${width} × ${height} mm`, { exact: true }),
        ).toBeVisible();
        await expect(
          page
            .getByRole('region', { name: 'Envelope preview', exact: true })
            .getByText('Envelope front · 162 × 114 mm', { exact: true }),
        ).toBeVisible();
      }
    }
    await page.getByLabel('Card orientation', { exact: true }).selectOption('portrait');
    await expect(preview.getByLabel('Side', { exact: true })).toHaveValue('back');
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue(
      'Preserved across orientations',
    );
  }
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('enveloped flat cards keep all address details on the envelope in either orientation', async ({
  page,
}, testInfo) => {
  await page.goto('/?page=components&component=postcard-studio');
  await page.getByRole('textbox', { name: /^Recipient name/ }).fill('Direct recipient');
  await page
    .getByLabel('Message', { exact: true })
    .fill('A personal message, without a postal address');
  await page.getByLabel('Mailing method', { exact: true }).selectOption('envelope');
  const card = page.getByRole('region', { name: 'Postcard preview', exact: true });
  const envelope = page.getByRole('region', { name: 'Envelope preview', exact: true });
  const fields = page.getByRole('group', { name: 'Envelope address', exact: true });
  await fields.getByRole('textbox', { name: /^Recipient name/ }).fill('Envelope only recipient');
  await fields.getByRole('textbox', { name: /^Street name/ }).fill('Csak boríték utca 9.');
  for (const orientation of ['landscape', 'portrait']) {
    await page.getByLabel('Card orientation', { exact: true }).selectOption(orientation);
    for (const side of ['front', 'back']) {
      await card.getByLabel('Side', { exact: true }).selectOption(side);
      await expect(card.getByText('Envelope only recipient', { exact: true })).toHaveCount(0);
      await expect(card.getByText('Csak boríték utca 9.', { exact: true })).toHaveCount(0);
      await expect(card.getByText('Direct recipient', { exact: true })).toHaveCount(0);
    }
    await expect(
      card.getByText('A personal message, without a postal address', { exact: true }),
    ).toBeVisible();
    await expect(envelope.getByText('Envelope only recipient', { exact: true })).toBeVisible();
    await expect(envelope.getByText('Csak boríték utca 9.', { exact: true })).toBeVisible();
  }
  await card.screenshot({ path: `test-results/enveloped-flat-${testInfo.project.name}.png` });
  await page.getByLabel('Mailing method', { exact: true }).selectOption('direct');
  await expect(page.getByRole('textbox', { name: /^Recipient name/ })).toHaveValue(
    'Direct recipient',
  );
  await expect(card.getByText('Direct recipient', { exact: true })).toBeVisible();
  await expect(envelope).toHaveCount(0);
  await page.getByLabel('Mailing method', { exact: true }).selectOption('envelope');
  await page.getByLabel('Card format', { exact: true }).selectOption('folded');
  await expect(page.getByLabel('Mailing method', { exact: true })).toHaveValue('envelope');
  await expect(
    page.getByRole('option', { name: 'Direct mail — address on postcard', exact: true }),
  ).toBeDisabled();
  await expect(fields.getByRole('textbox', { name: /^Recipient name/ })).toHaveValue(
    'Envelope only recipient',
  );
  await page.getByLabel('Card format', { exact: true }).selectOption('flat');
  await expect(page.getByLabel('Mailing method', { exact: true })).toHaveValue('envelope');
  expect(
    (
      await new AxeBuilder({ page })
        .include('.g-document-preview')
        .include('.g-address-fields')
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('mailing faces reserve postage above a lower-right address and divide only direct postcards', async ({
  page,
}, testInfo) => {
  await page.goto('/?page=components&component=postcard-studio');
  const card = page.getByRole('region', { name: 'Postcard preview', exact: true });
  await card.getByLabel('Side', { exact: true }).selectOption('back');
  async function checkFace(face: ReturnType<typeof page.locator>, divider: boolean) {
    const pageBox = (await face.boundingBox())!;
    const stamp = (await face.locator('.g-mail-postage').boundingBox())!;
    const recipient = (await face.locator('.g-mail-recipient').boundingBox())!;
    expect(stamp.x).toBeGreaterThan(pageBox.x + pageBox.width / 2);
    expect(stamp.y + stamp.height).toBeLessThan(recipient.y);
    expect(recipient.x).toBeGreaterThan(pageBox.x + pageBox.width / 2);
    expect(recipient.y + recipient.height / 2).toBeGreaterThan(pageBox.y + pageBox.height / 2);
    expect(recipient.y + recipient.height).toBeLessThan(
      pageBox.y + pageBox.height - pageBox.height * 0.1,
    );
    expect(
      await face
        .locator('.g-mail-recipient')
        .evaluate((element) => element.scrollHeight <= element.clientHeight + 1),
    ).toBe(true);
    await expect(face.locator('.g-mail-divider')).toHaveCount(divider ? 1 : 0);
    if (divider) {
      const message = (await face.locator('.g-mail-message').boundingBox())!;
      const line = (await face.locator('.g-mail-divider').boundingBox())!;
      expect(message.x + message.width).toBeLessThan(line.x);
      expect(line.x).toBeLessThan(recipient.x);
    }
  }
  for (const orientation of ['landscape', 'portrait']) {
    await page.getByLabel('Card orientation', { exact: true }).selectOption(orientation);
    await checkFace(card.locator('.g-mail-face'), true);
    await card.screenshot({
      path: `test-results/realistic-postcard-${orientation}-${testInfo.project.name}.png`,
    });
  }
  await page.getByLabel('Mailing method', { exact: true }).selectOption('envelope');
  const envelope = page.getByRole('region', { name: 'Envelope preview', exact: true });
  await checkFace(envelope.locator('.g-mail-face'), false);
  await expect(card.locator('.g-mail-postage')).toHaveCount(0);
  await expect(card.locator('.g-mail-recipient')).toHaveCount(0);
  await envelope.screenshot({
    path: `test-results/realistic-envelope-${testInfo.project.name}.png`,
  });
  expect(
    (await new AxeBuilder({ page }).include('.g-document-preview').analyze()).violations,
  ).toEqual([]);
  await envelope.locator('.g-mail-face').evaluate((element) => element.setAttribute('dir', 'rtl'));
  await checkFace(envelope.locator('.g-mail-face'), false);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('sender details appear upper-left only on the mailed exterior and survive format changes', async ({
  page,
}, testInfo) => {
  await page.goto('/?page=components&component=postcard-studio');
  const fields = page.getByRole('group', { name: 'Sender / return address', exact: true });
  const destination = page.getByRole('group', { name: 'Recipient address', exact: true });
  await fields.getByRole('textbox', { name: /^Sender name/ }).fill('Sender Example');
  await fields.getByRole('textbox', { name: /^Street name/ }).fill('Feladó utca 8.');
  await fields.getByRole('textbox', { name: /^Settlement/ }).fill('Pécs');
  await fields.getByRole('textbox', { name: /^Postal code/ }).fill('123');
  await page.getByRole('button', { name: 'Check address fields', exact: true }).click();
  await expect(fields.getByRole('textbox', { name: /^Postal code/ })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await fields.getByRole('textbox', { name: /^Postal code/ }).fill('7621');
  await expect(destination.getByRole('textbox', { name: /^Recipient name/ })).toHaveValue(
    'Kovács Anna',
  );
  const card = page.getByRole('region', { name: 'Postcard preview', exact: true });
  await card.getByLabel('Side', { exact: true }).selectOption('back');
  async function checkSender(preview: ReturnType<typeof page.locator>, name: string) {
    const block = preview.getByRole('region', { name, exact: true });
    await expect(block.getByText('Sender Example', { exact: true })).toBeVisible();
    const sender = (await block.boundingBox())!;
    const face = (await preview.locator('.g-mail-face').boundingBox())!;
    const postage = (await preview.locator('.g-mail-postage').boundingBox())!;
    expect(sender.x).toBeLessThan(face.x + face.width / 2);
    expect(sender.y).toBeLessThan(face.y + face.height / 2);
    expect(sender.x + sender.width).toBeLessThan(postage.x);
    expect(
      await block.evaluate((element) => element.scrollHeight <= element.clientHeight + 1),
    ).toBe(true);
    return sender;
  }
  for (const orientation of ['landscape', 'portrait']) {
    await page.getByLabel('Card orientation', { exact: true }).selectOption(orientation);
    const sender = await checkSender(card, 'Postcard sender');
    const message = (await card
      .getByRole('region', { name: 'Postcard message', exact: true })
      .boundingBox())!;
    expect(sender.y + sender.height).toBeLessThan(message.y);
  }
  await card.screenshot({
    path: `test-results/postcard-return-address-${testInfo.project.name}.png`,
  });
  await page.getByLabel('Mailing method', { exact: true }).selectOption('envelope');
  const envelope = page.getByRole('region', { name: 'Envelope preview', exact: true });
  await checkSender(envelope, 'Envelope sender');
  await expect(card.getByText('Sender Example', { exact: true })).toHaveCount(0);
  await page.getByLabel('Card format', { exact: true }).selectOption('folded');
  const folded = page.getByRole('region', { name: 'Folded card preview', exact: true });
  for (const side of ['cover', 'inside', 'back']) {
    await folded.getByLabel('Side', { exact: true }).selectOption(side);
    await expect(folded.getByText('Sender Example', { exact: true })).toHaveCount(0);
  }
  await page.getByRole('combobox', { name: 'Posting from', exact: true }).selectOption('GB');
  await expect(fields.getByRole('textbox', { name: /^Post town/ })).toHaveValue('Pécs');
  await expect(fields.getByRole('textbox', { name: /^Postcode/ })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await fields.getByRole('textbox', { name: /^Building and street/ }).fill('14 Example Road');
  await fields.getByRole('textbox', { name: /^Post town/ }).fill('London');
  await fields.getByRole('textbox', { name: /^Postcode/ }).fill('sw1a1aa');
  await checkSender(envelope, 'Envelope sender');
  await expect(
    envelope
      .getByRole('region', { name: 'Envelope sender', exact: true })
      .getByText('SW1A 1AA', { exact: true }),
  ).toBeVisible();
  await expect(
    envelope
      .getByRole('region', { name: 'Envelope sender', exact: true })
      .getByText('EGYESÜLT KIRÁLYSÁG / UNITED KINGDOM', { exact: true }),
  ).toBeVisible();
  await envelope.screenshot({
    path: `test-results/envelope-return-address-${testInfo.project.name}.png`,
  });
  expect(
    (
      await new AxeBuilder({ page })
        .include('.g-document-preview')
        .include('.g-address-fields')
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
