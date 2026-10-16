# fieldnotes-ui

An independent React design system extracted from Fieldnotes: forest surfaces, serif headings, accessible controls, and scoped runtime themes. Consumers supply their own application behavior; Fieldnotes is never a dependency.

**Status:** [0.2.0](https://github.com/Bojan-Ivanovski/fieldnotes-ui/releases/tag/v0.2.0) adds core forms, navigation and overlays. See the [release roadmap](docs/roadmap.md). Not published to npm. The package is installable from its verified tarball. npm publication remains locked pending ownership, trust and release approval.

**Unreleased:** The catalog includes the new workspace components. They are not in the v0.2.0 GitHub release; build the current source to try them.

## Try the package

```sh
npm ci
npm run build
npm pack
# In a separate React application:
npm install /path/to/fieldnotes-ui-0.2.0.tgz
```

After an authorized npm release, use `npm install fieldnotes-ui`. React and ReactDOM 19.3.1 are the tested peer baseline; React 18 support is not claimed. Development tooling requires Node 24+.

```tsx
import 'fieldnotes-ui/styles.css';
import {
  ThemeProvider,
  Button,
  Card,
  Heading,
  Text,
  SearchField,
} from 'fieldnotes-ui';

export function App() {
  return (
    <ThemeProvider defaultTheme="fieldnotes-dark">
      <Card>
        <Heading>A home for your thoughts.</Heading>
        <Text as="p" tone="muted">
          Make room for what comes next.
        </Text>
        <SearchField label="Search documents" onValueChange={console.log} />
        <Button onClick={() => console.log('new')}>New document</Button>
      </Card>
    </ThemeProvider>
  );
}
```

Import precompiled CSS once. Consumers need no Tailwind config, scanning or reset. Optional `fieldnotes-ui/tailwind.css` exposes Tailwind v4 token utilities in a consumer stylesheet. Runtime switching never recompiles CSS. Theme presets: fieldnotes-dark, fieldnotes-light, midnight, ocean, forest, warm and high-contrast. Use `defineTheme` for typed partial token overrides and nested ThemeProviders for isolated regions. Persistence is optional; SSR initial preferences are explicit. See [theming](docs/theming.md).

## Public components

| Layer        | Exports                                                                                                                                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitives   | Stack, Text, Heading, VisuallyHidden, Spinner                                                                                                                                                                                                        |
| Core         | Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Field, Label, Fieldset, ErrorSummary, Breadcrumb parts, Separator, Tooltip parts, Popover parts, Toast parts, Card, Badge, Alert, Dialog parts, Tabs parts, DropdownMenu parts |
| Composites   | SearchField, SearchResults, LoadMoreButton, ResourceCard, Navigation parts, ConfirmDialog, EmptyState, ThemeSelector                                                                                                                                 |
| Patterns     | ApplicationShell, Sidebar, ResourceExplorer, DocumentWorkspace, OperationStatus, EditorLayout, DetailsPanel, SettingsLayout, SettingsSection                                                                                                         |
| Themes/hooks | ThemeProvider, useTheme, builtInThemes, defineTheme, typed theme definitions                                                                                                                                                                         |

Use the root entry or stable `/primitives`, `/core`, `/composites`, `/patterns`, `/themes` and `/hooks` entries. Internal files are private. JavaScript is ESM with declarations and tree shaking; React is external. In Next.js, server pages may render the package's client component boundaries. Call hooks/theme factories in client modules. See [component API documentation](docs/components.md), [architecture](docs/architecture.md), and [migration](docs/migration.md).

Editor engines, persistence, authentication, backend access, permissions, routing, imports and document workflows remain consumer responsibilities. [The grounded inventory](docs/component-inventory.md) records what was extracted and what is deliberately deferred.

## Examples and roadmap

Run `npm run storybook` and open http://localhost:6006. Start with Core/Forms,
Core/Navigation additions and Core/Overlays for the 0.2.0 release. The gallery also
includes initial controls, themes, composites and complete application patterns.
The packed Vite example has a separate `milestone.html` page for the new controls;
it exercises forms, menus, transient notifications and nested themed overlays.

[Release roadmap and acceptance criteria](docs/roadmap.md) cover 0.2.0 through 1.0.0.
GitHub milestones close when their release is created, not when implementation merges.

## Development and validation

```sh
npm run storybook           # Interactive component docs and theme toolbar
npm run check               # Formatting, lint, types, architecture, tests, build, package/licenses
npm run build-storybook     # Static Storybook
npm run test:consumers      # Packed tarball in isolated Vite and Next.js apps
npm run test:browser        # Axe, keyboard, themes, SSR and screenshot regressions
scripts/visual-container.sh # Match pinned CI browser/fonts after preparing consumers
```

The consumer tests cover Vite with and without Tailwind, Next.js App Router SSR/client hydration, ESM and Bundler/NodeNext declarations, every export entry, shared React, CSS/theme switching and a minimal Button bundle. Screenshot baselines use the pinned Playwright Noble container; see [contributing](CONTRIBUTING.md). [Accessibility documentation](docs/accessibility.md) describes automated coverage and manual screen-reader verification still needed.

GitHub Actions verifies the package and prepares static docs. Release/version workflows are separate; publication is manual, guarded and intended to use npm OIDC. See [publishing](docs/publishing.md) for external setup and the exact release lock. No live docs URL or npm publication is implied by workflow configuration.

MIT licensed; see [LICENSE](LICENSE) and [dependency notices](THIRD_PARTY_NOTICES.md). [Security policy](SECURITY.md), [code of conduct](CODE_OF_CONDUCT.md), and [contribution guide](CONTRIBUTING.md) apply to this public project.

The unreleased workspace components have individual playgrounds under Storybook Patterns. Packed Vite examples include `/workspace.html`, `/settings.html`, and `/collections.html`; Next examples include `/library` and `/settings`. These are library examples, not a Fieldnotes app migration. Resizing and movement remain under Storybook Prototypes and are not public package APIs. See the [component contracts](docs/components.md) and [collection rendering decision](docs/decisions/resource-collection-rendering.md).
