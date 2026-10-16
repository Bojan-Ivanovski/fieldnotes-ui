import type { Meta, StoryObj } from '@storybook/react-vite';
import { VisuallyHidden } from './feedback.js';
const meta = {
  title: 'Primitives/VisuallyHidden',
  component: VisuallyHidden,
  args: { children: 'Additional screen-reader context' },
} satisfies Meta<typeof VisuallyHidden>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
