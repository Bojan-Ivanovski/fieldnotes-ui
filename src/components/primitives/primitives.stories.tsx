import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Stack,
  Heading,
  Text,
  Spinner,
  VisuallyHidden,
} from '../../primitives';
const meta = {
  title: 'Primitives/Stack',
  component: Stack,
  args: {
    direction: 'vertical',
    gap: 'md',
    children: (
      <>
        <Heading>A little space to think clearly.</Heading>
        <Text tone="muted">Keep your words in plain text.</Text>
        <Spinner label="Opening workspace" />
        <VisuallyHidden>Screen reader context</VisuallyHidden>
      </>
    ),
  },
  argTypes: {
    direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    gap: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Stack>;
export default meta;
export const Composition: StoryObj<typeof meta> = {};
