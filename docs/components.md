# Component reference

All DOM-backed components accept className, native attributes and React 19 refs. Import from `fieldnotes-ui` or the corresponding layer entry (`fieldnotes-ui/primitives`, `/core`, `/composites`, `/patterns`). Import the distributed CSS once. Preset tokens apply to all variants; local className and CSS variables customize the supported surface. Storybook provides interactive examples and inferred prop tables. Use native HTML where these components add no value.

## Primitives

| Component      | Purpose and props/defaults                                                             | Usage and accessibility                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack          | Repeated flex layout. direction=vertical, gap=md (sm/md/lg), wrap=false; div props/ref | `<Stack direction="horizontal" wrap><Button>Save</Button></Stack>`; layout adds no semantics.                                                                   |
| Text           | Body or muted text. as=span (span/p), tone=default (default/muted); span props/ref     | `<Text as="p" tone="muted">Description</Text>`; no live announcements.                                                                                          |
| Heading        | Fieldnotes serif headings. level=2 (1–6); heading props/ref                            | `<Heading level={1}>Documents</Heading>`; choose level for document hierarchy, not size.                                                                        |
| VisuallyHidden | Screen-reader context. span props/ref                                                  | `<VisuallyHidden>Additional context</VisuallyHidden>`; not for focusable content.                                                                               |
| Spinner        | Loading indication. label=Loading; span props/ref, no children                         | `<Spinner label="Opening document" />`; status contains accessible text, motion is removed for reduced-motion preference. Avoid duplicate status announcements. |

## Button and IconButton (core)

Use Button for actions. `variant=primary` supports primary/secondary/outline/ghost/destructive; `size=md` supports sm/md/lg. `loading=false` disables activation and adds an announced Spinner (`loadingLabel=Loading`). `disabled` preserves native behavior. `type=button` prevents accidental form submission; explicitly set `type="submit"` for submit actions. Native button attributes, events, children and ref are supported. State is controlled by the consumer; no implicit async behavior. All variants use semantic theme tokens. Example: `<Button variant="secondary" onClick={cancel}>Cancel</Button>`.

IconButton shares Button props and defaults variant=ghost. A nonempty `aria-label` is required: `<IconButton aria-label="New document"><Plus aria-hidden /></IconButton>`. Decorative icons should be hidden from assistive technology. Do not use these buttons as a replacement for navigation links; native links preserve browser navigation behavior. className customizes the root; `.fn-button-content` is a stable content hook.

## Forms (core)

Input, Textarea, Select, Checkbox and Radio preserve native props, refs, disabled, required, validation and controlled (`value`/`checked` + `onChange`) or uncontrolled (`defaultValue`/`defaultChecked`) behavior. No internal state or synthetic callback contract. Select uses native options and browser keyboard behavior. Checkbox/Radio fix type and require an associated label; group radios with the same name, a fieldset and legend. Textarea defaults to CSS minimum height and vertical resize. Input passes type through (including password/email). No variant or size props are invented for these controls.

Field supplies an associated label, optional description and live error. Required `children` is a render function receiving `id`, `aria-describedby` and `aria-invalid`. `controlId` optionally replaces the generated unique ID; do not reuse it. Spread those props onto one control: `<Field label="Title" error={error}>{props => <Input {...props} required />}</Field>`. Errors mark the control invalid and use role=alert. Preserve extra consumer descriptions by joining their IDs with the generated aria-describedby. Do not put multiple radios inside Field; use fieldset/legend instead. Field accepts div attributes/ref/className, description/error default absent; no variants or sizes. Use Stack for spacing. Colors, focus and error surfaces follow semantic tokens; `.fn-input`, `.fn-field`, `.fn-label`, `.fn-description`, `.fn-field-error` are supported hooks.

## Card, Badge and Alert (core)

Card is a section with native attributes/ref and children, themed surface/border and responsive padding. Supply an accessible name only when it represents a landmark: `<Card aria-labelledby="title"><Heading id="title">Notes</Heading></Card>`. No implicit navigation, selected state or fixed width. Compose actions explicitly and avoid nesting buttons inside interactive cards.

Badge is a span for metadata; tone=neutral supports neutral/success/warning/destructive. It is not interactive and adds no live role. `<Badge tone="success">Saved</Badge>`.

Alert is a div with tone=info (info/success/warning/destructive), role=status by default. Set role=alert for urgent failures; for static prose set role=note. `<Alert role="alert" tone="destructive">Save failed. <Button onClick={retry}>Retry</Button></Alert>`. Children, native attributes/ref and className are supported. Neither Badge nor Alert has controlled state, size variants or auto-dismiss. Theme tokens provide all tone pairs. Hooks: `.fn-card`, `.fn-badge[data-tone]`, `.fn-alert[data-tone]`.

