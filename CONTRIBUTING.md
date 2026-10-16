# Contributing

Use Node 24+ and npm. Clone this repository independently; no Fieldnotes checkout is needed to build or test it. `npm ci` installs the locked dependencies. `npm run storybook` starts interactive development.

Dependabot keeps `@types/node` on the Node 24 baseline and TypeScript below 6.1, matching the current typescript-eslint peer requirement. Compatible updates remain enabled. Revisit the ignore ranges in `.github/dependabot.yml` when changing the minimum supported Node version or upgrading the lint/compiler toolchain together; verify peer compatibility, Node 24 support (unless deliberately changing it), declarations, packed consumers and CI before lifting those limits. These are compatibility constraints, not a permanent decision against newer toolchains.

Before submitting changes run:

```sh
npm run check
npm run build-storybook
npm run test:consumers
npm run test:browser
```

Chromium is required (`npx playwright install --with-deps chromium`). Visual baselines use the pinned Playwright Noble image in CI, not arbitrary host fonts. Use `scripts/visual-container.sh --update-snapshots` to update them in that environment. Review every changed image; never update baselines just to silence a failure. Consumers are installed from an actual tarball into new temporary directories, not linked to library source. The command records their paths in artifacts/consumer-paths.json.

Follow [component guidelines](docs/component-guidelines.md), [architecture](docs/architecture.md), [accessibility](docs/accessibility.md) and [git workflow](docs/git-workflow.md). Start with an inventory-backed need and a small compositional API. Keep lower layers independent of higher layers. Never introduce application services, authentication, routes or data schemas into runtime code. Support refs/native attributes, document defaults, and add behavior tests and stories with relevant states.

Use Conventional Commits. Add `npm run changeset` for public API or behavior changes; explain why no changeset is needed for internal-only work. Keep infrastructure and component changes in coherent commits. Update THIRD_PARTY_NOTICES.md using `node scripts/check-licenses.mjs --write` after dependency changes, and review new licenses. Avoid committing credentials, consumer build outputs or npm artifacts. A bug report should include versions, theme, browser, keyboard/assistive-technology behavior and a minimal reproduction.

Publishing is a separate protected operation described in [publishing.md](docs/publishing.md). A contribution or ordinary merge does not publish a package. Do not add long-lived npm tokens.
