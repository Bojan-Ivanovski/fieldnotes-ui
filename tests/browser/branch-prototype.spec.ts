import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('external controls keep loading/retry/pagination separate from tree selection', async ({
  page,
}) => {
  await page.goto('/branch-prototype.html');
  const section = page.getByRole('region', {
    name: 'External branch controls',
    exact: true,
  });
  const tree = section.getByRole('tree');
  const folder = tree.getByRole('treeitem', { name: 'Plans', exact: true });
  await folder.focus();
  await page.keyboard.press('Tab');
  const action = section.getByRole('button');
  await expect(action).toHaveText('Load Plans');
  await expect(action).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(section.getByRole('status')).toHaveText(
    'Loading failed. Retry is available.',
  );
  await expect(action).toHaveText('Retry Plans');
  await expect(action).toBeFocused();
  await expect(
    section.getByText('Attempts: 1. Selected resource: none.', { exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(tree.getByRole('treeitem', { name: 'Alpha' })).toBeVisible();
  await expect(action).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(tree.getByRole('treeitem', { name: 'Beta' })).toBeVisible();
  await expect(action).toHaveText('All loaded: Plans');
  await expect(action).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(folder).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(tree.getByRole('treeitem', { name: 'Alpha' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(
    section.getByText('Attempts: 3. Selected resource: outside-0.', {
      exact: true,
    }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test('action-row comparison exposes why request controls should not pretend to be resources', async ({
  page,
}) => {
  await page.goto('/branch-prototype.html');
  const section = page.getByRole('region', {
    name: 'Action rows',
    exact: true,
  });
  const tree = section.getByRole('tree');
  await tree.getByRole('treeitem', { name: 'Plans', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  const action = tree.getByRole('treeitem', {
    name: 'Load Plans',
    exact: true,
  });
  await expect(action).toBeFocused();
  await page.keyboard.press('Enter');
  const retry = tree.getByRole('treeitem', {
    name: 'Retry Plans',
    exact: true,
  });
  await expect(retry).toBeVisible();
  await expect(retry).toHaveAttribute('aria-selected', 'true');
  await expect(
    section.getByText('Attempts: 1. Selected resource: none.', { exact: true }),
  ).toBeVisible();
});
