# Changelog

## 0.4.0

### Minor Changes

- 7e80a13: Add DocumentWorkspace, OperationStatus, EditorLayout, DetailsPanel, SettingsLayout, and SettingsSection. Include responsive editor panes, focus mode, coordinated mobile drawers, native settings compositions, and faster resource-tree focus updates.

  Route Escape to only the top nested dialog and keep settings dismissal guards synchronized with dirty/pending state.

  Keep interaction prototypes outside public exports. Source maps retain mappings without embedded TypeScript source content; source files remain available in the repository.

## 0.3.0

### Minor Changes

- 137f883: Add semantic grouped navigation with native links/actions and controlled mobile navigation state in ApplicationShell.
- 76ab901: Add SearchResults with a persistent polite status and native result composition, plus focus-preserving LoadMoreButton pending behavior.

  Preserve explicit native aria-busy on Button when its disabling loading state is not active.

- e34376c: Add ResourceCard composition with native article/title semantics, descriptions, metadata and independent actions.
- 38fe00a: Add loaded-data filtering with ancestor paths and temporary expansion, explicit asynchronous branch states and external request controls, and DOM focus recovery across resource updates. Empty explorers expose a named focusable region until tree rows are available.

## 0.2.0

### Minor Changes

- ffd5f69: Complete core form and overlay building blocks: grouped fields, linked validation summaries,
  native switches and mixed checkboxes, breadcrumbs and separators, rich dropdown choices
  and submenus, scoped tooltips/popovers, and actionable toast notifications. Add interactive
  examples and packed-consumer browser coverage. Prepare the 0.2.0 candidate from the
  GitHub-released 0.1.0 baseline; npm publication remains locked.

## 0.1.0 — unpublished extraction checkpoint

- Extracted the Fieldnotes forest design language into semantic runtime tokens.
- Added seven built-in themes, custom theme inheritance, system preference and nested scopes.
- Added primitives, native form controls, buttons, surfaces, accessible dialogs, tabs and menus.
- Added search, confirmation, empty-state and theme-selection composites.
- Added a responsive application shell, sidebar and data-driven resource explorer.
- Added Storybook, accessibility/visual tests and packed Vite/Next.js consumers.
- Prepared guarded OIDC publishing and Changesets version preparation. No npm publication occurred.

Subsequent release entries are maintained through Changesets.
