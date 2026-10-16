# Resizable panes: retain an interaction prototype

The prototype is `src/components/patterns/prototypes/resizable-panes.tsx`, exposed in Storybook at Prototypes/ResizablePanes. It explores changing the proportion of a supplied editor and preview without remounting either pane. It is not exported by the package.

The labelled separator exposes vertical orientation and min/max/current values. Left/Right change by 2%, Shift changes by 10%, Home/End reach bounds and Enter resets. Pointer/touch dragging uses pointer capture; cancellation restores the starting width. Bounds default to 20–80%. The consumer owns controlled size and persistence. Below 800px the same panes stack and the divider leaves the tab order. Editor keys are untouched unless the separator is focused.

The pinned-browser integration checks exercise bounds, keyboard reset and pointer movement. The interactive story supplies a controlled textarea and reset action. Manual touch-device and screen-reader checks remain unperformed; this prototype is not a production resizing guarantee. It does not attempt nested splitters, cross-frame dragging or a persisted layout model.

Static CSS grid and write/read/split views remain simpler alternatives when users do not need resizing. A maintained dedicated splitter is an option for a future public contract if those additional requirements justify a dependency. This prototype adds no dependency: React and the existing components retain their current licenses. Prototype source, declarations and CSS are excluded from the distributed package, so it adds no public runtime/style payload. Its isolated Storybook bundle cost was not measured.

Decision: retain the reviewable prototype. A public ResizablePanes API requires a separate reviewed implementation issue covering device/assistive-technology validation, nested-layout behavior and compatibility. No public resizing component is promised for 0.4.0.
