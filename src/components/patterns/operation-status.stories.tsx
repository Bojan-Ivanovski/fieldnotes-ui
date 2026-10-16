import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OperationStatus } from './document-workspace.js';
import { Button } from '../core/button/button.js';
const meta = {
  title: 'Patterns/OperationStatus',
  component: OperationStatus,
  args: { state: 'saved' },
} satisfies Meta<typeof OperationStatus>;
export default meta;
export const Saved: StoryObj<typeof meta> = {};
export const Saving: StoryObj<typeof meta> = { args: { state: 'saving' } };
export const Unsaved: StoryObj<typeof meta> = { args: { state: 'unsaved' } };
function Recovery() {
  const [state, setState] = useState<'error' | 'saving' | 'saved'>('error');
  return (
    <OperationStatus
      state={state}
      actions={
        state === 'error' ? (
          <Button
            onClick={async () => {
              setState('saving');
              await new Promise((resolve) => setTimeout(resolve, 600));
              setState('saved');
            }}
          >
            Retry save
          </Button>
        ) : undefined
      }
    />
  );
}
export const ErrorRecovery: StoryObj<typeof meta> = {
  render: () => <Recovery />,
};
