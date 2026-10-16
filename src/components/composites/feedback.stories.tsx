import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './empty-state';
import { ConfirmDialog } from './confirm-dialog';
import { ThemeSelector } from './theme-selector';
import { Button } from '../core/button/button';
const meta = {
  title: 'Composites/EmptyState',
  component: EmptyState,
  args: {
    title: 'Your next idea belongs here.',
    description: 'Create a document to begin.',
    action: <Button>New document</Button>,
  },
} satisfies Meta<typeof EmptyState>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
export const Confirmation: StoryObj<typeof meta> = {
  render: () => (
    <ConfirmDialog
      title="Let this thought go?"
      description="This action cannot be undone."
      trigger={<Button variant="destructive">Delete document</Button>}
      destructive
      onConfirm={() => {}}
    />
  ),
};
export const FailedConfirmation: StoryObj<typeof meta> = {
  render: () => (
    <ConfirmDialog
      title="Delete document?"
      description="Try the action to see a recoverable error."
      trigger={<Button>Open confirmation</Button>}
      onConfirm={() => {
        throw new Error('The server is unavailable. Please retry.');
      }}
    />
  ),
};
export const ThemeSelection: StoryObj<typeof meta> = {
  render: () => <ThemeSelector />,
};
