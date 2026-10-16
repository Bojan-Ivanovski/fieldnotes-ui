import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const themes = [
  'fieldnotes-dark',
  'fieldnotes-light',
  'midnight',
  'ocean',
  'forest',
  'warm',
  'high-contrast',
];
for (const theme of themes)
  test(`${theme}: new controls and open overlays are accessible`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/milestone.html');
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    await expect(
      page.getByRole('switch', { name: 'Organization policy' }),
    ).toBeDisabled();
    await expect(
      page.getByRole('checkbox', { name: 'Select all sections' }),
    ).toBeChecked({ indeterminate: true });
    await page
      .getByRole('button', { name: 'Save preferences', exact: true })
      .click();
    await page.getByRole('link', { name: 'Enter a document title.' }).click();
    await expect(page.getByLabel('Document title')).toBeFocused();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.getByLabel('Document title').fill('Idea');
    await page.getByRole('switch', { name: 'Autosave' }).uncheck();
    await page
      .getByRole('button', { name: 'Save preferences', exact: true })
      .click();
    await expect(page.getByRole('status')).toHaveText(
      'Saved Idea; autosave off.',
    );
    await page.getByRole('button', { name: 'Reset preferences' }).click();
    await expect(page.getByRole('switch', { name: 'Autosave' })).toBeChecked();
    await expect(page.getByLabel('Document title')).toHaveValue('');
    const trigger = page.getByRole('button', {
      name: 'Document details',
      exact: true,
    });
    await trigger.click();
    await expect(page.getByLabel('Popover title')).toBeFocused();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await page.getByRole('button', { name: 'View options' }).click();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Archive document' }).click();
    await expect(
      page.getByText('Document archived', { exact: true }),
    ).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Document restored.');
    expect(errors).toEqual([]);
  });

test('tooltip hover/focus and popover outside dismissal preserve nested themes', async ({
  page,
}) => {
  await page.goto('/milestone.html');
  const trigger = page.getByRole('button', { name: 'Save shortcut' });
  await trigger.hover();
  await expect(page.getByRole('tooltip')).toHaveText(
    'Use Control + S to save your document.',
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await page.mouse.move(0, 0);
  await trigger.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Nested ocean details' }).click();
  const content = page.getByRole('dialog', { name: 'Nested ocean details' });
  await expect(
    content.locator('xpath=ancestor::*[@data-fn-theme][1]'),
  ).toHaveAttribute('data-fn-theme', 'ocean');
  await page.getByRole('heading', { level: 1 }).click();
  await expect(content).toHaveCount(0);
});

test('dropdown choices and keyboard submenus retain checked and disabled states', async ({
  page,
}) => {
  await page.goto('/milestone.html');
  const trigger = page.getByRole('button', { name: 'View options' });
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemcheckbox')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemcheckbox')).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.getByRole('menuitemcheckbox')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('menuitemradio', { name: 'Recent first' }),
  ).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('menuitemradio', { name: 'Title order' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('menuitemradio', { name: 'Title order' }),
  ).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('menuitemcheckbox')).toBeFocused();
  await page.keyboard.press('End');
  await expect(
    page.getByRole('menuitem', { name: 'Export format' }),
  ).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('menuitem', { name: 'Markdown', exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole('menuitem', { name: 'PDF', exact: true }),
  ).toBeDisabled();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('Exported Markdown.');
  await expect(trigger).toBeFocused();
});

test('toast timers pause on hover, queue, dismiss, and support keyboard viewport access', async ({
  page,
}) => {
  await page.goto('/milestone.html');
  await page.getByRole('button', { name: 'Brief notification' }).click();
  const toast = page.locator('.fn-toast');
  await toast.hover();
  await page.waitForTimeout(1500);
  await expect(toast).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(toast).toHaveCount(0, { timeout: 4000 });
  await page.getByRole('button', { name: 'Archive document' }).click();
  await page.getByRole('button', { name: 'Archive document' }).click();
  await expect(page.locator('.fn-toast')).toHaveCount(2);
  await page.keyboard.press('F8');
  await expect(page.locator('.fn-toast-viewport')).toBeFocused();
  await page
    .getByRole('button', { name: 'Dismiss notification' })
    .first()
    .click();
  await expect(page.locator('.fn-toast')).toHaveCount(1);
  const box = await page.locator('.fn-toast').boundingBox();
  if (!box) throw new Error('Missing toast bounds');
  await page.mouse.move(box.x + 30, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width + 100, box.y + box.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(page.locator('.fn-toast')).toHaveCount(0);
});

test('new components fit mobile viewports and have visible focus in forced colors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/milestone.html');
  await page
    .getByRole('button', { name: 'Document details', exact: true })
    .click();
  const bounds = await page.getByRole('dialog').boundingBox();
  expect(bounds?.x).toBeGreaterThanOrEqual(0);
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(390);
  await expect(page).toHaveScreenshot('core-overlays-mobile.png', {
    fullPage: true,
  });
  await page.keyboard.press('Escape');
  await page.emulateMedia({ forcedColors: 'active' });
  const control = page.getByRole('switch', { name: 'Autosave' });
  await control.focus();
  await expect(control).toHaveCSS('outline-style', 'solid');
  await expect(control).toHaveCSS('appearance', 'none');
});

test('new controls hydrate and open themed overlays in the Next.js consumer', async ({
  page,
  request,
}) => {
  const response = await request.get('http://127.0.0.1:4175');
  expect(await response.text()).toContain('Editor preferences');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:4175');
  await page.getByRole('switch', { name: 'Autosave' }).uncheck();
  await expect(page.getByRole('switch')).not.toBeChecked();
  await page.getByRole('button', { name: 'Edit details' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Document details' }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Title' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: 'Edit details' }),
  ).toBeFocused();
  expect(errors).toEqual([]);
});

for (const [id, role, name] of [
  ['core-forms--grouped', 'group', 'Preferences'],
  ['core-forms--validation', 'textbox', 'Document title'],
  ['core-navigation-additions--rich-menu', 'button', 'View preferences'],
  ['core-overlays--notifications-with-undo', 'button', 'Archive document'],
] as const)
  test(`Storybook candidate: ${id}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(
      `http://127.0.0.1:6006/iframe.html?id=${id}&viewMode=story&globals=theme:ocean`,
    );
    await expect(page.getByRole(role, { name, exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