## Dialog (core)

Compose Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription and DialogClose. Root supports `open`/`onOpenChange` or `defaultOpen=false`, modal=true, with controlled/uncontrolled ownership fixed on mount. Trigger/Close use native buttons or `asChild` to compose Button. DOM-backed parts accept refs/native attributes/className; Root is state-only. DialogContent defaults `showClose=true`, `closeLabel="Close dialog"`. Its content, overlay, title and close use `.fn-dialog-*` hooks. No size/visual variants; className can change width. Default width 520px shrinks to viewport and scrolls.

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Rename</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Rename</DialogTitle>
    <DialogDescription>Choose a title.</DialogDescription>
    <Field label="Title">{(props) => <Input {...props} />}</Field>
    <DialogClose asChild>
      <Button>Done</Button>
    </DialogClose>
  </DialogContent>
</Dialog>
```

Always provide a title and description (or explicitly `aria-describedby={undefined}` for content with no description). Radix supplies modal focus trap, dismissal events and focus restoration. Nested dialog Escape requests route only to the top nested root, including the frame before passive layer listeners settle. Content portals into the nearest theme provider, retaining its variables. Avoid transformed/clipped theme ancestors. Consumer controls async work and can prevent Escape/outside dismissal using content event props. Do not disable all ways out of a dialog indefinitely; announce busy/failure state. Prevent close until an operation completes only when the underlying workflow requires it. Library dialogs know nothing about document APIs or permissions.

## Tabs and DropdownMenu (core)

Tabs composes TabsList (give aria-label), TabsTrigger (required unique value) and TabsContent (matching value). Root supports value/onValueChange or defaultValue, orientation=horizontal and activationMode=automatic; native div props/ref/className. Triggers support disabled. Radix handles roving focus, arrows, Home/End, ARIA associations and automatic/manual activation. Use manual activation for expensive panels. Root has no visual size/variant. Example: `<Tabs defaultValue="write"><TabsList aria-label="View"><TabsTrigger value="write">Write</TabsTrigger></TabsList><TabsContent value="write">Editor</TabsContent></Tabs>`. Stable hooks `.fn-tabs-list`, `.fn-tabs-trigger[data-state]`, `.fn-tabs-content` follow theme tokens.

DropdownMenu composes DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem and DropdownMenuSeparator. Root supports open/onOpenChange or defaultOpen=false, modal=false. Nonmodal action menus preserve background accessibility while Radix manages menu focus and dismissal. Trigger accepts asChild for Button. Content accepts side/align, sideOffset=6, native props/ref/className; portals preserve nearest theme scope. Items use onSelect, disabled and destructive=false. Compose text and decorative icons in children. No invented size props. Radix manages keyboard focus, typeahead, arrows, Enter, Escape and dismissal. Use menus for actions, native links for navigation. Hooks `.fn-menu-content`, `.fn-menu-item[data-highlighted][data-disabled][data-destructive]`, `.fn-menu-separator`. No submenus or checkbox menu items are public in this initial extraction.

## SearchField (composites)

An accessible search input composed from Input, IconButton, Spinner and hidden label. Required label names the searchbox. `value`/`onValueChange(string)` or `defaultValue=''` provides controlled/uncontrolled search. `loading=false` shows Searching status; `clearLabel='Clear search'` names the clear action, which returns focus to input. Disabled/readOnly prevent clear. Other native input attributes and ref target the input; className customizes the wrapper. No native onChange prop; use onValueChange. No built-in fetching, filtering, global shortcut, debounce or form submit. `<SearchField label="Search notes" value={query} onValueChange={setQuery} />`. Use a form onSubmit if Enter should submit. Theme hooks: `.fn-search-field`, nested `.fn-input`; input width is flexible. Do not put the wrapper inside a label, because it contains a button.

## EmptyState, ConfirmDialog and ThemeSelector (composites)

EmptyState composes a level-3 Heading, Text and Stack. Required title, optional description/icon/action/children; div attributes/ref/className. Icon is decorative. No state/variant/size props. Static empty content is not a live region. `<EmptyState title="No notes" description="Start an idea." action={<Button>New note</Button>} />`. `.fn-empty-state` customizes themed layout; use appropriate surrounding heading hierarchy.

ConfirmDialog composes Dialog, Button, Alert and Stack. Required title/description/onConfirm; optional trigger element, open/onOpenChange or defaultOpen=false, confirmLabel=Confirm, cancelLabel=Cancel, destructive=false, className for content. No DOM ref on stateful root. onConfirm may return a Promise: busy disables actions/dismissal, success closes, rejection keeps it open with an announced message and retry. Initial focus is Cancel. `<ConfirmDialog trigger={<Button>Delete</Button>} title="Delete?" description="Cannot be undone." destructive onConfirm={remove} />`. Keep operations bounded; consumer owns cancellation, data and authorization. Controlled consumers must update open in onOpenChange. Do not swallow errors inside onConfirm if the dialog should remain open. All visual controls reuse lower layers and inherit the nearest theme.

ThemeSelector composes Field and native Select, requiring ThemeProvider. label=Theme, includeSystem=true; native select attributes/ref/className, excluding value/defaultValue/onChange/children. Selection is owned by provider through useTheme. Custom registered themes appear automatically. `<ThemeSelector disabled={busy} />`. No size/variant. Styling uses `.fn-field`/`.fn-select` and theme tokens. Use provider controlled state for consumer-owned selection.

## ApplicationShell and Sidebar (patterns)

ApplicationShell composes a generic sidebar slot, optional header and children inside main. Props: sidebar required, header optional, navigationLabel=Navigation, mainId optional; native div props/ref/className. CSS starts with the POC 264px sidebar and flexible main. At ≤800px navigation is a modal Dialog with an accessible trigger, focus trap, Escape dismissal and restoration. Only one copy of sidebar content is mounted. Initial SSR layout is desktop, CSS hides it on small screens until hydration; navigation becomes interactive after hydration. Consumer slots must not add another main. No router, identity or resource fetching is assumed. Avoid clipped/transformed theme containers. `.fn-application-shell`, `.fn-app-header`, `.fn-main-content`, `.fn-mobile-navigation` provide layout hooks. Colors inherit tokens.

Sidebar accepts required label, header/footer slots, children, aside attributes/ref/className. Body scrolls, footer stays at the bottom, and height follows the viewport. No selection or route state. Compose native nav/links or ResourceExplorer inside it. Example: `<ApplicationShell sidebar={<Sidebar label="Workspace"><nav aria-label="Pages">...</nav></Sidebar>}>...</ApplicationShell>`. Native links should preserve browser behavior; consumers decide whether navigation closes an enclosing drawer. No size or visual variants are invented.

## ResourceExplorer (patterns)

Generic single-selection navigation tree, built on Headless Tree's maintained collection/focus/expansion/hotkey infrastructure. Required label and items: `{ id, label, children?, branch?, disabled?, icon? }`. IDs must be unique within an explorer, nonempty and not `__fn_internal_root__`; empty children marks an expandable empty folder. Selection: selectedId/onSelect(id) or defaultSelectedId=null. Expansion: expandedIds/onExpandedChange(ids) or defaultExpandedIds=[]. Keep controlled props controlled throughout component lifetime. Native div props/ref/className target the tree. Optional renderLabel(item) customizes noninteractive label content; label remains the accessible/typeahead name. No variants/sizes or app schemas.

Keyboard: Tab enters one roving tree item; Up/Down traverse visible rows, Right expands a folder or enters its first child, Left collapses or moves to parent, Home/End jump, Enter/Space select, printable keys match labels (700ms typeahead). Selection does not follow focus. Click selects and toggles folders. Disabled nodes remain focusable so assistive technology can discover them; activation and expansion are blocked. Their children remain hidden. Do not put nested buttons/links in renderLabel; use an adjacent action menu for selection. Icons are decorative. `.fn-tree-item[aria-selected][aria-disabled]`, `.fn-tree-label` and `.fn-tree-icon` are stable token-themed hooks.

`<ResourceExplorer label="Pages" items={items} selectedId={active} onSelect={openById} expandedIds={expanded} onExpandedChange={setExpanded} />`. Consumer adapts routes, permissions, API results, lazy loading and pagination into supplied items. Replace items immutably after loading. The tree renders visible loaded rows only; it does not virtualize huge datasets, implement drag-and-drop or expose Headless Tree internals. Keep large datasets paged and measure before adding a separate virtualized API. Empty explorers retain a named focusable region; see the filtering and asynchronous branch contracts below.

## Grouped forms and validation (0.2.0 core)

`Label` accepts native label props/ref; use `htmlFor` or wrap a single control. `Fieldset` accepts native fieldset props/ref plus required `legend`, optional `description` and `error`. It joins consumer `aria-describedby` IDs with generated feedback IDs and marks errors invalid. `disabled` disables descendant native controls. Use Field for individual controls and Fieldset for related choices; business validation remains in the consumer.

`Switch` accepts native checkbox props/ref except fixed `type=checkbox` and `role=switch`. Use it for on/off settings, with `checked/onChange` or `defaultChecked`; it submits its name/value only when checked and preserves native required/disabled/reset/Space behavior. Default value follows the native input (`on`). Associate a visible label. `Checkbox` additionally accepts `indeterminate=false`; true sets its native mixed state after hydration. Activation clears the mixed state as with native HTML. Update `indeterminate` when recalculating a selection group; it does not create a third submitted value. Existing checkbox props/ref remain compatible.

`ErrorSummary` takes required `errors: readonly { controlId, message }[]` and optional `title` (default “Please correct the following”). It renders nothing for an empty list. Otherwise it renders a named alert, focusable root, and links that focus and scroll to controls. Use stable, unique control IDs. Native div props/ref/className allow focusing the summary after failed submission or changing its role when inline errors already announce changes. It does not run validation, intercept submission or clear errors.

```tsx
<form onSubmit={validateAndSave}>
  <ErrorSummary errors={errors} />
  <Field controlId="title" label="Title" error={titleError}>
    {(props) => <Input {...props} name="title" required />}
  </Field>
  <Fieldset legend="Editing" description="Preferences for this document">
    <Label>
      <Switch name="autosave" defaultChecked />
      Autosave
    </Label>
  </Fieldset>
  <Button type="submit">Save</Button>
  <Button type="reset">Reset</Button>
