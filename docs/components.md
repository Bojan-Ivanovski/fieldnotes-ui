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
