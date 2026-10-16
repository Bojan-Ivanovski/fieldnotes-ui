import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './surfaces.js';
const meta = {
  title: 'Core/Alert',
  component: Alert,
  args: { children: 'Your draft is safe.', tone: 'info', role: 'status' },
} satisfies Meta<typeof Alert>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