</form>
```

## Breadcrumb and Separator (0.2.0 core)

Compose `Breadcrumb` (native nav, default aria-label=Breadcrumb), `BreadcrumbList` (ol), `BreadcrumbItem` (li), `BreadcrumbLink` (a), `BreadcrumbPage` (span with aria-current=page) and optional `BreadcrumbSeparator` (decorative hidden li, default `/`). Each accepts the corresponding native props/ref/className. Supply hrefs and click handling yourself; there is no router dependency or inferred path. For router-specific links, place your link inside BreadcrumbItem and apply your own styling. Do not nest anchors. Keep one current-page marker. Lists wrap long paths; no automatic collapsing or ellipsis behavior is implied.

`<Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">Workspace</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Draft</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>`.

`Separator` renders a div, defaults orientation=horizontal and decorative=false. Use orientation=vertical inside flex layouts; it stretches to its container with a minimum line height. Semantic separators expose role and aria-orientation. decorative=true removes separator semantics. Native div props/ref/className are supported. It is not an interactive resizing handle.

## Rich dropdown menus (0.2.0 core)

In addition to the existing root/trigger/content/item/separator, use `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSub`, `DropdownMenuSubTrigger` and `DropdownMenuSubContent`. These retain Radix props, native refs where applicable and keyboard semantics. Root/submenu open state supports controlled or uncontrolled usage; checkbox/radio values belong to the consumer. Checkbox items accept checked=true/false/indeterminate and onCheckedChange; radio groups use value/onValueChange, and items require a value. Choice items include a decorative indicator. Items close on selection by default; preventDefault in onSelect to retain the menu. disabled items stay inactive and are skipped by keyboard navigation.

