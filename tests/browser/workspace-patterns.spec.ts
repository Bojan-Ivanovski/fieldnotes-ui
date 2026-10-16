import { readFileSync } from 'node:fs';
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
for (const theme of presets) {
  test(`${theme}: workspace and settings compose accessible native controls`, async ({
    page,
  }) => {
    await page.goto('/workspace.html');
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    await page
      .getByRole('button', { name: 'An unfinished idea', exact: true })
      .click();
    const editor = page.getByRole('textbox', {
      name: 'Document content',
      exact: true,
    });
    await editor.fill('A revised document');
    await page
      .getByRole('button', { name: 'Document details', exact: true })
      .click();
    await page.getByRole('tab', { name: 'Notes', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Document notes' })
      .fill('A supporting note');
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.goto('/settings.html');
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    await page.getByRole('textbox', { name: 'Workspace name' }).fill('taken');
    await page
      .getByRole('button', { name: 'Save settings', exact: true })
      .click();
    const error = page.getByRole('link', {
      name: 'This workspace name is already taken.',
    });
    await expect(error).toBeVisible();
    await error.click();
    await expect(
      page.getByRole('textbox', { name: 'Workspace name' }),
    ).toBeFocused();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test('save races, read-only controls, recovery downloads and editor modes retain drafts', async ({
  page,
}) => {
  await page.goto('/workspace.html');
  await page
    .getByRole('button', { name: 'An unfinished idea', exact: true })
    .click();
  const editor = page.getByRole('textbox', {
    name: 'Document content',
    exact: true,
  });
  const save = page.getByRole('button', { name: 'Save document', exact: true });
  const workspace = page.getByRole('region', {
    name: 'An unfinished idea',
    exact: true,
  });
  await editor.fill('First revision');
  await save.click();
  await editor.fill('A newer revision');
  await expect(save).toBeEnabled();
  await expect(
    workspace.locator('.fn-operation-status [role="status"]'),
  ).toHaveText('Unsaved changes');
  await page.getByRole('button', { name: 'Read', exact: true }).click();
  await expect(editor).toBeHidden();
  await page.getByRole('button', { name: 'Write', exact: true }).click();
  await expect(editor).toHaveValue('A newer revision');
  await page
    .getByRole('checkbox', { name: 'Simulate document save failure' })
    .check();
  await save.click();
  await expect(
    workspace.locator('.fn-operation-status [role="status"]'),
  ).toHaveText('Could not save');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download unsaved copy' }).click();
  const downloaded = await download;
  expect(downloaded.suggestedFilename()).toBe('alpha.txt');
  expect(readFileSync((await downloaded.path())!, 'utf8')).toBe(
    'A newer revision',
  );
  await page
    .getByRole('checkbox', { name: 'Simulate document save failure' })
    .uncheck();
  await page.getByRole('button', { name: 'Retry document save' }).click();
  await expect(
    workspace.locator('.fn-operation-status [role="status"]'),
  ).toHaveText('Saved');
  await page.getByRole('button', { name: 'More document actions' }).click();
  await page
    .getByRole('menuitemcheckbox', { name: 'Read only', exact: true })
    .click();
  await expect(editor).toHaveAttribute('readonly', '');
  await expect(save).toBeDisabled();
});

test('settings guards retain values and rejected submissions permit retry', async ({
  page,
}) => {
  await page.goto('/settings.html');
  const name = page.getByRole('textbox', { name: 'Workspace name' });
  await name.fill('My edited workspace');
  await page.getByRole('tab', { name: 'Danger zone' }).click();
  await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
  await expect(name).toHaveValue('My edited workspace');
  await page.getByRole('checkbox', { name: 'Simulate save failure' }).check();
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(
    page.getByRole('tabpanel', { name: 'General' }).locator('p[role="status"]'),
  ).toContainText('Could not save settings.');
  await expect(name).toHaveValue('My edited workspace');
  await page.getByRole('checkbox', { name: 'Simulate save failure' }).uncheck();
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(
    page.getByRole('tabpanel', { name: 'General' }).locator('p[role="status"]'),
  ).toHaveText('Settings saved.');
  await page.getByRole('tab', { name: 'Danger zone' }).click();
  const remove = page.getByRole('button', {
    name: 'Delete workspace',
    exact: true,
  });
  await remove.click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Cancel', exact: true })
    .click();
  await expect(remove).toBeFocused();
});

test('mobile details preserve notes and selection across presentation changes', async ({
  page,
}) => {
  await page.goto('/workspace.html');
  await page
    .getByRole('button', { name: 'An unfinished idea', exact: true })
    .click();
  const trigger = page.getByRole('button', {
    name: 'Document details',
    exact: true,
  });
  await trigger.click();
  await page.getByRole('tab', { name: 'Notes', exact: true }).click();
  const note = page.getByRole('textbox', { name: 'Document notes' });
  await note.fill('Retained supporting notes');
  await note.evaluate((element: HTMLTextAreaElement) =>
    element.setSelectionRange(2, 7),
  );
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(
    page.getByRole('dialog', { name: 'Document details' }),
  ).toBeVisible();
  await expect(note).toBeFocused();
  expect(
    await note.evaluate((element: HTMLTextAreaElement) => [
      element.selectionStart,
      element.selectionEnd,
    ]),
  ).toEqual([2, 7]);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(page).toHaveScreenshot('workspace-details-mobile.png');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('focus mode contains keyboard navigation while preserving the mounted editor', async ({
  page,
}) => {
  await page.goto('/workspace.html');
  await page
    .getByRole('button', { name: 'An unfinished idea', exact: true })
    .click();
  const editor = page.getByRole('textbox', { name: 'Document content' });
  await editor.fill('Content survives focus mode');
  await page.getByRole('button', { name: 'Enter focus mode' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Focused editor' }),
  ).toBeVisible();
  await editor.focus();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: 'Write', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(editor).toHaveValue('Content survives focus mode');
  await expect(
    page.getByRole('button', { name: 'Document details', exact: true }),
  ).toBeVisible();
});

test('Next server-rendered workspace and settings hydrate without runtime errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:4175/library');
  await page
    .getByRole('button', { name: 'An unfinished idea', exact: true })
    .click();
  await page
    .getByRole('textbox', { name: 'Document content' })
    .fill('Hydrated document');
  await page.goto('http://127.0.0.1:4175/settings');
  await page
    .getByRole('textbox', { name: 'Workspace name' })
    .fill('Hydrated settings');
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(
    page.getByRole('tabpanel', { name: 'General' }).locator('p[role="status"]'),
  ).toHaveText('Settings saved.');
  expect(errors).toEqual([]);
});

test('resizing prototype supports bounded keyboard and pointer operation', async ({
  page,
}) => {
  await page.goto(
    'http://127.0.0.1:6006/iframe.html?id=prototypes-resizablepanes--interactive&viewMode=story',
  );
  const divider = page.getByRole('separator', {
    name: 'Editor and preview widths',
  });
  await divider.focus();
  await page.keyboard.press('End');
  await expect(divider).toHaveAttribute('aria-valuenow', '80');
  await page.keyboard.press('Home');
  await expect(divider).toHaveAttribute('aria-valuenow', '20');
  await page.keyboard.press('Enter');
  await expect(divider).toHaveAttribute('aria-valuenow', '50');
  const bounds = (await divider.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(bounds.x + 150, bounds.y + bounds.height / 2, {
    steps: 5,
  });
  await page.mouse.up();
  expect(Number(await divider.getAttribute('aria-valuenow'))).toBeGreaterThan(
    50,
  );
  await page.getByRole('button', { name: 'Reset widths' }).click();
  await expect(divider).toHaveAttribute('aria-valuenow', '50');
});

test('movement prototype supports keyboard cancellation, equivalent dialog and rejection', async ({
  page,
}) => {
  await page.goto(
    'http://127.0.0.1:6006/iframe.html?id=prototypes-resourcemovement--interactive&viewMode=story',
  );
  const handle = page.getByRole('button', {
    name: 'Pick up A first draft',
    exact: true,
  });
  await handle.focus();
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('button', { name: 'Library root', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(handle).toBeFocused();
  await expect(page.getByRole('status')).toHaveText(
    'Move cancelled. No resources changed.',
  );
  await page
    .getByRole('button', { name: 'Move A first draft…', exact: true })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Move resource' });
  await expect(
    dialog.getByRole('button', {
      name: 'Remote folder (not loaded)',
      exact: true,
    }),
  ).toHaveAttribute('aria-disabled', 'true');
  await dialog.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('status')).toHaveText(
    'Moved A first draft to Projects.',
  );
  await expect(handle).toBeFocused();
  await page
    .getByRole('checkbox', { name: 'Simulate server rejection' })
    .check();
  await page
    .getByRole('button', { name: 'Move Project notes…', exact: true })
    .click();
  await dialog.getByRole('button', { name: 'Ideas', exact: true }).click();
  await expect(dialog.getByRole('status')).toHaveText(
    'Move failed. The collection is unchanged. Choose a destination to retry.',
  );
  await dialog
    .getByRole('button', { name: 'Cancel move', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Move Project notes…', exact: true }),
  ).toBeFocused();
});

test('modal settings guard dismissal and return focus after discarding', async ({
  page,
}) => {
  await page.goto(
    'http://127.0.0.1:6006/iframe.html?id=patterns-documentworkspace--modal-settings&viewMode=story',
  );
  const trigger = page.getByRole('button', {
    name: 'Open settings',
    exact: true,
  });
  await trigger.click();
  const input = page.getByRole('textbox', { name: 'Workspace name' });
  await input.fill('Retained modal edits');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
  await expect(input).toHaveValue('Retained modal edits');
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Discard and close', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('controlled navigation preserves focus through rapid responsive remounts', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 850 });
  await page.goto(
    'http://127.0.0.1:6006/iframe.html?id=patterns-applicationshell--coordinated-drawers&viewMode=story',
  );
  await page
    .getByRole('button', { name: 'Open Navigation', exact: true })
    .click();
  const guard = page.getByRole('checkbox', { name: 'Keep navigation open' });
  await guard.check();
  for (let cycle = 0; cycle < 3; cycle++) {
    await page.setViewportSize({ width: 1200, height: 850 });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(guard).toBeFocused();
    await page.setViewportSize({ width: 390, height: 850 });
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect(guard).toBeFocused();
  }
  await page
    .getByRole('button', { name: 'Open document details from navigation' })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Navigation', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('dialog', { name: 'Supporting details', exact: true }),
  ).toHaveCount(0);
  await guard.uncheck();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('dialog', { name: 'Supporting details', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(1);
});
