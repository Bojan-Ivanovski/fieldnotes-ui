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
  test(`${theme}: search states, retry and pagination preserve native result focus`, async ({
    page,
  }) => {
    await page.goto('/search.html');
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    const results = page.getByRole('region', {
      name: 'Search results',
      exact: true,
    });
    const input = page.getByRole('searchbox', {
      name: 'Search documents',
      exact: true,
    });
    const submit = page.getByRole('button', { name: 'Search', exact: true });
    await expect(results.getByRole('status')).toHaveText(
      'Search to find a document.',
    );
    await input.fill('idea');
    await expect(results.getByRole('status')).toHaveText(
      'Search to find a document.',
    );
    await submit.click();
    await expect(results.getByRole('status')).toHaveText(
      '3 documents found; 2 shown.',
    );
    await expect(results.getByRole('link')).toHaveCount(2);
    const pagination = results.locator('button').last();
    await pagination.click();
    await expect(pagination).toHaveAttribute('aria-busy', 'true');
    await expect(pagination).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(results.getByRole('alert')).toHaveText(
      'More documents could not be loaded. Existing results are still available.',
    );
    await expect(results.getByRole('link')).toHaveCount(2);
    await expect(pagination).toBeFocused();
    await expect(pagination).toHaveText('Retry more results');
    await pagination.click();
    await expect(results.getByRole('status')).toHaveText(
      '3 documents found; 3 shown.',
    );
    await expect(results.getByRole('link')).toHaveCount(3);
    await expect(pagination).toHaveText('All results loaded');
    await expect(pagination).toHaveAttribute('aria-disabled', 'true');
    await expect(pagination).toBeFocused();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await input.fill('missing');
    await submit.click();
    await expect(
      results.getByRole('heading', { name: 'No matching documents' }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Clear search', exact: true })
      .click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await expect(results.getByRole('status')).toHaveText(
      'Search to find a document.',
    );
    await input.fill('error');
    await submit.click();
    await expect(results.getByRole('alert')).toContainText(
      'Documents could not be loaded.',
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await results.getByRole('button', { name: 'Try again' }).click();
    await expect(
      results.getByRole('link', { name: 'Recovered document' }),
    ).toBeVisible();
  });
}
test('submitted search discards late responses while retaining explicitly identified stale results', async ({
  page,
}) => {
  await page.goto('/search.html');
  const input = page.getByRole('searchbox', {
    name: 'Search documents',
    exact: true,
  });
  const results = page.getByRole('region', {
    name: 'Search results',
    exact: true,
  });
  const submit = page.getByRole('button', { name: 'Search', exact: true });
  await input.fill('idea');
  await submit.click();
  await expect(results.getByRole('link')).toHaveCount(2);
  await input.fill('slow');
  await submit.click();
  await expect(results.getByRole('status')).toHaveText(
    'Searching for slow… Showing 2 previous results.',
  );
  await expect(results.getByRole('list')).toBeVisible();
  await input.fill('fast');
  await submit.click();
  await expect(
    results.getByRole('link', { name: 'Fast result' }),
  ).toBeVisible();
  // Wait for the deliberately delayed old service response, then prove it was rejected.
  await page.waitForTimeout(900);
  await expect(results.getByRole('link')).toHaveCount(1);
  await expect(
    results.getByRole('link', { name: 'Fast result' }),
  ).toBeVisible();
  await expect(results.getByRole('link', { name: 'Slow result' })).toHaveCount(
    0,
  );
  await input.fill('slow');
  await submit.click();
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await page.waitForTimeout(900);
  await expect(results.getByRole('status')).toHaveText(
    'Search to find a document.',
  );
  await expect(results.getByRole('link')).toHaveCount(0);
  await expect(input).toBeFocused();
});
test('local filtering responds as you type without submitting the remote query', async ({
  page,
}) => {
  await page.goto('/search.html');
  const local = page.getByRole('region', {
    name: 'Local results',
    exact: true,
  });
  await page
    .getByRole('searchbox', { name: 'Filter loaded documents' })
    .fill('quiet');
  await expect(local.getByRole('link')).toHaveCount(1);
  await expect(local.getByRole('link', { name: 'Quiet notes' })).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: 'Search results', exact: true })
      .getByRole('status'),
  ).toHaveText('Search to find a document.');
});
test('search fits mobile viewports and exposes keyboard focus in forced colors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/search.html');
  await page
    .getByRole('searchbox', { name: 'Search documents', exact: true })
    .fill('idea');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const results = page.getByRole('region', {
    name: 'Search results',
    exact: true,
  });
  const more = results.getByRole('button', { name: 'Load more results' });
  await expect(more).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await page.emulateMedia({ forcedColors: 'active' });
  await more.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(more).toBeFocused();
  await expect(more).toHaveCSS('outline-style', 'solid');
});
test('search stories cover the state matrix and interactive retry', async ({
  page,
}) => {
  for (const story of [
    'initial',
    'loading',
    'refreshing',
    'empty',
    'populated',
    'failure-and-retry',
    'pagination',
  ]) {
    await page.goto(
      `http://127.0.0.1:6006/iframe.html?id=composites-searchresults--${story}&viewMode=story&globals=theme:ocean`,
    );
    await expect(page.getByRole('region', { name: 'Documents' })).toBeVisible();
    if (story === 'failure-and-retry') {
      await page.getByRole('button', { name: 'Try again' }).click();
      await expect(
        page.getByRole('link', { name: 'An unfinished idea' }),
      ).toBeVisible();
    }
  }
});
