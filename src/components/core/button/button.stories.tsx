import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { Button, IconButton } from './button.js';
import { Stack } from '../../primitives/layout.js';
const meta = {
  title: 'Core/Button',
  component: Button,
  args: {
    children: 'Save document',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
export const Variants: StoryObj<typeof meta> = {
  render: () => (
    <Stack direction="horizontal" wrap>
      {(
        ['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const
      ).map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </Stack>
  ),
};
export const States: StoryObj<typeof meta> = {
  render: () => (
    <Stack direction="horizontal">
      <Button loading>Saving</Button>
      <Button disabled>Unavailable</Button>
      <IconButton aria-label="Add document">
        <Plus size={16} />
      </IconButton>
    </Stack>
  ),
};
