# Component guidelines

Ground each extraction in an actual source pattern. Define responsibilities, layer, semantic HTML, variants, defaults and callback ownership before implementing. Reuse lower-level controls and tokens instead of duplicating their visual rules. Prefer children and a small number of slots to a styling-prop language. Keep native forms, validation, event semantics and refs intact. Do not forward custom props to DOM nodes.

Use PascalCase exported names and kebab-case files. Small related components may share one file. Runtime public APIs need component documentation and Storybook examples; show relevant variants, themes, sizes, loading, errors, disabled state, keyboard interaction, composition and responsive behavior. State-only compound roots do not pretend to accept DOM refs or className. Controlled and uncontrolled ownership must remain stable through a component's lifetime.

All colors use semantic tokens. Component classes use the fn- prefix, typed variants use CVA where helpful, and className merges through cn. Avoid dynamic Tailwind class construction. Compile CSS without consumer scanning and without global resets. Use refs/native attributes on DOM-backed controls. Custom content slots must not introduce invalid nested interactive elements.

Use maintained accessibility primitives for complex interaction. Native form controls remain native. Test observable user behavior, keyboard/focus and callback contracts. Audit all built-in themes with real browser axe checks and screenshots; token contrast math alone is insufficient. Review labels, tab order, reduced motion, mobile overflow, disabled behavior and error announcements. Document assistive-technology testing that has not been performed.

Before committing run lint, typecheck and tests; run additional build/package/browser checks when affected. Each component or coherent family should have an identifiable Conventional Commit. Evaluate every public change for a changeset. Do not publish stubs or move app services into the package merely to increase component count.
