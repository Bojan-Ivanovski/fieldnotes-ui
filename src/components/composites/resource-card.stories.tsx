import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResourceCard } from './resource-card.js';
import { Button } from '../core/button/button.js';

const meta = {
  title: 'Composites/ResourceCard',
  component: ResourceCard,
  args: {
    title: <a href="#idea">A home for your thoughts</a>,
    description: 'Capture a thought, then come back when it is ready to grow.',
    metadata: <time dateTime="2026-10-16">Updated October 16</time>,
  },
} satisfies Meta<typeof ResourceCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
function ActionsExample() {
  const [opened, setOpened] = useState(false),
    [favorite, setFavorite] = useState(false);
  return (
    <ResourceCard
      title={
        <button type="button" onClick={() => setOpened(true)}>
          An unfinished idea
        </button>
      }
      description={
        opened
          ? 'Document opened.'
          : 'Open the document or manage its favorite state.'
      }
      actions={
        <Button
          variant="secondary"
          aria-pressed={favorite}
          onClick={() => setFavorite(!favorite)}
        >
          {favorite ? 'Remove favorite' : 'Add favorite'}
        </Button>
      }
    />
  );
}
export const IndependentActions: Story = { render: () => <ActionsExample /> };
export const BusyAndDisabled: Story = {
  args: {
    title: (
      <button type="button" disabled>
        Deleted document
      </button>
    ),
    description: 'Restoring this document…',
    metadata: null,
    actions: <Button loading>Restore</Button>,
  },
};
export const LongTitle: Story = {
  args: {
    title: (
      <a href="#long">
        A very long title with an
        unbrokenresourceidentifierthatmustfitwithoutoverflowingtheviewport
      </a>
    ),
    metadata: null,
  },
};
