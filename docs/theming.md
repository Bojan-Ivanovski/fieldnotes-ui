# Theming

Import `fieldnotes-ui/styles.css` once. No Tailwind setup or scanning is required. CSS does not include Preflight, fonts, body styles or a global color-scheme. Default variables on `:root` provide the original forest-dark identity for controls without a provider. All component classes use the `fn-` prefix; only owned controls are reset. The optional `fieldnotes-ui/tailwind.css` is Tailwind v4 source, not runtime CSS: import it after `tailwindcss` in your own stylesheet to use `bg-fn-primary` and related utilities.

```tsx
import 'fieldnotes-ui/styles.css';
import { ThemeProvider, useTheme, defineTheme } from 'fieldnotes-ui';
const brand = defineTheme({
  name: 'brand',
  extends: 'ocean',
  tokens: { primary: '#225577' },
});
<ThemeProvider defaultTheme="fieldnotes-dark" themes={[brand]}>
  <App />
</ThemeProvider>;
```

`defineTheme` accepts a lowercase name, optional built-in base (default `fieldnotes-dark`), optional colorScheme, and partial typed semantic tokens. Missing tokens inherit from the base. Each built-in changes surfaces, foregrounds, borders, inputs, accents and states. Presets: fieldnotes-dark (source identity), fieldnotes-light, midnight, ocean, forest, warm and high-contrast. Custom token contrast is the consumer's responsibility.

`useTheme()` returns `theme` (selection including `system`), `resolvedTheme`, `themes` and `setTheme(name)`. Unknown setter names throw; an unavailable initial name falls back to forest-dark. Controlled `theme` and `onThemeChange` keep selection in the consumer. `defaultTheme` initializes uncontrolled state. `systemFallback` determines deterministic server output for system mode, then matchMedia follows the client preference. No document element, browser storage or application state is modified implicitly.

`storage={{ get: () => localStorage.getItem('theme'), set: value => localStorage.setItem('theme', value) }}` enables optional persistence. Reads happen after hydration and failures are ignored. To avoid a flash, read a cookie/server preference yourself and supply the same `defaultTheme` server and client; localStorage cannot provide a pre-hydration server value. System mode can change after hydration. Do not claim zero flash in those cases.

Nest providers for isolated previews. Dialog/menu portals target the nearest provider element. Keep that element in an unclipped container: ancestor transforms and overflow may constrain overlays. Providers add a div; use className/style and standard div attributes for layout. Override CSS tokens on a component or provider via `style={{ '--fn-primary': '#225577' } as React.CSSProperties}`. Provider style overrides win over preset values. Class-level utility customization uses className; scoped custom CSS can target stable `.fn-*` classes and documented data attributes.

Text/action pairs are tested at 4.5:1 for every built-in. Focus, disabled, hover and portal rendering also require browser tests; these tests do not certify complete WCAG compliance. Font binaries are not distributed; consumers can load Manrope under its own license or use the system fallback.
