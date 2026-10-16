import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfirmDialog } from './confirm-dialog.js';
const meta = {
  title: 'Composites/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    title: 'Delete document?',
    description: 'This cannot be undone.',
    trigger: <button>Delete document</button>,
    onConfirm: () => {},
    destructive: true,
  },
} satisfies Meta<typeof ConfirmDialog>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
