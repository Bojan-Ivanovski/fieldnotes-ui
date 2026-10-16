import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './surfaces.js';
const meta = {
  title: 'Core/Badge',
  component: Badge,
  args: { children: 'Saved', tone: 'success' },
} satisfies Meta<typeof Badge>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
