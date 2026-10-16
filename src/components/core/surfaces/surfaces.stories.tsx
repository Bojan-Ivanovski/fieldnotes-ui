import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Badge, Alert } from './surfaces';
import { Heading, Text } from '../../primitives/typography';
import { Stack } from '../../primitives/layout';
const meta = {
  title: 'Core/Card',
  component: Card,
  args: {
    children: (
      <Stack>
        <Heading level={3}>A passing idea</Heading>
        <Text tone="muted">
          A quiet surface for related information and actions.
        </Text>
        <Badge>Document</Badge>
        <Alert tone="success">All changes saved.</Alert>
      </Stack>
    ),
  },
} satisfies Meta<typeof Card>;
export default meta;
export const Composition: StoryObj<typeof meta> = {};
export const States: StoryObj<typeof meta> = {
  render: () => (
    <Stack>
      {(['neutral', 'success', 'warning', 'destructive'] as const).map(
        (tone) => (
          <Badge key={tone} tone={tone}>
            {tone}
          </Badge>
        ),
      )}
      {(['info', 'success', 'warning', 'destructive'] as const).map((tone) => (
        <Alert key={tone} tone={tone}>
          {tone} message
        </Alert>
      ))}
    </Stack>
  ),
};
