import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResourceExplorer } from './resource-explorer';
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
