# Resource explorer branch actions

## Decision

Keep tree rows as resources. Put branch loading/retry/pagination controls in a separate named region after the tree, with native buttons and branch-specific names. Associate a folder row with its branch status using aria-describedby. Arrow keys remain resource navigation; Tab reaches the request controls. Consumer callbacks own requests and branch state. User expansion of an unloaded folder can notify the consumer, without introducing a fetching service in the package.

This decision precedes the new public branch-state API. The comparison prototype uses only the pre-existing ResourceExplorer API and application-owned state. Its deliberately synthetic action-row alternative is not a supported production recipe.

## Compared interactions

`examples/vite-react/branch-prototype.html` renders two independent approaches using the maintained Headless Tree primitive already in the package:

- **External controls:** Plans is a real folder. Tab reaches Load Plans; the first request fails, Retry Plans succeeds, and Load more Plans appends a second child. The same button stays focused through pending, failure, retry, append and completion. Shift+Tab returns to the tree and ArrowRight reaches Alpha. Resource selection callbacks contain only actual resource IDs.
- **Action rows:** A synthetic child acts as Load Plans. ArrowRight and Enter reach and activate it through existing tree behavior, but the action receives aria-selected=true while the application's selected resource remains absent. Its changing request label and fake ID also become part of resource navigation and position counts. Avoiding these problems would require a second item model and a different activation/selection contract. That extra public contract is unnecessary for the demonstrated workflow.

Nested ordinary buttons inside treeitems were not adopted: they would add a second focus model inside the existing roving-focus resource collection. The external-control approach uses existing native controls without adding fake resources or replacing the tree's keyboard model.

## Implementation consequences

Represent unloaded/loading/failed/ready folders separately from files and loaded empty folders. Keep stable resource IDs and existing selection/expansion ownership. Filter loaded resources only, preserving ancestor paths and stored expansion; automatic filter expansion does not request remote data. Explicit user requests can still load more data supplied by the consumer.

Each visible expanded asynchronous branch gets an associated status and a named request button when a request handler is supplied. Keep the button mounted at completion with aria-disabled so its removal does not discard focus. Prevent repeated activation while pending. Disabled folders expose no request actions. Loading does not hide existing children. Error/retry preserves previously loaded siblings. Collapse removes that branch's controls; focus recovery must account for data/filter changes without stealing focus from another control.

## Evidence and limits

`tests/browser/branch-prototype.spec.ts` passed both comparison tests in the pinned Playwright 1.64.1 Noble container. Coverage includes keyboard loading/retry/pagination, duplicate pending activation, native action focus retention, return to resource navigation, resource selection isolation, the synthetic-row selection mismatch and an automated axe check. The packed Vite example compiled against the tested tarball. This is interaction evidence for the chosen model, not manual screen-reader validation or a claim of full accessibility compliance.

Reproduce after building the package and preparing the packed consumers:

```sh
npm run test:consumers
bash scripts/visual-container.sh tests/browser/branch-prototype.spec.ts
```

The production implementation must separately verify focus fallback, filtering, branch-state updates, all themes and consumer contracts before issue #25 is complete. The prototype alone does not close that issue.

## Production follow-through

The implementation adds explicit branch metadata/request notifications and external controls, ancestor-preserving filtering and DOM focus fallback. `tests/browser/resource-explorer.spec.ts` covers seven themes with axe, initial and append failure/retry, focus retention, disabled/empty folders, data removal/repopulation, filtering without focus theft, mobile overflow and forced-colors focus. The complete 73-test pinned browser suite passed with existing visual baselines unchanged; the new mobile branch screenshot was inspected. Component tests also verify hidden stored expansion does not begin fetching merely because filtering reveals an ancestor.

A further browser regression check showed the primitive's delayed focus poll could reclaim focus after the user had already focused search. A small internal feature override now focuses an existing target immediately, or queues a handoff that is cancelled when focus leaves the explorer. The maintained primitive still owns collection, roving state, expansion and hotkeys. `leaving immediately after tree keyboard navigation cancels deferred focus work` exercises this boundary with real keyboard navigation followed by focusing search.
