import type { Preview } from '@storybook/react-vite';
import '../src/styles/index.css';
const preview: Preview = {
  tags: ['autodocs'],
  parameters: { a11y: { test: 'error' }, controls: { expanded: true } },
};
export default preview;
