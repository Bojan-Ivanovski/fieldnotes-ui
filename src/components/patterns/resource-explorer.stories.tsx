import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResourceExplorer, type ResourceItem } from './resource-explorer.js';
const meta = {
  title: 'Patterns/ResourceExplorer',
  component: ResourceExplorer,
  args: {
    label: 'Workspace resources',
    items: [
      {
        id: 'ideas',
        label: 'Ideas',
        children: [
          { id: 'draft', label: 'A passing thought' },
          { id: 'plan', label: 'Plans for tomorrow' },
        ],
      },
      { id: 'private', label: 'Restricted resource', disabled: true },
      { id: 'guide', label: 'Getting started' },
    ],
    defaultExpandedIds: ['ideas'],
    defaultSelectedId: 'draft',
  },
} satisfies Meta<typeof ResourceExplorer>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
export const Empty: StoryObj<typeof meta> = { args: { items: [] } };

export const Filtered: StoryObj<typeof meta> = { args: { filter: 'tomorrow' } };
export const BranchStates: StoryObj<typeof meta> = {
  args: {
    items: [
      { id: 'waiting', label: 'Not loaded', branch: { state: 'unloaded' } },
      { id: 'pending', label: 'Loading branch', branch: { state: 'loading' } },
      {
        id: 'failed',
        label: 'Failed branch',
        branch: { state: 'error', message: 'Connection interrupted.' },
      },
      { id: 'empty', label: 'Empty folder', branch: { state: 'ready' } },
      {
        id: 'partial',
        label: 'Partial folder',
        children: [{ id: 'child', label: 'Loaded child' }],
        branch: { state: 'ready', hasMore: true },
      },
    ],
    defaultExpandedIds: ['waiting', 'pending', 'failed', 'empty', 'partial'],
  },
};
function AsyncExample() {
  const [items, setItems] = useState<ResourceItem[]>([
    { id: 'remote', label: 'Remote documents', branch: { state: 'unloaded' } },
  ]);
  const [attempts, setAttempts] = useState(0);
  return (
    <ResourceExplorer
      label="Remote resources"
      items={items}
      onRequestChildren={(id) => {
        setAttempts(attempts + 1);
        setItems((previous) =>
          previous.map((item) =>
            item.id === id ? { ...item, branch: { state: 'loading' } } : item,
          ),
        );
        setTimeout(
          () =>
            setItems((previous) =>
              previous.map((item) =>
                item.id !== id
                  ? item
                  : !attempts
                    ? {
                        ...item,
                        branch: {
                          state: 'error',
                          message: 'Could not load documents. Try again.',
                        },
                      }
                    : {
                        ...item,
                        children: [{ id: 'loaded', label: 'Loaded document' }],
                        branch: { state: 'ready' },
                      },
              ),
            ),
          300,
        );
      }}
    />
  );
}
export const AsyncRetry: StoryObj<typeof meta> = {
  render: () => <AsyncExample />,
};
