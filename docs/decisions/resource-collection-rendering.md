# Resource collection rendering: retain full rows within a measured envelope

The representative workload was declared in `scripts/collection-workload.json` before measurement: 1,000 loaded/visible records, flat and fully expanded nested shapes. The p95 budgets are initial render 1,000ms, filtering 200ms and keyboard focus 50ms. The separate 10,000-record cases are stress cases, not a relabelled release gate.

`examples/vite-react/src/collections.tsx` generates seed-41 fixtures with stable IDs. Nested folders contain nineteen documents; partial expansion opens five folders. `scripts/measure-collections.mjs` runs each case five times against a production packed Vite consumer, without screenshot/axe work. Initial render ends after the expected rows commit and a frame is available. Filter and keyboard timings include two animation frames, so they include presentation overhead rather than pure handler time. The report retains all samples, median/p95, DOM row counts and observed long tasks.

Build identifiers: library manifest 0.2.0 (unreleased source), Vite 8.3.4 production ESM, React/ReactDOM 19.3.1. Baseline ResourceExplorer source blob: `2bdeea4c8caca6168e54ece74a65229db1eaea9b` (merged 0.3.0 tree); optimized blob: `daabc86de15aa730c5df8ba861e2d274b1d74e3a` (row-reuse implementation). Fixture blob: `f04b3154ca906f463be25e3adf29bbb59d804872`. The original benchmark tarballs were not retained; the source fixtures, build commands and raw samples are retained.

Environment: Chromium 156.0.8078.4, Linux, AMD Ryzen 5 7600X3D, 12 logical CPUs, 32,662,716,416 bytes RAM, Node 26.9.0, viewport 1280×900, no CPU throttling (rate 1). These are machine-specific measurements, not universal guarantees. Reports: [baseline](../../benchmarks/collections/baseline.json), [row reuse](../../benchmarks/collections/row-reuse.json). Reproduce after building/installing the actual tarball consumer, serve it, then run `COLLECTION_URL=http://localhost:4177 node scripts/measure-collections.mjs`. New raw output is written to `artifacts/collection-measurements.json`; no separate trace files were captured.

| Loaded | Shape / expansion | Initial DOM rows | Initial p95 ms | Filter p95 ms | Keyboard p95 ms |
| ------ | ----------------- | ---------------- | -------------- | ------------- | --------------- |
| 1,000  | flat / all        | 1,000            | 86.2           | 40.5          | 38.4            |
| 1,000  | nested / partial  | 145              | 38.3           | 61.8          | 26.2            |
| 1,000  | nested / all      | 1,000            | 80.3           | 54.7          | 41.9            |
| 10,000 | flat / all        | 10,000           | 597.5          | 197.3         | 109.6           |
| 10,000 | nested / partial  | 595              | 84.3           | 276.5         | 35.9            |
| 10,000 | nested / all      | 10,000           | 731.2          | 246.6         | 118.1           |

The baseline rebuilt every row on focus changes. Memoized rows retain explicit selected/focused/expanded/busy state and hierarchy metadata, so filtering and pagination cannot leave stale ARIA positions. At 1,000 visible rows, baseline keyboard p95 was about 56–57ms; row reuse reduced it below 50ms for both representative shapes. All representative budgets now pass. At 10,000 visible rows, keyboard latency remains about 110–118ms. Filtering a partially expanded 10,000-record tree opens matching ancestor paths and can also exceed the representative envelope.

Constrained expansion reduces initial DOM rows (595 for 10,000 loaded nested records here), but does not make a filter revealing thousands of rows cheap. Consumer pagination already exists through branch loading/LoadMoreButton and can bound loaded/visible work; it is not a replacement for remote search when unloaded content must be searched. Row reuse addresses the measured representative regression without windowing or dependencies.

Decision: retain full rows and support the measured 1,000-visible-record envelope for this milestone. Use consumer pagination/constrained expansion and remote filtering for larger collections. Do not claim responsive 10,000-visible-row operation. Virtualization is not adopted because the declared representative workload passes after the simpler rendering change. A larger supported envelope requires new budgets and measurements plus offscreen keyboard, scrolling, position metadata, filtering and branch-state accessibility evidence. Existing package limits remain unchanged.
