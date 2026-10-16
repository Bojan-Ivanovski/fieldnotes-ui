import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchField } from './search-field.js';
const meta = {
  title: 'Composites/SearchField',
  component: SearchField,
  args: {
    label: 'Search documents',
    placeholder: 'Find a document, or a thought inside one…',
    defaultValue: '',
    loading: false,
    disabled: false,
  },
} satisfies Meta<typeof SearchField>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
export const Searching: StoryObj<typeof meta> = {
  args: { loading: true, defaultValue: 'idea' },
};
