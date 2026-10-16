import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './controls.js';
const meta = {
  title: 'Core/Select',
  component: Select,
  args: {
    'aria-label': 'Sort documents',
    children: (
      <>
        <option>Recent</option>
        <option>Title</option>
      </>
    ),
  },
} satisfies Meta<typeof Select>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
