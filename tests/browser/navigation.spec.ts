import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const theme of [
  'fieldnotes-dark',
  'fieldnotes-light',
  'midnight',
  'ocean',
  'forest',
  'warm',
  'high-contrast',
]) {
  test(`${theme}: grouped navigation has named destinations and native links`, async ({
    page,
  }) => {
    await page.goto('/navigation.html');
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    const nav = page.getByRole('navigation', { name: 'Library' });
    await expect(
      nav.getByRole('button', { name: 'All documents 12' }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      nav.getByRole('button', { name: 'Favorites 0' }),
    ).not.toHaveAttribute('aria-pressed');
    await expect(
      nav.getByRole('button', { name: 'Unavailable workspace' }),
    ).toBeDisabled();
    await expect(
      page.getByRole('complementary', { name: 'Workspace' }),
    ).toHaveCount(1);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    const link = nav.getByRole('link', { name: 'Archive', exact: true });
    await expect(link).toHaveAttribute('href', '#archive');
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#archive$/);
  });
}
test('mobile drawer waits for accepted navigation and keeps rejected edits intact', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/navigation.html');
  const input = page.getByRole('textbox', { name: 'Unsaved text' });
  await input.fill('Keep this draft');
  const trigger = page.getByRole('button', { name: 'Open Navigation' });
  await trigger.click();
  const drawer = page.getByRole('dialog', { name: 'Navigation', exact: true });
  await drawer.getByRole('button', { name: 'Favorites 0' }).click();
  await expect(drawer.getByRole('status')).toHaveText(
    'Checking unsaved changes…',
  );
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('status')).toHaveText(
    'Navigation cancelled. Your edits are still here.',
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(input).toHaveValue('Keep this draft');
  await trigger.click();
  await drawer.getByRole('checkbox', { name: 'Permit navigation' }).check();
  await drawer.getByRole('button', { name: 'Favorites 0' }).click();
  await expect(drawer).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(
    page.getByText('Selected view: Favorites', { exact: true }),
  ).toBeVisible();
  await expect(input).toHaveValue('Keep this draft');
});
test('mobile dismissal and responsive transitions keep one sidebar and reset drawer state', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/navigation.html');
  const trigger = page.getByRole('button', { name: 'Open Navigation' });
  await trigger.click();
  await expect(
    page.getByRole('button', { name: 'New', exact: true }),
  ).toBeFocused();
  await page
    .locator('.fn-dialog-overlay')
    .click({ position: { x: 380, y: 400 } });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('complementary', { name: 'Workspace' }),
  ).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(trigger).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('complementary', { name: 'Workspace' }),
  ).toHaveCount(0);
});
test('grouped navigation fits 320px with visible focus and no overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/navigation.html');
  await page.getByRole('button', { name: 'Open Navigation' }).click();
  const item = page.getByRole('button', { name: 'Favorites 0' });
  await expect(
    page.getByRole('button', { name: 'New', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(item).toBeFocused();
  await expect(page).toHaveScreenshot('grouped-mobile-navigation.png', {
    fullPage: true,
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(item).toHaveCSS('outline-style', 'solid');
});
test('navigation stories render grouped actions and wrapping labels', async ({
  page,
}) => {
  for (const story of ['grouped', 'long-labels']) {
    await page.goto(
      `http://127.0.0.1:6006/iframe.html?id=composites-navigation--${story}&viewMode=story&globals=theme:ocean`,
    );
    await expect(
      page.getByRole('navigation', { name: 'Library' }),
    ).toBeVisible();
  }
});
