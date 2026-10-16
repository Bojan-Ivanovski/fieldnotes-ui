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

Compose Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription and DialogClose. Root supports `open`/`onOpenChange` or `defaultOpen=false`, modal=true. Trigger/Close use native buttons or `asChild` to compose Button. DOM-backed parts accept refs/native attributes/className; Root is state-only. DialogContent defaults `showClose=true`, `closeLabel="Close dialog"`. Its content, overlay, title and close use `.fn-dialog-*` hooks. No size/visual variants; className can change width. Default width 520px shrinks to viewport and scrolls.

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

Always provide a title and description (or explicitly `aria-describedby={undefined}` for content with no description). Radix supplies modal focus trap, Escape/outside dismissal and focus restoration. Content portals into the nearest theme provider, retaining its variables. Avoid transformed/clipped theme ancestors. Consumer controls async work and can prevent Escape/outside dismissal using content event props. Do not disable all ways out of a dialog indefinitely; announce busy/failure state. Prevent close until an operation completes only when the underlying workflow requires it. Library dialogs know nothing about document APIs or permissions.

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

Generic single-selection navigation tree, built on Headless Tree's maintained collection/focus/expansion/hotkey infrastructure. Required label and items: `{ id, label, children?, disabled?, icon? }`. IDs must be globally unique, nonempty and not `__fn_internal_root__`; empty children marks an expandable empty folder. Selection: selectedId/onSelect(id) or defaultSelectedId=null. Expansion: expandedIds/onExpandedChange(ids) or defaultExpandedIds=[]. Keep controlled props controlled throughout component lifetime. Native div props/ref/className target the tree. Optional renderLabel(item) customizes noninteractive label content; label remains the accessible/typeahead name. No variants/sizes or app schemas.

Keyboard: Tab enters one roving tree item; Up/Down traverse visible rows, Right expands or advances, Left collapses or moves to parent, Home/End jump, Enter/Space select, printable keys match labels (700ms typeahead). Selection does not follow focus. Click selects and toggles folders. Disabled nodes remain focusable so assistive technology can discover them; activation and expansion are blocked. Their children remain hidden. Do not put nested buttons/links in renderLabel; use an adjacent action menu for selection. Icons are decorative. `.fn-tree-item[aria-selected][aria-disabled]`, `.fn-tree-label` and `.fn-tree-icon` are stable token-themed hooks.

`<ResourceExplorer label="Pages" items={items} selectedId={active} onSelect={openById} expandedIds={expanded} onExpandedChange={setExpanded} />`. Consumer adapts routes, permissions, API results, lazy loading and pagination into supplied items. Replace items immutably after loading. This initial tree renders visible loaded rows only; it does not virtualize huge datasets, implement drag-and-drop or expose Headless Tree internals. Keep large datasets paged and measure before adding a separate virtualized API. Empty trees have no tab stop; render EmptyState beside them if helpful.
