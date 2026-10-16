# Publishing and documentation deployment

No npm package has been published during extraction. `fieldnotes-ui` returned registry 404 on 2026-10-16; this is an availability observation, not ownership verification or reservation. The local `npm whoami` check returned ENEEDAUTH: this machine has no verified npm account identity. GitHub target is Bojan-Ivanovski/fieldnotes-ui. Version 0.1.0 has a GitHub source/tarball release, but no npm publication; it is not a stable 1.0 API.

## Required external setup

- Confirm the final package name and ownership under the authorized npm account. Recheck availability immediately before the first release. If it changes, update package metadata, exports examples, changesets, guard, workflow trust and documentation together.
- Confirm MIT redistribution rights for source changes and dependency licenses. `npm run check:licenses` checks the installed runtime/peer closure; no application fonts/logos are shipped.
- Configure a GitHub `npm-publish` environment with required reviewers and main-only deployment branches. The YAML environment name alone does not create an approval policy.
- Configure npm trusted publishing for owner Bojan-Ivanovski, repository fieldnotes-ui, workflow release.yml and environment npm-publish. npm requires Node ≥22.14 and npm ≥11.5.1; this workflow uses Node 24. See https://docs.npmjs.com/trusted-publishers/.
- For a brand-new package, establish npm-side package ownership using the account's supported bootstrap/trust process. A maintainer may need to create the initial package/trusted-publisher relationship interactively. Do not invent a successful bootstrap or add a long-lived token as a shortcut. The prepared workflow cannot establish ownership by itself.
- After those checks and explicit release authorization, review a PR changing `private: true` to false. The intended public access is already declared in publishConfig; it does not bypass the private publication lock. Keep the publication lock until then.
- Require passing CI, review the actual tarball contents, and verify the intended version/changelog. Verify Node/npm versions in the runner before enabling publishing. Set Actions permission to create PRs for Changesets version preparation if desired.

## Version preparation and publication

Public API changes receive Changesets. Dispatch Prepare version on main to open a version PR; it never publishes. `npm run version:prepare` runs Changesets, synchronizes src/version.ts and formats the changelog. Merge that PR only after review and CI. The current minor Changeset advances the GitHub-released 0.1.0 baseline to a reviewed 0.2.0 candidate. Preparing a version does not create a GitHub release or publish to npm.

Publish approved release is manual-only. It checks the exact requested version against package.json and the changelog, requires main, runs the complete checks/Storybook/consumer/browser gates, and uploads the tested tarball. With publish=false it verifies without publication. With publish=true, it additionally requires the reviewed publication unlock; the protected npm-publish environment controls the separate job with id-token:write. That job downloads the exact tested artifact and runs `npm publish ... --access public --provenance`, then creates a GitHub release/tag. It does not use an npm token and never publishes on an ordinary push. Only that job receives release write/OIDC permissions. Publication and release metadata must be verified from actual command/workflow results; a configured workflow is not evidence of a published release.

Run locally before release:

```sh
npm ci
npm run check
npm run build-storybook
npm run test:consumers
scripts/visual-container.sh
npm pack --dry-run
```

Artifacts include only dist, README, LICENSE, dependency notices and package metadata. Export targets, native ESM, NodeNext/Bundler declarations, actual consumer builds, CSS imports, runtime interaction, shared React and minimal-import tree shaking are verified. Package/CSS/bundle ceilings detect regressions. Review current security advisories with `npm audit` before final approval.

## Storybook / GitHub Pages

`npm run build-storybook` generates storybook-static. Docs workflow builds on main/manual dispatch and deploys through Pages actions. Enable GitHub Pages with GitHub Actions as the source, configure the github-pages environment, then set the repository variable `PAGES_ENABLED=true`. Until configured, the workflow builds an artifact and skips deployment. A live URL is only valid after a successful deployment; no deployment is claimed by these files. The static build and component stories are locally verifiable without Pages credentials. See https://storybook.js.org/docs/sharing/publish-storybook for hosting guidance.

## GitHub releases and milestones

The [v0.1.0 GitHub release](https://github.com/Bojan-Ivanovski/fieldnotes-ui/releases/tag/v0.1.0) records the tested extraction commit and tarball. Its milestone is closed. The 0.2.0 milestone remains open until a release is created. See [roadmap.md](roadmap.md) for acceptance criteria and the milestone lifecycle.

A GitHub-only release does not require npm authentication or removing `private: true`. Use the verified commit, version-specific notes and actual tested tarball. The release-event workflow closes the matching milestone; the npm release workflow performs that closure explicitly for releases made by GITHUB_TOKEN. The npm workflow reuses an existing GitHub release rather than failing after a successful npm publication.
