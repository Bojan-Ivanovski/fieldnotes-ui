# Architecture and extraction plan

1. Audit the application and record grounded candidates (component-inventory.md).
2. Establish a standalone npm repository with no workspace links or imports from Fieldnotes. Build ESM and declarations with Vite and TypeScript. Keep React/ReactDOM peers, externalize runtime dependencies.
3. Define semantic CSS-variable tokens from the POC forest-dark palette, spacing, type, radius, shadows, motion, layering, focus and breakpoints. Compile prefixed component CSS using Tailwind v4 without Preflight; distribute styles.css and an optional Tailwind token entry separately.
4. Implement theme definitions and a scoped provider, system selection, custom partial themes with explicit base inheritance, optional storage adapter, deterministic SSR default and nested isolation. Render overlays inside the scope, preserving variables and native focus behavior.
5. Extract primitives, then core controls, overlays, composites and generic patterns. Each completed component or coherent primitive/control group receives documentation, stories, behavior tests and a conventional commit after lint/typecheck/tests pass.
6. Validate every preset's text/action contrast. Exercise focus, keyboard, dismissal, errors, disabled/loading states, controlled/uncontrolled APIs and refs. Use maintained Radix primitives for dialogs, tabs and menus; native HTML for simple form controls.
7. Provide Storybook controls and a theme toolbar, a theme customization story, and Playwright screenshots across responsive sizes and open overlays. Treat automated axe checks as partial evidence; document manual assistive-technology limitations.
8. Install actual npm tarballs into independent Vite (with and without Tailwind) and Next.js App Router consumers. Verify exports, declarations, SSR/client boundaries, runtime theme switching, CSS, production builds, tree shaking and one React runtime.
9. Prepare least-privilege CI, Pages docs deployment, Changesets version preparation and a separately dispatched protected OIDC publication workflow. Never publish during extraction. Document ownership/name/license/trust/environment prerequisites.
10. Push verified milestone commits and open a PR once GitHub creation/access succeeds. Require CI before merging. Preserve main and never force-push.

## Layer dependency graph

Foundations (tokens, cn) → primitives → core → composites → patterns. Themes may use foundations; every component can use themes. Higher layers may directly use any lower layer. Do not use package barrels internally across layers. Enforce no application imports and no reverse-layer imports with a repository check. Entry points: root, primitives, core, composites, patterns, themes, hooks, styles.css and tailwind.css. Internal files are private.

## API conventions

PascalCase component names; kebab-case files. Native attributes, refs, className and children unless meaningless. Button variants primary/secondary/outline/ghost/destructive; sizes sm/md/lg. Defaults documented alongside examples. Form controls preserve native validation; Field associates generated IDs, descriptions and errors. Controlled state never switches ownership after mount. Generic tree items carry no backend schema or route definition; consumers adapt and lazy-load data.

## Dependency decisions

React 19 is the actual tested peer target. Lucide preserves the source icon language. clsx/tailwind-merge combine consumer overrides; CVA owns typed button variants. Radix supplies dialog, tabs and menu focus/keyboard infrastructure. No CodeMirror, router, query client, API contracts, database or authentication dependencies enter the runtime. Check registry stable tags and compatible peer ranges before choosing tooling; retain exact lockfile resolutions.

## Migration

The original app remains unchanged, including unrelated uncommitted changes. Consumers import precompiled CSS once and wrap regions in ThemeProvider. Start with theme and buttons, then native forms, dialogs, cards/search, and finally adapt navigation data. Preserve event semantics, submit buttons, save/recovery safeguards and authorization. New library controls do not grant capabilities. See migration.md for the mapping and validation gates.
