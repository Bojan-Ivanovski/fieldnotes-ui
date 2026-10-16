import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './typography.js';
const meta = {
  title: 'Primitives/Heading',
  component: Heading,
  args: { children: 'A home for your thoughts.', level: 1 },
} satisfies Meta<typeof Heading>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