SubContent portals into the nearest theme scope, with sideOffset=6, collisionPadding=12 and automatic collision handling. SubTrigger opens with the direction-aware arrow key; Escape/Left returns or closes appropriately. Groups and labels organize menu commands without inventing a selection model. Do not nest interactive elements inside items. Classes `.fn-menu-label`, `.fn-menu-indicator`, `.fn-menu-sub-trigger` complement the existing content/item hooks.

## Tooltip and Popover (0.2.0 core)

These use maintained Radix primitives; state/trigger/anchor/close components retain their upstream contracts. DOM-backed parts accept native refs and className. Content wrappers portal into the nearest ThemeProvider scope with sideOffset=6, collisionPadding=12 and collision avoidance; compose the trigger with `asChild` to avoid nested buttons. Keep overlays outside clipped or transformed ancestors.

`TooltipProvider` supplies shared timings (Radix defaults delayDuration=700ms, skipDelayDuration=300ms). `Tooltip` supports open/onOpenChange or defaultOpen; `TooltipTrigger` wraps a named focusable trigger; `TooltipContent` holds descriptive, noninteractive text. It opens on focus/hover, stays hoverable by default and dismisses with Escape/activation. Tooltip text supplements a trigger's accessible name; it must not be its only label. Side defaults to top.

