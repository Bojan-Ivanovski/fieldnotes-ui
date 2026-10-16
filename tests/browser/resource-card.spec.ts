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
  test(`${theme}: resource cards preserve native actions and accessible content`, async ({
    page,
  }) => {
    await page.goto('/library.html');
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    const favorite = page.getByRole('button', { name: 'Add favorite' });
    await favorite.focus();
    await page.keyboard.press('Space');
    await expect(
      page.getByRole('button', { name: 'Remove favorite' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/library.html$/);
    const open = page.getByRole('button', { name: 'An unfinished idea' });
    await open.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toHaveText(
      'Opened unfinished idea.',
    );
    await page.getByRole('button', { name: 'Manage idea' }).click();
    await page.getByRole('menuitem', { name: 'Rename' }).click();
    await expect(page.getByRole('status')).toHaveText(
      'Renamed unfinished idea.',
    );
    await expect(
      page.getByRole('button', { name: 'Manage idea' }),
    ).toBeFocused();
    await expect(
      page.getByRole('button', { name: 'Deleted document' }),
    ).toBeDisabled();
    await page.getByRole('button', { name: 'Restore', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText(
      'Restored deleted document.',
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page
      .getByRole('link', { name: 'A home for your thoughts', exact: true })
      .focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#document$/);
  });
}
test('resource cards fit 320px and retain visible focus in forced colors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/library.html');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await page.emulateMedia({ forcedColors: 'active' });
  const link = page.getByRole('link', {
    name: 'A home for your thoughts',
    exact: true,
  });
  await link.focus();
  await expect(link).toHaveCSS('outline-style', 'solid');
  await expect(page).toHaveScreenshot(
    'resource-cards-mobile-forced-colors.png',
    { fullPage: true },
  );
});
test('resource card stories show independent, busy and long-title variants', async ({
  page,
}) => {
  for (const story of [
    'independent-actions',
    'busy-and-disabled',
    'long-title',
  ]) {
    await page.goto(
      `http://127.0.0.1:6006/iframe.html?id=composites-resourcecard--${story}&viewMode=story&globals=theme:ocean`,
    );
    await expect(page.getByRole('article')).toBeVisible();
  }
});
