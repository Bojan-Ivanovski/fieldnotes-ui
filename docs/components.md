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