`Popover` defaults nonmodal and supports open/onOpenChange or defaultOpen, plus modal=true when appropriate. `PopoverTrigger`, optional `PopoverAnchor`, `PopoverContent` and `PopoverClose` compose an interactive dialog. Give Content `aria-label` or `aria-labelledby`. Radix handles initial focus, Escape/outside dismissal and trigger focus restoration. `onOpenAutoFocus`, `onCloseAutoFocus` and dismissal callbacks allow deliberate consumer overrides. Side defaults to bottom. Use Dialog when a full modal task is needed. The content constrains width/height to the viewport and scrolls vertically.

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild><Button>Save</Button></TooltipTrigger>
    <TooltipContent>Save changes to this document.</TooltipContent>
  </Tooltip>
</TooltipProvider>
<Popover>
  <PopoverTrigger asChild><Button>Details</Button></PopoverTrigger>
  <PopoverContent aria-label="Document details">
    <Field label="Title">{(props) => <Input {...props} />}</Field>
    <PopoverClose asChild><Button>Apply</Button></PopoverClose>
  </PopoverContent>
</Popover>
```

## Toast notifications (0.2.0 core)

Place `ToastProvider` and one `ToastViewport` within a ThemeProvider. Compose `Toast`, `ToastTitle`, optional `ToastDescription`, optional `ToastAction` and `ToastClose`; DOM parts preserve Radix/native props and refs. The viewport is rendered within its current theme scope; roots are moved into it by Radix. Mount it once per notification collection, outside clipped/transformed content. Provider defaults duration=5000ms, swipeDirection=right and swipeThreshold=50px. Toast supports open/onOpenChange or defaultOpen, per-toast duration, and type=foreground (Radix default) or background for passive updates. Queue/state ownership remains in your React app; no global singleton or notification store is introduced. The story and packed consumer show concurrent messages and removing closed entries.

`ToastAction` requires meaningful altText describing an alternative way to perform the action. It dismisses the toast after activation; supply onClick for application behavior. `ToastClose` defaults to an X icon with aria-label="Dismiss notification"; customize its accessible label when needed. `ToastViewport` defaults to the Radix notification region label and F8 hotkey; customize label/hotkey for your app/localization. Hover, viewport focus and window blur pause timeout; timers resume afterward. Swipe or close dismisses; styles provide horizontal swipe feedback. Default viewport is fixed bottom-right, constrained to the viewport, and scrolls for multiple messages.

Keep persistent errors/recovery controls in an Alert or form; transient notices must not be the only route to essential actions. There is no guarantee a user will read a timed message. Avoid multiple urgent announcements or putting every background save into foreground toasts. See [Radix Toast](https://www.radix-ui.com/primitives/docs/components/toast) for additional event and timing contracts.

## ResourceCard (composites)

ResourceCard is a native `article` with the shared Card surface. Required `title` is a React node rendered inside Heading (`headingLevel=3`, choose 1–6 for the page hierarchy). Supply plain text or one native `<a href>` / `<button type="button">` as the title. Browser navigation, modifiers, native disabled state, primary action events and refs remain on that element; the card does not intercept clicks or implement selection. Give the article `aria-labelledby` only when you want a named article, using a unique title ID.

Optional `description` accepts inline content in a muted paragraph; `metadata` accepts content in a noninteractive-by-default div; `actions` renders a wrapping horizontal Stack; `children` renders additional content between description and metadata. All slots default absent. Native article attributes, events, `className` and ref reach the article. Use Button/IconButton/menu components for independent sibling actions, and native time elements for dates. Loading, permissions, date formatting, routing and mutations remain consumer-owned. Never wrap the whole card in a link/button or put secondary actions inside its title action. Disabled navigation should be rendered as text, rather than an anchor with a fake disabled attribute.

```tsx
<ResourceCard
  title={<a href="/documents/idea">An unfinished idea</a>}
  description="A quiet place to begin."
  metadata={<time dateTime="2026-10-16">Updated October 16</time>}
  actions={<Button onClick={favorite}>Add favorite</Button>}
