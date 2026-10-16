import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './typography.js';
const meta = {
  title: 'Primitives/Text',
  component: Text,
  args: { children: 'A thought worth keeping.', as: 'p', tone: 'muted' },
} satisfies Meta<typeof Text>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
