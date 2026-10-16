import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const presets = [
  'fieldnotes-dark',
  'fieldnotes-light',
  'midnight',
  'ocean',
  'forest',
  'warm',
  'high-contrast',
];
for (const theme of presets)
  test(`${theme}: distributed styles, interaction and accessibility`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    await expect(page.locator('[data-fn-theme]').first()).toHaveAttribute(
      'data-fn-theme',
      theme,
    );
    await expect(
      page.getByRole('button', { name: 'primary', exact: true }),
    ).toHaveCSS('border-radius', '6px');
    await page.getByRole('searchbox').fill('idea');
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(page.getByRole('searchbox')).toBeFocused();
    await expect(page.getByRole('searchbox')).toHaveValue('');
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(axe.violations).toEqual([]);
    if (['fieldnotes-dark', 'fieldnotes-light', 'ocean'].includes(theme))
      await expect(page).toHaveScreenshot(`${theme}.png`, { fullPage: true });
    await page.getByRole('button', { name: 'Edit document' }).click();
    const dialog = page.getByRole('dialog', { name: 'A name for your idea' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS(
      'background-color',
      await page
        .locator('[data-fn-theme]')
        .first()
        .evaluate((node) =>
          getComputedStyle(node).getPropertyValue('--fn-popover').trim(),
        )
        .then((hex) => {
          const value = hex.replace('#', '');
          return `rgb(${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)})`;
        }),
    );
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    if (theme === 'fieldnotes-dark')
      await expect(page).toHaveScreenshot('dialog.png');
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('button', { name: 'Edit document' }),
    ).toBeFocused();
    await page.getByRole('button', { name: 'Actions', exact: true }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press('Escape');
    expect(errors).toEqual([]);
  });
test('keyboard tree, tab and focus states', async ({ page }) => {
  await page.goto('/');
  const plans = page.getByRole('treeitem', { name: 'Ideas', exact: true });
  await plans.focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('treeitem', { name: 'A passing thought' }),
  ).toBeFocused();
  await page.keyboard.press('End');
  await expect(
    page.getByRole('treeitem', { name: 'Restricted' }),
  ).toBeFocused();
  await page.keyboard.press('Home');
  await expect(plans).toBeFocused();
  await expect(plans).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('.fn-resource-explorer')).toHaveScreenshot(
    'tree-focus.png',
  );
  await page.getByRole('tab', { name: 'Write', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: 'Read', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: 'primary', exact: true }).hover();
  await expect(
    page.getByRole('button', { name: 'primary', exact: true }),
  ).toHaveScreenshot('button-hover.png');
});
test('mobile drawer, responsive layout and async error', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page).toHaveScreenshot('mobile.png', { fullPage: true });
  await page.getByRole('button', { name: 'Open Navigation' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Navigation', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Tab');
  expect(
    await page
      .getByRole('dialog')
      .evaluate((node) => node.contains(document.activeElement)),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await expect(page).toHaveScreenshot('mobile-navigation.png');
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Delete document', exact: true })
    .click();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Demonstration error. Try again later.',
  );
  await expect(page).toHaveScreenshot('confirmation-error.png');
});
test('custom themes, reduced motion, CSS isolation and Tailwind consumer', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Theme', { exact: true }).selectOption('brand');
  await expect(
    page.getByRole('button', { name: 'primary', exact: true }),
  ).toHaveCSS('background-color', 'rgb(34, 85, 119)');
  await expect(page.locator('.fn-spinner').first()).toHaveCSS(
    'animation-name',
    'none',
  );
  await page.evaluate(() => {
    const button = document.createElement('button');
    button.id = 'native-control';
    button.textContent = 'Native';
    document.body.append(button);
  });
  expect(
    await page
      .locator('#native-control')
      .evaluate((node) => getComputedStyle(node).borderTopStyle),
  ).toBe('outset');
  await page.goto('http://127.0.0.1:4176');
  await expect(
    page.getByRole('button', { name: 'primary', exact: true }),
  ).toHaveCSS('border-radius', '0px');
  await page.getByLabel('Theme', { exact: true }).selectOption('ocean');
  await expect(
    page.getByRole('button', { name: 'primary', exact: true }),
  ).toHaveCSS('background-color', 'rgb(7, 91, 120)');
});
test('Next.js SSR output hydrates and switches client theme without runtime errors', async ({
  page,
  request,
}) => {
  const response = await request.get('http://127.0.0.1:4175');
  const html = await response.text();
  expect(html).toContain('Fieldnotes server-rendered consumer');
  expect(html).toContain('Server-rendered action');
  expect(html).toContain('data-fn-theme="ocean"');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:4175');
  await page.getByLabel('Theme', { exact: true }).selectOption('forest');
  await expect(page.getByText('Active theme: forest')).toBeVisible();
  expect(errors).toEqual([]);
});
test('Storybook renders documented components and theme toolbar globals', async ({
  page,
}) => {
  await page.goto(
    'http://127.0.0.1:6006/iframe.html?id=core-button--variants&viewMode=story&globals=theme:ocean',
  );
  await expect(
    page.getByRole('button', { name: 'primary', exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-fn-theme]').first()).toHaveAttribute(
    'data-fn-theme',
    'ocean',
  );
});
