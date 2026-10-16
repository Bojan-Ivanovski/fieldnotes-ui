import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './controls.js';
const meta = {
  title: 'Core/Textarea',
  component: Textarea,
  args: {
    'aria-label': 'Comment',
    placeholder: 'What comes to mind?',
    rows: 4,
    disabled: false,
  },
} satisfies Meta<typeof Textarea>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
