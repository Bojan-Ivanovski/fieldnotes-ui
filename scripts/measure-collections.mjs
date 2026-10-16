import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { cpus, totalmem, platform } from 'node:os';
const workload = JSON.parse(
  readFileSync(new URL('./collection-workload.json', import.meta.url)),
);
const browser = await chromium.launch({ headless: true });
const results = [];
const base = process.env.COLLECTION_URL ?? 'http://localhost:4177';
for (const count of [1000, 10000]) {
  for (const shape of ['flat', 'nested']) {
    for (const expansion of shape === 'flat' ? ['all'] : ['partial', 'all']) {
      const samples = [];
      for (let run = 0; run < workload.runs; run++) {
        const page = await browser.newPage({ viewport: workload.viewport });
        await page.addInitScript(() => {
          window.collectionLongTasks = [];
          const params = new window.URLSearchParams(window.location.search);
          const count = Number(params.get('count'));
          const expected =
            params.get('shape') === 'nested' &&
            params.get('expansion') !== 'all'
              ? Math.ceil(count / 20) + 95
              : count;
          let scheduled = false;
          const observer = new window.MutationObserver(() => {
            if (
              scheduled ||
              document.querySelectorAll('[role="treeitem"]').length !== expected
            )
              return;
            scheduled = true;
            window.requestAnimationFrame(() => {
              window.performance.measure(
                'collection-initial-complete',
                'fieldnotes-collection-start',
              );
              observer.disconnect();
            });
          });
          observer.observe(document, { childList: true, subtree: true });
          new window.PerformanceObserver((list) =>
            window.collectionLongTasks.push(
              ...list.getEntries().map((entry) => ({
                start: entry.startTime,
                duration: entry.duration,
              })),
            ),
          ).observe({ type: 'longtask', buffered: true });
          document.addEventListener(
            'input',
            () => window.performance.mark('collection-filter-start'),
            true,
          );
          document.addEventListener(
            'keydown',
            (event) => {
              if (event.key === 'ArrowDown')
                window.performance.mark('collection-key-start');
            },
            true,
          );
        });
        await page.goto(
          `${base}/collections.html?count=${count}&shape=${shape}&expansion=${expansion}`,
        );
        await page.getByRole('tree').waitFor();
        await page.waitForFunction(
          () =>
            window.performance.getEntriesByName('collection-initial-complete')
              .length > 0,
        );
        const rows = await page.getByRole('treeitem').count();
        const initial = await page.evaluate(
          () =>
            window.performance.getEntriesByName(
              'collection-initial-complete',
            )[0].duration,
        );
        await page.getByRole('treeitem').first().focus();
        await page.keyboard.press('ArrowDown');
        const keyboard = await page.evaluate(async () => {
          await new Promise((resolve) =>
            window.requestAnimationFrame(() =>
              window.requestAnimationFrame(resolve),
            ),
          );
          return (
            window.performance.now() -
            window.performance.getEntriesByName('collection-key-start').at(-1)
              .startTime
          );
        });
        const focused = await page.evaluate(
          () => document.activeElement?.getAttribute('role') === 'treeitem',
        );
        await page
          .getByRole('searchbox', { name: 'Filter collection' })
          .fill('Research');
        const filter = await page.evaluate(async () => {
          await new Promise((resolve) =>
            window.requestAnimationFrame(() =>
              window.requestAnimationFrame(resolve),
            ),
          );
          return (
            window.performance.now() -
            window.performance
              .getEntriesByName('collection-filter-start')
              .at(-1).startTime
          );
        });
        const filteredRows = await page.getByRole('treeitem').count();
        const longTasks = await page.evaluate(() => window.collectionLongTasks);
        samples.push({
          initial,
          keyboard,
          filter,
          rows,
          filteredRows,
          focused,
          longTasks,
        });
        await page.close();
      }
      const stats = Object.fromEntries(
        ['initial', 'filter', 'keyboard'].map((key) => {
          const values = samples
            .map((sample) => sample[key])
            .sort((a, b) => a - b);
          return [
            key,
            {
              median: values[Math.floor(values.length / 2)],
              p95: values[Math.ceil(values.length * 0.95) - 1],
            },
          ];
        }),
      );
      const result = { count, shape, expansion, stats, samples };
      results.push(result);
      console.log(JSON.stringify({ count, shape, expansion, stats }));
      mkdirSync('artifacts', { recursive: true });
      writeFileSync(
        'artifacts/collection-measurements.json',
        JSON.stringify(
          {
            workload,
            environment: {
              browser: browser.version(),
              platform: platform(),
              cpu: cpus()[0].model,
              logicalCpus: cpus().length,
              memoryBytes: totalmem(),
              node: process.version,
            },
            results,
          },
          null,
          2,
        ),
      );
    }
  }
}
await browser.close();
