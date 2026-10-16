# Architecture

fieldnotes-ui is a standalone ESM npm package, not a Fieldnotes workspace. Its source audit lives in component-inventory.md. The package does not import the application, API contracts, router, query client, database or environment variables.

```text
src/foundations/       semantic preset data, class merging, controlled-state helper
src/themes/            typed definitions, presets, scoped provider and useTheme
src/components/
  primitives/          layout, typography, hidden text and loading feedback
  core/                actions, forms, surfaces, dialogs, tabs and action menus
  composites/          search, confirmation, empty states and theme selection
  patterns/            responsive shell/sidebar and resource explorer
src/{layer}/index.ts   intentional public layer barrels
src/styles/           generated runtime tokens, component styles, optional @theme mapping
examples/             independent Vite and Next.js consumer templates
scripts/              package, architecture, license, release and consumer checks
.storybook/           theme toolbar, Controls, autodocs and a11y
.github/              CI, docs, version preparation and guarded publication
```

Dependency direction is foundations → primitives → core → composites → patterns. Higher layers may directly use any lower layer. Theme infrastructure uses foundations; components may use theme context. scripts/check-architecture.mjs resolves imports and exports with TypeScript, checks layer direction, rejects application imports and detects runtime dependency cycles.

Public entry points: root, primitives, core, composites, patterns, themes, hooks, styles.css, tailwind.css and package.json. Internal source paths are not exported. ESM modules are preserved for tree shaking; React and runtime dependencies are external. TypeScript declarations use explicit .js-relative imports compatible with both Bundler and NodeNext resolution. Every JS module carries a use-client directive: Next.js server pages may render these client boundaries, while hook/theme factory calls belong in client code. No separate React Server Component API is promised. Types may be imported from server code.

Tailwind v4 compiles scoped `.fn-*` component classes using @apply. Preflight is omitted. Runtime themes use ordinary CSS variables; the optional Tailwind @theme source is separate. JavaScript does not auto-import CSS: consumers import styles.css once. Only CSS is marked as a side effect. There are no bundled fonts, logos, heavy editor adapters or implicit global subscriptions; system-theme and responsive-layout listeners are scoped to mounted providers/shells and cleaned up.

## Dependency decisions

React/ReactDOM 19.3.1 are the tested peers. Lucide retains the POC icon language. CVA defines Button variants; clsx and tailwind-merge combine className overrides. Radix handles dialog/tab/menu accessibility; action menus default nonmodal to preserve background accessibility. Headless Tree supplies tree collection, focus, expansion and hotkeys; the public API hides its implementation types. Disabled tree nodes remain discoverable but cannot activate/expand. No drag-and-drop or heavyweight editor dependency is included.

Registry versions were checked on 2026-10-16. TypeScript 7 was current, but typescript-eslint 8.71.2 requires TypeScript <6.1, so the compatible stable 6.0.3 is used. Storybook 10.6.2 explicitly supports Vite 8. Tailwind 4.3.3 uses its Vite integration; the CLI was rejected after its watcher dependency audit reported high-severity advisories. Locked dependencies currently pass npm audit. Actual runtime/peer license closure is checked against THIRD_PARTY_NOTICES.md.

## Performance

Package verification caps distributed CSS at 25KB and unpacked artifact at 300KB, including maps/declarations. The Vite consumer writes chunk/module reports; verification follows the minimal Button entry's static chunk graph and rejects overlay/tree/theme/editor code. Its 300KB raw JS budget includes React/ReactDOM and class utilities. These are regression ceilings, not claims of per-component incremental cost. Only visible loaded tree rows render; large dataset virtualization is deferred until measured. No blanket memoization is applied.
