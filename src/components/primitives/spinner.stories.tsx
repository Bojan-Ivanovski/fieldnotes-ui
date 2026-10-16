import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './feedback.js';
const meta = {
  title: 'Primitives/Spinner',
  component: Spinner,
  args: { label: 'Opening document' },
} satisfies Meta<typeof Spinner>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
