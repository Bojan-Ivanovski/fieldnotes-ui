import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './controls.js';
const meta = {
  title: 'Core/Checkbox',
  component: Checkbox,
  args: {
    'aria-label': 'Show resolved',
    defaultChecked: false,
    disabled: false,
  },
} satisfies Meta<typeof Checkbox>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
