import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './button.js';
const meta = {
  title: 'Core/IconButton',
  component: IconButton,
  args: {
    'aria-label': 'Favorite document',
    children: '☆',
    loading: false,
    disabled: false,
  },
} satisfies Meta<typeof IconButton>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
