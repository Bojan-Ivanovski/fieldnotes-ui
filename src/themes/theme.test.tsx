import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { builtInThemes, defineTheme } from './presets.js';
import { ThemeProvider, useTheme } from './theme-provider.js';

function Switcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <>
      <output aria-label="Selection">{theme}</output>
      <output aria-label="Resolved">{resolvedTheme.name}</output>
      <button onClick={() => setTheme('ocean')}>Ocean</button>
    </>
  );
}
it('switches only its own scope and preserves nested isolation', async () => {
  render(
    <ThemeProvider>
      <Switcher />
      <ThemeProvider defaultTheme="warm">
        <p>Nested</p>
      </ThemeProvider>
    </ThemeProvider>,
  );
  await userEvent.click(screen.getByText('Ocean'));
  expect(screen.getByLabelText('Selection')).toHaveTextContent('ocean');
  expect(screen.getByText('Nested').closest('[data-fn-theme]')).toHaveAttribute(
    'data-fn-theme',
    'warm',
  );
  expect(document.documentElement).not.toHaveAttribute('data-fn-theme');
});
it('inherits partial custom tokens and renders deterministic SSR markup', () => {
  const brand = defineTheme({
    name: 'brand',
    extends: 'ocean',
    tokens: { primary: '#123456' },
  });
  expect(brand.tokens.background).toBe(
    builtInThemes.find((x) => x.name === 'ocean')?.tokens.background,
  );
  const html = renderToString(
    <ThemeProvider themes={[brand]} defaultTheme="brand">
      <span>SSR</span>
    </ThemeProvider>,
  );
  expect(html).toContain('data-fn-theme="brand"');
  expect(html).toContain('--fn-primary:#123456');
});
it('accepts unavailable storage and persists explicit choices when possible', async () => {
  const set = vi.fn(() => {
    throw new Error('denied');
  });
  render(
    <ThemeProvider
      storage={{
        get: () => {
          throw new Error('denied');
        },
        set,
      }}
    >
      <Switcher />
    </ThemeProvider>,
  );
  await userEvent.click(screen.getByText('Ocean'));
  expect(set).toHaveBeenCalledWith('ocean');
  expect(screen.getByLabelText('Resolved')).toHaveTextContent('ocean');
});
it('loads a valid stored choice and ignores a removed theme', () => {
  const { rerender } = render(
    <ThemeProvider storage={{ get: () => 'forest', set: vi.fn() }}>
      <Switcher />
    </ThemeProvider>,
  );
  expect(screen.getByLabelText('Selection')).toHaveTextContent('forest');
  rerender(
    <ThemeProvider storage={{ get: () => 'missing', set: vi.fn() }}>
      <Switcher />
    </ThemeProvider>,
  );
  expect(screen.getByLabelText('Selection')).toHaveTextContent('forest');
});
it('follows system preference changes and removes its listener', () => {
  let change = () => {};
  const query = {
    matches: true,
    addEventListener: vi.fn((_name, listener) => {
      change = listener;
    }),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => query),
  );
  const { unmount } = render(
    <ThemeProvider defaultTheme="system">
      <Switcher />
    </ThemeProvider>,
  );
  expect(screen.getByLabelText('Resolved')).toHaveTextContent(
    'fieldnotes-dark',
  );
  query.matches = false;
  act(() => change());
  expect(screen.getByLabelText('Resolved')).toHaveTextContent(
    'fieldnotes-light',
  );
  unmount();
  expect(query.removeEventListener).toHaveBeenCalled();
  vi.unstubAllGlobals();
});
it('leaves controlled state to the consumer', async () => {
  const onThemeChange = vi.fn();
  render(
    <ThemeProvider theme="warm" onThemeChange={onThemeChange}>
      <Switcher />
    </ThemeProvider>,
  );
  await userEvent.click(screen.getByText('Ocean'));
  expect(onThemeChange).toHaveBeenCalledWith('ocean');
  expect(screen.getByLabelText('Selection')).toHaveTextContent('warm');
});
const luminance = (hex: string) => {
  const values = hex
    .slice(1)
    .match(/../g)!
    .map((x) => parseInt(x, 16) / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
};
for (const preset of builtInThemes)
  it(`${preset.name} meets 4.5:1 for semantic text pairs`, () => {
    const t = preset.tokens;
    const pairs = [
      [t.foreground, t.background],
      [t['card-foreground'], t.card],
      [t['popover-foreground'], t.popover],
      [t['primary-foreground'], t.primary],
      [t['primary-foreground'], t['primary-hover']],
      [t['secondary-foreground'], t.secondary],
      [t['muted-foreground'], t.muted],
      [t['accent-foreground'], t.accent],
      [t['destructive-foreground'], t.destructive],
      [t['success-foreground'], t.success],
      [t['warning-foreground'], t.warning],
    ];
    for (const [foreground, background] of pairs) {
      const [light, dark] = [luminance(foreground), luminance(background)].sort(
        (a, b) => b - a,
      );
      expect(
        (light + 0.05) / (dark + 0.05),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

for (const preset of builtInThemes)
  it(`${preset.name} provides a 3:1 visible focus ring against surfaces`, () => {
    for (const surface of [
      preset.tokens.background,
      preset.tokens.card,
      preset.tokens.popover,
    ]) {
      const [light, dark] = [
        luminance(preset.tokens.ring),
        luminance(surface),
      ].sort((a, b) => b - a);
      expect(
        (light + 0.05) / (dark + 0.05),
        `${preset.tokens.ring} on ${surface}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });
