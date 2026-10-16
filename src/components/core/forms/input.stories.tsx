import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './controls.js';
const meta = {
  title: 'Core/Input',
  component: Input,
  args: {
    'aria-label': 'Document title',
    placeholder: 'A passing thought',
    disabled: false,
    required: false,
  },
} satisfies Meta<typeof Input>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
