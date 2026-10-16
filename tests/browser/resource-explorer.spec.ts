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
  test(`${theme}: filtering preserves paths, selection and expansion with accessible branch feedback`, async ({
    page,
  }) => {
    await page.goto('/explorer.html');
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    const tree = page.getByRole('tree', { name: 'Resources', exact: true });
    const plans = tree.getByRole('treeitem', { name: 'Plans', exact: true });
    await tree.getByRole('treeitem', { name: 'Beta', exact: true }).focus();
    await page.keyboard.press('Enter');
    await plans.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(plans).toHaveAttribute('aria-expanded', 'false');
    const input = page.getByRole('searchbox', {
      name: 'Filter resources',
      exact: true,
    });
    await input.fill('alpha');
    await expect(plans).toHaveAttribute('aria-expanded', 'true');
    await expect(tree.getByRole('treeitem')).toHaveCount(2);
    await expect(input).toBeFocused();
    await expect(
      page.getByText('Selected: Beta', { exact: true }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Clear search', exact: true })
      .click();
    await expect(input).toBeFocused();
    await expect(plans).toHaveAttribute('aria-expanded', 'false');
    await plans.focus();
    await page.keyboard.press('ArrowRight');
    await expect(
      tree.getByRole('treeitem', { name: 'Beta', exact: true }),
    ).toHaveAttribute('aria-selected', 'true');
    const archive = tree.getByRole('treeitem', {
      name: 'Archive',
      exact: true,
    });
    await archive.focus();
    await page.keyboard.press('ArrowRight');
    const retry = page.getByRole('button', {
      name: 'Retry Archive',
      exact: true,
    });
    await expect(retry).toBeVisible();
    await expect(archive).toHaveAccessibleDescription(
      'Archive could not be loaded. Retry is available.',
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await retry.click();
    await expect(
      tree.getByRole('treeitem', { name: 'Remote one', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Load more Archive', exact: true }),
    ).toBeFocused();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    const locked = tree.getByRole('treeitem', { name: 'Locked', exact: true });
    await locked.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowRight');
    await expect(locked).toHaveAttribute('aria-expanded', 'false');
    await expect(
      tree.getByRole('treeitem', { name: 'Beta', exact: true }),
    ).toHaveAttribute('aria-selected', 'true');
  });
}
test('branch controls retain focus through initial retry, append failure, retry and completion', async ({
  page,
}) => {
  await page.goto('/explorer.html');
  const tree = page.getByRole('tree', { name: 'Resources', exact: true });
  await tree.getByRole('treeitem', { name: 'Archive', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  const group = page.getByRole('group', { name: 'Archive', exact: true });
  const action = group.getByRole('button');
  await expect(action).toHaveText('Retry Archive');
  await page.keyboard.press('Tab');
  await expect(action).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(
    tree.getByRole('treeitem', { name: 'Remote one', exact: true }),
  ).toBeVisible();
  await expect(action).toHaveText('Load more Archive');
  await expect(action).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(action).toHaveText('Retry Archive');
  await expect(
    tree.getByRole('treeitem', { name: 'Remote one', exact: true }),
  ).toBeVisible();
  await expect(action).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(
    tree.getByRole('treeitem', { name: 'Remote two', exact: true }),
  ).toBeVisible();
  await expect(action).toHaveText('All loaded: Archive');
  await expect(action).toHaveAttribute('aria-disabled', 'true');
  await expect(action).toBeFocused();
  await expect(
    page.getByText('No resource selected.', { exact: true }),
  ).toBeVisible();
});
test('focus recovers after deletion, empty data and repopulation without stealing it from search', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/explorer.html');
  const tree = page.getByRole('tree', { name: 'Resources', exact: true });
  await tree.getByRole('treeitem', { name: 'Alpha', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Delete');
  const plans = tree.getByRole('treeitem', { name: 'Plans', exact: true });
  await expect(plans).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Delete');
  await expect(
    tree.getByRole('treeitem', { name: 'Archive', exact: true }),
  ).toBeFocused();
  await page
    .getByRole('button', { name: 'Show single resource', exact: true })
    .click();
  await tree.getByRole('treeitem', { name: 'Zeta', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Delete');
  const empty = page.getByRole('region', { name: 'Resources', exact: true });
  await expect(empty).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Home');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Insert');
  await expect(plans).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(
    tree.getByRole('treeitem', { name: 'Alpha', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(
    tree.getByRole('treeitem', { name: 'Beta', exact: true }),
  ).toBeFocused();
  const input = page.getByRole('searchbox', {
    name: 'Filter resources',
    exact: true,
  });
  await input.fill('nothing matches');
  await expect(input).toBeFocused();
  await expect(empty).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});
test('empty folders and long branch labels fit mobile with forced-colors focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/explorer.html');
  const tree = page.getByRole('tree', { name: 'Resources', exact: true });
  const label =
    'A folder with an unbrokenresourceidentifierthatmustfitwithoutoverflowingitscontainer';
  await tree.getByRole('treeitem', { name: label, exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Tab');
  const button = page.getByRole('button', {
    name: `All loaded: ${label}`,
    exact: true,
  });
  await expect(button).toBeFocused();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await expect(page).toHaveScreenshot('resource-branches-mobile.png', {
    fullPage: true,
  });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(button).toHaveCSS('outline-style', 'solid');
});
test('tree stories expose filtered, branch-state and interactive retry variants', async ({
  page,
}) => {
  for (const story of ['filtered', 'branch-states', 'async-retry', 'empty']) {
    await page.goto(
      `http://127.0.0.1:6006/iframe.html?id=patterns-resourceexplorer--${story}&viewMode=story&globals=theme:ocean`,
    );
    if (story === 'empty') {
      await expect(
        page.getByRole('region', { name: 'Workspace resources', exact: true }),
      ).toBeVisible();
    } else {
      await expect(page.getByRole('tree')).toBeVisible();
    }
    if (story === 'async-retry') {
      await page
        .getByRole('treeitem', { name: 'Remote documents', exact: true })
        .focus();
      await page.keyboard.press('ArrowRight');
      await page
        .getByRole('button', { name: 'Retry Remote documents', exact: true })
        .click();
      await expect(
        page.getByRole('treeitem', { name: 'Loaded document', exact: true }),
      ).toBeVisible();
    }
  }
});

test('leaving immediately after tree keyboard navigation cancels deferred focus work', async ({
  page,
}) => {
  await page.goto('/explorer.html');
  await page.getByRole('treeitem', { name: 'Alpha', exact: true }).focus();
  await page.keyboard.press('ArrowLeft');
  const input = page.getByRole('searchbox', {
    name: 'Filter resources',
    exact: true,
  });
  await input.focus();
  await page.waitForTimeout(100);
  await expect(input).toBeFocused();
});
