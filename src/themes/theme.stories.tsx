import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider, useTheme } from './theme-provider.js';
import { defineTheme } from './presets.js';
const meta = {
  title: 'Foundations/Themes',
  component: ThemeProvider,
  parameters: {
    docs: {
      description: {
        component:
          'Scoped semantic tokens. Choose a preset using the toolbar; nested scopes and custom themes inherit a complete token contract. See docs/theming.md for persistence, system preference and SSR guidance.',
      },
    },
  },
} satisfies Meta<typeof ThemeProvider>;
export default meta;
type Story = StoryObj<typeof meta>;
function Playground() {
  const { theme, themes, setTheme } = useTheme();
  return (
    <>
      <label>
        Theme{' '}
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          {themes.map((x) => (
            <option key={x.name}>{x.name}</option>
          ))}
          <option>system</option>
        </select>
      </label>
      <h2 style={{ fontFamily: 'var(--fn-font-heading)' }}>
        A home for your thoughts.
      </h2>
      <p style={{ color: 'var(--fn-muted-foreground)' }}>
        Quiet surfaces and a consistent visual language.
      </p>
      <div
        style={{
          background: 'var(--fn-card)',
          border: '1px solid var(--fn-border)',
          padding: 24,
        }}
      >
        Surface and foreground
      </div>
    </>
  );
}
export const PlaygroundStory: Story = { args: { children: <Playground /> } };
export const CustomAndNested: Story = {
  args: {
    themes: [
      defineTheme({
        name: 'brand',
        extends: 'ocean',
        tokens: { primary: '#225577' },
      }),
    ],
    defaultTheme: 'brand',
    children: (
      <>
        <Playground />
        <ThemeProvider defaultTheme="warm" style={{ padding: 24 }}>
          <p>A warm isolated preview</p>
        </ThemeProvider>
      </>
    ),
  },
};