/>
```

Hooks: `.fn-resource-card`, `.fn-resource-card-title`, `.fn-resource-card-description`, `.fn-resource-card-metadata`, `.fn-resource-card-actions`. Title links/buttons retain native Tab/Enter/Space behavior, visible focus and text wrapping. See the ResourceCard stories for button, link, busy/disabled and long-title variants, and `/library.html` in the packed Vite example. Manual screen-reader validation remains outstanding as described in `docs/accessibility.md`.

## Navigation (composites)

Navigation renders a native nav with required `label`. NavigationGroup renders a named section, Heading (`title` required, `headingLevel=3`), optional sibling heading `actions`, and an unordered list. Place NavigationLink or NavigationButton directly inside each group; each supplies its list-item wrapper. Native attributes/className/ref target nav, section, anchor and button respectively. Use unique landmark labels when a page contains several navigations. Group IDs are generated and stable through hydration.

NavigationLink requires `href` and keeps ordinary browser link behavior, modifier keys, targets and download attributes. NavigationButton defaults `type=button` and preserves native disabled and event semantics. Both accept decorative `icon`, inline `count` (including zero), and `current=false`; `current=true` sets `aria-current=page` for the current destination/view. Ordinary actions do not become toggles; supply native `aria-pressed` only for a real toggle. Icons are hidden from assistive technology, counts are included after the visible name, and consumer `aria-label` can supply a more specific name. Keep icons/counts noninteractive. No routing, roving-focus model, data fetching or selection state is introduced. Native Tab/Enter/Space behavior applies. Render unavailable destinations as text or a disabled action, not a fake disabled anchor.

```tsx
<Navigation label="Library">
  <NavigationGroup title="Your library" headingLevel={2}>
    <NavigationLink href="/documents" current count={12}>
      All documents
    </NavigationLink>
    <NavigationButton onClick={showFavorites} count={0}>
      Favorites
    </NavigationButton>
  </NavigationGroup>
</Navigation>
```

Hooks: `.fn-navigation`, `.fn-navigation-group`, `.fn-navigation-heading`, `.fn-navigation-list`, `.fn-navigation-item`, `.fn-navigation-label`, `.fn-navigation-count`, `.fn-navigation-icon`. Labels wrap; themes and forced-colors focus use the shared control tokens.

### Controlled mobile navigation in ApplicationShell

ApplicationShell accepts `navigationOpen` / `onNavigationOpenChange`, or `defaultNavigationOpen=false` for uncontrolled state. Ownership is fixed on mount. Trigger, Escape and outside dismissal request state changes; no child link/button click closes the drawer automatically. Close only after a consumer navigation guard accepts:

```tsx
<NavigationButton
  onClick={async () => {
    if (!(await flushDraft())) return;
    await navigateToFavorites();
    setNavigationOpen(false);
  }}
>
  Favorites
</NavigationButton>
```

The mobile breakpoint remains `max-width:800px`. Entering desktop requests `false` once when open and renders only the desktop sidebar; the controlled consumer must apply that request, or its retained `true` value may reopen the drawer when returning to mobile. A controlled request does not mutate consumer state. Closing the mobile dialog restores focus to its trigger through Dialog; desktop transition removes the trigger and follows normal browser focus behavior. SSR and the first hydration render use desktop markup; matchMedia selects the presentation after mount. Exactly one sidebar is mounted, so crossing the breakpoint remounts sidebar content: keep persistent navigation state in the consumer. Mobile dialog content is mounted while open. No global click listener, resize polling or duplicate sidebar landmark is added. See `/navigation.html` for delayed accepted/rejected navigation, retained draft values, themes and keyboard dismissal.

## SearchResults and LoadMoreButton (composites)

SearchResults composes a named native section with required React-node `title`, Heading (`headingLevel=2`), a persistent polite/atomic status paragraph (`announcement=''`), and a result-content div (`loading=false` controls its aria-busy). Native section attributes, ref and className reach the section. Status lives outside the busy div so progress can be announced while results update. Supply localized counts/progress/outcomes; unchanged text is not remounted. Avoid announcing every keystroke for submitted searches. Children remain consumer-rendered native collections, links, cards, EmptyState and Alert/retry controls; there is no combobox, listbox, selection model or implicit fetching. The `.fn-search-results` root reuses Stack spacing.

Keep draft input separate from committed query for submitted search. Keep previous results visible during refresh only with an announcement identifying them as previous results; use loading/empty/error content appropriate to the current request. Clear the input and committed results together when that is the intended product behavior. Consumer code owns debounce, cancellation, generation checks that reject stale responses, paging cursors, errors and retry. `/search.html` demonstrates initial/loading/populated/empty/error/retry, stale results, out-of-order responses and local filtering using SearchField.

LoadMoreButton accepts Button props except loading/loadingLabel, plus `pending=false` and `pendingLabel='Loading more'`; children default to “Load more”. Pending sets aria-busy and aria-disabled, shows a decorative spinner and the pending label, and blocks its onClick handler for pointer/keyboard activation. It stays natively focusable while pending so appended results and failures do not discard focus. Native ref/attributes/className reach the button; explicit disabled still uses native disabled behavior. Consumer aria-disabled also blocks activation, useful for a focusable “All results loaded” state. Keep the same button mounted through pending/retry/completion; if you remove it, provide an explicit focus destination. Announce append results/errors through the surrounding status/Alert. Async ownership remains with the consumer, including preventing duplicate requests from other entry points and discarding obsolete page responses.

```tsx
<SearchResults
  title="Documents"
  announcement={`${items.length} documents found`}
  loading={refreshing}
>
  <ul>
    {items.map((item) => (
      <li key={item.id}>
        <ResourceCard title={<a href={item.href}>{item.title}</a>} />
      </li>
    ))}
  </ul>
  <LoadMoreButton pending={appending} onClick={loadNextPage} />
</SearchResults>
```

See SearchResults stories for every result state and pagination. Automated coverage checks live-region DOM stability and real keyboard/focus behavior; manual screen-reader announcement validation remains a later production gate.

### ResourceExplorer filtering and asynchronous branches

`filter=''` searches loaded labels case-insensitively after trimming. Optional `filterItem(item, query)` replaces label matching for a nonempty query; it receives the original item and trimmed query. Matching items and their ancestor paths remain visible. Matching a folder does not include unrelated descendants. Paths open temporarily; user expansion/collapse during filtering is temporary too and does not change stored expandedIds or emit onExpandedChange. Clearing or changing the query resets temporary expansion. Hidden selection remains consumer-owned and never emits onSelect. Disabled folders remain discoverable when they match, cannot expand/activate/request, and their descendants are excluded from filtering because those descendants cannot be reached through that folder.

Add optional `branch: ResourceBranch` to a ResourceItem to distinguish an asynchronous folder from a file even when children are absent. `branch.state` is unloaded/loading/error/ready; `hasMore=false` by default, `message` overrides progress/error/empty status, and `actionLabel` overrides request/loading button text. Children remain consumer-supplied stable-ID records. Ready with no children is an empty folder; a plain item without children or branch is a file. Loading and errors retain supplied children. Do not drop previously loaded children merely to show pending or append failure.

`onRequestChildren(id, reason)` notifies the consumer to load/retry/more. Accepted stored expansion (including default expansion on mount) requests unloaded folders. Filter-only ancestor opening does not fetch; explicit expansion or a branch action can request data. Set branch.state to loading when starting and supply ready/error plus the updated children when settled. The explorer prevents repeated requests until the branch state acknowledges a transition, and also while loading. The callback must handle async failures, cancellation, stale responses, cursors and concurrency outside this component. It does not return data to the explorer. Keep the same request handler/state contract throughout an operation.

Expanded asynchronous folders have named groups in a separate `${label} branch controls` region (`branchControlsLabel` overrides this name). Folder rows describe their corresponding status. Native LoadMoreButton actions appear when a handler exists, with default Load/Retry/Load more/All loaded labels that identify the folder; loading uses “Loading {label}”. Completion keeps a focusable aria-disabled button mounted. Without a handler the explorer exposes read-only status. Collapse hides the branch controls. Use Arrow keys/Home/End/typeahead for resources and Tab for branch actions; load/retry/more never become synthetic resource selections. Localize status and action labels through branch.message/actionLabel, and keep custom renderLabel content noninteractive.

Focus stays on a visible focused ID when data changes. Otherwise it falls back to the nearest visible previous ancestor, then visible selection, then the first visible row. DOM focus follows that fallback only if focus was already in the resource tree; updates never take it from search, request buttons or another control. A focused empty explorer remains reachable as a named region with tabIndex=0 and an empty status (`emptyMessage` overrides its default). When rows appear it becomes a tree and restores a row target. Empty regions ignore resource navigation keys while preserving keyup cleanup across data transitions. Native props/className/ref still target that same div; the outer layout and separate branch-control region are additional siblings around its content. Native tree role/roving tabindex are managed by the explorer.

See `/explorer.html` for filtering, selected/expanded state ownership, async initial and append failures, disabled/empty folders and consumer deletion/reset. The branch interaction comparison and decision are recorded in `docs/decisions/resource-explorer-branch-actions.md`; `/branch-prototype.html` is a comparison experiment, not a production action-row recipe. The production app migration remains outside this component work.

### DocumentWorkspace and OperationStatus

Import these patterns from `fieldnotes-ui/patterns` or the root entry. `DocumentWorkspace` renders a named section, not another main landmark. Required `title` accepts React content; `headingLevel=1` chooses its heading. Optional `breadcrumbs`, `metadata`, `actions`, `status`, `panel` and children are consumer slots. Header actions wrap. Native section attributes, className and ref reach the section. Choose heading levels for the containing page and keep breadcrumb navigation semantics in the supplied content.

`OperationStatus` requires `state: 'saved' | 'saving' | 'unsaved' | 'error'`. Default visible/live messages are Saved, Saving…, Unsaved changes and Could not save. Children replace the visible text, `announcement` replaces the polite atomic announcement, and `actions` accepts recovery controls. Native div attributes/ref reach its wrapper. Unchanged state/message text stays unchanged in the live region across typing rerenders. Status changes do not move focus. Localize both visible text and announcement when overriding the defaults. Persistence, request deduplication, revision tracking, retry and download execution belong to consumers.

### EditorLayout

Required `editor` and `preview` accept consumer content. `mode`/`defaultMode='split'`/`onModeChange` support write, split and read; `focusMode`/`defaultFocusMode=false`/`onFocusModeChange` control focus mode. Each state fixes controlled/uncontrolled ownership on mount. A controlled consumer can reject a requested change. `actions` and children accept additional content; native div props/ref reach the stable root.

Both panes remain mounted when changing modes or viewport size, preserving uncontrolled editor DOM, text selection and consumer state. Hidden panes use native hidden semantics. Split panes stack below 800px. If an accepted mode change hides the focused pane, focus moves to the active mode button, while explicit consumer focus outside that pane is retained. View controls are ordinary pressed buttons in a named group, not tabs or an incomplete toolbar.

Focus mode expands the same editor instance, makes existing outside content inert, contains Tab navigation and exits through its button or Escape. Nested portalled controls handle their own keys. Consumers should use `onFocusModeChange` to hide/restore their supporting chrome, as the combined workspace does. Labels are customizable through `modeLabel='Editor view'`, `editorLabel='Editor'`, `previewLabel='Preview'`, partial `modeLabels`, `enterFocusLabel='Enter focus mode'`, `exitFocusLabel='Exit focus mode'`, and `focusLabel='Focused editor'`. No editor engine, Markdown renderer, undo system, shortcuts, storage or command implementation is included.

### DetailsPanel

Required `title` names the panel. `open`/`defaultOpen=false`/`onOpenChange` have fixed state ownership. Optional children/footer supply content; `headingLevel=2` and `closeLabel='Close details'` customize its heading and close action. Desktop renders a named aside without taking focus on open. At 800px and below it uses the existing themed modal Dialog, with one content copy, Escape/outside dismissal, focus containment and scrollable content. Native aside attributes/ref reach the aside in both presentations; className decorates the desktop panel or mobile dialog surface.

Presentation changes remount content: hoist durable values and active subview state into the consumer. Focused controls and native text selection transfer by ID, name, label or position; a missing control falls back to an available control. Updates outside the panel do not transfer focus. Closing restores `returnFocusRef`, the recorded invoker, or `fallbackFocusRef` when the preferred target is missing/unfocusable. Supply refs for triggers that may disappear. Consumer open-state rejection keeps the panel open.

Inside ApplicationShell, mobile navigation and details coordinate without a global store. A new details request asks navigation to close; if navigation rejects closing, details waits. Opening navigation suppresses details and requests its closure. Consumers can also coordinate their controlled state explicitly. Desktop panels may coexist with a desktop sidebar. The individual DetailsPanel and coordinated-drawer stories expose these behaviors.

### SettingsLayout and SettingsSection

`SettingsLayout` is a named native section with required `title`, optional `description`, `navigation`, children, and `headingLevel=1`. `SettingsSection` is another named section with required title, optional description/children/actions, `headingLevel=2`, and `destructive=false`. Both retain native section props/ref and merge className. The section actions render in a footer; destructive styling adds a visible boundary without changing action behavior.

Neither component creates a form or owns form state. Wrap each submission boundary in one native form. Use Tabs for local sections and ordinary links for destinations. Compose Fieldset, Field, ErrorSummary and ConfirmDialog for validation, pending state and destructive operations. The settings example keeps entered values on rejected navigation/submission, focuses controls through error-summary links, and demonstrates guarded modal dismissal. No roles, account model, backend or validation dependency is added.

The combined examples are `/workspace.html` and `/settings.html` in Vite, and `/library` and `/settings` in Next. Individual component playgrounds appear under Storybook Patterns. Manual assistive-technology validation remains unperformed and is a later production gate. Resizing and movement remain example-only prototypes, not public APIs.
