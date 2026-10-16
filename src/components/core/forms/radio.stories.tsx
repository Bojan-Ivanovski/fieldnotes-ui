import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from './controls.js';
const meta = {
  title: 'Core/Radio',
  component: Radio,
  args: {
    'aria-label': 'Private',
    name: 'visibility',
    defaultChecked: true,
    disabled: false,
  },
} satisfies Meta<typeof Radio>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
