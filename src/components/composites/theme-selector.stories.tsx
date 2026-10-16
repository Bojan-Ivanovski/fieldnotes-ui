import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeSelector } from './theme-selector.js';
const meta = {
  title: 'Composites/ThemeSelector',
  component: ThemeSelector,
  args: { label: 'Theme', includeSystem: true, disabled: false },
} satisfies Meta<typeof ThemeSelector>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
