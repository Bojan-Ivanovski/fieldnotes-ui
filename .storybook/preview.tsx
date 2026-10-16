import type { Preview } from '@storybook/react-vite';
import { ThemeProvider, builtInThemes } from '../src/themes';
import '../src/styles/index.css';
const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        icon: 'paintbrush',
        items: builtInThemes.map((x) => x.name),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'fieldnotes-dark' },
  decorators: [
    (Story, context) => (
      <ThemeProvider
        theme={context.globals.theme}
        style={{ padding: 24, minHeight: '100%' }}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: { a11y: { test: 'error' }, controls: { expanded: true } },
};
export default preview;
